import type { IntegrationSource, IntegrationSourceType, Json } from '@/lib/supabase/types'

export interface OAuthConfig {
  authUrl: string
  tokenUrl: string
  clientId: string
  clientSecret: string
  scopes: string[]
  redirectUri: string
}

export interface OAuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  scope?: string
}

export interface IntegrationMessage {
  externalId: string
  externalThreadId?: string
  externalUserId?: string
  externalUserName?: string
  externalUserEmail?: string
  content: string
  contentHtml?: string
  channelName?: string
  metadata?: Record<string, unknown>
  messageTimestamp: Date
}

export abstract class BaseIntegration {
  protected source: IntegrationSource

  constructor(source: IntegrationSource) {
    this.source = source
  }

  abstract get type(): IntegrationSourceType

  /**
   * Get the OAuth configuration for this integration
   */
  abstract getOAuthConfig(): OAuthConfig

  /**
   * Build the OAuth authorization URL
   */
  getAuthUrl(state: string): string {
    const config = this.getOAuthConfig()
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      state,
      response_type: 'code'
    })

    return `${config.authUrl}?${params.toString()}`
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(code: string): Promise<OAuthTokens> {
    const config = this.getOAuthConfig()

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    const data = await response.json()
    return this.parseTokenResponse(data)
  }

  /**
   * Refresh expired tokens
   */
  async refreshTokens(refreshToken: string): Promise<OAuthTokens> {
    const config = this.getOAuthConfig()

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }).toString()
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token refresh failed: ${error}`)
    }

    const data = await response.json()
    return this.parseTokenResponse(data)
  }

  /**
   * Parse token response from OAuth provider
   */
  protected abstract parseTokenResponse(data: Record<string, unknown>): OAuthTokens

  /**
   * Parse integration-specific config from JSON
   */
  abstract parseConfig(): Record<string, unknown>

  /**
   * Validate incoming webhook request
   */
  abstract validateWebhook(
    headers: Headers,
    body: string
  ): Promise<boolean>

  /**
   * Parse webhook event into messages
   */
  abstract parseWebhookEvent(
    event: Record<string, unknown>
  ): IntegrationMessage[]

  /**
   * Check if message matches configured filters
   */
  shouldProcessMessage(content: string): boolean {
    const config = this.parseConfig() as { keywords?: string[] }
    const keywords = config.keywords || []

    // If no keywords configured, process all messages
    if (keywords.length === 0) return true

    // Check if any keyword is present
    const lowerContent = content.toLowerCase()
    return keywords.some(keyword =>
      lowerContent.includes(keyword.toLowerCase())
    )
  }

  /**
   * Get current access token (refresh if needed)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.source.access_token) {
      return null
    }

    // Check if token is expired
    if (this.source.token_expires_at) {
      const expiresAt = new Date(this.source.token_expires_at)
      const now = new Date()

      // Refresh if expires in less than 5 minutes
      if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
        if (this.source.refresh_token) {
          try {
            const newTokens = await this.refreshTokens(this.source.refresh_token)
            // Note: Caller should update the source with new tokens
            return newTokens.accessToken
          } catch (error) {
            console.error('Failed to refresh token:', error)
            return null
          }
        }
        return null
      }
    }

    return this.source.access_token
  }
}

/**
 * Factory function to create integration instance
 */
export async function createIntegration(
  source: IntegrationSource
): Promise<BaseIntegration> {
  switch (source.type) {
    case 'slack': {
      const { SlackIntegration } = await import('./slack')
      return new SlackIntegration(source)
    }
    case 'intercom': {
      const { IntercomIntegration } = await import('./intercom')
      return new IntercomIntegration(source)
    }
    default:
      throw new Error(`Unknown integration type: ${source.type}`)
  }
}
