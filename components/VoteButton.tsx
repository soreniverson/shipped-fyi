'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import { ChevronUp } from 'lucide-react'

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
  const [showNotifyForm, setShowNotifyForm] = useState(false)
  const [email, setEmail] = useState('')
  const [notifyOnShip, setNotifyOnShip] = useState(false)

  const handleVote = async () => {
    if (loading) return

    if (hasVoted) {
      // Remove vote directly
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('item_id', itemId)
        .eq('voter_token', voterToken)

      if (!error) {
        setVoteCount(voteCount - 1)
        setHasVoted(false)
      }
      setLoading(false)
    } else {
      // Show notification form before voting
      setShowNotifyForm(true)
    }
  }

  const submitVote = async () => {
    setLoading(true)
    const supabase = createClient()

    const voteData: {
      item_id: string
      voter_token: string
      voter_email?: string
      notify_on_ship: boolean
    } = {
      item_id: itemId,
      voter_token: voterToken,
      notify_on_ship: notifyOnShip,
    }

    if (notifyOnShip && email) {
      voteData.voter_email = email
    }

    const { error } = await supabase.from('votes').insert(voteData)

    if (!error) {
      setVoteCount(voteCount + 1)
      setHasVoted(true)
      setShowNotifyForm(false)
      setEmail('')
      setNotifyOnShip(false)
    }

    setLoading(false)
  }

  const skipAndVote = async () => {
    setNotifyOnShip(false)
    setEmail('')
    await submitVote()
  }

  return (
    <Popover open={showNotifyForm} onOpenChange={setShowNotifyForm}>
      <PopoverTrigger asChild>
        <button
          onClick={handleVote}
          disabled={loading}
          className={`flex flex-col items-center px-3 py-2 rounded-lg border transition-colors ${
            hasVoted
              ? 'bg-primary text-white border-primary'
              : 'bg-sand-50 text-sand-600 border-sand-200 hover:border-sand-300 hover:bg-sand-100'
          } ${loading ? 'opacity-50' : ''}`}
        >
          <ChevronUp className="w-4 h-4" />
          <span className="text-sm font-medium">{voteCount}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <h4 className="font-medium text-sand-900 text-sm mb-3">Get notified when this ships?</h4>

        <label className="flex items-start gap-2 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={notifyOnShip}
            onChange={(e) => setNotifyOnShip(e.target.checked)}
            className="mt-0.5 rounded border-sand-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-sand-600">Notify me when this feature ships</span>
        </label>

        {notifyOnShip && (
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="mb-3 h-9"
          />
        )}

        <div className="flex gap-2">
          <Button
            onClick={submitVote}
            disabled={loading || (notifyOnShip && !email)}
            size="sm"
            className="flex-1"
          >
            {loading ? 'Voting...' : 'Vote'}
          </Button>
          <Button
            onClick={skipAndVote}
            disabled={loading}
            variant="ghost"
            size="sm"
          >
            Skip
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
