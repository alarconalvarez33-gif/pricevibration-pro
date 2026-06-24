'use client';

import type { Verdict } from './Tile';

const GREEN = '#00E676';
const RED   = '#FF4757';
const GOLD  = '#FFD700';
const CYAN  = '#00D4FF';
const DIM   = '#6E7A8A';
const TXT   = '#EDF1F5';

interface Level { n: number; price: number; }

interface Props {
  ticker: string;
  verdict: Verdict;
  price: number | null;
  resistances: Level[];
  supports: Level[];
  format: (v: number) => string;
}

export default function AssetGuide({ ticker, verdict, price, resistances, supports, format }: Props) {
  if (price == null) {
    return (
      <div
        className="mt-6 p-4 rounded-md"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-[12px]" style={{ color: DIM }}>
          Datos de mercado no disponibles en este momento.
        </p>
      </div>
    );
  }

  const nearestSupport   = supports.filter(s => s.price > 0 && s.price < price).sort((a, b) => b.price - a.price)[0];
  const nearestResistance = resistances.filter(r => r.price > price).sort((a, b) => a.price - b.price)[0];
  const nextResistance   = resistances.filter(r => r.price > price).sort((a, b) => a.price - b.price)[1];
  const nextSupport      = supports.filter(s => s.price > 0 && s.price < price).sort((a, b) => b.price - a.price)[1];

  return (
    <div className="mt-6 space-y-4">

      {/* Action guide */}
      {verdict === 'buy' && nearestSupport && nearestResistance && (
        <Card title="Cómo aprovechar esta señal de compra" color={GREEN}>
          <Step n={1}>
            <strong style={{ color: TXT }}>Esperá la vela de confirmación.</strong>{' '}
            No entres apenas el precio toca el soporte. Esperá a que se forme una vela alcista clara (vela martillo,
            envolvente alcista o cierre por encima del soporte en la temporalidad que operás).
          </Step>
          <Step n={2}>
            <strong style={{ color: TXT }}>Entrada (compra):</strong>{' '}
            cerca del soporte <Mono>{format(nearestSupport.price)}</Mono>. Si el precio actual
            (<Mono>{format(price)}</Mono>) ya está por encima, ajustá la entrada al cierre real de tu vela.
          </Step>
          <Step n={3}>
            <strong style={{ color: TXT }}>Stop Loss:</strong>{' '}
            unos pips por debajo del soporte siguiente <Mono>{nextSupport ? format(nextSupport.price) : '—'}</Mono>.
            Esto invalida la idea si el precio rompe la zona.
          </Step>
          <Step n={4}>
            <strong style={{ color: TXT }}>Take Profit:</strong>{' '}
            primer objetivo en la resistencia <Mono>{format(nearestResistance.price)}</Mono>.
            Segundo objetivo en <Mono>{nextResistance ? format(nextResistance.price) : 'la siguiente resistencia'}</Mono>.
          </Step>
          <Step n={5}>
            <strong style={{ color: TXT }}>Gestión:</strong>{' '}
            no arriesgues más del 1–2% de tu cuenta por operación. Movés el SL a punto de entrada (breakeven)
            cuando el precio avance la mitad del recorrido hacia el TP.
          </Step>
        </Card>
      )}

      {verdict === 'sell' && nearestResistance && nearestSupport && (
        <Card title="Cómo aprovechar esta señal de venta" color={RED}>
          <Step n={1}>
            <strong style={{ color: TXT }}>Esperá la vela de confirmación.</strong>{' '}
            No vendas apenas el precio toca la resistencia. Esperá una vela bajista clara (vela estrella fugaz,
            envolvente bajista o cierre por debajo de la resistencia).
          </Step>
          <Step n={2}>
            <strong style={{ color: TXT }}>Entrada (venta):</strong>{' '}
            cerca de la resistencia <Mono>{format(nearestResistance.price)}</Mono>. Si el precio actual
            (<Mono>{format(price)}</Mono>) ya está por debajo, usá el cierre real de la vela.
          </Step>
          <Step n={3}>
            <strong style={{ color: TXT }}>Stop Loss:</strong>{' '}
            unos pips por encima de la resistencia siguiente <Mono>{nextResistance ? format(nextResistance.price) : '—'}</Mono>.
            Si el precio rompe esa zona, la idea queda invalidada.
          </Step>
          <Step n={4}>
            <strong style={{ color: TXT }}>Take Profit:</strong>{' '}
            primer objetivo en el soporte <Mono>{format(nearestSupport.price)}</Mono>.
            Segundo objetivo en <Mono>{nextSupport ? format(nextSupport.price) : 'el siguiente soporte'}</Mono>.
          </Step>
          <Step n={5}>
            <strong style={{ color: TXT }}>Gestión:</strong>{' '}
            arriesgá máximo 1–2% del capital por operación. Trasladá el SL a breakeven cuando se alcance
            la mitad del recorrido hacia el TP.
          </Step>
        </Card>
      )}

      {verdict === 'wait' && (
        <Card title="Por qué el radar está en espera" color={GOLD}>
          <p className="text-[13px] leading-relaxed" style={{ color: '#B7BFCC' }}>
            El precio actual de <strong style={{ color: TXT }}>{ticker}</strong>{' '}
            (<Mono>{format(price)}</Mono>) no está dentro de las zonas de alta probabilidad detectadas por el algoritmo.
            Operar en esta zona implica entrar en territorio neutro, donde el riesgo/beneficio no es favorable.
          </p>
          <ul className="mt-3 space-y-1.5 text-[13px]" style={{ color: '#B7BFCC' }}>
            <li>· Próxima zona de compra (soporte): <Mono>{nearestSupport ? format(nearestSupport.price) : '—'}</Mono></li>
            <li>· Próxima zona de venta (resistencia): <Mono>{nearestResistance ? format(nearestResistance.price) : '—'}</Mono></li>
          </ul>
          <p className="text-[12px] mt-3" style={{ color: DIM }}>
            Mantenete al margen hasta que el precio toque uno de esos niveles y se forme la vela de confirmación.
          </p>
        </Card>
      )}

      {/* Dynamic levels disclaimer */}
      <Card title="Los niveles no son estáticos" color={CYAN}>
        <p className="text-[13px] leading-relaxed" style={{ color: '#B7BFCC' }}>
          Estos niveles se recalculan automáticamente <strong style={{ color: TXT }}>cada 15 segundos</strong> a partir del
          precio actual. Cuando el precio se mueve, los soportes y las resistencias también se mueven. No los
          tomes como referencias fijas: son zonas dinámicas que respiran con la oferta y la demanda global.
        </p>
      </Card>

      {/* How markets work — credibility */}
      <Card title="¿Cómo se mueve el mercado?" color={GOLD}>
        <p className="text-[13px] leading-relaxed mb-3" style={{ color: '#B7BFCC' }}>
          El precio de un activo es el equilibrio entre quien lo quiere comprar y quien lo quiere vender en cada instante.
          Cuando hay más compradores agresivos (más oferta), el precio sube; cuando hay más vendedores agresivos,
          el precio baja.
        </p>
        <p className="text-[13px] leading-relaxed mb-3" style={{ color: '#B7BFCC' }}>
          En mercados como el oro, el dólar o los índices, esa oferta y demanda viene de bancos centrales,
          fondos institucionales, empresas que cubren riesgo y miles de traders minoristas operando al mismo tiempo.
          Noticias económicas, decisiones de tipos de interés, conflictos geopolíticos y datos de inflación
          son los grandes motores detrás de los movimientos importantes.
        </p>
        <p className="text-[13px] leading-relaxed" style={{ color: '#B7BFCC' }}>
          El radar mide dónde es estadísticamente más probable que el precio reaccione (zonas de soporte y
          resistencia) usando un modelo matemático basado en la raíz cuadrada del precio. Nuestro trabajo es
          esperar que el precio llegue a esas zonas y dejar que el mercado nos confirme si hay reacción.
        </p>
      </Card>

      {/* Responsibility */}
      <div
        className="p-4 rounded-md"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-[11px] leading-relaxed" style={{ color: '#B7BFCC' }}>
          <strong style={{ color: GOLD }}>Aviso:</strong> los precios pueden diferir levemente del cotizador del broker.
          Esta información es solo educativa y no constituye asesoramiento financiero.{' '}
          <strong style={{ color: TXT }}>Ud. es el único responsable de sus decisiones de trading.</strong> Confirmá siempre con la vela de cierre.
        </p>
      </div>
    </div>
  );
}

function Card({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div
      className="p-4 sm:p-5 rounded-lg"
      style={{
        backgroundColor: '#0F141C',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${color}`,
      }}
    >
      <p
        className="text-[11px] uppercase tracking-[0.2em] mb-3"
        style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 mb-2.5 last:mb-0">
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: 'rgba(0,212,255,0.12)', color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}
      >
        {n}
      </span>
      <p className="text-[13px] leading-relaxed" style={{ color: '#B7BFCC' }}>
        {children}
      </p>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#EDF1F5', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9em' }}>
      {children}
    </span>
  );
}
