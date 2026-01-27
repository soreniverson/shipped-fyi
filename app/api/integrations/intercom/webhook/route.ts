import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { inngest } from '@/lib/inngest/client'
import type { Database, IntercomIntegrationConfig, IntegrationSource } from '@/lib/supabase/types'

// Use service role client for webhook processing
function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Verify Intercom webhook signature
 */
function verifyIntercomSignature(
  clientSecret: string,
  body: string,
  signature: string
): boolean {
  const hmac = crypto.createHmac('sha1', clientSecret)
  hmac.update(body)
  const expectedSignature = `sha1=${hmac.digest('hex')}`

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

function stripHtml(html: string): string {
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

export async function POST(request: NextRequest) {
  const clientSecret = process.env.INTERCOM_CLIENT_SECRET
  if (!clientSecret) {
    console.error('INTERCOM_CLIENT_SECRET not configured')
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
  }

  // Get raw body for signature verification
  const body = await request.text()

  // Verify signature
  const signature = request.headers.get('x-hub-signature') || ''
  if (!verifyIntercomSignature(clientSecret, body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Parse the event
  let event: Record<string, unknown>
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const topic = event.topic as string
  const appId = event.app_id as string

  // Only handle user messages
  if (!topic?.includes('conversation.user')) {
    return NextResponse.json({ received: true })
  }

  const data = event.data as Record<string, unknown>
  const item = data?.item as Record<string, unknown>

  if (!item) {
    return NextResponse.json({ received: true })
  }

  // Find the integration for this app
  const supabase = getServiceClient()

  const { data: integrations } = await supabase
    .from('integration_sources')
    .select('*')
    .eq('type', 'intercom')
    .eq('status', 'active') as { data: IntegrationSource[] | null }

  // Find matching integration by app_id
  const matchingIntegration = integrations?.find((integration: IntegrationSource) => {
    const config = integration.config as unknown as IntercomIntegrationConfig
    return config?.app_id === appId
  })

  if (!matchingIntegration) {
    return NextResponse.json({ received: true })
  }

  // Extract user message
  let messageContent: string | null = null
  let messageId: string = item.id as string
  let userName: string | undefined
  let userEmail: string | undefined
  let userId: string | undefined
  let timestamp: Date = new Date()

  // Check for latest user reply in conversation parts
  const conversationParts = item.conversation_parts as Record<string, unknown>
  const parts = (conversationParts?.conversation_parts || []) as Array<Record<string, unknown>>

  const userParts = parts.filter(part => {
    const author = part.author as Record<string, unknown>
    return author?.type === 'user'
  })

  if (userParts.length > 0) {
    const latestPart = userParts[userParts.length - 1]
    const author = latestPart.author as Record<string, unknown>
    messageContent = stripHtml(latestPart.body as string || '')
    messageId = `${item.id}-${latestPart.id}`
    userName = author.name as string | undefined
    userEmail = author.email as string | undefined
    userId = author.id as string | undefined
    timestamp = new Date((latestPart.created_at as number) * 1000)
  } else {
    // Check initial message
    const source = item.source as Record<string, unknown>
    const sourceAuthor = source?.author as Record<string, unknown> | undefined
    if (sourceAuthor?.type === 'user' && source?.body) {
      messageContent = stripHtml(source.body as string)
      userName = sourceAuthor.name as string | undefined
      userEmail = sourceAuthor.email as string | undefined
      userId = sourceAuthor.id as string | undefined
      timestamp = new Date((item.created_at as number) * 1000)
    }
  }

  if (!messageContent) {
    return NextResponse.json({ received: true })
  }

  // Insert raw message
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawMessage, error: insertError } = await (supabase as any)
    .from('raw_messages')
    .upsert(
      {
        integration_source_id: matchingIntegration.id,
        project_id: matchingIntegration.project_id,
        external_id: messageId,
        external_thread_id: item.id as string,
        external_user_id: userId,
        external_user_name: userName,
        external_user_email: userEmail,
        content: messageContent,
        channel_name: 'Intercom',
        message_timestamp: timestamp.toISOString(),
        metadata: {
          conversation_id: item.id,
          state: item.state,
          priority: item.priority,
          tags: item.tags
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
