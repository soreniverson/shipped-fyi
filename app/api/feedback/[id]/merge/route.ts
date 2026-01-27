import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Merge feedback into an existing roadmap item
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership and get feedback
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

  if (feedback.review_status === 'merged') {
    return NextResponse.json(
      { error: 'Feedback already merged', item_id: feedback.merged_into_item_id },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const { item_id } = body

    if (!item_id) {
      return NextResponse.json(
        { error: 'item_id is required' },
        { status: 400 }
      )
    }

    // Verify the target item exists and belongs to the same project
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, project_id, title')
      .eq('id', item_id)
      .eq('project_id', feedback.project_id)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Target item not found' },
        { status: 404 }
      )
    }

    // Update feedback status
    const { error: updateError } = await supabase
      .from('extracted_feedback')
      .update({
        review_status: 'merged',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        merged_into_item_id: item_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update feedback:', updateError)
      return NextResponse.json({ error: 'Failed to merge' }, { status: 500 })
    }

    // If feedback has a cluster and the cluster isn't already linked, link it
    if (feedback.cluster_id) {
      const { data: cluster } = await supabase
        .from('feedback_clusters')
        .select('linked_item_id')
        .eq('id', feedback.cluster_id)
        .single()

      if (cluster && !cluster.linked_item_id) {
        await supabase
          .from('feedback_clusters')
          .update({
            linked_item_id: item_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', feedback.cluster_id)
      }
    }

    return NextResponse.json({
      success: true,
      item,
      feedback: {
        ...feedback,
        review_status: 'merged',
        merged_into_item_id: item_id
      }
    })
  } catch (err) {
    console.error('Error merging feedback:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
