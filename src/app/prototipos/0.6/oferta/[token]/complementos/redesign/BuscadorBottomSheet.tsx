'use client';

/**
 * BuscadorBottomSheet — bottom sheet "Añadir al pedido" con buscador, chips
 * de categoría, grid de accesorios y seguros (BAL-2185).
 *
 * Copiado 1:1 del frame 3 del mock
 * (docs/superpowers/design-refs/mock-accesorios.html): backdrop oscuro,
 * hoja inferior con drag-handle, buscador de texto, chips de categoría
 * scrollables, grid 2-col de <AccesorioGridCard>, sección "Seguros" con
 * badge Insurama y <SeguroCard>, cuota sticky con CTA "Listo".
 *
 * Filtro segmentado "Accesorios | Seguros" (feedback Marco, frame 4 de
 * docs/superpowers/design-refs/mock-feedback-reunion.html): en vez de
 * mostrar seguros como sección aparte al final, dos pestañas arriba
 * cambian qué contenido se ve. Es solo presentación — el estado de la
 * pestaña activa es local y no toca la lógica de selección/fetch.
 *
 * Puramente presentacional + filtrado local (texto/categoría): la selección
 * real (toggle) y el fetch de datos viven en AccesoriosOfertaClient (Task 9).
 */
import { useMemo, useRef, useState } from 'react';
import { Search, X, ShieldCheck } from 'lucide-react';
import { motion, useDragControls } from 'framer-motion';

import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';
import type { Accessory, AccessoryCategory, InsurancePlan } from '../../../../[landing]/solicitar/types/upsell';
import { AccesorioGridCard } from './AccesorioGridCard';
import { SeguroCard } from './SeguroCard';
import { CuotaStickyBar } from './CuotaStickyBar';

export interface BuscadorBottomSheetProps {
  accesorios: Accessory[];
  seguros: InsurancePlan[];
  seleccionadosAcc: string[];
  seleccionadosIns: string[];
  onToggleAcc: (a: Accessory) => void;
  onToggleIns: (planId: string) => void;
  onVerDetalle: (a: Accessory) => void;
  onVerDetalleSeguro: (p: InsurancePlan) => void;
  total: number;
  onCerrar: () => void;
  onListo: () => void;
  accFits?: (a: Accessory) => boolean;
  insFits?: (p: InsurancePlan) => boolean;
}

export function BuscadorBottomSheet({
  accesorios,
  seguros,
  seleccionadosAcc,
  seleccionadosIns,
  onToggleAcc,
  onToggleIns,
  onVerDetalle,
  onVerDetalleSeguro,
  total,
  onCerrar,
  onListo,
  accFits,
  insFits,
}: BuscadorBottomSheetProps) {
  const dragControls = useDragControls();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const sheetScrollRef = useRef<HTMLDivElement>(null);
  // Pestaña activa del filtro segmentado (feedback Marco): "acc" | "ins".
  const [activeTab, setActiveTab] = useState<'acc' | 'ins'>('acc');

  // Categorías únicas derivadas de los accesorios disponibles (dedupe por slug).
  const categories = useMemo(() => {
    const map = new Map<string, AccessoryCategory>();
    accesorios.forEach((a) => {
      if (a.category && !map.has(a.category.slug)) map.set(a.category.slug, a.category);
    });
    return Array.from(map.values());
  }, [accesorios]);

  const filteredAccesorios = useMemo(() => {
    let filtered = accesorios;
    if (activeCategory !== 'todos') filtered = filtered.filter((a) => a.category?.slug === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [accesorios, activeCategory, query]);

  const filteredSeguros = useMemo(() => {
    if (!query.trim()) return seguros;
    const q = query.toLowerCase().trim();
    return seguros.filter((p) => p.name.toLowerCase().includes(q));
  }, [seguros, query]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="buscador-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCerrar}
        className="fixed inset-0 z-[9998]"
        style={{ backgroundColor: 'rgba(24,26,42,.42)', touchAction: 'none' }}
      />

      {/* Bottom Sheet */}
      <motion.div
        key="buscador-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onCerrar();
        }}
        className="fixed bottom-0 left-0 right-0 z-[9999] flex max-h-[85dvh] flex-col rounded-t-2xl bg-white"
        style={{ overscrollBehavior: 'contain', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Drag handle */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex flex-none cursor-grab justify-center pt-3 pb-1 active:cursor-grabbing"
        >
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>

        {/* Header */}
        <div className="flex flex-none items-center justify-between px-5 pb-3 pt-1">
          <h2 className="font-['Baloo_2',_sans-serif] text-[18px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
            Añadir al pedido
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
            style={{ backgroundColor: '#F1F2F7' }}
          >
            <X className="h-4 w-4" style={{ color: OFERTA_COLORS.textMid }} />
          </button>
        </div>

        <div ref={sheetScrollRef} className="flex-1 overflow-y-auto px-5 pb-28">
          {/* Buscador */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: OFERTA_COLORS.textSoft }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca accesorios o seguros"
              className="w-full rounded-lg border py-3 pl-10 pr-3.5 text-sm outline-none"
              style={{ borderColor: OFERTA_COLORS.border, backgroundColor: OFERTA_COLORS.grayBg, color: OFERTA_COLORS.textStrong }}
            />
          </div>

          {/* Filtro segmentado Accesorios | Seguros (feedback Marco) */}
          <div
            className="mt-3.5 grid grid-cols-2 gap-1 rounded-xl p-1"
            style={{ backgroundColor: OFERTA_COLORS.grayBg, border: `1px solid ${OFERTA_COLORS.border}` }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('acc')}
              className="cursor-pointer rounded-lg py-2 text-[13px] font-bold transition-colors"
              style={
                activeTab === 'acc'
                  ? { backgroundColor: '#fff', color: OFERTA_COLORS.primary, boxShadow: '0 1px 4px rgba(31,35,51,.08)' }
                  : { backgroundColor: 'transparent', color: OFERTA_COLORS.textMid }
              }
            >
              Accesorios
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ins')}
              className="cursor-pointer rounded-lg py-2 text-[13px] font-bold transition-colors"
              style={
                activeTab === 'ins'
                  ? { backgroundColor: '#fff', color: OFERTA_COLORS.primary, boxShadow: '0 1px 4px rgba(31,35,51,.08)' }
                  : { backgroundColor: 'transparent', color: OFERTA_COLORS.textMid }
              }
            >
              Seguros
            </button>
          </div>

          {activeTab === 'acc' ? (
            <>
              {/* Chips de categoría */}
              <div
                className="mt-3.5 flex gap-2 overflow-x-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <button
                  type="button"
                  onClick={() => setActiveCategory('todos')}
                  className="flex-shrink-0 cursor-pointer rounded-full px-3.5 py-[7px] text-[12.5px] font-medium transition-colors"
                  style={
                    activeCategory === 'todos'
                      ? { backgroundColor: OFERTA_COLORS.primary, color: '#fff' }
                      : { backgroundColor: '#F1F2F7', color: OFERTA_COLORS.textMid }
                  }
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setActiveCategory(cat.slug)}
                    className="flex-shrink-0 cursor-pointer rounded-full px-3.5 py-[7px] text-[12.5px] font-medium transition-colors"
                    style={
                      activeCategory === cat.slug
                        ? { backgroundColor: OFERTA_COLORS.primary, color: '#fff' }
                        : { backgroundColor: '#F1F2F7', color: OFERTA_COLORS.textMid }
                    }
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Grid de accesorios */}
              {filteredAccesorios.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {filteredAccesorios.map((a) => {
                    const fits = accFits ? accFits(a) : true;
                    return (
                      <div key={a.id} className={fits ? '' : 'pointer-events-none opacity-45 grayscale'}>
                        <AccesorioGridCard
                          accesorio={a}
                          agregado={seleccionadosAcc.includes(a.id)}
                          onToggle={() => onToggleAcc(a)}
                          onVerDetalle={() => onVerDetalle(a)}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-6 text-center text-sm" style={{ color: OFERTA_COLORS.textSoft }}>
                  No se encontraron accesorios.
                </p>
              )}
            </>
          ) : (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" style={{ color: OFERTA_COLORS.primary }} />
                <h3 className="font-['Baloo_2',_sans-serif] text-[15px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
                  Seguros
                </h3>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold"
                  style={{ backgroundColor: '#E7FBF8', color: OFERTA_COLORS.tealBrand }}
                >
                  Insurama
                </span>
              </div>
              <p className="mt-1.5 text-[12px]" style={{ color: OFERTA_COLORS.textSoft }}>
                Solo mostramos seguros compatibles con tu equipo.
              </p>
              {filteredSeguros.length > 0 ? (
                <div className="mt-3 space-y-2.5">
                  {filteredSeguros.map((p) => {
                    const fits = insFits ? insFits(p) : true;
                    return (
                      <div key={p.id} className={fits ? '' : 'pointer-events-none opacity-45 grayscale'}>
                        <SeguroCard
                          seguro={p}
                          seleccionado={seleccionadosIns.includes(p.id)}
                          onToggle={() => onToggleIns(p.id)}
                          onVerDetalle={() => onVerDetalleSeguro(p)}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-6 text-center text-sm" style={{ color: OFERTA_COLORS.textSoft }}>
                  No se encontraron seguros.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="relative flex-none">
          <CuotaStickyBar total={total} onContinuar={onListo} ctaText="Listo" />
        </div>
      </motion.div>
    </>
  );
}
