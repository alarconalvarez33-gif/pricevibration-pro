const crypto = require('crypto');

const PRIVATE_KEY = '85ece630fff92520e3943f1f2a8d3c60';
const PUBLIC_KEY = '8ca1a050e7f2f5d2e0d1f4de644ae562';
const orderId = 'TEST-' + Date.now();
const monto = '340000';
const token = crypto.createHash('sha1').update(PRIVATE_KEY + orderId + monto).digest('hex');

console.log('='.repeat(80));
console.log('TEST PAGOPAR API');
console.log('='.repeat(80));
console.log('Order ID:', orderId);
console.log('Monto:', monto);
console.log('Token String:', PRIVATE_KEY + orderId + monto);
console.log('Token SHA1:', token);
console.log('Public Key:', PUBLIC_KEY);
console.log('='.repeat(80));

const body = {
  token: PUBLIC_KEY,
  comprador_email: 'test@sacredlevels.com',
  comprador_telefono: '0981000000',
  comprador_documento: '1000000',
  comprador_razon_social: 'Test User',
  id_pedido_comercio: orderId,
  descripcion: 'Test Pagopar Integration',
  monto_total: monto,
  moneda: 'PYG',
  tipo_pedido: 'VENTA-COMERCIO',
  forma_pago: '9',
  hash: token,
};

console.log('\nREQUEST BODY:');
console.log(JSON.stringify(body, null, 2));
console.log('='.repeat(80));

fetch('https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})
  .then(response => {
    console.log('\nRESPONSE STATUS:', response.status);
    console.log('Response OK:', response.ok);
    return response.json();
  })
  .then(data => {
    console.log('\nRESPONSE BODY:');
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(80));

    if (data.error) {
      console.error('\n❌ ERROR:', data.error);
      console.error('Mensaje:', data.mensaje || data.message || 'No message');
    }

    if (data.resultado) {
      console.log('\n✅ Resultado recibido');
      console.log('Tipo:', typeof data.resultado);
      if (Array.isArray(data.resultado)) {
        console.log('Array length:', data.resultado.length);
        console.log('Primer elemento:', JSON.stringify(data.resultado[0], null, 2));
      }
    }
  })
  .catch(error => {
    console.error('\n❌ FETCH ERROR:', error.message);
    console.error(error);
  });
