'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function BillingHashPage() {
  const params = useParams()
  const hash = params.hash as string
  const [status, setStatus] = useState<'loading' | 'paid' | 'pending' | 'error'>('loading')
  const [details, setDetails] = useState<{ plan?: string; amount?: string } | null>(null)

  useEffect(() => {
    async function checkPayment() {
      try {
        const res = await fetch('/api/pagopar/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pagoparHash: hash }),
        })

        if (!res.ok) {
          // User might not be logged in or payment not found - show pending
          setStatus('pending')
          return
        }

        const data = await res.json()

        if (data.localStatus === 'paid') {
          setStatus('paid')
          setDetails({ plan: data.plan, amount: data.amount })
        } else if (data.localStatus === 'failed') {
          setStatus('error')
        } else {
          setStatus('pending')
        }
      } catch {
        setStatus('pending')
      }
    }

    checkPayment()
  }, [hash])

  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-xl mx-auto">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-500 mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-white mb-2">Checking payment status...</h1>
              <p className="text-terminal-muted">Please wait while we verify your payment.</p>
            </div>
          )}

          {status === 'paid' && (
            <div className="bg-terminal-card border-2 border-green-500 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-green-300 mb-6">Your subscription has been activated.</p>
              {details?.plan && (
                <p className="text-terminal-muted mb-6">
                  Plan: <span className="text-white font-semibold capitalize">{details.plan}</span>
                </p>
              )}
              <a
                href="/dashboard"
                className="inline-block bg-gradient-to-r from-gold-500 to-gold-600 text-black font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-all"
              >
                Go to Dashboard
              </a>
            </div>
          )}

          {status === 'pending' && (
            <div className="bg-terminal-card border-2 border-yellow-500 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Payment Pending</h1>
              <p className="text-yellow-300 mb-6">
                Your payment is being processed. This may take a few minutes.
              </p>
              <p className="text-terminal-muted text-sm mb-6">
                You will receive an email confirmation once the payment is confirmed.
              </p>
              <a
                href="/billing"
                className="inline-block border-2 border-terminal-border text-white font-semibold px-8 py-3 rounded-xl hover:border-gold-500 transition-all"
              >
                Back to Billing
              </a>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-terminal-card border-2 border-red-500 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
              <p className="text-red-300 mb-6">
                There was an issue processing your payment. Please try again.
              </p>
              <a
                href="/billing"
                className="inline-block bg-gradient-to-r from-gold-500 to-gold-600 text-black font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-all"
              >
                Try Again
              </a>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
