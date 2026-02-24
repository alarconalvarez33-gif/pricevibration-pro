import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Risk Disclaimer | Sacred Levels',
  description: 'Important risk disclosure and trading disclaimer for Sacred Levels users.',
}

export default function DisclaimerPage() {
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
            {/* Warning Banner */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <svg className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h2 className="text-xl font-bold text-red-500 mb-2">Risk Warning</h2>
                  <p className="text-white font-semibold">
                    Trading in financial markets involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. You should carefully consider your financial situation before trading.
                  </p>
                  <p className="text-terminal-muted text-sm mt-4">
                    This service is NOT regulated by financial authorities and is NOT registered as an investment advisor. We do not manage funds, execute trades, or provide personalized trading recommendations.
                  </p>
                </div>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Risk Disclaimer</h1>
            <p className="text-terminal-muted mb-8">Last updated: February 2026</p>

            <div className="prose prose-invert max-w-none space-y-6 text-terminal-muted">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">No Financial Advice</h2>
                <p>
                  Sacred Levels is an educational and analytical tool only. Nothing on this platform constitutes financial, investment, legal, or tax advice. The information provided should not be construed as a recommendation to buy, sell, or hold any security, cryptocurrency, or financial instrument.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Trading Risks</h2>
                <p>
                  Trading foreign exchange (Forex), commodities, cryptocurrencies, and other financial instruments carries a high level of risk and may not be suitable for all investors. Before deciding to trade, you should carefully consider:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Your investment objectives, experience level, and risk tolerance</li>
                  <li>The possibility of losing some or all of your initial investment</li>
                  <li>The impact of leverage, which can amplify both gains and losses</li>
                  <li>Market volatility and liquidity conditions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Gann Analysis Disclaimer</h2>
                <p>
                  The Gann methodologies and calculations provided by Sacred Levels are based on the historical work of W.D. Gann. While these techniques have been studied for decades, there is no guarantee that they will predict future market movements accurately.
                </p>
                <p className="mt-2">
                  <strong className="text-gold-500">Important:</strong> Support and resistance levels, time cycles, and other calculated values are mathematical projections only. Markets can and do move beyond these levels without warning.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Astrological Analysis Disclaimer</h2>
                <p>
                  The planetary calculations and astrological correlations presented in Sacred Levels are for informational and educational purposes only. Astrological analysis is considered a speculative methodology and is not scientifically validated. The relationship between celestial events and market movements has not been scientifically proven.
                </p>
                <p className="mt-2">
                  <strong className="text-gold-500">Important:</strong> You should never base trading decisions solely on astrological indicators. It should be used for informational purposes only, never as a primary trading signal. Always use proper risk management and consider multiple factors in your analysis.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">No Guarantees</h2>
                <p>
                  We make no representations or warranties about the accuracy, reliability, completeness, or timeliness of any information provided on Sacred Levels. Specifically:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>We do not guarantee any specific trading results</li>
                  <li>We do not guarantee the accuracy of calculated levels or cycles</li>
                  <li>We do not guarantee uninterrupted access to the platform</li>
                  <li>Historical data and calculations may contain errors</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Your Responsibility</h2>
                <p>
                  By using Sacred Levels, you acknowledge that:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>All trading decisions are made at your own risk</li>
                  <li>You are solely responsible for your trading outcomes</li>
                  <li>You should conduct your own research and due diligence</li>
                  <li>You should consult qualified professionals before making financial decisions</li>
                  <li>You should never trade with money you cannot afford to lose</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h2>
                <p>
                  Sacred Levels, its owners, operators, employees, and affiliates shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Your use of or reliance on any information provided</li>
                  <li>Trading decisions made based on our tools or content</li>
                  <li>Loss of profits, data, or other intangible losses</li>
                  <li>Any errors or interruptions in the service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Seek Professional Advice</h2>
                <p>
                  We strongly recommend that you consult with:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>A licensed financial advisor for investment decisions</li>
                  <li>A tax professional for tax-related matters</li>
                  <li>A legal professional for legal questions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Google Ads Compliance Statement</h2>
                <p>
                  Sacred Levels complies with financial services advertising policies. We do not promise guaranteed returns, specific profit percentages, or risk-free trading. All promotional content is subject to the disclaimers on this page. Historical performance examples are provided for context only and do not represent typical user outcomes.
                </p>
                <p className="mt-2">
                  Any references to historical achievements, case studies, or market examples are for educational illustration purposes and should not be interpreted as promises of future performance or earnings potential.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Acknowledgment</h2>
                <p>
                  By using Sacred Levels, you acknowledge that you have read, understood, and agree to this Risk Disclaimer. If you do not agree with any part of this disclaimer, please do not use our services.
                </p>
              </section>
            </div>

            {/* Final Warning */}
            <div className="mt-8 p-6 bg-terminal-bg border border-terminal-border rounded-xl">
              <p className="text-center text-terminal-muted">
                <strong className="text-white">Remember:</strong> Only trade with money you can afford to lose.
                Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
