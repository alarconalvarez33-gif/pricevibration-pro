/** i18n strings for the Terminal home — ES / EN / Hindi. */
export type Lang = 'es' | 'en' | 'hi';

export interface Strings {
  // navigation
  n_markets: string; n_levels: string; n_tools: string; n_learn: string; n_plans: string;
  login: string; subscribe: string;
  // ticker
  chg: string; high: string; low: string; vol: string;
  // panels
  ob: string; box_levels: string;
  risk_h: string; r_bal: string; r_pct: string; r_stop: string; r_amt: string; r_units: string;
  alert_h: string; alert_txt: string;
  res: string; sup: string; bias: string; price: string; bull: string; bear: string; neu: string;
  lock_p: string; lock_b: string;
  // below
  learn_h: string; learn_sub: string;
  steps: Array<[string, string, string]>; // [number, title, body]
  tools_h: string; tools_sub: string;
  t: Array<[string, string, string]>;     // [name, body, pill]
  plan_h: string; plan_sub: string;
  m_usdt: string; copy: string; m_other: string; m_pp_txt: string; m_pp: string;
  // free preview banner
  preview_h: string; preview_sub: string; preview_blocked: string; preview_cta: string;
  // footer
  disc: string;
}

export const STR: Record<Lang, Strings> = {
  es: {
    n_markets: 'Mercados', n_levels: 'Niveles', n_tools: 'Herramientas', n_learn: 'Cómo operar', n_plans: 'Planes',
    login: 'Iniciar sesión', subscribe: 'Suscribite',
    chg: 'Cambio 24h', high: 'Máximo 24h', low: 'Mínimo 24h', vol: 'Volumen 24h',
    ob: 'Libro de órdenes', box_levels: 'Niveles N1–N6',
    risk_h: 'Calculadora de riesgo',
    r_bal: 'Capital de la cuenta', r_pct: 'Riesgo por operación (%)', r_stop: 'Precio de stop',
    r_amt: 'En riesgo', r_units: 'Tamaño',
    alert_h: 'Alertas de nivel', alert_txt: 'Avisarme cuando el precio toque un nivel N1–N6',
    res: 'Resistencia', sup: 'Soporte', bias: 'Sesgo', price: 'precio',
    bull: 'Alcista', bear: 'Bajista', neu: 'Neutral',
    lock_p: 'Los niveles N1–N6 y el sesgo son para suscriptores.',
    lock_b: 'Suscribite para ver',
    learn_h: 'Cómo operar con los niveles', learn_sub: 'En cuatro pasos, sin vueltas.',
    steps: [
      ['1', 'Elegí activo y temporalidad', 'Seleccioná el mercado (oro, BTC, una acción) y el marco de tiempo en el que operás.'],
      ['2', 'Mirá los niveles N1–N6', 'Arriba del precio están las resistencias; abajo, los soportes. Son las zonas donde el precio suele reaccionar.'],
      ['3', 'Esperá la reacción', 'No entres solo porque el precio llegó a un nivel. Esperá una señal de rechazo o confirmación en ese nivel.'],
      ['4', 'Definí tu riesgo', 'Usá la calculadora para saber cuánto arriesgar y el tamaño exacto antes de entrar. Siempre con stop.'],
    ],
    tools_h: 'Herramientas', tools_sub: 'Para operar con plan, no con corazonada.',
    t: [
      ['Calculadora de riesgo',     'Tamaño de posición exacto según tu capital y tu stop.', 'Incluido'],
      ['Confluencia multi-temporal', 'El sesgo en 15m, 1h, 4h y 1d a la vez.',                'Pro'],
      ['Alertas de nivel',          'Aviso cuando el precio toca un N1–N6.',                  'Pro'],
      ['Diario de operaciones',     'Registrá y analizá tus trades.',                          'Incluido'],
      ['Conversor de divisas',      'Operá en USD, EUR o rupias.',                             'Incluido'],
      ['Academia',                  'Aprendé el método paso a paso.',                          'Pro'],
    ],
    plan_h: 'Acceso completo',
    plan_sub: 'Desbloqueá los niveles N1–N6 en todos los activos y las herramientas Pro.',
    m_usdt: 'Pagar con USDT (Binance · red TRC-20)',
    copy: 'Copiar',
    m_other: 'Otros métodos',
    m_pp_txt: 'Pagá en guaraníes con tarjeta, transferencia o billetera por PagoPar.',
    m_pp: 'Pagar con PagoPar',
    preview_h: 'Estás viendo en modo prueba',
    preview_sub: 'Suscribite para acceso ilimitado al terminal.',
    preview_blocked: 'Tu prueba gratis terminó.',
    preview_cta: 'Suscribirme',
    disc: 'Análisis con fines educativos. Los niveles son un cálculo algorítmico, no una predicción ni asesoramiento financiero. Operar con apalancamiento conlleva riesgo de pérdida.',
  },
  en: {
    n_markets: 'Markets', n_levels: 'Levels', n_tools: 'Tools', n_learn: 'How to trade', n_plans: 'Plans',
    login: 'Log in', subscribe: 'Subscribe',
    chg: '24h Change', high: '24h High', low: '24h Low', vol: '24h Volume',
    ob: 'Order book', box_levels: 'Levels N1–N6',
    risk_h: 'Risk calculator',
    r_bal: 'Account balance', r_pct: 'Risk per trade (%)', r_stop: 'Stop price',
    r_amt: 'At risk', r_units: 'Size',
    alert_h: 'Level alerts', alert_txt: 'Notify me when price hits an N1–N6 level',
    res: 'Resistance', sup: 'Support', bias: 'Bias', price: 'price',
    bull: 'Bullish', bear: 'Bearish', neu: 'Neutral',
    lock_p: 'N1–N6 levels and bias are for subscribers.',
    lock_b: 'Subscribe to unlock',
    learn_h: 'How to trade the levels', learn_sub: 'Four steps, no fluff.',
    steps: [
      ['1', 'Pick asset and timeframe', 'Choose the market (gold, BTC, a stock) and the timeframe you trade.'],
      ['2', 'Read the N1–N6 levels',    'Resistances sit above price; supports below. These are the zones where price tends to react.'],
      ['3', 'Wait for the reaction',     "Don't enter just because price reached a level. Wait for a rejection or confirmation there."],
      ['4', 'Set your risk',             'Use the calculator to size your position before entering. Always with a stop.'],
    ],
    tools_h: 'Tools', tools_sub: 'Trade with a plan, not a hunch.',
    t: [
      ['Risk calculator',            'Exact position size for your capital and stop.',  'Included'],
      ['Multi-timeframe confluence', 'Bias on 15m, 1h, 4h and 1d at once.',              'Pro'],
      ['Level alerts',               'Alert when price hits an N1–N6.',                  'Pro'],
      ['Trading journal',            'Log and review your trades.',                       'Included'],
      ['Currency converter',         'Trade in USD, EUR or rupees.',                      'Included'],
      ['Academy',                    'Learn the method step by step.',                    'Pro'],
    ],
    plan_h: 'Full access',
    plan_sub: 'Unlock the N1–N6 levels on every asset and the Pro tools.',
    m_usdt: 'Pay with USDT (Binance · TRC-20)',
    copy: 'Copy',
    m_other: 'Other methods',
    m_pp_txt: 'Pay in guaraníes by card, transfer or wallet via PagoPar.',
    m_pp: 'Pay with PagoPar',
    preview_h: 'You are in trial mode',
    preview_sub: 'Subscribe for unlimited access to the terminal.',
    preview_blocked: 'Your free trial is over.',
    preview_cta: 'Subscribe',
    disc: 'Educational analysis. Levels are an algorithmic calculation, not a prediction or financial advice. Leveraged trading carries risk of loss.',
  },
  hi: {
    n_markets: 'मार्केट', n_levels: 'स्तर', n_tools: 'टूल्स', n_learn: 'कैसे ट्रेड करें', n_plans: 'प्लान',
    login: 'लॉग इन', subscribe: 'सब्सक्राइब',
    chg: '24घं बदलाव', high: '24घं उच्च', low: '24घं निम्न', vol: '24घं वॉल्यूम',
    ob: 'ऑर्डर बुक', box_levels: 'स्तर N1–N6',
    risk_h: 'रिस्क कैलकुलेटर',
    r_bal: 'खाता शेष', r_pct: 'प्रति ट्रेड जोखिम (%)', r_stop: 'स्टॉप मूल्य',
    r_amt: 'जोखिम में', r_units: 'साइज़',
    alert_h: 'स्तर अलर्ट', alert_txt: 'जब कीमत N1–N6 स्तर छुए तो सूचित करें',
    res: 'प्रतिरोध', sup: 'समर्थन', bias: 'रुझान', price: 'मूल्य',
    bull: 'तेज़ी', bear: 'मंदी', neu: 'तटस्थ',
    lock_p: 'N1–N6 स्तर और रुझान सदस्यों के लिए हैं।',
    lock_b: 'अनलॉक करें',
    learn_h: 'स्तरों से ट्रेड कैसे करें', learn_sub: 'चार चरणों में।',
    steps: [
      ['1', 'संपत्ति और समय सीमा चुनें', 'मार्केट (सोना, BTC, स्टॉक) और अपनी समय सीमा चुनें।'],
      ['2', 'N1–N6 स्तर देखें',         'कीमत के ऊपर प्रतिरोध, नीचे समर्थन। ये वे क्षेत्र हैं जहाँ कीमत प्रतिक्रिया करती है।'],
      ['3', 'प्रतिक्रिया की प्रतीक्षा करें', 'सिर्फ स्तर पर पहुँचने से प्रवेश न करें। वहाँ अस्वीकृति या पुष्टि का इंतज़ार करें।'],
      ['4', 'अपना जोखिम तय करें',      'प्रवेश से पहले कैलकुलेटर से साइज़ तय करें। हमेशा स्टॉप के साथ।'],
    ],
    tools_h: 'टूल्स', tools_sub: 'योजना से ट्रेड करें, अंदाज़े से नहीं।',
    t: [
      ['रिस्क कैलकुलेटर',     'आपकी पूँजी और स्टॉप के अनुसार सही साइज़।', 'शामिल'],
      ['मल्टी-टाइमफ्रेम संगम', '15m, 1h, 4h और 1d का रुझान एक साथ।',     'प्रो'],
      ['स्तर अलर्ट',           'कीमत N1–N6 छुए तो अलर्ट।',                 'प्रो'],
      ['ट्रेडिंग जर्नल',       'अपने ट्रेड दर्ज करें।',                    'शामिल'],
      ['करेंसी कन्वर्टर',     'USD, EUR या रुपये में ट्रेड करें।',          'शामिल'],
      ['अकादमी',               'विधि कदम-दर-कदम सीखें।',                     'प्रो'],
    ],
    plan_h: 'पूर्ण एक्सेस',
    plan_sub: 'सभी संपत्तियों पर N1–N6 स्तर और प्रो टूल्स अनलॉक करें।',
    m_usdt: 'USDT से भुगतान (Binance · TRC-20)',
    copy: 'कॉपी',
    m_other: 'अन्य तरीके',
    m_pp_txt: 'PagoPar से कार्ड, ट्रांसफर या वॉलेट से भुगतान करें।',
    m_pp: 'PagoPar से भुगतान',
    preview_h: 'आप ट्रायल मोड में हैं',
    preview_sub: 'टर्मिनल के लिए असीमित एक्सेस हेतु सब्सक्राइब करें।',
    preview_blocked: 'आपका मुफ़्त ट्रायल समाप्त हो गया है।',
    preview_cta: 'सब्सक्राइब',
    disc: 'शैक्षिक विश्लेषण। स्तर एक एल्गोरिद्मिक गणना है, भविष्यवाणी या वित्तीय सलाह नहीं। लीवरेज ट्रेडिंग में हानि का जोखिम है।',
  },
};

export const FX: Record<'USD' | 'EUR' | 'INR', number> = { USD: 1, EUR: 0.92, INR: 83.3 };
export const SYM: Record<'USD' | 'EUR' | 'INR', string> = { USD: '$', EUR: '€', INR: '₹' };
export type Currency = keyof typeof FX;

export function money(v: number, cur: Currency): string {
  if (!isFinite(v) || v == null) return '—';
  const c = v * FX[cur];
  if (c >= 1000) return SYM[cur] + c.toLocaleString('en-US', { maximumFractionDigits: 1 });
  if (c >= 1)    return SYM[cur] + c.toFixed(2);
  return SYM[cur] + c.toFixed(5);
}
