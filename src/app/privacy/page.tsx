import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | PriceVibration Pro',
  description: 'Privacy Policy for PriceVibration Pro trading platform.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      <div className="pt-36 pb-20 px-4">
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
            <p className="text-terminal-muted mb-8">Last updated: February 2026</p>

            <div className="prose prose-invert max-w-none space-y-6 text-terminal-muted">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
                <p>
                  PriceVibration Pro (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
                <p>We collect information you provide directly:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Account Information:</strong> Name, email address, password</li>
                  <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store card details)</li>
                  <li><strong>Settings:</strong> Location, timezone, and trading preferences</li>
                  <li><strong>Usage Data:</strong> Features used, calculations performed, pages visited</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. Automatically Collected Information</h2>
                <p>When you use our Service, we automatically collect:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and approximate location</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log data (access times, pages viewed, referral URLs)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Provide and maintain the Service</li>
                  <li>Process transactions and manage subscriptions</li>
                  <li>Send important updates and notifications</li>
                  <li>Improve and personalize your experience</li>
                  <li>Analyze usage patterns and optimize performance</li>
                  <li>Prevent fraud and ensure security</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Data Sharing</h2>
                <p>We do not sell your personal information. We may share data with:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Service Providers:</strong> Stripe (payments), Vercel (hosting), analytics providers</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Data Security</h2>
                <p>
                  We implement industry-standard security measures including 256-bit SSL encryption, secure data storage, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
                <p>Depending on your location, you may have the right to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your data</li>
                  <li>Export your data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">8. Cookies</h2>
                <p>
                  We use cookies to maintain sessions, remember preferences, and analyze usage. You can control cookies through your browser settings. Disabling cookies may affect certain features of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">9. Data Retention</h2>
                <p>
                  We retain your personal data for as long as your account is active or as needed to provide services. We may retain certain information as required by law or for legitimate business purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">10. International Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">11. Children&apos;s Privacy</h2>
                <p>
                  Our Service is not intended for users under 18 years of age. We do not knowingly collect personal information from children.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">12. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">13. Contact Us</h2>
                <p>
                  For privacy-related questions or to exercise your rights, contact us at{' '}
                  <a href="mailto:privacy@pricevibration.com" className="text-gold-500 hover:underline">
                    privacy@pricevibration.com
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
