'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface VoteButtonProps {
  itemId: string
  initialVoteCount: number
  initialHasVoted: boolean
  voterToken: string
}

export function VoteButton({ itemId, initialVoteCount, initialHasVoted, voterToken }: VoteButtonProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [hasVoted, setHasVoted] = useState(initialHasVoted)
  const [loading, setLoading] = useState(false)

  const handleVote = async () => {
    if (loading) return
    setLoading(true)

    const supabase = createClient()

    if (hasVoted) {
      // Remove vote
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('item_id', itemId)
        .eq('voter_token', voterToken)

      if (!error) {
        setVoteCount(voteCount - 1)
        setHasVoted(false)
      }
    } else {
      // Add vote
      const { error } = await supabase.from('votes').insert({
        item_id: itemId,
        voter_token: voterToken,
      })

      if (!error) {
        setVoteCount(voteCount + 1)
        setHasVoted(true)
      }
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className={`flex flex-col items-center px-3 py-2 rounded-lg border transition-colors ${
        hasVoted
          ? 'bg-primary text-white border-primary'
          : 'bg-sand-50 text-sand-600 border-sand-200 hover:border-sand-300 hover:bg-sand-100'
      } ${loading ? 'opacity-50' : ''}`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
      <span className="text-sm font-medium">{voteCount}</span>
    </button>
  )
}
