/**
 * Bloque de conversión sobre el tablero de niveles: constantes y estado de
 * descarte.
 *
 * Todo lo de acá es puro y sin dependencias de servidor, porque lo importan las
 * tres puntas: el componente cliente (slug y URL del endpoint), el route handler
 * que escribe las cookies y el server component que decide si renderiza. La
 * lectura de `cookies()` vive aparte, en boardPromo.server.ts.
 *
 * Reglas de ocultamiento:
 *   - Cerrar el bloque lo oculta 24 h (cookie sl_promo_hide, con el vencimiento
 *     guardado en el valor).
 *   - Al tercer cierre no vuelve a aparecer por el resto de esa semana (cookie
 *     sl_promo_dismissals, "conteo.inicioDeVentana").
 * Cookies y no localStorage: la decisión se toma en el server component, así el
 * bloque nunca se pinta para después desaparecer.
 */

/** Slug del único bloque que existe hoy. El endpoint sólo acepta esta lista. */
export const BOARD_PROMO = 'board_exness';

export const PROMO_SLUGS = new Set([BOARD_PROMO]);

export type PromoEventName = 'impression' | 'click' | 'dismiss';

export const PROMO_EVENTS = new Set<string>(['impression', 'click', 'dismiss']);

export const PROMO_TRACK_URL = '/api/promo/track';

/** Cierre puntual: oculta el bloque por 24 h. */
export const HIDE_COOKIE = 'sl_promo_hide';
/** Cierres acumulados dentro de la ventana semanal. */
export const COUNT_COOKIE = 'sl_promo_dismissals';
/** Id anónimo para poder unir impresión y clic de un visitante sin sesión. */
export const VISITOR_COOKIE = 'sl_vid';

export const HIDE_MS = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const VISITOR_MAX_AGE = 60 * 60 * 24 * 180; // 180 días

/** Cierres tolerados por semana antes de callar el bloque hasta la siguiente. */
export const MAX_DISMISSALS = 3;

export interface DismissalState {
  count: number;
  /** Momento del primer cierre: ancla la ventana de siete días. */
  windowStart: number;
}

/**
 * Lee la cookie de conteo. Cualquier valor ilegible, adulterado o de una ventana
 * ya vencida cuenta como "sin cierres", que es el estado que muestra el bloque:
 * ante la duda, mejor mostrarlo que silenciarlo para siempre por un valor roto.
 */
export function parseDismissals(raw: string | undefined | null, now = Date.now()): DismissalState {
  const [countRaw, startRaw] = String(raw ?? '').split('.');
  const count = Number.parseInt(countRaw, 10);
  const windowStart = Number.parseInt(startRaw, 10);

  const usable =
    Number.isFinite(count) && count > 0 &&
    Number.isFinite(windowStart) && windowStart > 0 &&
    windowStart <= now &&
    now - windowStart < WEEK_MS;

  return usable ? { count, windowStart } : { count: 0, windowStart: now };
}

export function serialiseDismissals(state: DismissalState): string {
  return `${state.count}.${state.windowStart}`;
}

/** El primer cierre abre la ventana semanal; los siguientes sólo suman. */
export function nextDismissal(state: DismissalState, now = Date.now()): DismissalState {
  return state.count === 0
    ? { count: 1, windowStart: now }
    : { count: state.count + 1, windowStart: state.windowStart };
}

/** Segundos que le quedan a la ventana semanal, para el max-age de la cookie. */
export function weekRemainingSeconds(state: DismissalState, now = Date.now()): number {
  return Math.max(60, Math.ceil((state.windowStart + WEEK_MS - now) / 1000));
}

/** Decide el ocultamiento a partir de los dos valores de cookie ya leídos. */
export function isHidden(
  hideRaw: string | undefined | null,
  countRaw: string | undefined | null,
  now = Date.now(),
): boolean {
  if (parseDismissals(countRaw, now).count >= MAX_DISMISSALS) return true;

  const hideUntil = Number.parseInt(String(hideRaw ?? ''), 10);
  return Number.isFinite(hideUntil) && hideUntil > now;
}
