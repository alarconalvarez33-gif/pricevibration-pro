'use client';

import { useEffect, useState } from 'react';

/**
 * Financial headlines, filtered by topic.
 *
 * Every headline comes from the /api/news feed. Nothing here is written by us —
 * if the feed is empty or down, the panel says so instead of showing a
 * plausible-looking placeholder.
 */

interface Article {
  id?: number;
  headline: string;
  source: string;
  url: string;
  datetime: number;
  related?: string;
  category?: string;
}

/**
 * The feed only serves three categories. The finer topics are filtered on top
 * of them by keyword, so a chip never promises a cut the data cannot back.
 */
const TOPICS = [
  { key: 'todo', label: 'Todo', category: 'general', match: null },
  { key: 'oro', label: 'Oro', category: 'general', match: /\bgold\b|\bxau\b|bullion|oro\b/i },
  { key: 'petroleo', label: 'Petróleo', category: 'general', match: /\boil\b|crude|\bwti\b|brent|opec|petról/i },
  { key: 'divisas', label: 'Divisas', category: 'forex', match: null },
  { key: 'acciones', label: 'Acciones', category: 'general', match: /stock|shares|earnings|nasdaq|s&p|dow\b/i },
  { key: 'cripto', label: 'Cripto', category: 'crypto', match: null },
] as const;

type TopicKey = typeof TOPICS[number]['key'];

const MAX_ITEMS = 6;

function timeLabel(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  return d.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function agoLabel(unixSeconds: number): string {
  const mins = Math.max(0, Math.round((Date.now() - unixSeconds * 1000) / 60_000));
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.round(hours / 24)} d`;
}

/** Short symbol tag, only when the feed actually names one. */
function symbolTag(a: Article): string | null {
  if (a.related && /^[A-Z.:-]{1,10}$/.test(a.related)) return a.related;
  if (/\bgold\b|\bxau\b/i.test(a.headline)) return 'XAU';
  if (/\boil\b|crude|\bwti\b/i.test(a.headline)) return 'WTI';
  if (/bitcoin|\bbtc\b/i.test(a.headline)) return 'BTC';
  if (/ethereum|\beth\b/i.test(a.headline)) return 'ETH';
  return null;
}

export default function NewsPanel() {
  const [topic, setTopic] = useState<TopicKey>('todo');
  const [items, setItems] = useState<Article[] | null>(null);
  const [failed, setFailed] = useState(false);

  const active = TOPICS.find(t => t.key === topic)!;

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setFailed(false);

    (async () => {
      try {
        const r = await fetch(`/api/news?category=${active.category}`);
        if (!r.ok) throw new Error(String(r.status));
        const data = await r.json();
        if (cancelled) return;
        if (!Array.isArray(data)) throw new Error('formato inesperado');

        const filtered = (data as Article[])
          .filter(a => a.headline && a.url)
          .filter(a => (active.match ? active.match.test(a.headline) : true))
          .slice(0, MAX_ITEMS);

        setItems(filtered);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => { cancelled = true; };
  }, [active.category, active.match]);

  return (
    <div className="newsbox">
      <div className="news-top">
        <span className="t">Titulares</span>
        <span className="live"><span className="dotlive" />En vivo</span>
      </div>

      <div className="chips" role="tablist" aria-label="Filtrar titulares por tema">
        {TOPICS.map(t => (
          <button
            key={t.key}
            type="button"
            className="chip"
            role="tab"
            aria-selected={t.key === topic}
            onClick={() => setTopic(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {failed && (
        <p className="news-empty">
          No pudimos cargar los titulares en este momento. Volvé a intentar en unos minutos.
        </p>
      )}

      {!failed && items === null && (
        <p className="news-empty">Cargando titulares…</p>
      )}

      {!failed && items?.length === 0 && (
        <p className="news-empty">
          No hay titulares recientes para este tema. Probá con «Todo».
        </p>
      )}

      {items?.map((a, i) => {
        const tag = symbolTag(a);
        return (
          <a
            key={a.id ?? `${a.url}-${i}`}
            className="nitem"
            href={a.url}
            target="_blank"
            rel="noopener nofollow"
          >
            <div className="nmeta">
              {timeLabel(a.datetime)}
              {tag && <span className="nsym">{tag}</span>}
            </div>
            <div>
              <div className="nhead">{a.headline}</div>
              <div className="nsrc">{a.source} · {agoLabel(a.datetime)}</div>
            </div>
          </a>
        );
      })}

      <div className="news-foot">
        Los titulares provienen de fuentes externas y se actualizan solos. Este bloque es
        informativo: no es una recomendación de operar.
      </div>
    </div>
  );
}
