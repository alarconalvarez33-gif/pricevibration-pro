"use client";

import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function HistoricalAnalysis() {
  const [data, setData] = useState([]);
  const [priceInput, setPriceInput] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargamos el CSV desde la carpeta public/Data
    Papa.parse('/Data/xauusd_historical.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error cargando CSV:", err);
        setLoading(false);
      }
    });
  }, []);

  const validateLevel = () => {
    const target = parseFloat(priceInput);
    if (!target || isNaN(target)) return;

    // Validación con margen del 0.5% para detectar rebotes históricos
    const results = data.filter(row => {
      const close = parseFloat(row.close);
      return close >= target * 0.995 && close <= target * 1.005;
    });
    setMatches(results);
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#D4AF37', borderBottom: '2px solid #D4AF37', paddingBottom: '10px', display: 'inline-block' }}>
          📊 SACRED LEVELS: HISTORICAL ANALYSIS
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '10px' }}>
          EDUCATIONAL TOOL ONLY. HISTORICAL PATTERNS DO NOT GUARANTEE FUTURE RESULTS.
        </p>
      </header>

      {/* VALIDACIÓN DE NIVELES */}
      <section style={{ marginBottom: '40px', border: '1px solid #333', padding: '25px', borderRadius: '12px', backgroundColor: '#111' }}>
        <h2 style={{ color: '#D4AF37', marginTop: '0' }}>XAU/USD LEVEL VALIDATOR</h2>
        <p style={{ color: '#ccc', marginBottom: '20px' }}>Verifica la relevancia histórica de un precio específico (Margen ±0.5%).</p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="number" 
            placeholder="Ej: 2050.50" 
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #D4AF37', backgroundColor: '#1a1a1a', color: '#fff', width: '220px', outline: 'none' }}
          />
          <button 
            onClick={validateLevel} 
            style={{ padding: '12px 30px', backgroundColor: '#D4AF37', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            VALIDATE LEVEL
          </button>
        </div>

        <div style={{ marginTop: '30px' }}>
          {loading ? (
            <p style={{ color: '#D4AF37' }}>Cargando base de datos histórica...</p>
          ) : matches.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #D4AF37', color: '#D4AF37' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Price at Close</th>
                    <th style={{ padding: '12px' }}>Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 12).map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '12px' }}>{m.date}</td>
                      <td style={{ padding: '12px' }}>${m.close}</td>
                      <td style={{ padding: '12px', color: '#00ff00', fontWeight: '500' }}>✓ HISTORICAL REACTION</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {matches.length > 12 && (
                <p style={{ color: '#888', marginTop: '15px', fontStyle: 'italic' }}>
                  Mostrando las primeras 12 de {matches.length} coincidencias encontradas.
                </p>
              )}
            </div>
          ) : priceInput && (
            <p style={{ color: '#ff4444', backgroundColor: 'rgba(255,68,68,0.1)', padding: '10px', borderRadius: '4px' }}>
              No se detectaron interacciones significativas en este nivel de precio.
            </p>
          )}
        </div>
      </section>

      {/* ESTADÍSTICAS DEL SERVICIO */}
      <footer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #222', borderRadius: '8px' }}>
          <h4 style={{ color: '#D4AF37', margin: '0 0 10px 0' }}>DATABASE INFO</h4>
          <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>Asset: XAU/USD</p>
          <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>History: 2015 - 2026</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #222', borderRadius: '8px' }}>
          <h4 style={{ color: '#D4AF37', margin: '0 0 10px 0' }}>PRO/WHALE BENEFITS</h4>
          <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>Status: Verified Account</p>
          <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>Access: Full Level Validation</p>
        </div>
      </footer>
    </div>
  );
}
