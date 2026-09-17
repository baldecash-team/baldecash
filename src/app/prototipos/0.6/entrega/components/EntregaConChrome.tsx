'use client';

/**
 * Selecciona el chrome de la ruta `/entrega/[token]` según si se puede
 * resolver la landing del flujo.
 *
 * Hasta ahora esta ruta rendía siempre standalone (`EntregaLayout`: panel de
 * marca + formulario, sin navbar/footer). Pero se llega acá desde el cierre
 * del KYC —parte del wizard de una landing concreta—, y el resto de esos
 * pasos (ej. `…/solicitar/resumen`, donde se firma el contrato) sí usa el
 * chrome del sitio. Este componente empareja `entrega` con ese resto.
 *
 * `entrega` es un segmento ESTÁTICO hermano de `[landing]` (no un hijo), así
 * que no hereda `LayoutContext` (solo lo monta `[landing]/layout.tsx`) —
 * mismo problema que resolvió `ResumeClient` para `/kyc/[token]`, y misma
 * solución: montar `LayoutProvider` acá con `landingOverride` y reusar
 * `KycChrome` (navbar + footer del sitio), en vez de copiar ese chrome.
 *
 * La landing sale de dos fuentes, en este orden de prioridad:
 * 1. `landing_slug` del canje del token (`GET /public/entrega/{token}`) — el
 *    backend todavía NO lo manda (lo está agregando otro trabajo en
 *    paralelo), así que hoy esta fuente nunca dispara; queda cableada para
 *    cuando exista, sin que este componente necesite otro cambio.
 * 2. El primer segmento de `volver` (ej. `/renueva-tu-equipo-1-a/solicitar` →
 *    `renueva-tu-equipo-1-a`): es la landing desde la que vino el KYC que
 *    manda para acá, así que sirve de proxy salvo que el backend diga otra
 *    cosa. Se valida con una regex de slug para no colar un path raro.
 *
 * Sin ninguna de las dos —el enlace de WhatsApp, que abre `/entrega/<token>`
 * sin `volver`— se mantiene el layout de siempre (`EntregaLayout`): panel de
 * marca standalone, sin navbar/footer de ninguna landing. Es el único camino
 * que este trabajo no puede regresionar.
 *
 * `volver` se conoce en el primer render (viene del query string), así que si
 * trae una landing válida el chrome se monta DE UNA — nunca se pinta
 * `EntregaLayout` para reemplazarlo un instante después por el chrome. Sin
 * `volver` (o con un slug que no valida) hay que esperar el canje del token
 * por si el backend ya manda `landing_slug`: mientras tanto se muestra un
 * fondo neutro, no el panel de marca — ese fondo neutro nunca se reemplaza por
 * OTRO layout que no sea el elegido al resolver, así que tampoco hay flash.
 */

import { useEffect, useState } from 'react';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import { LayoutProvider } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { KycChrome } from '@/app/prototipos/0.6/[landing]/solicitar/kyc/KycChrome';
import { getEntrega, isEntregaApiError } from '@/app/prototipos/0.6/services/entregaApi';
import { EntregaLayout } from './EntregaLayout';
import { EntregaTokenClient } from './EntregaTokenClient';

/** Slug de landing: minúsculas, dígitos y guiones. Nada de `/`, query ni mayúsculas. */
const SLUG_RE = /^[a-z0-9-]+$/;

/** `/renueva-tu-equipo-1-a/solicitar` → `renueva-tu-equipo-1-a`. `undefined` si no valida. */
function slugDesdeVolver(volver?: string): string | undefined {
  if (!volver) return undefined;
  const [primero] = volver.replace(/^\/+/, '').split('/');
  return primero && SLUG_RE.test(primero) ? primero : undefined;
}

export interface EntregaConChromeProps {
  token: string;
  volver?: string;
}

export function EntregaConChrome({ token, volver }: EntregaConChromeProps) {
  // Se calcula una sola vez, en el primer render: es la landing de la que
  // vino el KYC y no cambia durante la vida de este componente.
  const [volverSlug] = useState(() => slugDesdeVolver(volver));
  // Con `volverSlug` ya no hay nada que esperar — se arranca "resuelto".
  const [apiCheck, setApiCheck] = useState<'pendiente' | 'resuelto'>(
    volverSlug ? 'resuelto' : 'pendiente',
  );
  const [apiSlug, setApiSlug] = useState<string | undefined>(undefined);

  // Solo corre sin `volverSlug`: es el único caso donde `landing_slug` del
  // canje puede cambiar la decisión. Es una lectura (no consume el token),
  // igual que `resumeKyc` en `ResumeClient` — un segundo canje idéntico desde
  // `EntregaTokenClient` más abajo no tiene efecto adverso.
  useEffect(() => {
    if (volverSlug) return;
    let cancelled = false;
    void (async () => {
      const respuesta = await getEntrega(token);
      if (cancelled) return;
      if (!isEntregaApiError(respuesta) && respuesta.landing_slug && SLUG_RE.test(respuesta.landing_slug)) {
        setApiSlug(respuesta.landing_slug);
      }
      setApiCheck('resuelto');
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (apiCheck === 'pendiente') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <CubeGridSpinner />
      </div>
    );
  }

  const slug = volverSlug ?? apiSlug;

  if (slug) {
    return (
      <LayoutProvider landingOverride={slug}>
        <KycChrome landing={slug}>
          <EntregaTokenClient token={token} volver={volver} />
        </KycChrome>
      </LayoutProvider>
    );
  }

  // Ni `volver` trajo landing ni el canje la trajo: enlace de WhatsApp sin
  // contexto de landing. Layout de siempre, sin cambios.
  return (
    <EntregaLayout>
      <EntregaTokenClient token={token} volver={volver} />
    </EntregaLayout>
  );
}

export default EntregaConChrome;
