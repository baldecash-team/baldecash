'use client';

/**
 * CatalogSection - Wrapper principal del catalogo v0.4
 *
 * Combina layout + filtros + productos con 10 versiones de cada uno
 * Gestiona estado de filtros y ordenamiento
 */

import React, { useState, useMemo } from 'react';
import { CatalogConfig, FilterState, SortOption, defaultFilterState, CatalogProduct } from '../../types/catalog';
import { mockProducts } from '../../data/mockCatalogData';
import { ProductCard } from './ProductCard';

// Import all 10 layout versions
import { CatalogLayoutV1 } from './layout/CatalogLayoutV1';
import { CatalogLayoutV2 } from './layout/CatalogLayoutV2';
import { CatalogLayoutV3 } from './layout/CatalogLayoutV3';
import { CatalogLayoutV4 } from './layout/CatalogLayoutV4';
import { CatalogLayoutV5 } from './layout/CatalogLayoutV5';
import { CatalogLayoutV6 } from './layout/CatalogLayoutV6';
import { CatalogLayoutV7 } from './layout/CatalogLayoutV7';
import { CatalogLayoutV8 } from './layout/CatalogLayoutV8';
import { CatalogLayoutV9 } from './layout/CatalogLayoutV9';
import { CatalogLayoutV10 } from './layout/CatalogLayoutV10';

interface CatalogSectionProps {
  config: CatalogConfig;
}

// Map layout versions to components
const layoutComponents = {
  1: CatalogLayoutV1,
  2: CatalogLayoutV2,
  3: CatalogLayoutV3,
  4: CatalogLayoutV4,
  5: CatalogLayoutV5,
  6: CatalogLayoutV6,
  7: CatalogLayoutV7,
  8: CatalogLayoutV8,
  9: CatalogLayoutV9,
  10: CatalogLayoutV10,
};

export const CatalogSection: React.FC<CatalogSectionProps> = ({ config }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Get layout component
  const LayoutComponent = layoutComponents[config.layoutVersion] || CatalogLayoutV1;

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...mockProducts];

    // Apply brand filter
    if (filters.brands.length > 0) {
      result = result.filter((p) =>
        filters.brands.includes(p.brand.toLowerCase() as any)
      );
    }

    // Apply usage filter
    if (filters.usage.length > 0) {
      result = result.filter((p) =>
        p.usage.some((use) => filters.usage.includes(use))
      );
    }

    // Apply quota range filter
    if (filters.quotaRange[0] > 40 || filters.quotaRange[1] < 400) {
      result = result.filter(
        (p) =>
          p.lowestQuota >= filters.quotaRange[0] &&
          p.lowestQuota <= filters.quotaRange[1]
      );
    }

    // Apply price range filter
    if (filters.priceRange[0] > 1000 || filters.priceRange[1] < 5000) {
      result = result.filter(
        (p) =>
          p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      );
    }

    // Apply technical filters
    if (filters.ram.length > 0) {
      result = result.filter((p) => filters.ram.includes(p.specs.ram));
    }

    if (filters.storage.length > 0) {
      result = result.filter((p) => filters.storage.includes(p.specs.storage));
    }

    if (filters.processorBrand.length > 0) {
      result = result.filter((p) =>
        filters.processorBrand.includes(p.specs.processorBrand)
      );
    }

    if (filters.displaySize.length > 0) {
      result = result.filter((p) =>
        filters.displaySize.includes(p.specs.displaySize)
      );
    }

    if (filters.touchScreen !== null) {
      result = result.filter((p) => p.specs.touchScreen === filters.touchScreen);
    }

    if (filters.gpuType.length > 0) {
      result = result.filter((p) => filters.gpuType.includes(p.specs.gpuType));
    }

    // Apply commercial filters
    if (filters.availableNow) {
      result = result.filter((p) => p.availableNow);
    }

    if (filters.gama.length > 0) {
      result = result.filter((p) => filters.gama.includes(p.gama));
    }

    if (filters.condition.length > 0) {
      result = result.filter((p) => filters.condition.includes(p.condition));
    }

    return result;
  }, [filters]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts];

    switch (sortOption) {
      case 'price_asc':
        return result.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return result.sort((a, b) => b.price - a.price);
      case 'quota_asc':
        return result.sort((a, b) => a.lowestQuota - b.lowestQuota);
      case 'newest':
        return result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'popular':
        return result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      case 'recommended':
      default:
        return result;
    }
  }, [filteredProducts, sortOption]);

  // Toggle favorite
  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  return (
    <LayoutComponent
      config={config}
      filters={filters}
      onFiltersChange={setFilters}
      sortOption={sortOption}
      onSortChange={setSortOption}
      productCount={sortedProducts.length}
    >
      {sortedProducts.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          cardVersion={config.cardVersion}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={favorites.has(product.id)}
        />
      ))}
    </LayoutComponent>
  );
};

export default CatalogSection;
