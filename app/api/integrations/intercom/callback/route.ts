import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createIntercomIntegrationData } from '@/lib/integrations/intercom'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    console.error('Intercom OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=missing_params', request.url)
    )
  }

  // Parse state to get project ID
  let stateData: { projectId: string; csrf: string }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'))
  } catch {
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=invalid_state', request.url)
    )
  }

  const supabase = await createClient()

  // Verify user is authenticated and owns the project
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.redirect(
      new URL('/login?redirect=/dashboard/integrations', request.url)
    )
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, owner_id')
    .eq('id', stateData.projectId)
    .single()

  if (projectError || !project || project.owner_id !== user.id) {
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=project_not_found', request.url)
    )
  }

  // Exchange code for access token
  try {
    const tokenResponse = await fetch('https://api.intercom.io/auth/eagle/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: process.env.INTERCOM_CLIENT_ID!,
        client_secret: process.env.INTERCOM_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/intercom/callback`
      }).toString()
    })

    const oauthData = await tokenResponse.json()

    if (oauthData.error) {
      console.error('Intercom token exchange failed:', oauthData.error)
      return NextResponse.redirect(
        new URL(
          `/dashboard/integrations?error=${encodeURIComponent(oauthData.error)}`,
          request.url
        )
      )
    }

    // Create integration data
    const integrationData = createIntercomIntegrationData(oauthData)

    // Check if integration already exists
    const { data: existingIntegration } = await supabase
      .from('integration_sources')
      .select('id')
      .eq('project_id', stateData.projectId)
      .eq('type', 'intercom')
      .single()

    if (existingIntegration) {
      // Update existing integration
      const { error: updateError } = await supabase
        .from('integration_sources')
        .update({
          access_token: integrationData.accessToken,
          refresh_token: integrationData.refreshToken,
          token_expires_at: integrationData.tokenExpiresAt?.toISOString(),
          config: integrationData.config,
          status: 'active',
          last_error: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingIntegration.id)

      if (updateError) {
        console.error('Failed to update integration:', updateError)
        return NextResponse.redirect(
          new URL('/dashboard/integrations?error=update_failed', request.url)
        )
      }

      return NextResponse.redirect(
        new URL(
          `/dashboard/integrations?success=reconnected&integration=${existingIntegration.id}`,
          request.url
        )
      )
    }

    // Create new integration
    const { data: newIntegration, error: insertError } = await supabase
      .from('integration_sources')
      .insert({
        project_id: stateData.projectId,
        type: 'intercom',
        name: integrationData.name,
        access_token: integrationData.accessToken,
        refresh_token: integrationData.refreshToken,
        token_expires_at: integrationData.tokenExpiresAt?.toISOString(),
        config: integrationData.config,
        status: 'active'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create integration:', insertError)
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=create_failed', request.url)
      )
    }

    return NextResponse.redirect(
      new URL(
        `/dashboard/integrations?success=connected&integration=${newIntegration.id}`,
        request.url
      )
    )
  } catch (err) {
    console.error('Intercom OAuth error:', err)
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=oauth_failed', request.url)
    )
  }
}
