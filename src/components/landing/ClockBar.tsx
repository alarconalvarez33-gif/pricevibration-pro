'use client';

import { useEffect, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

/** Paraguay is UTC−3 year round — no daylight saving to account for. */
function asuncionParts(now: Date) {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  return new Date(utcMs - 3 * 3_600_000);
}

/**
 * Asunción clock plus the visitor's own local time, which only the client can
 * know. Rendered empty on the server so the markup cannot disagree with the
 * first client paint.
 */
export default function ClockBar() {
  const [py, setPy] = useState<string | null>(null);
  const [local, setLocal] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const a = asuncionParts(now);
      setPy(`${pad(a.getHours())}:${pad(a.getMinutes())}:${pad(a.getSeconds())}`);
      setLocal(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="clockbar">
      <div className="wrap clock-in">
        <span className="clock-l">
          <span className="dotlive" />
          Asunción, Paraguay · <span className="mono">{py ?? '··:··:··'}</span> · UTC−3
        </span>
        <span className="clock-r">Tu hora local: {local ?? '··:··'}</span>
      </div>
    </div>
  );
}
