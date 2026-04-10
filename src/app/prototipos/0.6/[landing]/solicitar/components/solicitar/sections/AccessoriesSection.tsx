'use client';

/**
 * AccessoriesSection - Reusable accessories selection section
 * Can be used in Preview page (before wizard) or Complementos page (after wizard)
 *
 * Accessory Compatibility:
 * - Filters accessories based on product types in the cart
 * - If cart is empty, shows all accessories for the landing
 * - If cart has products, shows only compatible accessories (limit configurable via system_config)
 *
 * Shows 6 at a time with "Ver más" pagination, category chips and search filter.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Search, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProduct } from '../../../context/ProductContext';
import { AccessoryIntro, AccessoryCard, AccessoryDetailModal } from '../../upsell';
import { getLandingAccessories } from '@/app/prototipos/0.6/services/landingApi';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useWizardConfig } from '../../../context/WizardConfigContext';
import type { Accessory, AccessoryCategory } from '../../../types/upsell';

/** Responsive page size: 2 mobile, 4 tablet, 6 desktop */
function usePageSize() {
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const update = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setPageSize(6); // lg: 3 cols × 2 rows
      } else if (window.matchMedia('(min-width: 640px)').matches) {
        setPageSize(4); // sm: 2 cols × 2 rows
      } else {
        setPageSize(2); // mobile: 1 col × 2 rows
      }
    };

    update();
    const lg = window.matchMedia('(min-width: 1024px)');
    const sm = window.matchMedia('(min-width: 640px)');
    lg.addEventListener('change', update);
    sm.addEventListener('change', update);
    return () => {
      lg.removeEventListener('change', update);
      sm.removeEventListener('change', update);
    };
  }, []);

  return pageSize;
}

interface AccessoriesSectionProps {
  /**
   * Optional: Show section title and intro
   * @default true
   */
  showIntro?: boolean;
  /**
   * Optional: Custom class name for the container
   */
  className?: string;
}

export function AccessoriesSection({
  showIntro = true,
  className = '',
}: AccessoriesSectionProps) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  const { badgeText } = useWizardConfig();
  const { selectedAccessories, toggleAccessory, setSelectedAccessories, selectedProduct, cartProducts, getAllProducts } = useProduct();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailAccessory, setDetailAccessory] = useState<Accessory | null>(null);

  // Filters — activeCategory es un slug de subcategoría o 'todos'
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination (page-based, responsive)
  const pageSize = usePageSize();
  const [currentPage, setCurrentPage] = useState(0);

  // Collect all unique device types from cart (union for multi-product carts)
  const deviceTypes = useMemo(() => {
    const products = cartProducts?.length > 0 ? cartProducts : (selectedProduct ? [selectedProduct] : []);
    const types = [...new Set(
      products.map(p => p.type?.toLowerCase()).filter(Boolean) as string[]
    )];
    return types.length > 0 ? types : ['laptop'];
  }, [cartProducts, selectedProduct]);

  // Get current term from cart (use first product's term or default 24)
  const currentTerm = useMemo(() => {
    const products = getAllProducts();
    if (products.length > 0 && products[0].months) {
      return products[0].months;
    }
    return 24; // Default term
  }, [getAllProducts]);

  // Load accessories from API - filtered by all device types in cart
  useEffect(() => {
    async function fetchAccessories() {
      setIsLoading(true);
      try {
        const apiAccessories = await getLandingAccessories(landing, deviceTypes, currentTerm, previewKey);
        if (apiAccessories && apiAccessories.length > 0) {
          const transformedAccessories: Accessory[] = apiAccessories.map((acc) => ({
            id: acc.id,
            name: acc.name,
            description: acc.description || '',
            price: acc.price,
            monthlyQuota: acc.monthlyQuota,
            term: acc.term,
            image: acc.image,
            thumbnailUrl: acc.thumbnail_url,
            category: acc.category ?? { slug: 'otro', name: 'Otro' },
            isRecommended: acc.isRecommended || false,
            compatibleWith: acc.compatibleWith || ['all'],
            specs: acc.specs || [],
            brand: acc.brand,
          }));
          setAccessories(transformedAccessories);
        } else {
          setAccessories([]);
        }
      } catch (error) {
        console.error('Error loading accessories:', error);
        setAccessories([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccessories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landing, currentTerm, deviceTypes.join(',')]);

  // Update selected accessories when term changes or accessories list changes
  const selectedAccessoriesRef = useRef(selectedAccessories);
  selectedAccessoriesRef.current = selectedAccessories;

  useEffect(() => {
    if (isLoading || accessories.length === 0) return;

    const accessoriesMap = new Map(accessories.map((a) => [a.id, a]));
    const currentSelected = selectedAccessoriesRef.current;

    let needsUpdate = false;
    const updatedSelected: Accessory[] = [];

    for (const selected of currentSelected) {
      const freshAccessory = accessoriesMap.get(selected.id);

      if (!freshAccessory) {
        needsUpdate = true;
        continue;
      }

      if (selected.monthlyQuota !== freshAccessory.monthlyQuota) {
        needsUpdate = true;
        updatedSelected.push(freshAccessory);
      } else {
        updatedSelected.push(selected);
      }
    }

    if (needsUpdate) {
      setSelectedAccessories(updatedSelected);
    }
  }, [accessories, isLoading, setSelectedAccessories]);

  // Subcategorías disponibles (solo las que tienen items), deduplicadas por slug
  const availableCategories = useMemo(() => {
    const map = new Map<string, AccessoryCategory>();
    accessories.forEach((a) => {
      if (a.category && !map.has(a.category.slug)) {
        map.set(a.category.slug, a.category);
      }
    });
    return Array.from(map.values());
  }, [accessories]);

  // Filtered accessories (subcategory slug + search)
  const filteredAccessories = useMemo(() => {
    let filtered = accessories;
    if (activeCategory !== 'todos') {
      filtered = filtered.filter((a) => a.category?.slug === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [accessories, activeCategory, searchQuery]);

  // Reset page when filters or page size change
  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory, searchQuery, pageSize]);

  const totalPages = Math.ceil(filteredAccessories.length / pageSize);
  const visibleAccessories = filteredAccessories.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const canGoBack = currentPage > 0;
  const canGoForward = currentPage < totalPages - 1;

  // Si no hay accesorios disponibles, no mostrar la sección
  if (!isLoading && accessories.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl p-4 sm:p-6 border border-neutral-200 ${className}`}>
      {showIntro && <AccessoryIntro />}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-[rgba(var(--color-primary-rgb),0.2)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Toolbar: Category chips + Arrows + Search + Selected count */}
          <div className="mb-4 space-y-3">
            {/* Category chips + navigation arrows */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <button
                  onClick={() => setActiveCategory('todos')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    activeCategory === 'todos'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Todos ({accessories.length})
                </button>
                {availableCategories.map((cat) => {
                  const count = accessories.filter((a) => a.category?.slug === cat.slug).length;
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        activeCategory === cat.slug
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {cat.name} ({count})
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Search + accessory count + arrows */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar accesorio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 sm:ml-auto">
                {selectedAccessories.length > 0 && (
                  <span className="px-3 py-1.5 bg-[#22c55e]/10 text-[#22c55e] text-xs font-semibold rounded-full">
                    {selectedAccessories.length} seleccionado{selectedAccessories.length > 1 ? 's' : ''}
                  </span>
                )}
                <span className="text-xs text-neutral-400 ml-auto sm:ml-0">
                  {filteredAccessories.length} accesorio{filteredAccessories.length !== 1 ? 's' : ''}
                </span>
                {totalPages > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={!canGoBack}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        canGoBack
                          ? 'bg-[var(--color-primary)] text-white hover:brightness-90'
                          : 'bg-neutral-100 text-neutral-300 cursor-default'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!canGoForward}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        canGoForward
                          ? 'bg-[var(--color-primary)] text-white hover:brightness-90'
                          : 'bg-neutral-100 text-neutral-300 cursor-default'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Grid */}
          {filteredAccessories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
              <Package className="w-10 h-10 mb-2" />
              <p className="text-sm">No se encontraron accesorios</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleAccessories.map((accessory) => (
                  <AccessoryCard
                    key={accessory.id}
                    accessory={accessory}
                    isSelected={selectedAccessories.some((a) => a.id === accessory.id)}
                    onToggle={() => toggleAccessory(accessory)}
                    onViewDetails={() => setDetailAccessory(accessory)}
                  />
                ))}
              </div>

            </>
          )}
        </>
      )}

      {/* Accessory Detail Modal */}
      <AccessoryDetailModal
        accessory={detailAccessory}
        isOpen={!!detailAccessory}
        onClose={() => setDetailAccessory(null)}
        isSelected={detailAccessory ? selectedAccessories.some((a) => a.id === detailAccessory.id) : false}
        onToggle={() => {
          if (detailAccessory) {
            toggleAccessory(detailAccessory);
          }
        }}
        badgeText={badgeText}
      />
    </div>
  );
}
