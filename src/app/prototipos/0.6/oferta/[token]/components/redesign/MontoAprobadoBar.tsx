/**
 * MontoAprobadoBar — bloque del monto con barra de progreso (BAL-2183, feedback
 * Emilio/Marco). Fondo gris/lila, dos modos:
 *
 *  - `mode="pedido"` (Caso 4 downgrade): muestra **cuota seleccionada vs monto
 *    aprobado** (dos montos, mock frame 1). Si la cuota excede el monto → barra
 *    ROJA 100% + "Tu cuota excede en S/X el monto aprobado".
 *
 *  - `mode="recomendado"` (Caso 5 upsell): monto aprobado grande + barra de
 *    cuánto usa el equipo destacado + "te quedan S/Y para accesorios".
 *
 * Puramente presentacional. No hace fetch.
 */
import { OFERTA_COLORS } from './ofertaTheme';

const RED = '#EF4444';
const RED_SOFT = '#FEE2E2';

interface MontoAprobadoBarProps {
  /** Monto mensual aprobado, en soles. */
  aprobado: number;
  /** Cuota mensual del equipo relevante: el PEDIDO (mode="pedido") o el
   *  DESTACADO (mode="recomendado"). Null → barra llena decorativa. */
  usado?: number | null;
  /** "pedido" (Caso 4): cuota vs aprobado, rojo si excede. "recomendado"
   *  (Caso 5): monto aprobado + restante. */
  mode?: 'pedido' | 'recomendado';
  /** Nombre del equipo (para el aviso, modo recomendado). Opcional. */
  equipoNombre?: string | null;
}

export function MontoAprobadoBar({ aprobado, usado, mode = 'recomendado', equipoNombre }: MontoAprobadoBarProps) {
  const fmt = (n: number) => Math.round(n).toLocaleString('es-PE');
  const tiene = usado != null && usado > 0 && aprobado > 0;
  const excede = mode === 'pedido' && tiene && usado! > aprobado;
  const exceso = excede ? usado! - aprobado : 0;
  const pct = tiene ? Math.min(100, Math.round((Math.min(usado!, aprobado) / aprobado) * 100)) : 100;
  const restante = tiene ? Math.max(0, aprobado - usado!) : 0;
  const barColor = excede ? RED : OFERTA_COLORS.primary;

  // ---- Caso 4 (downgrade): cuota seleccionada vs monto aprobado ----
  if (mode === 'pedido' && tiene) {
    return (
      <div
        className="rounded-xl border p-4 sm:p-[18px]"
        style={{ backgroundColor: OFERTA_COLORS.grayBg, borderColor: OFERTA_COLORS.border }}
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[11.5px] font-medium" style={{ color: OFERTA_COLORS.textSoft }}>Cuota seleccionada</div>
            <div
              className="mt-0.5 font-['Baloo_2',_sans-serif] text-[30px] font-extrabold leading-none sm:text-[32px]"
              style={{ color: OFERTA_COLORS.textStrong }}
            >
              S/{fmt(usado!)}<span className="text-[15px] font-semibold" style={{ color: OFERTA_COLORS.textMid }}>/mes</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11.5px] font-medium" style={{ color: OFERTA_COLORS.textSoft }}>Monto aprobado</div>
            <div
              className="mt-1 font-['Baloo_2',_sans-serif] text-[18px] font-bold leading-none"
              style={{ color: OFERTA_COLORS.textMid }}
            >
              S/{fmt(aprobado)}<span className="text-[11px] font-semibold">/mes</span>
            </div>
          </div>
        </div>

        {/* Barra: roja 100% si excede, índigo proporcional si no */}
        <div
          className="mt-4 h-[9px] w-full overflow-hidden rounded-full"
          style={{ backgroundColor: excede ? RED_SOFT : '#fff' }}
        >
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
        </div>

        {excede ? (
          <div className="mt-2.5 flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
              <path d="M12 3 1.5 21h21L12 3Z" stroke={RED} strokeWidth="1.9" strokeLinejoin="round" />
              <path d="M12 10v4" stroke={RED} strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17.2" r="1.2" fill={RED} />
            </svg>
            <span className="text-[12px] font-semibold" style={{ color: RED }}>
              Tu cuota excede en S/{fmt(exceso)} el monto aprobado
            </span>
          </div>
        ) : null}
      </div>
    );
  }

  // ---- Caso 5 (upsell) / fallback: monto aprobado + restante ----
  return (
    <div className="rounded-xl px-5 py-3.5 sm:px-6 sm:py-[22px]" style={{ backgroundColor: OFERTA_COLORS.lilac }}>
      <div className="text-[11.5px] font-bold tracking-[.11em]" style={{ color: OFERTA_COLORS.tealBrand }}>
        TU MONTO APROBADO
      </div>
      <div
        className="mt-1 font-['Baloo_2',_sans-serif] text-[34px] font-extrabold leading-none sm:mt-1.5 sm:text-[46px]"
        style={{ color: OFERTA_COLORS.primary }}
      >
        S/{fmt(aprobado)}
        <span className="text-[18px] font-semibold sm:text-[22px]" style={{ color: OFERTA_COLORS.textMid }}>/mes</span>
      </div>

      <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full sm:mt-4" style={{ backgroundColor: '#fff' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: OFERTA_COLORS.primary }} />
      </div>

      {tiene ? (
        <p className="mt-2 text-[12px] leading-snug" style={{ color: OFERTA_COLORS.textMid }}>
          {equipoNombre ? `${equipoNombre} usa ` : 'Este equipo usa '}
          <span className="font-bold" style={{ color: OFERTA_COLORS.textStrong }}>S/{fmt(usado!)}</span>
          {restante > 0 ? (
            <>
              {' '}· te quedan{' '}
              <span className="font-bold" style={{ color: OFERTA_COLORS.greenDark }}>S/{fmt(restante)}</span>
              {' '}para mejorar tu equipo o sumar accesorios y seguros
            </>
          ) : (
            <> de tu monto aprobado</>
          )}
        </p>
      ) : null}
    </div>
  );
}
