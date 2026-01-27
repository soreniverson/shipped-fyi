import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * List all integrations for the user's projects
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const projectId = searchParams.get('projectId')

  let query = supabase
    .from('integration_sources')
    .select(`
      *,
      projects!inner(id, name, owner_id)
    `)
    .eq('projects.owner_id', user.id)
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data: integrations, error } = await query

  if (error) {
    console.error('Failed to fetch integrations:', error)
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 })
  }

  // Remove sensitive fields
  const sanitizedIntegrations = integrations?.map(integration => ({
    ...integration,
    access_token: undefined,
    refresh_token: undefined,
    projects: undefined
  }))

  return NextResponse.json({ integrations: sanitizedIntegrations })
}

/**
 * Initiate OAuth connection or create direct integration
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { projectId, type, name, config } = body

    if (!projectId || !type) {
      return NextResponse.json(
        { error: 'projectId and type are required' },
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

    // Handle direct integration creation (no OAuth required)
    if (type === 'app_store') {
      // If config is provided, create the integration directly
      if (config && config.app_id && config.app_name) {
        const { data: newIntegration, error: insertError } = await supabase
          .from('integration_sources')
          .insert({
            project_id: projectId,
            type: 'app_store',
            name: name || `App Store - ${config.app_name}`,
            config: {
              app_id: config.app_id,
              app_name: config.app_name,
              country_codes: config.country_codes || ['us']
            },
            status: 'active'
          })
          .select()
          .single()

        if (insertError) {
          console.error('Failed to create App Store integration:', insertError)
          return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          integration: {
            ...newIntegration,
            access_token: undefined,
            refresh_token: undefined
          }
        })
      }

      // If no config, return field requirements
      return NextResponse.json({
        requiresConfig: true,
        configFields: [
          { name: 'app_id', label: 'App Store ID', type: 'text', required: true },
          { name: 'app_name', label: 'App Name', type: 'text', required: true }
        ]
      })
    }

    // Generate state with CSRF token for OAuth
    const csrf = crypto.randomUUID()
    const state = Buffer.from(
      JSON.stringify({ projectId, csrf })
    ).toString('base64')

    // Build OAuth URL based on integration type
    let authUrl: string

    switch (type) {
      case 'slack': {
        const scopes = [
          'channels:history',
          'channels:read',
          'groups:history',
          'groups:read',
          'users:read',
          'users:read.email'
        ].join(',')

        const params = new URLSearchParams({
          client_id: process.env.SLACK_CLIENT_ID!,
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`,
          scope: scopes,
          state
        })

        authUrl = `https://slack.com/oauth/v2/authorize?${params.toString()}`
        break
      }

      case 'intercom': {
        const params = new URLSearchParams({
          client_id: process.env.INTERCOM_CLIENT_ID!,
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/intercom/callback`,
          state
        })

        authUrl = `https://app.intercom.com/oauth?${params.toString()}`
        break
      }

      default:
        return NextResponse.json(
          { error: `Unknown integration type: ${type}` },
          { status: 400 }
        )
    }

    return NextResponse.json({ authUrl })
  } catch (err) {
    console.error('Error initiating OAuth:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
