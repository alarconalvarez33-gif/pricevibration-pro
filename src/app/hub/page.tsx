'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Types
interface QuantumLevel {
  level: string;
  price: number;
  type: 'buy' | 'sell' | 'neutral';
  strength: number;
}

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  levels: QuantumLevel[];
  signal: 'BUY' | 'SELL' | 'WAIT';
  aiAnalysis: string;
}

interface Signal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  price: number;
  level: string;
  time: string;
  confidence: number;
}

// Calculate Quantum Levels
function calculateQuantumLevels(high: number, low: number): QuantumLevel[] {
  const range = high - low;
  const levels: QuantumLevel[] = [];

  for (let n = 0; n <= 8; n++) {
    const position = Math.pow(n / 8, 2);
    const price = low + range * position;
    levels.push({
      level: `Q${n}`,
      price: Math.round(price * 100) / 100,
      type: n <= 3 ? 'buy' : n >= 6 ? 'sell' : 'neutral',
      strength: n === 0 || n === 8 ? 100 : n === 4 ? 80 : 60,
    });
  }

  return levels;
}

// Generate AI Analysis
function generateAIAnalysis(symbol: string, price: number, levels: QuantumLevel[]): string {
  const nearestLevel = levels.reduce((prev, curr) =>
    Math.abs(curr.price - price) < Math.abs(prev.price - price) ? curr : prev
  );

  const distance = ((price - nearestLevel.price) / price * 100).toFixed(2);
  const zone =
    nearestLevel.type === 'buy'
      ? 'accumulation'
      : nearestLevel.type === 'sell'
      ? 'distribution'
      : 'equilibrium';

  const analyses = [
    `${symbol} is currently trading near ${nearestLevel.level} (${nearestLevel.price}), a key ${zone} zone. Price is ${Math.abs(parseFloat(distance))}% ${parseFloat(distance) > 0 ? 'above' : 'below'} this level. Watch for potential reversal signals.`,
    `Quantum analysis shows ${symbol} approaching critical ${nearestLevel.level} level. The ${zone} zone suggests ${nearestLevel.type === 'buy' ? 'bullish accumulation' : nearestLevel.type === 'sell' ? 'bearish distribution' : 'consolidation'} in progress.`,
    `${symbol} at ${price} is testing the ${nearestLevel.level} quantum level. Historical data suggests high probability reversals at this ${zone} zone. Confidence: ${nearestLevel.strength}%.`,
  ];

  return analyses[Math.floor(Math.random() * analyses.length)];
}

// Mock Market Data
const initialMarkets: MarketData[] = [
  { symbol: 'XAU/USD', name: 'Gold', price: 2645.50, change: 12.30, changePercent: 0.47, high: 2700, low: 2500, levels: [], signal: 'BUY', aiAnalysis: '' },
  { symbol: 'EUR/USD', name: 'Euro/Dollar', price: 1.0875, change: -0.0023, changePercent: -0.21, high: 1.1200, low: 1.0500, levels: [], signal: 'WAIT', aiAnalysis: '' },
  { symbol: 'BTC/USD', name: 'Bitcoin', price: 67450, change: 1250, changePercent: 1.89, high: 73000, low: 58000, levels: [], signal: 'BUY', aiAnalysis: '' },
  { symbol: 'ETH/USD', name: 'Ethereum', price: 3520, change: -45, changePercent: -1.26, high: 4000, low: 3000, levels: [], signal: 'SELL', aiAnalysis: '' },
  { symbol: 'SPX500', name: 'S&P 500', price: 5234.50, change: 28.75, changePercent: 0.55, high: 5400, low: 4800, levels: [], signal: 'BUY', aiAnalysis: '' },
  { symbol: 'NAS100', name: 'NASDAQ 100', price: 18456, change: -124, changePercent: -0.67, high: 19500, low: 17000, levels: [], signal: 'WAIT', aiAnalysis: '' },
  { symbol: 'GBP/USD', name: 'Pound/Dollar', price: 1.2715, change: 0.0045, changePercent: 0.35, high: 1.3100, low: 1.2300, levels: [], signal: 'BUY', aiAnalysis: '' },
  { symbol: 'USD/JPY', name: 'Dollar/Yen', price: 154.25, change: -0.85, changePercent: -0.55, high: 160, low: 145, levels: [], signal: 'SELL', aiAnalysis: '' },
];

// Recent Signals
const recentSignals: Signal[] = [
  { id: '1', symbol: 'XAU/USD', type: 'BUY', price: 2632.50, level: 'Q3', time: '2 min ago', confidence: 87 },
  { id: '2', symbol: 'BTC/USD', type: 'BUY', price: 66800, level: 'Q2', time: '15 min ago', confidence: 92 },
  { id: '3', symbol: 'EUR/USD', type: 'SELL', price: 1.0920, level: 'Q6', time: '32 min ago', confidence: 78 },
  { id: '4', symbol: 'SPX500', type: 'BUY', price: 5198, level: 'Q4', time: '1 hr ago', confidence: 85 },
  { id: '5', symbol: 'ETH/USD', type: 'SELL', price: 3580, level: 'Q7', time: '2 hr ago', confidence: 73 },
];

function formatPrice(market: MarketData, price: number): string {
  if (market.symbol.includes('JPY')) return price.toFixed(2);
  if (market.symbol.includes('BTC') || market.symbol.includes('SPX') || market.symbol.includes('NAS')) return price.toFixed(0);
  return price.toFixed(price < 10 ? 4 : 2);
}

export default function QuantumSignalHub() {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
  const [filter, setFilter] = useState<'all' | 'forex' | 'crypto' | 'indices'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const marketsWithLevels = initialMarkets.map(market => {
      const levels = calculateQuantumLevels(market.high, market.low);
      const aiAnalysis = generateAIAnalysis(market.symbol, market.price, levels);
      return { ...market, levels, aiAnalysis };
    });

    setMarkets(marketsWithLevels);
    setSelectedMarket(marketsWithLevels[0]);
    setIsLoading(false);

    // Simulate real-time price updates
    const interval = setInterval(() => {
      setMarkets(prev =>
        prev.map(market => {
          const fluctuation = (Math.random() - 0.5) * 0.002;
          const newPrice = market.price * (1 + fluctuation);
          const newChange = newPrice - (market.price - market.change);
          return {
            ...market,
            price: Math.round(newPrice * 100) / 100,
            change: Math.round(newChange * 100) / 100,
            changePercent: Math.round((newChange / (market.price - market.change)) * 10000) / 100,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Keep selectedMarket in sync with markets updates
  useEffect(() => {
    if (selectedMarket) {
      const updated = markets.find(m => m.symbol === selectedMarket.symbol);
      if (updated) setSelectedMarket(updated);
    }
  }, [markets]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredMarkets = markets.filter(market => {
    if (filter === 'forex') return ['EUR/USD', 'GBP/USD', 'USD/JPY'].includes(market.symbol);
    if (filter === 'crypto') return ['BTC/USD', 'ETH/USD'].includes(market.symbol);
    if (filter === 'indices') return ['SPX500', 'NAS100'].includes(market.symbol);
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Quantum Signal Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#a8861f] rounded-xl flex items-center justify-center text-black font-bold text-lg">
                Q
              </div>
              <div>
                <span className="text-xl font-bold text-white">Quantum Signal Hub</span>
                <span className="hidden sm:inline text-xs text-gray-500 ml-2">by Sacred Levels</span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-sm font-medium">Live</span>
              </div>
              <Link href="/quantum" className="text-gray-400 hover:text-white text-sm">
                Calculator
              </Link>
              <Link
                href="/billing"
                className="bg-gradient-to-r from-[#c9a227] to-[#a8861f] text-black px-4 py-2 rounded-lg text-sm font-bold hover:from-[#d4af37] hover:to-[#c9a227] transition-all"
              >
                Upgrade Pro
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-4">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Active Signals</p>
            <p className="text-2xl font-bold text-white">24</p>
            <p className="text-green-400 text-xs">+5 today</p>
          </div>
          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Win Rate</p>
            <p className="text-2xl font-bold text-green-400">78.5%</p>
            <p className="text-gray-500 text-xs">Last 30 days</p>
          </div>
          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Markets Tracked</p>
            <p className="text-2xl font-bold text-white">{markets.length}</p>
            <p className="text-gray-500 text-xs">Real-time</p>
          </div>
          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">AI Confidence</p>
            <p className="text-2xl font-bold text-[#c9a227]">85%</p>
            <p className="text-gray-500 text-xs">Average</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Markets List */}
          <div className="lg:col-span-1">
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {(['all', 'forex', 'crypto', 'indices'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filter === f
                      ? 'bg-[#c9a227] text-black'
                      : 'bg-[#1a1a2e] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Markets List */}
            <div className="space-y-2">
              {filteredMarkets.map(market => (
                <div
                  key={market.symbol}
                  onClick={() => setSelectedMarket(market)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedMarket?.symbol === market.symbol
                      ? 'bg-[#1a1a2e] border-2 border-[#c9a227]'
                      : 'bg-[#1a1a2e]/50 border border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-white">{market.symbol}</span>
                      <span className="text-gray-500 text-sm ml-2">{market.name}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        market.signal === 'BUY'
                          ? 'bg-green-500/20 text-green-400'
                          : market.signal === 'SELL'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {market.signal}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-mono text-white">{formatPrice(market, market.price)}</span>
                    <span className={`text-sm font-medium ${market.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {market.changePercent >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Column - Selected Market & Levels */}
          <div className="lg:col-span-1">
            {selectedMarket && (
              <>
                {/* Selected Market Header */}
                <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedMarket.symbol}</h2>
                      <p className="text-gray-400">{selectedMarket.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-mono font-bold text-white">
                        {formatPrice(selectedMarket, selectedMarket.price)}
                      </p>
                      <p className={`text-lg ${selectedMarket.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedMarket.changePercent >= 0 ? '▲' : '▼'} {Math.abs(selectedMarket.changePercent).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* AI Analysis Box */}
                  <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-400">🤖</span>
                      <span className="text-purple-400 font-medium text-sm">AI Analysis</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{selectedMarket.aiAnalysis}</p>
                  </div>
                </div>

                {/* Quantum Levels */}
                <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-[#c9a227]">⚡</span>
                    Quantum Levels
                  </h3>
                  <div className="space-y-2">
                    {[...selectedMarket.levels].reverse().map(level => {
                      const isNearPrice =
                        Math.abs(level.price - selectedMarket.price) / selectedMarket.price < 0.01;
                      return (
                        <div
                          key={level.level}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            isNearPrice
                              ? 'ring-2 ring-[#c9a227] bg-[#c9a227]/10'
                              : level.type === 'buy'
                              ? 'bg-green-900/20 border-l-4 border-green-500'
                              : level.type === 'sell'
                              ? 'bg-red-900/20 border-l-4 border-red-500'
                              : 'bg-yellow-900/20 border-l-4 border-yellow-500'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-bold ${
                                level.type === 'buy'
                                  ? 'text-green-400'
                                  : level.type === 'sell'
                                  ? 'text-red-400'
                                  : 'text-yellow-400'
                              }`}
                            >
                              {level.level}
                            </span>
                            {isNearPrice && (
                              <span className="px-2 py-0.5 bg-[#c9a227] text-black text-xs rounded-full font-bold animate-pulse">
                                NEAR
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-20 bg-gray-800 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  level.type === 'buy'
                                    ? 'bg-green-500'
                                    : level.type === 'sell'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                                }`}
                                style={{ width: `${level.strength}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-white w-24 text-right">
                              {selectedMarket.symbol.includes('BTC')
                                ? level.price.toFixed(0)
                                : selectedMarket.symbol.includes('JPY')
                                ? level.price.toFixed(2)
                                : level.price.toFixed(level.price < 10 ? 4 : 2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Signals Feed */}
          <div className="lg:col-span-1">
            {/* Live Signals */}
            <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800 mb-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📡</span>
                Live Signals
              </h3>
              <div className="space-y-3">
                {recentSignals.map(signal => (
                  <div key={signal.id} className="p-4 bg-[#0a0a0a] rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${signal.type === 'BUY' ? 'bg-green-500' : 'bg-red-500'}`}
                        ></span>
                        <span className="font-bold text-white">{signal.symbol}</span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {signal.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        @ {signal.price} ({signal.level})
                      </span>
                      <span className="text-gray-500">{signal.time}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            signal.confidence >= 80
                              ? 'bg-green-500'
                              : signal.confidence >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${signal.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white font-medium">{signal.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#12121f] rounded-xl p-6 border border-[#c9a227]/30">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/quantum"
                  className="block w-full bg-[#c9a227] hover:bg-[#d4af37] text-black py-3 rounded-xl font-bold text-center transition-all"
                >
                  Open Calculator
                </Link>
                <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold transition-all">
                  🤖 Get AI Analysis
                </button>
                <button className="w-full border border-gray-700 hover:border-gray-600 text-white py-3 rounded-xl font-bold transition-all">
                  🔔 Set Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-[1800px] mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Quantum Signal Hub by Sacred Levels © 2026 | Data is simulated for demonstration</p>
        </div>
      </footer>
    </div>
  );
}
