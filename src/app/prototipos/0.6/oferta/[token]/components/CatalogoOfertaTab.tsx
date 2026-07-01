'use client';

/**
 * CatalogoOfertaTab — la pestaña "Catálogo" usando el LAYOUT REAL del catálogo
 * (CatalogLayoutV4) con filtros completos, pero alimentado por offerApi (con el
 * tope de cuota aplicado por el backend) y SIN carrito / wishlist / comparador.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

import { CatalogLayoutV4 } from '../../../[landing]/catalogo/components/catalog/layout/CatalogLayoutV4';
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

const SORT_TO_API: Record<string, string> = {
  recommended: 'price_desc',
  price_asc: 'price_asc',
  price_desc: 'price_desc',
  quota_asc: 'quota_asc',
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

  // Filtros dinámicos (specs, marcas, etc.) — vienen de la landing real de la oferta.
  // Los usamos SOLO por su estructura (labels, logos, specs); los CONTEOS se
  // recalculan localmente sobre los items que sí entran en la cuota (abajo).
  const { apiFilters, isLoading: isApiFiltersLoading } = useCatalogFilters(
    offer.landingSlug || 'home',
  );

  // Traduce el FilterState del catálogo a los params que acepta /offer/{token}/catalog.
  const offerFilters = useMemo<OfferCatalogFilters>(() => {
    const f: OfferCatalogFilters = { sortBy: SORT_TO_API[sort] ?? 'price_desc' };
    if (searchQuery.trim().length >= 2) f.q = searchQuery.trim();
    if (filters.brands?.length) f.brandIds = filters.brands.map(Number).filter((n) => !Number.isNaN(n));
    if (filters.deviceTypes?.length) f.types = filters.deviceTypes;
    if (filters.gama?.length) f.gamas = filters.gama;
    if (filters.usage?.length) f.usages = filters.usage;
    return f;
  }, [filters, sort, searchQuery]);

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

  const items = products ?? [];
  const visibleItems = items.slice(0, visibleCount);
  const remaining = Math.max(0, items.length - visibleItems.length);

  // Conteos de filtros COHERENTES con el catálogo de oferta: se calculan sobre
  // los items reales (ya filtrados por cuota a 24m/0% y sin el equipo pedido),
  // no sobre la landing completa. Reusamos la estructura de `apiFilters` (labels,
  // logos, specs) pero sobrescribimos cada `count` y ocultamos las opciones en 0.
  const offerApiFilters = useMemo(() => {
    if (!apiFilters) return apiFilters;
    // Conteo por tipo de dispositivo.
    const typeCount = new Map<string, number>();
    // Conteo por marca (el item trae el nombre en minúsculas; lo casamos al id).
    const brandCountByName = new Map<string, number>();
    for (const p of countBase) {
      if (p.deviceType) typeCount.set(p.deviceType, (typeCount.get(p.deviceType) ?? 0) + 1);
      const bn = (p.brand || '').trim().toLowerCase();
      if (bn) brandCountByName.set(bn, (brandCountByName.get(bn) ?? 0) + 1);
    }
    const types = (apiFilters.types ?? [])
      .map((t) => ({ ...t, count: typeCount.get(t.value) ?? 0 }))
      .filter((t) => t.count > 0);
    const brands = (apiFilters.brands ?? [])
      .map((b) => ({ ...b, count: brandCountByName.get((b.name || '').trim().toLowerCase()) ?? 0 }))
      .filter((b) => b.count > 0);
    return { ...apiFilters, types, brands };
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

      {/* Búsqueda desktop: input propio de la oferta (SIN el dropdown de
          sugerencias del catálogo normal, que fugaba precios a 36m y equipos
          fuera de cuota). Solo escribe en searchQuery → filtra el catálogo de
          la oferta en vivo. */}
      <div className="hidden w-full justify-center px-3 pt-4 sm:px-4 lg:px-6 md:flex">
        <div className="relative w-full max-w-2xl">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
            style={{ color: 'var(--color-primary)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar entre tus equipos disponibles…"
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-11 text-sm text-gray-700 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[var(--color-primary)]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
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
