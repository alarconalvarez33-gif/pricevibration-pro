"use client";

import { useState, useEffect } from 'react';

export default function HistoricalAnalysis() {
  const [data, setData] = useState([]);
  const [priceInput, setPriceInput] = useState('');
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // Lectura nativa sin librerías externas
    fetch('/Data/xauusd_historical.csv')
      .then(response => response.text())
      .then(text => {
        const rows = text.split('\n').slice(1); // Quitamos el encabezado
        const parsed = rows.map(row => {
          const [date, close, open, high, low] = row.split(',');
          return { date, close: parseFloat(close) };
        }).filter(item => !isNaN(item.close));
        setData(parsed);
      })
      .catch(err => console.error("Error cargando datos:", err));
  }, []);

  const validateLevel = () => {
    const target = parseFloat(priceInput);
    if (!target) return;
    const results = data.filter(item => 
      item.close >= target * 0.995 && item.close <= target * 1.005
    );
    setMatches(results);
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', padding: '40px' }}>
      <h1 style={{ color: '#D4AF37', borderBottom: '2px solid #D4AF37' }}>📊 SACRED LEVELS: HISTORICAL VALIDATOR</h1>
      <p style={{ color: '#888', fontSize: '0.8rem' }}>EDUCATIONAL TOOL ONLY.</p>
      
      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #333', borderRadius: '8px' }}>
        <input 
          type="number" 
          placeholder="Precio Oro (ej: 2050)" 
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          style={{ padding: '10px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #D4AF37', borderRadius: '4px' }}
        />
        <button onClick={validateLevel} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#D4AF37', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          VALIDAR NIVEL
        </button>

        <div style={{ marginTop: '20px' }}>
          {matches.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#D4AF37', textAlign: 'left', borderBottom: '1px solid #D4AF37' }}>
                  <th>Fecha</th>
                  <th>Precio Cierre</th>
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 10).map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '8px 0' }}>{m.date}</td>
                    <td>${m.close}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : priceInput && <p>No hay coincidencias en el historial.</p>}
        </div>
      </div>
    </div>
  );
}
