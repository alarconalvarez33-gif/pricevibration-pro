import Link from 'next/link';
import { getMarkets } from '@/lib/markets/getMarkets';
import { calcLevels } from '@/lib/levels/calcLevels';
import { DEFAULT_TIMEFRAME } from '@/lib/levels/terminalLevels';
import { formatPrice, formatPercent } from '@/lib/levels/instrumentFormat';
import { ASSETS, type AssetCategory } from '@/components/terminal/assets';
import { EXNESS_URL } from '@/components/BannerExness';

/**
 * Every instrument's six levels, on the home page.
 *
 * The point is that an authorised visitor never has to open the terminal to see
 * the board — the whole session is here. Levels come from calcLevels on the same
 * timeframe the terminal defaults to, so the numbers on this page and the
 * numbers in the terminal are the same numbers.
 *
 * Gating happens here, in the server component: without access the three lower
 * levels are never computed into the markup. They are not rendered and hidden.
 */

interface Props {
  /** True only for real granted access — not the anonymous 24h trial. */
  allowed: boolean;
}

interface AssetRow {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  /** R3, R2, R1 — always sent. */
  resistances: string[];
  /** S1, S2, S3 — null when the visitor has no access. */
  supports: string[] | null;
}

const CATEGORY_LABEL: Record<AssetCategory, string> = {
  'Cripto': 'Cripto',
  'Metales': 'Metales',
  'Índices': 'Índices',
  'Acciones US': 'Acciones US',
  'India': 'India',
  'Forex': 'Forex',
};

/** Match the terminal's rounding so both surfaces print the same figure. */
function roundToScale(value: number, reference: number): number {
  if (reference >= 1000) return +value.toFixed(1);
  if (reference >= 1) return +value.toFixed(2);
  return +value.toFixed(5);
}

export default async function LevelsBoard({ allowed }: Props) {
  const { markets } = await getMarkets();
  const bySymbol = new Map(markets.map(m => [m.symbol, m]));

  const groups: Array<{ category: AssetCategory; rows: AssetRow[] }> = [];

  for (const [category, assets] of Object.entries(ASSETS) as Array<[AssetCategory, typeof ASSETS[AssetCategory]]>) {
    const rows: AssetRow[] = [];

    for (const [symbol, name] of assets) {
      const market = bySymbol.get(symbol);
      if (!market || market.offline || market.price <= 0) continue;

      const price = market.price;
      const { res, sup } = calcLevels(price, DEFAULT_TIMEFRAME);

      rows.push({
        symbol,
        name,
        price,
        changePercent: market.changePercent,
        // R1 sits closest to price, so the ladder reads R3 → R2 → R1 downwards.
        resistances: [res[2], res[1], res[0]].map(v => formatPrice(roundToScale(v, price), symbol)),
        supports: allowed
          ? [sup[0], sup[1], sup[2]].map(v => formatPrice(roundToScale(v, price), symbol))
          : null,
      });
    }

    if (rows.length) groups.push({ category, rows });
  }

  const total = groups.reduce((n, g) => n + g.rows.length, 0);

  return (
    <section id="niveles" className="white">
      <div className="wrap">
        <div className="slabel">Sesión en curso · {DEFAULT_TIMEFRAME} · actualizado en vivo</div>
        <h2>Los niveles de hoy</h2>
        <p className="slede">
          {allowed
            ? `Los seis niveles de los ${total} activos, acá mismo. Son exactamente los que ves en el terminal.`
            : `Los ${total} activos con sus tres niveles superiores. Los tres de abajo se abren con tu cuenta de Exness verificada.`}
        </p>

        {!allowed && (
          <div className="board-cta">
            <div>
              <b>Te faltan los tres niveles de abajo</b>
              <span>Se activan solos al vincular tu cuenta. Sin cuota mensual.</span>
            </div>
            <a href={EXNESS_URL} target="_blank" rel="sponsored noopener" className="btn btn-s">
              Abrir cuenta y activar
            </a>
          </div>
        )}

        {groups.map(group => (
          <div key={group.category}>
            <div className="groupttl">{CATEGORY_LABEL[group.category]}</div>
            <div className="board">
              {group.rows.map(row => (
                <article className="bcard" key={row.symbol}>
                  <header className="bcard-top">
                    <div>
                      <b>{row.symbol}</b>
                      <small>{row.name}</small>
                    </div>
                    <div className="bcard-px">
                      <span className="mono">{formatPrice(row.price, row.symbol)}</span>
                      <em className={row.changePercent >= 0 ? 'c-up' : 'c-dn'}>
                        {formatPercent(row.changePercent)}
                      </em>
                    </div>
                  </header>

                  <ul className="ladder">
                    {row.resistances.map((value, i) => (
                      <li key={`r${i}`} className="lv lv-res">
                        <span className="lv-k">R{3 - i}</span>
                        <span className="lv-v mono">{value}</span>
                      </li>
                    ))}

                    <li className="lv lv-now">
                      <span className="lv-k">●</span>
                      <span className="lv-v mono">{formatPrice(row.price, row.symbol)}</span>
                    </li>

                    {row.supports
                      ? row.supports.map((value, i) => (
                          <li key={`s${i}`} className="lv lv-sup">
                            <span className="lv-k">S{i + 1}</span>
                            <span className="lv-v mono">{value}</span>
                          </li>
                        ))
                      : [1, 2, 3].map(n => (
                          <li key={`lock${n}`} className="lv lv-lock">
                            <span className="lv-k">S{n}</span>
                            {/* Placeholder glyphs. The figure itself never
                                reaches the client for a gated visitor. */}
                            <span className="lv-v mono">••••••</span>
                          </li>
                        ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        ))}

        <p className="board-foot">
          Calculados sobre el precio en vivo, en marco de {DEFAULT_TIMEFRAME}. Para cambiar de
          marco temporal, ver el gráfico y activar alertas,{' '}
          <Link href="/terminal">abrí el terminal</Link>.
        </p>
      </div>
    </section>
  );
}
