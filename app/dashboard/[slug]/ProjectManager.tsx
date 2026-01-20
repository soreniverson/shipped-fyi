'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, Item, ItemStatus, Category } from '@/lib/supabase/types'
import { StatusColumn } from '@/components/StatusColumn'
import { CategoryManager } from '@/components/CategoryManager'
import { AddItemModal } from '@/components/AddItemModal'
import { Button } from '@/components/ui/button'

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
  const [showAddModal, setShowAddModal] = useState(false)

  const handleAddItem = async (data: { title: string; description: string; status: ItemStatus; categoryId: string }) => {
    const supabase = createClient()
    const { data: newItem, error } = await supabase
      .from('items')
      .insert({
        project_id: project.id,
        title: data.title,
        description: data.description || null,
        status: data.status,
        category_id: data.categoryId || null,
      })
      .select()
      .single()

    if (!error && newItem) {
      const category = categories.find((c) => c.id === newItem.category_id)
      setItems([{ ...newItem, category }, ...items])
    }
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
    if (!confirm('Delete this item?')) return

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowAddModal(true)} size="sm">
            Add item
          </Button>
          <div className="h-5 w-px bg-sand-200" />
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

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddItem}
        categories={categories}
      />
    </div>
  )
}
