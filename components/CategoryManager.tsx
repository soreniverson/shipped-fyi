'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/supabase/types'
import { CATEGORY_COLORS, CategoryColor } from '@/lib/category-colors'
import { CategoryBadge } from './CategoryBadge'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import { Plus, X } from 'lucide-react'

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
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
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
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="w-6 h-6 rounded-full border border-dashed border-sand-300 text-sand-400 hover:border-sand-400 hover:text-sand-500 flex items-center justify-center"
          >
            <Plus className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start">
          <form onSubmit={handleSubmit}>
            <Input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="mb-2 h-9"
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
              <Button
                type="submit"
                size="sm"
                disabled={loading || !name.trim()}
                className="flex-1"
              >
                {editingId ? 'Save' : 'Add'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}
