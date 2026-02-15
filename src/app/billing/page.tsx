'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      priceUSD: 49,
      priceYearUSD: 470,
      pricePYG: 340000,
      priceYearPYG: 3250000,
      features: [
        'Advanced Gann Calculator',
        'Unlimited calculations',
        'Historical Analysis Tool',
        'Export to Excel/CSV',
        'Real-time planetary data',
        'Price level validation',
      ],
      popular: true,
    },
    {
      id: 'whale',
      name: 'Whale',
      priceUSD: 99,
      priceYearUSD: 950,
      pricePYG: 693900,
      priceYearPYG: 6500000,
      features: [
        'Everything in Pro',
        'Full Astro-Gann Module',
        'Square of 9 Complete',
        'Gann Hexagon',
        'Time Cycles Analysis',
        'Master Time Factor',
        'Priority support',
      ],
      popular: false,
    },
  ];
  const handleSubscribe = async (planId: string, isYearly: boolean = false) => {
    if (!session) {
      router.push('/login?redirect=/billing');
      return;
    }
    setIsLoading(planId);
    try {
      const response = await fetch('/api/pagopar/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          isYearly,
          userId: session.user?.email,
        }),
      });
      const data = await response.json();

      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert('Error: ' + (data.error || 'Could not create payment session'));
      }
    } catch (error) {
      alert('Error connecting to payment service');
    } finally {
      setIsLoading(null);
    }
  };
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your <span className="text-[#c9a227]">Plan</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Unlock the power of mathematical precision in your trading analysis.
            All plans include access to our proprietary algorithms.
          </p>
        </div>

        {/* Trial Info */}
        {!session && (
          <div className="bg-[#1e3a5f]/30 border border-[#c9a227]/30 rounded-xl p-4 mb-8 text-center">
            <p className="text-[#c9a227]">
              🎁 New users get <strong>2 free calculator uses</strong> after registration!
            </p>
            <a href="/register" className="text-white underline hover:text-[#c9a227] text-sm">
              Create free account →
            </a>
          </div>
        )}
        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] rounded-2xl p-8 border ${
                plan.popular
                  ? 'border-[#c9a227] shadow-lg shadow-[#c9a227]/20'
                  : 'border-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#c9a227] text-black text-sm font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                <div className="text-4xl font-bold text-[#c9a227]">
                  ${plan.priceUSD}
                  <span className="text-lg text-gray-400">/mo</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  or ${plan.priceYearUSD}/year (Save 20%)
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Gs. {plan.pricePYG.toLocaleString()} PYG / month
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <svg
                      className="w-5 h-5 text-[#c9a227] mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="space-y-3">
                <button
                  onClick={() => handleSubscribe(plan.id, false)}
                  disabled={isLoading === plan.id}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    plan.popular
                      ? 'bg-[#c9a227] hover:bg-[#d4af37] text-black'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  } disabled:opacity-50`}
                >
                  {isLoading === plan.id ? 'Processing...' : `Subscribe Monthly`}
                </button>
                <button
                  onClick={() => handleSubscribe(plan.id, true)}
                  disabled={isLoading === plan.id + '-yearly'}
                  className="w-full py-3 rounded-lg font-bold border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/10 transition-all disabled:opacity-50"
                >
                  Subscribe Yearly (Save 20%)
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center text-gray-500 text-xs max-w-2xl mx-auto">
          <p>
            Sacred Levels is an educational tool for technical analysis purposes only.
            It does not constitute financial advice. Trading involves substantial risk.
            You are solely responsible for your trading decisions.
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-4">
          <a href="/terms" className="text-gray-500 hover:text-[#c9a227] text-sm">
            Terms & Conditions
          </a>
          <a href="/disclaimer" className="text-gray-500 hover:text-[#c9a227] text-sm">
            Disclaimer
          </a>
          <a href="/contact" className="text-gray-500 hover:text-[#c9a227] text-sm">
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}
