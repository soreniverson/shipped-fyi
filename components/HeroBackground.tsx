'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function HeroBackground() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate zoom: starts at 1, increases subtly as you scroll
  // Max zoom of 1.15 at 500px scroll
  const scale = 1 + Math.min(scrollY / 500, 0.15) * 0.5

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="/hero-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center transition-transform duration-100 ease-out"
        style={{ transform: `scale(${scale})` }}
      />
      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/60" />
    </div>
  )
}
