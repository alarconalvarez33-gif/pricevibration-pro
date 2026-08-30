/**
 * Lectura de las cookies de descarte desde un server component.
 *
 * Separado de boardPromo.ts porque `next/headers` no puede entrar en el bundle
 * del cliente, y el componente del bloque importa las constantes de ahí.
 */

import 'server-only';
import { cookies } from 'next/headers';
import { COUNT_COOKIE, HIDE_COOKIE, isHidden } from './boardPromo';

/** True cuando el visitante lo cerró hace menos de 24 h, o ya lo cerró tres veces esta semana. */
export function isBoardPromoHidden(): boolean {
  try {
    const jar = cookies();
    return isHidden(jar.get(HIDE_COOKIE)?.value, jar.get(COUNT_COOKIE)?.value);
  } catch {
    // Fuera de un contexto de request (render estático): mostralo.
    return false;
  }
}
