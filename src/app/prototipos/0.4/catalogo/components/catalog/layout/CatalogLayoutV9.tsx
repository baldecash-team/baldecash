'use client';

/**
 * CatalogLayoutV9 - Storytelling Categories
 *
 * Categorias por narrativa: "Para estudiar", "Para crear", etc.
 * Navegacion por casos de uso con diseño editorial
 */

import React, { useState } from 'react';
import { Button, Chip } from '@nextui-org/react';
import { SlidersHorizontal, BookOpen, Palette, Briefcase, Gamepad2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { FilterSection } from '../filters/FilterSection';
import { FilterChips } from '../filters/FilterChips';
import { FilterDrawer } from '../filters/FilterDrawer';
import {
  BrandFilterV1,
  BrandFilterV2,
  BrandFilterV3,
  BrandFilterV4,
  BrandFilterV5,
  BrandFilterV6,
  BrandFilterV7,
  BrandFilterV8,
  BrandFilterV9,
  BrandFilterV10,
} from '../filters/brand';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { SortDropdown } from '../sorting/SortDropdown';
import { brandOptions } from '../../../data/mockCatalogData';
import {
  CatalogConfig,
  FilterState,
  SortOption,
  AppliedFilter,
  defaultFilterState,
  UsageType,
} from '../../../types/catalog';

interface CatalogLayoutV9Props {
  config: CatalogConfig;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  productCount: number;
  children: React.ReactNode;
}

const categories = [
  {
    id: 'study' as UsageType,
    label: 'Para estudiar',
    description: 'Ideales para clases virtuales y tareas',
    icon: BookOpen,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'creative' as UsageType,
    label: 'Para crear',
    description: 'Diseño grafico, video y mas',
    icon: Palette,
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'work' as UsageType,
    label: 'Para trabajar',
    description: 'Productividad y oficina',
    icon: Briefcase,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'gaming' as UsageType,
    label: 'Para jugar',
    description: 'Gaming y entretenimiento',
    icon: Gamepad2,
    gradient: 'from-orange-500 to-red-600',
  },
];

export const CatalogLayoutV9: React.FC<CatalogLayoutV9Props> = ({
  config,
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  productCount,
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<UsageType | null>(
    filters.usage.length > 0 ? filters.usage[0] : null
  );

  const BrandFilter = {
    1: BrandFilterV1,
    2: BrandFilterV2,
    3: BrandFilterV3,
    4: BrandFilterV4,
    5: BrandFilterV5,
    6: BrandFilterV6,
    7: BrandFilterV7,
    8: BrandFilterV8,
    9: BrandFilterV9,
    10: BrandFilterV10,
  }[config.brandFilterVersion];

  const appliedFilters: AppliedFilter[] = [];
  if (filters.brands.length > 0) {
    filters.brands.forEach((brand) => {
      const option = brandOptions.find((o) => o.value === brand);
      if (option) {
        appliedFilters.push({
          id: `brand-${brand}`,
          category: 'Marca',
          label: option.label,
          value: brand,
        });
      }
    });
  }

  const handleCategoryClick = (categoryId: UsageType) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      onFiltersChange({ ...filters, usage: [] });
    } else {
      setActiveCategory(categoryId);
      onFiltersChange({ ...filters, usage: [categoryId] });
    }
  };

  const handleRemoveFilter = (filterId: string) => {
    if (filterId.startsWith('brand-')) {
      const brand = filterId.replace('brand-', '');
      onFiltersChange({ ...filters, brands: filters.brands.filter((b) => b !== brand) });
    }
  };

  const handleClearAll = () => {
    setActiveCategory(null);
    onFiltersChange(defaultFilterState);
  };

  const FilterContent = (
    <>
      <FilterSection title="Cuota mensual">
        <QuotaRangeFilter
          min={40}
          max={400}
          value={filters.quotaRange}
          frequency={filters.quotaFrequency}
          onChange={(range) => onFiltersChange({ ...filters, quotaRange: range })}
          onFrequencyChange={(freq) => onFiltersChange({ ...filters, quotaFrequency: freq })}
        />
      </FilterSection>

      <FilterSection title="Marca">
        <BrandFilter
          options={brandOptions}
          selected={filters.brands}
          onChange={(brands) => onFiltersChange({ ...filters, brands })}
        />
      </FilterSection>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Categories Section */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-[#4654CD]" />
            <h1 className="text-2xl font-bold text-neutral-800 font-['Baloo_2']">
              Encuentra tu laptop ideal
            </h1>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <motion.button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`relative overflow-hidden rounded-xl p-4 text-left transition-all cursor-pointer ${
                    isActive
                      ? `bg-gradient-to-br ${category.gradient} text-white shadow-lg scale-[1.02]`
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                  whileHover={{ scale: isActive ? 1.02 : 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`w-8 h-8 mb-2 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  <h3 className="font-semibold text-base">{category.label}</h3>
                  <p className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-neutral-500'}`}>
                    {category.description}
                  </p>
                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 rounded-xl border-2 border-white/30"
                      initial={false}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="bg-white rounded-lg border border-neutral-200 p-4 sticky top-4">
              <h2 className="text-lg font-semibold text-neutral-800 font-['Baloo_2'] mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#4654CD]" />
                Refinar busqueda
              </h2>
              {FilterContent}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Button
                className="w-full bg-white border border-neutral-200 text-neutral-700 cursor-pointer"
                startContent={<SlidersHorizontal className="w-4 h-4" />}
                onPress={() => setDrawerOpen(true)}
              >
                Filtros
              </Button>
            </div>

            {/* Active Category Indicator */}
            {activeCategory && (
              <div className="mb-4">
                <Chip
                  variant="flat"
                  color="primary"
                  onClose={() => handleCategoryClick(activeCategory)}
                  className="bg-[#4654CD]/10 text-[#4654CD]"
                >
                  {categories.find((c) => c.id === activeCategory)?.label}
                </Chip>
              </div>
            )}

            {/* Sort and Chips */}
            <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-4">
              <SortDropdown value={sortOption} onChange={onSortChange} productCount={productCount} />
              {appliedFilters.length > 0 && (
                <div className="mt-4">
                  <FilterChips
                    appliedFilters={appliedFilters}
                    onRemoveFilter={handleRemoveFilter}
                    onClearAll={handleClearAll}
                  />
                </div>
              )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children}
            </div>
          </main>
        </div>
      </div>

      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        appliedCount={appliedFilters.length}
        onClearAll={handleClearAll}
      >
        {FilterContent}
      </FilterDrawer>
    </div>
  );
};

export default CatalogLayoutV9;
