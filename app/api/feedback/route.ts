import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * List extracted feedback for review
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status') // pending, approved, rejected, merged
  const type = searchParams.get('type') // feature_request, bug_report, etc.
  const source = searchParams.get('source') // integration_source_id
  const minConfidence = searchParams.get('minConfidence')
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
    .from('extracted_feedback')
    .select(`
      *,
      raw_messages (
        id,
        content,
        channel_name,
        external_user_name,
        external_user_email,
        message_timestamp,
        integration_sources (
          id,
          type,
          name
        )
      ),
      feedback_clusters (
        id,
        title,
        member_count
      )
    `, { count: 'exact' })
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('review_status', status)
  }

  if (type) {
    query = query.eq('type', type)
  }

  if (source) {
    query = query.eq('raw_messages.integration_source_id', source)
  }

  if (minConfidence) {
    query = query.gte('confidence', parseFloat(minConfidence))
  }

  const { data: feedback, error, count } = await query

  if (error) {
    console.error('Failed to fetch feedback:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }

  return NextResponse.json({
    feedback,
    total: count,
    limit,
    offset
  })
}
