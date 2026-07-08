/**
 * IncluidosGratisSection — lista de accesorios/seguros incluidos gratis por
 * el combo elegido (BAL-2185).
 *
 * Corresponde a `comboFreeAddons` (getOfferAddonsRich): regalos del combo que
 * no cuentan en la cuota y no se pueden quitar, por eso no llevan botón de
 * acción (a diferencia de TusExtras). Ícono de regalo verde + nombre +
 * "Gratis" en verde.
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica. Si ambos
 * arrays vienen vacíos, no renderiza nada (ni el título de la sección).
 */
import { Gift } from 'lucide-react';

import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';

export interface IncluidosGratisSectionProps {
  accesorios: { id: string; name: string }[];
  seguros: { id: string; name: string }[];
}

export function IncluidosGratisSection({ accesorios, seguros }: IncluidosGratisSectionProps) {
  if (accesorios.length === 0 && seguros.length === 0) return null;

  return (
    <div>
      <h2 className="font-['Baloo_2',_sans-serif] text-[15px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
        Incluidos gratis
      </h2>
      <div className="mt-2.5 space-y-2">
        {accesorios.map((a) => (
          <div
            key={`gratis-acc-${a.id}`}
            className="flex items-center gap-3 rounded-xl border px-3.5 py-3"
            style={{ borderColor: OFERTA_COLORS.border }}
          >
            <div
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full"
              style={{ backgroundColor: OFERTA_COLORS.greenSoft }}
            >
              <Gift className="h-[18px] w-[18px]" strokeWidth={2.2} style={{ color: OFERTA_COLORS.greenDark }} />
            </div>
            <div className="min-w-0 flex-1 truncate font-['Baloo_2',_sans-serif] text-[14px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
              {a.name}
            </div>
            <div className="flex-none text-[13px] font-bold" style={{ color: OFERTA_COLORS.greenDark }}>
              Gratis
            </div>
          </div>
        ))}
        {seguros.map((s) => (
          <div
            key={`gratis-ins-${s.id}`}
            className="flex items-center gap-3 rounded-xl border px-3.5 py-3"
            style={{ borderColor: OFERTA_COLORS.border }}
          >
            <div
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full"
              style={{ backgroundColor: OFERTA_COLORS.greenSoft }}
            >
              <Gift className="h-[18px] w-[18px]" strokeWidth={2.2} style={{ color: OFERTA_COLORS.greenDark }} />
            </div>
            <div className="min-w-0 flex-1 truncate font-['Baloo_2',_sans-serif] text-[14px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
              {s.name}
            </div>
            <div className="flex-none text-[13px] font-bold" style={{ color: OFERTA_COLORS.greenDark }}>
              Gratis
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
