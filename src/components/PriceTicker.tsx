'use client';

import { useEffect, useRef, memo } from 'react';

const PriceTicker = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Limpiar widget anterior si existe
    const existingScript = container.current.querySelector('script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "symbols": [
          {"proName": "FOREXCOM:EURUSD", "title": "EUR/USD"},
          {"proName": "FOREXCOM:GBPUSD", "title": "GBP/USD"},
          {"proName": "FOREXCOM:USDJPY", "title": "USD/JPY"},
          {"proName": "BITSTAMP:BTCUSD", "title": "Bitcoin"},
          {"proName": "BITSTAMP:ETHUSD", "title": "Ethereum"},
          {"proName": "TVC:GOLD", "title": "Oro"},
          {"proName": "TVC:SILVER", "title": "Plata"},
          {"proName": "CAPITALCOM:US500", "title": "S&P 500"},
          {"proName": "CAPITALCOM:US100", "title": "NASDAQ"}
        ],
        "showSymbolLogo": true,
        "colorTheme": "dark",
        "isTransparent": true,
        "displayMode": "adaptive",
        "locale": "es"
      }
    `;

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        const scriptToRemove = container.current.querySelector('script');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      }
    };
  }, []);

  return (
    <div className="w-full bg-[#0a0a0a] border-b border-gray-800">
      <div className="tradingview-widget-container" ref={container} style={{ height: '46px', width: '100%' }}>
        <div className="tradingview-widget-container__widget" style={{ height: '46px', width: '100%' }}></div>
      </div>
    </div>
  );
};

export default memo(PriceTicker);
