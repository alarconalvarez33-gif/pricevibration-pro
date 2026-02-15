import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function HistoricalAnalysis() {
  const [data, setData] = useState([]);
  const [priceInput, setPriceInput] = useState('');
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // Cargamos el CSV desde la carpeta public/Data que creaste
    Papa.parse('/Data/xauusd_historical.csv', {
      download: true,
      header: true,
      complete: (results) => setData(results.data),
    });
  }, []);

  const validateLevel = () => {
    const target = parseFloat(priceInput);
    const results = data.filter(row => {
      const close = parseFloat(row.close);
      return close >= target * 0.995 && close <= target * 1.005;
    });
    setMatches(results);
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#D4AF37', borderBottom: '2px solid #D4AF37' }}>📊 HISTORICAL ANALYSIS</h1>
      <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '30px' }}>
        Educational tool only. Historical patterns do not guarantee future results.
      </p>

      {/* A) LEVEL VALIDATION */}
      <section style={{ marginBottom: '50px', border: '1px solid #333', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#D4AF37' }}>LEVEL VALIDATION</h2>
        <input 
          type="number" 
          placeholder="Enter XAU/USD price (e.g. 2050)" 
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #D4AF37', backgroundColor: '#1a1a1a', color: '#fff' }}
        />
        <button onClick={validateLevel} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#D4AF37', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          VALIDATE
        </button>

        <div style={{ marginTop: '20px' }}>
          {matches.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #D4AF37' }}>
                  <th>Date</th>
                  <th>Close Price</th>
                  <th>Interaction</th>
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 10).map((m, i) => (
                  <tr key={i} style={{ textAlign: 'center', borderBottom: '1px solid #222' }}>
                    <td>{m.date}</td>
                    <td>${m.close}</td>
                    <td style={{ color: '#00ff00' }}>Historical Touch</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No historical touches found within 0.5% range.</p>}
        </div>
      </section>

      {/* B) VOLATILITY & PRICE STATS (Resumen rápido) */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ border: '1px solid #333', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#D4AF37' }}>PRICE STATISTICS</h3>
          <p>Total Data Points: {data.length}</p>
          <p>Range Analyzed: 2015 - 2026</p>
        </div>
        <div style={{ border: '1px solid #333', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#D4AF37' }}>MARKET STRUCTURE</h3>
          <p>Asset: XAU/USD (Gold)</p>
          <p>Source: Sacred Levels Historical Database</p>
        </div>
      </section>
    </div>
  );
}
