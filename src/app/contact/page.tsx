'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ContactPage() {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Formspree will handle the submission
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        setSubmitted(true)
        form.reset()
      } else {
        alert(t('contact.error') || 'Error sending message. Please try again.')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      alert(t('contact.error') || 'Error sending message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-terminal-muted text-lg">
              {t('contact.subtitle')}
            </p>
          </div>

          {/* Contact Form */}
          <div className="card-terminal">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {t('contact.successTitle')}
                </h3>
                <p className="text-terminal-muted mb-6">
                  {t('contact.successMessage')}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-gold"
                >
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              <form
                action="https://formspree.io/f/xreapnkb"
                method="POST"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Hidden field for destination email */}
                <input type="hidden" name="_subject" value="Sacred Levels - Contacto desde el sitio web" />

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-terminal-muted text-sm mb-2">
                    {t('contact.name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="input-terminal"
                    placeholder={t('contact.namePlaceholder')}
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-terminal-muted text-sm mb-2">
                    {t('contact.email')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="input-terminal"
                    placeholder={t('contact.emailPlaceholder')}
                  />
                </div>

                {/* Subject Field */}
                <div>
                  <label htmlFor="subject" className="block text-terminal-muted text-sm mb-2">
                    {t('contact.subject')} *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="_formsubject"
                    required
                    className="input-terminal"
                    placeholder={t('contact.subjectPlaceholder')}
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-terminal-muted text-sm mb-2">
                    {t('contact.message')} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="input-terminal resize-none"
                    placeholder={t('contact.messagePlaceholder')}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-gold py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('contact.sending')}
                    </>
                  ) : (
                    t('contact.send')
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-8 p-6 bg-terminal-card border border-terminal-border rounded-xl">
            <h3 className="text-gold-500 font-semibold mb-4">{t('contact.otherWays')}</h3>
            <div className="space-y-3 text-terminal-muted text-sm">
              <p>
                <strong className="text-white">{t('contact.email')}:</strong>{' '}
                <a href="mailto:alarconalvarez33@gmail.com" className="text-gold-500 hover:text-gold-400 transition-colors">
                  alarconalvarez33@gmail.com
                </a>
              </p>
              <p>
                <strong className="text-white">{t('contact.responseTime')}:</strong> {t('contact.responseTimeText')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
