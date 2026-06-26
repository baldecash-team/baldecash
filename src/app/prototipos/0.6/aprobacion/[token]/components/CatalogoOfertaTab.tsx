'use client';

/**
 * CatalogoOfertaTab — la pestaña "Catálogo" usando el LAYOUT REAL del catálogo
 * (CatalogLayoutV4) con filtros completos, pero alimentado por offerApi (con el
 * tope de cuota aplicado por el backend) y SIN carrito / wishlist / comparador.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import { CatalogLayoutV4 } from '../../../[landing]/catalogo/components/catalog/layout/CatalogLayoutV4';
import { ProductCard } from '../../../[landing]/catalogo/components/catalog/cards/ProductCard';
import { ProductCardSkeleton } from '../../../[landing]/catalogo/components/catalog/ProductCardSkeleton';
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
}: {
  token: string;
  offer: OfferView;
  onSelect: (product: CatalogProduct) => void;
}) {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(() => mergeFiltersWithDefaults({}));
  const [sort, setSort] = useState<SortOption>('recommended');
  const gridRef = useRef<HTMLDivElement>(null);

  // Filtros dinámicos (specs, marcas, etc.) — vienen de la landing real de la oferta.
  const { apiFilters, isLoading: isApiFiltersLoading } = useCatalogFilters(
    offer.landingSlug || 'home',
  );

  // Traduce el FilterState del catálogo a los params que acepta /offer/{token}/catalog.
  const offerFilters = useMemo<OfferCatalogFilters>(() => {
    const f: OfferCatalogFilters = { sortBy: SORT_TO_API[sort] ?? 'price_desc' };
    if (filters.brands?.length) f.brandIds = filters.brands.map(Number).filter((n) => !Number.isNaN(n));
    if (filters.deviceTypes?.length) f.types = filters.deviceTypes;
    if (filters.gama?.length) f.gamas = filters.gama;
    if (filters.usage?.length) f.usages = filters.usage;
    return f;
  }, [filters, sort]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getCatalog(token, offerFilters)
      .then((res) => active && setProducts(res.items))
      .catch(() => active && setProducts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [token, offerFilters]);

  const items = products ?? [];

  return (
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
        items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            hideColors
            hideFavorite
            ctaLabel="Elegir"
            onCtaClick={() => onSelect(product)}
            getDetailHref={(slug) =>
              `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/aprobacion/${token}/producto/${slug || product.slug}`
            }
          />
        ))
      )}
    </CatalogLayoutV4>
  );
}
