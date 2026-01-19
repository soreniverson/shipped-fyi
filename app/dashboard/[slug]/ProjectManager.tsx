'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, Item, ItemStatus, Category } from '@/lib/supabase/types'
import { StatusColumn } from '@/components/StatusColumn'
import { CategoryManager } from '@/components/CategoryManager'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

type ItemWithCategory = Item & { category?: Category | null }

interface ProjectManagerProps {
  project: Project
  initialItems: ItemWithCategory[]
  initialCategories: Category[]
}

const statuses: ItemStatus[] = ['considering', 'planned', 'in_progress', 'shipped']

export function ProjectManager({ project, initialItems, initialCategories }: ProjectManagerProps) {
  const [items, setItems] = useState<ItemWithCategory[]>(initialItems)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [showAddForm, setShowAddForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ItemStatus>('considering')
  const [categoryId, setCategoryId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('items')
      .insert({
        project_id: project.id,
        title,
        description: description || null,
        status,
        category_id: categoryId || null,
      })
      .select()
      .single()

    if (!error && data) {
      const category = categories.find((c) => c.id === data.category_id)
      setItems([{ ...data, category }, ...items])
      setTitle('')
      setDescription('')
      setStatus('considering')
      setCategoryId('')
      setShowAddForm(false)
    }
    setLoading(false)
  }

  const handleStatusChange = async (itemId: string, newStatus: ItemStatus) => {
    const item = items.find((i) => i.id === itemId)
    const oldStatus = item?.status

    const supabase = createClient()
    const updateData: { status: ItemStatus; shipped_at?: string | null } = { status: newStatus }

    if (newStatus === 'shipped' && oldStatus !== 'shipped') {
      updateData.shipped_at = new Date().toISOString()
    } else if (newStatus !== 'shipped' && oldStatus === 'shipped') {
      updateData.shipped_at = null
    }

    const { error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', itemId)

    if (!error) {
      setItems(items.map((item) =>
        item.id === itemId ? { ...item, ...updateData } : item
      ))

      // Send notifications if status changed to shipped
      if (newStatus === 'shipped' && oldStatus !== 'shipped') {
        sendShipNotifications(itemId)
      }
    }
  }

  const sendShipNotifications = async (itemId: string) => {
    try {
      await fetch('/api/notifications/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })
    } catch (error) {
      console.error('Failed to send ship notifications:', error)
    }
  }

  const handleCategoryChange = async (itemId: string, newCategoryId: string | null) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('items')
      .update({ category_id: newCategoryId })
      .eq('id', itemId)

    if (!error) {
      const category = newCategoryId ? categories.find((c) => c.id === newCategoryId) : null
      setItems(items.map((item) =>
        item.id === itemId ? { ...item, category_id: newCategoryId, category } : item
      ))
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)

    if (!error) {
      setItems(items.filter((item) => item.id !== itemId))
    }
  }

  const handleCategoriesChange = (newCategories: Category[]) => {
    setCategories(newCategories)
    // Update items if a category was deleted
    const categoryIds = new Set(newCategories.map((c) => c.id))
    setItems(items.map((item) => {
      if (item.category_id && !categoryIds.has(item.category_id)) {
        return { ...item, category_id: null, category: null }
      }
      const updatedCategory = newCategories.find((c) => c.id === item.category_id)
      if (updatedCategory && item.category?.name !== updatedCategory.name) {
        return { ...item, category: updatedCategory }
      }
      return item
    }))
  }

  const getItemsByStatus = (status: ItemStatus) =>
    items.filter((item) => item.status === status)

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3">
          {showAddForm ? (
            <Card>
              <CardHeader>
                <h2 className="font-medium text-sand-900">Add new item</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <Input
                    label="Title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short, descriptive title"
                    required
                  />
                  <Textarea
                    label="Description (optional)"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="More details about this item"
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-sand-700 mb-1">
                        Initial status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ItemStatus)}
                        className="w-full px-4 py-2.5 rounded-lg border border-sand-300 bg-white text-sand-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sand-700 mb-1">
                        Category
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-sand-300 bg-white text-sand-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">No category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={loading || !title}>
                      {loading ? 'Adding...' : 'Add item'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Button onClick={() => setShowAddForm(true)}>Add item</Button>
          )}
        </div>
        <div>
          <CategoryManager
            projectId={project.id}
            categories={categories}
            onCategoriesChange={handleCategoriesChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map((status) => (
          <StatusColumn
            key={status}
            title={status}
            status={status}
            items={getItemsByStatus(status)}
            onStatusChange={handleStatusChange}
            onCategoryChange={handleCategoryChange}
            onDelete={handleDelete}
            isOwner
            categories={categories}
          />
        ))}
      </div>
    </div>
  )
}
