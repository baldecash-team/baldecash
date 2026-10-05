'use client';

/**
 * La franja de referido en el resto del recorrido: catálogo, detalle, wizard.
 *
 * La landing la resuelve server-side y la pinta ya en el HTML, porque es la única
 * página que tiene el `?promotor=` / `?ref=` en la URL y porque ahí un banner que
 * aparece a los 300 ms empuja el hero justo cuando el usuario va a tocar el CTA.
 * De la landing en adelante el querystring se pierde —`routes.catalogo()` arma
 * una URL limpia— así que esas páginas no tienen con qué resolverla solas.
 *
 * Este componente cubre exactamente eso, en dos pasos y en ese orden:
 *
 *   1. Lo guardado por la propia franja cuando se pintó (`referralBannerCache`).
 *      Es el camino normal: sin red, y sirve para los dos parámetros.
 *   2. Si no hay nada guardado, el `ref` que `captureLandingParams` dejó en
 *      localStorage, resuelto contra el endpoint público del hub. Cubre la
 *      pestaña recuperada, el link compartido a mitad de camino, y el caso en
 *      que sessionStorage no estaba disponible cuando se pintó la landing.
 *
 * El fetch del paso 2 sí corre en el navegador, a diferencia del de la landing.
 * Acá es lo correcto y no una excepción a la regla: no hay nada arriba de la
 * franja que se pueda desplazar, y estas páginas ya montan su contenido en el
 * cliente. La alternativa —convertir catálogo, detalle y wizard en rutas
 * dinámicas para leer un parámetro que ya ni siquiera está en la URL— cuesta
 * infinitamente más que un GET cacheado.
 *
 * `?promotor=` no tiene paso 2: resolverlo necesita también el token del
 * `utm_term`, que tampoco sobrevive. En ese camino la franja vive de lo guardado
 * —que dura toda la sesión— y es aceptable: `ref` es el identificador que viaja
 * en todos los links del hub.
 */

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useParams } from 'next/navigation';
import { ReferralBanner } from './ReferralBanner';
import { guardarFranja, leerFranjaGuardada, suscribirFranja } from './referralBannerCache';
import { fetchReferralBannerByRef } from '../../services/referralBannerApi';
import { getPromotorRef } from '../../utils/landingParams';

export function ReferralBannerGate() {
  const params = useParams();
  const landing = (params?.landing as string) || 'home';

  /**
   * La franja sale del guardado, no de un `useState` que un efecto rellena.
   *
   * `sessionStorage` es un sistema externo a React y así se lee. De paso resuelve
   * dos cosas que con estado propio habría que manejar a mano: el valor entra
   * durante la hidratación en vez de en un render posterior, y al navegar entre
   * landings sin recargar la franja de la anterior no queda pegada —el snapshot
   * es por slug—.
   *
   * El snapshot del servidor es null a propósito: en el servidor no hay storage,
   * y devolver otra cosa sería un mismatch de hidratación.
   */
  const leer = useCallback(() => leerFranjaGuardada(landing), [landing]);
  const data = useSyncExternalStore(suscribirFranja, leer, () => null);

  useEffect(() => {
    // Con franja guardada no se gasta un fetch: es el camino normal.
    if (data || leerFranjaGuardada(landing)) return;

    const ref = getPromotorRef(landing);
    if (!ref) return;

    let cancelado = false;
    // Nunca lanza: ante cualquier problema devuelve null y la página sigue sin
    // franja. Ver `referralBannerApi`.
    fetchReferralBannerByRef(ref).then((delHub) => {
      // No hay `setState`: se guarda, y el guardado avisa a los suscriptores.
      // Una sola fuente de verdad, y el resto del recorrido ya lo encuentra
      // resuelto sin volver a pegarle al hub.
      if (!cancelado && delHub) guardarFranja(landing, delHub);
    });

    return () => {
      cancelado = true;
    };
  }, [landing, data]);

  if (!data) return null;

  return <ReferralBanner data={data} landingSlug={landing} />;
}
