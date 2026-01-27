'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading')

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      return
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch(`/api/unsubscribe?token=${token}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setStatus('success')
        } else {
          const data = await response.json()
          if (data.error === 'Invalid token') {
            setStatus('invalid')
          } else {
            setStatus('error')
          }
        }
      } catch {
        setStatus('error')
      }
    }

    unsubscribe()
  }, [token])

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-sand-200 p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-sand-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-sand-900 mb-2">
              Processing...
            </h1>
            <p className="text-sand-600">
              Please wait while we process your request.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-sand-900 mb-2">
              Unsubscribed Successfully
            </h1>
            <p className="text-sand-600 mb-6">
              You will no longer receive email notifications when features you voted for are shipped.
            </p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </>
        )}

        {status === 'invalid' && (
          <>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-sand-900 mb-2">
              Invalid Link
            </h1>
            <p className="text-sand-600 mb-6">
              This unsubscribe link is invalid or has expired. If you still want to unsubscribe, please contact support.
            </p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-sand-900 mb-2">
              Something Went Wrong
            </h1>
            <p className="text-sand-600 mb-6">
              We couldn&apos;t process your unsubscribe request. Please try again or contact support.
            </p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-sand-200 p-8 text-center">
        <div className="w-12 h-12 border-4 border-sand-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-sand-900 mb-2">
          Loading...
        </h1>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnsubscribeContent />
    </Suspense>
  )
}
