import type { CatalogProduct, ProductColor } from '../types/catalog';

/**
 * Proyecta un hermano de color sobre su card padre.
 *
 * Vive aparte porque lo usan los dos resolutores del catalogo
 * (`resolveWizardTarget` y `findProductOrSibling`). Tenerlo duplicado hacia que
 * cualquier campo nuevo del hermano —`variantId`, `rawSpecs`, `paymentHooks`—
 * se agregara en una copia y no en la otra.
 */
export function mergeColorSibling(
  parent: CatalogProduct,
  sibling: ProductColor,
  productId: string,
): CatalogProduct {
  return {
    ...parent,
    id: productId,
    slug: sibling.slug || parent.slug,
    displayName: sibling.displayName || parent.displayName,
    name: sibling.displayName || parent.name,
    price: sibling.price ?? parent.price,
    quotaMonthly: sibling.quotaMonthly ?? parent.quotaMonthly,
    originalQuotaMonthly: sibling.originalQuotaMonthly ?? parent.originalQuotaMonthly,
    discount: sibling.discount ?? parent.discount,
    specs: sibling.specs ?? parent.specs,
    thumbnail: sibling.imageUrl || sibling.images?.[0] || parent.thumbnail,
    images: sibling.images || (sibling.imageUrl ? [sibling.imageUrl] : parent.images),
  };
}
