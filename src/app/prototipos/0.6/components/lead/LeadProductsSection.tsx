'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from 'lucide-react';
import { useEventTrackerOptional } from '../../[landing]/solicitar/context/EventTrackerContext';
import type { LeadProductsConfig, LeadCatalogProduct } from '../../types/hero';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

type ProductCategory = 'all' | 'laptop' | 'tablet' | 'celular';

const CATEGORIES: { key: ProductCategory; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'laptop', label: 'Laptops' },
  { key: 'tablet', label: 'Tablets' },
  { key: 'celular', label: 'Celulares' },
];

type SpecItem = { icon: React.ReactNode; label: string };

const IconScreen = () => (
  <svg className="w-3 h-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
  </svg>
);
const IconStorage = () => (
  <svg className="w-3 h-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
  </svg>
);
const IconRam = () => (
  <svg className="w-3 h-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2"/>
  </svg>
);
const IconCpu = () => (
  <svg className="w-3 h-3 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 7V4M12 7V4M15 7V4M9 20v-3M12 20v-3M15 20v-3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3"/>
  </svg>
);

function formatSpecs(specs: LeadCatalogProduct['specs'], type: string): SpecItem[] {
  const parts: SpecItem[] = [];
  if (specs.screen_size) parts.push({ icon: <IconScreen />, label: `${specs.screen_size}"` });
  if (specs.storage) parts.push({ icon: <IconStorage />, label: `${specs.storage}GB ${specs.storage_type || 'SSD'}` });
  if (specs.ram) parts.push({ icon: <IconRam />, label: `${specs.ram}GB RAM` });
  if (specs.processor) parts.push({ icon: <IconCpu />, label: specs.processor });
  return parts.length ? parts : [{ icon: <IconScreen />, label: type }];
}

// ── Card individual ──────────────────────────────────────────────────────────
function OfertaCard({
  product,
  index,
  landing,
  onCtaClick,
}: {
  product: LeadCatalogProduct;
  index: number;
  landing: string;
  onCtaClick?: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  const typeLabel =
    product.type === 'laptop' ? 'Laptop' :
    product.type === 'tablet' ? 'Tablet' : 'Celular';

  const savings = product.list_price > product.final_price
    ? Math.round(product.list_price - product.final_price)
    : 0;

  const specs = formatSpecs(product.specs, product.type);

  const handleCta = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCtaClick) {
      onCtaClick();
    } else {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>('#lead-form'));
      const formEl = candidates.find(el => el.offsetParent !== null) ?? candidates[0];
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const firstInput = formEl.querySelector<HTMLInputElement>('input, select, textarea');
        if (firstInput) setTimeout(() => firstInput.focus(), 400);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.12, ease: 'easeOut' }}
      className="relative"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div
        className="bg-white rounded-[24px] p-5 sm:p-6 cursor-pointer h-full flex flex-col"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
      >
        {/* Header: badge tipo + badge ahorro */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white font-['Asap',_sans-serif]"
            style={{ backgroundColor: '#4654CD' }}
          >
            {typeLabel}
          </span>
          {savings > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white font-['Asap',_sans-serif] bg-green-500">
              Ahorras S/{savings.toLocaleString('es-PE')}
            </span>
          )}
        </div>

        {/* Contenido: texto izq + imagen der */}
        <div className="flex items-start gap-4 flex-1">

          {/* ── Columna izquierda ── */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Nombre */}
            <p className="text-base font-black text-gray-900 leading-tight mb-2 font-['Baloo_2',_sans-serif] line-clamp-2">
              {product.brand} {product.name}
            </p>

            {/* Specs con íconos */}
            <div className="flex flex-col gap-1 mb-4">
              {specs.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {s.icon}
                  <span className="text-[11px] text-gray-400 font-['Asap',_sans-serif]">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Bloque cuota */}
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 font-['Asap',_sans-serif]">
                {product.term_months} cuotas de
              </p>
              <span className="relative inline-block">
                <span
                  className="absolute inset-0 rounded-sm -mx-1"
                  style={{ backgroundColor: '#22c55e', top: '25%', bottom: '5%' }}
                />
                <span className="relative text-[2rem] font-black text-gray-900 leading-none font-['Baloo_2',_sans-serif] px-1">
                  S/ {product.monthly_price.toFixed(0)}
                </span>
              </span>
            </div>

            {/* Precios */}
            <div className="flex flex-col gap-0.5 mt-2">
              <p className="text-[11px] text-gray-400 font-['Asap',_sans-serif]">
                Precio BaldeCash: <span className="font-semibold text-gray-600">S/{product.final_price.toLocaleString('es-PE')}</span>
              </p>
              {product.list_price > product.final_price && (
                <p className="text-[11px] text-gray-300 line-through font-['Asap',_sans-serif]">
                  Precio regular: S/{product.list_price.toLocaleString('es-PE')}
                </p>
              )}
            </div>
          </div>

          {/* ── Imagen derecha ── */}
          <div className="w-28 sm:w-32 flex-shrink-0 flex items-center justify-center self-stretch">
            {product.thumbnail_url && !imgError ? (
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="w-full h-36 object-contain drop-shadow-md"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-36 rounded-xl bg-gray-100 flex items-center justify-center">
                <p className="text-xs font-bold text-gray-300 text-center leading-tight px-2">
                  {product.brand}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-300 font-['Asap',_sans-serif]">Sujeto a aprobación</p>
          <button
            onClick={handleCta}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-white text-xs font-bold cursor-pointer transition-all hover:opacity-90 active:scale-95 font-['Asap',_sans-serif]"
            style={{ backgroundColor: '#4654CD' }}
          >
            Lo quiero
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[calc(100%-1rem)] sm:w-[calc(50%-0.75rem)] bg-white rounded-3xl shadow-2xl p-5 sm:p-6 rotate-[-2deg] animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-16 mb-3" />
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mt-4" />
        </div>
        <div className="w-20 h-28 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

// ── Motivos decorativos (idénticos a Stitch) ─────────────────────────────────
function Decorations() {
  return (
    <>
      {/* Círculo grande esquina superior izquierda (como en Stitch) */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ border: '40px solid rgba(255,255,255,0.10)' }} />
      {/* Rombo esquina inferior derecha (como en Stitch) */}
      <div className="absolute bottom-0 right-0 w-48 h-48 rotate-45 translate-x-1/4 translate-y-1/4"
        style={{ backgroundColor: 'rgba(255,255,255,0.10)' }} />
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
interface LeadProductsSectionProps {
  primaryColor?: string;
  secondaryColor?: string;
  config?: LeadProductsConfig | null;
  landing: string;
  onCtaClick?: () => void;
  sectionId?: string;
  contained?: boolean;
}

export const LeadProductsSection: React.FC<LeadProductsSectionProps> = ({
  config,
  landing,
  onCtaClick,
  sectionId = 'productos',
  contained = false,
}) => {
  const [products, setProducts] = useState<LeadCatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const tracker = useEventTrackerOptional();

  const title = config?.title || '';
  const subtitle = config?.subtitle || '';
  const productIds = config?.product_ids || [];

  useEffect(() => {
    if (!productIds.length) { setProducts([]); return; }
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/public/landing/${landing}/products?product_ids=${productIds.join(',')}&limit=${productIds.length}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json();
        const items = data.items || [];
        const byId = new Map(items.map((p: any) => [p.id, p]));
        const ordered = productIds
          .map((id) => byId.get(id))
          .filter(Boolean)
          .map((p: any): LeadCatalogProduct => ({
            id: p.id,
            name: p.name,
            brand: p.brand?.name || '',
            brandLogo: p.brand?.logo_url || undefined,
            type: p.type,
            specs: p.specs || {},
            slug: p.slug,
            thumbnail_url: p.thumbnail_url || null,
            monthly_price: p.pricing?.hook?.monthly_price || 0,
            term_months: p.pricing?.hook?.term_months || 0,
            final_price: p.pricing?.final_price || 0,
            list_price: p.pricing?.list_price || 0,
          }));
        setProducts(ordered);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [productIds.join(','), landing]);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.type === activeCategory);

  useEffect(() => { setCurrentIndex(0); }, [activeCategory]);

  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsMobile(!mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Mobile: 1 visible, Desktop: 2 visibles
  const visibleCount = isMobile ? 1 : 2;
  const maxIndex = Math.max(0, filtered.length - visibleCount);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(Math.max(0, Math.min(idx, maxIndex)));
  }, [maxIndex]);

  const handleArrow = (dir: 'left' | 'right') => {
    const next = dir === 'right' ? currentIndex + 1 : currentIndex - 1;
    goTo(next);
    tracker?.track('lead_products_scroll', { direction: dir, category: activeCategory });
  };

  // Swipe táctil
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) handleArrow(diff > 0 ? 'right' : 'left');
    setTouchStart(null);
  };

  const availableTypes = new Set(products.map((p) => p.type));
  const visibleCategories = CATEGORIES.filter(
    (cat) => cat.key === 'all' || availableTypes.has(cat.key)
  );

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      data-section="productos"
      className={`relative flex flex-col justify-center ${contained ? 'px-4 sm:px-6 lg:px-8' : 'px-8 lg:px-12'}`}
      style={{ backgroundColor: '#4247d2', minHeight: '100svh', flex: 1 }}
    >
      {/* Motivos decorativos — overflow hidden solo aquí para no bloquear menús */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Decorations />
      </div>

      <div className={`relative z-10 w-full ${contained ? 'max-w-7xl mx-auto' : ''}`}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-left mb-4 lg:mb-10"
        >
          {title && (
            <div
              className="text-2xl sm:text-[44px] font-bold text-white font-['Baloo_2',_sans-serif] mb-1 [&_p]:m-0 [&_strong]:font-black"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          )}
          {subtitle && (
            <div
              className="text-[#e1e0ff] text-base font-['Asap',_sans-serif] [&_p]:m-0"
              dangerouslySetInnerHTML={{ __html: subtitle }}
            />
          )}
        </motion.div>

        {/* Sin productos configurados */}
        {!productIds.length && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold font-['Baloo_2',_sans-serif] text-lg mb-1">Próximamente</p>
              <p className="text-white/50 text-sm font-['Asap',_sans-serif] max-w-xs">
                Estamos preparando el catálogo de equipos. Déjanos tus datos y te avisamos.
              </p>
            </div>
            <button
              onClick={onCtaClick}
              className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[#4247d2] bg-white text-sm font-bold cursor-pointer hover:bg-white/90 transition-all font-['Asap',_sans-serif]"
            >
              Quiero que me avisen
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Chips de categoría + contador */}
        {productIds.length > 0 && visibleCategories.length > 1 && (
          <div className="flex items-center gap-3 justify-start flex-wrap mb-4 lg:mb-10">
            {visibleCategories.map((cat) => {
              const isActive = activeCategory === cat.key;
              const count = cat.key === 'all' ? products.length : products.filter(p => p.type === cat.key).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    setActiveCategory(cat.key);
                    tracker?.track('lead_products_filter', { category: cat.key });
                  }}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer font-['Asap',_sans-serif] ${
                    isActive
                      ? 'bg-white text-[#4247d2] shadow-sm'
                      : 'border border-white/30 text-white hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#4247d2] text-white' : 'bg-white/20 text-white'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Loading skeletons */}
        {productIds.length > 0 && isLoading && (
          <div className="flex gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Estado vacío por filtro */}
        {productIds.length > 0 && !isLoading && filtered.length === 0 && products.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-white/60">
            <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
            </svg>
            <p className="text-sm font-['Asap',_sans-serif]">No hay productos en esta categoría</p>
          </div>
        )}

        {/* MOBILE: carousel 1 card a la vez con dots */}
        {productIds.length > 0 && !isLoading && filtered.length > 0 && (
          <div className="lg:hidden">
            <div
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-350 ease-in-out"
                style={{ transform: `translateX(calc(-${currentIndex} * 100%))` }}
              >
                {isInView && filtered.map((product, i) => (
                  <div key={product.id} className="w-full flex-shrink-0">
                    <OfertaCard product={product} index={i} landing={landing} onCtaClick={onCtaClick} />
                  </div>
                ))}
              </div>
            </div>
            {/* Dots mobile */}
            {filtered.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {filtered.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="rounded-full transition-all cursor-pointer"
                    style={{
                      width: i === currentIndex ? '24px' : '8px',
                      height: '8px',
                      backgroundColor: i === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    }}
                    aria-label={`Ir a producto ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* DESKTOP: carousel horizontal con flechas */}
        {productIds.length > 0 && !isLoading && filtered.length > 0 && (
          <div className="relative hidden lg:block">
            {/* Flecha izquierda */}
            <button
              onClick={() => handleArrow('left')}
              disabled={currentIndex === 0}
              className="absolute -left-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white disabled:opacity-20 transition-all cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Track */}
            <div className="overflow-hidden">
              <div
                className="grid gap-6 transition-transform duration-350 ease-in-out"
                style={{
                  gridTemplateColumns: `repeat(${filtered.length}, calc(50% - 0.75rem))`,
                  transform: filtered.length > 1 ? `translateX(calc(-${currentIndex} * (50% - 0.375rem + 0.75rem)))` : 'none',
                }}
              >
                {isInView && filtered.map((product, i) => (
                  <OfertaCard key={product.id} product={product} index={i} landing={landing} onCtaClick={onCtaClick} />
                ))}
              </div>
            </div>

            {/* Flecha derecha */}
            <button
              onClick={() => handleArrow('right')}
              disabled={currentIndex >= maxIndex}
              className="absolute -right-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white disabled:opacity-20 transition-all cursor-pointer"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Dots — solo desktop y solo si hay más de 2 cards */}
        {productIds.length > 0 && !isLoading && maxIndex > 0 && filtered.length > 2 && (
          <div className="hidden lg:flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-200 cursor-pointer"
                style={{
                  width: i === currentIndex ? '24px' : '8px',
                  height: '8px',
                  backgroundColor: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>
        )}

        {/* Legal */}
        <p className="text-center text-white/50 text-[11px] mt-8 font-['Asap',_sans-serif] max-w-md mx-auto">
          Cuotas referenciales. TCEA variable según evaluación crediticia.
        </p>
      </div>
    </section>
  );
};
