import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

async function getOrCreateUnsubscribeToken(supabase: Awaited<ReturnType<typeof createClient>>, email: string): Promise<string> {
  // Check for existing token
  const { data: existing } = await supabase
    .from('unsubscribe_tokens')
    .select('token')
    .eq('email', email)
    .single()

  if (existing) {
    return existing.token
  }

  // Create new token
  const { data: newToken } = await supabase
    .from('unsubscribe_tokens')
    .insert({ email })
    .select('token')
    .single()

  return newToken?.token || ''
}

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the item and its project
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*, projects(*)')
      .eq('id', itemId)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Get voters who want to be notified
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('voter_email')
      .eq('item_id', itemId)
      .eq('notify_on_ship', true)
      .not('voter_email', 'is', null)

    if (votesError) {
      console.error('Error fetching votes:', votesError)
      return NextResponse.json({ error: 'Failed to fetch voters' }, { status: 500 })
    }

    if (!votes || votes.length === 0) {
      return NextResponse.json({ message: 'No voters to notify' })
    }

    // Get already notified emails to prevent duplicates
    const { data: notified } = await supabase
      .from('notification_logs')
      .select('voter_email')
      .eq('item_id', itemId)

    const notifiedEmails = new Set(notified?.map((n) => n.voter_email) || [])

    // Filter out already notified emails
    const emailsToNotify = votes
      .map((v) => v.voter_email)
      .filter((email): email is string => email !== null && !notifiedEmails.has(email))

    if (emailsToNotify.length === 0) {
      return NextResponse.json({ message: 'All voters already notified' })
    }

    const project = item.projects as { name: string; slug: string }
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shipped.fyi'
    const changelogUrl = `${baseUrl}/${project.slug}/changelog`

    // Send emails
    const emailPromises = emailsToNotify.map(async (email) => {
      try {
        // Get or create unsubscribe token for this email
        const unsubscribeToken = await getOrCreateUnsubscribeToken(supabase, email)
        const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${unsubscribeToken}`

        await resend.emails.send({
          from: 'shipped.fyi <notifications@shipped.fyi>',
          to: email,
          subject: `"${item.title}" has shipped!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Good news!</h2>
              <p style="color: #4a4a4a; font-size: 16px;">
                A feature you voted for on <strong>${project.name}</strong> has just shipped:
              </p>
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3 style="margin: 0 0 8px 0; color: #1a1a1a;">${item.title}</h3>
                ${item.description ? `<p style="margin: 0; color: #6a6a6a;">${item.description}</p>` : ''}
              </div>
              <p style="color: #4a4a4a;">
                <a href="${changelogUrl}" style="color: #0066cc;">View the full changelog</a>
              </p>
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
              <p style="color: #888; font-size: 12px;">
                You're receiving this because you opted in to notifications when you voted on ${project.name}.
                <br /><br />
                <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe from all notifications</a>
              </p>
            </div>
          `,
        })

        // Log the notification
        await supabase
          .from('notification_logs')
          .insert({ item_id: itemId, voter_email: email })

        return { email, success: true }
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error)
        return { email, success: false }
      }
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter((r) => r.success).length

    return NextResponse.json({
      message: `Sent ${successCount} of ${emailsToNotify.length} notifications`,
      results,
    })
  } catch (error) {
    console.error('Error sending ship notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
