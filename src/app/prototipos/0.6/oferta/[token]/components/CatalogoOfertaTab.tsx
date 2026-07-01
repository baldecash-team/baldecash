'use client';

/**
 * CatalogoOfertaTab — la pestaña "Catálogo" usando el LAYOUT REAL del catálogo
 * (CatalogLayoutV4) con filtros completos, pero alimentado por offerApi (con el
 * tope de cuota aplicado por el backend) y SIN carrito / wishlist / comparador.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';

import { CatalogLayoutV4 } from '../../../[landing]/catalogo/components/catalog/layout/CatalogLayoutV4';
import { NavbarSearch } from '../../../[landing]/catalogo/components/catalog/NavbarActions';
import { ProductCard } from '../../../[landing]/catalogo/components/catalog/cards/ProductCard';
import { ProductCardSkeleton } from '../../../[landing]/catalogo/components/catalog/ProductCardSkeleton';
import { LoadMoreButton } from '../../../[landing]/catalogo/components/catalog/LoadMoreButton';
import { SearchDrawer } from '../../../[landing]/catalogo/components/catalog/SearchDrawer';
import type {
  CatalogProduct,
  FilterState,
  SortOption,
  CatalogLayoutConfig,
} from '../../../[landing]/catalogo/types/catalog';
import { mergeFiltersWithDefaults } from '../../../[landing]/catalogo/utils/queryFilters';
import { useCatalogFilters } from '../../../[landing]/catalogo/hooks/useCatalogProducts';
import { getCatalog, type OfferView, type OfferCatalogFilters } from '../../../services/offerApi';
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
}: {
  token: string;
  offer: OfferView;
  onSelect: (product: CatalogProduct) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(() => mergeFiltersWithDefaults({}));
  const [sort, setSort] = useState<SortOption>('recommended');
  const [searchOpen, setSearchOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const gridRef = useRef<HTMLDivElement>(null);

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
        maxTermMonths: 24, // la oferta siempre muestra 24 meses
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
  // Los usamos SOLO por su estructura (labels, logos, specs); los CONTEOS se
  // recalculan localmente sobre los items que sí entran en la cuota (abajo).
  const { apiFilters, isLoading: isApiFiltersLoading } = useCatalogFilters(
    offer.landingSlug || 'home',
  );

  // Mapa slug→id de marca (el sidebar setea filters.brands con el SLUG; el API
  // espera brand_ids numéricos). Se arma desde apiFilters.brands.
  const brandSlugToId = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of apiFilters?.brands ?? []) {
      if (b.slug && b.id != null) m.set(b.slug, b.id);
    }
    return m;
  }, [apiFilters]);

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
  }, [token, offerFilters]);

  // Universo base para los CONTEOS de filtros: el catálogo acotado por cuota (y
  // por búsqueda de texto, que sí reduce el universo) pero SIN filtros de marca/
  // tipo. Así el sidebar mantiene todas las opciones disponibles y el usuario
  // puede alternar entre marcas/tipos sin que desaparezcan (conteos estables).
  const [countBase, setCountBase] = useState<CatalogProduct[]>([]);
  useEffect(() => {
    let active = true;
    const baseFilters: OfferCatalogFilters = { sortBy: 'price_desc' };
    if (searchQuery.trim().length >= 2) baseFilters.q = searchQuery.trim();
    getCatalog(token, baseFilters)
      .then((res) => active && setCountBase(res.items))
      .catch(() => active && setCountBase([]));
    return () => {
      active = false;
    };
  }, [token, searchQuery]);

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

  const visibleItems = items.slice(0, visibleCount);
  const remaining = Math.max(0, items.length - visibleItems.length);

  // Conteos de filtros COHERENTES con el catálogo de oferta: se calculan sobre
  // los items reales (ya filtrados por cuota a 24m/0% y sin el equipo pedido),
  // no sobre la landing completa. Reusamos la estructura de `apiFilters` (labels,
  // logos, specs) pero sobrescribimos cada `count` y ocultamos las opciones en 0.
  const offerApiFilters = useMemo(() => {
    if (!apiFilters) return apiFilters;
    const typeCount = new Map<string, number>();
    // Marca: el item trae el nombre en minúsculas; lo casamos al id.
    const brandCountByName = new Map<string, number>();
    // Destacados (tags→labels por code) y Condición (value ya normalizado).
    const labelCount = new Map<string, number>();
    const conditionCount = new Map<string, number>();
    for (const p of countBase) {
      if (p.deviceType) typeCount.set(p.deviceType, (typeCount.get(p.deviceType) ?? 0) + 1);
      const bn = (p.brand || '').trim().toLowerCase();
      if (bn) brandCountByName.set(bn, (brandCountByName.get(bn) ?? 0) + 1);
      for (const t of p.tags ?? []) labelCount.set(t, (labelCount.get(t) ?? 0) + 1);
      if (p.condition) conditionCount.set(p.condition, (conditionCount.get(p.condition) ?? 0) + 1);
    }
    const types = (apiFilters.types ?? [])
      .map((t) => ({ ...t, count: typeCount.get(t.value) ?? 0 }))
      .filter((t) => t.count > 0);
    const brands = (apiFilters.brands ?? [])
      .map((b) => ({ ...b, count: brandCountByName.get((b.name || '').trim().toLowerCase()) ?? 0 }))
      .filter((b) => b.count > 0);
    const labels = (apiFilters.labels ?? [])
      .map((l) => ({ ...l, count: labelCount.get(l.code) ?? 0 }))
      .filter((l) => l.count > 0);
    const conditions = (apiFilters.conditions ?? [])
      .map((c) => ({ ...c, count: conditionCount.get(c.value) ?? 0 }))
      .filter((c) => c.count > 0);
    // specs/usages: dejamos los counts de la landing (recálculo por spec sería
    // más costoso); el FILTRO sí aplica sobre el catálogo de la oferta.
    return { ...apiFilters, types, brands, labels, conditions };
  }, [apiFilters, countBase]);

  return (
    <>
      {/* Búsqueda mobile: botón que abre el drawer (input completo en desktop). */}
      <div className="w-full px-3 pt-4 sm:px-4 lg:px-6 md:hidden">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-400 transition-shadow hover:shadow-sm"
        >
          <Search className="h-5 w-5 shrink-0" style={{ color: 'var(--color-primary)' }} />
          <span className="truncate">{searchQuery || 'Buscar por marca, modelo…'}</span>
        </button>
      </div>

      {/* Búsqueda desktop: mismo NavbarSearch del detalle/catálogo normal, pero
          con el dropdown de sugerencias alimentado por el catálogo de la OFERTA
          (filtrado por cuota, sin el pedido, cuota a 24m/0%). Al elegir una
          sugerencia se queda en el flujo de oferta. */}
      <div className="hidden w-full justify-center px-3 pt-4 sm:px-4 lg:px-6 md:flex">
        <NavbarSearch
          value={searchQuery}
          onChange={onSearchChange}
          onClear={() => onSearchChange('')}
          placeholder="Buscar entre tus equipos disponibles…"
          fetchSuggestions={fetchOfferSuggestions}
          onSelectSuggestion={goToOfferDetail}
        />
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
                forcedTerm={24}
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
                  onLoadMore={() => setVisibleCount((c) => c + PAGE_SIZE)}
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
      />
    </>
  );
}
