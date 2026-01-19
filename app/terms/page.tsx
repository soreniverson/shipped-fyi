import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - shipped.fyi',
  description: 'Terms of Service for shipped.fyi',
}

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-sand-900 mb-8">Terms of Service</h1>

        <div className="prose prose-sand max-w-none">
          <p className="text-sand-600 mb-6">Last updated: January 19, 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-sand-700 mb-4">
              By accessing and using shipped.fyi (&quot;the Service&quot;), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">2. Description of Service</h2>
            <p className="text-sand-700 mb-4">
              shipped.fyi provides a feedback board, roadmap, and changelog tool for product teams. We offer both free and paid subscription plans with varying features and limits.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">3. User Accounts</h2>
            <p className="text-sand-700 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">4. Acceptable Use</h2>
            <p className="text-sand-700 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-sand-700 space-y-2">
              <li>Use the Service for any illegal purposes</li>
              <li>Upload malicious content or attempt to compromise the Service</li>
              <li>Impersonate others or provide false information</li>
              <li>Interfere with the proper functioning of the Service</li>
              <li>Attempt to gain unauthorized access to other user accounts</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">5. Content Ownership</h2>
            <p className="text-sand-700 mb-4">
              You retain ownership of all content you submit to the Service. By submitting content, you grant us a license to use, display, and distribute that content as part of providing the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">6. Payment and Billing</h2>
            <p className="text-sand-700 mb-4">
              Paid subscriptions are billed on a recurring basis. You may cancel your subscription at any time. Refunds are provided at our discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">7. Service Availability</h2>
            <p className="text-sand-700 mb-4">
              We strive to maintain high availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-sand-700 mb-4">
              To the maximum extent permitted by law, shipped.fyi shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">9. Changes to Terms</h2>
            <p className="text-sand-700 mb-4">
              We may update these terms from time to time. We will notify you of significant changes via email or through the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-sand-900 mb-4">10. Contact</h2>
            <p className="text-sand-700 mb-4">
              For questions about these Terms, please contact us at support@shipped.fyi
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
