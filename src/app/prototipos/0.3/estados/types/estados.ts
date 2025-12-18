// Estados Vacíos Types - BaldeCash v0.3
// Generated from PROMPT_07_ESTADO_VACIO.md

export interface EmptyStateConfig {
  // Visual style
  visualVersion: 1 | 2 | 3;

  // Show suggestions panel
  showSuggestions: boolean;

  // Number of suggested products
  suggestionsCount: 3 | 6;

  // Show filter actions
  showFilterActions: boolean;

  // Animation level
  animationLevel: 'none' | 'subtle' | 'full';
}

export const defaultEmptyStateConfig: EmptyStateConfig = {
  visualVersion: 1,
  showSuggestions: true,
  suggestionsCount: 3,
  showFilterActions: true,
  animationLevel: 'subtle',
};

export interface EmptyStateScenario {
  id: string;
  name: string;
  description: string;
  activeFilters: number;
  filterDescription: string;
}

export const emptyStateScenarios: EmptyStateScenario[] = [
  {
    id: 'no-filters',
    name: 'Sin Filtros',
    description: 'Catálogo vacío sin filtros aplicados',
    activeFilters: 0,
    filterDescription: 'No hay productos disponibles en este momento',
  },
  {
    id: 'strict-filters',
    name: 'Filtros Estrictos',
    description: 'Demasiados filtros aplicados',
    activeFilters: 5,
    filterDescription: 'HP + Gaming + 32GB RAM + SSD 1TB + Menos de S/1000',
  },
  {
    id: 'price-range',
    name: 'Rango de Precio',
    description: 'Precio fuera de rango disponible',
    activeFilters: 1,
    filterDescription: 'Precio entre S/100 y S/200',
  },
  {
    id: 'brand-specific',
    name: 'Marca Específica',
    description: 'Marca sin stock',
    activeFilters: 2,
    filterDescription: 'Apple + MacBook',
  },
];

export interface SuggestedProduct {
  id: string;
  brand: string;
  displayName: string;
  thumbnail: string;
  lowestQuota: number;
  price: number;
  gama: 'entry' | 'media' | 'alta' | 'premium';
}

export const mockSuggestedProducts: SuggestedProduct[] = [
  {
    id: 'suggestion-1',
    brand: 'Lenovo',
    displayName: 'IdeaPad 3 15" AMD Ryzen 5',
    thumbnail: '/products/laptops/lenovo-ideapad.png',
    lowestQuota: 89,
    price: 1799,
    gama: 'media',
  },
  {
    id: 'suggestion-2',
    brand: 'HP',
    displayName: 'HP 15 Intel Core i5 12th Gen',
    thumbnail: '/products/laptops/hp-15.png',
    lowestQuota: 79,
    price: 1599,
    gama: 'media',
  },
  {
    id: 'suggestion-3',
    brand: 'Acer',
    displayName: 'Aspire 5 AMD Ryzen 7',
    thumbnail: '/products/laptops/acer-aspire.png',
    lowestQuota: 99,
    price: 1999,
    gama: 'alta',
  },
  {
    id: 'suggestion-4',
    brand: 'ASUS',
    displayName: 'VivoBook 15 OLED',
    thumbnail: '/products/laptops/asus-vivobook.png',
    lowestQuota: 109,
    price: 2199,
    gama: 'alta',
  },
  {
    id: 'suggestion-5',
    brand: 'Dell',
    displayName: 'Inspiron 15 3000',
    thumbnail: '/products/laptops/dell-inspiron.png',
    lowestQuota: 69,
    price: 1399,
    gama: 'entry',
  },
  {
    id: 'suggestion-6',
    brand: 'MSI',
    displayName: 'Modern 14 Business',
    thumbnail: '/products/laptops/msi-modern.png',
    lowestQuota: 119,
    price: 2399,
    gama: 'alta',
  },
];
