import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get a single cluster with its members
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

  const { data: cluster, error } = await supabase
    .from('feedback_clusters')
    .select(`
      *,
      items:linked_item_id (
        id,
        title,
        description,
        status,
        vote_count
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

  if (error || !cluster) {
    return NextResponse.json({ error: 'Cluster not found' }, { status: 404 })
  }

  // Get all feedback in this cluster
  const { data: members } = await supabase
    .from('extracted_feedback')
    .select(`
      id,
      type,
      title,
      quote,
      confidence,
      sentiment,
      urgency,
      customer_name,
      customer_email,
      review_status,
      created_at,
      raw_messages (
        message_timestamp,
        channel_name,
        integration_sources (
          type,
          name
        )
      )
    `)
    .eq('cluster_id', id)
    .order('confidence', { ascending: false })

  return NextResponse.json({
    cluster: {
      ...cluster,
      members: members || []
    }
  })
}

/**
 * Update cluster (link to item, update status)
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
  const { data: cluster, error: fetchError } = await supabase
    .from('feedback_clusters')
    .select(`
      *,
      projects!inner (id, owner_id)
    `)
    .eq('id', id)
    .eq('projects.owner_id', user.id)
    .single()

  if (fetchError || !cluster) {
    return NextResponse.json({ error: 'Cluster not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { title, description, linked_item_id, review_status } = body

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) {
      updateData.title = title
    }

    if (description !== undefined) {
      updateData.description = description
    }

    if (linked_item_id !== undefined) {
      // Verify the target item belongs to the same project
      if (linked_item_id !== null) {
        const { data: item, error: itemError } = await supabase
          .from('items')
          .select('id')
          .eq('id', linked_item_id)
          .eq('project_id', cluster.project_id)
          .single()

        if (itemError || !item) {
          return NextResponse.json(
            { error: 'Target item not found' },
            { status: 404 }
          )
        }
      }
      updateData.linked_item_id = linked_item_id
    }

    if (review_status !== undefined) {
      if (!['pending', 'reviewed', 'dismissed'].includes(review_status)) {
        return NextResponse.json({ error: 'Invalid review_status' }, { status: 400 })
      }
      updateData.review_status = review_status
      updateData.reviewed_at = new Date().toISOString()
      updateData.reviewed_by = user.id
    }

    const { data: updated, error: updateError } = await supabase
      .from('feedback_clusters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update cluster:', updateError)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ cluster: updated })
  } catch (err) {
    console.error('Error updating cluster:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Delete/dismiss cluster
 */
export async function DELETE(
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
  const { data: cluster, error: fetchError } = await supabase
    .from('feedback_clusters')
    .select(`
      *,
      projects!inner (id, owner_id)
    `)
    .eq('id', id)
    .eq('projects.owner_id', user.id)
    .single()

  if (fetchError || !cluster) {
    return NextResponse.json({ error: 'Cluster not found' }, { status: 404 })
  }

  // Unlink all feedback from this cluster
  await supabase
    .from('extracted_feedback')
    .update({ cluster_id: null })
    .eq('cluster_id', id)

  // Delete the cluster
  const { error: deleteError } = await supabase
    .from('feedback_clusters')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('Failed to delete cluster:', deleteError)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
