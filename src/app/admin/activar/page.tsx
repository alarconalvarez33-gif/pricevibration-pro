'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const BG    = '#0A0D12';
const BG2   = '#0D1118';
const PANEL = '#0F141C';
const PANEL2 = '#141A24';
const LINE  = '#1E2531';
const LINE2 = '#161C26';
const TEXT  = '#E6E9EF';
const MUTED = '#7C8798';
const GOLD  = '#C9952A';
const UP    = '#16C784';
const DOWN  = '#EA3943';
const MONO  = "'Consolas','SF Mono',ui-monospace,monospace";

interface Pending {
  orderId: string;
  email: string;
  name: string | null;
  amount: number;
  currency: string;
  createdAt: string;
}

export default function AdminActivarPage() {
  const { status } = useSession();
  const [pending, setPending] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail]   = useState('');
  const [days, setDays]     = useState('30');
  const [orderId, setOrderId] = useState('');
  const [note, setNote]     = useState('');
  const [busy, setBusy]     = useState<string | null>(null);
  const [msg, setMsg]       = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function loadPending() {
    try {
      const r = await fetch('/api/admin/activar', { cache: 'no-store' });
      if (!r.ok) { setPending([]); return; }
      const j = await r.json();
      setPending(j.pending || []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { loadPending(); }, []);

  async function activate(targetEmail: string, targetOrder?: string) {
    setBusy(targetEmail);
    setMsg(null);
    try {
      const r = await fetch('/api/admin/activar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          days: parseInt(days || '30', 10),
          orderId: targetOrder || orderId || undefined,
          note,
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setMsg({ kind: 'err', text: j.error || 'No se pudo activar' });
      } else {
        setMsg({ kind: 'ok', text: `Activado: ${j.email} hasta ${new Date(j.premiumUntil).toLocaleDateString()}` });
        if (!targetOrder) {
          setEmail(''); setOrderId(''); setNote('');
        }
        loadPending();
      }
    } catch {
      setMsg({ kind: 'err', text: 'Error de red' });
    }
    setBusy(null);
  }

  if (status === 'loading') {
    return <div style={{ background: BG, color: TEXT, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando…</div>;
  }

  return (
    <div style={{ background: BG, color: TEXT, minHeight: '100vh', fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif" }}>
      <header style={{ padding: '14px 20px', borderBottom: `1px solid ${LINE}`, background: BG2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: MUTED, fontSize: 13.5 }}>← Terminal</Link>
        <span style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>Admin · Activación manual</span>
      </header>

      <main style={{ maxWidth: 980, margin: '0 auto', padding: '32px 20px' }}>

        {msg && (
          <div style={{
            padding: '12px 16px',
            background: msg.kind === 'ok' ? 'rgba(22,199,132,0.08)' : 'rgba(234,57,67,0.08)',
            border: `1px solid ${msg.kind === 'ok' ? UP : DOWN}50`,
            borderRadius: 8, marginBottom: 20, fontSize: 13.5,
            color: msg.kind === 'ok' ? UP : DOWN,
          }}>{msg.text}</div>
        )}

        {/* Manual activate form */}
        <section style={{ padding: 22, background: PANEL, borderRadius: 12, border: `1px solid ${LINE}`, marginBottom: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Activar a un usuario por email</h2>
          <p style={{ color: MUTED, fontSize: 12.5, marginBottom: 16 }}>
            Sirve para QTrader, USDT, regalos o cualquier activación manual. Mismo flujo que QTrader/QTrader admin.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 10, marginBottom: 10 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@cliente.com" style={inp} />
            <input value={days}  onChange={e => setDays(e.target.value)}  placeholder="30" type="number" style={inp} />
          </div>
          <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="orderId (opcional — marca el Payment como paid)" style={{ ...inp, marginBottom: 10 }} />
          <input value={note}    onChange={e => setNote(e.target.value)}    placeholder="nota (opcional)" style={{ ...inp, marginBottom: 12 }} />
          <button
            onClick={() => activate(email)}
            disabled={!email.trim() || busy === email}
            style={{
              padding: '10px 18px', border: 'none', borderRadius: 7,
              background: !email.trim() ? '#444' : GOLD, color: '#160F00',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            {busy === email ? 'Activando…' : 'Activar suscripción'}
          </button>
        </section>

        {/* Pending USDT submissions */}
        <section style={{ padding: 22, background: PANEL, borderRadius: 12, border: `1px solid ${LINE}` }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
            Comprobantes USDT pendientes
            {!loading && <span style={{ color: MUTED, fontWeight: 400, marginLeft: 8 }}>({pending.length})</span>}
          </h2>

          {loading ? (
            <p style={{ color: MUTED, fontSize: 13 }}>Cargando…</p>
          ) : pending.length === 0 ? (
            <p style={{ color: MUTED, fontSize: 13 }}>Sin pendientes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pending.map(p => (
                <div key={p.orderId} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center',
                  padding: 14, background: PANEL2, borderRadius: 8, border: `1px solid ${LINE2}`,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.email}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 4, fontFamily: MONO, wordBreak: 'break-all' }}>{p.orderId}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {p.amount} {p.currency} · {new Date(p.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => activate(p.email, p.orderId)}
                    disabled={busy === p.email}
                    style={{
                      padding: '8px 14px', border: 'none', borderRadius: 6,
                      background: UP, color: '#001a0f', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    }}
                  >{busy === p.email ? '…' : 'Activar'}</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const inp: React.CSSProperties = {
  background: BG, color: TEXT, border: `1px solid ${LINE}`,
  borderRadius: 6, padding: '10px 12px', fontSize: 13, width: '100%',
  fontFamily: 'inherit',
};
