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
      >
        <img
          src="https://d3dpet1g0ty5ed.cloudfront.net/ES_LATAM_C1_CRYPTO_C2_T1_BTC_79_T2_PERFORMANCE_D-3-3_STATIC_1024X768_Q4_2025.jpg"
          width="1024"
          height="768"
          alt="Exness - Trade Crypto"
          className="max-w-full h-auto rounded-xl"
        />
      </a>
    </div>
  )
}
