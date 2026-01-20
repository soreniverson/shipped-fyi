'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form-input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { UpgradeModal } from '@/components/UpgradeModal'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState('')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    setSlug(slugify(newName))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check limit first
    const limitResponse = await fetch('/api/limits/project')
    const limitData = await limitResponse.json()

    if (!limitData.allowed) {
      setUpgradeMessage(limitData.message)
      setShowUpgradeModal(true)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to create a project')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('projects').insert({
      name,
      slug,
      owner_id: user.id,
    })

    if (insertError) {
      if (insertError.code === '23505') {
        setError('A project with this URL already exists')
      } else {
        setError(insertError.message)
      }
      setLoading(false)
      return
    }

    router.push(`/dashboard/${slug}`)
  }

  return (
    <div className="max-w-lg mx-auto">
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        message={upgradeMessage}
      />
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold text-sand-900">Create a new project</h1>
          <p className="text-sm text-sand-600 mt-1">Set up a feedback board for your product</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Project name"
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="My Awesome Product"
              required
            />

            <Input
              label="URL slug"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="my-awesome-product"
              required
            />
            <p className="text-xs text-sand-500 -mt-2">
              Your board will be available at /{slug}
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading || !name || !slug}>
                {loading ? 'Creating...' : 'Create project'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
