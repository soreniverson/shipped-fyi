import Link from 'next/link'
import { Button } from '@/components/ui'
import { HeroBackground } from '@/components/HeroBackground'
import { StickyNav } from '@/components/StickyNav'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-sand-100">
      {/* Floating Nav - Starts with padding, locks on scroll */}
      <StickyNav />

      {/* Hero Section with inset container */}
      <div className="px-3 pt-3">
        <div className="relative rounded-3xl overflow-hidden min-h-[85vh] flex items-center">
          {/* Background image with scroll zoom */}
          <HeroBackground />

          {/* Hero Content - Text Left, Image Right */}
          <div className="relative max-w-6xl mx-auto px-6 py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Text */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-sand-900 tracking-tight leading-[1.1]">
                  Easily collect
                  <br />
                  product feedback
                </h1>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/login">
                    <Button size="lg" className="rounded-full px-8">Start for free</Button>
                  </Link>
                  <Link href="/#how-it-works" className="text-sm font-medium text-sand-600 hover:text-sand-900 flex items-center gap-1">
                    See how it works
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Right side - Product Image */}
              <div className="relative lg:pl-8">
                <div className="relative">
                  {/* Browser window mockup */}
                  <div className="bg-white rounded-2xl border border-sand-200 shadow-2xl shadow-sand-900/10 overflow-hidden">
                    {/* Browser bar */}
                    <div className="bg-sand-100 px-4 py-3 border-b border-sand-200 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="bg-white rounded-lg px-4 py-1 text-xs text-sand-500 border border-sand-200">
                          shipped.fyi/acme
                        </div>
                      </div>
                    </div>
                    {/* Product UI */}
                    <div className="p-4 bg-sand-50">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { status: 'In Progress', color: 'blue', items: [{ title: 'Dark mode', votes: 24 }, { title: 'API access', votes: 18 }] },
                          { status: 'Planned', color: 'violet', items: [{ title: 'Mobile app', votes: 31 }] },
                        ].map((column) => (
                          <div key={column.status} className="bg-sand-100/80 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                column.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'
                              }`}>
                                {column.status}
                              </span>
                              <span className="text-xs text-sand-400">{column.items.length}</span>
                            </div>
                            <div className="space-y-2">
                              {column.items.map((item) => (
                                <div key={item.title} className="bg-white rounded-lg p-3 border border-sand-100 shadow-sm">
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="text-sm font-medium text-sand-900">{item.title}</span>
                                    <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-sand-50 border border-sand-100">
                                      <svg className="w-3 h-3 text-sand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                      </svg>
                                      <span className="text-xs font-medium text-sand-600">{item.votes}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Floating notification card */}
                  <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-sand-200 p-3 max-w-[200px]">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-lime-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-sand-900">Dark mode shipped!</p>
                        <p className="text-xs text-sand-500">24 voters notified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof / Stats */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            {/* Apple HIG Orange #FF9500 */}
            <svg className="w-10 h-10 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FF9500" />
            </svg>
            <p className="text-2xl font-semibold text-sand-900">5 min setup</p>
            <p className="text-sm text-sand-500 mt-1">Create your board instantly</p>
          </div>
          <div>
            {/* Apple HIG Blue #007AFF */}
            <svg className="w-10 h-10 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="4" fill="#007AFF" />
              <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" fill="#007AFF" />
              <circle cx="17" cy="7" r="3" fill="#007AFF" opacity="0.5" />
              <path d="M17 14a3 3 0 013 3v2h-4" fill="#007AFF" opacity="0.5" />
            </svg>
            <p className="text-2xl font-semibold text-sand-900">No signup required</p>
            <p className="text-sm text-sand-500 mt-1">Users vote without accounts</p>
          </div>
          <div>
            {/* Apple HIG Green #34C759 */}
            <svg className="w-10 h-10 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#34C759" />
              <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-2xl font-semibold text-sand-900">Free tier</p>
            <p className="text-sm text-sand-500 mt-1">Start without a credit card</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-3 pb-3">
        <div className="bg-white rounded-3xl border border-sand-200">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-sand-500 mb-2">Features</p>
              <h2 className="text-3xl font-semibold text-sand-900">Everything you need to ship better</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-sand-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-sand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-sand-900 mb-2">Feedback board</h3>
                <p className="text-sm text-sand-600 leading-relaxed">
                  Let users submit feature requests and vote on what matters most to them.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-sand-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-sand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <h3 className="font-semibold text-sand-900 mb-2">Public roadmap</h3>
                <p className="text-sm text-sand-600 leading-relaxed">
                  Show users what you&apos;re working on. Keep them in the loop with a Kanban-style board.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-lime-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-lime-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-sand-900 mb-2">Changelog</h3>
                <p className="text-sm text-sand-600 leading-relaxed">
                  Mark features as shipped and automatically notify everyone who voted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-sand-500 mb-2">How it works</p>
          <h2 className="text-3xl font-semibold text-sand-900">Four steps to better products</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Create a board', desc: 'Sign up and create your feedback board in seconds.' },
            { step: '2', title: 'Share the link', desc: 'Users submit ideas and vote without signing up.' },
            { step: '3', title: 'Prioritize', desc: 'See what users want most. Drag items through your workflow.' },
            { step: '4', title: 'Ship it', desc: 'Mark as shipped. Voters get notified automatically.' },
          ].map((item, index) => (
            <div key={item.step} className="bg-white border border-sand-200 rounded-2xl p-5 text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mx-auto mb-4 ${
                index === 3 ? 'bg-lime-100 text-lime-800' : 'bg-sand-100 text-sand-600'
              }`}>
                {item.step}
              </div>
              <h3 className="font-semibold text-sand-900 mb-1">{item.title}</h3>
              <p className="text-sm text-sand-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-3 pb-3">
        <div className="bg-sand-900 rounded-3xl">
          <div className="max-w-3xl mx-auto px-6 py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
              Ready to ship better products?
            </h2>
            <p className="text-sand-400 mb-8 max-w-md mx-auto">
              Start collecting feedback today. Free to get started, no credit card required.
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="rounded-full px-8">
                Get started for free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <span className="text-sand-900 font-semibold text-lg">shipped.fyi</span>
            <p className="text-sand-500 text-sm mt-1">Simple feedback for indie hackers</p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
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
      </footer>
    </div>
  )
}
