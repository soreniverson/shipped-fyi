'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, Item } from '@/lib/supabase/types'
import { getVoterToken } from '@/lib/voter-token'

interface WidgetBoardProps {
  project: Project
  initialItems: Item[]
}

const statusLabels: Record<string, string> = {
  considering: 'Considering',
  planned: 'Planned',
  in_progress: 'In Progress',
}

const statusColors: Record<string, string> = {
  considering: 'bg-amber-100 text-amber-700',
  planned: 'bg-violet-100 text-violet-700',
  in_progress: 'bg-blue-100 text-blue-700',
}

export function WidgetBoard({ project, initialItems }: WidgetBoardProps) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set())
  const [voterToken, setVoterToken] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const token = getVoterToken()
    setVoterToken(token)

    const fetchVotes = async () => {
      const supabase = createClient()
      const { data: votes } = await supabase
        .from('votes')
        .select('item_id')
        .eq('voter_token', token)

      if (votes) {
        setVotedItems(new Set(votes.map((v) => v.item_id)))
      }
    }

    fetchVotes()
  }, [])

  const handleVote = async (itemId: string) => {
    const supabase = createClient()
    const hasVoted = votedItems.has(itemId)

    if (hasVoted) {
      await supabase
        .from('votes')
        .delete()
        .eq('item_id', itemId)
        .eq('voter_token', voterToken)

      setVotedItems((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, vote_count: item.vote_count - 1 } : item
        )
      )
    } else {
      await supabase.from('votes').insert({
        item_id: itemId,
        voter_token: voterToken,
      })

      setVotedItems((prev) => new Set(prev).add(itemId))
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, vote_count: item.vote_count + 1 } : item
        )
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.from('items').insert({
      project_id: project.id,
      title,
      description: description || null,
      status: 'considering',
    })

    setTitle('')
    setDescription('')
    setShowForm(false)
    setSubmitted(true)
    setLoading(false)

    // Refresh items
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('project_id', project.id)
      .in('status', ['considering', 'planned', 'in_progress'])
      .order('vote_count', { ascending: false })
      .limit(10)

    if (data) {
      setItems(data)
    }
  }

  return (
    <div className="p-4 font-sans" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-900">{project.name}</h1>
        <p className="text-sm text-gray-500">Share your feedback</p>
      </div>

      {submitted && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
          Thanks for your feedback!
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your idea..."
            required
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us more (optional)"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !title}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => {
            setShowForm(true)
            setSubmitted(false)
          }}
          className="mb-4 w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
        >
          Submit an idea
        </button>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <button
              onClick={() => handleVote(item.id)}
              className={`flex flex-col items-center px-2 py-1 rounded-lg border transition-colors ${
                votedItems.has(item.id)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-xs font-medium">{item.vote_count}</span>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">{item.title}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[item.status]}`}>
                  {statusLabels[item.status]}
                </span>
              </div>
              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-4">
            No ideas yet. Be the first to submit one!
          </p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <a
          href={`/${project.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Powered by shipped.fyi
        </a>
      </div>
    </div>
  )
}
