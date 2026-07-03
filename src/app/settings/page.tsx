'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

interface UserSettings {
  timezone: string
  city: string
  latitude: number
  longitude: number
  theme: 'dark' | 'light'
  defaultSymbol: string
  notifications: boolean
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET) - New York' },
  { value: 'America/Chicago', label: 'Central Time (CT) - Chicago' },
  { value: 'America/Denver', label: 'Mountain Time (MT) - Denver' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles' },
  { value: 'America/Asuncion', label: 'Paraguay Time - Asuncion' },
  { value: 'America/Sao_Paulo', label: 'Brasilia Time - Sao Paulo' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina Time - Buenos Aires' },
  { value: 'Europe/London', label: 'GMT - London' },
  { value: 'Europe/Paris', label: 'CET - Paris/Berlin' },
  { value: 'Europe/Moscow', label: 'Moscow Time - Moscow' },
  { value: 'Asia/Dubai', label: 'Gulf Time - Dubai' },
  { value: 'Asia/Kolkata', label: 'India Time - Mumbai' },
  { value: 'Asia/Singapore', label: 'Singapore Time' },
  { value: 'Asia/Tokyo', label: 'Japan Time - Tokyo' },
  { value: 'Asia/Shanghai', label: 'China Time - Shanghai' },
  { value: 'Australia/Sydney', label: 'AEST - Sydney' },
]

const SYMBOLS = [
  { value: 'OANDA:XAUUSD', label: 'XAU/USD (Gold)' },
  { value: 'OANDA:XAGUSD', label: 'XAG/USD (Silver)' },
  { value: 'FX:EURUSD', label: 'EUR/USD' },
  { value: 'FX:GBPUSD', label: 'GBP/USD' },
  { value: 'BITSTAMP:BTCUSD', label: 'BTC/USD (Bitcoin)' },
  { value: 'BITSTAMP:ETHUSD', label: 'ETH/USD (Ethereum)' },
  { value: 'FOREXCOM:SPXUSD', label: 'S&P 500' },
  { value: 'TVC:DXY', label: 'US Dollar Index' },
]

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings>({
    timezone: 'America/Asuncion',
    city: 'Asuncion',
    latitude: -25.2867,
    longitude: -57.3333,
    theme: 'dark',
    defaultSymbol: 'OANDA:XAUUSD',
    notifications: true,
  })
  const [saved, setSaved] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('tmt-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('tmt-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const detectLocation = () => {
    setDetectingLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSettings((prev) => ({
            ...prev,
            latitude: Math.round(position.coords.latitude * 10000) / 10000,
            longitude: Math.round(position.coords.longitude * 10000) / 10000,
          }))
          setDetectingLocation(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          setDetectingLocation(false)
          alert('Could not detect location. Please enter manually.')
        }
      )
    } else {
      setDetectingLocation(false)
      alert('Geolocation is not supported by your browser.')
    }
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-terminal-bg">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-gold-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-terminal-muted">Loading Settings...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!session) {
    return null
  }

  const email = session.user.email || ''
  const plan = session.user.plan || 'free'
  const role = session.user.role || 'user'
  const isAdmin = role === 'admin'
  const isWhale = plan === 'whale' || isAdmin
  const isPro = plan === 'pro' || isAdmin
  const tier = isWhale ? 'whale' : isPro ? 'pro' : 'free'

  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      <div className="pt-20 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
            <p className="text-terminal-muted mt-1">Customize your TMT experience</p>
          </div>

          {/* Account Info */}
          <div className="card-terminal mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Account</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-terminal-border">
                <div>
                  <div className="text-white">{session.user.email}</div>
                  <div className="text-terminal-muted text-sm">{session.user.name || 'No name set'}</div>
                </div>
                {tier === 'whale' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    🐋 WHALE
                  </span>
                ) : tier === 'pro' ? (
                  <span className="status-premium">PRO</span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-terminal-border text-terminal-muted">
                    FREE
                  </span>
                )}
              </div>
              {tier === 'free' && (
                <Link href="/billing" className="btn-gold w-full block text-center">
                  Upgrade to PRO
                </Link>
              )}
              {tier === 'pro' && (
                <Link href="/billing" className="w-full block text-center px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-opacity">
                  Upgrade to WHALE
                </Link>
              )}
            </div>
          </div>

          {/* Subscription Management */}
          {(tier === 'pro' || tier === 'whale') && !isAdmin && (
            <div className="card-terminal mb-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Subscription
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-terminal-border">
                  <div>
                    <div className="text-white font-medium">Current Plan</div>
                    <div className="text-terminal-muted text-sm capitalize">{tier} Plan</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    tier === 'whale'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-gold-500/20 text-gold-400'
                  }`}>
                    {tier.toUpperCase()}
                  </span>
                </div>

                {session.user.premiumUntil && (
                  <div className="flex justify-between items-center py-3 border-b border-terminal-border">
                    <div>
                      <div className="text-white font-medium">Access Until</div>
                      <div className="text-terminal-muted text-sm">
                        {new Date(session.user.premiumUntil).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <span className="text-green-400 text-sm font-medium">Active</span>
                  </div>
                )}

                <div className="pt-2 border-t border-terminal-border">
                  <p className="text-terminal-muted text-sm mb-4">
                    Need to cancel your subscription? Your premium access will continue until the end of your current billing period.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel? You will lose premium access after your current billing period ends.')) {
                        alert('To complete cancellation, please contact support at raul@sacredlevels.com with your email address.')
                      }
                    }}
                    className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Request Cancellation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Location Settings */}
          <div className="card-terminal mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Location & Timezone</h2>
            <p className="text-terminal-muted text-sm mb-4">
              Your location is used for accurate astrological calculations and local time display.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-terminal-muted text-sm mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full bg-terminal-bg border border-terminal-border rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-terminal-muted text-sm mb-2">City</label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  placeholder="Enter your city..."
                  className="w-full bg-terminal-bg border border-terminal-border rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-terminal-muted text-sm mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settings.latitude}
                    onChange={(e) => setSettings({ ...settings, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-terminal-bg border border-terminal-border rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-terminal-muted text-sm mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settings.longitude}
                    onChange={(e) => setSettings({ ...settings, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-terminal-bg border border-terminal-border rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={detectLocation}
                disabled={detectingLocation}
                className="w-full btn-outline-gold flex items-center justify-center gap-2"
              >
                {detectingLocation ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Detecting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Detect My Location
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trading Preferences */}
          <div className="card-terminal mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Trading Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-terminal-muted text-sm mb-2">Default Symbol</label>
                <select
                  value={settings.defaultSymbol}
                  onChange={(e) => setSettings({ ...settings, defaultSymbol: e.target.value })}
                  className="w-full bg-terminal-bg border border-terminal-border rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                >
                  {SYMBOLS.map((sym) => (
                    <option key={sym.value} value={sym.value}>
                      {sym.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-white">Email Notifications</div>
                  <div className="text-terminal-muted text-sm">Receive trading alerts and updates</div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.notifications ? 'bg-gold-500' : 'bg-terminal-border'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.notifications ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="card-terminal mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Appearance</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSettings({ ...settings, theme: 'dark' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.theme === 'dark'
                    ? 'border-gold-500 bg-terminal-card'
                    : 'border-terminal-border bg-terminal-bg hover:border-terminal-muted'
                }`}
              >
                <div className="w-full h-16 bg-[#0a0a0f] rounded mb-2 flex items-center justify-center">
                  <div className="w-8 h-2 bg-gold-500 rounded" />
                </div>
                <div className="text-white text-sm">Dark Mode</div>
              </button>
              <button
                onClick={() => setSettings({ ...settings, theme: 'light' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.theme === 'light'
                    ? 'border-gold-500 bg-terminal-card'
                    : 'border-terminal-border bg-terminal-bg hover:border-terminal-muted'
                }`}
              >
                <div className="w-full h-16 bg-gray-100 rounded mb-2 flex items-center justify-center">
                  <div className="w-8 h-2 bg-gray-800 rounded" />
                </div>
                <div className="text-white text-sm">Light Mode</div>
                <div className="text-terminal-muted text-xs">(Coming Soon)</div>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 btn-gold flex items-center justify-center gap-2"
            >
              {saved ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
            <Link href="/dashboard" className="btn-outline-gold">
              Back to Dashboard
            </Link>
          </div>

          {/* Data Info */}
          <div className="mt-8 p-4 bg-terminal-card/50 rounded-lg border border-terminal-border">
            <p className="text-terminal-muted text-sm">
              <strong className="text-white">Privacy:</strong> Your settings are stored locally in your browser.
              Location data is only used for astrological calculations and is never shared with third parties.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
