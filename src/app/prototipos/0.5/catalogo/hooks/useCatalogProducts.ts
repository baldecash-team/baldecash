'use client';

// hooks/useCatalogProducts.ts - Hook to fetch catalog products from the API

import { useState, useEffect } from 'react';
import type { CatalogProduct } from '../types/catalog';
import { fetchCatalogProducts } from '../lib/api';
import { mapApiProductToCatalog } from '../lib/productMapper';

interface UseCatalogProductsResult {
  products: CatalogProduct[];
  isLoading: boolean;
  error: string | null;
  isFromApi: boolean;
}

export function useCatalogProducts(): UseCatalogProductsResult {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromApi, setIsFromApi] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetchCatalogProducts();

        if (cancelled) return;

        const mapped = response.products.map(mapApiProductToCatalog);
        setProducts(mapped);
        setIsFromApi(true);
        setError(null);
      } catch (err) {
        if (cancelled) return;

        console.error('[useCatalogProducts] API error:', err);
        setProducts([]);
        setIsFromApi(false);
        setError(
          err instanceof Error
            ? err.message
            : 'Error al cargar productos del servidor'
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  return { products, isLoading, error, isFromApi };
}
