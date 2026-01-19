'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, Item } from '@/lib/supabase/types'
import { getVoterToken } from '@/lib/voter-token'
import { VoteButton } from '@/components/VoteButton'
import { SubmitIdeaForm } from '@/components/SubmitIdeaForm'
import { Card, CardContent } from '@/components/ui/Card'

interface PublicBoardProps {
  project: Project
  initialItems: Item[]
}

const statusLabels: Record<string, string> = {
  considering: 'Considering',
  planned: 'Planned',
  in_progress: 'In Progress',
}

const statusColors: Record<string, string> = {
  considering: 'bg-amber-100 text-amber-700',
  planned: 'bg-violet-100 text-violet-700',
  in_progress: 'bg-blue-100 text-blue-700',
}

export function PublicBoard({ project, initialItems }: PublicBoardProps) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set())
  const [voterToken, setVoterToken] = useState('')

  useEffect(() => {
    const token = getVoterToken()
    setVoterToken(token)

    // Fetch user's votes
    const fetchVotes = async () => {
      const supabase = createClient()
      const { data: votes } = await supabase
        .from('votes')
        .select('item_id')
        .eq('voter_token', token)

      if (votes) {
        setVotedItems(new Set(votes.map((v) => v.item_id)))
      }
    }

    fetchVotes()
  }, [])

  const refreshItems = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('project_id', project.id)
      .in('status', ['considering', 'planned', 'in_progress'])
      .order('vote_count', { ascending: false })

    if (data) {
      setItems(data)
    }
  }

  return (
    <div className="space-y-6">
      <SubmitIdeaForm projectId={project.id} onSubmit={refreshItems} />

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="py-4">
              <div className="flex gap-4">
                <VoteButton
                  itemId={item.id}
                  initialVoteCount={item.vote_count}
                  initialHasVoted={votedItems.has(item.id)}
                  voterToken={voterToken}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sand-900">{item.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-sand-600 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sand-600">No ideas yet. Be the first to submit one!</p>
          </div>
        )}
      </div>
    </div>
  )
}
