'use client';

/**
 * Página de preview del gate locker-truck — solo frontend, sin backend.
 * Permite a diseño iterar sobre los estados visuales del gate sin necesidad
 * de datos reales ni autenticación.
 *
 * Ruta estática: /prototipos/0.6/locker-truck-gate-preview
 * (tiene precedencia sobre el segmento dinámico [landing])
 */

import { useState } from 'react';
import { LockertruckOverlayGate, LockertruckState } from '../[landing]/layout';

const STATES: LockertruckState[] = ['d1', 'd2-loading', 'd2-result', 'waiting', 'd3', 'error'];

const STATE_LABELS: Record<LockertruckState, string> = {
  'd1': 'D1 — Ingreso DNI',
  'd2-loading': 'D2-loading — Revisando',
  'd2-result': 'D2-result — Acceso OK',
  'waiting': 'Waiting — En espera',
  'd3': 'D3 — Sin acceso',
  'error': 'Error — Reintentar',
};

export default function LockertruckGatePreviewPage() {
  const [selected, setSelected] = useState<LockertruckState>('d2-loading');

  return (
    <>
      {/* Barra de control fija — z-index sobre el gate (z-[10001]) */}
      <div
        className="fixed top-0 left-0 right-0 z-[10002] flex flex-col sm:flex-row items-start sm:items-center gap-2 px-4 py-2 pointer-events-auto"
        style={{
          backgroundColor: 'rgba(17, 24, 39, 0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span className="text-xs font-medium text-gray-400 shrink-0 mr-1">
          Preview de diseno — gate locker-truck (solo dev, sin backend)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STATES.map((state) => (
            <button
              key={state}
              onClick={() => setSelected(state)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer"
              style={
                selected === state
                  ? { backgroundColor: '#00BFB3', color: '#fff' }
                  : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }
              }
            >
              {STATE_LABELS[state]}
            </button>
          ))}
        </div>
      </div>

      {/* Gate: key={selected} fuerza remount al cambiar estado */}
      <LockertruckOverlayGate
        key={selected}
        previewState={selected}
        landing="locker-truck"
        onValidated={() => {}}
      />
    </>
  );
}
