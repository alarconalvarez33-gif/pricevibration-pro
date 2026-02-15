'use client';

import { useState, useEffect } from 'react';

interface HistoricalData {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
}

interface LevelResult {
  date: string;
  close: number;
  high: number;
  low: number;
  type: 'support' | 'resistance';
  action: 'bounce' | 'break';
}

export default function AnalysisPage() {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [priceInput, setPriceInput] = useState('');
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);
  const [stats, setStats] = useState<{
    maxPrice: number;
    maxDate: string;
    minPrice: number;
    minDate: string;
    avgPrice: number;
    totalDays: number;
  } | null>(null);
  const [volatilityData, setVolatilityData] = useState<{
    month: string;
    avgRange: number;
    avgRangePercent: number;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzed, setAnalyzed] = useState(false);

  // Load historical data
  useEffect(() => {
    fetch('/data/xauusd_historical.csv')
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n');
        const data: HistoricalData[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',');
          if (parts.length >= 5) {
            data.push({
              date: parts[0],
              close: parseFloat(parts[1]),
              open: parseFloat(parts[2]),
              high: parseFloat(parts[3]),
              low: parseFloat(parts[4])
            });
          }
        }
        
        setHistoricalData(data);
        calculateStats(data);
        calculateVolatility(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setIsLoading(false);
      });
  }, []);

  const calculateStats = (data: HistoricalData[]) => {
    if (data.length === 0) return;

    let maxPrice = 0;
    let maxDate = '';
    let minPrice = Infinity;
    let minDate = '';
    let totalPrice = 0;

    data.forEach(d => {
      if (d.high > maxPrice) {
        maxPrice = d.high;
        maxDate = d.date;
      }
      if (d.low < minPrice) {
        minPrice = d.low;
        minDate = d.date;
      }
      totalPrice += d.close;
    });

    setStats({
      maxPrice,
      maxDate,
      minPrice,
      minDate,
      avgPrice: totalPrice / data.length,
      totalDays: data.length
    });
  };

  const calculateVolatility = (data: HistoricalData[]) => {
    const monthlyData: { [key: string]: { ranges: number[], prices: number[] } } = {};

    data.forEach(d => {
      const month = d.date.substring(0, 7); // YYYY-MM
      const range = d.high - d.low;
      
      if (!monthlyData[month]) {
        monthlyData[month] = { ranges: [], prices: [] };
      }
      monthlyData[month].ranges.push(range);
      monthlyData[month].prices.push(d.close);
    });

    const volatility = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        avgRange: data.ranges.reduce((a, b) => a + b, 0) / data.ranges.length,
        avgRangePercent: (data.ranges.reduce((a, b) => a + b, 0) / data.ranges.length) / 
                         (data.prices.reduce((a, b) => a + b, 0) / data.prices.length) * 100
      }))
      .sort((a, b) => b.avgRangePercent - a.avgRangePercent)
      .slice(0, 12);

    setVolatilityData(volatility);
  };

  const validateLevel = () => {
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) return;

    const tolerance = price * 0.005; // 0.5%
    const results: LevelResult[] = [];

    historicalData.forEach((d, index) => {
      const nextDay = historicalData[index - 1]; // Data is sorted newest first
      
      // Check if price touched this level (within tolerance)
      if (d.low <= price + tolerance && d.high >= price - tolerance) {
        // Determine if it was support or resistance
        const isSupport = d.low <= price + tolerance && d.low >= price - tolerance;
        const isResistance = d.high >= price - tolerance && d.high <= price + tolerance;
        
        let type: 'support' | 'resistance' = 'support';
        let action: 'bounce' | 'break' = 'bounce';

        if (isSupport && d.close > price) {
          type = 'support';
          action = 'bounce';
        } else if (isSupport && d.close < price) {
          type = 'support';
          action = 'break';
        } else if (isResistance && d.close < price) {
          type = 'resistance';
          action = 'bounce';
        } else if (isResistance && d.close > price) {
          type = 'resistance';
          action = 'break';
        }

        // Use next day to confirm
        if (nextDay) {
          if (type === 'support') {
            action = nextDay.close > d.close ? 'bounce' : 'break';
          } else {
            action = nextDay.close < d.close ? 'bounce' : 'break';
          }
        }

        results.push({
          date: d.date,
          close: d.close,
          high: d.high,
          low: d.low,
          type,
          action
        });
      }
    });

    setLevelResults(results);
    setAnalyzed(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const bounceCount = levelResults.filter(r => r.action === 'bounce').length;
  const breakCount = levelResults.filter(r => r.action === 'break').length;
  const bounceRate = levelResults.length > 0 
    ? ((bounceCount / levelResults.length) * 100).toFixed(1) 
    : '0';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gold-500 text-xl">Loading historical data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-[#c9a227]">📊 Historical</span> Analysis
          </h1>
          <p className="text-gray-400 text-sm">
            XAU/USD Data from 2015 to 2026 • {stats?.totalDays.toLocaleString()} Trading Days
          </p>
          <p className="text-[#c9a227] text-xs mt-2 uppercase tracking-wider">
            Educational Tool Only
          </p>
        </div>

        {/* Price Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/20 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">All-Time High</div>
            <div className="text-2xl font-bold text-green-400">
              ${stats?.maxPrice.toFixed(2)}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              {stats && formatDate(stats.maxDate)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/20 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">All-Time Low</div>
            <div className="text-2xl font-bold text-red-400">
              ${stats?.minPrice.toFixed(2)}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              {stats && formatDate(stats.minDate)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/20 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Average Price</div>
            <div className="text-2xl font-bold text-[#c9a227]">
              ${stats?.avgPrice.toFixed(2)}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              10+ Years of Data
            </div>
          </div>
        </div>

        {/* Level Validator */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/20 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-[#c9a227] mb-4">
            🎯 Level Validator
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Enter a price level to see how many times it was tested historically
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="number"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder="Enter price (e.g., 2000)"
              className="flex-1 bg-[#0d0d0d] border border-[#c9a227]/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a227]"
            />
            <button
              onClick={validateLevel}
              className="bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold px-8 py-3 rounded-lg transition-colors"
            >
              VALIDATE LEVEL
            </button>
          </div>

          {analyzed && (
            <div className="space-y-4">
              {/* Results Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0d0d0d] rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-[#c9a227]">
                    {levelResults.length}
                  </div>
                  <div className="text-gray-400 text-sm">Times Tested</div>
                </div>
                <div className="bg-[#0d0d0d] rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {bounceCount}
                  </div>
                  <div className="text-gray-400 text-sm">Bounces</div>
                </div>
                <div className="bg-[#0d0d0d] rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-400">
                    {breakCount}
                  </div>
                  <div className="text-gray-400 text-sm">Breaks</div>
                </div>
                <div className="bg-[#0d0d0d] rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {bounceRate}%
                  </div>
                  <div className="text-gray-400 text-sm">Bounce Rate</div>
                </div>
              </div>

              {/* Results Table */}
              {levelResults.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-2">Date</th>
                        <th className="text-right py-2">Low</th>
                        <th className="text-right py-2">High</th>
                        <th className="text-right py-2">Close</th>
                        <th className="text-center py-2">Type</th>
                        <th className="text-center py-2">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {levelResults.slice(0, 20).map((result, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-2">{formatDate(result.date)}</td>
                          <td className="text-right text-red-400">${result.low.toFixed(2)}</td>
                          <td className="text-right text-green-400">${result.high.toFixed(2)}</td>
                          <td className="text-right">${result.close.toFixed(2)}</td>
                          <td className="text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              result.type === 'support' 
                                ? 'bg-green-900/50 text-green-400' 
                                : 'bg-red-900/50 text-red-400'
                            }`}>
                              {result.type === 'support' ? 'Support' : 'Resistance'}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              result.action === 'bounce' 
                                ? 'bg-blue-900/50 text-blue-400' 
                                : 'bg-orange-900/50 text-orange-400'
                            }`}>
                              {result.action === 'bounce' ? '↩ Bounce' : '↗ Break'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {levelResults.length > 20 && (
                    <p className="text-gray-500 text-sm mt-2 text-center">
                      Showing 20 of {levelResults.length} results
                    </p>
                  )}
                </div>
              )}

              {levelResults.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No historical data found for this price level.
                  <br />
                  <span className="text-sm">Try a price between ${stats?.minPrice.toFixed(0)} and ${stats?.maxPrice.toFixed(0)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Volatility Analysis */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/20 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-[#c9a227] mb-4">
            📈 Top Volatile Months
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Months with highest average daily range (percentage of price)
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {volatilityData.slice(0, 8).map((v, index) => (
              <div 
                key={v.month} 
                className="bg-[#0d0d0d] rounded-lg p-3 border border-gray-800"
              >
                <div className="text-gray-400 text-xs">{v.month}</div>
                <div className="text-lg font-bold text-[#c9a227]">
                  {v.avgRangePercent.toFixed(2)}%
                </div>
                <div className="text-gray-500 text-xs">
                  ${v.avgRange.toFixed(2)} avg range
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-[#1a1a1a] border border-yellow-900/50 rounded-xl p-6 text-center">
          <p className="text-yellow-600 text-sm font-medium mb-2">
            ⚠️ Important Disclaimer
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            This is an educational tool for technical analysis purposes only. 
            Historical patterns do not guarantee future results. 
            This is not financial advice. Trading involves substantial risk of loss. 
            You are solely responsible for your trading decisions.
          </p>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <a 
            href="/dashboard" 
            className="text-[#c9a227] hover:text-[#d4af37] transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
