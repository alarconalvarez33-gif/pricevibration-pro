'use client';

import { useEffect, useRef, useState } from 'react';
import { EXNESS_URL } from '@/components/BannerExness';
import { BOARD_PROMO, PROMO_TRACK_URL, type PromoEventName } from '@/lib/promo/boardPromo';

/**
 * Bloque de conversión sobre el tablero de niveles.
 *
 * Sólo se monta cuando el server component ya decidió que corresponde mostrarlo
 * (ver boardPromo.server.ts): acá no hay chequeo de cookies, así no existe el
 * parpadeo de un bloque que aparece y se esconde solo.
 *
 * Medición: la impresión se registra cuando el bloque entra de verdad en
 * pantalla, no cuando se monta — el bloque vive a media página, y contar
 * renders daría un CTR falseado hacia abajo.
 */

function track(event: PromoEventName): Promise<void> {
  return fetch(PROMO_TRACK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promo: BOARD_PROMO, event, path: window.location.pathname }),
    // El clic abre otra pestaña, pero keepalive cubre igual el caso de que el
    // navegador decida descartar la request en vuelo.
    keepalive: true,
  })
    .then(() => undefined)
    // Si la medición falla, el bloque sigue funcionando. Nunca al revés.
    .catch(() => undefined);
}

export default function BoardPromo() {
  const [dismissed, setDismissed] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const logged = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // Sin IntersectionObserver (navegadores viejos) la impresión se registra al
    // montar: preferimos un dato aproximado a no tener dato.
    if (typeof IntersectionObserver === 'undefined') {
      if (!logged.current) {
        logged.current = true;
        void track('impression');
      }
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          // El ref protege del doble montaje del modo estricto en desarrollo.
          if (entry.isIntersecting && !logged.current) {
            logged.current = true;
            void track('impression');
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (dismissed) return null;

  return (
    <div className="board-promo" ref={root}>
      <button
        type="button"
        className="board-promo-x"
        aria-label="Ocultar este aviso por 24 horas"
        onClick={() => {
          // Optimista: el cierre tiene que sentirse instantáneo. La respuesta
          // trae las cookies que lo mantienen oculto en las próximas visitas.
          setDismissed(true);
          void track('dismiss');
        }}
      >
        <span aria-hidden="true">×</span>
      </button>

      <span className="board-promo-k">Acceso sin cuota mensual</span>
      <h3 className="board-promo-h">Te faltan los tres niveles de abajo</h3>
      {/* El acceso se habilita a mano, contra la prueba de la cuenta. El copy no
          puede prometer una activación automática que no existe. */}
      <p className="board-promo-p">
        Abrí tu cuenta con este enlace y mandanos la captura: te habilitamos S1, S2 y S3.
        Sin pago mensual y sin tarjeta.
      </p>

      <a
        href={EXNESS_URL}
        target="_blank"
        rel="sponsored noopener"
        className="board-promo-btn"
        onClick={() => void track('click')}
      >
        Abrir cuenta y activar los seis niveles →
      </a>
    </div>
  );
}
