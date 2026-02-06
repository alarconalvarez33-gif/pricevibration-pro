"use client";

import React from 'react';

export default function BillingPage() {
  const handleCheckout = async (plan: string, price: number) => {
    try {
      // Llamamos a la API que ya configuramos
      const res = await fetch('/api/pagopar/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, price })
      });

      const data = await res.json();

      if (data.hash) {
        // Redirigimos al usuario a la pasarela oficial de Pagopar
        window.location.href = `https://www.pagopar.com/pagos/${data.hash}`;
      } else {
        console.error("Error en data:", data);
      alert("Error de Pagopar: " + (data.error || "No se pudo generar el hash"));
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error interno del servidor al procesar el pago.");
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#1a202c', marginBottom: '30px' }}>Selecciona tu Plan de Sacred Levels</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        {/* Botón para Plan Pro */}
        <button 
          onClick={() => handleCheckout('Pro', 217500)}
          style={{ padding: '15px 30px', backgroundColor: '#4a5568', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Start Pro (217.500 PYG)
        </button>

        {/* Botón para Plan Whale */}
        <button 
          onClick={() => handleCheckout('Whale', 742500)}
          style={{ padding: '15px 30px', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Become a Whale (742.500 PYG)
        </button>
      </div>
    </div>
  );
}
