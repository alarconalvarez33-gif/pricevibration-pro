'use client';

import { useEffect, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Time left until the next 07:00 publication in Asunción (UTC−3, fixed).
 *
 * Computed from the visitor's clock rather than handed down from the server, so
 * it keeps counting without another request.
 */
export default function Countdown() {
  const [left, setLeft] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const py = new Date(now.getTime() + now.getTimezoneOffset() * 60_000 - 3 * 3_600_000);

      const next = new Date(py);
      next.setHours(7, 0, 0, 0);
      if (py >= next) next.setDate(next.getDate() + 1);

      let secs = Math.max(0, Math.floor((next.getTime() - py.getTime()) / 1000));
      const h = Math.floor(secs / 3600);
      secs %= 3600;
      setLeft(`${pad(h)}:${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`);
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  return <b className="mono">{left ?? '··:··:··'}</b>;
}
