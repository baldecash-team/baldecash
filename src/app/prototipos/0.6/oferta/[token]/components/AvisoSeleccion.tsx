'use client';

/**
 * Aviso de la portada cuando aceptar una opción falla (BAL-4196).
 *
 * Antes cualquier error del `/select` reemplazaba la página entera por "No
 * pudimos cargar tu oferta": el cliente perdía la oferta de vista aunque el
 * rechazo fuera de ESA opción (equipo que ya no se ofrece, supera el tope,
 * combo o accesorio no disponible...). Ahora se muestra el `message` del
 * backend como aviso y la oferta sigue ahí para elegir otra opción.
 *
 * Solo un link muerto (vencido, ya usado, revocado, inválido) tumba la
 * página: ahí no queda nada que elegir.
 */
import { TriangleAlert, X } from 'lucide-react';

import type { OfferErrorReason } from '../../../services/offerApi';
import { OFERTA_COLORS } from './redesign/ofertaTheme';

const LINK_MUERTO: ReadonlySet<string> = new Set(['expired', 'consumed', 'revoked', 'invalid']);

/** ¿El error del `/select` deja la oferta inutilizable? */
export function errorDeSeleccionTumbaLaPagina(reason: OfferErrorReason | string): boolean {
  return LINK_MUERTO.has(reason);
}

interface AvisoSeleccionProps {
  message: string;
  onCerrar: () => void;
}

export function AvisoSeleccion({ message, onCerrar }: AvisoSeleccionProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13.5px] leading-[1.45]"
      style={{ borderColor: OFERTA_COLORS.primary, backgroundColor: OFERTA_COLORS.lilac, color: OFERTA_COLORS.textStrong }}
    >
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.primary }} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{message}</p>
        <p className="mt-0.5" style={{ color: OFERTA_COLORS.textMid }}>
          Tu oferta sigue disponible: elige otra opción.
        </p>
      </div>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar aviso"
        className="shrink-0 cursor-pointer rounded p-0.5 hover:bg-white/60"
      >
        <X className="h-4 w-4" style={{ color: OFERTA_COLORS.textMid }} />
      </button>
    </div>
  );
}
