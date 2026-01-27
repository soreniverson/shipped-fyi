import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'
import type { SlackIntegrationConfig } from '@/lib/supabase/types'

/**
 * Trigger manual sync for an integration
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

  if (integration.status !== 'active') {
    return NextResponse.json(
      { error: 'Integration is not active' },
      { status: 400 }
    )
  }

  try {
    // Trigger sync based on integration type
    switch (integration.type) {
      case 'slack': {
        const config = integration.config as SlackIntegrationConfig
        const channelIds = config.channel_ids || []

        if (channelIds.length === 0) {
          return NextResponse.json(
            { error: 'No channels configured for sync' },
            { status: 400 }
          )
        }

        // Trigger sync for each channel
        for (const channelId of channelIds) {
          await inngest.send({
            name: 'integration/sync.slack',
            data: {
              integrationSourceId: integration.id,
              projectId: integration.project_id,
              channelId
            }
          })
        }

        return NextResponse.json({
          success: true,
          message: `Sync triggered for ${channelIds.length} channel(s)`
        })
      }

      case 'app_store': {
        const config = integration.config as { app_id?: string }
        if (!config.app_id) {
          return NextResponse.json(
            { error: 'No app ID configured' },
            { status: 400 }
          )
        }

        await inngest.send({
          name: 'appstore/poll',
          data: {
            integrationSourceId: integration.id,
            projectId: integration.project_id,
            appId: config.app_id
          }
        })

        return NextResponse.json({
          success: true,
          message: 'App Store sync triggered'
        })
      }

      case 'intercom': {
        await inngest.send({
          name: 'integration/sync',
          data: {
            integrationSourceId: integration.id,
            projectId: integration.project_id,
            fullSync: true
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Intercom sync triggered'
        })
      }

      default:
        return NextResponse.json(
          { error: `Sync not supported for ${integration.type}` },
          { status: 400 }
        )
    }
  } catch (err) {
    console.error('Error triggering sync:', err)
    return NextResponse.json({ error: 'Failed to trigger sync' }, { status: 500 })
  }
}
