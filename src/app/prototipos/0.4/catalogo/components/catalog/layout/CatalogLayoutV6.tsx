'use client';

import React, { useState, useEffect } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { ChevronDown, Trash2, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { CatalogLayoutProps } from '../../../types/catalog';
import { FilterChips } from '../filters/FilterChips';
import { SortDropdown } from '../sorting/SortDropdown';
import { PriceRangeFilter } from '../filters/PriceRangeFilter';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { UsageFilter } from '../filters/UsageFilter';
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
  ramOptions,
  gamaOptions,
} from '../../../data/mockCatalogData';

/**
 * CatalogLayoutV6 - Centrado con Filtros Sticky
 * Grid centrado, filtros como barra sticky superior
 * Referencia: Spotify Browse, Netflix categorías
 */
export const CatalogLayoutV6: React.FC<CatalogLayoutProps> = ({
  products,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  config,
  children,
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    filters.ram.forEach((ram) => {
      applied.push({ id: `ram-${ram}`, category: 'RAM', label: `${ram} GB`, value: ram });
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
      case 'ram':
        updateFilter('ram', filters.ram.filter((r) => r !== parseInt(value)));
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
      ram: [],
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

  const FilterDropdown = ({
    id,
    label,
    count,
    children: dropdownContent
  }: {
    id: string;
    label: string;
    count: number;
    children: React.ReactNode;
  }) => (
    <Dropdown
      isOpen={openDropdown === id}
      onOpenChange={(open) => setOpenDropdown(open ? id : null)}
    >
      <DropdownTrigger>
        <Button
          size="sm"
          variant="bordered"
          endContent={<ChevronDown className="w-3 h-3" />}
          className={`cursor-pointer border-neutral-200 hover:border-[#4654CD]/50 ${
            count > 0 ? 'border-[#4654CD] bg-[#4654CD]/5 text-[#4654CD]' : ''
          }`}
        >
          {label}
          {count > 0 && (
            <span className="ml-1 w-4 h-4 bg-[#4654CD] text-white rounded-full text-[10px] flex items-center justify-center">
              {count}
            </span>
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={label}
        closeOnSelect={false}
        className="min-w-[280px] p-4"
      >
        <DropdownItem key="content" className="cursor-default" isReadOnly>
          {dropdownContent}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Header */}
      <div className="bg-[#4654CD] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold font-['Baloo_2'] mb-2"
          >
            Catálogo de Equipos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80"
          >
            Encuentra el equipo perfecto para tus estudios
          </motion.p>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <motion.div
        className={`sticky top-0 z-40 bg-white border-b border-neutral-200 transition-shadow ${
          isSticky ? 'shadow-md' : ''
        }`}
        initial={{ y: 0 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-neutral-500 flex items-center gap-1">
                <SlidersHorizontal className="w-4 h-4" />
                Filtros:
              </span>

              {/* Brand Dropdown */}
              <FilterDropdown id="brand" label="Marca" count={filters.brands.length}>
                {renderBrandFilter()}
              </FilterDropdown>

              {/* Price Dropdown */}
              <FilterDropdown id="price" label="Precio" count={0}>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-2">Precio total</p>
                    <PriceRangeFilter
                      value={filters.priceRange}
                      onChange={(val) => updateFilter('priceRange', val)}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-2">Cuota mensual</p>
                    <QuotaRangeFilter
                      value={filters.quotaRange}
                      onChange={(val) => updateFilter('quotaRange', val)}
                      frequency={filters.quotaFrequency}
                      onFrequencyChange={(freq) => updateFilter('quotaFrequency', freq)}
                    />
                  </div>
                </div>
              </FilterDropdown>

              {/* Usage Dropdown */}
              <FilterDropdown id="usage" label="Uso" count={filters.usage.length}>
                <UsageFilter
                  options={usageOptions}
                  selected={filters.usage}
                  onChange={(usage) => updateFilter('usage', usage)}
                  showCounts={config.showFilterCounts}
                />
              </FilterDropdown>

              {/* RAM Dropdown */}
              <FilterDropdown id="ram" label="RAM" count={filters.ram.length}>
                <div className="space-y-2">
                  {ramOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.ram.includes(parseInt(opt.value))}
                        onChange={() => {
                          const ramVal = parseInt(opt.value);
                          if (filters.ram.includes(ramVal)) {
                            updateFilter('ram', filters.ram.filter((r) => r !== ramVal));
                          } else {
                            updateFilter('ram', [...filters.ram, ramVal]);
                          }
                        }}
                        className="w-4 h-4 accent-[#4654CD]"
                      />
                      <span className="text-sm text-neutral-700">{opt.label}</span>
                      {config.showFilterCounts && (
                        <span className="text-xs text-neutral-400 ml-auto">({opt.count})</span>
                      )}
                    </label>
                  ))}
                </div>
              </FilterDropdown>

              {/* Clear All */}
              {appliedFilters.length > 0 && (
                <Button
                  size="sm"
                  variant="light"
                  startContent={<Trash2 className="w-3 h-3" />}
                  onPress={handleClearAll}
                  className="text-neutral-500 hover:text-red-500 cursor-pointer text-xs"
                >
                  Limpiar
                </Button>
              )}
            </div>

            <SortDropdown
              value={sort}
              onChange={onSortChange}
              totalProducts={products.length}
            />
          </div>
        </div>
      </motion.div>

      {/* Main Content - Centered */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Applied Filters Chips */}
        <FilterChips
          filters={appliedFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAll}
        />

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
  );
};
