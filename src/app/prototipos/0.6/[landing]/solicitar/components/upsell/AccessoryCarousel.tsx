'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Plus, Search, Package, Info } from 'lucide-react';
import type { Accessory, AccessoryCategory } from '../../types/upsell';
import { ACCESSORY_CATEGORY_LABELS } from '../../types/upsell';
import { formatMoneyNoDecimals } from '../../utils/formatMoney';

interface AccessoryCarouselProps {
  accessories: Accessory[];
  selectedAccessories: Accessory[];
  onToggle: (accessory: Accessory) => void;
  onViewDetails: (accessory: Accessory) => void;
}

export const AccessoryCarousel: React.FC<AccessoryCarouselProps> = ({
  accessories,
  selectedAccessories,
  onToggle,
  onViewDetails,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeCategory, setActiveCategory] = useState<AccessoryCategory | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Derive available categories from accessories
  const availableCategories = useMemo(() => {
    const cats = new Set<AccessoryCategory>();
    accessories.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [accessories]);

  // Filter accessories by category and search
  const filteredAccessories = useMemo(() => {
    let filtered = accessories;
    if (activeCategory !== 'todos') {
      filtered = filtered.filter((a) => a.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [accessories, activeCategory, searchQuery]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  // Reset scroll position when filters change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0 });
    }
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery]);

  // Check scroll on mount and when filtered list changes
  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [filteredAccessories]);

  const selectedIds = new Set(selectedAccessories.map((a) => a.id));

  return (
    <div>
      {/* Toolbar: Category chips + Search + Selected count */}
      <div className="mb-4 space-y-3">
        {/* Row: chips + arrows (desktop) */}
        <div className="flex items-center gap-3">
          {/* Category chips - scrollable */}
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
              const count = accessories.filter((a) => a.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {ACCESSORY_CATEGORY_LABELS[cat] || cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Navigation Arrows - Desktop */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                canScrollLeft
                  ? 'bg-[var(--color-primary)] text-white hover:brightness-90'
                  : 'bg-neutral-100 text-neutral-300'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                canScrollRight
                  ? 'bg-[var(--color-primary)] text-white hover:brightness-90'
                  : 'bg-neutral-100 text-neutral-300'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search + selected count */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar accesorio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
            />
          </div>
          {selectedAccessories.length > 0 && (
            <span className="flex-shrink-0 px-3 py-1.5 bg-[#22c55e]/10 text-[#22c55e] text-xs font-semibold rounded-full">
              {selectedAccessories.length} seleccionado{selectedAccessories.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Carousel */}
      {filteredAccessories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
          <Package className="w-10 h-10 mb-2" />
          <p className="text-sm">No se encontraron accesorios</p>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredAccessories.map((accessory, index) => {
              const isSelected = selectedIds.has(accessory.id);
              return (
                <motion.div
                  key={accessory.id}
                  className="w-[170px] md:w-[190px] snap-start flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <div
                    onClick={() => onToggle(accessory)}
                    className={`relative h-full rounded-xl border-2 p-3 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-[#22c55e] bg-[#22c55e]/5'
                        : 'border-neutral-200 hover:border-[rgba(var(--color-primary-rgb),0.3)] bg-white'
                    }`}
                  >
                    {/* Selection indicator */}
                    <div
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#22c55e] opacity-100 scale-100'
                          : 'bg-neutral-100 opacity-60 scale-90'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </div>

                    {/* Popular badge */}
                    {accessory.isRecommended && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-[var(--color-primary)] text-white text-[10px] font-medium px-2 py-0.5 rounded">
                          Popular
                        </span>
                      </div>
                    )}

                    {/* Image */}
                    <div className="w-full h-20 mb-2 flex items-center justify-center mt-2">
                      <img
                        src={accessory.thumbnailUrl || accessory.image}
                        alt={accessory.name}
                        className="max-h-[72px] max-w-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Name */}
                    <h4 className="font-semibold text-xs text-neutral-800 line-clamp-2 min-h-[2rem] mb-1">
                      {accessory.name}
                    </h4>

                    {/* View details link */}
                    <div
                      role="button"
                      tabIndex={0}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(accessory);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          onViewDetails(accessory);
                        }
                      }}
                      className="flex items-center gap-1 text-[10px] text-[var(--color-primary)] font-medium mb-2 cursor-pointer hover:underline"
                    >
                      <Info className="w-3 h-3" />
                      Ver detalles
                    </div>

                    {/* Price */}
                    <div className="mt-auto">
                      <span className="text-[var(--color-primary)] font-bold text-sm">
                        +S/{formatMoneyNoDecimals(Math.floor(accessory.monthlyQuota))}/mes
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Scroll Hint */}
          <p className="md:hidden text-center text-xs text-neutral-400 mt-2">
            Desliza para ver mas →
          </p>
        </>
      )}
    </div>
  );
};

export default AccessoryCarousel;
