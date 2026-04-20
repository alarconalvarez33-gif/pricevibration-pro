/**
 * Genera 100 códigos únicos de licencia MetaLevels.
 * Uso: npx tsx scripts/generate-initial-metalevels-codes.ts
 *
 * Salidas:
 *   metalevels-codes-pine.txt  → lista separada por " or\n  licenseKey == " (para Pine Script)
 *   metalevels-codes-list.txt  → un código por línea (legible)
 */

import { randomBytes } from 'crypto'
import * as fs from 'fs'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const COUNT = 100

function makeCode(): string {
  let part = ''
  const bytes = randomBytes(12)
  for (let i = 0; i < 12; i++) {
    part += CHARS[bytes[i] % CHARS.length]
  }
  return `SL-ML-${part}`
}

const codes = Array.from({ length: COUNT }, makeCode)

// Listado legible
fs.writeFileSync('metalevels-codes-list.txt', codes.join('\n'), 'utf-8')

// Formato para Pine Script v6 — validación multi-clave
// Pegá el bloque entre las líneas de corte en el Pine Script
const pineBlock = codes
  .map((c, i) => `  licenseKey == "${c}"${i < codes.length - 1 ? ' or' : ''}`)
  .join('\n')

const pineFile = `// ── MetaLevels valid_keys — generado automáticamente ──
// Reemplazá el bloque isLicenseValid en metalevels.pine con esto:

isLicenseValid =
${pineBlock}

// ── fin del bloque ──`

fs.writeFileSync('metalevels-codes-pine.txt', pineFile, 'utf-8')

console.log(`✅ ${COUNT} códigos generados`)
console.log('📁 metalevels-codes-list.txt  → un código por línea')
console.log('📁 metalevels-codes-pine.txt  → bloque listo para Pine Script')
console.log('')
console.log('Primeros 5 códigos:')
codes.slice(0, 5).forEach(c => console.log(' ', c))
