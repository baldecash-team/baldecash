'use client';

/**
 * KYC (pasos posteriores) — ruta dedicada `…/solicitar/kyc`.
 *
 * Se llega aquí tras el submit cuando la landing tiene la sección `kyc`
 * habilitada. Fase 2: orquesta los sub-pasos habilitados (`kycSteps`, ya
 * filtrados/ordenados por `useSolicitarFlow`) con UI real de captura/carga,
 * pero SIN wiring a backend real (no S3, no Rekognition, no validación IA —
 * eso llega en una fase posterior). Si la landing NO habilita `kyc` (entrada
 * por URL directa), redirige al resumen, respetando el switch.
 */

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';
import type { KycStepType } from '@/app/prototipos/0.6/services/landingApi';
import { useEventTrackerOptional } from '../context/EventTrackerContext';
import { DniSelfieStep } from './steps/DniSelfieStep';
import { ComprobanteStep } from './steps/ComprobanteStep';
import { ContratoStep } from './steps/ContratoStep';
import { DocumentosStep } from './steps/DocumentosStep';

const STEP_LABELS: Record<KycStepType, string> = {
  dni_selfie: 'DNI + selfie',
  payment_receipt: 'Comprobante de pago',
  contract: 'Contrato',
  documents: 'Documentos',
};

function renderStep(type: KycStepType, onDone: () => void, onBack?: () => void, applicationCode?: string) {
  switch (type) {
    case 'dni_selfie':
      return <DniSelfieStep onDone={onDone} onBack={onBack} applicationCode={applicationCode} />;
    case 'payment_receipt':
      return <ComprobanteStep onDone={onDone} onBack={onBack} />;
    case 'contract':
      return <ContratoStep onDone={onDone} onBack={onBack} />;
    case 'documents':
      return <DocumentosStep onDone={onDone} onBack={onBack} />;
    default:
      return null;
  }
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

  const goToConfirmacion = () =>
    router.replace(routes.solicitarConfirmacion(landing, code));

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
    return <LoadingFallback />;
  }

  // Clamp defensivo por si `kycSteps` cambiara de tamaño en caliente.
  const safeIndex = Math.min(index, kycSteps.length - 1);
  const currentStep = kycSteps[safeIndex];

  const goNext = () => {
    tracker?.track('kyc_step_complete', { step: currentStep.type, index: safeIndex });
    if (safeIndex + 1 < kycSteps.length) {
      setIndex(safeIndex + 1);
    } else {
      tracker?.track('kyc_completed');
      goToConfirmacion();
    }
  };
  const goBack = safeIndex > 0 ? () => setIndex(safeIndex - 1) : undefined;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md space-y-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] text-center">
          Paso {safeIndex + 1} de {kycSteps.length} · {STEP_LABELS[currentStep.type]}
        </p>

        {renderStep(currentStep.type, goNext, goBack, code)}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
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
