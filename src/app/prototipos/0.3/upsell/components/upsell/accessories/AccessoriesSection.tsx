'use client';

/**
 * AccessoriesSection - Seccion principal de accesorios
 *
 * Orquesta las cards de accesorios segun version
 * D.1: Introduccion sutil/directa/social proof
 * D.2: Texto "Todos los accesorios son opcionales"
 * D.4: Limite de accesorios
 */

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { AccessoryCardV1 } from './AccessoryCardV1';
import { AccessoryCardV2 } from './AccessoryCardV2';
import { AccessoryCardV3 } from './AccessoryCardV3';
import { Accessory, UpsellConfig } from '../../../types/upsell';

interface AccessoriesSectionProps {
  accessories: Accessory[];
  selectedAccessories: string[];
  onToggleAccessory: (id: string) => void;
  config: UpsellConfig;
}

// Carousel with Navigation Component
interface CarouselWithNavigationProps {
  accessories: Accessory[];
  selectedAccessories: string[];
  onToggleAccessory: (id: string) => void;
  showLimit: boolean;
  limitReached: boolean;
  CardComponent: React.ComponentType<{
    accessory: Accessory;
    isSelected: boolean;
    onToggle: () => void;
    showLimit: boolean;
    limitReached: boolean;
  }>;
}

const CarouselWithNavigation: React.FC<CarouselWithNavigationProps> = ({
  accessories,
  selectedAccessories,
  onToggleAccessory,
  showLimit,
  limitReached,
  CardComponent,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative">
      {/* Left Arrow */}
      {canScrollLeft && (
        <Button
          isIconOnly
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border border-neutral-200 cursor-pointer"
          size="sm"
          onPress={() => scroll('left')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
      >
        <div className="flex gap-4">
          {accessories.map((accessory) => (
            <CardComponent
              key={accessory.id}
              accessory={accessory}
              isSelected={selectedAccessories.includes(accessory.id)}
              onToggle={() => onToggleAccessory(accessory.id)}
              showLimit={showLimit}
              limitReached={limitReached}
            />
          ))}
        </div>
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <Button
          isIconOnly
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border border-neutral-200 cursor-pointer"
          size="sm"
          onPress={() => scroll('right')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Scroll Indicator - Enhanced */}
      <div className="flex flex-col items-center gap-2 mt-4">
        {/* Pagination dots */}
        <div className="flex gap-2">
          {accessories.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollRef.current) {
                  const cardWidth = 296; // 280px + 16px gap
                  scrollRef.current.scrollTo({
                    left: cardWidth * index,
                    behavior: 'smooth',
                  });
                }
              }}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                canScrollLeft && index === 0
                  ? 'bg-neutral-300'
                  : !canScrollRight && index === accessories.length - 1
                    ? 'bg-[#4654CD]'
                    : 'bg-neutral-200 hover:bg-neutral-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-neutral-400 flex items-center gap-2">
          <ChevronLeft className="w-3 h-3" />
          <span>Desliza o usa las flechas para ver mas</span>
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};

const getIntroContent = (
  type: UpsellConfig['accessoriesIntro']
): { icon: React.ReactNode; title: string; subtitle: string } => {
  switch (type) {
    case 'subtle':
      return {
        icon: <Package className="w-5 h-5" />,
        title: 'Complementa tu laptop',
        subtitle: 'Accesorios que mejoran tu experiencia',
      };
    case 'direct':
      return {
        icon: <Sparkles className="w-5 h-5" />,
        title: 'Accesorios recomendados',
        subtitle: 'Seleccionados especialmente para ti',
      };
    case 'social_proof':
      return {
        icon: <Users className="w-5 h-5" />,
        title: 'Los estudiantes tambien llevan...',
        subtitle: '8 de cada 10 estudiantes agregan accesorios',
      };
    default:
      return {
        icon: <Package className="w-5 h-5" />,
        title: 'Complementa tu laptop',
        subtitle: 'Accesorios que mejoran tu experiencia',
      };
  }
};

export const AccessoriesSection: React.FC<AccessoriesSectionProps> = ({
  accessories,
  selectedAccessories,
  onToggleAccessory,
  config,
}) => {
  const intro = getIntroContent(config.accessoriesIntro);

  // Check if limit is reached
  const limitReached = useMemo(() => {
    if (config.accessoryLimit === 'max_three') {
      return selectedAccessories.length >= 3;
    }
    return false;
  }, [selectedAccessories.length, config.accessoryLimit]);

  // Calculate total for warning
  const totalAccessoriesQuota = useMemo(() => {
    return accessories
      .filter((a) => selectedAccessories.includes(a.id))
      .reduce((sum, a) => sum + a.monthlyQuota, 0);
  }, [accessories, selectedAccessories]);

  const showWarning =
    config.accessoryLimit === 'warning_total' && totalAccessoriesQuota > 25;

  // Select card component based on version
  const CardComponent = {
    1: AccessoryCardV1,
    2: AccessoryCardV2,
    3: AccessoryCardV3,
  }[config.accessoryCardVersion];

  return (
    <section className="py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 text-[#4654CD] mb-1">
          {intro.icon}
          <h3 className="text-lg font-semibold text-neutral-800">
            {intro.title}
          </h3>
        </div>
        <p className="text-sm text-neutral-500">{intro.subtitle}</p>

        {/* D.2: Optional text */}
        <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-neutral-300" />
          Todos los accesorios son opcionales
        </p>
      </motion.div>

      {/* Limit indicator for max_three */}
      {config.accessoryLimit === 'max_three' && (
        <div className="mb-4 px-3 py-2 bg-neutral-50 rounded-lg inline-flex items-center gap-2">
          <span className="text-sm text-neutral-600">
            Seleccionados:{' '}
            <span className="font-semibold text-[#4654CD]">
              {selectedAccessories.length}
            </span>{' '}
            / 3
          </span>
        </div>
      )}

      {/* Warning for high total */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <p className="text-sm text-amber-700">
            Tu cuota mensual de accesorios es de{' '}
            <span className="font-bold">S/{totalAccessoriesQuota}</span>. Considera
            si todos son necesarios.
          </p>
        </motion.div>
      )}

      {/* Cards Grid/Carousel */}
      {config.accessoryCardVersion === 3 ? (
        // V3: Horizontal carousel with navigation
        <CarouselWithNavigation
          accessories={accessories}
          selectedAccessories={selectedAccessories}
          onToggleAccessory={onToggleAccessory}
          showLimit={config.accessoryLimit === 'max_three'}
          limitReached={limitReached}
          CardComponent={CardComponent}
        />
      ) : (
        // V1 & V2: Grid layout
        <div
          className={`grid gap-4 ${
            config.accessoryCardVersion === 1
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {accessories.map((accessory) => (
            <CardComponent
              key={accessory.id}
              accessory={accessory}
              isSelected={selectedAccessories.includes(accessory.id)}
              onToggle={() => onToggleAccessory(accessory.id)}
              showLimit={config.accessoryLimit === 'max_three'}
              limitReached={limitReached}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AccessoriesSection;
