'use client'

import { Item, ItemStatus } from '@/lib/supabase/types'
import { Card, CardContent } from './ui/Card'

interface FeedbackCardProps {
  item: Item
  onStatusChange?: (itemId: string, newStatus: ItemStatus) => void
  onDelete?: (itemId: string) => void
  isOwner?: boolean
  showVotes?: boolean
  onVote?: () => void
  hasVoted?: boolean
}

const statuses: ItemStatus[] = ['considering', 'planned', 'in_progress', 'shipped']

export function FeedbackCard({
  item,
  onStatusChange,
  onDelete,
  isOwner,
  showVotes = true,
  onVote,
  hasVoted
}: FeedbackCardProps) {
  return (
    <Card className="group">
      <CardContent className="py-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sand-900 text-sm">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-sand-600 mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>
          {showVotes && (
            <button
              onClick={onVote}
              disabled={!onVote}
              className={`flex flex-col items-center px-2 py-1 rounded-lg border transition-colors ${
                hasVoted
                  ? 'bg-primary text-white border-primary'
                  : 'bg-sand-50 text-sand-600 border-sand-200 hover:border-sand-300'
              } ${!onVote ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-xs font-medium">{item.vote_count}</span>
            </button>
          )}
        </div>

        {isOwner && onStatusChange && (
          <div className="mt-3 pt-3 border-t border-sand-100 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <select
              value={item.status}
              onChange={(e) => onStatusChange(item.id, e.target.value as ItemStatus)}
              className="text-xs px-2 py-1 rounded border border-sand-200 bg-white text-sand-700 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
            {onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="text-xs text-red-600 hover:text-red-700 ml-auto"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
