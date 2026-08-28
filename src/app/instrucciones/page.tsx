import Link from 'next/link';
import '../landing.css';
import './instrucciones.css';

import { getTrialState } from '@/lib/services/trial-access';
import ClockBar from '@/components/landing/ClockBar';
import SiteHeader from '@/components/landing/SiteHeader';
import SiteFooter from '@/components/landing/SiteFooter';

// The header reflects the session, so this cannot be cached across visitors.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Cómo confirmar un nivel antes de entrar | Trading.com.py',
  description:
    'Los cinco pasos para confirmar una reacción en el nivel con la vela: esperar el cierre, '
    + 'leer la mecha, pedir confirmación, operar el retroceso y ubicar el stop. Lectura de 3 minutos, '
    + 'abierta sin registro.',
};

/** The five confirmation steps, in the order they happen on the chart. */
const PASOS = [
  {
    n: '01',
    titulo: 'Esperá el cierre',
    clave: 'Mirá la vela cerrada, no la que se está formando',
    texto:
      'Una vela que está abierta todavía puede terminar en cualquier lado. El precio puede estar '
      + '20 puntos abajo del nivel y cerrar arriba.',
  },
  {
    n: '02',
    titulo: 'Buscá la mecha',
    clave: 'Mecha larga contra el nivel es la señal más limpia que hay',
    texto:
      'Si el precio entró al nivel y volvió, queda una mecha larga apuntando hacia el nivel y un '
      + 'cuerpo chico del otro lado. Eso significa que alguien defendió esa zona.',
  },
  {
    n: '03',
    titulo: 'Pedí la vela de confirmación',
    clave: 'Una sola vela no alcanza',
    texto:
      'Necesitás que la siguiente cierre en la dirección del rechazo. Si la primera rebotó y la '
      + 'segunda vuelve a meterse en el nivel, la señal se rompió.',
  },
  {
    n: '04',
    titulo: 'Si rompe, esperá que vuelva',
    clave: 'El retroceso es la entrada, con mejor precio y stop más corto',
    texto:
      'Cuando el precio atraviesa el nivel con fuerza, no entres ahí. Casi siempre vuelve a '
      + 'tocarlo desde el otro lado antes de seguir.',
  },
  {
    n: '05',
    titulo: 'Poné el stop del otro lado del nivel',
    clave: 'Del otro lado de la mecha, con un poco de aire',
    texto:
      'No pegado al precio de entrada. Si el precio llega ahí, tu lectura estaba mal y conviene '
      + 'salir barato.',
  },
];

const NO_ENTRAR = [
  'Si la vela cierra justo encima del nivel, sin mecha clara ni dirección.',
  'Si hay noticia importante en los próximos minutos.',
  'Si venís de dos pérdidas seguidas y estás con ganas de recuperar.',
];

export default async function Instrucciones() {
  // Read only for the header — the page itself is open to anyone, registered
  // or not, so nothing below is gated on this.
  const trial = await getTrialState();

  return (
    <div className="lp">
      <ClockBar />
      <SiteHeader trial={trial} />

      {/* ============ ENCABEZADO ============ */}
      <div className="ins-hero">
        <div className="wrap">
          <nav className="ins-crumb" aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <span>Instrucciones de uso</span>
          </nav>

          <div className="slabel">Abierto sin registro · 3 min de lectura</div>
          <h1>
            Cómo confirmar
            <span className="l2">un nivel</span>
            <span className="l2"><u>antes de entrar.</u></span>
          </h1>

          <p className="ins-hook">
            El nivel te dice <strong>dónde</strong> mirar. La vela te dice <strong>cuándo</strong>.
          </p>

          <p className="lede">
            Cuando el precio llega al nivel, esperá. Todavía no sabés si va a rebotar o a romper
            — las dos cosas se ven idénticas en ese momento. Lo que cambia todo es lo que hace la
            vela ahí.
          </p>
        </div>
      </div>

      {/* ============ LOS CINCO PASOS ============ */}
      <section className="white">
        <div className="wrap">
          <div className="slabel">La secuencia completa</div>
          <h2>Los cinco pasos</h2>
          <p className="slede">
            En este orden. Saltearse uno es el error que se paga: casi siempre el paso 1 o el 3.
          </p>

          <ol className="ins-pasos">
            {PASOS.map(paso => (
              <li key={paso.n} className="ins-paso">
                <div className="ins-paso-n">{paso.n}</div>
                <div className="ins-paso-body">
                  <h3>{paso.titulo}</h3>
                  <p className="ins-paso-clave">{paso.clave}</p>
                  <p className="ins-paso-txt">{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ CUÁNDO NO ENTRAR ============ */}
      <section>
        <div className="wrap">
          <div className="ins-two">
            <div>
              <div className="slabel">Tres casos, ninguna excepción</div>
              <h2>Cuándo <u>no</u> entrar</h2>
              <p className="slede" style={{ marginBottom: 0 }}>
                No entrar también es operar. La operación que no abrís es la única que tiene
                pérdida garantizada de cero.
              </p>
            </div>

            <ul className="ins-no">
              {NO_ENTRAR.map(caso => (
                <li key={caso}>{caso}</li>
              ))}
            </ul>
          </div>

          {/* La advertencia de que el método puede fallar. */}
          <div className="ins-warn">
            <div className="ins-warn-k">Lo importante</div>
            <p className="ins-warn-big">
              Esto no acierta siempre y <u>no existe método que lo haga.</u>
            </p>
            <p>
              Vas a tener niveles que se atraviesan sin frenar. Por eso el tamaño de la posición
              importa más que la entrada: una lectura equivocada con el tamaño correcto es un mal
              día, con el tamaño equivocado es la cuenta.
            </p>
          </div>
        </div>
      </section>

      {/* ============ SEGUIR ============ */}
      <div className="bigband">
        <div className="wrap">
          <div className="bb-k">Ya sabés cuándo</div>
          <h3>Ahora mirá dónde</h3>
          <p>
            Los seis niveles del día están publicados desde las 07:00 de Paraguay. Volvé a esta
            página cada vez que dudes en el momento de apretar el botón.
          </p>
          <div className="ins-cta">
            <a href="/#niveles" className="btn btn-s">Ver los niveles de hoy</a>
            <Link href="/terminal" className="btn">Abrir terminal de niveles</Link>
            <a href="/#empezar" className="ins-link">Repasar los cuatro casos de vela →</a>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
