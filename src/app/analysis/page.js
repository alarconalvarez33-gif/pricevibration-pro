"use client"; // <--- ESTA ES LA LÍNEA CLAVE

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
      skipEmptyLines: true, // Evita errores con líneas vacías al final del Excel
      complete: (results) => {
        console.log("Datos cargados:", results.data.length);
        setData(results.data);
      },
    });
  }, []);

  const validateLevel = () => {
    const target = parseFloat(priceInput);
    if (!target) return;

    const results = data.filter(row => {
      const close = parseFloat(row.close);
      // Validación con margen del 0.5%
      return close >= target * 0.995 && close <= target * 1.005;
    });
    setMatches(results);
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#D4AF37', borderBottom: '2px solid #D4AF37', paddingBottom: '10px' }}>📊 HISTORICAL ANALYSIS</h1>
      <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '30px' }}>
        Educational tool only. Historical patterns do not guarantee future results.
      </p>

      {/* A) LEVEL VALIDATION */}
      <section style={{ marginBottom: '50px', border: '1px solid #333', padding: '20px', borderRadius: '8px', backgroundColor: '#111' }}>
        <h2 style={{ color: '#D4AF37', marginTop: '0' }}>LEVEL VALIDATION</h2>
        <p style={{ fontSize: '0.9rem', color: '#ccc' }}>Busca cuántas veces el Oro cerró cerca de este precio (margen ±0.5%) desde 2015.</p>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input 
            type="number" 
            placeholder="Ej: 2050" 
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #D4AF37', backgroundColor: '#1a1a1a', color: '#fff', width: '200px' }}
          />
          <button onClick={validateLevel} style={{ padding: '10px 25px', backgroundColor: '#D4AF37', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}>
            VALIDATE LEVEL
          </button>
        </div>

        <div style={{ marginTop: '25px' }}>
          {matches.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #D4AF37', color: '#D4AF37' }}>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Close Price</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 15).map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '10px' }}>{m.date}</td>
                      <td style={{ padding: '10px' }}>${m.close}</td>
                      <td style={{ padding: '10px', color: '#00ff00' }}>✓ Historical Match</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {matches.length > 15 && <p style={{ color: '#888', fontSize: '0.8rem' }}>...y {matches.length - 15} coincidencias más.</p>}
            </div>
          ) : priceInput && <p style={{ color: '#ff4444' }}>No se encontraron coincidencias históricas para este nivel.</p>}
        </div>
      </section>

      {/* B) INFO CARDS */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ border: '1px solid #333', padding: '20px', borderRadius: '8px', backgroundColor: '#111' }}>
          <h3 style={{ color: '#D4AF37', marginTop: '0' }}>DATA STATISTICS</h3>
          <p style={{ margin: '5px 0' }}>Registros totales: <strong>{data.length} días</strong></p>
          <p style={{ margin: '5px 0' }}>Periodo: <strong>2015 - 2026</strong></p>
          <p style={{ margin: '5px 0' }}>Activo: <strong>XAU/USD (Gold)</strong></p>
        </div>
        
        <div style={{ border: '1px solid #333', padding: '20px', borderRadius: '8px', backgroundColor: '#111' }}>
          <h3 style={{ color: '#D4AF37', marginTop: '0' }}>PRO/WHALE STATUS</h3>
          <p style={{ color: '#00ff00' }}>● Access Granted</p>
          <p style={{ fontSize: '0.85rem', color: '#ccc' }}>Estás utilizando la base de datos de alta precisión de Sacred Levels.</p>
        </div>
      </section>
    </div>
  );
}
