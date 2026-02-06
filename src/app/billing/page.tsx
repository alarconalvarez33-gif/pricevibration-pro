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
      // Este alert te dirá el error real de Pagopar (ej: "Token inválido")
      alert("Error de Pagopar: " + (data.error || "No se pudo generar el hash"));
    }
  } catch (error) {
    alert("Error de conexión");
  }
};
