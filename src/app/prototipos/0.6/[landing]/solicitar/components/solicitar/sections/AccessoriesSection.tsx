'use client';

/**
 * AccessoriesSection - Reusable accessories selection section
 * Can be used in Preview page (before wizard) or Complementos page (after wizard)
 *
 * Accessory Compatibility:
 * - Filters accessories based on product types in the cart
 * - If cart is empty, shows all accessories for the landing
 * - If cart has products, shows only compatible accessories (max 6)
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useProduct } from '../../../context/ProductContext';
import { AccessoryIntro, AccessoryCard, AccessoryDetailModal } from '../../upsell';
import { getLandingAccessories } from '@/app/prototipos/0.6/services/landingApi';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useWizardConfig } from '../../../context/WizardConfigContext';
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

  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  const { badgeText } = useWizardConfig();
  const { selectedAccessories, toggleAccessory, setSelectedAccessories, selectedProduct, cartProducts, getAllProducts } = useProduct();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailAccessory, setDetailAccessory] = useState<Accessory | null>(null);

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
            category: (acc.category || 'accesorios') as AccessoryCategory,
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
  // This handles:
  // 1. Removing accessories that are no longer compatible (product type change)
  // 2. Updating monthlyQuota when term changes (recalculated by API)
  const selectedAccessoriesRef = useRef(selectedAccessories);
  selectedAccessoriesRef.current = selectedAccessories;

  useEffect(() => {
    if (isLoading || accessories.length === 0) return;

    const accessoriesMap = new Map(accessories.map((a) => [a.id, a]));
    const currentSelected = selectedAccessoriesRef.current;

    // Check if any selected accessory needs update
    let needsUpdate = false;
    const updatedSelected: Accessory[] = [];

    for (const selected of currentSelected) {
      const freshAccessory = accessoriesMap.get(selected.id);

      if (!freshAccessory) {
        // Accessory no longer available (incompatible) - remove it
        needsUpdate = true;
        continue;
      }

      // Check if monthlyQuota changed (term changed)
      if (selected.monthlyQuota !== freshAccessory.monthlyQuota) {
        needsUpdate = true;
        updatedSelected.push(freshAccessory); // Use fresh data with new monthlyQuota
      } else {
        updatedSelected.push(selected);
      }
    }

    if (needsUpdate) {
      setSelectedAccessories(updatedSelected);
    }
  }, [accessories, isLoading, setSelectedAccessories]);

  // Si no hay accesorios disponibles, no mostrar la sección
  if (!isLoading && accessories.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl p-6 border border-neutral-200 ${className}`}>
      {showIntro && <AccessoryIntro />}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-[rgba(var(--color-primary-rgb),0.2)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      ) : (
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
