'use client';

/**
 * KYC (pasos posteriores) — ruta dedicada `…/solicitar/kyc`.
 *
 * Se llega aquí tras el submit cuando la landing tiene la sección `kyc`
 * habilitada. Fase 2: orquesta los sub-pasos habilitados (`kycSteps`, ya
 * filtrados/ordenados por `useSolicitarFlow`) con UI real de captura/carga.
 * Si la landing NO habilita `kyc` (entrada por URL directa), redirige al
 * resumen, respetando el switch.
 *
 * La pantalla usa el mismo chrome que el resto del sitio (navbar + footer +
 * fondo `bg-neutral-50`, vía `useLayout`), igual que la confirmación — no un
 * fondo blanco pelado.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';
import type { KycStepType } from '@/app/prototipos/0.6/services/landingApi';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { NvidiaNavbar } from '@/app/prototipos/0.6/components/product-landing/nvidia/NvidiaNavbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { isNvidiaLanding } from '@/app/prototipos/0.6/utils/theme';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { getKycProgress, completeKycStep, type KycProgressState } from '@/app/prototipos/0.6/services/kycApi';
import { useKycTracker, type KycTrack } from './useKycTracker';
import { DniSelfieStep } from './steps/DniSelfieStep';
import { ContratoStep } from './steps/ContratoStep';
import { DocumentosStep } from './steps/DocumentosStep';
import { PausarModal } from './PausarModal';
import { KycLayout } from './KycLayout';

const STEP_LABELS: Record<KycStepType, string> = {
  dni_selfie: 'DNI + selfie',
  contract: 'Contrato',
  documents: 'Documentos',
};

/**
 * Persistencia del avance KYC (índice de sub-paso) por solicitud: si el usuario
 * refresca o vuelve, retoma en el sub-paso donde estaba en vez de reiniciar
 * desde la selfie. Solo se guarda el índice (las fotos son efímeras: si estaba
 * en DNI+selfie se re-capturan). Keyed por `application_code`. El acceso a
 * localStorage va protegido (falla en SSR / sandbox WebKit → se ignora).
 */
const kycStepKey = (landing: string, code: string) => `baldecash-${landing}-kyc-step-${code}`;

function readKycStep(landing: string, code?: string): number {
  if (!code) return 0;
  try {
    const raw = window.localStorage.getItem(kycStepKey(landing, code));
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeKycStep(landing: string, code: string | undefined, idx: number): void {
  if (!code) return;
  try {
    window.localStorage.setItem(kycStepKey(landing, code), String(idx));
  } catch {
    /* noop: localStorage no disponible */
  }
}

function clearKycStep(landing: string, code?: string): void {
  if (!code) return;
  try {
    window.localStorage.removeItem(kycStepKey(landing, code));
  } catch {
    /* noop */
  }
}

/**
 * DNI que el cliente ya dio en esta landing; es la prueba de titularidad del
 * flujo en sesión (el backend la exige porque los `application_code` son
 * secuenciales).
 *
 * Hay TRES formas de guardarlo según el tipo de landing, y hay que probarlas
 * todas: leer solo la primera dejaba sin DNI justamente a la única landing con
 * el feature prendido en producción (`copia-home`, de tipo `institutional`),
 * con tres consecuencias mudas — el botón de pausa nunca aparecía,
 * `step-complete` devolvía 422 `missing_proof` y, sin filas de progreso, el API
 * respondía `next_step_index: 0` y rebobinaba al cliente ya verificado.
 *
 * 1. `baldecash-{landing}-wizard-field-document_number` — prefill del form de
 *    leads (`saveLeadPrefill`, solo landings `lead`).
 * 2. `baldecash-wizard-{landing}-data` — blob del wizard estándar
 *    (`WizardContext`), con forma `{ campo: { value, touched, label } }`.
 * 3. `baldecash-dni-{landing}` — gate de DNI de las landings VIP (`DniModal`).
 */
function readWizardDni(landing: string): string | undefined {
  try {
    const prefill = window.localStorage.getItem(`baldecash-${landing}-wizard-field-document_number`);
    if (prefill) return prefill;

    const raw = window.localStorage.getItem(`baldecash-wizard-${landing}-data`);
    if (raw) {
      // `try` propio: si el blob está corrupto hay que seguir probando la
      // fuente 3, no abortar la búsqueda entera.
      try {
        // El blob guarda File[] como marcador y arrays para multi-select, así
        // que solo sirve si `document_number.value` es un string con contenido.
        const parsed = JSON.parse(raw) as Record<string, { value?: unknown }> | null;
        const value = parsed?.document_number?.value;
        if (typeof value === 'string' && value.trim() !== '') return value;
      } catch {
        /* blob corrupto: se ignora y se sigue con la fuente 3 */
      }
    }

    const dniGate = window.localStorage.getItem(`baldecash-dni-${landing}`);
    if (dniGate) return dniGate;

    return undefined;
  } catch {
    // localStorage no disponible (SSR / sandbox WebKit) o JSON corrupto.
    return undefined;
  }
}

interface RenderStepArgs {
  type: KycStepType;
  onDone: () => void;
  onBack?: () => void;
  applicationCode?: string;
  onTrack?: KycTrack;
  /** DNI ya conocido; solo lo consume `dni_selfie`, que lo contrasta con la foto. */
  documentNumber?: string;
  onDniVerified?: (dni: string) => void;
}

// Args por objeto y no posicionales: sumando `documentNumber`/`onDniVerified`
// la lista llegaba a siete parámetros, casi todos opcionales y varios del
// mismo tipo — un orden equivocado no lo habría cazado el compilador.
function renderStep({
  type, onDone, onBack, applicationCode, onTrack, documentNumber, onDniVerified,
}: RenderStepArgs) {
  switch (type) {
    case 'dni_selfie':
      return (
        <DniSelfieStep
          onDone={onDone}
          onBack={onBack}
          applicationCode={applicationCode}
          documentNumber={documentNumber}
          onDniVerified={onDniVerified}
          onTrack={onTrack}
        />
      );
    case 'contract':
      return <ContratoStep onDone={onDone} onBack={onBack} applicationCode={applicationCode} onTrack={onTrack} />;
    case 'documents':
      return <DocumentosStep onDone={onDone} onBack={onBack} applicationCode={applicationCode} onTrack={onTrack} />;
    default:
      return null;
  }
}

/**
 * Chrome compartido con el resto del sitio: navbar + footer + fondo neutro,
 * con el contenido KYC centrado entre ambos. Mientras el layout carga muestra
 * un spinner sobre el mismo fondo (sin flash blanco).
 */
function KycChrome({ children, landing: landingProp }: { children: React.ReactNode; landing?: string }) {
  const params = useParams();
  const landing = landingProp || (params.landing as string) || 'home';
  const {
    navbarProps,
    footerData,
    agreementData,
    isLoading: isLayoutLoading,
    hasError: hasLayoutError,
  } = useLayout();

  if (isLayoutLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <CubeGridSpinner />
      </div>
    );
  }

  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  return (
    <>
      <div className="min-h-screen bg-neutral-50 relative">
        {isNvidiaLanding(landing)
          ? <NvidiaNavbar landing={landing} />
          : <Navbar {...navbarProps} landing={landing} />}
        {/* Spacer — alto dinámico del navbar fijo. */}
        <div style={{ height: 'var(--header-total-height, 6.5rem)' }} />

        <main className="flex items-start justify-center px-4 pb-16 pt-2 min-h-[60vh]">
          {children}
        </main>
      </div>
      <Footer data={footerData} landing={landing} agreementData={agreementData} />
    </>
  );
}

function KycContent({ resumeToken, initialState, onTrack }: KycClientProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  // Prioridad al estado ya resuelto (ruta tokenizada /kyc/[token], Task 5):
  // esa ruta vive FUERA de `[landing]/**` (no tiene ese segmento en la URL),
  // así que `params.landing` viene vacío ahí — sin este fallback, `landing`
  // caía siempre a 'home' sin importar la landing real de la solicitud
  // (romperían kycSteps, navbar/footer, la URL de confirmación, etc.).
  const landing = initialState?.landing_slug || (params.landing as string) || 'home';
  // Prioridad al estado ya resuelto (ruta tokenizada /kyc/[token], Task 5):
  // esa ruta NO manda `?code=` a propósito (es justamente lo que oculta el
  // token), así que `code` no puede depender solo del query param.
  const code = initialState?.application_code ?? searchParams.get('code') ?? undefined;

  const { kycEnabled, kycSteps, isLoading } = useSolicitarFlow({ slug: landing });
  const [index, setIndex] = useState(0);
  // Estado de progreso completo (no solo el índice): necesario para leer
  // `resume.enabled`, que gobierna si el botón de pausa puede mostrarse.
  const [progressState, setProgressState] = useState<KycProgressState | undefined>(initialState);
  const [showPausarModal, setShowPausarModal] = useState(false);
  // `onTrack` (ruta tokenizada) o el tracker del contexto (flujo en sesión).
  const track = useKycTracker(onTrack);
  const startedTrackedRef = useRef(false);
  // Memoizado: se lee (y ahora se parsea JSON) en cada render y el DNI del
  // wizard no cambia mientras dura el KYC. Antes del early return porque es un
  // hook.
  const wizardDni = useMemo(() => readWizardDni(landing), [landing]);

  /**
   * DNI que el postulante tipeó en el modal de pausa y que el BACKEND aceptó
   * como prueba de titularidad.
   *
   * Existe porque el modal puede pedir el DNI cuando no está en `localStorage`
   * (postulante que llega al KYC sin el estado del wizard en ese navegador),
   * pero `step-complete` exige esa MISMA prueba en cada sub-paso. Sin
   * propagarlo, seguía avanzando contra un backend que respondía 422 y su
   * progreso no se guardaba — en silencio, porque la llamada es
   * fire-and-forget.
   *
   * Se persiste en la clave del prefill del wizard para que `readWizardDni` lo
   * encuentre si recarga la página. Es el propio documento del titular, ya
   * validado contra la solicitud, así que no agrega exposición.
   */
  const [verifiedDni, setVerifiedDni] = useState<string | undefined>();
  const effectiveDni = verifiedDni ?? wizardDni;

  const rememberVerifiedDni = (dni: string) => {
    setVerifiedDni(dni);
    try {
      window.localStorage.setItem(`baldecash-${landing}-wizard-field-document_number`, dni);
    } catch {
      /* localStorage puede fallar en WebKit sandboxeado; el estado alcanza */
    }
  };

  const goToConfirmacion = () =>
    router.replace(routes.solicitarConfirmacion(landing, code));

  // El avance vive en la BD: el `localStorage` no cruza dispositivos y el link
  // de WhatsApp abre en otro navegador. Solo se cae al valor local si el API
  // no responde, para no dejar al cliente sin flujo.
  //
  // Sin ref-guard síncrono: bajo StrictMode (mount→cleanup→mount en dev) un
  // guard como `restoredRef.current = true` antes del fetch async bloquea el
  // segundo montaje sin relanzar el fetch, y el original ya llegó cancelado
  // — la restauración nunca se aplica en dev. Un refetch idempotente al
  // remontar no hace daño; el único guard necesario es el flag de
  // cancelación del cleanup.
  useEffect(() => {
    if (!code) return;

    if (initialState) {                       // vino de /kyc/[token]
      setIndex(initialState.next_step_index ?? 0);
      return;
    }

    let cancelled = false;
    void (async () => {
      const remote = await getKycProgress(code);
      if (cancelled) return;
      if (remote) setProgressState(remote); // resume.enabled vive acá, no en el índice

      // Se toma el MÁXIMO entre remoto y local, no el remoto a secas:
      // `completeKycStep` es fire-and-forget por diseño, así que un POST caído
      // (offline, 429, `ownership_locked`) deja el remoto atrás del local. Con
      // aplicación incondicional, el siguiente montaje rebobinaba al cliente y
      // además pisaba la caché con el valor viejo (perdiendo el avance para
      // siempre). El API sigue ganando al cruzar de dispositivo, que es donde
      // el local vale 0.
      const stored = readKycStep(landing, code);
      if (remote && remote.next_step_index != null) {
        const idx = Math.max(remote.next_step_index, stored);
        setIndex(idx);
        writeKycStep(landing, code, idx); // refresca la caché
      } else if (stored > 0) {
        setIndex(stored);                 // fallback: el API no respondió
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gate: landing sin `kyc` habilitado (o sin sub-pasos habilitados) → saltar
  // directo al resumen. `kycEnabled` viene de `useSolicitarFlow` (fail-safe:
  // sección ausente ⇒ false), así que una entrada por URL directa a una
  // landing sin `kyc` nunca queda varada aquí.
  useEffect(() => {
    if (isLoading) return;
    if (!kycEnabled || kycSteps.length === 0) {
      goToConfirmacion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, kycEnabled, kycSteps.length]);

  // Track kyc_started once, cuando el flujo KYC está habilitado y tiene pasos.
  useEffect(() => {
    if (isLoading || !kycEnabled || kycSteps.length === 0) return;
    if (startedTrackedRef.current) return;
    startedTrackedRef.current = true;
    track('kyc_started', { steps: kycSteps.map((s) => s.type), application_code: code });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, kycEnabled, kycSteps]);

  if (isLoading || !kycEnabled || kycSteps.length === 0) {
    return (
      <KycChrome landing={landing}>
        <div className="flex items-center justify-center py-20">
          <CubeGridSpinner />
        </div>
      </KycChrome>
    );
  }

  // Clamp defensivo por si `kycSteps` cambiara de tamaño en caliente.
  const safeIndex = Math.min(index, kycSteps.length - 1);
  const currentStep = kycSteps[safeIndex];

  const goNext = () => {
    track('kyc_step_complete', {
      step: currentStep.type, index: safeIndex, application_code: code,
    });

    // Fire-and-forget: la UI no espera al backend. Si falla, el localStorage
    // sostiene el flujo en este dispositivo y el próximo montaje reconcilia.
    //
    // Sin prueba de titularidad el backend responde 422 `missing_proof` y el
    // avance NO se persiste. Como esto no bloquea la UI, el fallo sería mudo:
    // el postulante avanzaría en pantalla y su link de reanudación lo traería
    // de vuelta al paso 1. Por eso se emite un evento cuando no se pudo
    // guardar, para que quede rastro en vez de perderse.
    if (code) {
      // Se usa el tipo `error`, que YA está en el catálogo del backend. Un
      // tipo inventado se descartaría en silencio (`is_valid_event`), que es
      // justo el modo de falla que este evento viene a hacer visible.
      const proofDni = resumeToken ? undefined : effectiveDni;
      if (!resumeToken && !proofDni) {
        track('error', {
          scope: 'kyc_step_persist', reason: 'no_proof',
          step: currentStep.type, index: safeIndex, application_code: code,
        });
      } else {
        void completeKycStep({
          applicationCode: code,
          stepType: currentStep.type,
          resumeToken,                        // flujo por link
          documentNumber: proofDni,           // en sesión
        }).then((state) => {
          if (!state) {
            track('error', {
              scope: 'kyc_step_persist', reason: 'request_failed',
              step: currentStep.type, index: safeIndex, application_code: code,
            });
          }
        });
      }
    }

    if (safeIndex + 1 < kycSteps.length) {
      const next = safeIndex + 1;
      setIndex(next);
      writeKycStep(landing, code, next); // persistir avance (refresh/volver)
    } else {
      track('kyc_completed', { application_code: code });
      clearKycStep(landing, code); // KYC completo → limpiar sesión guardada
      goToConfirmacion();
    }
  };
  const goBack =
    safeIndex > 0
      ? () => {
          const prev = safeIndex - 1;
          setIndex(prev);
          writeKycStep(landing, code, prev);
        }
      : undefined;

  // El botón solo se ofrece si de verdad puede funcionar:
  // - `resume.enabled` en el estado del API (la landing tiene la pausa habilitada)
  // - hay `code` (application_code efectivo)
  // - NO hay `resumeToken`: quien ya entró por el link no necesita pedir otro
  //
  // YA NO se exige DNI en localStorage: esa condición dejaba sin botón a
  // CUALQUIER solicitante que llegara a KYC sin el estado del wizard en ESE
  // mismo navegador (ej. abrir el link en otro dispositivo/navegador, o con
  // localStorage limpio) — no era un edge case, era la mayoría silenciosa.
  // El backend ya valida el DNI contra la solicitud (con lockout + auditoría),
  // así que ahora se le pide al usuario en el propio modal (`PausarModal`)
  // cuando no hay uno disponible localmente.
  const canPause = Boolean(progressState?.resume?.enabled && code && !resumeToken);

  const handlePauseClick = () => {
    track('kyc_pause_click', { application_code: code });
    setShowPausarModal(true);
  };

  return (
    <KycChrome landing={landing}>
      <KycLayout>
        {/*
          Mobile: la card angosta de siempre (rounded-2xl + border + shadow).
          Desktop (`md:`): se quita ese chrome de card — el panel blanco de
          `KycLayout` ya lo provee, con más padding y sin el ancho limitado a
          `max-w-md`, para que la cámara y las previews de DniSelfieStep
          respiren en vez de verse apretadas.
        */}
        <div className="w-full space-y-6 rounded-2xl bg-white border border-neutral-200 shadow-sm px-5 py-6 sm:px-6 sm:py-7 md:rounded-none md:border-0 md:shadow-none md:px-10 md:py-10 lg:px-12 lg:py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] text-center md:text-left">
            Paso {safeIndex + 1} de {kycSteps.length} · {STEP_LABELS[currentStep.type]}
          </p>

          {renderStep({
            type: currentStep.type,
            onDone: goNext,
            onBack: goBack,
            applicationCode: code,
            onTrack,
            documentNumber: effectiveDni,
            onDniVerified: rememberVerifiedDni,
          })}

          {canPause && code && (
            <div className="pt-1 text-center md:text-left">
              {/*
                El tooltip explica qué hace el enlace ANTES de abrir el modal.
                "Continuar en otro momento" no dice si se pierde el avance ni
                cómo se vuelve, y esa duda es justo la que frena a alguien que
                no puede terminar ahora.
              */}
              <button
                type="button"
                onClick={handlePauseClick}
                title={`Te enviamos por WhatsApp un enlace para retomar donde quedaste. Vence en ${
                  progressState?.resume?.ttl_hours ?? 72
                } horas.`}
                className="group relative text-sm font-semibold text-[#4654CD] hover:underline cursor-pointer"
              >
                Continuar en otro momento
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-lg bg-[#1f2937] px-3 py-2 text-xs font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  Te enviamos por WhatsApp un enlace para retomar donde quedaste.
                  Vence en {progressState?.resume?.ttl_hours ?? 72} horas.
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1f2937]"
                  />
                </span>
              </button>
              <PausarModal
                open={showPausarModal}
                onClose={() => setShowPausarModal(false)}
                applicationCode={code}
                documentNumber={effectiveDni}
                landing={landing}
                onSent={rememberVerifiedDni}
              />
            </div>
          )}
        </div>
      </KycLayout>
    </KycChrome>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export interface KycClientProps {
  /** Presente solo cuando se entra por /kyc/[token]. */
  resumeToken?: string;
  /** Estado ya resuelto por la ruta tokenizada; evita un fetch redundante. */
  initialState?: KycProgressState;
  /**
   * Emisor de eventos alternativo. Lo usa la ruta tokenizada `/kyc/[token]`,
   * que vive fuera de `EventTrackerProvider`: sin esto, ninguno de los eventos
   * `kyc_*` (ni los del orquestador ni los de los sub-pasos) se emitía en el
   * camino de reanudación. Ausente ⇒ comportamiento idéntico al de siempre
   * (tracker del contexto).
   */
  onTrack?: KycTrack;
}

export default function KycClient(props: KycClientProps = {}) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KycContent {...props} />
    </Suspense>
  );
}
