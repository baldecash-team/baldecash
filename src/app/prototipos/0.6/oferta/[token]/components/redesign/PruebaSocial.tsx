/**
 * PruebaSocial — chip discreto de prueba social (BAL-2184).
 *
 * No está en el mock: se diseña acorde al mismo sistema visual (fondo gris
 * suave `grayBg`, borde sutil, texto `textMid`, ícono pequeño), pensado para
 * vivir debajo del monto héroe sin competir con él.
 *
 * Puramente presentacional: texto configurable vía prop, con un valor por
 * defecto razonable.
 */
import { Users } from 'lucide-react';

import { OFERTA_COLORS } from './ofertaTheme';

interface PruebaSocialProps {
  texto?: string;
}

export function PruebaSocial({
  texto = '+5,000 estudiantes ya recibieron su equipo',
}: PruebaSocialProps) {
  return (
    <div
      className="inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-[12px] font-medium"
      style={{
        backgroundColor: OFERTA_COLORS.grayBg,
        borderColor: OFERTA_COLORS.border,
        color: OFERTA_COLORS.textMid,
      }}
    >
      <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={2} style={{ color: OFERTA_COLORS.textSoft }} />
      <span>{texto}</span>
    </div>
  );
}
