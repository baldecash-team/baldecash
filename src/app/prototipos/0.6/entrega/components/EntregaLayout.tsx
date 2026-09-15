/**
 * Lienzo del formulario de entrega por token.
 *
 * Mismo patrón que los flujos de admisión y el KYC, y por la misma razón: es
 * una página que se abre desde un enlace de WhatsApp, sin el chrome de la
 * landing, así que la marca tiene que estar en la página o no está en ningún
 * lado.
 *
 * - Mobile: la columna de siempre, sin tocar. El formulario ya está pensado
 *   para el teléfono, que es donde se abre casi siempre.
 * - Desktop (`md:`): dos columnas, panel de marca a la izquierda con el logo y
 *   lo que la persona necesita saber antes de completar, y el formulario a la
 *   derecha sobre blanco. En una pantalla grande, la columna sola de 600px se
 *   veía perdida en el gris.
 */

import type { ReactNode } from 'react';
import { BaldeCashLogo } from '@/app/prototipos/0.6/admision/_components/BaldeCashLogo';

/** Lo que importa saber ANTES de completar, no después. */
const PUNTOS = [
  'El envío es gratis a todo el Perú.',
  'Te avisamos por WhatsApp con tu número de seguimiento.',
  'Ten a mano tu DNI para recibir el equipo.',
];

export function EntregaLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#F7F7FB] px-4 py-8 md:flex md:items-center md:justify-center md:p-8 lg:p-12">
      <div className="md:grid md:w-full md:max-w-6xl md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:overflow-hidden md:rounded-3xl md:bg-white md:shadow-xl">
        {/* Panel de marca — solo desktop */}
        <aside className="hidden flex-col justify-center gap-8 bg-[#4654CD] p-12 text-white md:flex lg:p-16">
          <BaldeCashLogo white className="h-9 w-auto self-start" />
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-extrabold leading-tight lg:text-4xl">
              Tu equipo está listo para salir
            </h2>
            <p className="text-sm leading-relaxed text-white/80 lg:text-base">
              Dinos a dónde lo mandamos y quién lo recibe. Toma menos de dos minutos.
            </p>
          </div>
          <ul className="flex flex-col gap-3.5">
            {PUNTOS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-white/90 lg:text-base">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/70">
            ¿Dudas con la entrega? Escríbenos al 957 082 347.
          </p>
        </aside>

        {/* Panel del formulario. En desktop llena la columna blanca; en mobile
            es la misma columna de siempre. */}
        <div className="md:flex md:flex-col md:justify-center md:bg-white md:p-10 lg:p-12">
          {children}
        </div>
      </div>
    </main>
  );
}

export default EntregaLayout;
