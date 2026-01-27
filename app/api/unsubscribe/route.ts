import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Generate unsubscribe token for an email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if token already exists for this email
    const { data: existing } = await supabase
      .from('unsubscribe_tokens')
      .select('token')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ token: existing.token })
    }

    // Create new token
    const { data: newToken, error } = await supabase
      .from('unsubscribe_tokens')
      .insert({ email })
      .select('token')
      .single()

    if (error) {
      console.error('Failed to create unsubscribe token:', error)
      return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
    }

    return NextResponse.json({ token: newToken.token })
  } catch (error) {
    console.error('Error creating unsubscribe token:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Process unsubscribe request
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Find the email associated with this token
    const { data: tokenData, error: tokenError } = await supabase
      .from('unsubscribe_tokens')
      .select('email')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Update all votes with this email to disable notifications
    const { error: updateError } = await supabase
      .from('votes')
      .update({ notify_on_ship: false })
      .eq('voter_email', tokenData.email)

    if (updateError) {
      console.error('Failed to update votes:', updateError)
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from all notifications',
    })
  } catch (error) {
    console.error('Error processing unsubscribe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
