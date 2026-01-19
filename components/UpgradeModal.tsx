'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PLANS } from '@/lib/stripe'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export function UpgradeModal({ isOpen, onClose, message }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sand-400 hover:text-sand-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-sand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-sand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-sand-900 mb-2">
            Upgrade to Pro
          </h2>
          <p className="text-sand-600 text-sm">
            {message}
          </p>
        </div>

        <div className="bg-sand-50 rounded-xl p-4 mb-6">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-semibold text-sand-900">${PLANS.pro.price}</span>
            <span className="text-sand-500">/month</span>
          </div>
          <ul className="space-y-2">
            {PLANS.pro.features.slice(0, 4).map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-sand-700">
                <svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Maybe later
          </Button>
          <Button className="flex-1" onClick={handleUpgrade} disabled={loading}>
            {loading ? 'Loading...' : 'Upgrade now'}
          </Button>
        </div>
      </div>
    </div>
  )
}
