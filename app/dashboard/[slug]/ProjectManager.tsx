'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, Item, ItemStatus } from '@/lib/supabase/types'
import { StatusColumn } from '@/components/StatusColumn'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

interface ProjectManagerProps {
  project: Project
  initialItems: Item[]
}

const statuses: ItemStatus[] = ['considering', 'planned', 'in_progress', 'shipped']

export function ProjectManager({ project, initialItems }: ProjectManagerProps) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [showAddForm, setShowAddForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ItemStatus>('considering')
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
      })
      .select()
      .single()

    if (!error && data) {
      setItems([data, ...items])
      setTitle('')
      setDescription('')
      setStatus('considering')
      setShowAddForm(false)
    }
    setLoading(false)
  }

  const handleStatusChange = async (itemId: string, newStatus: ItemStatus) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('items')
      .update({ status: newStatus })
      .eq('id', itemId)

    if (!error) {
      setItems(items.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
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

  const getItemsByStatus = (status: ItemStatus) =>
    items.filter((item) => item.status === status)

  return (
    <div>
      <div className="mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map((status) => (
          <StatusColumn
            key={status}
            title={status}
            status={status}
            items={getItemsByStatus(status)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            isOwner
          />
        ))}
      </div>
    </div>
  )
}
