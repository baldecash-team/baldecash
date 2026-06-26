import type { ReactNode } from 'react';
import { BaldeCashLogo } from './BaldeCashLogo';

interface PhoneFrameProps {
  title?: string;
  children: ReactNode;
}

/**
 * Contenedor de los flujos de admisión.
 * - Mobile: card (bordes, sombra, cabecera azul con logo blanco).
 * - Desktop: se quita el "card" y el contenido ocupa el panel; la marca la
 *   provee el panel lateral de AdmisionLayout (la cabecera de logo se oculta).
 */
export function PhoneFrame({ title, children }: PhoneFrameProps) {
  return (
    <div className="flex flex-col w-full max-w-sm mx-auto rounded-2xl shadow-xl overflow-hidden border border-[#e5e7eb] bg-white md:max-w-none md:mx-0 md:h-full md:rounded-none md:border-0 md:shadow-none">
      {/* Cabecera de marca (mobile): banda azul con el logo blanco (mejora #9) */}
      <div className="flex justify-center px-6 py-4 bg-[#4654CD] md:hidden">
        <BaldeCashLogo white className="h-8 w-auto" />
      </div>

      {/* Barra de título — solo cuando hay título */}
      {title && (
        <div className="bg-[#4654CD] px-6 py-4 md:bg-transparent md:px-10 md:pt-10 md:pb-0">
          <h2 className="text-white md:text-[#1f2937] text-lg font-semibold text-center md:text-left">{title}</h2>
        </div>
      )}

      {/* Cuerpo: a ancho cómodo y centrado vertical/horizontalmente en desktop.
          `my-auto` centra cuando el contenido es corto y permite scroll si es alto. */}
      <div className="bg-white flex-1 overflow-y-auto px-6 pb-6 pt-6 md:px-10 md:py-12 md:flex md:flex-col">
        <div className="w-full md:max-w-md md:mx-auto md:my-auto">{children}</div>
      </div>
    </div>
  );
}
