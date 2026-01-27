import crypto from 'crypto'
import { BaseIntegration, OAuthConfig, OAuthTokens, IntegrationMessage } from './base'
import type { IntegrationSource, IntercomIntegrationConfig } from '@/lib/supabase/types'

export class IntercomIntegration extends BaseIntegration {
  get type() {
    return 'intercom' as const
  }

  getOAuthConfig(): OAuthConfig {
    return {
      authUrl: 'https://app.intercom.com/oauth',
      tokenUrl: 'https://api.intercom.io/auth/eagle/token',
      clientId: process.env.INTERCOM_CLIENT_ID!,
      clientSecret: process.env.INTERCOM_CLIENT_SECRET!,
      scopes: ['read_conversations', 'read_users'],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/intercom/callback`
    }
  }

  protected parseTokenResponse(data: Record<string, unknown>): OAuthTokens {
    return {
      accessToken: data.access_token as string,
      refreshToken: data.refresh_token as string | undefined,
      expiresAt: data.expires_in
        ? new Date(Date.now() + (data.expires_in as number) * 1000)
        : undefined
    }
  }

  parseConfig(): IntercomIntegrationConfig {
    const config = this.source.config as Record<string, unknown>
    return {
      app_id: (config.app_id as string) || '',
      inbox_ids: config.inbox_ids as string[] | undefined,
      tag_ids: config.tag_ids as string[] | undefined
    }
  }

  /**
   * Validate Intercom webhook signature
   */
  async validateWebhook(headers: Headers, body: string): Promise<boolean> {
    const hubSignature = headers.get('x-hub-signature')
    if (!hubSignature) {
      return false
    }

    const clientSecret = process.env.INTERCOM_CLIENT_SECRET
    if (!clientSecret) {
      console.error('INTERCOM_CLIENT_SECRET not configured')
      return false
    }

    const hmac = crypto.createHmac('sha1', clientSecret)
    hmac.update(body)
    const expectedSignature = `sha1=${hmac.digest('hex')}`

    try {
      return crypto.timingSafeEqual(
        Buffer.from(hubSignature),
        Buffer.from(expectedSignature)
      )
    } catch {
      return false
    }
  }

  /**
   * Parse Intercom webhook event into messages
   */
  parseWebhookEvent(event: Record<string, unknown>): IntegrationMessage[] {
    const topic = event.topic as string
    const data = event.data as Record<string, unknown>

    // Handle conversation events
    if (topic === 'conversation.user.replied' || topic === 'conversation.user.created') {
      return this.parseConversationEvent(data)
    }

    return []
  }

  private parseConversationEvent(data: Record<string, unknown>): IntegrationMessage[] {
    const item = data.item as Record<string, unknown>
    if (!item) return []

    const conversationParts = item.conversation_parts as Record<string, unknown>
    const parts = (conversationParts?.conversation_parts || []) as Array<Record<string, unknown>>

    // Get the latest user message
    const userParts = parts.filter(part => {
      const author = part.author as Record<string, unknown>
      return author?.type === 'user'
    })

    if (userParts.length === 0) {
      // Check initial message
      const source = item.source as Record<string, unknown>
      const sourceAuthor = source?.author as Record<string, unknown> | undefined
      if (sourceAuthor?.type === 'user' && source?.body) {
        return [{
          externalId: item.id as string,
          externalThreadId: item.id as string,
          externalUserId: sourceAuthor.id as string,
          externalUserName: sourceAuthor.name as string || undefined,
          externalUserEmail: sourceAuthor.email as string || undefined,
          content: this.stripHtml(source.body as string),
          contentHtml: source.body as string,
          channelName: 'Intercom',
          messageTimestamp: new Date((item.created_at as number) * 1000),
          metadata: {
            conversation_id: item.id,
            tags: item.tags
          }
        }]
      }
      return []
    }

    // Get the most recent user message
    const latestPart = userParts[userParts.length - 1]
    const author = latestPart.author as Record<string, unknown>
    const body = latestPart.body as string

    if (!body || !this.shouldProcessMessage(body)) {
      return []
    }

    return [{
      externalId: `${item.id}-${latestPart.id}`,
      externalThreadId: item.id as string,
      externalUserId: author.id as string,
      externalUserName: author.name as string || undefined,
      externalUserEmail: author.email as string || undefined,
      content: this.stripHtml(body),
      contentHtml: body,
      channelName: 'Intercom',
      messageTimestamp: new Date((latestPart.created_at as number) * 1000),
      metadata: {
        conversation_id: item.id,
        part_type: latestPart.part_type,
        tags: item.tags
      }
    }]
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  /**
   * Fetch conversations from Intercom API
   */
  async fetchConversations(options?: {
    startingAfter?: string
    perPage?: number
    open?: boolean
  }): Promise<{
    conversations: IntegrationMessage[]
    hasMore: boolean
    nextStartingAfter?: string
  }> {
    const token = await this.getAccessToken()
    if (!token) {
      return { conversations: [], hasMore: false }
    }

    try {
      const params = new URLSearchParams({
        per_page: String(options?.perPage || 50)
      })

      if (options?.startingAfter) {
        params.set('starting_after', options.startingAfter)
      }

      if (options?.open !== undefined) {
        params.set('open', String(options.open))
      }

      const response = await fetch(
        `https://api.intercom.io/conversations?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Intercom-Version': '2.11'
          }
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('Intercom API error:', error)
        return { conversations: [], hasMore: false }
      }

      const data = await response.json()
      const conversations: IntegrationMessage[] = []

      for (const conv of data.conversations || []) {
        const source = conv.source as Record<string, unknown>
        if (!source?.body) continue

        const author = source.author as Record<string, unknown>
        if (author?.type !== 'user') continue

        const body = this.stripHtml(source.body as string)
        if (!this.shouldProcessMessage(body)) continue

        conversations.push({
          externalId: conv.id,
          externalThreadId: conv.id,
          externalUserId: author.id as string,
          externalUserName: author.name as string || undefined,
          externalUserEmail: author.email as string || undefined,
          content: body,
          contentHtml: source.body as string,
          channelName: 'Intercom',
          messageTimestamp: new Date((conv.created_at as number) * 1000),
          metadata: {
            conversation_id: conv.id,
            state: conv.state,
            priority: conv.priority,
            tags: conv.tags?.tags?.map((t: { name: string }) => t.name)
          }
        })
      }

      return {
        conversations,
        hasMore: data.pages?.next !== null,
        nextStartingAfter: data.pages?.next?.starting_after
      }
    } catch (error) {
      console.error('Failed to fetch Intercom conversations:', error)
      return { conversations: [], hasMore: false }
    }
  }

  /**
   * Fetch user details
   */
  async fetchUser(userId: string): Promise<{
    name?: string
    email?: string
    company?: string
  } | null> {
    const token = await this.getAccessToken()
    if (!token) return null

    try {
      const response = await fetch(
        `https://api.intercom.io/contacts/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Intercom-Version': '2.11'
          }
        }
      )

      if (!response.ok) return null

      const data = await response.json()
      return {
        name: data.name,
        email: data.email,
        company: data.companies?.data?.[0]?.name
      }
    } catch (error) {
      console.error('Failed to fetch Intercom user:', error)
      return null
    }
  }
}

/**
 * Create Intercom integration data from OAuth response
 */
export function createIntercomIntegrationData(
  oauthResponse: Record<string, unknown>
): {
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: Date
  config: IntercomIntegrationConfig
  name: string
} {
  const appId = oauthResponse.app_id as string || ''

  return {
    accessToken: oauthResponse.access_token as string,
    refreshToken: oauthResponse.refresh_token as string | undefined,
    tokenExpiresAt: oauthResponse.expires_in
      ? new Date(Date.now() + (oauthResponse.expires_in as number) * 1000)
      : undefined,
    config: {
      app_id: appId
    },
    name: 'Intercom'
  }
}
