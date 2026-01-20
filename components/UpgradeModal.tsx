'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PLANS } from '@/lib/plans'
import { Zap, Check } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export function UpgradeModal({ isOpen, onClose, message }: UpgradeModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="w-12 h-12 bg-sand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-sand-600" />
          </div>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <div className="bg-sand-50 rounded-xl p-4">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-semibold text-sand-900">${PLANS.pro.price}</span>
            <span className="text-sand-500">/month</span>
          </div>
          <ul className="space-y-2">
            {PLANS.pro.features.slice(0, 4).map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-sand-700">
                <Check className="w-4 h-4 text-lime-600" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Maybe later
          </Button>
          <Button className="flex-1" onClick={handleUpgrade} disabled={loading}>
            {loading ? 'Loading...' : 'Upgrade now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
