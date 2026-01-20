'use client'

import { useState, useEffect, useRef } from 'react'
import { Category, ItemStatus } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; status: ItemStatus; categoryId: string }) => Promise<void>
  categories: Category[]
}

const statuses: ItemStatus[] = ['considering', 'planned', 'in_progress', 'shipped']
const statusLabels: Record<ItemStatus, string> = {
  considering: 'Considering',
  planned: 'Planned',
  in_progress: 'In Progress',
  shipped: 'Shipped',
}

export function AddItemModal({ isOpen, onClose, onSubmit, categories }: AddItemModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ItemStatus>('considering')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    await onSubmit({ title, description, status, categoryId })
    setLoading(false)
    setTitle('')
    setDescription('')
    setStatus('considering')
    setCategoryId('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0">
        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be built?"
              className="w-full text-lg font-medium text-sand-900 placeholder:text-sand-400 border-0 p-0 focus:outline-none focus:ring-0"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows={3}
              className="w-full mt-3 text-sm text-sand-600 placeholder:text-sand-400 border-0 p-0 focus:outline-none focus:ring-0 resize-none"
            />
          </div>

          <DialogFooter className="border-t border-sand-100 px-5 py-3 flex items-center justify-between sm:justify-between">
            <div className="flex items-center gap-3">
              <Select value={status} onValueChange={(value) => setStatus(value as ItemStatus)}>
                <SelectTrigger className="w-auto h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {statusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.length > 0 && (
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-auto h-8 text-xs">
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
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading || !title.trim()}
              >
                {loading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
