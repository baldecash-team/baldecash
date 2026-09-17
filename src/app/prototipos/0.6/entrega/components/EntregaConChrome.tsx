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
 * 1. `landing_slug` del canje del token (`GET /public/entrega/{token}`) —
 *    en producción (ws2#1764).
 * 2. El primer segmento de `volver` (ej. `/renueva-tu-equipo-1-a/solicitar` →
 *    `renueva-tu-equipo-1-a`): es la landing desde la que vino el KYC que
 *    manda para acá, así que sirve de proxy salvo que el backend diga otra
 *    cosa. Se valida con una regex de slug Y contra los segmentos ESTÁTICOS
 *    hermanos de `[landing]` (ver `SEGMENTOS_RESERVADOS`): sin este segundo
 *    filtro, un `volver` con `BASE_PATH` puesto (`/prototipos/0.6/...`, el
 *    default de dev sin rewrites) resolvía `landingOverride="prototipos"` —
 *    landing inexistente, 404 para TODO el que llega desde el wizard.
 *
 * Sin ninguna de las dos —el enlace de WhatsApp, que abre `/entrega/<token>`
 * sin `volver`— se mantiene el layout de siempre (`EntregaLayout`): panel de
 * marca standalone, sin navbar/footer de ninguna landing. Es el único camino
 * que este trabajo no puede regresionar.
 *
 * `volver` se conoce en el primer render (viene del query string), así que si
 * trae una landing válida el chrome se monta DE UNA — nunca se pinta
 * `EntregaLayout` para reemplazarlo un instante después por el chrome. Sin
 * `volver` (o con un slug que no valida) hay que esperar el canje del token:
 * mientras tanto se muestra un fondo neutro, no el panel de marca — ese fondo
 * neutro nunca se reemplaza por OTRO layout que no sea el elegido al
 * resolver, así que tampoco hay flash.
 *
 * Ese canje (cuando hace falta) se hace UNA sola vez acá y su resultado se le
 * pasa a `EntregaTokenClient` como `initialData`: antes ese componente volvía
 * a pedir el mismo token, duplicando el round trip (y el viaje de error) en
 * TODO el camino sin `volver`.
 */

import { useEffect, useState } from 'react';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import { LayoutProvider } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { KycChrome } from '@/app/prototipos/0.6/[landing]/solicitar/kyc/KycChrome';
import {
  getEntrega,
  isEntregaApiError,
  type EntregaApiError,
  type EntregaDatos,
} from '@/app/prototipos/0.6/services/entregaApi';
import { BASE_PATH } from '@/app/prototipos/0.6/utils/routes';
import { EntregaLayout } from './EntregaLayout';
import { EntregaTokenClient } from './EntregaTokenClient';

/** Slug de landing: minúsculas, dígitos y guiones. Nada de `/`, query ni mayúsculas. */
const SLUG_RE = /^[a-z0-9-]+$/;

/**
 * Segmentos ESTÁTICOS hermanos de `[landing]` bajo `src/app/prototipos/0.6/`
 * (los que son rutas de verdad, no carpetas de código) — ninguno es un slug
 * de landing válido. `prototipos` se suma aparte: es el segmento que queda
 * primero si `BASE_PATH` no se pudo despojar de `volver` (ver `slugDesdeVolver`).
 */
const SEGMENTOS_RESERVADOS = new Set([
  'prototipos',
  'admision',
  'eleccion-equipo',
  'encuesta',
  'entrega',
  'formulario',
  'kyc',
  'oferta',
  'preview',
  'preview-wizard',
  'quiz',
  'referido',
  'validacion-laboral',
  'validar-correo',
  'videollamada',
]);

/**
 * `/renueva-tu-equipo-1-a/solicitar` → `renueva-tu-equipo-1-a`. `undefined`
 * si no valida.
 *
 * `volver` sale de `routes.*` (ej. `routes.solicitarConfirmacion`), que
 * antepone `BASE_PATH` — `/prototipos/0.6` en dev sin rewrites, `''` en
 * producción detrás del rewrite de middleware (`?volver=%2Frenueva-tu-equipo-1-a%2Fsolicitar`
 * verificado en prod, sin el prefijo). Sin despojarlo, el primer segmento en
 * dev era literalmente "prototipos" — de ahí el segundo filtro
 * (`SEGMENTOS_RESERVADOS`) además de la regex: cubre tanto ese caso como
 * cualquier otro segmento estático que por lo que sea llegue acá.
 *
 * `basePath` es parámetro (no `BASE_PATH` directo) para poder probar los dos
 * mundos (con y sin prefijo) sin depender de `process.env` ni de
 * `jest.resetModules`.
 */
export function slugDesdeVolver(volver?: string, basePath: string = BASE_PATH): string | undefined {
  if (!volver) return undefined;
  const sinBase = basePath && volver.startsWith(basePath) ? volver.slice(basePath.length) : volver;
  const [primero] = sinBase.replace(/^\/+/, '').split(/[/?#]/);
  if (!primero || !SLUG_RE.test(primero) || SEGMENTOS_RESERVADOS.has(primero)) return undefined;
  return primero;
}

export interface EntregaConChromeProps {
  token: string;
  volver?: string;
  /** A dónde vuelve "← Volver al contrato" (gate G1). Ver `EntregaTokenClient`. */
  atras?: string;
}

export function EntregaConChrome({ token, volver, atras }: EntregaConChromeProps) {
  // Se calcula una sola vez, en el primer render: es la landing de la que
  // vino el KYC y no cambia durante la vida de este componente.
  const [volverSlug] = useState(() => slugDesdeVolver(volver));
  // El canje completo (no solo el slug): se reusa tal cual como `initialData`
  // de `EntregaTokenClient` para no repetir el GET. `null` mientras no hace
  // falta pedirlo (con `volverSlug`) o todavía no resolvió.
  const [resultado, setResultado] = useState<EntregaDatos | EntregaApiError | null>(null);
  // Con `volverSlug` ya no hay nada que esperar — se arranca "resuelto".
  const [cargado, setCargado] = useState<boolean>(Boolean(volverSlug));

  // Solo corre sin `volverSlug`: es el único caso donde `landing_slug` del
  // canje puede cambiar la decisión. Es la ÚNICA lectura del token por carga
  // en ese camino — su resultado baja a `EntregaTokenClient` como
  // `initialData`, así que ese componente no vuelve a pedirlo.
  useEffect(() => {
    if (volverSlug) return;
    let cancelled = false;
    void (async () => {
      const respuesta = await getEntrega(token);
      if (cancelled) return;
      setResultado(respuesta);
      setCargado(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!cargado) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <CubeGridSpinner />
      </div>
    );
  }

  const apiSlug = !volverSlug && resultado && !isEntregaApiError(resultado)
    && resultado.landing_slug && SLUG_RE.test(resultado.landing_slug)
    ? resultado.landing_slug
    : undefined;
  const slug = volverSlug ?? apiSlug;
  // Con `volverSlug` no se canjeó nada acá (el `if` de arriba ni corrió):
  // `EntregaTokenClient` hace su propio canje, como siempre. Sin `volverSlug`,
  // `resultado` YA tiene la respuesta completa (dato o error) y se la
  // pasamos tal cual.
  const initialData = volverSlug ? undefined : (resultado ?? undefined);

  if (slug) {
    return (
      <LayoutProvider landingOverride={slug}>
        <KycChrome landing={slug}>
          <EntregaTokenClient token={token} volver={volver} atras={atras} initialData={initialData} />
        </KycChrome>
      </LayoutProvider>
    );
  }

  // Ni `volver` trajo landing ni el canje la trajo: enlace de WhatsApp sin
  // contexto de landing. Layout de siempre, sin cambios.
  return (
    <EntregaLayout>
      <EntregaTokenClient token={token} volver={volver} atras={atras} initialData={initialData} />
    </EntregaLayout>
  );
}
