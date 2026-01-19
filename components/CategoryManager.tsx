'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/supabase/types'
import { CATEGORY_COLORS, CategoryColor } from '@/lib/category-colors'
import { CategoryBadge } from './CategoryBadge'

interface CategoryManagerProps {
  projectId: string
  categories: Category[]
  onCategoriesChange: (categories: Category[]) => void
}

const colorOptions = Object.keys(CATEGORY_COLORS) as CategoryColor[]

export function CategoryManager({ projectId, categories, onCategoriesChange }: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState<CategoryColor>('gray')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        resetForm()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    const supabase = createClient()

    if (editingId) {
      const { data, error } = await supabase
        .from('categories')
        .update({ name: name.trim(), color })
        .eq('id', editingId)
        .select()
        .single()

      if (!error && data) {
        onCategoriesChange(categories.map((c) => (c.id === editingId ? data : c)))
        resetForm()
      }
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert({ project_id: projectId, name: name.trim(), color })
        .select()
        .single()

      if (!error && data) {
        onCategoriesChange([...categories, data])
        resetForm()
      }
    }

    setLoading(false)
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setName(category.name)
    setColor(category.color)
    setIsOpen(true)
  }

  const handleDelete = async (categoryId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', categoryId)

    if (!error) {
      onCategoriesChange(categories.filter((c) => c.id !== categoryId))
    }
  }

  const resetForm = () => {
    setName('')
    setColor('gray')
    setIsOpen(false)
    setEditingId(null)
  }

  return (
    <div className="relative" ref={popoverRef}>
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((category) => (
          <div key={category.id} className="group relative">
            <button
              onClick={() => handleEdit(category)}
              className="focus:outline-none"
            >
              <CategoryBadge category={category} />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-sand-200 hover:bg-red-100 text-sand-500 hover:text-red-600 rounded-full hidden group-hover:flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => setIsOpen(true)}
          className="w-6 h-6 rounded-full border border-dashed border-sand-300 text-sand-400 hover:border-sand-400 hover:text-sand-500 flex items-center justify-center text-sm"
        >
          +
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-lg shadow-lg border border-sand-200 p-3 w-56">
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="w-full px-3 py-2 text-sm rounded-md border border-sand-200 focus:outline-none focus:ring-2 focus:ring-sand-900 focus:border-transparent mb-2"
            />
            <div className="flex gap-1.5 mb-3">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full ${CATEGORY_COLORS[c].bg} ${
                    color === c ? 'ring-2 ring-offset-1 ring-sand-900' : ''
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 px-3 py-1.5 bg-sand-900 text-white text-sm rounded-md hover:bg-sand-800 disabled:opacity-50"
              >
                {editingId ? 'Save' : 'Add'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 text-sand-600 text-sm hover:text-sand-900"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
