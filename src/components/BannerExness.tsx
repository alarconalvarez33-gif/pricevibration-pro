import Image from 'next/image';

/**
 * Exness affiliate creatives.
 *
 * Placement is deliberate: never above the masthead (it makes the site read as
 * an affiliate farm) and never in the footer (nobody gets there). Each variant
 * sits where the surrounding copy has already earned the click.
 */
export const EXNESS_URL =
  'https://one.exnessonelink.com/a/xwx0gc598n?source=app&platform=mobile&pid=mobile_share';

const CDN = 'https://d3dpet1g0ty5ed.cloudfront.net';

const CREATIVES = {
  '320x50': {
    src: `${CDN}/ES_Take_control_320x50.png`,
    width: 320,
    height: 50,
  },
  // Never rendered at its native size — 400px is the ceiling.
  '800x800': {
    src: `${CDN}/ES_Take_control_800x800.png`,
    width: 400,
    height: 400,
  },
  vertical: {
    src: `${CDN}/1_ES_NBP_4_5.jpg`,
    width: 1080,
    height: 1350,
  },
} as const;

export type BannerVariant = keyof typeof CREATIVES;

interface Props {
  variante: BannerVariant;
  className?: string;
  /** First creative above the fold should not be lazy. Everything else should. */
  priority?: boolean;
}

export default function BannerExness({ variante, className, priority = false }: Props) {
  const creative = CREATIVES[variante];

  return (
    <a
      href={EXNESS_URL}
      target="_blank"
      rel="sponsored noopener"
      className={className}
      aria-label="Abrí tu cuenta con Exness"
    >
      <Image
        src={creative.src}
        width={creative.width}
        height={creative.height}
        alt="Abrí tu cuenta con Exness"
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        sizes={variante === 'vertical' ? '(max-width: 900px) 340px, 380px' : undefined}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          borderRadius: variante === '320x50' ? 6 : 12,
        }}
      />
    </a>
  );
}
