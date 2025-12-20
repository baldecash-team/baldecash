'use client';

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CatalogLayoutProps } from '../../../types/catalog';
import { FilterSection } from '../filters/FilterSection';
import { PriceRangeFilter } from '../filters/PriceRangeFilter';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { UsageFilter } from '../filters/UsageFilter';
import { CommercialFilters } from '../filters/CommercialFilters';
import { FilterChips } from '../filters/FilterChips';
import { SortDropdown } from '../sorting/SortDropdown';
import {
  BrandFilterV1,
  BrandFilterV2,
  BrandFilterV3,
  BrandFilterV4,
  BrandFilterV5,
  BrandFilterV6,
} from '../filters/brand';
import {
  brandOptions,
  usageOptions,
  gamaOptions,
  conditionOptions,
  filterTooltips,
} from '../../../data/mockCatalogData';

/**
 * CatalogLayoutV4 - Split View Abstracto
 * Vista dividida con filtros flotantes sobre fondo con shapes geométricos
 * Referencia: Nubank, Revolut (secciones de productos)
 */
export const CatalogLayoutV4: React.FC<CatalogLayoutProps> = ({
  products,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  config,
  children,
}) => {
  const updateFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const appliedFilters = React.useMemo(() => {
    const applied: { id: string; category: string; label: string; value: string | number | boolean }[] = [];

    filters.brands.forEach((brand) => {
      const opt = brandOptions.find((o) => o.value === brand);
      applied.push({ id: `brand-${brand}`, category: 'Marca', label: opt?.label || brand, value: brand });
    });

    filters.usage.forEach((usage) => {
      const opt = usageOptions.find((o) => o.value === usage);
      applied.push({ id: `usage-${usage}`, category: 'Uso', label: opt?.label || usage, value: usage });
    });

    filters.gama.forEach((gama) => {
      const opt = gamaOptions.find((o) => o.value === gama);
      applied.push({ id: `gama-${gama}`, category: 'Gama', label: opt?.label || gama, value: gama });
    });

    return applied;
  }, [filters]);

  const handleRemoveFilter = (id: string) => {
    const [category, value] = id.split('-');
    switch (category) {
      case 'brand':
        updateFilter('brands', filters.brands.filter((b) => b !== value));
        break;
      case 'usage':
        updateFilter('usage', filters.usage.filter((u) => u !== value));
        break;
      case 'gama':
        updateFilter('gama', filters.gama.filter((g) => g !== value));
        break;
    }
  };

  const handleClearAll = () => {
    onFiltersChange({
      ...filters,
      brands: [],
      usage: [],
      gama: [],
      condition: [],
      priceRange: [1000, 8000],
      quotaRange: [40, 400],
    });
  };

  const renderBrandFilter = () => {
    const props = {
      options: brandOptions,
      selected: filters.brands,
      onChange: (brands: string[]) => updateFilter('brands', brands),
      showCounts: config.showFilterCounts,
    };

    switch (config.brandFilterVersion) {
      case 2: return <BrandFilterV2 {...props} />;
      case 3: return <BrandFilterV3 {...props} />;
      case 4: return <BrandFilterV4 {...props} />;
      case 5: return <BrandFilterV5 {...props} />;
      case 6: return <BrandFilterV6 {...props} />;
      default: return <BrandFilterV1 {...props} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with geometric shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-[#4654CD]/5">
        <motion.div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#4654CD]/5"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-1/3 -left-10 w-40 h-40 rounded-full bg-[#03DBD0]/10"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-60 h-60 rounded-full bg-[#4654CD]/5"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Floating Filter Card */}
        <aside className="hidden lg:block w-[320px] p-6">
          <Card className="sticky top-6 bg-white/95 backdrop-blur-sm shadow-xl border border-neutral-200/50">
            <CardBody className="p-4 max-h-[calc(100vh-80px)] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
                <h2 className="font-semibold text-neutral-800">Filtros</h2>
                {appliedFilters.length > 0 && (
                  <Button
                    size="sm"
                    variant="light"
                    startContent={<Trash2 className="w-4 h-4" />}
                    onPress={handleClearAll}
                    className="text-neutral-500 hover:text-red-500 cursor-pointer"
                  >
                    Limpiar
                  </Button>
                )}
              </div>

              {/* Brand Filter */}
              <FilterSection title="Marca" defaultExpanded={true}>
                {renderBrandFilter()}
              </FilterSection>

              {/* Price Filters */}
              <FilterSection title="Precio total" defaultExpanded={true}>
                <PriceRangeFilter
                  value={filters.priceRange}
                  onChange={(val) => updateFilter('priceRange', val)}
                />
              </FilterSection>

              <FilterSection title="Cuota mensual" defaultExpanded={false}>
                <QuotaRangeFilter
                  value={filters.quotaRange}
                  onChange={(val) => updateFilter('quotaRange', val)}
                  frequency={filters.quotaFrequency}
                  onFrequencyChange={(freq) => updateFilter('quotaFrequency', freq)}
                />
              </FilterSection>

              {/* Usage Filter */}
              <FilterSection title="Uso recomendado" tooltip={filterTooltips.ram} defaultExpanded={true}>
                <UsageFilter
                  options={usageOptions}
                  selected={filters.usage}
                  onChange={(usage) => updateFilter('usage', usage)}
                  showCounts={config.showFilterCounts}
                />
              </FilterSection>

              {/* Commercial Filters */}
              <CommercialFilters
                gamaOptions={gamaOptions}
                selectedGama={filters.gama}
                onGamaChange={(gama) => updateFilter('gama', gama)}
                conditionOptions={conditionOptions}
                selectedCondition={filters.condition}
                onConditionChange={(condition) => updateFilter('condition', condition)}
                onlyAvailable={filters.stock.includes('available')}
                onAvailableChange={(val) => updateFilter('stock', val ? ['available'] : [])}
                showCounts={config.showFilterCounts}
              />
            </CardBody>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-[#4654CD] font-['Baloo_2']">
                Catálogo de Equipos
              </h1>
              <p className="text-sm text-neutral-500">
                Encuentra el equipo perfecto para tus estudios
              </p>
            </div>

            <SortDropdown
              value={sort}
              onChange={onSortChange}
              totalProducts={products.length}
            />
          </motion.div>

          {/* Applied Filters Chips */}
          <FilterChips
            filters={appliedFilters}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAll}
          />

          {/* Products Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`grid gap-4 ${
              config.productsPerRow.desktop === 4
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : config.productsPerRow.desktop === 5
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
