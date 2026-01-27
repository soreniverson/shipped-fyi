'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

const features = [
  {
    headline: 'Let users submit feature requests and vote on what matters most to them.',
    image: '/features/feedback-board.png',
    icon: 'feedback',
  },
  {
    headline: 'Show users what you\'re working on with a beautiful Kanban-style board.',
    image: '/features/roadmap.png',
    icon: 'roadmap',
  },
  {
    headline: 'Mark features as shipped and automatically notify everyone who voted.',
    image: '/features/changelog.png',
    icon: 'changelog',
  },
]

export function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerTop = containerRect.top
      const windowHeight = window.innerHeight

      // Calculate which feature should be active based on scroll position
      featureRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect()
          const elementCenter = rect.top + rect.height / 2

          // If element center is in the middle third of the viewport
          if (elementCenter > windowHeight * 0.3 && elementCenter < windowHeight * 0.7) {
            setActiveIndex(index)
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-semibold text-sand-900">Everything you need to ship better</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Left side - Feature list */}
        <div className="space-y-48 lg:space-y-64 py-24">
          {features.map((feature, index) => (
            <div
              key={feature.headline}
              ref={(el) => { featureRefs.current[index] = el }}
              className={`transition-opacity duration-500 ${
                activeIndex === index ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <h3 className="text-2xl sm:text-3xl font-semibold text-sand-900 leading-snug max-w-md">
                {feature.headline}
              </h3>
            </div>
          ))}
        </div>

        {/* Right side - Sticky image */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="relative aspect-[4/3] bg-sand-100 rounded-2xl border border-sand-200 overflow-hidden">
              {features.map((feature, index) => (
                <div
                  key={feature.headline}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    activeIndex === index ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {/* Placeholder for screenshots - replace with actual images later */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-sand-200 flex items-center justify-center mx-auto mb-4">
                        {feature.icon === 'feedback' && (
                          <svg className="w-8 h-8 text-sand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        )}
                        {feature.icon === 'roadmap' && (
                          <svg className="w-8 h-8 text-sand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                          </svg>
                        )}
                        {feature.icon === 'changelog' && (
                          <svg className="w-8 h-8 text-sand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-sand-400">Screenshot placeholder</p>
                      <p className="text-xs text-sand-300 mt-1">Coming soon</p>
                    </div>
                  </div>
                  {/* Uncomment when images are ready:
                  <Image
                    src={feature.image}
                    alt={feature.headline}
                    fill
                    className="object-cover"
                  />
                  */}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Show images inline */}
        <div className="lg:hidden space-y-12">
          {features.map((feature) => (
            <div key={feature.headline} className="space-y-4">
              <h3 className="text-xl font-semibold text-sand-900 leading-snug">{feature.headline}</h3>
              <div className="aspect-[4/3] bg-sand-100 rounded-xl border border-sand-200 flex items-center justify-center">
                <p className="text-sm text-sand-400">Screenshot placeholder</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
