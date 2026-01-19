'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/supabase/types'
import { CATEGORY_COLORS, CategoryColor } from '@/lib/category-colors'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { CategoryBadge } from './CategoryBadge'

interface CategoryManagerProps {
  projectId: string
  categories: Category[]
  onCategoriesChange: (categories: Category[]) => void
}

const colorOptions = Object.keys(CATEGORY_COLORS) as CategoryColor[]

export function CategoryManager({ projectId, categories, onCategoriesChange }: CategoryManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState<CategoryColor>('gray')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

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
    setShowForm(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Delete this category? Items with this category will become uncategorized.')) return

    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', categoryId)

    if (!error) {
      onCategoriesChange(categories.filter((c) => c.id !== categoryId))
    }
  }

  const resetForm = () => {
    setName('')
    setColor('gray')
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-sand-900">Categories</h2>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              Add category
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-4 p-3 bg-sand-50 rounded-lg">
            <div className="space-y-3">
              <Input
                label="Name"
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Bug, Feature, Enhancement"
                required
              />
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full ${CATEGORY_COLORS[c].bg} ${
                        color === c ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      title={c}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={loading || !name.trim()}>
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        {categories.length > 0 ? (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-sand-50"
              >
                <CategoryBadge category={category} />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-xs text-sand-600 hover:text-sand-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <p className="text-sm text-sand-500">No categories yet. Add one to organize your items.</p>
          )
        )}
      </CardContent>
    </Card>
  )
}
