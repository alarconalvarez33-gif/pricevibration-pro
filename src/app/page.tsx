import Image from 'next/image';
import Link from 'next/link';
import './landing.css';

import { getTrialState } from '@/lib/services/trial-access';
import { getMarkets } from '@/lib/markets/getMarkets';
import { calcLevels } from '@/lib/levels/calcLevels';
import BannerExness, { EXNESS_URL } from '@/components/BannerExness';
import ClockBar from '@/components/landing/ClockBar';
import Countdown from '@/components/landing/Countdown';
import CandleScenario from '@/components/landing/CandleScenario';
import ReplayButton from '@/components/landing/ReplayButton';
import NewsPanel from '@/components/landing/NewsPanel';
import SiteFooter from '@/components/landing/SiteFooter';

// The header reflects the session, so this cannot be cached across visitors.
export const dynamic = 'force-dynamic';

const WHATSAPP = 'https://wa.me/595981234128';
const FORMSPREE = 'https://formspree.io/f/xreapnkb';

/** Decimals per instrument. 1,08 for EUR/USD instead of 1,08450 is a useless level. */
const DECIMALS: Record<string, number> = {
  'XAU/USD': 2, 'XAG/USD': 2, 'BTC/USD': 0, 'ETH/USD': 2,
  'EUR/USD': 5, 'GBP/USD': 5, 'USD/JPY': 3, 'USOIL': 2,
  'NAS100': 1, 'US30': 1, 'SPX500': 1,
};

function formatPrice(value: number, symbol: string): string {
  const decimals = DECIMALS[symbol] ?? 2;
  return value.toLocaleString('es-PY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

const HERO_SYMBOL = 'XAU/USD';

interface ScoreRow {
  label: string;
  /** null when the visitor has no access — the value never leaves the server. */
  price: string | null;
}

/**
 * The six levels for the hero card.
 *
 * Gating per the access rules: the three lower levels are filtered out here, in
 * the server component. They are not rendered and hidden with CSS — if the
 * numbers travelled in the HTML, the blur would be decoration and anyone could
 * read them with the inspector.
 */
async function buildScore(allowed: boolean): Promise<{ rows: ScoreRow[]; hasPrice: boolean }> {
  const { markets } = await getMarkets();
  const row = markets.find(m => m.symbol === HERO_SYMBOL);
  const price = row && !row.offline && row.price > 0 ? row.price : null;

  const labels = ['R3', 'R2', 'R1', 'S1', 'S2', 'S3'];

  if (price == null) {
    return { rows: labels.map(label => ({ label, price: null })), hasPrice: false };
  }

  const { res, sup } = calcLevels(price, '1d');
  const values = [res[2], res[1], res[0], sup[0], sup[1], sup[2]];

  return {
    rows: labels.map((label, i) => ({
      label,
      // Index 3, 4 and 5 are S1..S3 — the gated half.
      price: i < 3 || allowed ? formatPrice(values[i], HERO_SYMBOL) : null,
    })),
    hasPrice: true,
  };
}

export default async function Home() {
  const trial = await getTrialState();

  // Deliberately NOT hasFullAccess(): that also counts the 24h anonymous trial,
  // which every first-time visitor gets automatically — it would hand the gated
  // half to exactly the people the card says cannot see it ("tres visibles sin
  // cuenta"). The lower three open only for real, granted access.
  const allowed = trial.isPremium;

  const { rows, hasPrice } = await buildScore(allowed);

  const initial = (trial.email?.trim()?.[0] ?? 'T').toUpperCase();
  const displayName = trial.email ? trial.email.split('@')[0] : '';

  const todayPY = new Date(Date.now() - 3 * 3_600_000)
    .toLocaleDateString('es-PY', { day: '2-digit', month: 'short', timeZone: 'UTC' })
    .toUpperCase()
    .replace('.', '');

  return (
    <div className="lp">
      <ClockBar />

      {/* ============ CABECERA ============ */}
      <header className="top">
        <div className="wrap top-in">
          <Link href="/" aria-label="Trading.com.py — inicio">
            <Image
              src="/logonuevos.png"
              alt="Trading.com.py"
              width={993}
              height={238}
              priority
              className="logo"
            />
          </Link>

          <nav className="nav">
            <a href="#buscas">¿Qué buscás?</a>
            <a href="#estrategias">Estrategias</a>
            <a href="#mentoria">Mentoría</a>
            <a href="#contacto">Contacto</a>
          </nav>

          {trial.isAuthed ? (
            <div className="auth">
              <div className="hola">
                <span className="avatar" aria-hidden="true">{initial}</span>
                <span className="hola-txt">
                  <b>Hola, {displayName}</b>
                  <small>
                    {trial.isPremium
                      ? 'Cuenta vinculada · acceso completo'
                      : trial.inTrial
                        ? 'Acceso de prueba activo'
                        : 'Acceso al plan abierto'}
                  </small>
                </span>
              </div>
              <Link href="/account" className="salir">Mi cuenta</Link>
            </div>
          ) : (
            <div className="auth">
              <Link href="/login" className="link-login">Iniciar sesión</Link>
              <Link href="/register" className="btn">Registrarse</Link>
            </div>
          )}
        </div>
      </header>

      {/* ============ HERO ============ */}
      <div className="hero">
        <div className="wrap hero-row">
          <div>
            <span className="freetag">✓ Gratis con tu cuenta Exness — sin cuota mensual</span>
            <h1>
              Seis niveles
              <span className="l2">por sesión.</span>
              <span className="l2"><u>Sin vueltas.</u></span>
            </h1>
            <p className="lede">
              Se calculan una vez, a las 07:00 de Paraguay, y quedan escritos. Al cierre
              marcamos cuáles el precio respetó. Los días malos también quedan.
            </p>
            <div className="cta">
              <a href="#buscas" className="btn">Ver por dónde empezar</a>
              <a href="#registro" className="btn btn-o">Revisar el historial</a>
            </div>
            <p className="micro">
              El historial es abierto para cualquiera. La sesión en curso pide cuenta vinculada.
            </p>
          </div>

          <div className="score">
            <div className="score-top">
              <span>XAU/USD · Oro</span>
              <span>{todayPY} · 07:00 PY</span>
            </div>

            {rows.map(row => {
              const locked = row.price == null && hasPrice;
              return (
                <div key={row.label} className={`srow${locked ? ' slock' : ''}`}>
                  <span className="sn">{row.label}</span>
                  {/* Placeholder glyphs, not the real figure: the gated prices
                      are filtered out server-side and never reach the client. */}
                  <span className="sp">{row.price ?? (hasPrice ? '••••••' : '—')}</span>
                  <span className="st t-wait">
                    {locked ? 'Bloqueado' : 'En curso'}
                  </span>
                </div>
              );
            })}

            <div className="score-foot">
              {allowed ? (
                <>
                  <span>Los seis niveles, desbloqueados</span>
                  <Link href="/terminal">Abrir el terminal →</Link>
                </>
              ) : (
                <>
                  <span>Tres visibles sin cuenta</span>
                  <a href="#gratis">Desbloquear gratis →</a>
                </>
              )}
            </div>

            <div className="nextdrop">
              <span>Próxima publicación</span>
              <Countdown />
            </div>
          </div>
        </div>
      </div>

      {/* ============ CINTA ============ */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-in">
          {Array.from({ length: 2 }).flatMap((_, pass) => [
            <span key={`a${pass}`}>Gratis con cuenta Exness</span>,
            <span key={`b${pass}`}>·</span>,
            <span key={`c${pass}`}>Publicado 07:00 Paraguay · UTC−3</span>,
            <span key={`d${pass}`}>·</span>,
            <span key={`e${pass}`}>Historial abierto de 90 días</span>,
            <span key={`f${pass}`}>·</span>,
            <span key={`g${pass}`}>Los días malos también se muestran</span>,
            <span key={`h${pass}`}>·</span>,
          ])}
        </div>
      </div>

      {/* ============ ¿QUÉ BUSCÁS? ============ */}
      <section id="buscas" className="white">
        <div className="wrap">
          <div className="qhead">
            <div>
              <div className="slabel">Elegí por dónde entrar</div>
              <h2>¿Qué <u>buscás</u>?</h2>
            </div>
            <p className="qsub">Dos de los tres caminos no cuestan nada. Está aclarado en cada uno.</p>
          </div>

          <div className="paths">
            <a className="path p1" href="#estrategias">
              <div className="p-num">Camino 01</div>
              <span className="p-tag tag-pago">Gs. 500.000 · pago único</span>
              <div className="p-quote">Ya opero, pero me falta confianza</div>
              <p className="p-desc">
                Sabés leer un gráfico, pero dudás al apretar el botón — o entrás antes de tiempo
                y el mercado te saca. Dos videos que explican el momento exacto.
              </p>
              <ul className="p-list">
                <li>Cómo confirmar una reacción en el nivel</li>
                <li>Dónde va el stop para que el ruido no te saque</li>
                <li>Cuándo conviene no entrar</li>
              </ul>
              <div className="p-go"><span>Ver las dos estrategias</span><span className="arrow">→</span></div>
            </a>

            <a className="path p2" href="#empezar">
              <div className="p-num">Camino 02</div>
              <span className="p-tag tag-free">Gratis · sin registro</span>
              <div className="p-quote">Quiero empezar de cero, sin pagar nada</div>
              <p className="p-desc">
                Nunca operaste o recién arrancás. Acá está lo básico en orden, sin que te pidan
                plata ni el email en el medio.
              </p>
              <ul className="p-list">
                <li>Qué es un nivel y para qué sirve</li>
                <li>Cuánto arriesgar para no fundir la cuenta</li>
                <li>Los errores que comete todo el mundo al principio</li>
              </ul>
              <div className="p-go"><span>Empezar por acá</span><span className="arrow">→</span></div>
            </a>

            <a className="path p3" href="#gratis">
              <div className="p-num">Camino 03</div>
              <span className="p-tag tag-free">Gratis con cuenta Exness</span>
              <div className="p-quote">Quiero las calculadoras de niveles</div>
              <p className="p-desc">
                Los seis niveles de todos los activos, calculados cada mañana. Se desbloquean
                solos al abrir tu cuenta — no hay cuota mensual.
              </p>
              <ul className="p-list">
                <li>Niveles diarios de oro, cripto, forex e índices</li>
                <li>Calculadora de riesgo y tamaño de lote</li>
                <li>Alertas cuando el precio toca un nivel</li>
              </ul>
              <div className="p-go"><span>Ver cómo se activa</span><span className="arrow">→</span></div>
            </a>
          </div>

          <p className="qfoot">
            ¿No sabés cuál te toca? <a href="#empezar">Andá por el segundo</a> — siempre podés
            volver acá.
          </p>
        </div>
      </section>

      {/* ============ EMPEZAR DE CERO ============ */}
      <section id="empezar">
        <div className="wrap" data-candles>
          <div className="slabel">Camino 02 · Gratis, sin registro</div>
          <h2>Cómo se usa un nivel</h2>
          <p className="slede">
            Un nivel es un precio marcado de antemano donde el mercado suele frenarse. No te dice
            si va a subir o bajar. Te dice <strong>dónde mirar</strong>.
          </p>

          <div className="thesis">
            <div className="big">
              Cuando el precio llega al nivel, solo puede hacer <em>dos cosas</em>:<br />
              <u>rebotar</u> o <u>romperlo y volver a apoyarse ahí</u>.
            </div>
          </div>

          <div className="groupttl">Nivel por encima del precio · Resistencia</div>
          <div className="two">
            <div className="sc">
              <div className="sc-top"><span className="badge b-sell">Caso 1</span><h3>Rebota</h3></div>
              <div className="chart"><CandleScenario id="c1" levelLabel="3.396,80" /></div>
              <div className="sc-body">
                <p>
                  El precio sube, toca el nivel, deja una mecha arriba y se da vuelta. Ahí había
                  vendedores esperando.
                </p>
                <div className="sc-do">
                  <div className="k">Qué significa</div>
                  <div className="v">Zona para buscar venta, con el stop apenas arriba del nivel.</div>
                </div>
              </div>
            </div>

            <div className="sc">
              <div className="sc-top"><span className="badge b-buy">Caso 2</span><h3>Rompe y vuelve</h3></div>
              <div className="chart"><CandleScenario id="c2" levelLabel="3.396,80" /></div>
              <div className="sc-body">
                <p>
                  Atraviesa el nivel con una vela fuerte, después baja y vuelve a tocarlo desde
                  arriba. Si aguanta, despega. El techo se hizo piso.
                </p>
                <div className="sc-do">
                  <div className="k">Qué significa</div>
                  <div className="v">La compra se busca en el retroceso, no en la ruptura.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="groupttl">Nivel por debajo del precio · Soporte</div>
          <div className="two">
            <div className="sc">
              <div className="sc-top"><span className="badge b-buy">Caso 3</span><h3>Rebota</h3></div>
              <div className="chart"><CandleScenario id="c3" levelLabel="3.371,40" /></div>
              <div className="sc-body">
                <p>
                  El precio baja, toca el nivel, deja una mecha abajo y se da vuelta. Ahí había
                  compradores esperando.
                </p>
                <div className="sc-do">
                  <div className="k">Qué significa</div>
                  <div className="v">Zona para buscar compra, con el stop apenas abajo del nivel.</div>
                </div>
              </div>
            </div>

            <div className="sc">
              <div className="sc-top"><span className="badge b-sell">Caso 4</span><h3>Rompe y vuelve</h3></div>
              <div className="chart"><CandleScenario id="c4" levelLabel="3.371,40" /></div>
              <div className="sc-body">
                <p>
                  Perfora el nivel, después sube y vuelve a tocarlo desde abajo. Si no lo
                  recupera, se derrumba. El piso se hizo techo.
                </p>
                <div className="sc-do">
                  <div className="k">Qué significa</div>
                  <div className="v">La venta se busca en el retroceso, no en la ruptura.</div>
                </div>
              </div>
            </div>
          </div>

          <ReplayButton />

          <div className="mistake">
            <h4>El error que comete casi todo el mundo</h4>
            <p>
              Entrar apenas el precio toca el nivel, o saltar encima de la vela que rompe. En los
              dos momentos todavía no sabés qué está pasando: el caso 1 y el caso 2 se ven
              idénticos hasta que uno se confirma. El nivel te dice dónde prestar atención, no
              cuándo apretar el botón.
            </p>
          </div>

          <div className="steps" style={{ marginTop: 44 }}>
            <div className="step">
              <div className="step-n">1</div>
              <h3>Elegí un solo activo</h3>
              <p>Empezá mirando uno. Seis mercados a la vez es la forma más rápida de no entender ninguno.</p>
            </div>
            <div className="step">
              <div className="step-n">2</div>
              <h3>Calculá cuánto arriesgar</h3>
              <p>Antes de la entrada va el tamaño. La calculadora te dice cuántas pérdidas seguidas aguanta tu cuenta.</p>
            </div>
            <div className="step">
              <div className="step-n">3</div>
              <h3>Anotá lo que hacés</h3>
              <p>Sin registro no hay mejora. Al mes vas a ver qué horario y qué tamaño te están costando plata.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BANNER 320x50 ============ */}
      <div className="bannerband">
        <div className="wrap">
          <BannerExness variante="320x50" className="bn320" />
        </div>
      </div>

      {/* ============ ESTRATEGIAS (PAGO) ============ */}
      <section id="estrategias" className="white">
        <div className="wrap pricegrid">
          <div>
            <div className="slabel">Camino 01 · Pago único</div>
            <h2>Estrategias de precisión</h2>
            <p className="slede">
              Los niveles te dicen dónde mirar. Estos dos videos explican qué hacer cuando el
              precio llega ahí: cómo confirmar la reacción, dónde va el stop y cuándo conviene
              quedarse afuera.
            </p>
            <ul className="strat-list">
              <li>
                <span className="vidn">1</span>
                <div>
                  <h4>Confirmación de reacción en el nivel</h4>
                  <p>Cómo distinguir un rechazo real de un toque que sigue de largo, y por qué la mayoría entra una vela antes de tiempo.</p>
                </div>
              </li>
              <li>
                <span className="vidn">2</span>
                <div>
                  <h4>Entrada, stop y salida</h4>
                  <p>Dónde poner el stop para que el ruido no te saque, y cómo definir el objetivo antes de abrir la operación.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="pricebox">
            <div className="kk">Los dos videos · Acceso permanente</div>
            <div className="price">Gs. 500.000</div>
            <div className="price-alt">o USD 70</div>
            <small>Pago único por los dos. No es suscripción y no vence.</small>
            <div className="pays">
              <span className="pay">PagoPar</span>
              <span className="pay">Binance / USDT</span>
              <span className="pay">Transferencia</span>
            </div>
            <Link href="/cursos" className="btn">Comprar los dos videos</Link>
            <p className="fine">
              Guaraníes por PagoPar (tarjeta, transferencia o billetera). Desde el exterior, USD
              70 en USDT por Binance. El enlace privado de YouTube llega apenas se confirma el
              pago.
            </p>
          </div>
        </div>
      </section>

      {/* ============ ACCESO GRATIS ============ */}
      <section id="gratis">
        <div className="wrap">
          <div className="slabel">Camino 03 · Cuesta cero, se activa solo</div>
          <h2>Gratis con tu cuenta Exness</h2>
          <p className="slede">
            No hay suscripción ni comprobantes que subir. Abrís tu cuenta con nuestro código y el
            acceso completo queda activo mientras la cuenta siga abierta. El broker nos paga una
            parte de su spread: vos pagás exactamente lo mismo que pagarías igual.
          </p>

          <div className="steps">
            <div className="step">
              <div className="step-n">1</div>
              <h3>Abrís la cuenta</h3>
              <p>Desde el botón de acá abajo. La verificación de identidad la hace el broker, no nosotros.</p>
            </div>
            <div className="step">
              <div className="step-n">2</div>
              <h3>Cargás tu número de cuenta</h3>
              <p>El acceso queda activo al instante mientras revisamos la vinculación contra el reporte del broker.</p>
            </div>
            <div className="step">
              <div className="step-n">3</div>
              <h3>Entrás cada mañana</h3>
              <p>Los seis niveles de todos los activos, alertas y confluencia. Mientras operes, el acceso sigue activo.</p>
            </div>
          </div>

          <div className="cards">
            <div className="card">
              <div className="card-k">Sin cuenta · Abierto para cualquiera</div>
              <h3>Mirá antes de decidir</h3>
              <p>Entrás, revisás y te vas. No pedimos ni el email.</p>
              <ul>
                <li>Historial completo de sesiones anteriores</li>
                <li>Qué nivel el precio respetó y cuál atravesó</li>
                <li>Calculadora de riesgo y tamaño de lote</li>
                <li>Los tres primeros niveles de hoy</li>
              </ul>
            </div>

            <div className="card hot">
              <div className="card-k">Con cuenta Exness · Gratis</div>
              <h3>Operá la sesión de hoy</h3>
              <p>Todo lo de al lado, más lo que sirve para operar en vivo.</p>
              <ul>
                <li>Los seis niveles en todos los activos</li>
                <li>Alertas cuando el precio toca uno</li>
                <li>Confluencia entre 15m, 1h, 4h y diario</li>
                <li>Bitácora personal de operaciones</li>
              </ul>
              <a href={EXNESS_URL} target="_blank" rel="sponsored noopener" className="btn btn-s">
                Abrir cuenta y activar
              </a>
              <p className="pricenote">
                ¿Ya tenés cuenta en Exness? Se puede transferir el código de socio. Te pasamos el
                paso a paso.
              </p>
            </div>
          </div>

          <div className="bannerbox">
            <BannerExness variante="800x800" className="bn800" />
            <BannerExness variante="320x50" className="bn320" />
          </div>
        </div>
      </section>

      {/* ============ NOTICIAS ============ */}
      <section id="noticias" className="white">
        <div className="wrap">
          <div className="slabel">Contexto del día</div>
          <h2>Qué está moviendo el mercado</h2>
          <p className="slede">
            Un nivel no se opera en el vacío. Si el oro está reaccionando a una tasa de interés o
            el petróleo a una decisión de la OPEP, conviene saberlo antes de entrar.
          </p>

          <div className="newsgrid">
            <NewsPanel />
            <ReferencePrices />
          </div>
        </div>
      </section>

      {/* ============ REGISTRO ============ */}
      <section id="registro">
        <div className="wrap">
          <div className="slabel">Sin porcentajes inventados</div>
          <h2>No decimos que acertamos 87%</h2>
          <p className="slede">
            Ese número no significa nada si nadie lo puede verificar. Mostramos las sesiones una
            por una, con la hora en que se publicó cada nivel, y sacás tu propia conclusión antes
            de abrir nada.
          </p>
          <div className="facts">
            <div className="fact">
              <div className="fact-v">6</div>
              <div className="fact-k">niveles por activo, siempre los mismos, sin métodos que se contradicen entre sí.</div>
            </div>
            <div className="fact">
              <div className="fact-v">07:00</div>
              <div className="fact-k">hora fija de Paraguay (UTC−3), antes de que abra la sesión de Londres.</div>
            </div>
            <div className="fact">
              <div className="fact-v">90 días</div>
              <div className="fact-k">de historial abierto. Nada se corrige ni se borra hacia atrás.</div>
            </div>
          </div>
          <div style={{ marginTop: 38 }}>
            <Link href="/terminal" className="btn btn-o">Abrir el terminal de niveles</Link>
          </div>
        </div>
      </section>

      {/* ============ MENTORÍA ============ */}
      <section id="mentoria">
        <div className="wrap mentor">
          <div>
            <div className="slabel">Cupos limitados · Uno a uno</div>
            <h2>Mentoría personalizada</h2>

            <p className="mentor-hook">Ninguna página web <u>puede ver tu pantalla.</u></p>

            <p>
              Los niveles, la calculadora de riesgo y los videos te dan el sistema entero, y
              funcionan. Pero ninguno de los tres puede mirar la operación que abriste ayer a las
              diez de la mañana y decirte por qué la cerraste antes de tiempo.
            </p>

            <p>
              Eso aparece recién cuando alguien revisa <strong>lo que hiciste vos</strong>: con tu
              capital, en tu horario, con las decisiones que tomaste en el momento. La mentoría
              empieza justo donde termina el resto del sitio.
            </p>

            <ul className="m-incl">
              <li>
                <span className="m-ico">1</span>
                <div>
                  <h4>Ocho sesiones en vivo, uno a uno</h4>
                  <p>Por videollamada, con pantalla compartida y tus gráficos reales. No es un curso grabado.</p>
                </div>
              </li>
              <li>
                <span className="m-ico">2</span>
                <div>
                  <h4>Revisión de tus operaciones</h4>
                  <p>Vos operás durante la semana y yo reviso qué hiciste, dónde entraste y por qué salió como salió.</p>
                </div>
              </li>
              <li>
                <span className="m-ico">3</span>
                <div>
                  <h4>Un plan escrito, tuyo</h4>
                  <p>Reglas concretas de entrada, tamaño y salida, adaptadas a tu capital y al horario en que podés operar.</p>
                </div>
              </li>
              <li>
                <span className="m-ico">4</span>
                <div>
                  <h4>Contacto directo entre sesiones</h4>
                  <p>Consultas por WhatsApp durante todo el programa. Cuando aparece la duda, no una semana después.</p>
                </div>
              </li>
            </ul>
          </div>

          <aside className="mbox">
            <div className="kk">Programa completo · 8 semanas</div>
            <div className="mprice">Gs. 3.000.000</div>

            <div className="mcuotas">
              <b>o 2 cuotas de 1.500.000</b>
              <span>La primera al empezar, la segunda a la cuarta semana.</span>
            </div>

            <a href="#contacto" className="btn btn-s">Consultar disponibilidad</a>

            <div className="legal-mini">
              <div className="lm-row">
                <span className="lm-ico" aria-hidden="true">📄</span>
                <div>
                  <b>Contrato firmado</b>
                  <span>Alcance, fechas y condiciones por escrito antes de pagar.</span>
                </div>
              </div>
              <div className="lm-row">
                <span className="lm-ico" aria-hidden="true">🧾</span>
                <div>
                  <b>Factura legal</b>
                  <span>Comprobante fiscal emitido por cada pago o cuota.</span>
                </div>
              </div>
            </div>

            <p className="mfine">
              Antes de cobrar nada hacemos una charla breve para ver si tiene sentido en tu caso.
              Si no, te lo digo y no perdés plata.
            </p>

            <div className="cupos">
              <span className="dotlive" />
              Se toman pocos alumnos por vez para poder revisar las operaciones de cada uno.
            </div>
          </aside>
        </div>
      </section>

      {/* ============ CONTACTO ============ */}
      <section id="contacto" className="white">
        <div className="wrap contacto">
          <div>
            <div className="slabel">Sin compromiso</div>
            <h2>Consultá directo con The Mentor</h2>
            <p className="slede" style={{ marginBottom: 0 }}>
              Dudas sobre los niveles, sobre las estrategias, sobre si la mentoría te sirve, o
              sobre cualquier cosa del sitio. Contesto yo, no un bot.
            </p>

            <ul className="cbenef">
              <li>Respuesta en menos de 24 horas hábiles</li>
              <li>Si tu duda se resuelve con algo gratis, te lo digo</li>
              <li>No te vamos a agregar a ninguna lista sin avisarte</li>
            </ul>

            <a href={WHATSAPP} target="_blank" rel="noopener" className="wapp">
              <span style={{ fontSize: 24 }} aria-hidden="true">💬</span>
              <span>
                <b>WhatsApp directo</b>
                <small>+595 981 234 128</small>
              </span>
            </a>
          </div>

          <form className="formbox" action={FORMSPREE} method="POST">
            <label htmlFor="f-nombre">Tu nombre</label>
            <input type="text" id="f-nombre" name="nombre" required placeholder="Cómo te llamás" />

            <label htmlFor="f-email">Email</label>
            <input type="email" id="f-email" name="email" required placeholder="tu@email.com" />

            <label htmlFor="f-tema">Sobre qué querés consultar</label>
            <select id="f-tema" name="tema" defaultValue="Mentoría personalizada">
              <option>Mentoría personalizada</option>
              <option>Estrategias de precisión</option>
              <option>Acceso a los niveles</option>
              <option>Otra cosa</option>
            </select>

            <label htmlFor="f-msg">Tu mensaje</label>
            <textarea
              id="f-msg"
              name="mensaje"
              required
              placeholder="Contame en qué estás y qué te gustaría resolver."
            />

            <button type="submit" className="btn">Enviar consulta →</button>
            <p className="fnote">
              Tus datos se usan solo para responderte. No se comparten con terceros ni se venden.
            </p>
          </form>
        </div>
      </section>

      {/* ============ BANDA FINAL ============ */}
      <div className="bigband">
        <div className="wrap bb-grid">
          <div>
            <div className="bb-k">Requisito para el acceso gratis</div>
            <h3>Abrí tu cuenta y desbloqueá todo</h3>
            <p>
              Se activa apenas cargás tu número de cuenta, mientras verificamos la vinculación
              contra el reporte del broker. Sin cuota mensual, sin comprobantes.
            </p>
            <ul className="bb-list">
              <li>Los seis niveles en todos los activos, cada mañana</li>
              <li>Alertas cuando el precio toca un nivel</li>
              <li>Confluencia entre 15m, 1h, 4h y diario</li>
              <li>Bitácora personal de operaciones</li>
            </ul>
            <a href={EXNESS_URL} target="_blank" rel="sponsored noopener" className="btn btn-s">
              Abrir cuenta y activar →
            </a>
            <div className="bb-mini">
              <BannerExness variante="320x50" />
            </div>
          </div>

          <BannerExness variante="vertical" className="bb-creative" />
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

/**
 * Reference prices beside the headlines. Server-rendered from the same snapshot
 * that feeds the terminal, so the figures agree across the site.
 */
async function ReferencePrices() {
  const { markets } = await getMarkets();

  const WANTED: Array<[symbol: string, name: string, short: string]> = [
    ['XAU/USD', 'Oro', 'XAU/USD'],
    ['USOIL', 'Petróleo', 'WTI'],
    ['EUR/USD', 'Euro', 'EUR/USD'],
    ['GBP/USD', 'Libra', 'GBP/USD'],
    ['TSLA', 'Tesla', 'TSLA'],
    ['NAS100', 'Nasdaq', 'US100'],
    ['BTC/USD', 'Bitcoin', 'BTC/USD'],
  ];

  return (
    <aside className="tickers">
      <div className="tk-top">Precios de referencia</div>
      {WANTED.map(([symbol, name, short]) => {
        const row = markets.find(m => m.symbol === symbol);
        const live = row && !row.offline && row.price > 0;
        const up = (row?.changePercent ?? 0) >= 0;

        return (
          <div className="tk" key={symbol}>
            <span className="tk-n">{name}<small>{short}</small></span>
            <span className="tk-p">{live ? formatPrice(row!.price, symbol) : '—'}</span>
            <span className={`tk-c ${up ? 'c-up' : 'c-dn'}`}>
              {live ? `${up ? '+' : '−'}${Math.abs(row!.changePercent).toFixed(2)}%` : '·'}
            </span>
          </div>
        );
      })}
    </aside>
  );
}
