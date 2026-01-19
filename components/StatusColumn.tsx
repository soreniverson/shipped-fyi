'use client'

import { Item, ItemStatus } from '@/lib/supabase/types'
import { FeedbackCard } from './FeedbackCard'

interface StatusColumnProps {
  title: string
  status: ItemStatus
  items: Item[]
  onStatusChange: (itemId: string, newStatus: ItemStatus) => void
  onDelete: (itemId: string) => void
  isOwner?: boolean
}

const statusColors: Record<ItemStatus, string> = {
  considering: 'bg-sand-200 text-sand-700',
  planned: 'bg-sand-200 text-sand-700',
  in_progress: 'bg-sand-200 text-sand-700',
  shipped: 'bg-lime-100 text-lime-800',
}

const statusLabels: Record<ItemStatus, string> = {
  considering: 'Considering',
  planned: 'Planned',
  in_progress: 'In Progress',
  shipped: 'Shipped',
}

export function StatusColumn({ title, status, items, onStatusChange, onDelete, isOwner }: StatusColumnProps) {
  return (
    <div className="bg-sand-100/50 rounded-xl p-4 min-h-[200px]">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
        <span className="text-xs text-sand-500 bg-sand-200/50 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <FeedbackCard
            key={item.id}
            item={item}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            isOwner={isOwner}
          />
        ))}
        {items.length === 0 && (
          <p className="text-sm text-sand-400 text-center py-8">No items</p>
        )}
      </div>
    </div>
  )
}
