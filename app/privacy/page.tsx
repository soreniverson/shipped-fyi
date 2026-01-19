import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - shipped.fyi',
  description: 'Privacy Policy for shipped.fyi',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <header className="bg-white border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link href="/" className="text-2xl font-semibold text-sand-900 hover:text-sand-700">
            shipped.fyi
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-sand-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-sand max-w-none">
          <p className="text-sand-600 mb-6">Last updated: January 19, 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">1. Information We Collect</h2>
            <p className="text-sand-700 mb-4">We collect the following types of information:</p>
            <ul className="list-disc pl-6 text-sand-700 space-y-2">
              <li><strong>Account Information:</strong> Email address and authentication data when you create an account</li>
              <li><strong>Project Data:</strong> Feedback items, roadmap data, and changelog entries you create</li>
              <li><strong>Voting Data:</strong> Email addresses (optional) when users vote and opt-in to notifications</li>
              <li><strong>Usage Data:</strong> Information about how you interact with the Service</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store card details)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-sand-700 mb-4">We use collected information to:</p>
            <ul className="list-disc pl-6 text-sand-700 space-y-2">
              <li>Provide and maintain the Service</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send notifications about shipped features (when users opt-in)</li>
              <li>Improve and optimize the Service</li>
              <li>Communicate with you about updates and support</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">3. Data Sharing</h2>
            <p className="text-sand-700 mb-4">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc pl-6 text-sand-700 space-y-2">
              <li><strong>Service Providers:</strong> Supabase (database), Stripe (payments), Resend (email)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">4. Data Security</h2>
            <p className="text-sand-700 mb-4">
              We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">5. Data Retention</h2>
            <p className="text-sand-700 mb-4">
              We retain your data for as long as your account is active. Upon account deletion, your data will be removed within 30 days, except where required for legal purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">6. Your Rights</h2>
            <p className="text-sand-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-sand-700 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">7. Cookies</h2>
            <p className="text-sand-700 mb-4">
              We use essential cookies to maintain your session and remember your preferences. We use a voter token stored in localStorage for anonymous voting functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-sand-700 mb-4">
              Our Service is not intended for children under 13. We do not knowingly collect information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">9. International Transfers</h2>
            <p className="text-sand-700 mb-4">
              Your data may be transferred to and processed in countries outside your own. We ensure appropriate safeguards are in place.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-sand-700 mb-4">
              We may update this policy from time to time. We will notify you of significant changes via email or through the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">11. Contact</h2>
            <p className="text-sand-700 mb-4">
              For privacy-related questions, please contact us at privacy@shipped.fyi
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-sand-200 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex gap-4 text-sm text-sand-500">
            <Link href="/terms" className="hover:text-sand-700">Terms</Link>
            <Link href="/privacy" className="hover:text-sand-700">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
