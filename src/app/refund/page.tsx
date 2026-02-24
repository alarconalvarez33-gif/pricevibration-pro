import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Cancellation Policy | PriceVibration Pro',
  description: 'Subscription cancellation policy for PriceVibration Pro.',
}

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      <div className="pt-20 pb-20 px-4">
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Cancellation Policy</h1>
                <p className="text-terminal-muted">Subscription Management</p>
              </div>
            </div>
            <p className="text-terminal-muted mb-8">Last updated: February 2026</p>

            <div className="prose prose-invert max-w-none space-y-6 text-terminal-muted">
              {/* Important Notice */}
              <div className="bg-terminal-card border border-terminal-border rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-2">Important Notice</h2>
                <p className="text-terminal-muted">
                  All subscription payments are final and non-refundable. By subscribing to PriceVibration Pro, you acknowledge and agree to this policy. We encourage you to carefully review our features before making a purchase.
                </p>
              </div>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">No Refund Policy</h2>
                <p>
                  Due to the digital nature of our services and immediate access to proprietary trading tools and calculations, all payments made for PriceVibration Pro subscriptions are non-refundable. This applies to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Monthly subscriptions</li>
                  <li>Annual subscriptions</li>
                  <li>One-time purchases</li>
                  <li>Upgrades between plans</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Cancellation Process</h2>
                <p>You can cancel your subscription at any time from your account settings:</p>
                <ol className="list-decimal pl-6 mt-2 space-y-2">
                  <li>Go to <Link href="/settings" className="text-gold-500 hover:underline">Settings</Link> &rarr; Subscription</li>
                  <li>Click &quot;Cancel Subscription&quot;</li>
                  <li>Confirm your cancellation</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">What Happens After Cancellation</h2>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Your access continues until the end of your current billing period</li>
                  <li>No further charges will be made after cancellation</li>
                  <li>You will retain access to basic features after your subscription ends</li>
                  <li>Your saved calculations and data will be preserved</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Billing Issues</h2>
                <p>
                  If you experience unauthorized charges or billing errors, please contact us immediately. We will investigate and resolve legitimate billing issues:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Duplicate charges due to technical errors</li>
                  <li>Charges after successful cancellation confirmation</li>
                  <li>Incorrect amount charged</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
                <p>
                  Have questions about cancellation or billing? Contact our support team:
                </p>
                <ul className="list-none mt-2 space-y-1">
                  <li>Email: <a href="mailto:support@pricevibration.com" className="text-gold-500 hover:underline">support@pricevibration.com</a></li>
                  <li>Response time: Within 24-48 hours</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
