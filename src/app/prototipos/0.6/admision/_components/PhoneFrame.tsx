import type { ReactNode } from 'react';
import { BaldeCashLogo } from './BaldeCashLogo';

interface PhoneFrameProps {
  title?: string;
  children: ReactNode;
}

/**
 * Marco visual tipo móvil: cabecera de marca con el logo SVG de BaldeCash y cuerpo blanco.
 * La barra de título (azul) solo se renderiza cuando se pasa `title`.
 */
export function PhoneFrame({ title, children }: PhoneFrameProps) {
  return (
    <div className="flex flex-col w-full max-w-sm mx-auto rounded-2xl shadow-xl overflow-hidden border border-[#e5e7eb] bg-white">
      {/* Cabecera de marca con el logo SVG (mejora #9) */}
      <div className="flex justify-center px-6 pt-5 pb-4">
        <BaldeCashLogo className="h-7 w-auto" />
      </div>

      {/* Barra de título — solo cuando hay título */}
      {title && (
        <div className="bg-[#4654CD] px-6 py-4">
          <h2 className="text-white text-lg font-semibold text-center">{title}</h2>
        </div>
      )}

      {/* Cuerpo */}
      <div className="bg-white flex-1 overflow-y-auto px-6 pb-6 pt-1">{children}</div>
    </div>
  );
}
