import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { inngest } from '@/lib/inngest/client'
import type { Database, SlackIntegrationConfig, IntegrationSource } from '@/lib/supabase/types'

// Use service role client for webhook processing
function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Verify Slack webhook signature
 */
function verifySlackSignature(
  signingSecret: string,
  timestamp: string,
  body: string,
  signature: string
): boolean {
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
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET
  if (!signingSecret) {
    console.error('SLACK_SIGNING_SECRET not configured')
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
  }

  // Get raw body for signature verification
  const body = await request.text()

  // Verify signature
  const timestamp = request.headers.get('x-slack-request-timestamp') || ''
  const signature = request.headers.get('x-slack-signature') || ''

  if (!verifySlackSignature(signingSecret, timestamp, body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Parse the event
  let event: Record<string, unknown>
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Handle URL verification challenge
  if (event.type === 'url_verification') {
    return NextResponse.json({ challenge: event.challenge })
  }

  // Handle event_callback
  if (event.type === 'event_callback') {
    const teamId = event.team_id as string
    const innerEvent = event.event as Record<string, unknown>
    const eventType = innerEvent?.type as string

    // Only handle message events
    if (eventType !== 'message') {
      return NextResponse.json({ received: true })
    }

    // Skip bot messages, message_changed, etc.
    if (innerEvent.subtype || innerEvent.bot_id) {
      return NextResponse.json({ received: true })
    }

    const channelId = innerEvent.channel as string
    const messageTs = innerEvent.ts as string
    const text = innerEvent.text as string

    if (!text || !channelId || !messageTs) {
      return NextResponse.json({ received: true })
    }

    // Find the integration for this team/channel
    const supabase = getServiceClient()

    const { data: integrations } = await supabase
      .from('integration_sources')
      .select('*')
      .eq('type', 'slack')
      .eq('status', 'active') as { data: IntegrationSource[] | null }

    // Find integration that matches this team and has this channel configured
    const matchingIntegration = integrations?.find((integration: IntegrationSource) => {
      const config = integration.config as unknown as SlackIntegrationConfig
      return (
        config?.team_id === teamId &&
        (config?.channel_ids?.length === 0 || config?.channel_ids?.includes(channelId))
      )
    })

    if (!matchingIntegration) {
      // No integration configured for this team/channel
      return NextResponse.json({ received: true })
    }

    // Check keyword filter
    const config = matchingIntegration.config as unknown as SlackIntegrationConfig
    const keywords = config?.keywords || []
    if (keywords.length > 0) {
      const lowerText = text.toLowerCase()
      const hasKeyword = keywords.some(keyword =>
        lowerText.includes(keyword.toLowerCase())
      )
      if (!hasKeyword) {
        return NextResponse.json({ received: true })
      }
    }

    // Insert raw message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawMessage, error: insertError } = await (supabase as any)
      .from('raw_messages')
      .upsert(
        {
          integration_source_id: matchingIntegration.id,
          project_id: matchingIntegration.project_id,
          external_id: messageTs,
          external_thread_id: innerEvent.thread_ts as string | undefined,
          external_user_id: innerEvent.user as string,
          content: text,
          channel_name: channelId,
          message_timestamp: new Date(parseFloat(messageTs) * 1000).toISOString(),
          metadata: {
            team_id: teamId,
            channel_type: innerEvent.channel_type
          }
        },
        {
          onConflict: 'integration_source_id,external_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (insertError) {
      console.error('Failed to insert message:', insertError)
      return NextResponse.json({ received: true })
    }

    // Trigger processing via Inngest
    await inngest.send({
      name: 'message/received',
      data: {
        rawMessageId: rawMessage.id,
        projectId: matchingIntegration.project_id,
        integrationSourceId: matchingIntegration.id
      }
    })

    return NextResponse.json({ received: true })
  }

  return NextResponse.json({ received: true })
}
