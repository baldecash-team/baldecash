/**
 * MontoAprobadoBar — bloque héroe del monto aprobado con barra de progreso
 * (BAL-2183, feedback Emilio/Marco).
 *
 * Fondo lila + monto aprobado grande (índigo, Baloo 2). La barra tiene dos modos
 * según el caso de la oferta:
 *
 *  - `mode="pedido"` (Caso 4 downgrade): compara la cuota del equipo que el
 *    estudiante PIDIÓ contra su monto. Como el downgrade existe porque el pedido
 *    no entra, si `usado > aprobado` la barra se llena en ROJO + aviso
 *    "<tu equipo> cuesta S/X — se pasa de tu monto". Comunica: "lo que querías no
 *    entra". Si por algún dato el pedido sí entra, cae al texto de restante.
 *
 *  - `mode="recomendado"` (Caso 5 upsell): compara la cuota del equipo destacado
 *    (que SÍ entra) y muestra "este equipo usa S/X · te quedan S/Y para
 *    accesorios". Comunica: "con esto te alcanza y te sobra".
 *
 * Puramente presentacional. No hace fetch.
 */
import { OFERTA_COLORS } from './ofertaTheme';

const RED = '#DC2626';
const RED_SOFT = '#FEE2E2';

interface MontoAprobadoBarProps {
  /** Monto mensual aprobado, en soles. */
  aprobado: number;
  /** Cuota mensual del equipo relevante: el PEDIDO (mode="pedido") o el
   *  DESTACADO (mode="recomendado"). Null → barra llena decorativa. */
  usado?: number | null;
  /** "pedido" (Caso 4): rojo si excede. "recomendado" (Caso 5): restante. */
  mode?: 'pedido' | 'recomendado';
  /** Nombre del equipo (para el aviso "<equipo> cuesta..."). Opcional. */
  equipoNombre?: string | null;
}

export function MontoAprobadoBar({ aprobado, usado, mode = 'recomendado', equipoNombre }: MontoAprobadoBarProps) {
  const fmt = (n: number) => Math.round(n).toLocaleString('es-PE');
  const tiene = usado != null && usado > 0 && aprobado > 0;
  const excede = mode === 'pedido' && tiene && usado! > aprobado;
  // % de la barra: si excede, se llena al 100% (rojo); si no, proporción usada.
  const pct = tiene ? Math.min(100, Math.round((Math.min(usado!, aprobado) / aprobado) * 100)) : 100;
  const restante = tiene ? Math.max(0, aprobado - usado!) : 0;
  const barColor = excede ? RED : OFERTA_COLORS.primary;

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
        <span className="text-[18px] font-semibold sm:text-[22px]" style={{ color: OFERTA_COLORS.textMid }}>
          /mes
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full sm:mt-4" style={{ backgroundColor: '#fff' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      {/* Caso 4 (pedido) que EXCEDE → aviso rojo */}
      {excede ? (
        <div
          className="mt-2.5 inline-flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold leading-snug"
          style={{ backgroundColor: RED_SOFT, color: RED }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-px shrink-0">
            <path d="M12 3 1.5 21h21L12 3Z" stroke={RED} strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 10v4" stroke={RED} strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="12" cy="17.2" r="1.2" fill={RED} />
          </svg>
          <span>
            {equipoNombre ? `${equipoNombre} cuesta ` : 'Tu equipo cuesta '}
            <span className="font-extrabold">S/{fmt(usado!)}/mes</span> — se pasa de tu monto aprobado
          </span>
        </div>
      ) : null}

      {/* Caso 5 (recomendado) → cuánto usa y cuánto queda para accesorios */}
      {!excede && mode === 'recomendado' && tiene ? (
        <p className="mt-2 text-[12px] leading-snug" style={{ color: OFERTA_COLORS.textMid }}>
          Este equipo usa{' '}
          <span className="font-bold" style={{ color: OFERTA_COLORS.textStrong }}>S/{fmt(usado!)}</span>
          {restante > 0 ? (
            <>
              {' '}· te quedan{' '}
              <span className="font-bold" style={{ color: OFERTA_COLORS.greenDark }}>S/{fmt(restante)}</span>
              {' '}para accesorios
            </>
          ) : (
            <> de tu monto aprobado</>
          )}
        </p>
      ) : null}
    </div>
  );
}
