import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for shipped.fyi',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-sand-200 bg-sand-50/90 backdrop-blur-sm">
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
        <h1 className="text-2xl font-semibold text-sand-900 mb-2">Terms of Service</h1>
        <p className="text-sand-500 text-sm mb-8">Last updated: January 19, 2026</p>

        <div className="space-y-8 text-sand-700 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-sand-900 font-medium mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using shipped.fyi ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">2. Description of Service</h2>
            <p>
              shipped.fyi provides a feedback board, roadmap, and changelog tool for product teams. We offer both free and paid subscription plans with varying features and limits.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for any illegal purposes</li>
              <li>Upload malicious content or attempt to compromise the Service</li>
              <li>Impersonate others or provide false information</li>
              <li>Interfere with the proper functioning of the Service</li>
              <li>Attempt to gain unauthorized access to other user accounts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">5. Content Ownership</h2>
            <p>
              You retain ownership of all content you submit to the Service. By submitting content, you grant us a license to use, display, and distribute that content as part of providing the Service.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">6. Payment and Billing</h2>
            <p>
              Paid subscriptions are billed on a recurring basis. You may cancel your subscription at any time. Refunds are provided at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">7. Service Availability</h2>
            <p>
              We strive to maintain high availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, shipped.fyi shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">9. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. We will notify you of significant changes via email or through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-sand-900 font-medium mb-3">10. Contact</h2>
            <p>
              For questions about these Terms, please contact us at support@shipped.fyi
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
