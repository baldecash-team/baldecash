'use client';

/**
 * AccesorioDetalleModal (WEB-07) — la ficha del accesorio dentro del link.
 *
 * La lista de "Puedes agregar" muestra el nombre en una línea y una foto de
 * 44px: con eso el cliente no sabe qué está marcando. Acá la imagen va en
 * grande, con la descripción del catálogo, el precio al contado y lo que suma
 * a la cuota, y la decisión se puede tomar desde el propio modal.
 *
 * Overlay propio (mismo patrón que `GaleriaUnidad`) y no NextUI: el flujo de la
 * oferta ya pinta sus propias superficies y así el modal hereda los tokens de
 * `ofertaTheme` sin pelear con el tema del componente.
 */
import { useEffect, useRef } from 'react';
import { Package, X } from 'lucide-react';

import type { StandardOfferAddon } from '../../../services/offerApi';
import { OFERTA_COLORS } from './redesign/ofertaTheme';

export function AccesorioDetalleModal({
  addon,
  incluido,
  sufijoCuota,
  mostrarMontos,
  onToggle,
  onCerrar,
}: {
  addon: StandardOfferAddon;
  /** Si ya está marcado para sumarse a la cuota. */
  incluido: boolean;
  /** '/mes', '/sem', '/quinc' — la frecuencia real de la oferta. */
  sufijoCuota: string;
  /** Con otra combinación de plazo/inicial el desglose por ítem ya no
   *  corresponde: se listan igual, pero sin un `+S/x` que sería falso. */
  mostrarMontos: boolean;
  onToggle: () => void;
  onCerrar: () => void;
}) {
  const dialogoRef = useRef<HTMLDivElement>(null);

  // Escape cierra, y el foco aterriza en el diálogo: quien navega por teclado
  // no queda tabulando la lista de atrás.
  useEffect(() => {
    dialogoRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCerrar]);

  return (
    <>
      <div
        onClick={onCerrar}
        aria-hidden="true"
        className="fixed inset-0 z-[9998] bg-[rgba(10,12,30,.5)]"
      />

      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${addon.name}`}
        tabIndex={-1}
        className="fixed bottom-0 left-1/2 z-[9999] flex max-h-[92vh] w-full max-w-[440px] -translate-x-1/2 flex-col overflow-y-auto rounded-t-[22px] bg-white focus:outline-none md:bottom-auto md:top-1/2 md:max-h-[88vh] md:-translate-y-1/2 md:rounded-[22px]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b bg-white px-5 pb-3 pt-[18px]"
             style={{ borderColor: OFERTA_COLORS.border }}>
          <h2 className="text-[17px] font-extrabold" style={{ color: OFERTA_COLORS.textStrong }}>
            {addon.name}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full"
            style={{ backgroundColor: OFERTA_COLORS.grayBg, color: OFERTA_COLORS.textMid }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3.5 px-5 py-4">
          <div
            className="flex h-52 items-center justify-center overflow-hidden rounded-2xl"
            style={{ backgroundColor: OFERTA_COLORS.grayBg }}
          >
            {addon.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={addon.imageUrl} alt={addon.name} className="h-full w-full object-contain" />
            ) : (
              <Package className="h-12 w-12" style={{ color: OFERTA_COLORS.textSoft }} />
            )}
          </div>

          <p className="text-[13.5px] leading-[1.5]" style={{ color: OFERTA_COLORS.textMid }}>
            {/* Sin descripción cargada no se inventa una: se dice que falta, que
                es información honesta y le avisa al catálogo que la debe. */}
            {addon.description || 'Sin descripción disponible para este accesorio.'}
          </p>

          <dl className="rounded-xl border" style={{ borderColor: OFERTA_COLORS.border }}>
            {addon.price > 0 ? (
              <div className="flex items-baseline justify-between px-3.5 py-2.5">
                <dt className="text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>Precio al contado</dt>
                <dd className="text-[14px] font-semibold" style={{ color: OFERTA_COLORS.textStrong }}>
                  S/{Math.round(addon.price).toLocaleString('es-PE')}
                </dd>
              </div>
            ) : null}
            {addon.includedFree ? (
              <div className="flex items-baseline justify-between border-t px-3.5 py-2.5"
                   style={{ borderColor: OFERTA_COLORS.border }}>
                <dt className="text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>En tu cuota</dt>
                <dd className="text-[14px] font-bold" style={{ color: OFERTA_COLORS.greenDark }}>
                  Incluido gratis
                </dd>
              </div>
            ) : mostrarMontos ? (
              <div className="flex items-baseline justify-between border-t px-3.5 py-2.5"
                   style={{ borderColor: OFERTA_COLORS.border }}>
                <dt className="text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>Suma a tu cuota</dt>
                <dd className="text-[14px] font-bold" style={{ color: OFERTA_COLORS.primary }}>
                  +S/{Math.round(addon.monthlyDelta)}{sufijoCuota}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        {/* El regalo del combo no se decide: viene atado al combo. */}
        {addon.includedFree ? null : (
          <div className="sticky bottom-0 border-t bg-white px-5 py-3.5"
               style={{ borderColor: OFERTA_COLORS.border }}>
            <button
              type="button"
              onClick={onToggle}
              className="w-full cursor-pointer rounded-lg px-5 py-3 text-[15px] font-bold transition-transform active:scale-[.99]"
              style={
                incluido
                  ? { border: `1px solid ${OFERTA_COLORS.border}`, color: OFERTA_COLORS.textMid }
                  : { backgroundColor: OFERTA_COLORS.primary, color: '#fff' }
              }
            >
              {incluido ? 'Quitar de mi cuota' : 'Agregar a mi cuota'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
