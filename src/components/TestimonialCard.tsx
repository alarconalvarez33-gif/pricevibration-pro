'use client'

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  country: string
  countryFlag: string
  avatarInitials: string
  rating?: number
  className?: string
}

export default function TestimonialCard({
  quote,
  author,
  role,
  country,
  countryFlag,
  avatarInitials,
  rating = 5,
  className = ''
}: TestimonialCardProps) {
  return (
    <div className={`card-terminal-hover p-6 ${className}`}>
      {/* Rating Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-gold-500' : 'text-terminal-muted/30'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-white mb-6 leading-relaxed">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-black font-bold">
          {avatarInitials}
        </div>
        <div>
          <div className="font-semibold text-white flex items-center gap-2">
            {author}
            <span className="text-lg" role="img" aria-label={country}>{countryFlag}</span>
          </div>
          <div className="text-sm text-terminal-muted">{role}</div>
        </div>
      </div>
    </div>
  )
}
