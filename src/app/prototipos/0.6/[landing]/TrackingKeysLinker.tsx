'use client';

/**
 * Ata la visita a la persona que la trajo (F2 de campañas).
 *
 * 1. Lee las llaves del URL (`rid`, `vip_auto`, `alk`…) en el RENDER, antes que
 *    cualquier efecto: la redirección de `vip_auto` de la portada o la limpieza
 *    del overlay de locker-truck corren en efectos y ya no pueden perderlas.
 * 2. Borra el `rid` del URL apenas se leyó (R9).
 * 3. Cuando la sesión de tracking existe, manda las llaves activas (las dice el
 *    config de la landing) en un solo pedido a `link-token-session`. La respuesta
 *    no trae datos de la persona (R1): lo que se sabe queda en la visita, en el
 *    backend.
 *
 * Va dentro de `SessionProvider` y antes de `VipGate`. No pinta nada.
 */
import { useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useSessionOptional } from './solicitar/context/SessionContext';
import { fetchLandingConfig } from '../services/landingConfigApi';
import {
  capturarLlavesDelUrl,
  elegirLlaves,
  leerLlavesPendientes,
  limpiarLlavesPendientes,
  llavesActivas,
  quitarLlavesDelUrl,
} from '../utils/trackingKeys';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export function TrackingKeysLinker({ landing }: { landing: string }) {
  const session = useSessionOptional();
  const enviadoRef = useRef(false);

  // 1. En el render inicial, con el URL intacto.
  useState(() => {
    if (typeof window !== 'undefined') capturarLlavesDelUrl(landing, window.location.search);
    return null;
  });

  // 2. R9: el `rid` fuera del URL apenas se leyó.
  useEffect(() => {
    quitarLlavesDelUrl(['rid']);
  }, []);

  // 3. Atar la visita cuando hay sesión.
  useEffect(() => {
    const uuid = session?.sessionUuid;
    if (!uuid || enviadoRef.current) return;
    const pendientes = leerLlavesPendientes(landing);
    if (!Object.keys(pendientes).length) return;
    enviadoRef.current = true;

    fetchLandingConfig(landing)
      .then((config) => {
        const activas = llavesActivas(config);
        quitarLlavesDelUrl(activas);
        const keys = elegirLlaves(pendientes, activas);
        if (!Object.keys(keys).length) {
          limpiarLlavesPendientes(landing);
          return undefined;
        }
        return fetch(`${API_BASE_URL}/public/landing/${encodeURIComponent(landing)}/link-token-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keys, session_uuid: uuid }),
        }).then((respuesta) => {
          // Si el backend no contestó bien, las llaves quedan guardadas y se
          // reintenta en la próxima página.
          if (respuesta.ok) limpiarLlavesPendientes(landing);
        });
      })
      .catch((error) => {
        enviadoRef.current = false;
        Sentry.captureException(error, { tags: { modulo: 'tracking_keys' }, extra: { landing } });
      });
  }, [landing, session?.sessionUuid]);

  return null;
}
