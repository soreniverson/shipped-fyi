import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CheckoutButton } from '@/components/CheckoutButton'
import { PLANS } from '@/lib/plans'

export default function PricingPage() {
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
          <Link href="/" className="text-xl font-semibold text-sand-900">shipped.fyi</Link>
          <div className="flex items-center gap-4">
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

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 relative">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-semibold text-sand-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-sand-600">
            Start free, upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-sand-100">
            <div className="mb-8">
              <p className="text-sm font-medium text-sand-500 uppercase tracking-wide mb-2">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-semibold text-sand-900">$0</span>
                <span className="text-sand-500">/month</span>
              </div>
              <p className="text-sand-600 mt-3 text-sm">Perfect for getting started</p>
            </div>
            <ul className="space-y-4 mb-8">
              {PLANS.free.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sand-700">
                  <svg className="w-5 h-5 text-sand-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <Button variant="secondary" className="w-full">Get started free</Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-sand-900 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-lime-400 text-sand-900 text-xs font-semibold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <div className="mb-8">
              <p className="text-sm font-medium text-sand-400 uppercase tracking-wide mb-2">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-semibold">${PLANS.pro.price}</span>
                <span className="text-sand-400">/month</span>
              </div>
              <p className="text-sand-400 mt-3 text-sm">For growing products</p>
            </div>
            <ul className="space-y-4 mb-8">
              {PLANS.pro.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sand-200">
                  <svg className="w-5 h-5 text-lime-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <CheckoutButton className="w-full bg-white text-sand-900 hover:bg-sand-100" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16 relative">
        <h2 className="text-2xl font-semibold text-sand-900 mb-12 text-center">
          Questions & answers
        </h2>
        <div className="max-w-2xl mx-auto divide-y divide-sand-200">
          {[
            {
              q: 'Can I try Pro features before paying?',
              a: 'The free plan includes all core features. Upgrade to Pro when you need unlimited boards or want to embed the widget.',
            },
            {
              q: 'What happens if I exceed the free limits?',
              a: "You'll see a prompt to upgrade. Your existing data is always safe — you just won't be able to create new items until you upgrade or delete some.",
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes, cancel anytime. Your subscription stays active until the end of the billing period, then downgrades to Free.',
            },
            {
              q: 'Do you offer refunds?',
              a: "If you're not happy within the first 14 days, contact us for a full refund.",
            },
          ].map((faq, i) => (
            <div key={faq.q} className={`py-6 ${i === 0 ? 'pt-0' : ''}`}>
              <h3 className="font-medium text-sand-900 mb-2">{faq.q}</h3>
              <p className="text-sand-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
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
