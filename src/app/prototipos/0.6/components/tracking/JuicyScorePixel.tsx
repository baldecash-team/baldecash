'use client';

/**
 * JuicyScorePixel — monta el pixel antifraude en el wizard de solicitud.
 *
 * Va en el layout de `[landing]/solicitar`, que es donde el postulante pasa el
 * tiempo y tipea: la doc de JuicyScore recomienda instalar el pixel en una de
 * las páginas finales del formulario para no perder la sesión por usuarios que
 * abandonan enseguida.
 *
 * No renderiza nada. Sin `NEXT_PUBLIC_JUICYSCORE_API_KEY` no hace absolutamente
 * nada, así que es seguro dejarlo montado en todas las landings.
 */

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  loadJuicyPixel,
  captureJuicySessionId,
  waitForCompletedJuicySession,
} from '../../services/juicyScore';

export function JuicyScorePixel() {
  const params = useParams();
  const landing = (params?.landing as string) || 'home';

  useEffect(() => {
    // loadJuicyPixel es idempotente: StrictMode y los re-render por paso del
    // wizard no duplican el script (dos js.js = dos sesiones distintas).
    if (!loadJuicyPixel()) return;

    let cancelled = false;

    captureJuicySessionId(landing).then((sessionId) => {
      if (cancelled || !sessionId) return;
      // Segunda espera, sin bloquear: avisa cuándo hay data suficiente para un
      // scoring de calidad. El submit no la espera — si el usuario envía antes,
      // se scorea con lo que haya.
      void waitForCompletedJuicySession();
    });

    return () => {
      cancelled = true;
    };
  }, [landing]);

  return null;
}

export default JuicyScorePixel;
