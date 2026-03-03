// lib/api.ts - BaldeCash Catalog API Client

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

/** Product as returned by the backend API */
export interface ApiProduct {
  id: number;
  sku: string;
  name: string;
  short_name: string | null;
  slug: string;
  type: string | null;
  condition: string | null;
  short_description: string | null;
  brand: {
    slug: string | null;
    name: string | null;
    logo_url: string | null;
  };
  category: {
    slug: string | null;
    name: string | null;
  } | null;
  price: number;
  is_featured: boolean;
  stock_available: number;
  specs: Record<string, string | number | boolean | null>;
  colors: Array<{ id: string; name: string; hex: string }>;
  images: string[];
  labels: string[];
}

export interface ApiProductResponse {
  products: ApiProduct[];
  total: number;
}

/** Fetch all catalog products from the backend API */
export async function fetchCatalogProducts(): Promise<ApiProductResponse> {
  const response = await fetch(`${API_URL}/public/catalog/products`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
