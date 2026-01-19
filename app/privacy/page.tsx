import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for shipped.fyi',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <header className="border-b border-sand-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-sand-900">
            shipped.fyi
          </Link>
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

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-sand-900 mb-2">Privacy Policy</h1>
        <p className="text-sand-500 text-sm mb-8">Last updated: January 19, 2026</p>

        <div className="space-y-8 text-sand-700 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-sand-900 font-medium mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Information:</strong> Email address and authentication data when you create an account</li>
              <li><strong>Project Data:</strong> Feedback items, roadmap data, and changelog entries you create</li>
              <li><strong>Voting Data:</strong> Email addresses (optional) when users vote and opt-in to notifications</li>
              <li><strong>Usage Data:</strong> Information about how you interact with the Service</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store card details)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use collected information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide and maintain the Service</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send notifications about shipped features (when users opt-in)</li>
              <li>Improve and optimize the Service</li>
              <li>Communicate with you about updates and support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">3. Data Sharing</h2>
            <p className="mb-3">We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Service Providers:</strong> Supabase (database), Stripe (payments), Resend (email)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">5. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. Upon account deletion, your data will be removed within 30 days, except where required for legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">7. Cookies</h2>
            <p>
              We use essential cookies to maintain your session and remember your preferences. We use a voter token stored in localStorage for anonymous voting functionality.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">8. Children&apos;s Privacy</h2>
            <p>
              Our Service is not intended for children under 13. We do not knowingly collect information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">9. International Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries outside your own. We ensure appropriate safeguards are in place.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of significant changes via email or through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">11. Contact</h2>
            <p>
              For privacy-related questions, please contact us at privacy@shipped.fyi
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-sand-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-sand-900 font-medium">shipped.fyi</span>
              <p className="text-sand-500 text-sm mt-1">Simple feedback for indie hackers</p>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm text-sand-600 hover:text-sand-900">
                Home
              </Link>
              <Link href="/pricing" className="text-sm text-sand-600 hover:text-sand-900">
                Pricing
              </Link>
              <Link href="/terms" className="text-sm text-sand-600 hover:text-sand-900">
                Terms
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
