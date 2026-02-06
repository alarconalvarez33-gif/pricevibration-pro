import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | Sacred Levels',
  description: 'Terms of Service for Sacred Levels trading platform.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="text-gold-500 hover:text-gold-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>

          <div className="card-terminal">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Terms of Service</h1>
            <p className="text-terminal-muted mb-8">Last updated: February 2026</p>

            <div className="prose prose-invert max-w-none space-y-6 text-terminal-muted">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using Sacred Levels (&quot;the Service&quot;), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
                <p>
                  Sacred Levels provides financial analysis tools based on W.D. Gann&apos;s methodologies and heliocentric planetary calculations. The Service includes calculators, charts, and educational content for trading analysis purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. No Financial Advice</h2>
                <p>
                  <strong className="text-gold-500">Important:</strong> Sacred Levels does NOT provide financial, investment, or trading advice. All tools and information provided are for educational and informational purposes only. You should consult with a qualified financial advisor before making any investment decisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. User Accounts</h2>
                <p>
                  To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information when creating an account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Subscription and Payments</h2>
                <p>
                  Paid subscriptions are billed monthly or annually as selected. Subscriptions automatically renew unless cancelled before the renewal date. All fees are non-refundable. You may cancel your subscription at any time as described in our <Link href="/refund" className="text-gold-500 hover:underline">Cancellation Policy</Link>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Use the Service for any unlawful purpose</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Resell, redistribute, or sublicense the Service</li>
                  <li>Use automated systems to access the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Intellectual Property</h2>
                <p>
                  All content, features, and functionality of Sacred Levels are owned by us and protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part of the Service without our written consent.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">8. Disclaimer of Warranties</h2>
                <p>
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR USEFULNESS OF ANY INFORMATION PROVIDED. TRADING INVOLVES SUBSTANTIAL RISK OF LOSS AND IS NOT SUITABLE FOR ALL INVESTORS.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">10. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the Service. Continued use after changes constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">11. Contact Information</h2>
                <p>
                  For questions about these Terms, please contact us at{' '}
                  <a href="mailto:raul@sacredlevels.com" className="text-gold-500 hover:underline">
                    raul@sacredlevels.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
