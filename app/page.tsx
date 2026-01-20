import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-sand-50 relative">
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
          <span className="text-xl font-semibold text-sand-900">shipped.fyi</span>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm text-sand-600 hover:text-sand-900">
              Blog
            </Link>
            <Link href="/pricing" className="text-sm text-sand-600 hover:text-sand-900">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-sand-600 hover:text-sand-900">
              Sign in
            </Link>
            <Link href="/login">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-200/60 text-sand-700 text-sm mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-500"></span>
          Simple feedback for indie hackers
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold text-sand-900 tracking-tight leading-tight">
          The easiest way to collect
          <br />
          product feedback
        </h1>
        <p className="mt-6 text-lg text-sand-600 max-w-xl mx-auto">
          A simple feedback board, roadmap, and changelog. Let your users tell you what to build next.
        </p>
        <div className="mt-8">
          <Link href="/login">
            <Button size="lg">Start for free</Button>
          </Link>
        </div>
      </section>

      {/* Product Preview */}
      <section className="max-w-4xl mx-auto px-6 py-12 relative">
        <div className="bg-white rounded-2xl border border-sand-200 shadow-sm overflow-hidden">
          {/* Mock browser bar */}
          <div className="bg-sand-100 px-4 py-3 border-b border-sand-200 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-sand-300"></div>
              <div className="w-3 h-3 rounded-full bg-sand-300"></div>
              <div className="w-3 h-3 rounded-full bg-sand-300"></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-sand-200/60 rounded px-3 py-1 text-xs text-sand-500">shipped.fyi/your-product</div>
            </div>
          </div>
          {/* Mock product UI */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="h-5 w-32 bg-sand-200 rounded mb-2"></div>
                <div className="h-3 w-48 bg-sand-100 rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {['Considering', 'Planned', 'In Progress', 'Shipped'].map((status, i) => (
                <div key={status} className="bg-sand-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      status === 'Shipped' ? 'bg-lime-100 text-lime-800' : 'bg-sand-200 text-sand-700'
                    }`}>
                      {status}
                    </span>
                    <span className="text-xs text-sand-400 bg-sand-200/50 px-1.5 py-0.5 rounded-full">{i === 0 ? 3 : i}</span>
                  </div>
                  <div className="space-y-2">
                    {i === 0 && (
                      <>
                        <div className="bg-white rounded-lg p-3 border border-sand-100">
                          <div className="flex justify-between items-start">
                            <div className="h-3 w-24 bg-sand-200 rounded"></div>
                            <div className="flex flex-col items-center px-1.5 py-1 rounded bg-sand-100 text-sand-500">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                              <span className="text-xs">12</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-sand-100">
                          <div className="flex justify-between items-start">
                            <div className="h-3 w-20 bg-sand-200 rounded"></div>
                            <div className="flex flex-col items-center px-1.5 py-1 rounded bg-sand-100 text-sand-500">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                              <span className="text-xs">8</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {i === 1 && (
                      <div className="bg-white rounded-lg p-3 border border-sand-100">
                        <div className="flex justify-between items-start">
                          <div className="h-3 w-16 bg-sand-200 rounded"></div>
                          <div className="flex flex-col items-center px-1.5 py-1 rounded bg-sand-100 text-sand-500">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            <span className="text-xs">5</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {i === 3 && (
                      <div className="bg-white rounded-lg p-3 border border-sand-100">
                        <div className="flex justify-between items-start">
                          <div className="h-3 w-20 bg-sand-200 rounded"></div>
                          <div className="flex flex-col items-center px-1.5 py-1 rounded bg-lime-100 text-lime-700">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-4xl mx-auto px-6 py-16 relative">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6">
            <div className="w-10 h-10 rounded-xl bg-sand-200 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-sand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="font-semibold text-sand-900 mb-2">Collect ideas</h3>
            <p className="text-sm text-sand-600 leading-relaxed">
              Let users submit feature requests. They vote on what matters most to them.
            </p>
          </div>

          <div className="p-6">
            <div className="w-10 h-10 rounded-xl bg-sand-200 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-sand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-sand-900 mb-2">Share your roadmap</h3>
            <p className="text-sm text-sand-600 leading-relaxed">
              Show users what you&apos;re working on. Keep them in the loop with a public roadmap.
            </p>
          </div>

          <div className="p-6">
            <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-lime-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-sand-900 mb-2">Ship & celebrate</h3>
            <p className="text-sm text-sand-600 leading-relaxed">
              Mark features as shipped. Your changelog updates automatically.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16 relative">
        <h2 className="text-xl font-semibold text-sand-900 mb-8">How it works</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { step: '1', title: 'Create a board', desc: 'Sign up and create a feedback board for your product in seconds.' },
            { step: '2', title: 'Share the link', desc: 'Users submit ideas and vote on features without signing up.' },
            { step: '3', title: 'Prioritize', desc: 'See what users want most. Move items through your workflow.' },
            { step: '4', title: 'Ship it', desc: 'Mark features as shipped. Your changelog updates automatically.' },
          ].map((item, index) => (
            <div key={item.step} className="bg-white border border-sand-200 rounded-xl p-5 flex gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium shrink-0 ${
                index === 3 ? 'bg-lime-100 text-lime-800' : 'bg-sand-100 text-sand-600'
              }`}>
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-sand-900">{item.title}</h3>
                <p className="text-sm text-sand-600 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 relative">
        <div className="bg-sand-100 rounded-2xl p-10 text-center border border-sand-200">
          <h2 className="text-xl font-semibold text-sand-900 mb-3">
            Ready to ship better products?
          </h2>
          <p className="text-sand-600 mb-6 text-sm">
            Start collecting feedback today. Free to get started.
          </p>
          <Link href="/login">
            <Button size="lg">Get started</Button>
          </Link>
        </div>
      </section>

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
              <Link href="/login" className="text-sm text-sand-600 hover:text-sand-900">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
