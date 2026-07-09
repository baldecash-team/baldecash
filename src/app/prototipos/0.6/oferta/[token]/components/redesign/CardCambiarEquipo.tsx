/**
 * CardCambiarEquipo — card protagonista del upsell "Cambiar equipo" (feedback
 * reunión Marco, mock frame 2). Collage de equipos + tag "Mejora tu equipo" +
 * "Accesorios incluidos", copy "Elige entre XX equipos... ¡Ya estás aprobado!",
 * monto "Hasta S/X/mes" y botón "Ver catálogo".
 *
 * El collage usa placeholders con degradado hasta tener las imágenes reales
 * (BAL-2198, Haru→Antonio). El conteo de equipos es opcional: si no viene, el
 * copy cae a una versión sin número.
 *
 * Puramente presentacional.
 */
import { ArrowRight, Check } from 'lucide-react';

import { OFERTA_COLORS } from './ofertaTheme';

export interface CardCambiarEquipoProps {
  /** Monto mensual aprobado (para "Hasta S/X/mes"). */
  montoAprobado: number;
  /** Nº de equipos elegibles en el catálogo. Opcional (dato dinámico). */
  equiposCount?: number | null;
  /** Imágenes de equipos para el collage (0-3). Si faltan, usa placeholders. */
  imagenes?: (string | null | undefined)[];
  onVerCatalogo: () => void;
}

const COLLAGE_BG = [
  'repeating-linear-gradient(135deg,#EEF1FF 0 8px,#E4E9FF 8px 16px)',
  'repeating-linear-gradient(135deg,#F1F2F7 0 8px,#E9EBF2 8px 16px)',
  'repeating-linear-gradient(135deg,#E7FBF8 0 8px,#D5F5F0 8px 16px)',
];

export function CardCambiarEquipo({ montoAprobado, equiposCount, imagenes = [], onVerCatalogo }: CardCambiarEquipoProps) {
  const fmt = (n: number) => Math.round(n).toLocaleString('es-PE');
  const copy = equiposCount && equiposCount > 0
    ? `Elige entre ${equiposCount} equipos en nuestro catálogo. ¡Ya estás aprobado para cualquiera de ellos!`
    : 'Elige entre los equipos de nuestro catálogo. ¡Ya estás aprobado para cualquiera de ellos!';

  return (
    <button
      type="button"
      onClick={onVerCatalogo}
      className="w-full cursor-pointer overflow-hidden rounded-xl border-[1.5px] text-left transition-shadow hover:shadow-lg"
      style={{ borderColor: OFERTA_COLORS.primary, boxShadow: '0 10px 24px rgba(79,70,229,.14)' }}
    >
      {/* Collage de 3 equipos + tags */}
      <div className="relative grid h-[112px] grid-cols-3 gap-0.5" style={{ backgroundColor: OFERTA_COLORS.border }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-center overflow-hidden bg-white"
            style={{ background: imagenes[i] ? '#fff' : COLLAGE_BG[i] }}
          >
            {imagenes[i] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagenes[i] as string} alt="" className="h-full w-full object-contain" />
            ) : null}
          </div>
        ))}
        <span
          className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 font-['Baloo_2',_sans-serif] text-[10px] font-bold tracking-[.04em] text-white"
          style={{ backgroundColor: OFERTA_COLORS.primary }}
        >
          Mejora tu equipo
        </span>
        <span
          className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold"
          style={{ backgroundColor: 'rgba(255,255,255,.94)', color: OFERTA_COLORS.greenDark }}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
          Accesorios incluidos
        </span>
      </div>

      <div className="p-3.5">
        <div className="font-['Baloo_2',_sans-serif] text-[17px] font-bold leading-[1.1]" style={{ color: OFERTA_COLORS.textStrong }}>
          Cambiar equipo
        </div>
        <div className="mt-1.5 text-[12.5px] leading-[1.45]" style={{ color: OFERTA_COLORS.textMid }}>
          {copy}
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: '#F1F2F7' }}>
          <div>
            <div className="text-[11px]" style={{ color: OFERTA_COLORS.textSoft }}>tu monto aprobado</div>
            <div className="font-['Baloo_2',_sans-serif] text-[17px] font-bold leading-[1.1]" style={{ color: OFERTA_COLORS.primary }}>
              Hasta S/{fmt(montoAprobado)}<span className="text-[11px] font-semibold" style={{ color: OFERTA_COLORS.textMid }}>/mes</span>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 font-['Baloo_2',_sans-serif] text-[13px] font-bold text-white"
            style={{ backgroundColor: OFERTA_COLORS.primary }}
          >
            Ver catálogo
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </button>
  );
}
