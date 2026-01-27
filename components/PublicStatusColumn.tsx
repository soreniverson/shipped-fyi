'use client'

import { Item, ItemStatus, Category } from '@/lib/supabase/types'
import { Card, CardContent, Badge } from '@/components/ui'
import { CategoryBadge } from './CategoryBadge'
import { ChevronUp } from 'lucide-react'

interface PublicStatusColumnProps {
  status: ItemStatus
  items: (Item & { category?: Category | null })[]
}

const statusLabels: Record<ItemStatus, string> = {
  considering: 'Considering',
  planned: 'Planned',
  in_progress: 'In Progress',
  shipped: 'Shipped',
}

const statusVariants: Record<ItemStatus, 'considering' | 'planned' | 'in_progress' | 'shipped'> = {
  considering: 'considering',
  planned: 'planned',
  in_progress: 'in_progress',
  shipped: 'shipped',
}

export function PublicStatusColumn({ status, items }: PublicStatusColumnProps) {
  return (
    <div className="bg-sand-100/50 rounded-xl p-4 min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <Badge variant={statusVariants[status]} size="sm">
          {statusLabels[status]}
        </Badge>
        <span className="text-xs text-sand-500 bg-sand-200/50 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
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
                <div className="flex flex-col items-center px-2 py-1 rounded-lg border bg-sand-50 text-sand-600 border-sand-200">
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-xs font-medium">{item.vote_count}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-sand-400 text-center py-8">No items yet</p>
        )}
      </div>
    </div>
  )
}
