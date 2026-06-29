'use client';

/**
 * CatalogoOfertaTab — la pestaña "Catálogo" usando el LAYOUT REAL del catálogo
 * (CatalogLayoutV4) con filtros completos, pero alimentado por offerApi (con el
 * tope de cuota aplicado por el backend) y SIN carrito / wishlist / comparador.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';

import { CatalogLayoutV4 } from '../../../[landing]/catalogo/components/catalog/layout/CatalogLayoutV4';
import { ProductCard } from '../../../[landing]/catalogo/components/catalog/cards/ProductCard';
import { ProductCardSkeleton } from '../../../[landing]/catalogo/components/catalog/ProductCardSkeleton';
import { LoadMoreButton } from '../../../[landing]/catalogo/components/catalog/LoadMoreButton';
import { SearchDrawer } from '../../../[landing]/catalogo/components/catalog/SearchDrawer';
import VipCountdownBanner from '../../../[landing]/catalogo/components/catalog/VipCountdownBanner';
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

  const items = products ?? [];
  const visibleItems = items.slice(0, visibleCount);
  const remaining = Math.max(0, items.length - visibleItems.length);

  return (
    <>
      {/* Búsqueda mobile (en desktop el buscador vive en la fila de tabs) */}
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

      {/* Countdown destacado */}
      {offer.expiresAt ? (
        <div className="w-full px-3 pt-4 sm:px-4 lg:px-6">
          <VipCountdownBanner endDate={offer.expiresAt} />
        </div>
      ) : null}

      <CatalogLayoutV4
        products={items}
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        config={OFFER_CONFIG}
        apiFilters={apiFilters}
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
