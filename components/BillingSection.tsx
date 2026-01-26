'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

interface BillingSectionProps {
  plan: 'free' | 'pro'
  showUpgrade?: boolean
}

export function BillingSection({ plan, showUpgrade }: BillingSectionProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/checkout', { method: 'POST' })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Failed to start checkout:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error)
    } finally {
      setLoading(false)
    }
  }

  if (plan === 'pro') {
    return (
      <Button variant="secondary" onClick={handleManageBilling} disabled={loading}>
        {loading ? 'Loading...' : 'Manage billing'}
      </Button>
    )
  }

  if (showUpgrade) {
    return (
      <Button onClick={handleUpgrade} disabled={loading}>
        {loading ? 'Loading...' : 'Upgrade to Pro'}
      </Button>
    )
  }

  return null
}
