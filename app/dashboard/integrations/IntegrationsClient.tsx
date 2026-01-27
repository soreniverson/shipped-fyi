'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Slack,
  MessageSquare,
  Apple,
  RefreshCw,
  Trash2,
  Settings,
  CheckCircle,
  AlertCircle,
  Pause,
  Play
} from 'lucide-react'
import type { IntegrationSource, IntegrationSourceType, IntegrationStatus } from '@/lib/supabase/types'

interface Project {
  id: string
  name: string
  slug: string
}

interface Props {
  projects: Project[]
}

const integrationTypes: Array<{
  type: IntegrationSourceType
  name: string
  description: string
  icon: React.ReactNode
  available: boolean
}> = [
  {
    type: 'slack',
    name: 'Slack',
    description: 'Collect feedback from Slack channels',
    icon: <Slack className="h-6 w-6" />,
    available: true
  },
  {
    type: 'intercom',
    name: 'Intercom',
    description: 'Import customer conversations',
    icon: <MessageSquare className="h-6 w-6" />,
    available: true
  },
  {
    type: 'app_store',
    name: 'App Store',
    description: 'Monitor App Store reviews',
    icon: <Apple className="h-6 w-6" />,
    available: true
  }
]

const statusIcons: Record<IntegrationStatus, React.ReactNode> = {
  active: <CheckCircle className="h-4 w-4 text-green-500" />,
  paused: <Pause className="h-4 w-4 text-amber-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  disconnected: <AlertCircle className="h-4 w-4 text-sand-400" />
}

export function IntegrationsClient({ projects }: Props) {
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id || '')
  const [integrations, setIntegrations] = useState<IntegrationSource[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [appStoreConfig, setAppStoreConfig] = useState({ app_id: '', app_name: '' })
  const [showAppStoreDialog, setShowAppStoreDialog] = useState(false)

  useEffect(() => {
    if (selectedProject) {
      fetchIntegrations()
    }
  }, [selectedProject])

  async function fetchIntegrations() {
    setLoading(true)
    try {
      const response = await fetch(`/api/integrations?projectId=${selectedProject}`)
      const data = await response.json()

      if (data.integrations) {
        setIntegrations(data.integrations)
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function connectIntegration(type: IntegrationSourceType) {
    if (type === 'app_store') {
      setShowAppStoreDialog(true)
      setShowAddDialog(false)
      return
    }

    setConnecting(type)
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProject, type })
      })

      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    } catch (error) {
      console.error('Failed to connect:', error)
    } finally {
      setConnecting(null)
    }
  }

  async function createAppStoreIntegration() {
    if (!appStoreConfig.app_id || !appStoreConfig.app_name) {
      return
    }

    setConnecting('app_store')
    try {
      // For App Store, we directly create the integration
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          type: 'app_store',
          name: `App Store - ${appStoreConfig.app_name}`,
          config: appStoreConfig
        })
      })

      if (response.ok) {
        setShowAppStoreDialog(false)
        setAppStoreConfig({ app_id: '', app_name: '' })
        fetchIntegrations()
      }
    } catch (error) {
      console.error('Failed to create App Store integration:', error)
    } finally {
      setConnecting(null)
    }
  }

  async function syncIntegration(integrationId: string) {
    setSyncing(integrationId)
    try {
      await fetch(`/api/integrations/${integrationId}/sync`, {
        method: 'POST'
      })
      // Refresh after a delay
      setTimeout(fetchIntegrations, 2000)
    } catch (error) {
      console.error('Failed to sync:', error)
    } finally {
      setSyncing(null)
    }
  }

  async function togglePause(integrationId: string, currentStatus: IntegrationStatus) {
    const newStatus = currentStatus === 'paused' ? 'active' : 'paused'
    try {
      await fetch(`/api/integrations/${integrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      fetchIntegrations()
    } catch (error) {
      console.error('Failed to toggle pause:', error)
    }
  }

  async function deleteIntegration(integrationId: string) {
    if (!confirm('Are you sure you want to disconnect this integration?')) {
      return
    }

    try {
      await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE'
      })
      fetchIntegrations()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      <div className="flex gap-4 items-center">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => setShowAddDialog(true)}>
          Add Integration
        </Button>
      </div>

      {/* Integrations List */}
      {loading ? (
        <div className="text-center py-12 text-sand-500">Loading...</div>
      ) : integrations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sand-600 mb-4">
              No integrations connected yet. Add an integration to start collecting feedback automatically.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              Add Integration
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-sand-100 rounded-lg flex items-center justify-center">
                      {integration.type === 'slack' && <Slack className="h-5 w-5" />}
                      {integration.type === 'intercom' && <MessageSquare className="h-5 w-5" />}
                      {integration.type === 'app_store' && <Apple className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sand-900">{integration.name}</h3>
                        {statusIcons[integration.status]}
                      </div>
                      <div className="text-sm text-sand-500 flex items-center gap-3">
                        <span>{integration.message_count} messages</span>
                        {integration.last_sync_at && (
                          <span>
                            Last sync: {new Date(integration.last_sync_at).toLocaleString()}
                          </span>
                        )}
                        {integration.last_error && (
                          <span className="text-red-500">{integration.last_error}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => syncIntegration(integration.id)}
                      disabled={syncing === integration.id}
                    >
                      <RefreshCw className={`h-4 w-4 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePause(integration.id, integration.status)}
                    >
                      {integration.status === 'paused' ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => deleteIntegration(integration.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Integration Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Integration</DialogTitle>
            <DialogDescription>
              Connect a feedback source to automatically collect customer feedback
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {integrationTypes.map((type) => (
              <button
                key={type.type}
                className="w-full p-4 border border-sand-200 rounded-lg hover:border-sand-300 hover:bg-sand-50 transition-colors text-left flex items-center gap-4"
                onClick={() => connectIntegration(type.type)}
                disabled={!type.available || connecting === type.type}
              >
                <div className="h-12 w-12 bg-sand-100 rounded-lg flex items-center justify-center">
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sand-900">{type.name}</h3>
                  <p className="text-sm text-sand-500">{type.description}</p>
                </div>
                {connecting === type.type && (
                  <RefreshCw className="h-4 w-4 animate-spin text-sand-400" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* App Store Config Dialog */}
      <Dialog open={showAppStoreDialog} onOpenChange={setShowAppStoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect App Store</DialogTitle>
            <DialogDescription>
              Enter your app details to start monitoring reviews
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-sand-700 mb-1">
                App Store ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sand-300"
                placeholder="e.g., 123456789"
                value={appStoreConfig.app_id}
                onChange={(e) => setAppStoreConfig({ ...appStoreConfig, app_id: e.target.value })}
              />
              <p className="text-xs text-sand-500 mt-1">
                Find this in your App Store Connect URL
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-sand-700 mb-1">
                App Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sand-300"
                placeholder="e.g., My App"
                value={appStoreConfig.app_name}
                onChange={(e) => setAppStoreConfig({ ...appStoreConfig, app_name: e.target.value })}
              />
            </div>
            <Button
              className="w-full"
              onClick={createAppStoreIntegration}
              disabled={!appStoreConfig.app_id || !appStoreConfig.app_name || connecting === 'app_store'}
            >
              {connecting === 'app_store' ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
