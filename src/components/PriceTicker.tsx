'use client';

import { useEffect, useRef } from 'react';

const PriceTicker = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'FX:EURUSD',        title: 'EUR/USD' },
        { proName: 'FX:GBPUSD',        title: 'GBP/USD' },
        { proName: 'FX:USDJPY',        title: 'USD/JPY' },
        { proName: 'OANDA:XAUUSD',     title: 'ORO' },
        { proName: 'OANDA:XAGUSD',     title: 'PLATA' },
        { proName: 'COINBASE:BTCUSD',  title: 'BTC' },
        { proName: 'COINBASE:ETHUSD',  title: 'ETH' },
        { proName: 'FOREXCOM:SPXUSD',  title: 'S&P 500' },
        { proName: 'FOREXCOM:NSXUSD',  title: 'NASDAQ' },
      ],
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: false,
      displayMode: 'adaptive',
      locale: 'es',
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      style={{ width: '100%', minHeight: '46px' }}
    >
      <div className="tradingview-widget-container__widget" style={{ width: '100%' }} />
    </div>
  );
};

export default PriceTicker;
