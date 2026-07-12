/**
 * CuotaStickyBar — barra inferior fija con la cuota total y el CTA de
 * continuar (BAL-2185).
 *
 * Copiado 1:1 del BOTTOM BAR del mock
 * (docs/superpowers/design-refs/mock-accesorios.html, frames 1/2/3): fondo
 * blanco, borde superior `border`, shadow suave. Izquierda: label
 * "Cuota mensual total" + monto grande en `primary`. Derecha: botón CTA.
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica de negocio (el
 * cálculo del total y la navegación del CTA los conecta quien ensambla la
 * página, Task 9).
 */
import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';

export interface CuotaStickyBarProps {
  total: number;
  onContinuar: () => void;
  label?: string;
  ctaText?: string;
}

export function CuotaStickyBar({ total, onContinuar, label, ctaText }: CuotaStickyBarProps) {
  const totalFormateado = Math.round(total).toLocaleString('es-PE');

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t bg-white px-5 py-4"
      style={{ borderColor: OFERTA_COLORS.border, boxShadow: '0 -6px 18px rgba(31,35,51,.06)' }}
    >
      <div>
        <div className="text-[11px]" style={{ color: OFERTA_COLORS.textSoft }}>
          {label ?? 'Cuota mensual total'}
        </div>
        <div
          className="font-['Baloo_2',_sans-serif] text-[22px] font-extrabold leading-[1.1]"
          style={{ color: OFERTA_COLORS.primary }}
        >
          S/{totalFormateado}/mes
        </div>
      </div>
      <button
        type="button"
        onClick={onContinuar}
        className="cursor-pointer rounded-lg px-[30px] py-[14px] text-[15px] font-bold text-white transition-transform hover:brightness-95"
        style={{ backgroundColor: OFERTA_COLORS.primary, boxShadow: '0 6px 14px rgba(79,70,229,.35)' }}
      >
        {ctaText ?? 'Continuar'}
      </button>
    </div>
  );
}
