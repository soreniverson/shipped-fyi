'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CheckoutButtonProps {
  variant?: 'primary' | 'secondary'
  className?: string
}

export function CheckoutButton({ variant = 'primary', className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/checkout', { method: 'POST' })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned:', data)
      }
    } catch (error) {
      console.error('Failed to start checkout:', error)
    } finally {
      setLoading(false)
    }
  }

  // Still checking auth status
  if (isLoggedIn === null) {
    return (
      <Button variant={variant === 'primary' ? undefined : 'secondary'} className={className} disabled>
        Loading...
      </Button>
    )
  }

  // Not logged in - redirect to login with upgrade intent
  if (!isLoggedIn) {
    return (
      <Link href="/login?upgrade=pro">
        <Button variant={variant === 'primary' ? undefined : 'secondary'} className={className}>
          Upgrade to Pro
        </Button>
      </Link>
    )
  }

  // Logged in - trigger checkout
  return (
    <Button
      variant={variant === 'primary' ? undefined : 'secondary'}
      className={className}
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? 'Loading...' : 'Upgrade to Pro'}
    </Button>
  )
}
