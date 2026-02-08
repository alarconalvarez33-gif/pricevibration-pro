const crypto = require('crypto');

// INVERTIDAS - probar si están al revés
const PUBLIC_KEY = '85ece630fff92520e3943f1f2a8d3c60';  // Era PRIVATE
const PRIVATE_KEY = '8ca1a050e7f2f5d2e0d1f4de644ae562';  // Era PUBLIC
const orderId = 'TEST3-' + Date.now();
const monto = '340000';

const token = crypto.createHash('sha1').update(PRIVATE_KEY + orderId + monto).digest('hex');

console.log('='.repeat(80));
console.log('TEST PAGOPAR API - CREDENCIALES INVERTIDAS');
console.log('='.repeat(80));
console.log('Order ID:', orderId);
console.log('Token (con PRIVATE):', token);
console.log('PUBLIC (en token field):', PUBLIC_KEY);
console.log('='.repeat(80));

const body = {
  token: PUBLIC_KEY,
  comprador_email: 'test@sacredlevels.com',
  comprador_telefono: '0981000000',
  comprador_documento: '1000000',
  comprador_razon_social: 'Test User',
  id_pedido_comercio: orderId,
  descripcion: 'Test Pagopar',
  monto_total: monto,
  moneda: 'PYG',
  tipo_pedido: 'VENTA-COMERCIO',
  forma_pago: '9',
  hash: token,
};

console.log(JSON.stringify(body, null, 2));

fetch('https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})
  .then(r => r.json())
  .then(data => {
    console.log('\nRESPUESTA:');
    console.log(JSON.stringify(data, null, 2));
    if (data.respuesta === true) {
      console.log('\n✅✅✅ ÉXITO! ✅✅✅');
    } else {
      console.log('\n❌ Falló:', data.resultado);
    }
  })
  .catch(e => console.error('Error:', e.message));
