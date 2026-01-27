import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * List feedback clusters
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status') // pending, reviewed, dismissed
  const linked = searchParams.get('linked') // true, false - filter by linked_item_id
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  if (!projectId) {
    return NextResponse.json(
      { error: 'projectId is required' },
      { status: 400 }
    )
  }

  // Verify user owns the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, owner_id')
    .eq('id', projectId)
    .single()

  if (projectError || !project || project.owner_id !== user.id) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Build query
  let query = supabase
    .from('feedback_clusters')
    .select(`
      *,
      items:linked_item_id (
        id,
        title,
        status
      )
    `, { count: 'exact' })
    .eq('project_id', projectId)
    .order('member_count', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('review_status', status)
  }

  if (linked === 'true') {
    query = query.not('linked_item_id', 'is', null)
  } else if (linked === 'false') {
    query = query.is('linked_item_id', null)
  }

  const { data: clusters, error, count } = await query

  if (error) {
    console.error('Failed to fetch clusters:', error)
    return NextResponse.json({ error: 'Failed to fetch clusters' }, { status: 500 })
  }

  // For each cluster, get top quotes
  const clustersWithQuotes = await Promise.all(
    (clusters || []).map(async (cluster) => {
      const { data: feedback } = await supabase
        .from('extracted_feedback')
        .select('id, quote, customer_name, confidence')
        .eq('cluster_id', cluster.id)
        .order('confidence', { ascending: false })
        .limit(5)

      return {
        ...cluster,
        top_quotes: feedback || []
      }
    })
  )

  return NextResponse.json({
    clusters: clustersWithQuotes,
    total: count,
    limit,
    offset
  })
}
