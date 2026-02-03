'use client'

import { useState, useEffect } from 'react'

const notifications = [
  { name: 'John D.', country: 'USA', plan: 'Pro', flag: '🇺🇸' },
  { name: 'Marcus W.', country: 'UK', plan: 'Whale', flag: '🇬🇧' },
  { name: 'Elena R.', country: 'Spain', plan: 'Pro', flag: '🇪🇸' },
  { name: 'Hiroshi T.', country: 'Japan', plan: 'Whale', flag: '🇯🇵' },
  { name: 'Sophie L.', country: 'France', plan: 'Pro', flag: '🇫🇷' },
  { name: 'Ahmed K.', country: 'UAE', plan: 'Whale', flag: '🇦🇪' },
  { name: 'Carlos M.', country: 'Brazil', plan: 'Pro', flag: '🇧🇷' },
  { name: 'Anna S.', country: 'Germany', plan: 'Whale', flag: '🇩🇪' },
  { name: 'David C.', country: 'Australia', plan: 'Pro', flag: '🇦🇺' },
  { name: 'Lisa P.', country: 'Canada', plan: 'Pro', flag: '🇨🇦' },
  { name: 'Wei L.', country: 'Singapore', plan: 'Whale', flag: '🇸🇬' },
  { name: 'Michael B.', country: 'Netherlands', plan: 'Pro', flag: '🇳🇱' },
]

export default function LiveNotification() {
  const [notification, setNotification] = useState<typeof notifications[0] | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Initial delay before first notification
    const initialDelay = Math.random() * 10000 + 5000 // 5-15 seconds

    const showNotification = () => {
      const randomNotif = notifications[Math.floor(Math.random() * notifications.length)]
      setNotification(randomNotif)
      setIsVisible(true)

      // Hide after 4.5 seconds
      setTimeout(() => {
        setIsVisible(false)
      }, 4500)
    }

    const initialTimeout = setTimeout(() => {
      showNotification()

      // Then show every 30-45 seconds
      const interval = setInterval(() => {
        showNotification()
      }, Math.random() * 15000 + 30000) // 30-45 seconds

      return () => clearInterval(interval)
    }, initialDelay)

    return () => clearTimeout(initialTimeout)
  }, [])

  if (!notification || !isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-notification">
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-4 shadow-xl max-w-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
            {notification.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">
              {notification.name} from {notification.country} {notification.flag}
            </p>
            <p className="text-terminal-muted text-xs mt-0.5">
              just subscribed to <span className="text-gold-500 font-medium">{notification.plan}</span>
            </p>
            <p className="text-terminal-muted/50 text-[10px] mt-1">
              a few seconds ago
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
