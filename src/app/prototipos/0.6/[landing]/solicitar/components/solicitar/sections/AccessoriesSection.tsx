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

  const { selectedAccessories, toggleAccessory, setSelectedAccessories, selectedProduct, cartProducts } = useProduct();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailAccessory, setDetailAccessory] = useState<Accessory | null>(null);

  // Helper function to infer product type from name
  const inferProductType = (name: string): string | null => {
    const nameLower = name.toLowerCase();

    // Celular patterns
    if (nameLower.includes('galaxy') || nameLower.includes('iphone') || nameLower.includes('redmi') || nameLower.includes('xiaomi') || nameLower.includes('motorola') || nameLower.includes('poco') || nameLower.includes('samsung') || nameLower.includes('cel ') || nameLower.includes('cel-')) {
      return 'celular';
    }
    // Tablet patterns
    if (nameLower.includes('ipad') || nameLower.includes('tab ') || nameLower.includes('tablet')) {
      return 'tablet';
    }
    // Laptop patterns
    if (nameLower.includes('macbook') || nameLower.includes('laptop') || nameLower.includes('ideapad') || nameLower.includes('thinkpad') || nameLower.includes('pavilion') || nameLower.includes('vivobook') || nameLower.includes('notebook')) {
      return 'laptop';
    }
    return null;
  };

  // Create a STABLE key based on product IDs - this won't change unless products actually change
  // Using raw context values (cartProducts, selectedProduct) which have stable references
  const productsKey = useMemo(() => {
    const products = cartProducts.length > 0 ? cartProducts : (selectedProduct ? [selectedProduct] : []);
    return products.map(p => p.id).sort().join(',');
  }, [cartProducts, selectedProduct]);

  // Calculate product types from the stable products key
  const productTypesKey = useMemo(() => {
    const products = cartProducts.length > 0 ? cartProducts : (selectedProduct ? [selectedProduct] : []);
    const types = products
      .map((p) => inferProductType(p.name) || p.type || null)
      .filter((t): t is string => !!t);
    return [...new Set(types)].sort().join(',');
  }, [productsKey, cartProducts, selectedProduct]);

  // Load accessories from API - filtered by product types in cart
  useEffect(() => {
    async function fetchAccessories() {
      setIsLoading(true);
      try {
        // Pass product types to filter compatible accessories
        // If empty, backend returns all accessories (max 6)
        const typesArray = productTypesKey ? productTypesKey.split(',').filter(Boolean) : [];
        const apiAccessories = await getLandingAccessories(landing, typesArray);
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
  }, [landing, productTypesKey]);

  // Clean up selected accessories that are no longer available
  // This happens when cart products change and some accessories become incompatible
  // Use ref to avoid infinite loops when updating selectedAccessories
  const selectedAccessoriesRef = useRef(selectedAccessories);
  selectedAccessoriesRef.current = selectedAccessories;

  useEffect(() => {
    if (isLoading || accessories.length === 0) return;

    const availableIds = new Set(accessories.map((a) => a.id));
    const currentSelected = selectedAccessoriesRef.current;
    const hasInvalidSelected = currentSelected.some((a) => !availableIds.has(a.id));

    if (hasInvalidSelected) {
      // Remove accessories that are no longer compatible
      const validSelected = currentSelected.filter((a) => availableIds.has(a.id));
      setSelectedAccessories(validSelected);
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
      />
    </div>
  );
}
