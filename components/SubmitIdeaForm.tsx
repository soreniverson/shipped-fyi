'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, FormInput as Input, FormTextarea as Textarea } from '@/components/ui'

interface SubmitIdeaFormProps {
  projectId: string
  onSubmit: () => void
}

export function SubmitIdeaForm({ projectId, onSubmit }: SubmitIdeaFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: insertError } = await supabase.from('items').insert({
      project_id: projectId,
      title,
      description: description || null,
      status: 'considering',
    })

    if (insertError) {
      setError('Failed to submit your idea. Please try again.')
      setLoading(false)
      return
    }

    setTitle('')
    setDescription('')
    setIsOpen(false)
    setLoading(false)
    onSubmit()
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        Submit an idea
      </Button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-sand-200 p-6">
      <h2 className="text-lg font-medium text-sand-900 mb-4">Submit your idea</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your idea?"
          required
        />
        <Textarea
          label="Description (optional)"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us more about your idea..."
          rows={3}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading || !title}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
