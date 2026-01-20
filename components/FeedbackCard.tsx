'use client'

import { Item, ItemStatus, Category } from '@/lib/supabase/types'
import { Card, CardContent } from './ui/card'
import { CategoryBadge } from './CategoryBadge'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { ChevronUp, Trash2 } from 'lucide-react'

interface FeedbackCardProps {
  item: Item & { category?: Category | null }
  onStatusChange?: (itemId: string, newStatus: ItemStatus) => void
  onCategoryChange?: (itemId: string, categoryId: string | null) => void
  onDelete?: (itemId: string) => void
  isOwner?: boolean
  showVotes?: boolean
  onVote?: () => void
  hasVoted?: boolean
  categories?: Category[]
}

const statuses: ItemStatus[] = ['considering', 'planned', 'in_progress', 'shipped']
const statusLabels: Record<ItemStatus, string> = {
  considering: 'Considering',
  planned: 'Planned',
  in_progress: 'In Progress',
  shipped: 'Shipped',
}

export function FeedbackCard({
  item,
  onStatusChange,
  onCategoryChange,
  onDelete,
  isOwner,
  showVotes = true,
  onVote,
  hasVoted,
  categories = []
}: FeedbackCardProps) {
  return (
    <Card className="group">
      <CardContent className="py-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-sand-900 text-sm">{item.title}</h3>
              {item.category && <CategoryBadge category={item.category} />}
            </div>
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
              <ChevronUp className="w-4 h-4" />
              <span className="text-xs font-medium">{item.vote_count}</span>
            </button>
          )}
        </div>

        {isOwner && (onStatusChange || onCategoryChange) && (
          <div className="mt-3 pt-3 border-t border-sand-100 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onStatusChange && (
              <Select
                value={item.status}
                onValueChange={(value) => onStatusChange(item.id, value as ItemStatus)}
              >
                <SelectTrigger className="w-auto h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status} className="text-xs">
                      {statusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {onCategoryChange && categories.length > 0 && (
              <Select
                value={item.category_id || ''}
                onValueChange={(value) => onCategoryChange(item.id, value || null)}
              >
                <SelectTrigger className="w-auto h-7 text-xs">
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-xs">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="ml-auto h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
