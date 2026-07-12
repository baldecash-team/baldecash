/**
 * TusExtras — lista de accesorios/seguros ya agregados por el cliente
 * (BAL-2185).
 *
 * Copiado 1:1 de la sección "Tus extras" del mock
 * (docs/superpowers/design-refs/mock-accesorios.html, frame 2): cada item es
 * una card horizontal con ícono (escudo lila para seguro, foto para
 * accesorio) + nombre + subtítulo/cuota + botón QUITAR (X) redondo.
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica (el onQuitar lo
 * conecta quien ensambla la página, Task 9).
 */
import { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';

export interface TusExtrasItem {
  id: string;
  name: string;
  monthly: number;
  kind: 'acc' | 'ins';
  subtitle?: string;
  imageUrl?: string;
}

export interface TusExtrasProps {
  items: TusExtrasItem[];
  onQuitar: (id: string, kind: 'acc' | 'ins') => void;
}

export function TusExtras({ items, onQuitar }: TusExtrasProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="text-[14px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
        Tus extras
      </h2>
      <div className="mt-2.5 space-y-2">
        {items.map((item) => {
          const cuotaFormateada = Math.round(item.monthly).toLocaleString('es-PE');
          return (
            <div
              key={`${item.kind}-${item.id}`}
              className="flex items-center gap-3 rounded-xl border px-3.5 py-3"
              style={{ borderColor: OFERTA_COLORS.border }}
            >
              {item.kind === 'ins' ? (
                <SeguroExtraIcon imageUrl={item.imageUrl} name={item.name} />
              ) : (
                <div
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border"
                  style={{
                    borderColor: OFERTA_COLORS.border,
                    background: item.imageUrl
                      ? undefined
                      : 'repeating-linear-gradient(135deg, #F1F2F7 0 6px, #E9EBF2 6px 12px)',
                  }}
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded-xl object-contain" />
                  ) : null}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
                  {item.name}
                </div>
                <div className="mt-0.5 text-[12px]" style={{ color: OFERTA_COLORS.textMid }}>
                  {item.subtitle ? (
                    <>
                      {item.subtitle}
                      {' · '}
                    </>
                  ) : null}
                  <span className="font-semibold" style={{ color: OFERTA_COLORS.primary }}>
                    +S/{cuotaFormateada}/mes
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onQuitar(item.id, item.kind)}
                aria-label={`Quitar ${item.name}`}
                className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full border transition-colors hover:bg-neutral-50"
                style={{ borderColor: OFERTA_COLORS.border }}
              >
                <X className="h-4 w-4" strokeWidth={2.2} style={{ color: OFERTA_COLORS.textMid }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Ícono del seguro en "Tus extras": muestra la imagen por tipo de seguro
 * (insurance_category.image_url, BAL-2251) dentro del chip lila; cae al escudo
 * si no hay imagen o si esta falla al cargar. Mismo patrón que SeguroCard y el
 * modal de confirmación.
 */
function SeguroExtraIcon({ imageUrl, name }: { imageUrl?: string; name: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imgFailed;
  return (
    <div
      className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-xl"
      style={{ backgroundColor: OFERTA_COLORS.lilac }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-contain"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <ShieldCheck className="h-5 w-5" strokeWidth={2.1} style={{ color: OFERTA_COLORS.primary }} />
      )}
    </div>
  );
}
