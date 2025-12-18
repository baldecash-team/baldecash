'use client';

/**
 * CatalogSection - Componente principal del catalogo
 *
 * Orquesta el layout, filtros y productos
 * Selecciona automaticamente la version de layout segun config
 */

import React, { useState, useMemo } from 'react';
import { CatalogLayoutV1 } from './layout/CatalogLayoutV1';
import { CatalogLayoutV2 } from './layout/CatalogLayoutV2';
import { CatalogLayoutV3 } from './layout/CatalogLayoutV3';
import { ProductCard } from './ProductCard';
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

  // Select layout component based on config
  const LayoutComponent = {
    1: CatalogLayoutV1,
    2: CatalogLayoutV2,
    3: CatalogLayoutV3,
  }[config.layoutVersion];

  return (
    <LayoutComponent
      config={config}
      filters={filters}
      onFiltersChange={setFilters}
      sortOption={sortOption}
      onSortChange={setSortOption}
      productCount={filteredProducts.length}
    >
      {filteredProducts.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </LayoutComponent>
  );
};

export default CatalogSection;
