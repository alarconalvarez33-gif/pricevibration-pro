import Image from 'next/image';
import Link from 'next/link';

/**
 * Footer for every page: navigation, legal links, and the full risk notice.
 *
 * The eight disclaimer paragraphs are the ones drafted in the design reference,
 * carried over word for word. The one edit is the operator's name: the mockup
 * still said "Sacred Levels", which is the retired domain — a legal notice has
 * to name the entity that actually takes the commission.
 */
export default function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-main">
          <div className="foot-brand">
            <div className="tmt">
              <Image src="/tmtlogo.png" alt="The Mentor Trading" width={110} height={62} style={{ height: 34, width: 'auto' }} />
              <span>TMT</span>
            </div>
            <p>
              Niveles algorítmicos publicados cada mañana a las 07:00 de Paraguay, con
              registro público verificado al cierre.
            </p>
          </div>

          <div>
            <h5>El sitio</h5>
            <a href="/#buscas">¿Qué buscás?</a>
            <a href="/#empezar">Empezar de cero</a>
            <a href="/#estrategias">Estrategias de precisión</a>
            <a href="/#registro">Registro público</a>
            <Link href="/terminal">Terminal de niveles</Link>
          </div>

          <div>
            <h5>Legales</h5>
            <Link href="/terms">Términos y condiciones</Link>
            <Link href="/privacy">Política de privacidad</Link>
            <Link href="/disclaimer">Advertencia de riesgo</Link>
            <a href="/#contacto">Contacto</a>
          </div>
        </div>

        <div className="legal">
          <h5>Advertencia de riesgo y aviso legal</h5>

          <p>
            <strong>Esto no es asesoramiento financiero.</strong> Todo el contenido de este
            sitio — niveles, análisis, materiales educativos y titulares — tiene fines
            informativos y educativos únicamente. No constituye asesoramiento de inversión,
            recomendación personalizada, ni oferta o solicitud de compra o venta de ningún
            instrumento financiero. No conocemos tu situación patrimonial, tus objetivos ni tu
            tolerancia al riesgo, y por lo tanto nada de lo publicado acá está adaptado a tu
            caso particular.
          </p>

          <p>
            <strong>Los niveles son un cálculo, no una predicción.</strong> Se obtienen
            aplicando una fórmula determinista sobre el precio histórico. Que el precio haya
            respetado un nivel en el pasado no implica que vaya a hacerlo de nuevo. El registro
            público describe lo que ocurrió; no anticipa lo que va a ocurrir.{' '}
            <strong>El rendimiento pasado no garantiza resultados futuros.</strong>
          </p>

          <p>
            <strong>Operar con apalancamiento es de alto riesgo.</strong> Los CFD, el mercado
            de divisas y los productos apalancados pueden hacerte perder dinero rápidamente,
            incluso más de lo que depositaste. Un porcentaje elevado de las cuentas minoristas
            pierde dinero operando estos instrumentos. No inviertas dinero que no puedas
            permitirte perder, ni fondos destinados a gastos esenciales, deudas o emergencias.
          </p>

          <p>
            <strong>Relación con el broker.</strong> Trading.com.py (The Mentor Trading) es
            socio introductor de Exness y percibe una comisión por las cuentas abiertas a
            través de nuestros enlaces. Esa comisión la paga el broker con parte de su
            diferencial y no representa un costo adicional para vos. Aun así, queremos que lo
            sepas: es un incentivo económico que conviene tener presente al leer cualquier
            recomendación de abrir cuenta. La elección del broker es tuya y podés compararlo
            con otras opciones.
          </p>

          <p>
            <strong>Contenido de terceros.</strong> Los titulares financieros provienen de
            fuentes externas. No verificamos ni respaldamos su exactitud, y los mostramos solo
            como contexto de mercado.
          </p>

          <p>
            <strong>Disponibilidad y errores.</strong> Los datos pueden presentar retrasos,
            interrupciones o errores. No garantizamos disponibilidad continua ni exactitud de
            los precios mostrados, y no somos responsables por decisiones tomadas a partir de
            información incompleta o desactualizada.
          </p>

          <p>
            <strong>Materiales de pago.</strong> Los videos de estrategias son material
            educativo. No prometen ni garantizan ganancias de ningún tipo. Al comprarlos
            accedés a contenido informativo, no a un servicio de gestión de inversiones ni a
            señales de operación.
          </p>

          <p>
            <strong>Jurisdicción y edad.</strong> Este sitio se opera desde Paraguay. Es tu
            responsabilidad verificar que operar instrumentos financieros sea legal en tu país
            de residencia y cumplir con la normativa fiscal aplicable. El contenido está
            dirigido exclusivamente a mayores de 18 años.
          </p>
        </div>

        <div className="foot-end">
          <span>© {new Date().getFullYear()} Trading.com.py · The Mentor Trading</span>
          <span>ASUNCIÓN, PARAGUAY · UTC−3</span>
        </div>
      </div>
    </footer>
  );
}
