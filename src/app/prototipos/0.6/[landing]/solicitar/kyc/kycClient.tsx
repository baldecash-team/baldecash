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
import { useEventTrackerOptional } from '../context/EventTrackerContext';
import { DniSelfieStep } from './steps/DniSelfieStep';
import { ContratoStep } from './steps/ContratoStep';
import { DocumentosStep } from './steps/DocumentosStep';

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

function renderStep(type: KycStepType, onDone: () => void, onBack?: () => void, applicationCode?: string) {
  switch (type) {
    case 'dni_selfie':
      return <DniSelfieStep onDone={onDone} onBack={onBack} applicationCode={applicationCode} />;
    case 'contract':
      return <ContratoStep onDone={onDone} onBack={onBack} />;
    case 'documents':
      return <DocumentosStep onDone={onDone} onBack={onBack} />;
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

function KycContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const landing = (params.landing as string) || 'home';
  const code = searchParams.get('code') || undefined;

  const { kycEnabled, kycSteps, isLoading } = useSolicitarFlow({ slug: landing });
  const [index, setIndex] = useState(0);
  const tracker = useEventTrackerOptional();
  const startedTrackedRef = useRef(false);
  const restoredRef = useRef(false);

  const goToConfirmacion = () =>
    router.replace(routes.solicitarConfirmacion(landing, code));

  // Restaura el sub-paso guardado (refresh / volver) una sola vez, tras montar
  // en cliente — el server siempre parte de 0, así se evita mismatch de
  // hidratación. Si estaba en DNI+selfie, re-captura (las fotos no se guardan).
  useEffect(() => {
    if (restoredRef.current || !code) return;
    restoredRef.current = true;
    const stored = readKycStep(landing, code);
    if (stored > 0) setIndex(stored);
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
    tracker?.track('kyc_started', { steps: kycSteps.map((s) => s.type) });
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
    tracker?.track('kyc_step_complete', { step: currentStep.type, index: safeIndex });
    if (safeIndex + 1 < kycSteps.length) {
      const next = safeIndex + 1;
      setIndex(next);
      writeKycStep(landing, code, next); // persistir avance (refresh/volver)
    } else {
      tracker?.track('kyc_completed');
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

  return (
    <KycChrome>
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white border border-neutral-200 shadow-sm px-5 py-6 sm:px-6 sm:py-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] text-center">
          Paso {safeIndex + 1} de {kycSteps.length} · {STEP_LABELS[currentStep.type]}
        </p>

        {renderStep(currentStep.type, goNext, goBack, code)}
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

export default function KycClient() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KycContent />
    </Suspense>
  );
}
