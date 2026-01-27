import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'
import type { SlackIntegrationConfig } from '@/lib/supabase/types'

/**
 * Get a single integration
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

  const { data: integration, error } = await supabase
    .from('integration_sources')
    .select(`
      *,
      projects!inner(id, name, owner_id)
    `)
    .eq('id', id)
    .eq('projects.owner_id', user.id)
    .single()

  if (error || !integration) {
    return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
  }

  // Remove sensitive fields
  return NextResponse.json({
    integration: {
      ...integration,
      access_token: undefined,
      refresh_token: undefined,
      projects: undefined
    }
  })
}

/**
 * Update integration config
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
  const { data: integration, error: fetchError } = await supabase
    .from('integration_sources')
    .select(`
      *,
      projects!inner(id, owner_id)
    `)
    .eq('id', id)
    .eq('projects.owner_id', user.id)
    .single()

  if (fetchError || !integration) {
    return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { name, status, config } = body

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) {
      updateData.name = name
    }

    if (status !== undefined) {
      if (!['active', 'paused', 'error', 'disconnected'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updateData.status = status
    }

    if (config !== undefined) {
      // Merge with existing config
      updateData.config = {
        ...(integration.config as Record<string, unknown>),
        ...config
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('integration_sources')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update integration:', updateError)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({
      integration: {
        ...updated,
        access_token: undefined,
        refresh_token: undefined
      }
    })
  } catch (err) {
    console.error('Error updating integration:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Disconnect/delete integration
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
  const { data: integration, error: fetchError } = await supabase
    .from('integration_sources')
    .select(`
      *,
      projects!inner(id, owner_id)
    `)
    .eq('id', id)
    .eq('projects.owner_id', user.id)
    .single()

  if (fetchError || !integration) {
    return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
  }

  const { error: deleteError } = await supabase
    .from('integration_sources')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('Failed to delete integration:', deleteError)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
