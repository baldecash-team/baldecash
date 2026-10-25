'use client';

/**
 * Estado "cargando" de `ConfirmacionV2` (F8, BAL-4967). Mismo spinner de
 * siempre (`CubeGridSpinner`, el mismo que usa Diseño 1), dentro del fondo
 * neutro de Diseño 2 — es el mismo estado, solo con el estilo nuevo.
 */
import React from 'react';
import { CubeGridSpinner } from '@/app/prototipos/_shared';

export function LoadingFallbackV2() {
  return (
    <div
      data-confirmacion-v2-cargando
      className="flex items-center justify-center bg-[var(--d2-fondo-confirmacion)]"
      style={{ minHeight: '60svh' }}
    >
      <CubeGridSpinner />
    </div>
  );
}

export default LoadingFallbackV2;
