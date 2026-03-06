'use client';

const PriceTicker = () => {
  return (
    <div className="w-full" style={{ height: '46px', overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
      <iframe
        src="https://s.tradingview.com/embed-widget/ticker-tape/?locale=es#%7B%22symbols%22%3A%5B%7B%22proName%22%3A%22FX%3AEURUSD%22%2C%22title%22%3A%22EUR%2FUSD%22%7D%2C%7B%22proName%22%3A%22FX%3AGBPUSD%22%2C%22title%22%3A%22GBP%2FUSD%22%7D%2C%7B%22proName%22%3A%22OANDA%3AXAUUSD%22%2C%22title%22%3A%22Gold%22%7D%2C%7B%22proName%22%3A%22OANDA%3AXAGUSD%22%2C%22title%22%3A%22Silver%22%7D%2C%7B%22proName%22%3A%22INDEX%3ASPX%22%2C%22title%22%3A%22S%26P%20500%22%7D%2C%7B%22proName%22%3A%22NASDAQ%3ANDX%22%2C%22title%22%3A%22NASDAQ%22%7D%2C%7B%22proName%22%3A%22COINBASE%3ABTCUSD%22%2C%22title%22%3A%22Bitcoin%22%7D%2C%7B%22proName%22%3A%22COINBASE%3AETHUSD%22%2C%22title%22%3A%22Ethereum%22%7D%2C%7B%22proName%22%3A%22COINBASE%3ASOLUSD%22%2C%22title%22%3A%22Solana%22%7D%5D%2C%22showSymbolLogo%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Afalse%2C%22displayMode%22%3A%22regular%22%2C%22locale%22%3A%22es%22%7D"
        style={{ width: '100%', height: '46px', border: 'none', display: 'block' }}
        scrolling="no"
        title="TradingView Price Ticker"
      />
    </div>
  );
};

export default PriceTicker;
