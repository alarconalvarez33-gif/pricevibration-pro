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

/**
 * `cap` is the widest this creative may ever render.
 *
 * The 320x50 strip is only 320px of real pixels, so letting it stretch to a
 * 1160px container upscaled it 3.6x and it showed — visibly pixelated. Each
 * variant is now capped at a width the source can actually fill.
 */
const CREATIVES = {
  '320x50': {
    src: `${CDN}/ES_Take_control_320x50.png`,
    width: 320,
    height: 50,
    cap: 320,
    sizes: '320px',
  },
  // Never rendered at its native 800px — 400 is the ceiling.
  '800x800': {
    src: `${CDN}/ES_Take_control_800x800.png`,
    width: 800,
    height: 800,
    cap: 400,
    sizes: '400px',
  },
  vertical: {
    src: `${CDN}/1_ES_NBP_4_5.jpg`,
    width: 1080,
    height: 1350,
    cap: 380,
    sizes: '(max-width: 900px) 340px, 380px',
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
      // The strips shrink-wrap so a wide container cannot stretch them. The
      // vertical creative is meant to fill its column, and stays block-level so
      // `margin: 0 auto` can still centre it on mobile.
      style={{
        display: variante === 'vertical' ? 'block' : 'inline-block',
        maxWidth: '100%',
        lineHeight: 0,
      }}
    >
      <Image
        src={creative.src}
        width={creative.width}
        height={creative.height}
        alt="Abrí tu cuenta con Exness"
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        sizes={creative.sizes}
        style={{
          display: 'block',
          // Never wider than the source can fill; still shrinks on narrow
          // screens. aspect-ratio holds the row so the layout cannot jump.
          width: '100%',
          maxWidth: creative.cap,
          height: 'auto',
          aspectRatio: `${creative.width} / ${creative.height}`,
          borderRadius: variante === '320x50' ? 6 : 12,
        }}
      />
    </a>
  );
}
