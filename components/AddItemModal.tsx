'use client'

import { useState, useEffect, useRef } from 'react'
import { Category, ItemStatus } from '@/lib/supabase/types'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; status: ItemStatus; categoryId: string }) => Promise<void>
  categories: Category[]
}

const statuses: ItemStatus[] = ['considering', 'planned', 'in_progress', 'shipped']

export function AddItemModal({ isOpen, onClose, onSubmit, categories }: AddItemModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ItemStatus>('considering')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
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

          <div className="border-t border-sand-100 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ItemStatus)}
                className="text-sm text-sand-600 bg-sand-50 border-0 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sand-900"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {categories.length > 0 && (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="text-sm text-sand-600 bg-sand-50 border-0 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sand-900"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-sm text-sand-600 hover:text-sand-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-4 py-1.5 bg-sand-900 text-white text-sm rounded-lg hover:bg-sand-800 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
