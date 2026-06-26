'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const BG    = '#0A0D12';
const PANEL = '#0F141C';
const LINE  = '#1E2531';
const TEXT  = '#E6E9EF';
const MUTED = '#7C8798';
const GOLD  = '#C9952A';
const UP    = '#16C784';

export default function PagoExitoPage() {
  const { data: session, status, update } = useSession();
  const [check, setCheck] = useState<'loading' | 'ready' | 'pending'>('loading');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        // Force NextAuth session refresh so we pick up the new subscription
        await update?.();
        const r = await fetch('/api/user/subscription', { cache: 'no-store' });
        if (cancelled) return;
        if (r.ok) {
          const j = await r.json();
          if (j?.isPremium === true) {
            setCheck('ready');
            // Hard-redirect so the home renders with the fresh session
            setTimeout(() => { window.location.href = '/'; }, 1200);
            return;
          }
        }
      } catch { /* keep polling */ }
      setAttempts(a => a + 1);
      setCheck('pending');
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: BG, color: TEXT, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif" }}>
      <div style={{ padding: 32, background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12, maxWidth: 480, width: '100%', margin: '0 20px', textAlign: 'center' }}>
        {check === 'ready' ? (
          <>
            <div style={{ fontSize: 36, color: UP, marginBottom: 8 }}>✓</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Pago confirmado</h1>
            <p style={{ color: MUTED, fontSize: 14 }}>Te llevamos al terminal con tu acceso activo…</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 36, color: GOLD, marginBottom: 8 }}>⏳</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Confirmando tu pago…</h1>
            <p style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.5 }}>
              Estamos verificando con la pasarela. Si pagaste recién, esto puede tardar entre 5 segundos y 2 minutos.
            </p>
            <p style={{ color: MUTED, fontSize: 11, marginTop: 14 }}>Intento {attempts}…</p>
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/" style={{ color: GOLD, fontWeight: 600, fontSize: 13.5 }}>Volver al terminal</Link>
              <span style={{ color: MUTED, fontSize: 11.5 }}>
                {session?.user?.email ? <>Cuenta: <code>{session.user.email}</code></> : 'No estás logueado'} {' '}{status === 'loading' ? '· cargando sesión…' : ''}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
