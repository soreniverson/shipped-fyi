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
      <header className="relative">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-sand-900">shipped.fyi</Link>
          <div className="flex items-center gap-4">
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
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 relative">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-sand-900 mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-sand-600">
            Start free, upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white border border-sand-200 rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-sand-900">{PLANS.free.name}</h2>
              <div className="mt-2">
                <span className="text-3xl font-semibold text-sand-900">$0</span>
                <span className="text-sand-500">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {PLANS.free.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-sand-700">
                  <svg className="w-4 h-4 text-sand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <Button variant="secondary" className="w-full">Get started</Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-white border-2 border-sand-900 rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-sand-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                Most popular
              </span>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-sand-900">{PLANS.pro.name}</h2>
              <div className="mt-2">
                <span className="text-3xl font-semibold text-sand-900">${PLANS.pro.price}</span>
                <span className="text-sand-500">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {PLANS.pro.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-sand-700">
                  <svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <CheckoutButton className="w-full" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16 relative">
        <h2 className="text-xl font-semibold text-sand-900 mb-8 text-center">
          Frequently asked questions
        </h2>
        <div className="max-w-2xl mx-auto space-y-6">
          {[
            {
              q: 'Can I try Pro features before paying?',
              a: 'The free plan includes all core features. Upgrade to Pro when you need unlimited boards or want to embed the widget.',
            },
            {
              q: 'What happens if I exceed the free limits?',
              a: "You'll see a prompt to upgrade. Your existing data is always safe - you just won't be able to create new items until you upgrade or delete some.",
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes, cancel anytime. Your subscription stays active until the end of the billing period, then downgrades to Free.',
            },
            {
              q: 'Do you offer refunds?',
              a: "If you're not happy within the first 14 days, contact us for a full refund.",
            },
          ].map((faq) => (
            <div key={faq.q} className="bg-white border border-sand-200 rounded-xl p-5">
              <h3 className="font-medium text-sand-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-sand-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sand-200 relative">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sand-400 text-sm">shipped.fyi</span>
              <Link href="/terms" className="text-xs text-sand-400 hover:text-sand-600">
                Terms
              </Link>
              <Link href="/privacy" className="text-xs text-sand-400 hover:text-sand-600">
                Privacy
              </Link>
            </div>
            <Link href="/login" className="text-sm text-sand-500 hover:text-sand-700">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
