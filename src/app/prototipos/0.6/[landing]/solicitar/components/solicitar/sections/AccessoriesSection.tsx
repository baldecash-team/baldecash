'use client';

/**
 * AccessoriesSection - Reusable accessories selection section
 * Can be used in Preview page (before wizard) or Complementos page (after wizard)
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProduct } from '../../../context/ProductContext';
import { AccessoryIntro, AccessoryCard, AccessoryDetailModal } from '../../upsell';
import { getLandingAccessories } from '@/app/prototipos/0.6/services/landingApi';
import type { Accessory, AccessoryCategory } from '../../../types/upsell';

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

  const { selectedAccessories, toggleAccessory } = useProduct();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailAccessory, setDetailAccessory] = useState<Accessory | null>(null);

  // Load accessories from API
  useEffect(() => {
    async function fetchAccessories() {
      setIsLoading(true);
      try {
        const apiAccessories = await getLandingAccessories(landing);
        if (apiAccessories && apiAccessories.length > 0) {
          const transformedAccessories: Accessory[] = apiAccessories.map((acc) => ({
            id: acc.id,
            name: acc.name,
            description: acc.description || '',
            price: acc.price,
            monthlyQuota: acc.monthlyQuota,
            image: acc.image || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
            category: (acc.category || 'protección') as AccessoryCategory,
            isRecommended: acc.isRecommended || false,
            compatibleWith: acc.compatibleWith || ['all'],
            specs: acc.specs || [],
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
  }, [landing]);

  return (
    <div className={`bg-white rounded-xl p-6 border border-neutral-200 ${className}`}>
      {showIntro && <AccessoryIntro />}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-[rgba(var(--color-primary-rgb),0.2)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      ) : accessories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessories.map((accessory) => (
            <AccessoryCard
              key={accessory.id}
              accessory={accessory}
              isSelected={selectedAccessories.some((a) => a.id === accessory.id)}
              onToggle={() => toggleAccessory(accessory)}
              onViewDetails={() => setDetailAccessory(accessory)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-neutral-500 py-4">No hay accesorios disponibles</p>
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
      />
    </div>
  );
}
