'use client';

/**
 * BuscadorBottomSheet — "Suma más accesorios": buscador con chips de categoría
 * y grid de accesorios (BAL-2185). Responsive (BAL-2212): bottom sheet en
 * mobile, <Modal> NextUI centrado en desktop — mismo patrón que los drawers de
 * detalle (AccessoryDetailModal) y el modal de confirmación.
 *
 * Copiado del frame 3 del mock
 * (docs/superpowers/design-refs/mock-accesorios.html): header morado con
 * drag-handle, buscador de texto, chips de categoría scrollables, grid 2-col de
 * <AccesorioGridCard>, cuota + CTA "Listo".
 *
 * Puramente presentacional + filtrado local (texto/categoría): la selección
 * real (toggle) y el fetch de datos viven en AccesoriosOfertaClient.
 */
import { useMemo, useState } from 'react';
import { Modal, ModalContent } from '@nextui-org/react';
import { Search, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useIsMobile } from '@/app/prototipos/_shared';

import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';
import type { Accessory, AccessoryCategory } from '../../../../[landing]/solicitar/types/upsell';
import { AccesorioGridCard } from './AccesorioGridCard';
import { CuotaStickyBar } from './CuotaStickyBar';

/** Morado del header (mismo hex que los demás drawers; la var CSS no resuelve
 *  confiable en portales). */
const HEADER_INDIGO = '#4654CD';

export interface BuscadorBottomSheetProps {
  accesorios: Accessory[];
  seleccionadosAcc: string[];
  onToggleAcc: (a: Accessory) => void;
  onVerDetalle: (a: Accessory) => void;
  total: number;
  onCerrar: () => void;
  onListo: () => void;
  accFits?: (a: Accessory) => boolean;
}

/** Contenido compartido entre la presentación modal (desktop) y drawer (mobile):
 *  header morado + buscador + chips + grid + barra de cuota. `scrollClassName`
 *  deja que el caller decida dónde vive el scroll (drawer: flex-1). */
function BuscadorContenido({
  accesorios,
  seleccionadosAcc,
  onToggleAcc,
  onVerDetalle,
  total,
  onCerrar,
  onListo,
  accFits,
  scrollClassName,
}: BuscadorBottomSheetProps & { scrollClassName: string }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('todos');

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

  return (
    <>
      {/* Header morado estándar (pt-4 pb-[22px], ícono + título + descripción + X) */}
      <div className="flex flex-none items-center gap-3 px-5 pb-[22px] pt-4" style={{ backgroundColor: HEADER_INDIGO }}>
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/[0.16]">
          <ShoppingBag className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-['Baloo_2',_sans-serif] text-[18px] font-bold leading-tight text-white">
            Suma más accesorios
          </h2>
          <p className="text-[12.5px] leading-snug text-white/85">Personaliza tu equipo con lo que necesitas</p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* pb-10 separa la última fila de cards del footer "Listo" (aplica a drawer
          mobile y modal desktop, ya que el contenido es compartido). */}
      <div className={`${scrollClassName} px-5 pb-10 pt-4`}>
        {/* Buscador */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: OFERTA_COLORS.textSoft }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca accesorios"
            className="w-full rounded-lg border py-3 pl-10 pr-3.5 text-sm outline-none"
            style={{ borderColor: OFERTA_COLORS.border, backgroundColor: OFERTA_COLORS.grayBg, color: OFERTA_COLORS.textStrong }}
          />
        </div>

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
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
      </div>

      {/* Barra de cuota + CTA "Listo" (footer fijo). CuotaStickyBar es
          `absolute bottom-0`, así que NO ocupa espacio en el flex → sin una
          altura propia colapsaría a 0 y taparía la última fila de cards. El
          wrapper reserva ese alto (~78px) para que la barra quede como footer
          real debajo del contenido. */}
      <div className="relative h-[78px] flex-none">
        <CuotaStickyBar total={total} onContinuar={onListo} ctaText="Listo" />
      </div>
    </>
  );
}

export function BuscadorBottomSheet(props: BuscadorBottomSheetProps) {
  const isMobile = useIsMobile();
  const dragControls = useDragControls();
  const { onCerrar } = props;

  // --- MOBILE: bottom sheet (mismo patrón que los demás drawers) ---
  if (isMobile) {
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
          className="fixed bottom-0 left-0 right-0 z-[9999] flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl bg-white"
          style={{ overscrollBehavior: 'contain', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Drag handle (franja morada) */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="flex flex-none cursor-grab justify-center pt-3 pb-1 active:cursor-grabbing"
            style={{ backgroundColor: HEADER_INDIGO }}
          >
            <div className="h-1 w-10 rounded-full bg-white/40" />
          </div>
          <BuscadorContenido {...props} scrollClassName="flex-1 overflow-y-auto" />
        </motion.div>
      </>
    );
  }

  // --- DESKTOP: modal centrado (mismo patrón que los demás drawers) ---
  return (
    <Modal
      isOpen
      onClose={onCerrar}
      placement="center"
      size="2xl"
      scrollBehavior="inside"
      hideCloseButton
      backdrop="opaque"
      classNames={{
        wrapper: 'z-[9999]',
        backdrop: 'z-[9998] bg-black/50',
        base: 'bg-white rounded-2xl overflow-hidden max-h-[90vh] my-auto',
        body: 'bg-white p-0',
      }}
    >
      <ModalContent className="flex max-h-[90vh] flex-col overflow-hidden">
        <BuscadorContenido {...props} scrollClassName="flex-1 overflow-y-auto" />
      </ModalContent>
    </Modal>
  );
}
