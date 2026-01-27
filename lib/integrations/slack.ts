import crypto from 'crypto'
import { BaseIntegration, OAuthConfig, OAuthTokens, IntegrationMessage } from './base'
import type { IntegrationSource, SlackIntegrationConfig } from '@/lib/supabase/types'

export class SlackIntegration extends BaseIntegration {
  get type() {
    return 'slack' as const
  }

  getOAuthConfig(): OAuthConfig {
    return {
      authUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
      scopes: [
        'channels:history',
        'channels:read',
        'groups:history',
        'groups:read',
        'users:read',
        'users:read.email'
      ],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`
    }
  }

  protected parseTokenResponse(data: Record<string, unknown>): OAuthTokens {
    const authedUser = data.authed_user as { access_token?: string }
    const team = data.team as { id?: string; name?: string }

    return {
      accessToken: (data.access_token as string) || authedUser?.access_token || '',
      refreshToken: data.refresh_token as string | undefined,
      expiresAt: data.expires_in
        ? new Date(Date.now() + (data.expires_in as number) * 1000)
        : undefined,
      scope: data.scope as string | undefined
    }
  }

  parseConfig(): SlackIntegrationConfig {
    const config = this.source.config as Record<string, unknown>
    return {
      team_id: (config.team_id as string) || '',
      team_name: (config.team_name as string) || '',
      channel_ids: (config.channel_ids as string[]) || [],
      channel_names: config.channel_names as Record<string, string> | undefined,
      keywords: config.keywords as string[] | undefined,
      bot_user_id: config.bot_user_id as string | undefined
    }
  }

  /**
   * Validate Slack webhook signature
   */
  async validateWebhook(headers: Headers, body: string): Promise<boolean> {
    const signingSecret = process.env.SLACK_SIGNING_SECRET
    if (!signingSecret) {
      console.error('SLACK_SIGNING_SECRET not configured')
      return false
    }

    const timestamp = headers.get('x-slack-request-timestamp')
    const signature = headers.get('x-slack-signature')

    if (!timestamp || !signature) {
      return false
    }

    // Check timestamp to prevent replay attacks (5 minute window)
    const timestampSeconds = parseInt(timestamp, 10)
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - timestampSeconds) > 300) {
      return false
    }

    // Compute expected signature
    const sigBasestring = `v0:${timestamp}:${body}`
    const hmac = crypto.createHmac('sha256', signingSecret)
    hmac.update(sigBasestring)
    const expectedSignature = `v0=${hmac.digest('hex')}`

    // Constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }

  /**
   * Parse Slack event into integration messages
   */
  parseWebhookEvent(event: Record<string, unknown>): IntegrationMessage[] {
    const eventType = event.type as string

    // Handle URL verification challenge
    if (eventType === 'url_verification') {
      return [] // Return empty, handler should respond with challenge
    }

    // Handle event_callback
    if (eventType === 'event_callback') {
      const innerEvent = event.event as Record<string, unknown>
      return this.parseSlackEvent(innerEvent)
    }

    return []
  }

  private parseSlackEvent(event: Record<string, unknown>): IntegrationMessage[] {
    const eventType = event.type as string

    // Only handle message events
    if (eventType !== 'message') {
      return []
    }

    // Skip bot messages, system messages, and message_changed events
    if (event.subtype || event.bot_id) {
      return []
    }

    const text = event.text as string
    if (!text) {
      return []
    }

    // Check if message passes keyword filter
    if (!this.shouldProcessMessage(text)) {
      return []
    }

    return [
      {
        externalId: event.ts as string,
        externalThreadId: event.thread_ts as string | undefined,
        externalUserId: event.user as string,
        content: text,
        channelName: event.channel as string,
        messageTimestamp: new Date(parseFloat(event.ts as string) * 1000),
        metadata: {
          channel_type: event.channel_type,
          team: event.team
        }
      }
    ]
  }

  /**
   * Fetch user info from Slack API
   */
  async fetchUserInfo(userId: string): Promise<{
    name?: string
    email?: string
    realName?: string
  } | null> {
    const token = await this.getAccessToken()
    if (!token) return null

    try {
      const response = await fetch(
        `https://slack.com/api/users.info?user=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      if (!data.ok || !data.user) {
        return null
      }

      return {
        name: data.user.name,
        email: data.user.profile?.email,
        realName: data.user.real_name
      }
    } catch (error) {
      console.error('Failed to fetch Slack user info:', error)
      return null
    }
  }

  /**
   * List available channels in the workspace
   */
  async listChannels(): Promise<
    Array<{ id: string; name: string; is_private: boolean }>
  > {
    const token = await this.getAccessToken()
    if (!token) return []

    try {
      const channels: Array<{ id: string; name: string; is_private: boolean }> = []
      let cursor: string | undefined

      do {
        const params = new URLSearchParams({
          types: 'public_channel,private_channel',
          limit: '200'
        })
        if (cursor) {
          params.set('cursor', cursor)
        }

        const response = await fetch(
          `https://slack.com/api/conversations.list?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()
        if (!data.ok) {
          console.error('Failed to list channels:', data.error)
          break
        }

        for (const channel of data.channels || []) {
          channels.push({
            id: channel.id,
            name: channel.name,
            is_private: channel.is_private
          })
        }

        cursor = data.response_metadata?.next_cursor
      } while (cursor)

      return channels
    } catch (error) {
      console.error('Failed to list Slack channels:', error)
      return []
    }
  }

  /**
   * Fetch channel history for initial sync
   */
  async fetchChannelHistory(
    channelId: string,
    options?: {
      limit?: number
      oldest?: string
      cursor?: string
    }
  ): Promise<{
    messages: IntegrationMessage[]
    hasMore: boolean
    nextCursor?: string
  }> {
    const token = await this.getAccessToken()
    if (!token) {
      return { messages: [], hasMore: false }
    }

    try {
      const params = new URLSearchParams({
        channel: channelId,
        limit: String(options?.limit || 100)
      })

      if (options?.oldest) {
        params.set('oldest', options.oldest)
      }
      if (options?.cursor) {
        params.set('cursor', options.cursor)
      }

      const response = await fetch(
        `https://slack.com/api/conversations.history?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      if (!data.ok) {
        console.error('Failed to fetch history:', data.error)
        return { messages: [], hasMore: false }
      }

      const messages: IntegrationMessage[] = []

      for (const msg of data.messages || []) {
        // Skip bot messages and system messages
        if (msg.subtype || msg.bot_id) continue

        const text = msg.text as string
        if (!text || !this.shouldProcessMessage(text)) continue

        messages.push({
          externalId: msg.ts,
          externalThreadId: msg.thread_ts,
          externalUserId: msg.user,
          content: text,
          channelName: channelId,
          messageTimestamp: new Date(parseFloat(msg.ts) * 1000),
          metadata: {
            reactions: msg.reactions,
            reply_count: msg.reply_count
          }
        })
      }

      return {
        messages,
        hasMore: data.has_more || false,
        nextCursor: data.response_metadata?.next_cursor
      }
    } catch (error) {
      console.error('Failed to fetch Slack channel history:', error)
      return { messages: [], hasMore: false }
    }
  }
}

/**
 * Create a new Slack integration from OAuth response
 */
export function createSlackIntegrationData(
  oauthResponse: Record<string, unknown>
): {
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: Date
  config: SlackIntegrationConfig
  name: string
} {
  const team = oauthResponse.team as { id: string; name: string }
  const botUserId = (oauthResponse.bot_user_id as string) ||
    (oauthResponse.authed_user as { id?: string })?.id

  return {
    accessToken: oauthResponse.access_token as string,
    refreshToken: oauthResponse.refresh_token as string | undefined,
    tokenExpiresAt: oauthResponse.expires_in
      ? new Date(Date.now() + (oauthResponse.expires_in as number) * 1000)
      : undefined,
    config: {
      team_id: team.id,
      team_name: team.name,
      channel_ids: [],
      bot_user_id: botUserId
    },
    name: `Slack - ${team.name}`
  }
}
