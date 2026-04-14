'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  productId: string
}

// Auto-polls /api/pagopar/check-product-payment every 5 s.
// When status changes to 'paid', calls router.refresh() so the
// server component re-runs and shows the video immediately.
export default function PendingPaymentPoller({ productId }: Props) {
  const router = useRouter()
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const confirmedRef = useRef(false)

  useEffect(() => {
    const check = async () => {
      if (confirmedRef.current) return
      try {
        const res  = await fetch(`/api/pagopar/check-product-payment?productId=${productId}`)
        const data = await res.json()
        if (data.status === 'paid') {
          confirmedRef.current = true
          if (intervalRef.current) clearInterval(intervalRef.current)
          router.refresh()
        }
      } catch (_) {}
    }

    check()
    intervalRef.current = setInterval(check, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [productId, router])

  return null
}
