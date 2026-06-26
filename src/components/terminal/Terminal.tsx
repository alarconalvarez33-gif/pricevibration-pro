'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ASSETS, FLAT, CATEGORIES, TIMEFRAMES, type AssetCategory, type Timeframe } from './assets';
import { STR, FX, SYM, money, type Lang, type Currency } from './i18n';

// ── Design tokens (mirrored from the mockup) ───────────────────────────────────
const BG     = '#0A0D12';
const BG2    = '#0D1118';
const PANEL  = '#0F141C';
const PANEL2 = '#141A24';
const LINE   = '#1E2531';
const LINE2  = '#161C26';
const TEXT   = '#E6E9EF';
const MUTED  = '#7C8798';
const GOLD   = '#C9952A';
const GOLD_L = '#DDB45A';
const UP     = '#16C784';
const DOWN   = '#EA3943';
const MONO   = "'Consolas','SF Mono',ui-monospace,monospace";

// ── Asset price source ─────────────────────────────────────────────────────────
interface MarketRow {
  symbol: string;
  price: number;
  changePercent: number;
  high: number;
  low: number;
  offline?: boolean;
}

interface LevelsResponse {
  symbol: string;
  timeframe: Timeframe;
  price: number | null;
  isAuthed: boolean;
  isPremium: boolean;
  levels: { res: number[]; sup: number[]; resPct: number[]; supPct: number[] } | null;
  bias: { score: number; label: 'bull' | 'bear' | 'neutral' } | null;
}

interface Props {
  userEmail: string;
  isPremium: boolean;
}

const PREVIEW_SECONDS = 120; // 2 minutes of free preview for non-premium users
const PREVIEW_KEY = 'sl_terminal_preview_started_at';

export default function Terminal({ userEmail, isPremium }: Props) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [lang, setLang] = useState<Lang>('es');
  const [cur,  setCur]  = useState<Currency>('USD');
  const [tf,   setTf]   = useState<Timeframe>('1h');
  const [tab,  setTab]  = useState<AssetCategory>('Cripto');
  const [search, setSearch] = useState('');
  const [curAsset, setCurAsset] = useState<string>('XAU/USD');

  const [markets, setMarkets] = useState<Record<string, MarketRow>>({});
  const [levels,  setLevels]  = useState<LevelsResponse | null>(null);
  const [toasts,  setToasts]  = useState<{ id: number; msg: string }[]>([]);
  const lastPriceRef = useRef<Record<string, number>>({});
  const alertedRef   = useRef<Record<string, number>>({});

  const t = STR[lang];

  // 2-minute preview timer
  const [previewSecondsLeft, setPreviewSecondsLeft] = useState<number | null>(null);
  const [previewExpired, setPreviewExpired] = useState(false);

  // Risk calc inputs
  const [rBal,  setRBal]  = useState('');
  const [rPct,  setRPct]  = useState('1');
  const [rStop, setRStop] = useState('');

  // Alerts toggle
  const [alertsOn, setAlertsOn] = useState(true);

  // USDT copy state
  const [copied, setCopied] = useState(false);

  // ── Side effects ───────────────────────────────────────────────────────────

  // Poll /api/markets every 12s
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch('/api/markets', { cache: 'no-store' });
        const j = await r.json();
        if (cancelled || !Array.isArray(j?.markets)) return;
        const next: Record<string, MarketRow> = {};
        for (const m of j.markets as MarketRow[]) next[m.symbol] = m;
        setMarkets(next);
      } catch { /* network blip — keep last */ }
    };
    load();
    const id = setInterval(load, 12_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Fetch server-side levels whenever asset or timeframe changes (every 30s too)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch('/api/terminal/levels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: curAsset, timeframe: tf }),
        });
        const j: LevelsResponse = await r.json();
        if (!cancelled) setLevels(j);
      } catch { /* keep last */ }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [curAsset, tf]);

  // 2-min preview countdown for non-premium users
  useEffect(() => {
    if (isPremium) { setPreviewSecondsLeft(null); setPreviewExpired(false); return; }
    let startedAt = parseInt(localStorage.getItem(PREVIEW_KEY) || '0', 10);
    if (!startedAt || isNaN(startedAt)) {
      startedAt = Date.now();
      localStorage.setItem(PREVIEW_KEY, String(startedAt));
    }
    const tick = () => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const left = Math.max(0, Math.ceil(PREVIEW_SECONDS - elapsed));
      setPreviewSecondsLeft(left);
      setPreviewExpired(left <= 0);
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [isPremium]);

  // Alerts: detect price crossing any N1-N6 level
  useEffect(() => {
    if (!alertsOn || !isPremium || !levels?.levels || !levels.price) return;
    const p = levels.price;
    const prev = lastPriceRef.current[curAsset];
    if (prev != null && prev !== p) {
      const checks: Array<[string, number]> = [];
      levels.levels.res.forEach((v, i) => checks.push([`N${i+1} ${t.res}`, v]));
      levels.levels.sup.forEach((v, i) => checks.push([`N${i+1} ${t.sup}`, v]));
      checks.forEach(([label, lv]) => {
        const crossed = (prev < lv && p >= lv) || (prev > lv && p <= lv);
        if (crossed) {
          const key = `${curAsset}:${label}`;
          const lastAt = alertedRef.current[key] || 0;
          if (Date.now() - lastAt > 8_000) {
            alertedRef.current[key] = Date.now();
            pushToast(`${curAsset} · ${label} · ${money(lv, cur)}`);
          }
        }
      });
    }
    lastPriceRef.current[curAsset] = p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels?.price]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const curMarket = markets[curAsset];
  const livePrice = curMarket && !curMarket.offline && curMarket.price > 0 ? curMarket.price : null;

  const list = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return FLAT.filter(a => a[0].toLowerCase().includes(q) || a[1].toLowerCase().includes(q));
    }
    return ASSETS[tab].map(a => [...a, tab] as const);
  }, [search, tab]);

  function pushToast(msg: string) {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }

  function selectAsset(sym: string) {
    setCurAsset(sym);
    alertedRef.current = {};
  }

  function copyUsdt() {
    navigator.clipboard?.writeText('TAh8pftt2kszhrJyUMXZt3vfbctmWPFgaL');
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function payWithPagopar() {
    try {
      const r = await fetch('/api/pagopar/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: 'pro', billingPeriod: 'monthly' }),
      });
      const j = await r.json();
      if (j?.paymentUrl) window.location.href = j.paymentUrl;
      else pushToast(j?.error || 'Pagopar: error iniciando el pago');
    } catch {
      pushToast('Pagopar: error de red');
    }
  }

  // Risk calc derived
  const riskOut = useMemo(() => {
    const bal = parseFloat(rBal);
    const pct = parseFloat(rPct);
    const stop = parseFloat(rStop);
    if (!bal || !pct || livePrice == null) return { amt: '—', units: '—' };
    const amt = bal * (pct / 100);
    const amtCur = SYM[cur] + (amt * FX[cur]).toFixed(2);
    if (!stop || Math.abs(livePrice - stop) <= 0) return { amt: amtCur, units: '—' };
    const units = amt / Math.abs(livePrice - stop);
    return { amt: amtCur, units: units < 1 ? units.toFixed(4) : units.toFixed(2) };
  }, [rBal, rPct, rStop, livePrice, cur]);

  // Chart symbol from asset selection
  const tvSym = useMemo(() => FLAT.find(a => a[0] === curAsset)?.[2] ?? 'OANDA:XAUUSD', [curAsset]);

  // Blur over premium content when user is not premium AND has used up preview
  const shouldBlurAll = !isPremium && previewExpired;

  // ── Render ─────────────────────────────────────────────────────────────────
  const curName = FLAT.find(a => a[0] === curAsset)?.[1] ?? '';
  const upChg = curMarket ? curMarket.changePercent >= 0 : true;

  return (
    <div style={{ background: BG, color: TEXT, minHeight: '100vh', fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif", fontSize: 14 }}>
      <style jsx global>{`
        .mono { font-family: ${MONO}; }
        .up { color: ${UP}; } .down { color: ${DOWN}; }
        .term-sel { background:${PANEL}; color:${TEXT}; border:1px solid ${LINE}; border-radius:6px; padding:7px 8px; font-size:12px; cursor:pointer; font-family:inherit; }
        .term-btn { font-weight:600; border:none; border-radius:6px; cursor:pointer; padding:8px 15px; font-size:13px; font-family:inherit; transition: background .15s; }
        .term-btn-gold { background:${GOLD}; color:#160F00; }
        .term-btn-gold:hover { background:${GOLD_L}; }
        .term-btn-ghost { background:transparent; color:${MUTED}; border:1px solid ${LINE}; }
        .term-btn-ghost:hover { color:${TEXT}; }
        .term-input { background:${BG}; color:${TEXT}; border:1px solid ${LINE}; border-radius:6px; padding:8px 10px; font-size:13px; font-family:inherit; width:100%; }
        .term-input:focus { outline:none; border-color:${GOLD}; }
        .pulse { animation: pulse 1.6s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.55} }
      `}</style>

      {/* HEADER */}
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:56, padding:'0 20px', borderBottom:`1px solid ${LINE}`, background:BG2, position:'sticky', top:0, zIndex:40 }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logonuevos.png" alt="Sacred Levels" height={30} style={{ height:30, width:'auto' }} />
        </Link>
        <nav style={{ display:'flex', gap:22, alignItems:'center', flexWrap:'wrap' }}>
          <a href="#markets" style={{ fontSize:13.5, color:MUTED, fontWeight:500 }}>{t.n_markets}</a>
          <a href="#levels"  style={{ fontSize:13.5, color:MUTED, fontWeight:500 }}>{t.n_levels}</a>
          <a href="#tools"   style={{ fontSize:13.5, color:MUTED, fontWeight:500 }}>{t.n_tools}</a>
          {isPremium && (
            <>
              <span style={{ color:LINE, fontSize:13 }}>·</span>
              <Link href="/quantum" style={{ fontSize:13.5, color:GOLD, fontWeight:600 }}>Quantum</Link>
              <Link href="/hub"     style={{ fontSize:13.5, color:GOLD, fontWeight:600 }}>Hub</Link>
              <Link href="/qtrader" style={{ fontSize:13.5, color:GOLD, fontWeight:600 }}>QTrader</Link>
              <Link href="/ser"     style={{ fontSize:13.5, color:GOLD, fontWeight:600 }}>SER</Link>
            </>
          )}
          {!isPremium && (
            <>
              <a href="#learn"  style={{ fontSize:13.5, color:MUTED, fontWeight:500 }}>{t.n_learn}</a>
              <a href="#planes" style={{ fontSize:13.5, color:MUTED, fontWeight:500 }}>{t.n_plans}</a>
            </>
          )}
        </nav>
        <div style={{ display:'flex', gap:9, alignItems:'center' }}>
          <select className="term-sel" value={cur}  onChange={e => setCur(e.target.value as Currency)}>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
            <option value="INR">INR ₹</option>
          </select>
          <select className="term-sel" value={lang} onChange={e => setLang(e.target.value as Lang)}>
            <option value="es">ES</option>
            <option value="en">EN</option>
            <option value="hi">हि</option>
          </select>
          {isPremium ? (
            <button className="term-btn term-btn-ghost" onClick={() => signOut({ callbackUrl: '/' })}>Salir</button>
          ) : (
            <a href="#planes"><button className="term-btn term-btn-gold">{t.subscribe}</button></a>
          )}
        </div>
      </header>

      {/* TICKER */}
      <div style={{ display:'flex', alignItems:'center', gap:26, padding:'11px 20px', borderBottom:`1px solid ${LINE}`, background:PANEL, overflowX:'auto', whiteSpace:'nowrap' }}>
        <div style={{ fontSize:17, fontWeight:700, display:'flex', flexDirection:'column', lineHeight:1.15 }}>
          {curAsset}
          <small style={{ fontSize:11, color:MUTED, fontWeight:400 }}>{curName}</small>
        </div>
        <div className="mono" style={{ fontSize:19, fontFamily:MONO }}>
          {livePrice != null ? money(livePrice, cur) : '—'}
        </div>
        <TickerMetric label={t.chg}  value={curMarket ? `${upChg ? '+' : ''}${curMarket.changePercent.toFixed(2)}%` : '—'} color={upChg ? UP : DOWN} />
        <TickerMetric label={t.high} value={curMarket ? money(curMarket.high, cur) : '—'} />
        <TickerMetric label={t.low}  value={curMarket ? money(curMarket.low,  cur) : '—'} />
      </div>

      {/* 2-MIN PREVIEW BANNER */}
      {!isPremium && previewSecondsLeft != null && (
        <div style={{
          padding:'8px 20px',
          borderBottom:`1px solid ${LINE}`,
          background: previewExpired ? 'rgba(234,57,67,0.08)' : 'rgba(201,149,42,0.08)',
          fontSize:12.5,
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <span>
            <strong style={{ color: previewExpired ? DOWN : GOLD }}>
              {previewExpired ? t.preview_blocked : t.preview_h}
            </strong>
            <span style={{ color: MUTED, marginLeft: 12 }}>
              {previewExpired ? t.preview_sub : `${Math.floor(previewSecondsLeft / 60)}:${String(previewSecondsLeft % 60).padStart(2,'0')} · ${t.preview_sub}`}
            </span>
          </span>
          <a href="#planes"><button className="term-btn term-btn-gold">{t.preview_cta}</button></a>
        </div>
      )}

      {/* MAIN GRID */}
      <div id="markets" style={{
        position: 'relative',
        display:'grid',
        gridTemplateColumns:'186px 230px 1fr 312px',
        height: 'calc(100vh - 56px - 47px)',
        minHeight: 540,
      }}>
        {/* Blur overlay when preview expired */}
        {shouldBlurAll && (
          <div style={{
            position:'absolute', inset:0, zIndex:50,
            backdropFilter:'blur(10px)',
            background:'rgba(10,13,18,0.65)',
            display:'flex', alignItems:'center', justifyContent:'center',
            flexDirection:'column', gap:18,
          }}>
            <div style={{ textAlign:'center', maxWidth: 420, padding:'0 20px' }}>
              <p style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{t.preview_blocked}</p>
              <p style={{ color:MUTED, fontSize:13.5, marginBottom:18 }}>{t.preview_sub}</p>
              <a href="#planes"><button className="term-btn term-btn-gold" style={{ padding:'12px 22px', fontSize:14 }}>{t.preview_cta}</button></a>
            </div>
          </div>
        )}

        {/* ── ORDER BOOK ── */}
        <aside style={col(true)}>
          <ColH>{t.ob}</ColH>
          <OrderBook price={livePrice} cur={cur} />
        </aside>

        {/* ── ASSETS LIST ── */}
        <aside style={col(true)}>
          <div style={{ padding:'10px 13px', borderBottom:`1px solid ${LINE2}`, flexShrink:0 }}>
            <input
              className="term-input"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize:12, padding:'7px 9px' }}
            />
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, padding:'8px 10px', borderBottom:`1px solid ${LINE2}`, flexShrink:0 }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => { setSearch(''); setTab(c); }}
                style={{
                  fontSize:10.5, padding:'5px 9px', borderRadius:5,
                  background: c === tab && !search ? PANEL2 : 'transparent',
                  color: c === tab && !search ? TEXT : MUTED,
                  border:`1px solid ${c === tab && !search ? LINE : 'transparent'}`,
                  cursor:'pointer', fontFamily:'inherit',
                }}
              >{c}</button>
            ))}
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {list.map(a => {
              const sym = a[0];
              const name = a[1];
              const m = markets[sym];
              const p = m && !m.offline && m.price > 0 ? m.price : null;
              const chg = m ? m.changePercent : 0;
              const isSel = sym === curAsset;
              return (
                <div
                  key={sym}
                  onClick={() => selectAsset(sym)}
                  style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'8px 13px', borderBottom:`1px solid ${LINE2}`,
                    cursor:'pointer',
                    background: isSel ? PANEL2 : 'transparent',
                    borderLeft: `2px solid ${isSel ? GOLD : 'transparent'}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize:12.5, fontWeight:600 }}>{sym}</div>
                    <div style={{ fontSize:10.5, color:MUTED }}>{name}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="mono" style={{ fontSize:12 }}>{p != null ? money(p, cur) : '—'}</div>
                    <div style={{ fontSize:10.5, color: chg >= 0 ? UP : DOWN }}>
                      {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── CHART ── */}
        <section style={col(true)}>
          <TVChart symbol={tvSym} locale={lang === 'hi' ? 'en' : lang} />
        </section>

        {/* ── RIGHT: LEVELS + RISK CALC + ALERTS ── */}
        <aside style={col(false)}>
          <ColH>
            <span id="levels">{t.box_levels}</span>
            <div style={{ display:'flex', gap:4 }}>
              {TIMEFRAMES.map(x => (
                <button
                  key={x}
                  onClick={() => setTf(x)}
                  style={{
                    fontSize:10.5, padding:'4px 9px', borderRadius:5,
                    background: x === tf ? GOLD : 'transparent',
                    color: x === tf ? '#160F00' : MUTED,
                    border:`1px solid ${x === tf ? GOLD : LINE}`,
                    cursor:'pointer', fontFamily:'inherit', fontWeight:600,
                  }}
                >{x}</button>
              ))}
            </div>
          </ColH>
          <div style={{ flex:1, overflowY:'auto', padding:'10px 12px' }}>
            <LevelsPanel
              levels={levels}
              price={livePrice}
              cur={cur}
              t={t}
              isPremium={isPremium}
            />

            {/* Risk calculator */}
            <div style={{ marginTop:16, padding:12, background:PANEL2, borderRadius:8, border:`1px solid ${LINE2}` }}>
              <p style={{ fontSize:11, textTransform:'uppercase', letterSpacing:.7, color:MUTED, marginBottom:10 }}>{t.risk_h}</p>
              <RiskInput label={t.r_bal}  value={rBal}  onChange={setRBal} placeholder="1000" />
              <RiskInput label={t.r_pct}  value={rPct}  onChange={setRPct} />
              <RiskInput label={t.r_stop} value={rStop} onChange={setRStop} placeholder="—" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10 }}>
                <RiskOut label={t.r_amt}   value={riskOut.amt}   color={DOWN} />
                <RiskOut label={t.r_units} value={riskOut.units} color={UP} />
              </div>
            </div>

            {/* Alerts */}
            <div style={{ marginTop:12, padding:12, background:PANEL2, borderRadius:8, border:`1px solid ${LINE2}` }}>
              <p style={{ fontSize:11, textTransform:'uppercase', letterSpacing:.7, color:MUTED, marginBottom:8 }}>{t.alert_h}</p>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12.5, cursor:'pointer' }}>
                <input type="checkbox" checked={alertsOn} onChange={e => setAlertsOn(e.target.checked)} />
                <span style={{ color:MUTED }}>{t.alert_txt}</span>
              </label>
            </div>
          </div>
        </aside>
      </div>

      {/* ── BELOW: LEARN ── */}
      <section id="learn" style={{ padding:'60px 20px', background:BG2, borderTop:`1px solid ${LINE}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <h2 style={{ fontSize:28, fontWeight:700, marginBottom:4 }}>{t.learn_h}</h2>
          <p style={{ color:MUTED, fontSize:14, marginBottom:28 }}>{t.learn_sub}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:18 }}>
            {t.steps.map(([n, title, body]) => (
              <div key={n} style={{ padding:20, background:PANEL, borderRadius:10, border:`1px solid ${LINE}` }}>
                <div style={{ fontSize:10.5, color:GOLD, letterSpacing:1.5, fontWeight:700, marginBottom:8 }}>PASO {n}</div>
                <h5 style={{ fontSize:16, marginBottom:8, fontWeight:600 }}>{title}</h5>
                <p style={{ fontSize:13, color:MUTED, lineHeight:1.5 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BELOW: TOOLS ── */}
      <section id="tools" style={{ padding:'60px 20px', background:BG, borderTop:`1px solid ${LINE}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <h2 style={{ fontSize:28, fontWeight:700, marginBottom:4 }}>{t.tools_h}</h2>
          <p style={{ color:MUTED, fontSize:14, marginBottom:28 }}>{t.tools_sub}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:14 }}>
            {t.t.map((tool, i) => (
              <div key={i} style={{ padding:18, background:PANEL, borderRadius:10, border:`1px solid ${LINE}`, display:'flex', flexDirection:'column' }}>
                <h5 style={{ fontSize:14.5, fontWeight:600, marginBottom:6 }}>{tool[0]}</h5>
                <p style={{ fontSize:12.5, color:MUTED, lineHeight:1.5, flex:1 }}>{tool[1]}</p>
                <span style={{
                  alignSelf:'flex-start', marginTop:10, fontSize:10.5, fontWeight:700,
                  padding:'3px 9px', borderRadius:99,
                  background: tool[2].toLowerCase().includes('pro') || tool[2].includes('प्रो') ? 'rgba(201,149,42,0.15)' : 'rgba(124,135,152,0.12)',
                  color: tool[2].toLowerCase().includes('pro') || tool[2].includes('प्रो') ? GOLD : MUTED,
                }}>{tool[2]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BELOW: PLANS / PAYMENT ── */}
      <section id="planes" style={{ padding:'60px 20px', background:BG2, borderTop:`1px solid ${LINE}` }}>
        <div style={{ maxWidth:880, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize:30, fontWeight:700, marginBottom:6 }}>{t.plan_h}</h2>
          <p style={{ color:MUTED, fontSize:14.5, marginBottom:14, maxWidth:560, margin:'6px auto 18px' }}>{t.plan_sub}</p>
          <div style={{ fontSize:30, fontWeight:800, color:GOLD, marginBottom:32 }}>
            Gs. 180.000 <small style={{ fontSize:14, color:MUTED, fontWeight:500 }}>/ 30 USDT</small>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:18, textAlign:'left' }}>
            {/* USDT */}
            <div style={{ padding:24, background:PANEL, borderRadius:12, border:`1px solid ${LINE}` }}>
              <b style={{ fontSize:14.5 }}>{t.m_usdt}</b>
              <p style={{ color:MUTED, fontSize:12.5, margin:'8px 0 14px' }}>
                {lang === 'es' ? 'Enviá 30 USDT a la dirección de abajo. Después subí el comprobante.'
                  : lang === 'en' ? 'Send 30 USDT to the address below, then upload the receipt.'
                  : '30 USDT नीचे दिए पते पर भेजें, फिर रसीद अपलोड करें।'}
              </p>
              <div style={{
                background:BG, padding:'10px 12px', borderRadius:6,
                border:`1px solid ${LINE}`,
                fontFamily:MONO, fontSize:11.5, wordBreak:'break-all', marginBottom:10,
              }}>
                TAh8pftt2kszhrJyUMXZt3vfbctmWPFgaL
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={copyUsdt} className="term-btn term-btn-ghost" style={{ flex:1 }}>
                  {copied ? 'OK' : t.copy}
                </button>
                <Link href="/pago/usdt" style={{ flex:1 }}>
                  <button className="term-btn term-btn-gold" style={{ width:'100%' }}>
                    {lang === 'es' ? 'Subir comprobante' : lang === 'en' ? 'Upload receipt' : 'रसीद अपलोड करें'}
                  </button>
                </Link>
              </div>
            </div>

            {/* PagoPar */}
            <div style={{ padding:24, background:PANEL, borderRadius:12, border:`1px solid ${LINE}` }}>
              <b style={{ fontSize:14.5 }}>{t.m_other}</b>
              <p style={{ color:MUTED, fontSize:12.5, margin:'8px 0 14px' }}>{t.m_pp_txt}</p>
              <button onClick={payWithPagopar} className="term-btn term-btn-gold" style={{ width:'100%' }}>
                {t.m_pp}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:'24px 20px', borderTop:`1px solid ${LINE}`, background:BG2 }}>
        <p style={{ color:MUTED, fontSize:11.5, textAlign:'center', maxWidth:880, margin:'0 auto', lineHeight:1.6 }}>{t.disc}</p>
        <p style={{ color:MUTED, fontSize:10.5, textAlign:'center', marginTop:8 }}>{userEmail}</p>
      </footer>

      {/* TOAST CONTAINER */}
      <div style={{ position:'fixed', right:20, bottom:20, display:'flex', flexDirection:'column', gap:8, zIndex:60 }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: PANEL2, color: TEXT, padding:'10px 14px', borderRadius:8,
            border:`1px solid ${GOLD}`, fontSize:12.5,
            boxShadow:'0 10px 24px rgba(0,0,0,0.4)',
          }}>⚠ {toast.msg}</div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Subcomponents

function col(border: boolean): React.CSSProperties {
  return {
    borderRight: border ? `1px solid ${LINE}` : 'none',
    background: PANEL,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  };
}

function ColH({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding:'10px 13px', borderBottom:`1px solid ${LINE2}`,
      fontSize:11, textTransform:'uppercase', letterSpacing:.7, color:MUTED,
      display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0,
    }}>{children}</div>
  );
}

function TickerMetric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ minWidth:0 }}>
      <small style={{ display:'block', color:MUTED, fontSize:10.5, textTransform:'uppercase', letterSpacing:.4, marginBottom:2 }}>{label}</small>
      <b className="mono" style={{ fontSize:13, fontWeight:600, color: color || TEXT, fontFamily:MONO }}>{value}</b>
    </div>
  );
}

function OrderBook({ price, cur }: { price: number | null; cur: Currency }) {
  if (price == null) return <div style={{ padding:20, color:MUTED, fontSize:12 }}>—</div>;
  // Synthetic order-book preview based on real price (purely visual)
  const asks: React.ReactNode[] = [];
  const bids: React.ReactNode[] = [];
  for (let i = 8; i >= 1; i--) {
    const pr = price * (1 + i * 0.0004);
    const amt = ((Math.sin(price + i) * 0.5 + 0.5) * 2).toFixed(3);
    const w   = (Math.sin(price * i) * 0.5 + 0.5) * 70 + 10;
    asks.push(<OBRow key={`a${i}`} side="down" w={w} price={money(pr, cur)} amt={amt} />);
  }
  for (let j = 1; j <= 8; j++) {
    const pr = price * (1 - j * 0.0004);
    const amt = ((Math.cos(price + j) * 0.5 + 0.5) * 2).toFixed(3);
    const w   = (Math.cos(price * j) * 0.5 + 0.5) * 70 + 10;
    bids.push(<OBRow key={`b${j}`} side="up" w={w} price={money(pr, cur)} amt={amt} />);
  }
  return (
    <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', fontFamily:MONO, fontSize:11 }}>
      <div style={{ flex:1, overflow:'hidden' }}>{asks}</div>
      <div style={{ padding:'8px 13px', textAlign:'center', borderTop:`1px solid ${LINE2}`, borderBottom:`1px solid ${LINE2}`, color:GOLD, fontFamily:MONO, fontSize:13, fontWeight:700 }}>{money(price, cur)}</div>
      <div style={{ flex:1, overflow:'hidden' }}>{bids}</div>
    </div>
  );
}

function OBRow({ side, w, price, amt }: { side: 'up' | 'down'; w: number; price: string; amt: string }) {
  const color = side === 'up' ? UP : DOWN;
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'2px 13px', position:'relative' }}>
      <span style={{
        position:'absolute', right:0, top:0, bottom:0, width:`${w}%`,
        background: side === 'up' ? 'rgba(22,199,132,0.10)' : 'rgba(234,57,67,0.10)',
      }} />
      <span style={{ position:'relative', zIndex:1, color }}>{price}</span>
      <span style={{ position:'relative', zIndex:1, color:MUTED }}>{amt}</span>
    </div>
  );
}

function LevelsPanel({
  levels, price, cur, t, isPremium,
}: {
  levels: LevelsResponse | null;
  price: number | null;
  cur: Currency;
  t: typeof STR.es;
  isPremium: boolean;
}) {
  if (price == null) return <div style={{ padding:16, color:MUTED, fontSize:12.5 }}>—</div>;

  if (!isPremium || !levels?.levels || !levels.bias) {
    // Show locked teaser: 12 rows blurred + price center + CTA
    return (
      <div>
        <div style={{ filter:'blur(6px)', userSelect:'none', pointerEvents:'none' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <LvRow key={`r-${i}`} label={`N${6-i}`} value={money(price * (1 + (6-i) * 0.01), cur)} pct={`+${((6-i) * 0.5).toFixed(2)}%`} type="res" />
          ))}
          <LvRow label="●" value={money(price, cur)} pct={t.price} type="price" />
          {Array.from({ length: 6 }).map((_, i) => (
            <LvRow key={`s-${i}`} label={`N${i+1}`} value={money(price * (1 - (i+1) * 0.01), cur)} pct={`-${((i+1) * 0.5).toFixed(2)}%`} type="sup" />
          ))}
        </div>
        <div style={{ marginTop:14, padding:14, background:PANEL2, borderRadius:8, border:`1px dashed ${GOLD}50`, textAlign:'center' }}>
          <p style={{ fontSize:12.5, color:MUTED, marginBottom:10 }}>{t.lock_p}</p>
          <a href="#planes"><button className="term-btn term-btn-gold" style={{ width:'100%' }}>{t.lock_b}</button></a>
        </div>
      </div>
    );
  }

  const biasColor = levels.bias.label === 'bull' ? UP : levels.bias.label === 'bear' ? DOWN : GOLD;
  const biasLabel = levels.bias.label === 'bull' ? t.bull : levels.bias.label === 'bear' ? t.bear : t.neu;

  return (
    <div>
      {/* Resistances (top → bottom: N6 → N1 just above price) */}
      {[5,4,3,2,1,0].map(i => (
        <LvRow
          key={`r${i}`}
          label={`N${i+1}`}
          value={money(levels.levels!.res[i], cur)}
          pct={`+${levels.levels!.resPct[i].toFixed(2)}%`}
          type="res"
        />
      ))}
      <LvRow label="●" value={money(price, cur)} pct={t.price} type="price" />
      {[0,1,2,3,4,5].map(i => (
        <LvRow
          key={`s${i}`}
          label={`N${i+1}`}
          value={money(levels.levels!.sup[i], cur)}
          pct={`-${levels.levels!.supPct[i].toFixed(2)}%`}
          type="sup"
        />
      ))}
      {/* Bias */}
      <div style={{ marginTop:14, padding:14, background:PANEL2, borderRadius:8, border:`1px solid ${LINE2}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ fontSize:11, textTransform:'uppercase', letterSpacing:.7, color:MUTED }}>{t.bias}</span>
          <b style={{ color: biasColor, fontSize:13 }}>{biasLabel}</b>
        </div>
        <div style={{ height:6, background:'#171E2A', borderRadius:99, overflow:'hidden' }}>
          <div style={{ width:`${levels.bias.score}%`, height:'100%', background:biasColor, transition:'width .3s' }} />
        </div>
      </div>
    </div>
  );
}

function LvRow({ label, value, pct, type }: { label: string; value: string; pct: string; type: 'res' | 'sup' | 'price' }) {
  const color = type === 'res' ? DOWN : type === 'sup' ? UP : GOLD;
  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'7px 4px',
      borderBottom: type === 'price' ? `1px solid ${GOLD}40` : `1px solid ${LINE2}`,
      background: type === 'price' ? 'rgba(201,149,42,0.06)' : 'transparent',
    }}>
      <span style={{ fontSize:11.5, color, fontWeight:600, minWidth:28 }}>{label}</span>
      <span className="mono" style={{ fontSize:12.5, color: type === 'price' ? GOLD : TEXT, fontFamily:MONO }}>{value}</span>
      <span style={{ fontSize:10.5, color:MUTED, minWidth:60, textAlign:'right' }}>{pct}</span>
    </div>
  );
}

function RiskInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ marginBottom:8 }}>
      <label style={{ display:'block', fontSize:10.5, color:MUTED, marginBottom:4, textTransform:'uppercase', letterSpacing:.4 }}>{label}</label>
      <input className="term-input" type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ fontSize:12 }} />
    </div>
  );
}

function RiskOut({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <small style={{ display:'block', color:MUTED, fontSize:10.5, textTransform:'uppercase', letterSpacing:.4, marginBottom:3 }}>{label}</small>
      <b className="mono" style={{ fontSize:13, color, fontFamily:MONO }}>{value}</b>
    </div>
  );
}

// ── TradingView chart widget ───────────────────────────────────────────────────
function TVChart({ symbol, locale }: { symbol: string; locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const host = ref.current;
    host.innerHTML = '';
    const ensureLib = () => new Promise<void>(resolve => {
      const w = window as unknown as { TradingView?: { widget: new (cfg: object) => unknown } };
      if (w.TradingView) return resolve();
      const s = document.createElement('script');
      s.src = 'https://s3.tradingview.com/tv.js';
      s.async = true;
      s.onload = () => resolve();
      document.body.appendChild(s);
    });
    let cancelled = false;
    ensureLib().then(() => {
      if (cancelled || !host) return;
      const id = `tv-${Math.random().toString(36).slice(2)}`;
      host.innerHTML = `<div id="${id}" style="width:100%;height:100%"></div>`;
      const w = window as unknown as { TradingView: { widget: new (cfg: object) => unknown } };
      new w.TradingView.widget({
        autosize: true,
        symbol,
        interval: '60',
        timezone: 'America/Asuncion',
        theme: 'dark',
        style: '1',
        locale,
        toolbar_bg: PANEL,
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        container_id: id,
      });
    });
    return () => { cancelled = true; host.innerHTML = ''; };
  }, [symbol, locale]);
  return <div ref={ref} style={{ width:'100%', height:'100%', minHeight:480 }} />;
}
