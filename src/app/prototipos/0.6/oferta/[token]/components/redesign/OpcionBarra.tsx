/**
 * OpcionBarra — barra horizontal de acción del index (BAL-2184).
 *
 * Copiado 1:1 de las "BAR 1/2/3" del mock, variante V2·A
 * (docs/superpowers/design-refs/mock-index.html, líneas ~76-112): icono en
 * cuadro lila, título Baloo 2 + subtítulo, cuota a la derecha + chevron.
 * Usada para "Continuar con mi equipo", "Cambiar equipo", "Ver otros
 * equipos", "Ver catálogo".
 *
 * Puramente presentacional: props → UI, sin lógica.
 */
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { OFERTA_COLORS } from './ofertaTheme';

export interface OpcionBarraProps {
  icono: ReactNode;
  titulo: string;
  subtitulo?: string;
  cuota?: string;
  onClick: () => void;
}

export function OpcionBarra({ icono, titulo, subtitulo, cuota, onClick }: OpcionBarraProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[92px] w-full cursor-pointer items-center gap-[15px] rounded-[20px] border bg-white px-[17px] py-[15px] text-left transition-shadow hover:shadow-md"
      style={{
        borderColor: OFERTA_COLORS.border,
        boxShadow: '0 4px 14px rgba(31,35,51,.05)',
      }}
    >
      <div
        className="flex h-[60px] w-[74px] flex-none items-center justify-center rounded-[13px]"
        style={{ backgroundColor: OFERTA_COLORS.lilac }}
      >
        {icono}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-['Baloo_2',_sans-serif] text-[16px] font-bold leading-[1.15]">{titulo}</div>
        {subtitulo ? (
          <div className="mt-0.5 text-[12.5px]" style={{ color: OFERTA_COLORS.textMid }}>
            {subtitulo}
          </div>
        ) : null}
      </div>
      <div className="flex-none text-right">
        {cuota ? (
          <div
            className="font-['Baloo_2',_sans-serif] text-[18px] font-bold leading-[1.1]"
            style={{ color: OFERTA_COLORS.primary }}
          >
            {cuota}
          </div>
        ) : null}
        <ChevronRight
          className={cuota ? 'ml-auto mt-1 h-[18px] w-[18px]' : 'h-[18px] w-[18px]'}
          strokeWidth={2.2}
          style={{ color: OFERTA_COLORS.textSoft }}
        />
      </div>
    </button>
  );
}
