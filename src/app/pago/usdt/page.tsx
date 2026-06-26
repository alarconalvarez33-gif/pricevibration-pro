'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const BG    = '#0A0D12';
const BG2   = '#0D1118';
const PANEL = '#0F141C';
const LINE  = '#1E2531';
const TEXT  = '#E6E9EF';
const MUTED = '#7C8798';
const GOLD  = '#C9952A';
const UP    = '#16C784';
const DOWN  = '#EA3943';
const MONO  = "'Consolas','SF Mono',ui-monospace,monospace";

const ADDR = 'TAh8pftt2kszhrJyUMXZt3vfbctmWPFgaL';

export default function PagoUsdtPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [txid, setTxid]     = useState('');
  const [sender, setSender] = useState('');
  const [note, setNote]     = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy]     = useState(false);
  const [done, setDone]     = useState<string | null>(null);
  const [err, setErr]       = useState<string | null>(null);

  if (status === 'loading') {
    return <div style={{ background: BG, color: TEXT, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando…</div>;
  }
  if (!session?.user?.email) {
    router.replace('/login?callbackUrl=%2Fpago%2Fusdt');
    return null;
  }

  const copy = () => {
    navigator.clipboard?.writeText(ADDR);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  async function submit() {
    setBusy(true); setErr(null); setDone(null);
    try {
      const r = await fetch('/api/payments/usdt/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid: txid.trim(), senderAddress: sender.trim(), note: note.trim() }),
      });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || 'No se pudo enviar el comprobante'); return; }
      setDone(j.message || 'Pago en revisión.');
    } catch {
      setErr('Error de red. Probá de nuevo.');
    } finally { setBusy(false); }
  }

  return (
    <div style={{ background: BG, color: TEXT, minHeight: '100vh', fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif" }}>
      <header style={{ padding: '14px 20px', borderBottom: `1px solid ${LINE}`, background: BG2 }}>
        <Link href="/" style={{ color: MUTED, fontSize: 13.5 }}>← Volver al terminal</Link>
      </header>

      <main style={{ maxWidth: 620, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Pago con USDT</h1>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>
          Enviá <b style={{ color: GOLD }}>30 USDT</b> por la red Tron (TRC-20) a la dirección de abajo y registrá el TXID. Activamos tu cuenta en menos de 1 hora.
        </p>

        {/* Address */}
        <div style={{ padding: 20, background: PANEL, borderRadius: 10, border: `1px solid ${LINE}`, marginBottom: 22 }}>
          <p style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: .7, marginBottom: 8 }}>Dirección USDT · TRC-20</p>
          <div style={{ background: BG, padding: '12px 14px', borderRadius: 6, border: `1px solid ${LINE}`, fontFamily: MONO, fontSize: 12, wordBreak: 'break-all', marginBottom: 12 }}>
            {ADDR}
          </div>
          <button onClick={copy} style={{
            background: copied ? UP : GOLD, color: '#0a0a0a',
            border: 'none', padding: '10px 16px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 13,
          }}>{copied ? '✓ Copiada' : 'Copiar dirección'}</button>
        </div>

        {/* Form */}
        {done ? (
          <div style={{ padding: 20, background: 'rgba(22,199,132,0.08)', border: `1px solid ${UP}50`, borderRadius: 10, color: UP, fontSize: 14, lineHeight: 1.6 }}>
            <b>✓ Comprobante recibido.</b>
            <p style={{ color: TEXT, marginTop: 8 }}>{done}</p>
            <Link href="/" style={{ display: 'inline-block', marginTop: 14, color: GOLD, fontWeight: 600 }}>Volver al terminal →</Link>
          </div>
        ) : (
          <div style={{ padding: 20, background: PANEL, borderRadius: 10, border: `1px solid ${LINE}` }}>
            <Field label="TXID (hash de la transacción)" placeholder="ej: e8c4f8a..."
              hint="Está en Binance → Wallet → Historial de retiros, junto al pago."
              value={txid} onChange={setTxid} />
            <Field label="Dirección que envió (opcional)" placeholder="T…"
              value={sender} onChange={setSender} />
            <Field label="Nota (opcional)" placeholder=""
              value={note} onChange={setNote} multiline />

            {err && <p style={{ color: DOWN, fontSize: 13, marginBottom: 10 }}>{err}</p>}

            <button onClick={submit} disabled={busy || !txid.trim()}
              style={{
                width: '100%', padding: 14, border: 'none', borderRadius: 8,
                background: busy || !txid.trim() ? '#555' : GOLD,
                color: '#160F00', fontWeight: 700, fontSize: 14, cursor: busy ? 'wait' : 'pointer',
                marginTop: 8,
              }}>
              {busy ? 'Enviando…' : 'Enviar comprobante'}
            </button>

            <p style={{ color: MUTED, fontSize: 11.5, marginTop: 14, lineHeight: 1.55 }}>
              Si preferís, también podés mandar la captura por WhatsApp a{' '}
              <a href="https://wa.me/595981234128" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>+595 981 234 128</a>.
            </p>
          </div>
        )}

        <p style={{ color: MUTED, fontSize: 11.5, marginTop: 30, lineHeight: 1.6, textAlign: 'center' }}>
          Cuenta a activar: <code style={{ color: TEXT }}>{session.user.email}</code>
        </p>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, hint, multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string; multiline?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11.5, color: MUTED, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2}
          style={{ width: '100%', background: BG, color: TEXT, border: `1px solid ${LINE}`, borderRadius: 6, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', background: BG, color: TEXT, border: `1px solid ${LINE}`, borderRadius: 6, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit' }} />
      )}
      {hint && <p style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}
