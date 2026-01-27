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
import { Users, Link as LinkIcon, CheckCircle, XCircle, Quote } from 'lucide-react'
import type { FeedbackCluster, Item } from '@/lib/supabase/types'

interface Project {
  id: string
  name: string
  slug: string
}

interface ClusterWithDetails extends FeedbackCluster {
  items?: Item
  top_quotes?: Array<{
    id: string
    quote: string | null
    customer_name: string | null
    confidence: number
  }>
}

interface Props {
  projects: Project[]
}

export function ClustersClient({ projects }: Props) {
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id || '')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [linkedFilter, setLinkedFilter] = useState<string>('all')
  const [clusters, setClusters] = useState<ClusterWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null)

  useEffect(() => {
    if (selectedProject) {
      fetchClusters()
    }
  }, [selectedProject, statusFilter, linkedFilter])

  async function fetchClusters() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        projectId: selectedProject,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(linkedFilter !== 'all' && { linked: linkedFilter }),
      })

      const response = await fetch(`/api/clusters?${params}`)
      const data = await response.json()

      if (data.clusters) {
        setClusters(data.clusters)
      }
    } catch (error) {
      console.error('Failed to fetch clusters:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDismiss(clusterId: string) {
    try {
      const response = await fetch(`/api/clusters/${clusterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_status: 'dismissed' })
      })

      if (response.ok) {
        fetchClusters()
      }
    } catch (error) {
      console.error('Failed to dismiss:', error)
    }
  }

  async function handleMarkReviewed(clusterId: string) {
    try {
      const response = await fetch(`/api/clusters/${clusterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_status: 'reviewed' })
      })

      if (response.ok) {
        fetchClusters()
      }
    } catch (error) {
      console.error('Failed to mark reviewed:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={linkedFilter} onValueChange={setLinkedFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Linked" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Linked to Item</SelectItem>
            <SelectItem value="false">Not Linked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clusters List */}
      {loading ? (
        <div className="text-center py-12 text-sand-500">Loading...</div>
      ) : clusters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sand-600">
              No clusters found. Feedback will be automatically clustered as it&apos;s processed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {clusters.map((cluster) => (
            <Card
              key={cluster.id}
              className={`overflow-hidden cursor-pointer transition-all ${
                expandedCluster === cluster.id ? 'ring-2 ring-sand-300' : ''
              }`}
              onClick={() => setExpandedCluster(
                expandedCluster === cluster.id ? null : cluster.id
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-medium text-sand-900 line-clamp-2">
                    {cluster.title}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-sand-500 flex-shrink-0">
                    <Users className="h-4 w-4" />
                    {cluster.member_count}
                  </div>
                </div>

                {cluster.description && (
                  <p className="text-sm text-sand-600 mb-3 line-clamp-2">
                    {cluster.description}
                  </p>
                )}

                {/* Linked item indicator */}
                {cluster.items && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded mb-3">
                    <LinkIcon className="h-3 w-3" />
                    Linked to: {(cluster.items as Item).title}
                  </div>
                )}

                {/* Top quotes (expanded view) */}
                {expandedCluster === cluster.id && cluster.top_quotes && cluster.top_quotes.length > 0 && (
                  <div className="border-t border-sand-100 pt-3 mt-3 space-y-2">
                    <p className="text-xs font-medium text-sand-500 flex items-center gap-1">
                      <Quote className="h-3 w-3" /> Top Quotes
                    </p>
                    {cluster.top_quotes.map((quote) => (
                      quote.quote && (
                        <div key={quote.id} className="text-sm bg-sand-50 p-2 rounded">
                          <p className="text-sand-700 italic line-clamp-2">
                            &ldquo;{quote.quote}&rdquo;
                          </p>
                          {quote.customer_name && (
                            <p className="text-xs text-sand-500 mt-1">
                              — {quote.customer_name}
                            </p>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Actions */}
                {cluster.review_status === 'pending' && (
                  <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-600"
                      onClick={() => handleMarkReviewed(cluster.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Reviewed
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => handleDismiss(cluster.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3 text-xs text-sand-400">
                  <span className={`px-2 py-0.5 rounded-full ${
                    cluster.review_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    cluster.review_status === 'reviewed' ? 'bg-green-100 text-green-800' :
                    'bg-sand-100 text-sand-600'
                  }`}>
                    {cluster.review_status}
                  </span>
                  <span>{cluster.total_mentions} total mentions</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
