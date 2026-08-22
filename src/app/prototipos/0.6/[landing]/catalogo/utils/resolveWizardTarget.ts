import type { CatalogProduct, ProductColor } from '../types/catalog';

const mergeSibling = (parent: CatalogProduct, sibling: ProductColor, productId: string): CatalogProduct => ({
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
});

export function resolveWizardTarget(
  clickedCard: CatalogProduct,
  activeProductId: string,
  catalogProducts: CatalogProduct[],
): CatalogProduct {
  // Un producto puede tener varias cards en la misma landing (el suelto y cada
  // uno de sus combos) y todas comparten `id`. Buscar por `id` devolveria la
  // primera de la lista, no la que el usuario toco: BAL-3270, donde "Lo quiero"
  // en el iPad suelto abria el combo con lapiz y case.
  if (activeProductId === clickedCard.id) return clickedCard;

  const direct = catalogProducts.find((p) => p.id === activeProductId);
  if (direct) return direct;

  for (const parent of catalogProducts) {
    const sibling = parent.colors?.find((c) => c.productId === activeProductId);
    if (sibling) return mergeSibling(parent, sibling, activeProductId);
  }

  return clickedCard;
}
