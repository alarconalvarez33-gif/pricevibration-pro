"use client";
import React from 'react';

export default function BillingPage() {
  const handleCheckout = async (plan: string, price: number) => {
    try {
      const res = await fetch('/api/pagopar/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, price })
      });
      const data = await res.json();
      if (data.hash) {
        window.location.href = `https://www.pagopar.com/pagos/${data.hash}`;
      } else {
        alert("Error de Pagopar: " + (data.error || "No se pudo generar el hash"));
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '50px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', fontWeight: 'bold' }}>Planes Sacred Levels</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Plan Whale */}
        <div style={{ border: '1px solid #d4af37', padding: '30px', borderRadius: '15px', backgroundColor: '#111', width: '300px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#d4af37' }}>Whale</h2>
          <p style={{ fontSize: '1.5rem', margin: '20px 0' }}>742.500 PYG</p>
          <ul style={{ textAlign: 'left', marginBottom: '30px', listStyle: 'none', padding: 0 }}>
            <li>✓ Indicadores Premium</li>
            <li>✓ Mentoría Algorítmica</li>
            <li>✓ Soporte Prioritario</li>
          </ul>
          <button 
            onClick={() => handleCheckout('Whale', 742500)}
            style={{ width: '100%', padding: '12px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Become a Whale
          </button>
        </div>

      </div>
    </div>
  );
}
