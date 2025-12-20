'use client';

import React, { useState } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { ChevronDown, SlidersHorizontal, Trash2 } from 'lucide-react';
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
 * CatalogLayoutV2 - Filtros Horizontales Colapsables
 * Filtros en fila horizontal arriba del grid, colapsables
 * Referencia: Apple Store, Nike, Zara
 */
export const CatalogLayoutV2: React.FC<CatalogLayoutProps> = ({
  products,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  config,
  children,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
          variant="bordered"
          endContent={<ChevronDown className="w-4 h-4" />}
          className={`cursor-pointer border-neutral-200 hover:border-[#4654CD]/50 ${
            count > 0 ? 'border-[#4654CD] bg-[#4654CD]/5' : ''
          }`}
        >
          {label}
          {count > 0 && (
            <span className="ml-1 w-5 h-5 bg-[#4654CD] text-white rounded-full text-xs flex items-center justify-center">
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#4654CD] font-['Baloo_2']">
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
        </div>

        {/* Horizontal Filters Bar */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-neutral-500 mr-2">
              <SlidersHorizontal className="w-4 h-4 inline mr-1" />
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
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={handleClearAll}
                className="text-neutral-500 hover:text-red-500 cursor-pointer ml-auto"
              >
                Limpiar todo
              </Button>
            )}
          </div>
        </div>

        {/* Applied Filters Chips */}
        <FilterChips
          filters={appliedFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAll}
        />

        {/* Products Grid */}
        <div
          className={`grid gap-4 ${
            config.productsPerRow.desktop === 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : config.productsPerRow.desktop === 5
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
