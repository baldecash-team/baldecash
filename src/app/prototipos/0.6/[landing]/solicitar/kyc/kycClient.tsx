'use client';

/**
 * KYC (pasos posteriores) — ruta dedicada `…/solicitar/kyc`.
 *
 * Se llega aquí tras el submit cuando la landing tiene la sección `kyc`
 * habilitada. Fase 1: renderiza los sub-pasos habilitados como PLACEHOLDER
 * (sin lógica real de captura/subida). Si la landing NO habilita `kyc`
 * (entrada por URL directa), redirige al resumen, respetando el switch.
 */

import { Suspense, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';

const STEP_LABELS: Record<string, string> = {
  dni_selfie: 'DNI + selfie',
  payment_receipt: 'Comprobante de pago',
  contract: 'Contrato',
  documents: 'Documentos',
};

function KycContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const landing = (params.landing as string) || 'home';
  const code = searchParams.get('code') || undefined;

  const { kycEnabled, kycSteps, isLoading } = useSolicitarFlow({ slug: landing });

  const goToConfirmacion = () =>
    router.replace(routes.solicitarConfirmacion(landing, code));

  // Gate: landing sin `kyc` → saltar al resumen.
  useEffect(() => {
    if (isLoading) return;
    if (!kycEnabled) goToConfirmacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, kycEnabled]);

  if (isLoading || !kycEnabled) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8 gap-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold text-gray-900 text-center">
          Verificación de identidad
        </h1>
        <p className="text-sm text-gray-500 text-center">
          Completa los siguientes pasos para finalizar tu solicitud.
        </p>
        <ul className="space-y-2">
          {kycSteps.map((step) => (
            <li
              key={step.type}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <span className="text-sm font-medium text-gray-800">
                {STEP_LABELS[step.type] ?? step.type}
              </span>
              <span className="text-xs text-gray-400">Próximamente</span>
            </li>
          ))}
        </ul>
        <button
          onClick={goToConfirmacion}
          className="w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
        >
          Continuar
        </button>
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
