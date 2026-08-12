'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Lang } from '../terminal/i18n';

// ── Design tokens (mirror the Terminal) ──────────────────────────────────────
const BG2    = '#0D1118';
const PANEL  = '#0F141C';
const PANEL2 = '#141A24';
const LINE   = '#1E2531';
const LINE2  = '#161C26';
const TEXT   = '#E6E9EF';
const MUTED  = '#7C8798';
const GOLD   = '#C9952A';
const UP     = '#16C784';
const EXNESS = '#F3BA2F';
const MONO   = "'Consolas','SF Mono',ui-monospace,monospace";

const EXNESS_URL = 'https://one.exnessonelink.com/intl/es/a/xwx0gc598n';

interface ProofResult {
  id: string;
  asset: string | null;
  description: string;
  date: string | null;
  order: number;
}

interface Copy {
  tag: string;
  h: string;
  sub: string;
  empty: string;
  exness: string;
  upload: string;
  disclaimer: string;
}

const TXT: Record<Lang, Copy> = {
  es: {
    tag: 'Resultados reales',
    h: 'Últimos niveles exitosos',
    sub: 'Capturas reales de TradingView donde el precio reaccionó en nuestros niveles. Estas son las oportunidades que el radar detectó — no te pierdas las próximas.',
    empty: 'Todavía no hay capturas cargadas.',
    exness: 'Abrí tu cuenta en Exness · 1 mes gratis',
    upload: 'Subir / editar capturas',
    disclaimer: 'Resultados pasados con fines ilustrativos. No garantizan rendimientos futuros. Operar conlleva riesgo.',
  },
  en: {
    tag: 'Real results',
    h: 'Latest winning levels',
    sub: 'Real TradingView screenshots where price reacted at our levels. These are the opportunities the radar caught — don’t miss the next ones.',
    empty: 'No screenshots uploaded yet.',
    exness: 'Open your Exness account · 1 month free',
    upload: 'Upload / edit screenshots',
    disclaimer: 'Past results for illustration only. They do not guarantee future performance. Trading involves risk.',
  },
  hi: {
    tag: 'वास्तविक परिणाम',
    h: 'नवीनतम सफल स्तर',
    sub: 'TradingView के असली स्क्रीनशॉट जहाँ कीमत हमारे स्तरों पर प्रतिक्रिया करती है। ये वे अवसर हैं जो रडार ने पकड़े — अगले मत चूकिए।',
    empty: 'अभी तक कोई स्क्रीनशॉट अपलोड नहीं हुआ।',
    exness: 'अपना Exness खाता खोलें · 1 महीना मुफ़्त',
    upload: 'स्क्रीनशॉट अपलोड / संपादित करें',
    disclaimer: 'पिछले परिणाम केवल उदाहरण के लिए। भविष्य के प्रदर्शन की गारंटी नहीं। ट्रेडिंग में जोखिम है।',
  },
};

function formatDate(date: string | null, lang: Lang): string | null {
  if (!date) return null;
  // Stored as YYYY-MM-DD (from <input type="date">) or free text.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  if (!m) return date;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (isNaN(d.getTime())) return date;
  const locale = lang === 'es' ? 'es-ES' : lang === 'hi' ? 'hi-IN' : 'en-US';
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function SuccessfulLevels({ lang, isAdmin = false }: { lang: Lang; isAdmin?: boolean }) {
  const [results, setResults] = useState<ProofResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState<ProofResult | null>(null);

  const t = TXT[lang] ?? TXT.es;

  useEffect(() => {
    let cancelled = false;
    fetch('/api/results', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setResults(Array.isArray(data?.results) ? data.results : []);
      })
      .catch(() => { /* keep empty */ })
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  // Hide the whole section from the public if there's nothing to show.
  // Admins still see it (with the empty hint + upload link).
  if (loaded && results.length === 0 && !isAdmin) return null;

  return (
    <section
      id="resultados"
      style={{ padding: '60px 20px', background: BG2, borderTop: `1px solid ${LINE}` }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
          <div style={{ maxWidth: 760 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: UP, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: UP, display: 'inline-block' }} />
              {t.tag}
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: TEXT }}>{t.h}</h2>
            <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.55 }}>{t.sub}</p>
          </div>

          {isAdmin && (
            <Link
              href="/admin/results"
              style={{
                flexShrink: 0, fontSize: 12, fontWeight: 700, color: GOLD,
                border: `1px solid ${GOLD}55`, borderRadius: 8, padding: '9px 14px',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              ⤴ {t.upload}
            </Link>
          )}
        </div>

        {/* Grid of proof cards */}
        <div
          style={{
            marginTop: 28,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: 16,
          }}
        >
          {!loaded
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : results.length === 0
              ? (
                <div style={{ gridColumn: '1 / -1', padding: 28, textAlign: 'center', color: MUTED, border: `1px dashed ${LINE}`, borderRadius: 12, background: PANEL }}>
                  {t.empty}
                </div>
              )
              : results.map(r => (
                <ProofCard key={r.id} result={r} lang={lang} onZoom={() => setZoom(r)} />
              ))}
        </div>

        {/* Exness CTA — prominent, this is how the owner earns */}
        <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
          <a
            href={EXNESS_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: EXNESS, color: '#000', fontWeight: 800, fontSize: 14,
              padding: '13px 26px', borderRadius: 10, textDecoration: 'none',
              boxShadow: `0 8px 24px ${EXNESS}33`,
            }}
          >
            {t.exness} →
          </a>
        </div>

        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: MUTED, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
          {t.disclaimer}
        </p>
      </div>

      {/* Lightbox */}
      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 120,
            background: 'rgba(5,7,11,0.85)', backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 20, gap: 14,
          }}
        >
          <button
            onClick={() => setZoom(null)}
            aria-label="Cerrar"
            style={{
              position: 'absolute', top: 16, right: 16, width: 40, height: 40,
              borderRadius: '50%', background: 'transparent', border: `1px solid ${LINE}`,
              color: TEXT, fontSize: 20, cursor: 'pointer',
            }}
          >×</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/results/image/${zoom.id}`}
            alt={zoom.description}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '95vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8, border: `1px solid ${LINE}` }}
          />
          <div style={{ textAlign: 'center', maxWidth: 640 }}>
            {zoom.asset && (
              <span style={{ fontFamily: MONO, color: GOLD, fontWeight: 700, fontSize: 14, marginRight: 10 }}>{zoom.asset}</span>
            )}
            <span style={{ color: TEXT, fontSize: 14 }}>{zoom.description}</span>
            {formatDate(zoom.date, lang) && (
              <div style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>{formatDate(zoom.date, lang)}</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function ProofCard({ result, lang, onZoom }: { result: ProofResult; lang: Lang; onZoom: () => void }) {
  const dateStr = formatDate(result.date, lang);
  return (
    <button
      onClick={onZoom}
      style={{
        textAlign: 'left', padding: 0, cursor: 'zoom-in', font: 'inherit',
        background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'transform .15s, border-color .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${GOLD}66`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = LINE; }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', background: '#000' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/results/image/${result.id}`}
          alt={result.description}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {result.asset && (
          <span style={{
            position: 'absolute', top: 8, left: 8,
            fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#0A0D12',
            background: GOLD, padding: '3px 8px', borderRadius: 5,
          }}>{result.asset}</span>
        )}
        <span style={{
          position: 'absolute', bottom: 8, right: 8,
          fontSize: 10, fontWeight: 700, color: UP,
          background: 'rgba(22,199,132,0.15)', border: `1px solid ${UP}55`,
          padding: '2px 7px', borderRadius: 99,
        }}>✓ WIN</span>
      </div>
      <div style={{ padding: '12px 13px', borderTop: `1px solid ${LINE2}`, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.45, margin: 0 }}>{result.description}</p>
        {dateStr && (
          <span style={{ fontSize: 11, color: MUTED, fontFamily: MONO, marginTop: 'auto' }}>{dateStr}</span>
        )}
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
      <div className="sl-shimmer" style={{ width: '100%', aspectRatio: '16/10' }} />
      <div style={{ padding: '12px 13px', borderTop: `1px solid ${LINE2}` }}>
        <div className="sl-shimmer" style={{ width: '80%', height: 12, borderRadius: 4, marginBottom: 8 }} />
        <div className="sl-shimmer" style={{ width: '40%', height: 10, borderRadius: 4 }} />
      </div>
      <style jsx>{`
        .sl-shimmer {
          background: linear-gradient(90deg, ${PANEL} 0%, ${PANEL2} 50%, ${PANEL} 100%);
          background-size: 200% 100%;
          animation: sl-shimmer 1.6s infinite;
        }
        @keyframes sl-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}
