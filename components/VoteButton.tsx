'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [showNotifyForm, setShowNotifyForm] = useState(false)
  const [email, setEmail] = useState('')
  const [notifyOnShip, setNotifyOnShip] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowNotifyForm(false)
      }
    }

    if (showNotifyForm) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifyForm])

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
    <div className="relative">
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

      {showNotifyForm && (
        <div
          ref={formRef}
          className="absolute left-0 top-full mt-2 z-50 bg-white rounded-lg shadow-lg border border-sand-200 p-4 w-72"
        >
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
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 text-sm rounded-lg border border-sand-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-3"
            />
          )}

          <div className="flex gap-2">
            <button
              onClick={submitVote}
              disabled={loading || (notifyOnShip && !email)}
              className="flex-1 px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Voting...' : 'Vote'}
            </button>
            <button
              onClick={skipAndVote}
              disabled={loading}
              className="px-3 py-1.5 text-sm text-sand-600 hover:text-sand-900"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
