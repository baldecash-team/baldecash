/**
 * TuEquipoCard — card compacta con el equipo ya elegido (BAL-2185).
 *
 * Copiado 1:1 de la card "TU EQUIPO" del mock
 * (docs/superpowers/design-refs/mock-accesorios.html, frame 1): fondo
 * `grayBg`, borde `border`, radius 16px. Foto placeholder + label teal +
 * nombre + cuota a la derecha.
 *
 * Desglose de extras (feedback Marco, frame 3 de
 * docs/superpowers/design-refs/mock-feedback-reunion.html): cuando se pasan
 * `extras`, debajo de la fila principal se lista "Equipo S/X/mes" + cada
 * accesorio/seguro "+S/Y/mes" + "Total S/N/mes". Sin `extras`, se comporta
 * igual que antes (solo nombre + cuota).
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica.
 */
import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';

export interface TuEquipoExtraItem {
  label: string;
  monthly: number;
}

export interface TuEquipoCardProps {
  nombre: string;
  cuota: number;
  /** URL de la imagen del equipo. Si no viene, se muestra un placeholder. */
  imageUrl?: string | null;
  /** Desglose opcional: equipo + accesorios + seguros elegidos. Si no viene,
   *  la card se ve igual que antes (sin desglose). */
  extras?: TuEquipoExtraItem[];
  /** Cuota total (equipo + extras). Solo se usa si `extras` viene. */
  total?: number;
  /** Plazo e inicial ya formateados (read-only), debajo del nombre. Ej.
   *  "36 meses" e "Inicial S/0". Si no vienen, no se muestran. */
  plazoTexto?: string | null;
  inicialTexto?: string | null;
}

export function TuEquipoCard({ nombre, cuota, imageUrl, extras, total, plazoTexto, inicialTexto }: TuEquipoCardProps) {
  const cuotaFormateada = Math.round(cuota).toLocaleString('es-PE');
  const mostrarDesglose = Boolean(extras && extras.length > 0);
  const totalFormateado = Math.round(total ?? cuota).toLocaleString('es-PE');

  return (
    <div
      className="rounded-xl border px-3.5 py-3"
      style={{ backgroundColor: OFERTA_COLORS.grayBg, borderColor: OFERTA_COLORS.border }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-[50px] w-[60px] flex-none items-center justify-center overflow-hidden rounded-xl border"
          style={{
            borderColor: OFERTA_COLORS.border,
            background: imageUrl
              ? '#fff'
              : 'repeating-linear-gradient(135deg, #F1F2F7 0 7px, #E9EBF2 7px 14px)',
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={nombre} className="h-full w-full object-contain" />
          ) : (
            <span className="font-mono text-[8px]" style={{ color: OFERTA_COLORS.textSoft }}>
              equipo
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-[9.5px] font-bold tracking-[.1em]"
            style={{ color: OFERTA_COLORS.tealBrand }}
          >
            TU EQUIPO
          </div>
          <div className="mt-0.5 text-[14.5px] font-bold leading-[1.2]" style={{ color: OFERTA_COLORS.textStrong }}>
            {nombre}
          </div>
          {/* Plazo e inicial (read-only), debajo del nombre. */}
          {(plazoTexto || inicialTexto) ? (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px]" style={{ color: OFERTA_COLORS.textMid }}>
              {plazoTexto ? <span>{plazoTexto}</span> : null}
              {plazoTexto && inicialTexto ? <span style={{ color: OFERTA_COLORS.textSoft }}>·</span> : null}
              {inicialTexto ? <span>{inicialTexto}</span> : null}
            </div>
          ) : null}
        </div>
        {/* Cuota a la derecha: siempre visible. Sin desglose muestra la cuota del
            equipo; con desglose muestra el TOTAL (evita que "salte" al aparecer
            el desglose — la cifra se queda, solo cambia su valor/label). */}
        <div className="flex-none text-right">
          <div
            className="text-[15px] font-bold"
            style={{ color: mostrarDesglose ? OFERTA_COLORS.primary : OFERTA_COLORS.textStrong }}
          >
            S/{mostrarDesglose ? totalFormateado : cuotaFormateada}/mes
          </div>
          {mostrarDesglose ? (
            <div className="text-[10px] font-semibold" style={{ color: OFERTA_COLORS.textSoft }}>total</div>
          ) : null}
        </div>
      </div>

      {/* Desglose: colapso SUAVE con grid-template-rows (0fr↔1fr) + opacidad —
          mismo patrón que las otras cards. Siempre montado, solo se anima el alto,
          así agregar el primer accesorio no "salta". */}
      <div
        className="grid transition-all duration-300 ease-out"
        style={{
          gridTemplateRows: mostrarDesglose ? '1fr' : '0fr',
          opacity: mostrarDesglose ? 1 : 0,
          marginTop: mostrarDesglose ? '0.75rem' : 0,
        }}
      >
        <div className="overflow-hidden border-t pt-2.5" style={{ borderColor: OFERTA_COLORS.border }}>
          <ul className="space-y-1.5">
            <li className="flex items-center justify-between text-[12.5px]" style={{ color: OFERTA_COLORS.textMid }}>
              <span>Equipo</span>
              <span className="shrink-0 font-medium" style={{ color: OFERTA_COLORS.textStrong }}>
                S/{cuotaFormateada}/mes
              </span>
            </li>
            {(extras ?? []).map((item, idx) => (
              <li key={`${item.label}-${idx}`} className="flex items-center justify-between text-[12.5px]" style={{ color: OFERTA_COLORS.textMid }}>
                <span className="min-w-0">{item.label}</span>
                <span className="shrink-0 font-medium" style={{ color: OFERTA_COLORS.textStrong }}>
                  +S/{Math.round(item.monthly).toLocaleString('es-PE')}/mes
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2.5 flex items-center justify-between border-t pt-2.5" style={{ borderColor: OFERTA_COLORS.border }}>
            <span className="text-[13.5px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
              Total
            </span>
            <span className="text-[16px] font-extrabold" style={{ color: OFERTA_COLORS.primary }}>
              S/{totalFormateado}/mes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
