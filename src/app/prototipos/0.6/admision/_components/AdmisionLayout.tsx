import type { ReactNode } from 'react';
import { BaldeCashLogo } from './BaldeCashLogo';

const BENEFITS = [
  'Tus datos viajan cifrados y seguros.',
  'Te toma menos de 2 minutos.',
  'Te avisamos por WhatsApp en cada paso.',
];

/**
 * Lienzo de los flujos de admisión.
 * - Mobile: solo la card (PhoneFrame).
 * - Desktop: layout ancho (más pantalla) con panel de marca azul + panel de
 *   contenido blanco; el "card" NO se usa en desktop.
 */
export function AdmisionLayout({ children }: { children: ReactNode }) {
  return (
    <main className="admision-flow min-h-screen bg-white md:bg-[#EEF0FB] flex items-center justify-center px-4 py-6 md:p-8 lg:p-12 box-border">
      <div className="w-full max-w-sm md:max-w-6xl md:grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:rounded-3xl md:overflow-hidden md:shadow-xl md:bg-white md:min-h-[660px]">
        {/* Panel de marca — solo desktop */}
        <aside className="hidden md:flex flex-col justify-center gap-8 bg-[#4654CD] text-white p-12 lg:p-16">
          <BaldeCashLogo white className="h-9 w-auto self-start" />
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight">
              Estás a un paso de terminar tu solicitud
            </h2>
            <p className="text-white/80 text-sm lg:text-base leading-relaxed">
              Completa esta validación para que sigamos con tu evaluación. Es rápido y seguro.
            </p>
          </div>
          <ul className="flex flex-col gap-3.5">
            {BENEFITS.map((b) => (
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

        {/* Panel de contenido — el card es solo para mobile; en desktop el contenido
            llena este panel blanco más ancho. */}
        <div className="md:flex md:flex-col md:bg-white">{children}</div>
      </div>
    </main>
  );
}
