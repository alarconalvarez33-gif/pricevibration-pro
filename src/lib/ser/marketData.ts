import { headers } from 'next/headers'

// Mapeo entre nombres del modelo SER y los símbolos del endpoint /api/markets
const SYMBOL_MAP: Record<string, string> = {
  'XAUUSD': 'XAU/USD',
  'EURUSD': 'EUR/USD',
  'GBPUSD': 'GBP/USD',
  'USDJPY': 'USD/JPY',
  'BTCUSD': 'BTC/USD',
  'ETHUSD': 'ETH/USD',
  'SPX500': 'SPX500',
  'NAS100': 'NAS100',
  'DXY':    'DXY',
}

const ASSET_PATTERNS: Record<string, RegExp[]> = {
  'XAUUSD': [/xauusd/i, /xau\/usd/i, /\boro\b/i, /\bgold\b/i],
  'EURUSD': [/eurusd/i, /eur\/usd/i, /\beuro\b/i],
  'GBPUSD': [/gbpusd/i, /gbp\/usd/i, /\blibra\b/i],
  'USDJPY': [/usdjpy/i, /usd\/jpy/i, /\byen\b/i],
  'BTCUSD': [/btcusd/i, /btc\/usd/i, /\bbitcoin\b/i, /\bbtc\b/i],
  'ETHUSD': [/ethusd/i, /eth\/usd/i, /\bethereum\b/i, /\beth\b/i],
  'SPX500': [/\bspx\b/i, /\bsp500\b/i, /sp\s*500/i, /s&p\s*500/i],
  'NAS100': [/\bnas100\b/i, /\bnasdaq\b/i, /nas\s*100/i],
  'DXY':    [/\bdxy\b/i, /dollar\s*index/i, /índice\s*dólar/i],
}

const TIMEFRAME_PATTERNS: Record<string, RegExp[]> = {
  'M1':  [/\bm1\b/i, /1\s*minuto/i, /\b1m\b/i],
  'M5':  [/\bm5\b/i, /5\s*minutos/i, /\b5m\b/i],
  'M15': [/\bm15\b/i, /15\s*minutos/i, /\b15m\b/i],
  'M30': [/\bm30\b/i, /30\s*minutos/i, /\b30m\b/i],
  'H1':  [/\bh1\b/i, /1\s*hora/i, /\b1h\b/i, /una\s*hora/i],
  'H4':  [/\bh4\b/i, /4\s*horas/i, /\b4h\b/i],
  'D1':  [/\bd1\b/i, /\bdiario\b/i, /\bdaily\b/i, /\b1d\b/i],
  'W1':  [/\bw1\b/i, /\bsemanal\b/i, /\bweekly\b/i, /\b1w\b/i],
  'MN':  [/\bmn\b/i, /\bmensual\b/i, /\bmonthly\b/i],
}

function detectAsset(text: string): string | null {
  for (const [asset, patterns] of Object.entries(ASSET_PATTERNS)) {
    if (patterns.some(r => r.test(text))) return asset
  }
  return null
}

function detectTimeframe(text: string): string | null {
  for (const [tf, patterns] of Object.entries(TIMEFRAME_PATTERNS)) {
    if (patterns.some(r => r.test(text))) return tf
  }
  return null
}

export async function getMarketContext(message: string): Promise<string> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('[SER MarketData] Mensaje:', message)

  if (!message) return ''

  const detectedAsset = detectAsset(message)
  console.log('[SER MarketData] Asset detectado:', detectedAsset)
  if (!detectedAsset) return ''

  const detectedTimeframe = detectTimeframe(message)
  console.log('[SER MarketData] Timeframe:', detectedTimeframe || 'no especificado')

  try {
    // Construir URL base
    let baseUrl = process.env.NEXT_PUBLIC_URL
    if (!baseUrl) {
      try {
        const headersList = headers()
        const host = headersList.get('host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        baseUrl = `${protocol}://${host}`
      } catch {
        baseUrl = 'http://localhost:3000'
      }
    }

    const url = `${baseUrl}/api/markets`
    console.log('[SER MarketData] 🌐 Fetching:', url)

    const response = await fetch(url, {
      headers: { 'x-internal-call': 'true' },
      cache: 'no-store',
    })

    console.log('[SER MarketData] Status:', response.status)

    if (!response.ok) {
      console.error('[SER MarketData] ❌ Response not OK:', response.status)
      return ''
    }

    const data = await response.json()

    // Estructura esperada: { markets: [...] }
    if (!data.markets || !Array.isArray(data.markets)) {
      console.error('[SER MarketData] ❌ Estructura inesperada:', JSON.stringify(data).substring(0, 200))
      return ''
    }

    const targetSymbol = SYMBOL_MAP[detectedAsset] || detectedAsset
    const assetData = data.markets.find((m: any) => m.symbol === targetSymbol)

    if (!assetData) {
      console.error('[SER MarketData] ❌ Activo no encontrado:', targetSymbol)
      console.log('[SER MarketData] Disponibles:', data.markets.map((m: any) => m.symbol).join(', '))
      return ''
    }

    if (assetData.offline || !assetData.price) {
      console.warn('[SER MarketData] ⚠️ Datos offline para:', targetSymbol)
      return `\n\n[DATOS NO DISPONIBLES — ${detectedAsset}]\nIndica al usuario que verifique el precio en su plataforma de trading.\n`
    }

    console.log('[SER MarketData] ✅ Precio encontrado:', assetData.price, 'para', targetSymbol)

    const sign = assetData.changePercent >= 0 ? '+' : ''
    const ctx = `

═══════════════════════════════════════════
DATOS DE MERCADO REALES (${detectedAsset})
═══════════════════════════════════════════
- Precio actual: ${assetData.price}
- Cambio 24h: ${sign}${assetData.changePercent}% (${sign}${assetData.change})
- Máximo 24h: ${assetData.high}
- Mínimo 24h: ${assetData.low}
- Fuente: ${assetData.source || 'Sacred Levels Market Feed'}${detectedTimeframe ? `\n- Temporalidad solicitada: ${detectedTimeframe}` : ''}
═══════════════════════════════════════════

⚠️ INSTRUCCIÓN CRÍTICA: Usa EXACTAMENTE el precio ${assetData.price} para tus cálculos.
NO inventes precios. NO uses precios de tu memoria histórica.
${detectedTimeframe
  ? `El usuario solicitó análisis en ${detectedTimeframe}. DEBES mencionar "${detectedTimeframe}" en tu respuesta.`
  : 'No especificó temporalidad. Asume H1 y menciónalo: "Asumiendo H1, ..."'}
`
    console.log('[SER MarketData] ✅ Contexto generado, longitud:', ctx.length)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return ctx

  } catch (e: any) {
    console.error('[SER MarketData] ❌ Error:', e.message)
    return ''
  }
}
