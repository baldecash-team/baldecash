/**
 * CardCambiarEquipo — card "Mejora tu equipo" del upsell (Caso 5). Formato
 * HORIZONTAL compacto: ícono/placeholder a la izquierda + texto a la derecha +
 * CTA. Lleva a "Ver catálogo".
 *
 * Imagen: por ahora un placeholder genérico (ícono de laptop) — el equipo
 * destacado se muestra en su propia card "Oferta personalizada". Si llega
 * `imagen`, se usa.
 *
 * Puramente presentacional.
 */
import { ArrowRight, Sparkles } from 'lucide-react';

import { OFERTA_COLORS } from './ofertaTheme';

export interface CardCambiarEquipoProps {
  /** Monto mensual aprobado (para "Hasta S/X/mes"). */
  montoAprobado: number;
  /** Nº de equipos elegibles en el catálogo. Opcional (dato dinámico). */
  equiposCount?: number | null;
  /** Imagen del equipo destacado. Si falta, se usa el placeholder genérico. */
  imagen?: string | null;
  onVerCatalogo: () => void;
}

export function CardCambiarEquipo({ montoAprobado, equiposCount, imagen, onVerCatalogo }: CardCambiarEquipoProps) {
  const fmt = (n: number) => Math.round(n).toLocaleString('es-PE');
  const subtitulo = equiposCount && equiposCount > 0
    ? `Explora ${equiposCount} equipos aprobados para ti`
    : 'Explora otros equipos de nuestro catálogo';

  return (
    <button
      type="button"
      onClick={onVerCatalogo}
      className="group flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border-[1.5px] bg-white p-3.5 text-left transition-all duration-200 ease-out hover:shadow-md active:scale-[.99]"
      style={{ borderColor: OFERTA_COLORS.primary + '55', boxShadow: '0 4px 14px rgba(79,70,229,.08)' }}
    >
      {/* Ícono (izquierda) en cuadro lila */}
      <div
        className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-xl"
        style={{ background: imagen ? '#fff' : OFERTA_COLORS.lilac, border: imagen ? `1px solid ${OFERTA_COLORS.border}` : 'none' }}
      >
        {imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagen} alt="" className="h-full w-full object-contain p-1" />
        ) : (
          <Sparkles className="h-6 w-6" strokeWidth={2} style={{ color: OFERTA_COLORS.primary }} />
        )}
      </div>

      {/* Info (centro) */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-['Baloo_2',_sans-serif] text-[15px] font-bold leading-tight" style={{ color: OFERTA_COLORS.textStrong }}>
            Mejora tu equipo
          </span>
        </div>
        <div className="mt-0.5 text-[12.5px] leading-snug" style={{ color: OFERTA_COLORS.textMid }}>
          {subtitulo}
        </div>
        <div className="mt-1 text-[12px]" style={{ color: OFERTA_COLORS.textSoft }}>
          Hasta{' '}
          <span className="font-bold" style={{ color: OFERTA_COLORS.primary }}>S/{fmt(montoAprobado)}/mes</span>
          {' '}· ya estás aprobado
        </div>
      </div>

      {/* CTA "Ver catálogo" (derecha) */}
      <span
        className="flex flex-none items-center gap-1.5 rounded-lg px-3.5 py-2.5 font-['Baloo_2',_sans-serif] text-[12.5px] font-bold text-white transition-transform group-hover:brightness-95"
        style={{ backgroundColor: OFERTA_COLORS.primary }}
      >
        Ver catálogo
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
    </button>
  );
}
