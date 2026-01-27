import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateCentroid } from '@/lib/ai'

/**
 * Merge another cluster into this one
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

  // Verify ownership of target cluster
  const { data: targetCluster, error: fetchError } = await supabase
    .from('feedback_clusters')
    .select(`
      *,
      projects!inner (id, owner_id)
    `)
    .eq('id', id)
    .eq('projects.owner_id', user.id)
    .single()

  if (fetchError || !targetCluster) {
    return NextResponse.json({ error: 'Target cluster not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { source_cluster_id } = body

    if (!source_cluster_id) {
      return NextResponse.json(
        { error: 'source_cluster_id is required' },
        { status: 400 }
      )
    }

    if (source_cluster_id === id) {
      return NextResponse.json(
        { error: 'Cannot merge cluster into itself' },
        { status: 400 }
      )
    }

    // Verify source cluster exists and belongs to same project
    const { data: sourceCluster, error: sourceError } = await supabase
      .from('feedback_clusters')
      .select('*')
      .eq('id', source_cluster_id)
      .eq('project_id', targetCluster.project_id)
      .single()

    if (sourceError || !sourceCluster) {
      return NextResponse.json(
        { error: 'Source cluster not found' },
        { status: 404 }
      )
    }

    // Move all feedback from source to target
    const { error: moveError } = await supabase
      .from('extracted_feedback')
      .update({ cluster_id: id })
      .eq('cluster_id', source_cluster_id)

    if (moveError) {
      console.error('Failed to move feedback:', moveError)
      return NextResponse.json({ error: 'Failed to merge' }, { status: 500 })
    }

    // Get all embeddings for the merged cluster to recalculate centroid
    const { data: allFeedback } = await supabase
      .from('extracted_feedback')
      .select('embedding')
      .eq('cluster_id', id)
      .not('embedding', 'is', null)

    let newCentroid = targetCluster.centroid_embedding
    if (allFeedback && allFeedback.length > 0) {
      const embeddings = allFeedback
        .map(f => f.embedding as number[])
        .filter(e => e && e.length > 0)

      if (embeddings.length > 0) {
        newCentroid = calculateCentroid(embeddings)
      }
    }

    // Update target cluster stats
    const newMemberCount = targetCluster.member_count + sourceCluster.member_count
    const newTotalMentions = targetCluster.total_mentions + sourceCluster.total_mentions

    const { error: updateError } = await supabase
      .from('feedback_clusters')
      .update({
        member_count: newMemberCount,
        total_mentions: newTotalMentions,
        centroid_embedding: newCentroid,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update target cluster:', updateError)
    }

    // Delete source cluster
    const { error: deleteError } = await supabase
      .from('feedback_clusters')
      .delete()
      .eq('id', source_cluster_id)

    if (deleteError) {
      console.error('Failed to delete source cluster:', deleteError)
    }

    // Fetch updated cluster
    const { data: mergedCluster } = await supabase
      .from('feedback_clusters')
      .select('*')
      .eq('id', id)
      .single()

    return NextResponse.json({
      success: true,
      cluster: mergedCluster,
      merged_from: sourceCluster.id,
      new_member_count: newMemberCount
    })
  } catch (err) {
    console.error('Error merging clusters:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
