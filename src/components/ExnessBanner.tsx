'use client'

interface ExnessBannerProps {
  className?: string
}

export default function ExnessBanner({ className = '' }: ExnessBannerProps) {
  return (
    <div className={`flex justify-center ${className}`}>
      <a
        href="https://one.exnessonelink.com/intl/es/a/xwx0gc598n"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://d3dpet1g0ty5ed.cloudfront.net/ES_Take_control_728x90.png"
          width={728}
          height={90}
          alt="Exness - Take Control"
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
        />
      </a>
    </div>
  )
}
