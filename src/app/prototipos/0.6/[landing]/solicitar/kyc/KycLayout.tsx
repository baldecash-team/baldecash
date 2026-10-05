'use client';

/**
 * KycLayout — lienzo responsive del flujo KYC (foto DNI+selfie, contrato,
 * documentos).
 *
 * - Mobile: solo la card angosta de siempre (sin cambios).
 * - Desktop (`md:`): una sola columna. El panel de marca azul (`#4654CD`) va
 *   ARRIBA como franja compacta y el contenido usa todo el ancho debajo.
 *
 * Antes el panel azul era una columna a la izquierda (~43% del ancho) y el
 * contrato quedaba apretado en la columna derecha: el PDF y el cronograma
 * (con la columna DESCUENTO de las campañas) no entraban. Con la franja arriba
 * el contrato, la cámara y las previews de "Revisa tus fotos" tienen el ancho
 * completo de la card.
 *
 * `KycChrome` (kycClient.tsx) ya monta el Navbar real de la landing arriba de
 * este layout, así que la franja no repite el logo: es solo copy de refuerzo.
 */

import type { ReactNode } from 'react';

const KYC_BENEFITS = [
  'Tus datos viajan cifrados y seguros.',
  'Toma solo un par de minutos.',
  'Puedes continuar después si lo necesitas.',
];

export function KycLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-md md:max-w-4xl md:flex md:flex-col md:rounded-3xl md:overflow-hidden md:shadow-xl md:bg-white">
      {/* Franja de marca — solo desktop, arriba del contenido */}
      <aside
        data-testid="kyc-franja-marca"
        className="hidden md:flex flex-col gap-3 bg-[#4654CD] text-white px-10 py-5"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-xl lg:text-2xl font-extrabold leading-tight">
            Verifiquemos que eres tú
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Unos pasos rápidos para validar tu identidad y seguir con tu solicitud.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {KYC_BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm text-white/90">
              <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
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
          real lo pone el caller (kycClient.tsx); en desktop ocupa todo el
          ancho de la card debajo de la franja. */}
      <div className="md:flex md:flex-col md:bg-white md:min-w-0 md:w-full">{children}</div>
    </div>
  );
}

export default KycLayout;
