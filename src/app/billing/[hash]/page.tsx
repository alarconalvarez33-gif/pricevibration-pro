'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: {
        send_to?: string
        value?: number
        currency?: string
        transaction_id?: string
        new_customer?: boolean
      }
    ) => void
    dataLayer?: any[]
  }
}

interface PaymentStatus {
  status: 'pending' | 'paid' | 'failed' | 'not_found'
  orderId?: string
  planType?: string
  billingPeriod?: string
  amount?: number
  currency?: string
  paidAt?: string
  createdAt?: string
  message?: string
}

export default function PaymentStatusPage() {
  const params = useParams()
  const router = useRouter()
  const hash = params?.hash as string
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const conversionSent = useRef(false) // Track if conversion was already sent

  useEffect(() => {
    if (!hash) return

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/pagopar/check-payment?hash=${hash}`)
        const data = await response.json()
        setPaymentStatus(data)
      } catch (error) {
        console.error('Error checking payment status:', error)
        setPaymentStatus({
          status: 'not_found',
          message: 'Error al verificar el estado del pago',
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkPaymentStatus()

    // Polling cada 5 segundos si el pago está pendiente
    const interval = setInterval(() => {
      if (paymentStatus?.status === 'pending') {
        checkPaymentStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [hash, paymentStatus?.status])

  // Google Ads Conversion Tracking - ONLY when payment is successful
  useEffect(() => {
    // Only send conversion once when payment is confirmed as paid
    if (
      typeof window !== 'undefined' &&
      window.gtag &&
      paymentStatus?.status === 'paid' &&
      !conversionSent.current
    ) {
      conversionSent.current = true // Mark as sent to prevent duplicates

      // Calculate USD value based on plan and billing period
      let valueUSD = 0
      const planType = paymentStatus.planType?.toLowerCase()
      const billingPeriod = paymentStatus.billingPeriod?.toLowerCase()

      if (planType === 'pro') {
        valueUSD = billingPeriod === 'yearly' ? 470 : 49
      } else if (planType === 'whale') {
        valueUSD = billingPeriod === 'yearly' ? 960 : 100
      }

      // Send conversion event to Google Ads
      try {
        window.gtag('event', 'conversion', {
          send_to: 'AW-17947767962/lRH1CPiy-fYbEJrplO5C',
          value: valueUSD,
          currency: 'USD',
          transaction_id: paymentStatus.orderId || hash,
          new_customer: true, // Assuming new customer for now
        })

        console.log('✅ Google Ads conversion tracked:', {
          plan: planType,
          period: billingPeriod,
          value: valueUSD,
          transaction_id: paymentStatus.orderId || hash,
        })
      } catch (error) {
        console.error('Error sending Google Ads conversion:', error)
      }
    }
  }, [paymentStatus, hash])

  const getStatusIcon = () => {
    switch (paymentStatus?.status) {
      case 'paid':
        return (
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'failed':
        return (
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      case 'pending':
        return (
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )
    }
  }

  const getStatusTitle = () => {
    switch (paymentStatus?.status) {
      case 'paid':
        return '¡Pago Completado!'
      case 'failed':
        return 'Pago Fallido'
      case 'pending':
        return 'Procesando Pago...'
      default:
        return 'Estado del Pago'
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus?.status) {
      case 'paid':
        return `Tu suscripción ${paymentStatus.planType?.toUpperCase()} ha sido activada exitosamente. Ya puedes disfrutar de todas las funcionalidades premium.`
      case 'failed':
        return paymentStatus.message || 'El pago no pudo ser procesado. Por favor intenta nuevamente o contacta soporte.'
      case 'pending':
        return 'Estamos esperando la confirmación del pago. Esto puede tardar unos minutos.'
      default:
        return paymentStatus?.message || 'No se encontró información sobre este pago.'
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-20 pb-20 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Verificando estado del pago...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-20 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-900 rounded-2xl p-8 md:p-12 border border-zinc-800">
            <div className="flex flex-col items-center text-center">
              {getStatusIcon()}

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{getStatusTitle()}</h1>

              <p className="text-gray-400 text-lg mb-8 max-w-md">{getStatusMessage()}</p>

              {/* Payment Details */}
              {paymentStatus?.status !== 'not_found' && (
                <div className="w-full bg-zinc-800 rounded-xl p-6 mb-8 text-left">
                  <h3 className="text-white font-semibold mb-4">Detalles del Pago</h3>
                  <div className="space-y-2 text-sm">
                    {paymentStatus?.orderId && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">ID de Pedido:</span>
                        <span className="text-white font-mono">{String(paymentStatus.orderId)}</span>
                      </div>
                    )}
                    {paymentStatus?.planType && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plan:</span>
                        <span className="text-white capitalize">{String(paymentStatus.planType)}</span>
                      </div>
                    )}
                    {paymentStatus?.billingPeriod && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Período:</span>
                        <span className="text-white capitalize">{String(paymentStatus.billingPeriod)}</span>
                      </div>
                    )}
                    {paymentStatus?.amount !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monto:</span>
                        <span className="text-white">
                          {paymentStatus.currency || 'PYG'} {paymentStatus.amount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    )}
                    {paymentStatus?.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fecha de Pago:</span>
                        <span className="text-white">
                          {new Date(paymentStatus.paidAt).toLocaleString('es-PY', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estado:</span>
                      <span
                        className={`font-semibold ${
                          paymentStatus?.status === 'paid'
                            ? 'text-green-500'
                            : paymentStatus?.status === 'failed'
                            ? 'text-red-500'
                            : 'text-yellow-500'
                        }`}
                      >
                        {paymentStatus?.status === 'paid'
                          ? 'Pagado'
                          : paymentStatus?.status === 'failed'
                          ? 'Fallido'
                          : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                {paymentStatus?.status === 'paid' && (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 bg-yellow-500 text-black py-3 px-6 rounded-xl font-semibold hover:bg-yellow-400 transition-all"
                  >
                    Ir al Dashboard
                  </button>
                )}

                {paymentStatus?.status === 'failed' && (
                  <button
                    onClick={() => router.push('/billing')}
                    className="flex-1 bg-yellow-500 text-black py-3 px-6 rounded-xl font-semibold hover:bg-yellow-400 transition-all"
                  >
                    Intentar Nuevamente
                  </button>
                )}

                {paymentStatus?.status === 'not_found' && (
                  <button
                    onClick={() => router.push('/billing')}
                    className="flex-1 bg-yellow-500 text-black py-3 px-6 rounded-xl font-semibold hover:bg-yellow-400 transition-all"
                  >
                    Ver Planes
                  </button>
                )}

                <button
                  onClick={() => router.push('/')}
                  className="flex-1 border-2 border-zinc-700 text-white py-3 px-6 rounded-xl font-semibold hover:border-yellow-500 transition-all"
                >
                  Volver al Inicio
                </button>
              </div>

              {/* Pending note */}
              {paymentStatus?.status === 'pending' && (
                <p className="text-gray-500 text-sm mt-6">
                  ⏱️ Esta página se actualizará automáticamente cuando el pago sea confirmado
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
