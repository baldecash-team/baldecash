'use client';

/**
 * Vista limitada de `ConfirmacionV2` (F8, BAL-4967) — el link se abrió con
 * `?code=APP-…` sin token (BAL-4188, D2). Mismo recorte que Diseño 1
 * (`LimitedConfirmationContent`): sin nombre, equipo ni cuota, porque el
 * `application_code` es adivinable y esos datos piden la prueba de
 * titularidad que da el token. Solo el N.° de solicitud y el contacto.
 */
import React from 'react';
import { BaldecitoV2 } from '../BaldecitoV2';
import { useMenosMovimiento } from '../movimiento';
import { ContactInfo } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/components/received';
import type { ApplicationStatusData } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/types/applicationStatus';

export interface ConfirmacionLimitadaV2Props {
  applicationData: ApplicationStatusData;
  onGoHome?: () => void;
}

export function ConfirmacionLimitadaV2({ applicationData, onGoHome }: ConfirmacionLimitadaV2Props) {
  const numero = applicationData.reference || applicationData.code;
  const reducido = useMenosMovimiento();
  return (
    <div data-confirmacion-v2-limitada className="bg-[var(--d2-fondo-confirmacion)]">
      <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:px-6 sm:py-14">
        <span className="mx-auto block w-fit">
          <BaldecitoV2 ancho={74} animado={!reducido} flotar={{ duracion: 3, demora: 0 }} saludar={{ duracion: 1.6, demora: 0 }} />
        </span>
        <h1 className="mt-4 font-['Baloo_2',_sans-serif] text-2xl font-bold text-[var(--d2-texto)]">
          ¡Recibimos tu solicitud!
        </h1>
        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--d2-chip-numero)] px-4 py-2">
          <span className="text-xs text-[var(--d2-texto-suave)]">N° de solicitud</span>
          <span className="break-all font-mono text-xs font-semibold text-[var(--d2-texto)]">{numero}</span>
        </div>
        <div className="mt-8 text-left">
          <ContactInfo onGoToHome={onGoHome} />
        </div>
      </div>
    </div>
  );
}

export default ConfirmacionLimitadaV2;
