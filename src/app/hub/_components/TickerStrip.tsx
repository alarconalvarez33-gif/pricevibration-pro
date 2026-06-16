'use client';

interface Item {
  ticker: string;
  price: number | null;
  changePct: number | null;
  format: (v: number) => string;
}

export default function TickerStrip({ items }: { items: Item[] }) {
  if (items.length === 0) return null;

  const renderItem = (it: Item, key: string) => {
    const up = (it.changePct ?? 0) >= 0;
    const priceStr = it.price != null && it.price > 0 ? it.format(it.price) : '—';
    const pctStr = it.changePct != null ? `${up ? '+' : '-'}${Math.abs(it.changePct).toFixed(2)}%` : '—';
    return (
      <span key={key} className="inline-flex items-center gap-2 px-5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <span className="text-[12px] font-bold" style={{ color: '#EDF1F5' }}>{it.ticker}</span>
        <span className="text-[12px]" style={{ color: '#EDF1F5' }}>{priceStr}</span>
        <span className="text-[11px] font-semibold" style={{ color: up ? '#00E676' : '#FF4757' }}>{pctStr}</span>
        <span className="text-[#2a3140]">·</span>
      </span>
    );
  };

  return (
    <div
      className="overflow-hidden border-y"
      style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: '#0d1320' }}
      aria-label="Cintilla de precios en vivo"
    >
      <div className="ticker-track py-2.5 whitespace-nowrap">
        {items.map((it, i) => renderItem(it, `a-${i}`))}
        {items.map((it, i) => renderItem(it, `b-${i}`))}
      </div>
      <style jsx>{`
        .ticker-track {
          display: inline-block;
          animation: ticker 55s linear infinite;
        }
        .overflow-hidden:hover .ticker-track {
          animation-play-state: paused;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
