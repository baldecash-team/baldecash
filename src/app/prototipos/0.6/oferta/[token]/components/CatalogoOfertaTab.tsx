'use client';

/**
 * CatalogoOfertaTab — la pestaña "Catálogo" usando el LAYOUT REAL del catálogo
 * (CatalogLayoutV4) con filtros completos, pero alimentado por offerApi (con el
 * tope de cuota aplicado por el backend) y SIN carrito / wishlist / comparador.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, ArrowLeft, HelpCircle, GraduationCap, MessageCircle } from 'lucide-react';
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';

import { CatalogLayoutV4 } from '../../../[landing]/catalogo/components/catalog/layout/CatalogLayoutV4';
import { NavbarSearch } from '../../../[landing]/catalogo/components/catalog/NavbarActions';
import { ProductCard } from '../../../[landing]/catalogo/components/catalog/cards/ProductCard';
import { ProductCardSkeleton } from '../../../[landing]/catalogo/components/catalog/ProductCardSkeleton';
import { LoadMoreButton } from '../../../[landing]/catalogo/components/catalog/LoadMoreButton';
import { SearchDrawer } from '../../../[landing]/catalogo/components/catalog/SearchDrawer';
import { BlipChat, useBlipChat } from '../../../components/BlipChat';
import { OnboardingTour, OnboardingWelcomeModal } from '../../../[landing]/catalogo/components/onboarding';
import { useOfferTour } from './useOfferTour';
import type {
  CatalogProduct,
  FilterState,
  SortOption,
  CatalogLayoutConfig,
} from '../../../[landing]/catalogo/types/catalog';
import { mergeFiltersWithDefaults } from '../../../[landing]/catalogo/utils/queryFilters';
import { useGridColumns, roundToColumns } from '../../../[landing]/catalogo/hooks/useGridColumns';
import {
  getCatalog,
  getOfferFilters,
  type OfferView,
  type OfferCatalogFilters,
} from '../../../services/offerApi';
import type { CatalogFiltersResponse } from '../../../types/filters';
import type { ProductSuggestion } from '../../../services/catalogApi';

// Config de presentación fijo (mismos valores que usa el catálogo v0.6).
const OFFER_CONFIG: CatalogLayoutConfig & { colorSelectorVersion: 1 | 2 } = {
  layoutVersion: 4,
  brandFilterVersion: 3,
  cardVersion: 6,
  technicalFiltersVersion: 3,
  skeletonVersion: 2,
  loadMoreVersion: 3,
  loadingDuration: 'default',
  imageGalleryVersion: 2,
  gallerySizeVersion: 3,
  tagDisplayVersion: 1,
  pricingMode: 'static',
  defaultTerm: 24,
  defaultInitial: 0,
  showPricingOptions: false,
  showFilterCounts: true,
  showTooltips: true,
  productsPerRow: { mobile: 1, tablet: 2, desktop: 4 },
  colorSelectorVersion: 1,
};

// Cuántos equipos mostrar antes del botón "Cargar más" (paginación en cliente:
// el endpoint de oferta devuelve todos los que entran en la cuota de una vez).
const PAGE_SIZE = 12;

// El backend ordena por precio de LISTA, pero las cards muestran la CUOTA a
// 24m/0% (que no es proporcional al precio por las distintas TEAs). Por eso el
// orden final por cuota se hace en el cliente (ver `sortedItems`). El sort_by
// del API solo da un orden base estable; el default es el del catálogo.
const SORT_TO_API: Record<string, string> = {
  recommended: 'display_order',
  price_asc: 'price_asc',
  price_desc: 'price_desc',
  quota_asc: 'price_asc',
  quota_desc: 'price_desc',
  newest: 'newest',
};

export function CatalogoOfertaTab({
  token,
  offer,
  onSelect,
  searchQuery,
  onSearchChange,
  onBack,
}: {
  token: string;
  offer: OfferView;
  onSelect: (product: CatalogProduct) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  /** Si se pasa, muestra "Volver a mi oferta" en la fila del buscador (como el detalle). */
  onBack?: () => void;
}) {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(() => mergeFiltersWithDefaults({}));
  const tour = useOfferTour(token);  // tour guiado propio de la oferta
  const blipChat = useBlipChat();    // abrir el chat desde el popover de ayuda
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>('recommended');
  const [searchOpen, setSearchOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // Columnas reales del grid (fluido: 3/4/5 según el ancho). Se usa para paginar
  // en múltiplos de columnas y que la última fila no quede coja (igual que el
  // catálogo general).
  const { gridRef, columns: gridColumns } = useGridColumns();

  // Sugerencias del dropdown DESDE el catálogo de la oferta (no el normal): ya
  // vienen filtradas por cuota, sin el pedido y con la cuota a 24m/0%.
  const fetchOfferSuggestions = useCallback(
    async (q: string): Promise<ProductSuggestion[]> => {
      const res = await getCatalog(token, { q, sortBy: 'price_desc' });
      return res.items.slice(0, 6).map((p) => ({
        id: p.id,
        name: p.displayName || p.name,
        slug: p.slug,
        brand: p.brand,
        category: '',
        price: p.price,
        image: p.images?.[0] || p.thumbnail || null,
        // Plazo del hook (backend) — refleja el array de la oferta, no un 24 fijo.
        maxTermMonths: p.hookTermMonths ?? p.maxTermMonths ?? 24,
        quotaMonthly: p.quotaMonthly ?? null,
      }));
    },
    [token],
  );

  // Al elegir una sugerencia, ir al detalle DENTRO de la oferta (no salir del flujo).
  const goToOfferDetail = useCallback(
    (s: ProductSuggestion) => {
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${s.slug}`;
    },
    [token],
  );

  // Filtros dinámicos (specs, marcas, etc.) — vienen de la landing real de la oferta.
  // Filtros UNIFICADOS de la oferta: estructura + contadores JUNTOS, ya topados
  // por la cuota (endpoint /offer/{token}/filters). Los contadores son REACTIVOS:
  // se re-piden con los filtros aplicados (efecto más abajo, tras `offerFilters`),
  // igual que el catálogo general → marcar "Samsung" recalcula los conteos.
  const [offerApiFilters, setOfferApiFilters] = useState<CatalogFiltersResponse | null>(null);
  const [isApiFiltersLoading, setIsApiFiltersLoading] = useState(true);

  // Mapa slug→id de marca (el sidebar setea filters.brands con el SLUG; el API
  // espera brand_ids numéricos). Se arma desde los filtros de la oferta.
  const brandSlugToId = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of offerApiFilters?.brands ?? []) {
      if (b.slug && b.id != null) m.set(b.slug, b.id);
    }
    return m;
  }, [offerApiFilters]);

  // Cuota máxima aprobada (tope del slider y de cualquier filtro de cuota).
  const maxQuota = offer.maxMonthlyQuota;

  // Traduce TODO el FilterState del sidebar a los params que acepta
  // /offer/{token}/catalog. Mismo mapeo que el catálogo normal (CatalogoClient),
  // adaptado a la oferta: specs JSON, condición, labels(tags), gama, cuota, specs.
  const offerFilters = useMemo<OfferCatalogFilters>(() => {
    const f: OfferCatalogFilters = { sortBy: SORT_TO_API[sort] ?? 'price_desc' };
    if (searchQuery.trim().length >= 2) f.q = searchQuery.trim();

    // Marca: slug → id.
    if (filters.brands?.length && brandSlugToId.size > 0) {
      const ids = filters.brands
        .map((slug) => brandSlugToId.get(slug))
        .filter((id): id is number => id != null);
      if (ids.length) f.brandIds = ids;
    }
    if (filters.deviceTypes?.length) f.types = filters.deviceTypes;
    if (filters.gama?.length) f.gamas = filters.gama;
    if (filters.usage?.length) f.usages = filters.usage;
    // Condición: el sidebar usa 'nuevo'/'reacondicionado' pero la BD guarda
    // 'nueva'/'reacondicionada'. Normalizamos para que el filtro sí aplique.
    if (filters.condition?.length) {
      const CONDITION_MAP: Record<string, string> = {
        nuevo: 'nueva',
        reacondicionado: 'reacondicionada',
      };
      f.conditions = filters.condition.map((c) => CONDITION_MAP[c] ?? c);
    }
    // Destacados: en el FilterState viven en `tags`; el API los llama `labels`.
    if (filters.tags?.length) f.labels = filters.tags;

    // Cuota (slider): solo si el usuario estrechó el rango (0 → tope aprobado).
    // El backend de oferta filtra sobre la cuota real a 24m/0%.
    const [qMin, qMax] = filters.quotaRange;
    if (qMin > 0) f.minQuota = qMin;
    if (qMax < maxQuota) f.maxQuota = qMax;

    // Specs técnicos → objeto specs (mismo formato que el catálogo normal).
    const specs: Record<string, (string | number | boolean)[]> = {};
    if (filters.ram?.length) specs.ram = filters.ram;
    if (filters.storage?.length) specs.storage = filters.storage;
    if (filters.storageType?.length) specs.storage_type = filters.storageType;
    if (filters.processorBrand?.length) specs.processor_brand = filters.processorBrand;
    if (filters.processorModel?.length) specs.processor = filters.processorModel;
    if (filters.gpuType?.length) specs.gpu = filters.gpuType;
    if (filters.displaySize?.length) specs.screen_size = filters.displaySize;
    if (filters.displayType?.length) specs.screen_type = filters.displayType;
    if (filters.resolution?.length) specs.screen_resolution = filters.resolution;
    if (filters.touchScreen !== null) specs.touch_screen = [filters.touchScreen];
    if (filters.refreshRate?.length) specs.refresh_rate = filters.refreshRate;
    if (filters.backlitKeyboard !== null) specs.backlit_keyboard = [filters.backlitKeyboard];
    if (filters.numericKeypad !== null) specs.numeric_keypad = [filters.numericKeypad];
    if (filters.fingerprint !== null) specs.fingerprint_sensor = [filters.fingerprint];
    if (filters.hasWindows !== null) specs.windows_included = [filters.hasWindows];
    if (filters.hasThunderbolt !== null) specs.thunderbolt_port = [filters.hasThunderbolt];
    if (filters.hasEthernet !== null) specs.ethernet_port = [filters.hasEthernet];
    if (filters.hasHDMI !== null) specs.hdmi_port = [filters.hasHDMI];
    if (filters.hasSDCard !== null) specs.sd_card_slot = [filters.hasSDCard];
    if (filters.minUSBPorts !== null && filters.minUSBPorts > 0) specs.usb_ports = [filters.minUSBPorts];
    if (filters.ramExpandable !== null) specs.ram_expandable = [filters.ramExpandable];
    if (Object.keys(specs).length > 0) f.specs = specs;

    return f;
  }, [filters, sort, searchQuery, brandSlugToId, maxQuota]);

  // Clave estable por CONTENIDO de los filtros (no por referencia). `offerFilters`
  // es un objeto nuevo en cada render y cambia de referencia cuando llega
  // `apiFilters` (brandSlugToId), aunque los params efectivos sean idénticos. Sin
  // esto, el catálogo se re-fetchea 2-3 veces al cargar → doble parpadeo del grid.
  const offerFiltersKey = JSON.stringify(offerFilters);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setVisibleCount(PAGE_SIZE); // al cambiar filtros/orden/búsqueda, reinicia la paginación
    getCatalog(token, offerFilters)
      .then((res) => active && setProducts(res.items))
      .catch(() => active && setProducts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, offerFiltersKey]);

  // Filtros del sidebar SIN `q`/`sortBy`: la búsqueda y el orden NO afectan los
  // CONTEOS de los filtros (el catálogo general tampoco los cuenta). Así escribir
  // en el buscador o cambiar el orden no re-pide contadores innecesariamente.
  const offerFiltersForCounts = useMemo<OfferCatalogFilters>(() => {
    const { q: _q, sortBy: _sortBy, ...rest } = offerFilters;
    return rest;
  }, [offerFilters]);
  const offerFiltersForCountsKey = JSON.stringify(offerFiltersForCounts);

  // Contadores REACTIVOS: se re-piden con los filtros aplicados cuando cambian,
  // igual que el catálogo general (marcar "Samsung" recalcula tipo/uso/specs a
  // solo Samsung; la lista de marcas sigue completa para poder cambiar).
  useEffect(() => {
    let active = true;
    setIsApiFiltersLoading(true);
    getOfferFilters(token, offerFiltersForCounts)
      .then((f) => active && setOfferApiFilters(f))
      .catch(() => active && setOfferApiFilters(null))
      .finally(() => active && setIsApiFiltersLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, offerFiltersForCountsKey]);

  // Orden final por CUOTA real (24m/0%) en el cliente, porque el orden por
  // precio de lista del API no coincide con la cuota mostrada. "Recomendados"
  // respeta el orden del API (display_order); las demás ordenan por cuota.
  const items = useMemo(() => {
    const base = products ?? [];
    if (sort === 'price_asc' || sort === 'quota_asc') {
      return [...base].sort((a, b) => (a.quotaMonthly ?? 0) - (b.quotaMonthly ?? 0));
    }
    if (sort === 'price_desc') {
      return [...base].sort((a, b) => (b.quotaMonthly ?? 0) - (a.quotaMonthly ?? 0));
    }
    return base; // recommended / newest → orden del API
  }, [products, sort]);

  // Paso de paginación redondeado a las columnas reales, para que cada bloque
  // llene filas completas (12→10/12/15 según haya 5/4/3 columnas).
  const pageStep = roundToColumns(PAGE_SIZE, gridColumns);
  // Muestra al menos `visibleCount` items pero redondeado hacia arriba a fila
  // completa según las columnas actuales (evita la última fila coja).
  const shownCount = Math.min(items.length, roundToColumns(visibleCount, gridColumns));
  const visibleItems = items.slice(0, shownCount);
  const remaining = Math.max(0, items.length - visibleItems.length);

  // (El merge estructura+contadores ya lo hace el backend: offerApiFilters viene
  //  listo del endpoint unificado /offer/{token}/filters — ver arriba.)

  return (
    <>
      {/* Barra UNIFICADA (mobile + desktop), calcada del detalle de producto en
          oferta: grilla 3 columnas visible en TODOS los tamaños.
          - Izq: "Volver a mi oferta" SIEMPRE visible (el texto colapsa en mobile,
            queda la flecha). Antes solo estaba en desktop → en mobile no había volver.
          - Centro: buscador (NavbarSearch) solo desktop, topado por cuota.
          - Der: botón "Buscar" solo mobile → abre el SearchDrawer (también topado
            por cuota vía fetchOfferSuggestions). */}
      <div className="sticky top-16 z-30 w-full border-b border-gray-200 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-4 lg:px-6">
        <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver a mi oferta</span>
            </button>
          ) : (
            <span aria-hidden />
          )}
          {/* Columna central (1fr): en desktop el buscador centrado; en mobile
              queda vacía pero mantiene el 1fr para empujar el ícono a la derecha. */}
          <div className="flex justify-center">
            <div className="hidden w-full justify-center md:flex">
              <NavbarSearch
                value={searchQuery}
                onChange={onSearchChange}
                onClear={() => onSearchChange('')}
                placeholder="Buscar entre tus equipos disponibles…"
                fetchSuggestions={fetchOfferSuggestions}
                onSelectSuggestion={goToOfferDetail}
              />
            </div>
          </div>
          <span aria-hidden className="hidden md:block" />
          {/* Mobile: botón-ícono (solo lupa) al EXTREMO DERECHO, abre el drawer. */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar entre tus equipos"
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 md:hidden"
          >
            <Search className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
          </button>
        </div>
      </div>

      <CatalogLayoutV4
        products={items}
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        config={OFFER_CONFIG}
        apiFilters={offerApiFilters}
        isApiFiltersLoading={isApiFiltersLoading}
        totalProducts={items.length}
        gridRef={gridRef}
        searchQuery={searchQuery}
        onSearchClear={() => onSearchChange('')}
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={`sk-${i}`} version={OFFER_CONFIG.skeletonVersion} index={i} />
          ))
        ) : items.length === 0 ? (
          <p className="col-span-full py-10 text-center text-sm text-gray-500">
            No hay equipos disponibles para tu cuota con estos filtros.
          </p>
        ) : (
          <>
            {visibleItems.map((product) => (
              <ProductCard
                key={product.landingProductId ?? product.id}
                product={product}
                hideColors
                hideFavorite
                approvedTag
                ctaLabel="Elegir"
                onCtaClick={() => onSelect(product)}
                getDetailHref={(slug) =>
                  `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}/producto/${slug || product.slug}`
                }
              />
            ))}
            {remaining > 0 ? (
              <div className="col-span-full">
                <LoadMoreButton
                  version={OFFER_CONFIG.loadMoreVersion}
                  remainingProducts={remaining}
                  totalProducts={items.length}
                  visibleProducts={visibleItems.length}
                  onLoadMore={() => setVisibleCount((c) => c + pageStep)}
                />
              </div>
            ) : null}
          </>
        )}
      </CatalogLayoutV4>

      {/* Buscador del catálogo (mismo SearchDrawer) — mobile */}
      <SearchDrawer
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        value={searchQuery}
        onChange={onSearchChange}
        onClear={() => onSearchChange('')}
        onSubmit={() => setSearchOpen(false)}
        fetchSuggestions={fetchOfferSuggestions}
        onSelectSuggestion={goToOfferDetail}
      />

      {/* Chat con Blip — igual que el catálogo regular. El botón flotante nativo
          se oculta (hideFloatingButton): el chat se abre desde el popover de
          ayuda. Emite webchat_open/close (EventTracker ya montado en el layout). */}
      <BlipChat buttonColor="#4654CD" hideFloatingButton />

      {/* Tour guiado propio de la oferta (pasos reducidos: quick-cards, filtros,
          orden — IDs que CatalogLayoutV4 sí renderiza). Reusa el visual del
          catálogo regular; emite eventos tour_* automáticamente. */}
      <OnboardingWelcomeModal
        isOpen={tour.shouldShowWelcome}
        onStartTour={tour.startTour}
        onDismiss={tour.dismissWelcome}
      />
      <OnboardingTour
        isActive={tour.shouldShowTour}
        currentStep={tour.currentStepData}
        currentStepIndex={tour.currentStep}
        totalSteps={tour.totalSteps}
        highlightStyle="pulse"
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onSkip={tour.skipTour}
      />

      {/* Botón sticky "¿Necesitas ayuda?" abajo-izquierda con popover (mismo
          patrón que el catálogo regular). 2 opciones: ver tour + hablar por Blip.
          Sin la opción de quiz (la oferta no tiene quiz). */}
      <div className="fixed bottom-6 left-6 z-[100]">
        <Popover
          placement="top"
          showArrow
          isOpen={isHelpOpen}
          onOpenChange={setIsHelpOpen}
          classNames={{
            base: 'z-[100]',
            content: 'p-0 bg-[var(--surface,#fff)] border border-[var(--border-soft,#e5e7eb)] shadow-xl rounded-xl overflow-hidden',
          }}
        >
          <PopoverTrigger>
            <Button
              id="onboarding-oferta-help"
              size="sm"
              className="bg-[var(--color-primary)] text-white shadow-lg cursor-pointer hover:brightness-90 transition-all hover:scale-105 gap-2 px-3 py-5 !font-semibold rounded-lg"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">¿Necesitas ayuda?</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="w-64">
              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  tour.restartTour();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-bg,#fafafa)] transition-colors cursor-pointer text-left border-b border-[var(--border-soft,#f3f4f6)]"
              >
                <div className="w-9 h-9 rounded-lg bg-[rgba(var(--color-secondary-rgb),0.1)] flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-strong,#1f2937)]">Ver tour guiado</p>
                  <p className="text-xs text-[var(--text-muted,#6b7280)]">Aprende a usar el catálogo</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  blipChat.openChat();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-bg,#fafafa)] transition-colors cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-strong,#1f2937)]">Habla con nosotros</p>
                  <p className="text-xs text-[var(--text-muted,#6b7280)]">Te ayudamos al instante</p>
                </div>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
