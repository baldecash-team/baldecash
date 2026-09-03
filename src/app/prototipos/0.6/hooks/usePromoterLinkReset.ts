'use client';

import { useState } from 'react';
import { resetLandingSessionIfPromoterLinkChanged } from '../utils/landingSession';

/**
 * Al abrir el link de OTRA promotora en el mismo equipo, borra la visita
 * anterior antes de que la landing arranque la nueva.
 *
 * Corre en el inicializador de `useState` y no en un `useEffect`, a propósito.
 * Los efectos corren de hijos a padres, y acá los hijos son justo los que
 * escriben lo que hay que haber borrado antes:
 *
 *   - `ReferralBanner` guarda la franja del link nuevo en su efecto de montaje.
 *     Un reset en efecto del padre correría después y borraría esa franja, no
 *     la vieja.
 *   - `SessionProvider` lee el `session_uuid` guardado en su efecto de montaje
 *     y lo reutiliza. Un reset posterior lo borraría del storage, pero la
 *     sesión de tracking ya habría nacido con el uuid de la promotora anterior
 *     y la solicitud se le atribuiría a ella.
 *
 * El inicializador corre durante el primer render del componente, antes de que
 * exista ningún hijo. En el servidor es un no-op (no hay storage) y no afecta
 * al HTML, así que no hay desajuste de hidratación. En StrictMode corre dos
 * veces: la segunda encuentra el link ya recordado y no hace nada.
 *
 * Devuelve si limpió, por si alguien quiere registrarlo. Nadie lo pinta.
 */
export function usePromoterLinkReset(landingSlug: string): boolean {
  const [limpio] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return resetLandingSessionIfPromoterLinkChanged(landingSlug, window.location.search);
  });
  return limpio;
}
