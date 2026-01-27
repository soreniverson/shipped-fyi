'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Start transitioning after 20px of scroll
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed left-0 right-0 z-50 mx-auto max-w-3xl px-4 transition-all duration-300 ease-out ${
        scrolled ? 'top-3' : 'top-6'
      }`}
    >
      <div className="bg-white/90 backdrop-blur-md rounded-full border border-sand-200 shadow-sm px-4 py-2.5 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-sand-900">
          shipped.fyi
        </Link>
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/#features" className="text-sm text-sand-600 hover:text-sand-900">
            Features
          </Link>
          <Link href="/pricing" className="text-sm text-sand-600 hover:text-sand-900">
            Pricing
          </Link>
          <Link href="/blog" className="text-sm text-sand-600 hover:text-sand-900">
            Blog
          </Link>
        </div>
        <Link href="/login">
          <Button size="sm" className="rounded-full px-4">Get started</Button>
        </Link>
      </div>
    </nav>
  )
}
