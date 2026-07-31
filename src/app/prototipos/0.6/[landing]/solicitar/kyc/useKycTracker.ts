'use client';

/**
 * Sink de eventos del KYC, con dos orígenes posibles.
 *
 * El flujo en sesión (`[landing]/solicitar/kyc`) vive dentro de
 * `EventTrackerProvider` y emite por el contexto. La ruta tokenizada
 * (`/kyc/[token]`) NO hereda ese provider — es un segmento estático hermano de
 * `[landing]`, no un hijo — así que `useEventTrackerOptional()` devuelve null
 * ahí y TODOS los eventos `kyc_*` del orquestador y de los sub-pasos se
 * perdían en silencio: justo el recorrido que este feature necesita medir.
 *
 * Con este hook, quien monta el KYC puede inyectar su propio emisor (`onTrack`,
 * ver `resumeEvents.trackKyc`, que usa el TOKEN del link como `session_id` —
 * igual que el flujo de admisión — para que el backend agrupe todo el recorrido
 * del enlace). Sin `onTrack`, el comportamiento es exactamente el de siempre.
 */

import { useCallback } from 'react';
import type { EventType } from '@/app/prototipos/0.6/services/eventsApi';
import { useEventTrackerOptional } from '../context/EventTrackerContext';

/** Firma del emisor de eventos KYC (compatible con `tracker.track`). */
export type KycTrack = (type: EventType, props?: Record<string, unknown>) => void;

/**
 * Devuelve el emisor a usar: `onTrack` cuando el caller inyecta uno (ruta
 * tokenizada), y si no el tracker del contexto (flujo en sesión). Nunca lanza:
 * fuera del provider y sin `onTrack` los eventos simplemente no se emiten.
 */
export function useKycTracker(onTrack?: KycTrack): KycTrack {
  const tracker = useEventTrackerOptional();
  return useCallback(
    (type: EventType, props?: Record<string, unknown>) => {
      if (onTrack) {
        onTrack(type, props);
        return;
      }
      tracker?.track(type, props);
    },
    [onTrack, tracker],
  );
}
