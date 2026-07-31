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

import { Suspense, useEffect, useRef, useState } from 'react';
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
import { useEventTrackerOptional } from '../context/EventTrackerContext';
import { DniSelfieStep } from './steps/DniSelfieStep';
import { ContratoStep } from './steps/ContratoStep';
import { DocumentosStep } from './steps/DocumentosStep';
import { PausarModal } from './PausarModal';

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

/** DNI que el cliente tipeó en el wizard; es la prueba de titularidad en sesión. */
function readWizardDni(landing: string): string | undefined {
  try {
    return window.localStorage.getItem(`baldecash-${landing}-wizard-field-document_number`) ?? undefined;
  } catch {
    return undefined;
  }
}

function renderStep(type: KycStepType, onDone: () => void, onBack?: () => void, applicationCode?: string) {
  switch (type) {
    case 'dni_selfie':
      return <DniSelfieStep onDone={onDone} onBack={onBack} applicationCode={applicationCode} />;
    case 'contract':
      return <ContratoStep onDone={onDone} onBack={onBack} applicationCode={applicationCode} />;
    case 'documents':
      return <DocumentosStep onDone={onDone} onBack={onBack} applicationCode={applicationCode} />;
    default:
      return null;
  }
}

/**
 * Chrome compartido con el resto del sitio: navbar + footer + fondo neutro,
 * con el contenido KYC centrado entre ambos. Mientras el layout carga muestra
 * un spinner sobre el mismo fondo (sin flash blanco).
 */
function KycChrome({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';
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

function KycContent({ resumeToken, initialState }: KycClientProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const landing = (params.landing as string) || 'home';
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
  const tracker = useEventTrackerOptional();
  const startedTrackedRef = useRef(false);

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
      if (remote && remote.next_step_index != null) {
        setIndex(remote.next_step_index);
        writeKycStep(landing, code, remote.next_step_index); // refresca la caché
      } else {
        const stored = readKycStep(landing, code);           // fallback
        if (stored > 0) setIndex(stored);
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
    tracker?.track('kyc_started', { steps: kycSteps.map((s) => s.type), application_code: code });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, kycEnabled, kycSteps]);

  if (isLoading || !kycEnabled || kycSteps.length === 0) {
    return (
      <KycChrome>
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
    tracker?.track('kyc_step_complete', {
      step: currentStep.type, index: safeIndex, application_code: code,
    });

    // Fire-and-forget: la UI no espera al backend. Si falla, el localStorage
    // sostiene el flujo en este dispositivo y el próximo montaje reconcilia.
    if (code) {
      void completeKycStep({
        applicationCode: code,
        stepType: currentStep.type,
        resumeToken,                                  // flujo por link
        documentNumber: resumeToken ? undefined : readWizardDni(landing), // en sesión
      });
    }

    if (safeIndex + 1 < kycSteps.length) {
      const next = safeIndex + 1;
      setIndex(next);
      writeKycStep(landing, code, next); // persistir avance (refresh/volver)
    } else {
      tracker?.track('kyc_completed', { application_code: code });
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
  // - hay DNI en localStorage (única prueba de titularidad en sesión)
  // - NO hay `resumeToken`: quien ya entró por el link no necesita pedir otro
  const wizardDni = readWizardDni(landing);
  const canPause = Boolean(progressState?.resume?.enabled && code && wizardDni && !resumeToken);

  const handlePauseClick = () => {
    tracker?.track('kyc_pause_click', { application_code: code });
    setShowPausarModal(true);
  };

  return (
    <KycChrome>
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white border border-neutral-200 shadow-sm px-5 py-6 sm:px-6 sm:py-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] text-center">
          Paso {safeIndex + 1} de {kycSteps.length} · {STEP_LABELS[currentStep.type]}
        </p>

        {renderStep(currentStep.type, goNext, goBack, code)}

        {canPause && code && wizardDni && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={handlePauseClick}
              className="text-sm font-semibold text-[#4654CD] hover:underline cursor-pointer"
            >
              Continuar en otro momento
            </button>
            <PausarModal
              open={showPausarModal}
              onClose={() => setShowPausarModal(false)}
              applicationCode={code}
              documentNumber={wizardDni}
              landing={landing}
            />
          </div>
        )}
      </div>
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
}

export default function KycClient(props: KycClientProps = {}) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KycContent {...props} />
    </Suspense>
  );
}
