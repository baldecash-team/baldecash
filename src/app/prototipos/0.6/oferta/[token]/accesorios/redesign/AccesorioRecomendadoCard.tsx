/**
 * AccesorioRecomendadoCard — card grande destacada del accesorio recomendado
 * (BAL-2185).
 *
 * Copiado 1:1 de la card "RECOMENDADO PARA TI" del mock
 * (docs/superpowers/design-refs/mock-accesorios.html, frames 1/2): label
 * teal, foto placeholder, nombre + descripción, cuota en `primary` y un
 * círculo de radio a la derecha (vacío si no seleccionado, relleno con check
 * si seleccionado). El borde cambia de `border` a `primary` al seleccionar.
 *
 * Puramente presentacional: props → UI, sin fetch ni lógica de selección
 * (el toggle lo conecta quien ensambla la página, Task 9).
 */
import type { ReactNode } from 'react';

import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';
import type { Accessory } from '../../../../[landing]/solicitar/types/upsell';

export interface AccesorioRecomendadoCardProps {
  accesorio: Accessory;
  seleccionado: boolean;
  onToggle: () => void;
}

function CheckIcon(): ReactNode {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AccesorioRecomendadoCard({ accesorio, seleccionado, onToggle }: AccesorioRecomendadoCardProps) {
  const cuotaFormateada = Math.round(accesorio.monthlyQuota).toLocaleString('es-PE');

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full cursor-pointer overflow-hidden rounded-[20px] border-[1.5px] p-[15px] text-left transition-shadow"
      style={{
        borderColor: seleccionado ? OFERTA_COLORS.primary : OFERTA_COLORS.border,
        boxShadow: seleccionado ? '0 10px 24px rgba(79,70,229,.16)' : '0 4px 14px rgba(31,35,51,.05)',
        background: '#fff',
      }}
    >
      <div
        className="mb-2.5 text-[10px] font-bold tracking-[.09em]"
        style={{ color: OFERTA_COLORS.tealBrand }}
      >
        {seleccionado ? 'RECOMENDADO' : 'RECOMENDADO PARA TI'}
      </div>

      <div className="flex items-start gap-3">
        <div
          className="flex h-[70px] w-[86px] flex-none items-center justify-center rounded-2xl border"
          style={{
            borderColor: OFERTA_COLORS.border,
            background: accesorio.image
              ? undefined
              : 'repeating-linear-gradient(135deg, #F1F2F7 0 7px, #E9EBF2 7px 14px)',
          }}
        >
          {accesorio.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={accesorio.image} alt={accesorio.name} className="h-full w-full rounded-2xl object-contain" />
          ) : (
            <span className="font-mono text-[8px]" style={{ color: OFERTA_COLORS.textSoft }}>
              foto
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-['Baloo_2',_sans-serif] text-[17px] font-bold leading-[1.15]" style={{ color: OFERTA_COLORS.textStrong }}>
            {accesorio.name}
          </div>
          {accesorio.description ? (
            <div className="mt-1 text-[12px]" style={{ color: OFERTA_COLORS.textMid }}>
              {accesorio.description}
            </div>
          ) : null}
          <div className="mt-2 font-['Baloo_2',_sans-serif] text-[15px] font-bold" style={{ color: OFERTA_COLORS.primary }}>
            +S/{cuotaFormateada}/mes
          </div>
        </div>

        <div
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 transition-colors"
          style={{
            borderColor: seleccionado ? OFERTA_COLORS.primary : '#D9DCE6',
            backgroundColor: seleccionado ? OFERTA_COLORS.primary : 'transparent',
          }}
        >
          {seleccionado ? <CheckIcon /> : null}
        </div>
      </div>
    </button>
  );
}
