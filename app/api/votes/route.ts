import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimit = await checkRateLimit('vote')
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt)
  }

  try {
    const body = await request.json()
    const { itemId, voterToken, voterEmail, notifyOnShip } = body

    // Validate input
    if (!itemId || typeof itemId !== 'string') {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    if (!voterToken || typeof voterToken !== 'string') {
      return NextResponse.json(
        { error: 'Voter token is required' },
        { status: 400 }
      )
    }

    // Validate email if provided
    if (voterEmail && typeof voterEmail === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(voterEmail)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        )
      }
    }

    const supabase = await createClient()

    // Verify item exists
    const { data: item } = await supabase
      .from('items')
      .select('id')
      .eq('id', itemId)
      .single()

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('item_id', itemId)
      .eq('voter_token', voterToken)
      .single()

    if (existingVote) {
      return NextResponse.json(
        { error: 'Already voted' },
        { status: 400 }
      )
    }

    // Insert the vote
    const voteData: {
      item_id: string
      voter_token: string
      voter_email?: string
      notify_on_ship: boolean
    } = {
      item_id: itemId,
      voter_token: voterToken,
      notify_on_ship: notifyOnShip || false,
    }

    if (notifyOnShip && voterEmail) {
      voteData.voter_email = voterEmail
    }

    const { error: insertError } = await supabase
      .from('votes')
      .insert(voteData)

    if (insertError) {
      console.error('Failed to insert vote:', insertError)
      return NextResponse.json(
        { error: 'Failed to record vote' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error recording vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, voterToken } = body

    if (!itemId || !voterToken) {
      return NextResponse.json(
        { error: 'Item ID and voter token are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('item_id', itemId)
      .eq('voter_token', voterToken)

    if (error) {
      console.error('Failed to delete vote:', error)
      return NextResponse.json(
        { error: 'Failed to remove vote' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
