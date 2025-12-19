/**
 * Catalog Components - v0.4
 *
 * Main exports for the catalog A/B testing system
 */

// Main components
export { CatalogSection, default as CatalogSectionDefault } from './CatalogSection';
export { CatalogSettingsModal, default as CatalogSettingsModalDefault } from './CatalogSettingsModal';
export { ProductCard, default as ProductCardDefault } from './ProductCard';
export { ProductCardSkeleton, default as ProductCardSkeletonDefault } from './ProductCardSkeleton';

// Card versions
export * from './cards';

// Layout versions
export * from './layout';

// Filter components
export * from './filters';

// Sorting components
export * from './sorting';

// Empty states
export * from './empty';
