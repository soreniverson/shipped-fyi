import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Approve feedback and create a roadmap item
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

  if (feedback.review_status === 'approved') {
    return NextResponse.json(
      { error: 'Feedback already approved', item_id: feedback.created_item_id },
      { status: 400 }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { title, description, status, category_id } = body

    // Create roadmap item
    const { data: item, error: itemError } = await supabase
      .from('items')
      .insert({
        project_id: feedback.project_id,
        title: title || feedback.title,
        description: description || feedback.description,
        status: status || 'considering',
        category_id: category_id || null,
        source_type: 'ai_extracted',
        source_feedback_id: feedback.id
      })
      .select()
      .single()

    if (itemError) {
      console.error('Failed to create item:', itemError)
      return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }

    // Update feedback status
    const { error: updateError } = await supabase
      .from('extracted_feedback')
      .update({
        review_status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        created_item_id: item.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update feedback:', updateError)
      // Item was created, but feedback wasn't updated - log but continue
    }

    // If feedback has a cluster, link the cluster to the item
    if (feedback.cluster_id) {
      await supabase
        .from('feedback_clusters')
        .update({
          linked_item_id: item.id,
          review_status: 'reviewed',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', feedback.cluster_id)
    }

    return NextResponse.json({
      success: true,
      item,
      feedback: {
        ...feedback,
        review_status: 'approved',
        created_item_id: item.id
      }
    })
  } catch (err) {
    console.error('Error approving feedback:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
