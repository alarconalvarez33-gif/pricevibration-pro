/**
 * Catalogue of assets shown on the terminal home.
 * Tuple: [internalSymbol, displayName, tvSymbol]
 *   internalSymbol: matches the `symbol` field returned by /api/markets
 *   tvSymbol:       TradingView widget proName ("EXCHANGE:TICKER")
 */
export type AssetTuple = [string, string, string];

export type AssetCategory = 'Cripto' | 'Metales' | 'Índices' | 'Acciones US' | 'India' | 'Forex';

export const ASSETS: Record<AssetCategory, AssetTuple[]> = {
  'Cripto': [
    ['BTC/USD', 'Bitcoin',  'BINANCE:BTCUSDT'],
    ['ETH/USD', 'Ethereum', 'BINANCE:ETHUSDT'],
    ['SOL/USD', 'Solana',   'BINANCE:SOLUSDT'],
    ['XRP/USD', 'XRP',      'BINANCE:XRPUSDT'],
  ],
  'Metales': [
    ['XAU/USD', 'Oro',   'OANDA:XAUUSD'],
    ['XAG/USD', 'Plata', 'OANDA:XAGUSD'],
  ],
  'Índices': [
    ['US30',   'Dow Jones',  'OANDA:US30USD'],
    ['NAS100', 'Nasdaq 100', 'OANDA:NAS100USD'],
  ],
  'Acciones US': [
    ['NVDA', 'Nvidia', 'NASDAQ:NVDA'],
    ['AAPL', 'Apple',  'NASDAQ:AAPL'],
    ['TSLA', 'Tesla',  'NASDAQ:TSLA'],
  ],
  'India': [
    ['RELIANCE',   'Reliance',         'NSE:RELIANCE'],
    ['TCS',        'Tata Consultancy', 'NSE:TCS'],
    ['HDFCBANK',   'HDFC Bank',        'NSE:HDFCBANK'],
    ['INFY',       'Infosys',          'NSE:INFY'],
    ['ICICIBANK',  'ICICI Bank',       'NSE:ICICIBANK'],
    ['SBIN',       'State Bank',       'NSE:SBIN'],
    ['BHARTIARTL', 'Bharti Airtel',    'NSE:BHARTIARTL'],
    ['TATAMOTORS', 'Tata Motors',      'NSE:TATAMOTORS'],
  ],
  'Forex': [
    ['EUR/USD', 'Euro/Dólar', 'OANDA:EURUSD'],
    ['GBP/JPY', 'Libra/Yen',  'OANDA:GBPJPY'],
  ],
};

/** Flat list with category appended at index 3. */
export const FLAT: Array<readonly [string, string, string, AssetCategory]> =
  (Object.keys(ASSETS) as AssetCategory[]).flatMap(cat =>
    ASSETS[cat].map(a => [a[0], a[1], a[2], cat] as const)
  );

export function findAsset(sym: string) {
  return FLAT.find(a => a[0] === sym);
}

export const TIMEFRAMES = ['15m', '1h', '4h', '1d'] as const;
export type Timeframe = typeof TIMEFRAMES[number];

export const CATEGORIES: AssetCategory[] = Object.keys(ASSETS) as AssetCategory[];
