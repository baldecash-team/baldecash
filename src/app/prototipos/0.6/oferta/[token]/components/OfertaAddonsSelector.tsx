'use client';

/**
 * OfertaAddonsSelector — accesorios y seguros que el cliente puede agregar a su
 * oferta (BAL-2064). Solo se muestran los que caben en el "threshold restante"
 * (cuota máxima aprobada − cuota del equipo elegido − ya seleccionados).
 *
 * NO se le muestra al cliente el tope ni el "restante" como número técnico; se
 * comunica como "puedes agregar" y los que no caben simplemente no aparecen.
 */
import { useCallback, useEffect, useState } from 'react';
import { Check, Package, ShieldCheck, Plus } from 'lucide-react';

import { getOfferAddons, type OfferAddon } from '../../../services/offerApi';

interface Props {
  token: string;
  variantId: number;
  /** Notifica al padre la selección actual (para enviarla en el select). */
  onChange: (sel: { accessoryIds: number[]; insuranceIds: number[] }) => void;
  /** compact: layout ajustado para vivir dentro del modal de confirmación
   *  (sin la card externa ni el ancho max-w-5xl; 1 columna). */
  compact?: boolean;
}

export function OfertaAddonsSelector({ token, variantId, onChange, compact = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [accessories, setAccessories] = useState<OfferAddon[]>([]);
  const [insurances, setInsurances] = useState<OfferAddon[]>([]);
  const [selectedAcc, setSelectedAcc] = useState<number[]>([]);
  const [selectedIns, setSelectedIns] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);

  // Cuántos accesorios mostrar de entrada (el resto tras "Ver más"). Los seguros
  // siempre se muestran (son pocos e importantes). En el popup, menos.
  const ACC_LIMIT = compact ? 6 : 9;

  // Recarga los disponibles cuando cambia la selección (el restante se reduce).
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOfferAddons(token, variantId, {
        accessoryIds: selectedAcc,
        insuranceIds: selectedIns,
      });
      setAccessories(res.accessories);
      setInsurances(res.insurances);
    } catch {
      setAccessories([]);
      setInsurances([]);
    } finally {
      setLoading(false);
    }
  }, [token, variantId, selectedAcc, selectedIns]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    onChange({ accessoryIds: selectedAcc, insuranceIds: selectedIns });
  }, [selectedAcc, selectedIns, onChange]);

  const toggle = (addon: OfferAddon) => {
    if (addon.kind === 'accessory') {
      setSelectedAcc((prev) =>
        prev.includes(addon.id) ? prev.filter((x) => x !== addon.id) : [...prev, addon.id],
      );
    } else {
      setSelectedIns((prev) =>
        prev.includes(addon.id) ? prev.filter((x) => x !== addon.id) : [...prev, addon.id],
      );
    }
  };

  const isSelected = (a: OfferAddon) =>
    a.kind === 'accessory' ? selectedAcc.includes(a.id) : selectedIns.includes(a.id);

  // Lista combinada: los seleccionados quedan aunque el reload no los devuelva
  // (el backend los excluye de "disponibles" al estar elegidos).
  const selectedAll = [...accessories, ...insurances].filter((a) => isSelected(a));
  // Seguros siempre visibles; accesorios limitados hasta "Ver más".
  const accShown = showAll ? accessories : accessories.slice(0, ACC_LIMIT);
  const hiddenCount = accessories.length - accShown.length;
  const available = [...insurances, ...accShown];

  const totalDisponibles = accessories.length + insurances.length;
  const hayNada = !loading && totalDisponibles === 0 && selectedAll.length === 0;
  if (hayNada) return null; // el equipo consume todo el tope → sin accesorios

  const inner = (
    <>
      <div className={compact ? 'mb-2 flex items-center gap-2' : 'mb-4 flex items-center gap-2.5'}>
        <Package className={compact ? 'h-4 w-4' : 'h-5 w-5'} style={{ color: 'var(--color-primary)' }} />
        <h2 className={`font-['Baloo_2',_sans-serif] font-bold text-[var(--text-strong,#111827)] ${compact ? 'text-sm' : 'text-lg'}`}>
          Suma más a tu equipo
        </h2>
      </div>
      <p className={`text-gray-500 ${compact ? 'mb-3 text-xs' : 'mb-5 text-sm'}`}>
        Agrega accesorios y protección; solo mostramos lo que entra en tu cuota.
      </p>

      <div className={compact ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
        {available.map((a) => {
            const sel = isSelected(a);
            return (
              <button
                key={`${a.kind}-${a.id}`}
                type="button"
                onClick={() => toggle(a)}
                className={`relative cursor-pointer rounded-xl border text-left transition-colors ${
                  compact ? 'flex flex-col p-2.5' : 'flex items-center gap-3 p-3'
                } ${
                  sel
                    ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {/* Check en la esquina (modo compact) */}
                {compact ? (
                  <div
                    className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      sel ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {sel ? <Check className="h-3 w-3 text-white" strokeWidth={3} /> : <Plus className="h-3 w-3 text-gray-400" />}
                  </div>
                ) : null}

                <div className={`flex shrink-0 items-center justify-center rounded-lg bg-gray-50 ${compact ? 'mb-2 h-14 w-full' : 'h-12 w-12'}`}>
                  {a.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.imageUrl} alt={a.name} className={compact ? 'h-12 w-auto object-contain' : 'h-10 w-10 object-contain'} />
                  ) : a.kind === 'insurance' ? (
                    <ShieldCheck className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Package className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-[var(--text-strong,#111827)] ${compact ? 'line-clamp-2 pr-6 text-xs leading-tight' : 'truncate text-sm'}`}>
                    {a.name}
                  </p>
                  <p className={`text-gray-500 ${compact ? 'mt-0.5 text-xs font-medium' : 'text-xs'}`}
                     style={compact ? { color: 'var(--color-primary)' } : undefined}>
                    + S/{Math.round(a.monthly)}/mes
                  </p>
                </div>

                {/* Check al lado (modo normal) */}
                {!compact ? (
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      sel ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300'
                    }`}
                  >
                    {sel ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /> : <Plus className="h-3.5 w-3.5 text-gray-400" />}
                  </div>
                ) : null}
              </button>
            );
          })}
      </div>

      {/* Ver más / ver menos accesorios (no saturar el popup). */}
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 w-full cursor-pointer rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          Ver {hiddenCount} accesorio{hiddenCount === 1 ? '' : 's'} más
        </button>
      ) : showAll && accessories.length > ACC_LIMIT ? (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="mt-3 w-full cursor-pointer rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          Ver menos
        </button>
      ) : null}

      {loading ? (
        <p className="mt-3 text-center text-xs text-gray-400">Actualizando opciones…</p>
      ) : null}
    </>
  );

  // Compact: sin card/section externa (vive dentro del modal de confirmación).
  if (compact) return <div>{inner}</div>;

  return (
    <section className="mx-auto mt-8 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">{inner}</div>
    </section>
  );
}
