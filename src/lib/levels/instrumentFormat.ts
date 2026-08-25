/**
 * Display precision per instrument.
 *
 * Not hardcoded to one value on purpose: showing 1,08 for EUR/USD instead of
 * 1,08450 makes the level useless, and showing 78.910,00 for Bitcoin is noise.
 * Every surface that prints a level or a price goes through here so the same
 * number never appears with two different precisions on the same page.
 */

const DECIMALS: Record<string, number> = {
  // Metales
  'XAU/USD': 2,
  'XAG/USD': 3,
  // Cripto
  'BTC/USD': 0,
  'ETH/USD': 2,
  'SOL/USD': 2,
  'XRP/USD': 4,
  // Forex — pip precision
  'EUR/USD': 5,
  'GBP/USD': 5,
  'AUD/USD': 5,
  'USD/JPY': 3,
  'GBP/JPY': 3,
  // Materias primas e índices
  'USOIL': 2,
  'SPX500': 1,
  'NAS100': 1,
  'US30': 1,
  'DXY': 3,
};

/** Equities quote in cents; anything unlisted falls back to two decimals. */
const DEFAULT_DECIMALS = 2;

export function decimalsFor(symbol: string): number {
  return DECIMALS[symbol] ?? DEFAULT_DECIMALS;
}

/** Paraguayan formatting: thousands with a dot, decimals with a comma. */
export function formatPrice(value: number, symbol: string): string {
  const d = decimalsFor(symbol);
  return value.toLocaleString('es-PY', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '−';
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}
