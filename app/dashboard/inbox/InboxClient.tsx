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
import { CheckCircle, XCircle, GitMerge, MessageSquare, Bug, Lightbulb, HelpCircle, ThumbsUp, ExternalLink } from 'lucide-react'
import type { ExtractedFeedback, FeedbackType, ReviewStatus } from '@/lib/supabase/types'

interface Project {
  id: string
  name: string
  slug: string
}

interface FeedbackWithDetails extends ExtractedFeedback {
  raw_messages?: {
    id: string
    content: string
    channel_name: string | null
    external_user_name: string | null
    external_user_email: string | null
    message_timestamp: string
    integration_sources?: {
      id: string
      type: string
      name: string
    }
  }
  feedback_clusters?: {
    id: string
    title: string
    member_count: number
  }
}

interface Props {
  projects: Project[]
}

const typeIcons: Record<FeedbackType, React.ReactNode> = {
  feature_request: <Lightbulb className="h-4 w-4 text-amber-500" />,
  bug_report: <Bug className="h-4 w-4 text-red-500" />,
  complaint: <MessageSquare className="h-4 w-4 text-orange-500" />,
  praise: <ThumbsUp className="h-4 w-4 text-green-500" />,
  question: <HelpCircle className="h-4 w-4 text-blue-500" />,
}

const typeLabels: Record<FeedbackType, string> = {
  feature_request: 'Feature Request',
  bug_report: 'Bug Report',
  complaint: 'Complaint',
  praise: 'Praise',
  question: 'Question',
}

const statusColors: Record<ReviewStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  merged: 'bg-blue-100 text-blue-800',
}

export function InboxClient({ projects }: Props) {
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id || '')
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [feedback, setFeedback] = useState<FeedbackWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (selectedProject) {
      fetchFeedback()
    }
  }, [selectedProject, statusFilter, typeFilter])

  async function fetchFeedback() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        projectId: selectedProject,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      })

      const response = await fetch(`/api/feedback?${params}`)
      const data = await response.json()

      if (data.feedback) {
        setFeedback(data.feedback)
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(feedbackId: string) {
    setProcessing(feedbackId)
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (response.ok) {
        fetchFeedback()
      }
    } catch (error) {
      console.error('Failed to approve:', error)
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(feedbackId: string) {
    setProcessing(feedbackId)
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_status: 'rejected' })
      })

      if (response.ok) {
        fetchFeedback()
      }
    } catch (error) {
      console.error('Failed to reject:', error)
    } finally {
      setProcessing(null)
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
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="merged">Merged</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="feature_request">Feature Request</SelectItem>
            <SelectItem value="bug_report">Bug Report</SelectItem>
            <SelectItem value="complaint">Complaint</SelectItem>
            <SelectItem value="praise">Praise</SelectItem>
            <SelectItem value="question">Question</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="text-center py-12 text-sand-500">Loading...</div>
      ) : feedback.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sand-600">
              {statusFilter === 'pending'
                ? 'No pending feedback to review'
                : 'No feedback found matching filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b border-sand-100">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {typeIcons[item.type]}
                        <span className="text-xs text-sand-500">
                          {typeLabels[item.type]}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[item.review_status]}`}>
                          {item.review_status}
                        </span>
                        <span className="text-xs text-sand-400">
                          {Math.round(item.confidence * 100)}% confidence
                        </span>
                      </div>
                      <h3 className="font-medium text-sand-900">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-sand-600 mt-1">{item.description}</p>
                      )}
                    </div>

                    {item.review_status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(item.id)}
                          disabled={processing === item.id}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(item.id)}
                          disabled={processing === item.id}
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quote & Source */}
                <div className="p-4 bg-sand-50">
                  {item.quote && (
                    <blockquote className="text-sm text-sand-700 italic border-l-2 border-sand-300 pl-3 mb-3">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                  )}

                  <div className="flex items-center gap-4 text-xs text-sand-500">
                    {item.raw_messages?.integration_sources && (
                      <span className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {item.raw_messages.integration_sources.name}
                      </span>
                    )}
                    {item.raw_messages?.channel_name && (
                      <span>#{item.raw_messages.channel_name}</span>
                    )}
                    {item.customer_name && (
                      <span>{item.customer_name}</span>
                    )}
                    {item.raw_messages?.message_timestamp && (
                      <span>
                        {new Date(item.raw_messages.message_timestamp).toLocaleDateString()}
                      </span>
                    )}
                    {item.feedback_clusters && (
                      <span className="flex items-center gap-1">
                        <GitMerge className="h-3 w-3" />
                        {item.feedback_clusters.member_count} similar
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
