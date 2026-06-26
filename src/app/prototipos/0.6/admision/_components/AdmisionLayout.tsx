import type { ReactNode } from 'react';
import { BaldeCashLogo } from './BaldeCashLogo';

const BENEFITS = [
  'Tus datos viajan cifrados y seguros.',
  'Te toma menos de 2 minutos.',
  'Te avisamos por WhatsApp en cada paso.',
];

/**
 * Lienzo de los flujos de admisión.
 * - Mobile: solo la card (PhoneFrame) centrada.
 * - Desktop: panel de marca a la izquierda + la card a la derecha (ocupa más espacio).
 */
export function AdmisionLayout({ children }: { children: ReactNode }) {
  return (
    <main className="admision-flow min-h-screen bg-white md:bg-[#EEF0FB] flex items-center justify-center px-4 py-6 md:py-10 box-border">
      <div className="w-full max-w-sm md:max-w-4xl md:grid md:grid-cols-2 md:gap-8 md:items-stretch">
        {/* Panel de marca — solo desktop */}
        <aside className="hidden md:flex flex-col justify-center gap-7 rounded-3xl bg-[#4654CD] text-white p-10 shadow-xl">
          <span className="inline-flex self-start bg-white rounded-xl px-4 py-3 shadow-sm">
            <BaldeCashLogo className="h-8 w-auto" />
          </span>
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-extrabold leading-tight">
              Estás a un paso de terminar tu solicitud
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Completa esta validación para que sigamos con tu evaluación. Es rápido y seguro.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-white/90">
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

        {/* Card (el diseño de card es para mobile; en desktop se ubica a la derecha) */}
        <div className="flex items-center justify-center">{children}</div>
      </div>
    </main>
  );
}
