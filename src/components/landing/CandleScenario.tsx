/**
 * The four ways price meets a level, drawn as candles.
 *
 * The SVG is built on the server — no chart library, no client-side layout pass.
 * The only client-side part is the CSS animation that fades the candles in, and
 * `prefers-reduced-motion` switches that off in landing.css.
 */

export type ScenarioId = 'c1' | 'c2' | 'c3' | 'c4';

type Candle = [open: number, high: number, low: number, close: number];

interface Scenario {
  level: number;
  color: string;
  tag: string;
  /** Index of the candle where the reaction is marked. */
  markAt: number;
  candles: Candle[];
}

const TEAL = '#0F7A6B';
const RED = '#C4472F';

const SCENARIOS: Record<ScenarioId, Scenario> = {
  c1: {
    level: 100, color: RED, tag: 'RESISTENCIA', markAt: 6,
    candles: [
      [88, 90, 87, 89.5], [89.5, 91, 89, 90.5], [90.5, 93, 90, 92.5], [92.5, 95, 92, 94.5],
      [94.5, 97, 94, 96.5], [96.5, 99, 96, 98.5], [98.5, 100.4, 98, 99], [99, 99.5, 96, 96.5],
      [96.5, 97, 94, 94.5], [94.5, 95, 92, 92.5], [92.5, 93, 90, 90.5], [90.5, 91, 88, 88.5],
      [88.5, 89, 86, 86.5], [86.5, 87, 84, 84.5],
    ],
  },
  c2: {
    level: 100, color: TEAL, tag: 'RESISTENCIA', markAt: 9,
    candles: [
      [86, 88, 85, 87.5], [87.5, 89, 87, 88.5], [88.5, 91, 88, 90.5], [90.5, 93, 90, 92.5],
      [92.5, 95, 92, 94.5], [94.5, 97, 94, 96.5], [96.5, 99, 96, 98.5], [98.5, 103.5, 98, 102.5],
      [102.5, 103.5, 100.5, 101], [101, 101.5, 99.7, 100.3], [100.3, 103, 100, 102.5],
      [102.5, 105.5, 102, 105], [105, 108.5, 104.5, 108], [108, 112, 107.5, 111.5],
    ],
  },
  c3: {
    level: 100, color: TEAL, tag: 'SOPORTE', markAt: 6,
    candles: [
      [112, 113, 110, 110.5], [110.5, 111, 108, 108.5], [108.5, 109, 106, 106.5],
      [106.5, 107, 104, 104.5], [104.5, 105, 102, 102.5], [102.5, 103, 100.5, 101],
      [101, 101.5, 99.6, 101], [101, 104, 100.8, 103.5], [103.5, 106, 103, 105.5],
      [105.5, 108, 105, 107.5], [107.5, 110, 107, 109.5], [109.5, 112, 109, 111.5],
      [111.5, 114, 111, 113.5], [113.5, 116, 113, 115.5],
    ],
  },
  c4: {
    level: 100, color: RED, tag: 'SOPORTE', markAt: 9,
    candles: [
      [114, 115, 112, 112.5], [112.5, 113, 110, 110.5], [110.5, 111, 108, 108.5],
      [108.5, 109, 106, 106.5], [106.5, 107, 104, 104.5], [104.5, 105, 102, 102.5],
      [102.5, 103, 100.5, 101], [101, 101.5, 96.5, 97], [97, 99.5, 96.5, 99],
      [99, 100.3, 98.5, 99.7], [99.7, 100, 97, 97.5], [97.5, 98, 94.5, 95],
      [95, 95.5, 92, 92.5], [92.5, 93, 89, 89.5],
    ],
  },
};

const W = 460, H = 210, PAD_L = 8, PAD_R = 8, PAD_T = 14, PAD_B = 14;

interface Props {
  id: ScenarioId;
  /** Bumped by the replay button to restart the CSS animations. */
  generation?: number;
  /** Sample price shown on the level line. */
  levelLabel: string;
}

export default function CandleScenario({ id, generation = 0, levelLabel }: Props) {
  const s = SCENARIOS[id];

  const values = s.candles.flat().concat(s.level);
  const hi = Math.max(...values) + 2;
  const lo = Math.min(...values) - 2;
  const y = (v: number) => PAD_T + ((hi - v) / (hi - lo)) * (H - PAD_T - PAD_B);

  const slot = (W - PAD_L - PAD_R) / s.candles.length;
  const bodyW = slot * 0.56;
  const levelY = y(s.level);
  const markX = PAD_L + s.markAt * slot + slot / 2;

  return (
    <svg
      key={generation}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${s.tag.toLowerCase()}: ejemplo de cómo el precio reacciona al nivel`}
    >
      {[0.25, 0.75].map(f => {
        const gy = PAD_T + f * (H - PAD_T - PAD_B);
        return <line key={f} x1={0} y1={gy} x2={W} y2={gy} stroke="#DDE4DE" strokeWidth={1} />;
      })}

      <line x1={0} y1={levelY} x2={W} y2={levelY} stroke={s.color} strokeWidth={2.5} strokeDasharray="7 6" />
      <text
        x={8}
        y={levelY - 8}
        fontFamily="var(--font-martian), monospace"
        fontSize={10.5}
        fill={s.color}
      >
        {s.tag} · {levelLabel}
      </text>

      {s.candles.map(([o, h, l, c], i) => {
        const x = PAD_L + i * slot + slot / 2;
        const up = c >= o;
        const col = up ? TEAL : RED;
        const top = y(Math.max(o, c));
        const bottom = y(Math.min(o, c));
        return (
          <g key={i} className="cndl" style={{ animationDelay: `${i * 0.075}s` }}>
            <line x1={x} y1={y(h)} x2={x} y2={y(l)} stroke={col} strokeWidth={1.6} strokeLinecap="round" />
            <rect
              x={x - bodyW / 2}
              y={top}
              width={bodyW}
              height={Math.max(2, bottom - top)}
              fill={up ? col : '#fff'}
              stroke={col}
              strokeWidth={1.6}
              rx={1}
            />
          </g>
        );
      })}

      <g
        className="mark"
        style={{
          transformOrigin: `${markX}px ${levelY}px`,
          animationDelay: `${(s.markAt + 1) * 0.075 + 0.1}s`,
        }}
      >
        <circle cx={markX} cy={levelY} r={8.5} fill="none" stroke={s.color} strokeWidth={2.5} />
        <circle cx={markX} cy={levelY} r={3} fill={s.color} />
      </g>
    </svg>
  );
}
