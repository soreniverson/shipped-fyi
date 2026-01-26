'use client'

import { Item, ItemStatus, Category } from '@/lib/supabase/types'
import { FeedbackCard } from './FeedbackCard'
import { Badge } from '@/components/ui'

interface StatusColumnProps {
  title: string
  status: ItemStatus
  items: (Item & { category?: Category | null })[]
  onStatusChange: (itemId: string, newStatus: ItemStatus) => void
  onCategoryChange?: (itemId: string, categoryId: string | null) => void
  onDelete: (itemId: string) => void
  isOwner?: boolean
  categories?: Category[]
}

const statusLabels: Record<ItemStatus, string> = {
  considering: 'Considering',
  planned: 'Planned',
  in_progress: 'In Progress',
  shipped: 'Shipped',
}

export function StatusColumn({ title, status, items, onStatusChange, onCategoryChange, onDelete, isOwner, categories = [] }: StatusColumnProps) {
  return (
    <div className="bg-sand-100/50 rounded-xl p-4 min-h-[200px]">
      <div className="flex items-center justify-between mb-4">
        <Badge variant={status === 'shipped' ? 'shipped' : 'default'} size="sm">
          {statusLabels[status]}
        </Badge>
        <span className="text-xs text-sand-500 bg-sand-200/50 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <FeedbackCard
            key={item.id}
            item={item}
            onStatusChange={onStatusChange}
            onCategoryChange={onCategoryChange}
            onDelete={onDelete}
            isOwner={isOwner}
            categories={categories}
          />
        ))}
        {items.length === 0 && (
          <p className="text-sm text-sand-400 text-center py-8">No items</p>
        )}
      </div>
    </div>
  )
}
