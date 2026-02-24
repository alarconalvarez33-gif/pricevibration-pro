'use client'

import { useEffect } from 'react'
import { useDomain } from '@/hooks/useDomain'

export default function DomainTitle() {
  const { siteTitle } = useDomain()

  useEffect(() => {
    if (siteTitle) {
      document.title = siteTitle
    }
  }, [siteTitle])

  return null
}
