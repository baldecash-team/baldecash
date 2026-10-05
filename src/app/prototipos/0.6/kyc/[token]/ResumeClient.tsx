'use client';

/**
 * ResumeClient — ruta `/kyc/[token]` ("Continuar después").
 *
 * Es la URL que abre el link de WhatsApp enviado por `PausarModal` (Task 4):
 * exactamente `{FRONTEND_URL}/kyc/{token}`, la misma que arma
 * `SecureLinkService.build_url` en el backend. A propósito NO manda `?code=`
 * — el `application_code` nunca viaja en la URL (son secuenciales, así que
 * una URL adivinable expondría solicitudes ajenas); el token es la única
 * prueba de titularidad de este flujo.
 *
 * Canjea el token contra `resumeKyc` y ramifica en 5 caminos:
 * - Estado válido, `is_complete:false`, `kyc_enabled:true` → monta el mismo
 *   orquestador `KycClient` que usa el flujo en sesión (`resumeToken` +
 *   `initialState`, ver Task 3), en el sub-paso pendiente.
 * - `is_complete:true` o `kyc_enabled:false` → redirige a la confirmación de
 *   esa landing (ya no hay nada que hacer acá).
 * - `reason` de enlace vencido/revocado/consumido/inactivo → pantalla
 *   "Este enlace venció" con una guía para pedir uno nuevo.
 * - `reason` inválido/purpose_mismatch → "Este enlace no es válido", con el
 *   MISMO copy para ambos (no revela si la solicitud existe).
 * - `reason:'network'` → pantalla de reintento.
 *
 * `KycClient` vive físicamente bajo `[landing]/solicitar/kyc/` y su chrome
 * (`KycChrome`) depende de `useLayout()` (`LayoutContext`), que solo se monta
 * dentro de `[landing]/layout.tsx`. Esta ruta es un segmento ESTÁTICO hermano
 * de `[landing]` (no un hijo), así que no hereda ese provider — por eso lo
 * montamos acá mismo, forzando el landing real vía `landingOverride` (el
 * único slug disponible es el que devuelve el propio `resumeKyc`, no hay
 * `[landing]` en la URL). `PreviewContext` sí llega gratis: lo monta
 * `prototipos/0.6/layout.tsx`, que es ancestro de toda `/prototipos/0.6/**`
 * incluida esta ruta.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { saveVipToken } from '@/app/prototipos/0.6/components/hero/DniModal';
import { resumeKyc, isKycApiError, type KycProgressState } from '@/app/prototipos/0.6/services/kycApi';
import { LayoutProvider } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import KycClient from '@/app/prototipos/0.6/[landing]/solicitar/kyc/kycClient';
import { resumeEvents } from './resumeEvents';

/** Enlace muerto pero conocido: existió, ya no sirve. Ofrece un camino para pedir uno nuevo. */
const EXPIRED_REASONS = new Set(['expired', 'revoked', 'consumed', 'inactive']);
// `invalid` | `purpose_mismatch` (y cualquier reason no reconocido) caen al
// mismo branch "invalid" por default más abajo — a propósito no se listan
// en un Set aparte: distinguirlos en el copy delataría si la solicitud
// existe, así que ambos (y cualquier otro código de error futuro) reciben
// EXACTAMENTE el mismo trato silencioso.

type ViewState =
  | { status: 'loading' }
  | { status: 'ready'; state: KycProgressState }
  | { status: 'expired' }
  | { status: 'invalid' }
  | { status: 'network' };

export interface ResumeClientProps {
  token: string;
}

export function ResumeClient({ token }: ResumeClientProps) {
  const router = useRouter();
  const [view, setView] = useState<ViewState>({ status: 'loading' });
  // Estable entre renders (no entre remounts) — evita reconstruir el emisor
  // en cada render sin depender de useMemo (cuyas garantías de estabilidad
  // React no promete entre versiones).
  const eventsRef = useRef<ReturnType<typeof resumeEvents> | null>(null);
  if (!eventsRef.current) eventsRef.current = resumeEvents(token);
  const events = eventsRef.current;

  // Sin ref-guard síncrono delante del fetch: bajo StrictMode
  // (mount→cleanup→mount en dev) un guard como `handled.current = true` antes
  // del await bloquearía el segundo montaje sin relanzar el canje, y el
  // primero ya llega cancelado — el mismo bug que Task 3 encontró y arregló
  // en kycClient.tsx. El único guard necesario es `cancelled` en el cleanup;
  // `resumeKyc` es una lectura (no consume el token), así que un segundo
  // canje idéntico bajo StrictMode no tiene efecto adverso.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await resumeKyc(token);
      if (cancelled) return;

      if (isKycApiError(result)) {
        if (result.reason === 'network') {
          setView({ status: 'network' });
          return;
        }
        if (EXPIRED_REASONS.has(result.reason)) {
          events.track('kyc_resume_link_expired', { reason: result.reason });
          setView({ status: 'expired' });
          return;
        }
        // invalid | purpose_mismatch | cualquier reason no reconocido:
        // mismo trato — nunca revelar si la solicitud existe.
        setView({ status: 'invalid' });
        return;
      }

      events.track('kyc_resume_link_opened', { application_code: result.application_code });

      // Sin `landing_slug` no hay a dónde llevarlo: el fallback a 'home' que
      // había acá aterrizaba al cliente en la confirmación de OTRA landing (y
      // `useSolicitarFlow('home')` reporta el KYC apagado, así que el redirect
      // era seguro). Mejor decir que el enlace no sirve que mandarlo a un
      // flujo ajeno.
      const landingSlug = result.landing_slug;
      if (!landingSlug) {
        setView({ status: 'invalid' });
        return;
      }

      // El link se abre desde otro equipo: el acceso a la landing no está en
      // este navegador. El token que devuelve `resume` lo concede — está atado
      // al mismo DNI y vence con el link. Se guarda antes de ramificar porque
      // la confirmación también vive dentro de la landing con gate.
      if (result.landing_access_token) {
        saveVipToken(landingSlug, result.landing_access_token);
      }

      // El KYC ya se completó, o la landing apagó los sub-pasos desde que se
      // envió el link: no hay nada que retomar, seguir directo a confirmación.
      if (result.is_complete || !result.kyc_enabled) {
        router.replace(routes.solicitarConfirmacion(landingSlug, result.application_code));
        return;
      }

      events.track('kyc_resumed', { application_code: result.application_code });
      setView({ status: 'ready', state: result });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (view.status === 'ready') {
    return (
      <LayoutProvider landingOverride={view.state.landing_slug ?? undefined}>
        {/* `onTrack`: esta ruta está fuera de EventTrackerProvider, así que sin
            este sink KycClient y sus sub-pasos no emitirían NINGÚN evento
            kyc_*. El `session_id` sigue siendo el token del link. */}
        <KycClient resumeToken={token} initialState={view.state} onTrack={events.trackKyc} />
      </LayoutProvider>
    );
  }

  if (view.status === 'expired') {
    return (
      <NotFoundContent
        homeUrl={routes.home()}
        homeLabel="Ir al inicio"
        title="Este enlace venció"
        description="Este enlace de continuación ya no es válido. Vuelve al inicio de tu solicitud e ingresa tu DNI para pedir un enlace nuevo."
      />
    );
  }

  if (view.status === 'invalid') {
    return (
      <NotFoundContent
        homeUrl={routes.home()}
        homeLabel="Ir al inicio"
        title="Este enlace no es válido"
        description="No pudimos verificar este enlace. Si crees que es un error, vuelve al inicio e intenta nuevamente."
      />
    );
  }

  // El copy nombra el botón que existe de verdad ("Recargar página", el
  // secundario de NotFoundContent): antes pedía recargar mientras el botón
  // principal decía "Ir al inicio", que hace lo contrario.
  if (view.status === 'network') {
    return (
      <NotFoundContent
        homeUrl={routes.home()}
        homeLabel="Ir al inicio"
        title="No pudimos conectar"
        description="Hubo un problema de conexión al abrir tu enlace. Toca «Recargar página» para intentarlo de nuevo."
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export default ResumeClient;
