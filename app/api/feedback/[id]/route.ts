import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get a single feedback item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: feedback, error } = await supabase
    .from('extracted_feedback')
    .select(`
      *,
      raw_messages (
        id,
        content,
        content_html,
        channel_name,
        external_user_name,
        external_user_email,
        message_timestamp,
        metadata,
        integration_sources (
          id,
          type,
          name
        )
      ),
      feedback_clusters (
        id,
        title,
        description,
        member_count,
        linked_item_id
      ),
      projects!inner (
        id,
        name,
        owner_id
      )
    `)
    .eq('id', id)
    .eq('projects.owner_id', user.id)
    .single()

  if (error || !feedback) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
  }

  return NextResponse.json({ feedback })
}

/**
 * Update feedback review status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: feedback, error: fetchError } = await supabase
    .from('extracted_feedback')
    .select(`
      *,
      projects!inner (id, owner_id)
    `)
    .eq('id', id)
    .eq('projects.owner_id', user.id)
    .single()

  if (fetchError || !feedback) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { review_status, cluster_id } = body

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (review_status !== undefined) {
      if (!['pending', 'approved', 'rejected', 'merged'].includes(review_status)) {
        return NextResponse.json({ error: 'Invalid review_status' }, { status: 400 })
      }
      updateData.review_status = review_status
      updateData.reviewed_at = new Date().toISOString()
      updateData.reviewed_by = user.id
    }

    if (cluster_id !== undefined) {
      updateData.cluster_id = cluster_id
    }

    const { data: updated, error: updateError } = await supabase
      .from('extracted_feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update feedback:', updateError)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ feedback: updated })
  } catch (err) {
    console.error('Error updating feedback:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
