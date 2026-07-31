'use client';

/**
 * KycLayout — lienzo responsive del flujo KYC (foto DNI+selfie, contrato,
 * documentos), calcado del mismo patrón de dos layouts que ya usa el flujo de
 * admisión/videollamada (`admision/_components/AdmisionLayout.tsx` +
 * `PhoneFrame.tsx`):
 *
 * - Mobile: solo la card angosta de siempre (sin cambios — el reclamo del PO
 *   es específicamente sobre desktop).
 * - Desktop (`md:`): grid de dos columnas, panel de marca azul (`#4654CD`) a
 *   la izquierda + panel de contenido blanco y más ancho a la derecha, para
 *   que la cámara y las previews de "Revisa tus fotos" (DniSelfieStep) dejen
 *   de verse apretadas dentro de la card mobile.
 *
 * A diferencia de AdmisionLayout (que SÍ pone el logo en el panel azul), acá
 * NO se duplica: `KycChrome` (kycClient.tsx) ya monta el Navbar real de la
 * landing arriba de este layout, así que el panel de marca es solo copy de
 * refuerzo — se integra con ese chrome en vez de competir con él.
 */

import type { ReactNode } from 'react';

const KYC_BENEFITS = [
  'Tus datos viajan cifrados y seguros.',
  'Toma solo un par de minutos.',
  'Puedes continuar después si lo necesitas.',
];

export function KycLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-md md:max-w-4xl md:grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:rounded-3xl md:overflow-hidden md:shadow-xl md:bg-white">
      {/* Panel de marca — solo desktop */}
      <aside className="hidden md:flex flex-col justify-center gap-6 bg-[#4654CD] text-white p-10 lg:p-12">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight">
            Verifiquemos que eres tú
          </h2>
          <p className="text-white/80 text-sm lg:text-base leading-relaxed">
            Unos pasos rápidos para validar tu identidad y seguir con tu solicitud.
          </p>
        </div>
        <ul className="flex flex-col gap-3.5">
          {KYC_BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm lg:text-base text-white/90">
              <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Panel de contenido — en mobile este div es transparente y el "card"
          real lo pone el caller (kycClient.tsx); en desktop llena el panel
          blanco más ancho. */}
      <div className="md:flex md:flex-col md:bg-white md:min-w-0">{children}</div>
    </div>
  );
}

export default KycLayout;
