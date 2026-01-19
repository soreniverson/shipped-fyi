'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const startCheckout = async () => {
      try {
        const response = await fetch('/api/checkout', { method: 'POST' })
        const data = await response.json()

        if (data.url) {
          window.location.href = data.url
        } else if (data.error) {
          setError(data.error)
          // If unauthorized, redirect to login
          if (response.status === 401) {
            router.push('/login?upgrade=pro')
          }
        }
      } catch (err) {
        setError('Failed to start checkout')
        console.error(err)
      }
    }

    startCheckout()
  }, [router])

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <>
            <div className="animate-spin h-8 w-8 border-2 border-sand-900 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sand-600">Redirecting to checkout...</p>
          </>
        )}
      </div>
    </div>
  )
}
