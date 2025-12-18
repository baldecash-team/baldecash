'use client';

/**
 * CatalogSection - Componente principal del catalogo
 *
 * Orquesta el layout, filtros y productos
 * Selecciona automaticamente la version de layout segun config
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { CatalogLayoutV1 } from './layout/CatalogLayoutV1';
import { CatalogLayoutV2 } from './layout/CatalogLayoutV2';
import { CatalogLayoutV3 } from './layout/CatalogLayoutV3';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { EmptyState } from './empty/EmptyState';
import { mockProducts } from '../../data/mockCatalogData';
import {
  CatalogConfig,
  FilterState,
  SortOption,
  CatalogProduct,
  defaultFilterState,
} from '../../types/catalog';

interface CatalogSectionProps {
  config: CatalogConfig;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({ config }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    let result = [...mockProducts];

    // Filter by brand
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand));
    }

    // Filter by usage
    if (filters.usage.length > 0) {
      result = result.filter((p) =>
        p.usage.some((u) => filters.usage.includes(u))
      );
    }

    // Filter by price range
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Filter by quota range
    result = result.filter(
      (p) =>
        p.lowestQuota >= filters.quotaRange[0] &&
        p.lowestQuota <= filters.quotaRange[1]
    );

    // Filter by available now
    if (filters.availableNow) {
      result = result.filter((p) => p.availableNow);
    }

    // Filter by RAM
    if (filters.ram.length > 0) {
      result = result.filter((p) => filters.ram.includes(p.specs.ram));
    }

    // Filter by storage
    if (filters.storage.length > 0) {
      result = result.filter((p) => filters.storage.includes(p.specs.storage));
    }

    // Filter by gama
    if (filters.gama.length > 0) {
      result = result.filter((p) => filters.gama.includes(p.gama));
    }

    // Filter by condition
    if (filters.condition.length > 0) {
      result = result.filter((p) => filters.condition.includes(p.condition));
    }

    // Sort products
    switch (sortOption) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'quota_asc':
        result.sort((a, b) => a.lowestQuota - b.lowestQuota);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
      case 'recommended':
      default:
        // Featured first, then by price
        result.sort((a, b) => {
          if (a.isFeatured !== b.isFeatured) {
            return b.isFeatured ? 1 : -1;
          }
          return a.price - b.price;
        });
        break;
    }

    return result;
  }, [filters, sortOption]);

  // Show loading state when filters or sort changes (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400); // Simulated loading delay

    return () => clearTimeout(timer);
  }, [filters, sortOption]);

  // Select layout component based on config
  const LayoutComponent = {
    1: CatalogLayoutV1,
    2: CatalogLayoutV2,
    3: CatalogLayoutV3,
  }[config.layoutVersion];

  // Skeleton count based on expected products or minimum of 6
  const skeletonCount = Math.max(filteredProducts.length, 6);

  // Get suggested products (featured or first 3 from all products)
  const suggestedProducts = useMemo(() => {
    return mockProducts
      .filter((p) => p.isFeatured || p.isNew)
      .slice(0, 3);
  }, []);

  // Handler to clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilterState);
  }, []);

  // Handler to expand price range
  const handleExpandPriceRange = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [500, 8000] as [number, number],
      quotaRange: [20, 500] as [number, number],
    }));
  }, []);

  // Handler to remove last filter (simplified - clears brands or usage)
  const handleRemoveLastFilter = useCallback(() => {
    setFilters((prev) => {
      // Remove filters in reverse priority order
      if (prev.condition.length > 0) {
        return { ...prev, condition: [] };
      }
      if (prev.gama.length > 0) {
        return { ...prev, gama: [] };
      }
      if (prev.storage.length > 0) {
        return { ...prev, storage: [] };
      }
      if (prev.ram.length > 0) {
        return { ...prev, ram: [] };
      }
      if (prev.usage.length > 0) {
        return { ...prev, usage: [] };
      }
      if (prev.brands.length > 0) {
        return { ...prev, brands: [] };
      }
      if (prev.availableNow) {
        return { ...prev, availableNow: false };
      }
      return prev;
    });
  }, []);

  // Check if we should show empty state
  const showEmptyState = !isLoading && filteredProducts.length === 0;

  return (
    <LayoutComponent
      config={config}
      filters={filters}
      onFiltersChange={setFilters}
      sortOption={sortOption}
      onSortChange={setSortOption}
      productCount={filteredProducts.length}
    >
      {isLoading ? (
        Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={`skeleton-${index}`} index={index} />
        ))
      ) : showEmptyState ? (
        <div className="col-span-full">
          <EmptyState
            filters={filters}
            onClearFilters={handleClearFilters}
            onExpandPriceRange={handleExpandPriceRange}
            onRemoveLastFilter={handleRemoveLastFilter}
            suggestedProducts={suggestedProducts}
          />
        </div>
      ) : (
        filteredProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            cardVersion={config.cardVersion}
          />
        ))
      )}
    </LayoutComponent>
  );
};

export default CatalogSection;
