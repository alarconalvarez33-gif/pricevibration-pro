// Guide content for each calculator — ES and EN
// Used in dashboard (CalcGuide modal) and /quantum page (collapsible section)

export interface GuideContent {
  es: string
  en: string
}

export const GUIDE_QUANTICA: GuideContent = {
  es: `Cómo usar la Calculadora Cuántica

Esta calculadora usa la fórmula E = n² aplicada al rango del precio para encontrar niveles cuánticos de soporte y resistencia.

Pasos:
1. Ingresá el precio máximo (High) reciente del activo
2. Ingresá el precio mínimo (Low) reciente del activo
3. Presioná 'Generar Niveles Quantum'

Interpretación de resultados:
- DISTRIBUCIÓN (arriba) — resistencias donde el precio puede frenar o revertir a la baja
- ACUMULACIÓN (abajo) — soportes donde el precio puede frenar o rebotar al alza
- EQUILIBRIO — zonas de transición, el nivel puede actuar como soporte o resistencia según la dirección
- Cuanto más cerca esté el precio de un nivel, mayor probabilidad de reacción

💡 Consejo: Usá un rango de las últimas 4-8 horas para scalping, o el rango del día/semana para swing trading.`,

  en: `How to use the Quantum Calculator

This calculator uses the E = n² formula applied to the price range to find quantum support and resistance levels.

Steps:
1. Enter the recent High price of the asset
2. Enter the recent Low price of the asset
3. Press 'Generate Quantum Levels'

Reading results:
- DISTRIBUTION (top) — resistances where price may stall or reverse downward
- ACCUMULATION (bottom) — supports where price may stall or bounce upward
- EQUILIBRIUM — transition zones, the level can act as support or resistance depending on direction
- The closer price is to a level, the higher the probability of reaction

💡 Tip: Use a 4-8 hour range for scalping, or daily/weekly range for swing trading.`,
}

export const GUIDE_CLASICA: GuideContent = {
  es: `Cómo usar la Calculadora Gann Clásica

Esta calculadora aplica los ángulos y divisiones del método original de W.D. Gann para encontrar niveles naturales del mercado.

Pasos:
1. Ingresá el precio de referencia (precio actual o un pivote importante)
2. Configurá el factor de vibración según tu estilo:
   - Scalping: valores bajos para movimientos de minutos
   - Intraday: valores medios para movimientos del día
   - Swing: valores altos para movimientos de varios días
3. Presioná 'Calcular'

Interpretación:
- Los niveles cardinales (90°, 180°, 270°, 360°) son los más fuertes
- Estos niveles representan las divisiones naturales del círculo de Gann
- El precio tiende a moverse de nivel a nivel — cuando rompe uno, busca el siguiente
- Los niveles que coinciden con números redondos (4000, 4050, 4100) son especialmente fuertes

💡 Consejo: Buscá confluencia entre los niveles de Gann y los de las otras calculadoras. Donde 2 o 3 métodos coinciden, la probabilidad de reacción se multiplica.`,

  en: `How to use the Classic Gann Calculator

This calculator applies W.D. Gann's original angles and divisions to find natural market levels.

Steps:
1. Enter the reference price (current price or an important pivot)
2. Set the vibration factor based on your style:
   - Scalping: low values for minute-based moves
   - Intraday: medium values for same-day moves
   - Swing: high values for multi-day moves
3. Press 'Calculate'

Reading results:
- Cardinal levels (90°, 180°, 270°, 360°) are the strongest
- These levels represent natural divisions of Gann's circle
- Price tends to move level to level — when it breaks one, it seeks the next
- Levels that coincide with round numbers (4000, 4050, 4100) are especially strong

💡 Tip: Look for confluence between Gann levels and those from the other calculators. Where 2 or 3 methods agree, reaction probability multiplies.`,
}

export const GUIDE_AUREA: GuideContent = {
  es: `Cómo usar la Calculadora Áurea de Gann

La calculadora usa un algoritmo propietario basado en geometría del precio para calcular niveles de alta probabilidad. El método está desarrollado en profundidad en el curso Genesis.

Pasos:
1. Para calcular RESISTENCIAS: ingresá el precio mínimo reciente (el low más bajo de la sesión o del período que analizás)
2. Para calcular SOPORTES: ingresá el precio máximo reciente (el high más alto de la sesión o del período)
3. Presioná 'Calcular Niveles Áureos'

Interpretación de resultados:
- R1-R2: resistencias más cercanas, útiles para scalping
- R3-R5: resistencias intermedias, objetivos intraday
- R6-R8: resistencias extendidas, objetivos de swing
- Lo mismo aplica para soportes (S1 más cercano, S8 más lejano)
- Los niveles del centro (R4, S4) son especialmente significativos

💡 Consejo: Ingresá el low del día para resistencias y el high del día para soportes. Después compará con la calculadora cuántica — donde ambas coinciden, tenés una zona de alta probabilidad.`,

  en: `How to use the Gann Aurea Calculator

The calculator uses a proprietary algorithm based on price geometry to calculate high-probability levels. The method is covered in depth in the Genesis course.

Steps:
1. For RESISTANCES: enter the recent low price (the lowest low of the session or period you're analyzing)
2. For SUPPORTS: enter the recent high price (the highest high of the session or period)
3. Press 'Calculate Aurea Levels'

Reading results:
- R1-R2: closest resistances, useful for scalping
- R3-R5: intermediate resistances, intraday targets
- R6-R8: extended resistances, swing targets
- Same applies for supports (S1 closest, S8 farthest)
- Mid-range levels (R4, S4) are especially significant

💡 Tip: Enter today's low for resistances and today's high for supports. Then compare with the quantum calculator — where both agree, you have a high-probability zone.`,
}
