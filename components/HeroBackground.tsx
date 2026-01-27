'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

export function HeroBackground() {
  const [scrollY, setScrollY] = useState(0)
  const [heroHeight, setHeroHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    const updateHeight = () => {
      if (containerRef.current) {
        setHeroHeight(containerRef.current.parentElement?.offsetHeight || window.innerHeight)
      }
    }

    updateHeight()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateHeight)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  // Calculate zoom: starts at 1, increases smoothly until hero is out of viewport
  // Max zoom of ~1.12 when scrolled past the hero section
  const maxScroll = heroHeight || 800
  const progress = Math.min(scrollY / maxScroll, 1)
  const scale = 1 + progress * 0.12

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <Image
        src="/hero-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        style={{ transform: `scale(${scale})`, transition: 'transform 0.1s ease-out' }}
      />
      {/* White gradient overlay - more opaque at bottom, fades to transparent at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-transparent" />
    </div>
  )
}
