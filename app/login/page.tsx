'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const searchParams = useSearchParams()
  const upgrade = searchParams.get('upgrade')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    // If upgrading, redirect to checkout after auth; otherwise go to dashboard
    const nextPath = upgrade === 'pro' ? '/checkout' : '/dashboard'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const redirectUrl = `${baseUrl}/auth/callback?next=${nextPath}`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Check your email for the login link!' })
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-sand-200 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-sand-900">
          Sign in
        </h1>
        <p className="text-sand-600 mt-2">
          {upgrade === 'pro' ? 'Sign in to upgrade to Pro' : 'Sign in to manage your feedback boards'}
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-sand-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-sand-300 bg-white text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-sand-900 text-white rounded-lg font-medium hover:bg-sand-800 focus:outline-none focus:ring-2 focus:ring-sand-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending...' : 'Send magic link'}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-sand-500">
        We&apos;ll send you a magic link to sign in. No password needed.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-sand-50 relative flex flex-col">
      {/* Vertical grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="max-w-4xl mx-auto h-full relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-sand-200"></div>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-sand-200"></div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-sand-200 bg-sand-50/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-sand-900">shipped.fyi</Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm text-sand-600 hover:text-sand-900">
              Blog
            </Link>
            <Link href="/pricing" className="text-sm text-sand-600 hover:text-sand-900">
              Pricing
            </Link>
            <Link href="/login">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md">
          <Suspense fallback={
            <div className="bg-white rounded-xl shadow-sm border border-sand-200 p-8">
              <div className="text-center">
                <div className="animate-pulse h-8 w-32 bg-sand-200 rounded mx-auto mb-4"></div>
                <div className="animate-pulse h-4 w-48 bg-sand-100 rounded mx-auto"></div>
              </div>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-sand-200 relative">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-sand-900 font-medium">shipped.fyi</span>
              <p className="text-sand-500 text-sm mt-1">Simple feedback for indie hackers</p>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/blog" className="text-sm text-sand-600 hover:text-sand-900">
                Blog
              </Link>
              <Link href="/updates" className="text-sm text-sand-600 hover:text-sand-900">
                Updates
              </Link>
              <Link href="/pricing" className="text-sm text-sand-600 hover:text-sand-900">
                Pricing
              </Link>
              <Link href="/terms" className="text-sm text-sand-600 hover:text-sand-900">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-sand-600 hover:text-sand-900">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
