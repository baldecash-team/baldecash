/**
 * El equipo de un link de «Probar en la web» (BAL-5367), como lo guarda el
 * wizard (`SelectedProduct`). Se arma igual que «Lo quiero» del catálogo
 * (`CatalogoClient.selectProductForWizard`) con la card de la landing, pero
 * con el plazo, la inicial y la frecuencia que eligió el panel.
 *
 * La cuota NO se calcula acá: va sin `paymentPlans` y `ProductContext` los
 * pide al entrar a /solicitar y toma la cuota de la opción (plazo, inicial)
 * elegida (`syncMissingPaymentPlans`). El front no calcula pricing.
 */
import type { CatalogProduct } from '../[landing]/catalogo/types/catalog';
import type { SelectedProduct } from '../[landing]/solicitar/context/ProductContext';
import { comboItemsDesdeCatalogo } from './comboIncluidos';
import { termToMonths } from './plazoEnMeses';

export interface EquipoDelLink {
  product_id: number;
  combo_id: number | null;
  variant_id: number | null;
  term: number;
  initial: number;
  frequency: string;
  nombre?: string | null;
}

/** La card del link: la del mismo combo (el suelto es la que no tiene combo). */
export function cardDelEquipo(cards: CatalogProduct[], equipo: EquipoDelLink): CatalogProduct | undefined {
  const delProducto = cards.filter((c) => c.id === String(equipo.product_id));
  return delProducto.find((c) => (c.comboId ?? null) === (equipo.combo_id ?? null));
}

export function armarEquipoDePrueba(card: CatalogProduct, equipo: EquipoDelLink): SelectedProduct {
  return {
    id: card.id,
    slug: card.slug,
    name: card.displayName,
    shortName: card.name,
    brand: card.brand,
    price: card.price,
    // Provisional: ProductContext la reemplaza por la de la opción elegida.
    monthlyPayment: card.quotaMonthly,
    months: termToMonths(equipo.term, equipo.frequency),
    term: equipo.term,
    initialPercent: equipo.initial,
    initialAmount: 0,
    image: card.images[0] || card.thumbnail,
    type: card.deviceType,
    condition: card.conditionCode || card.condition,
    variantId: equipo.variant_id != null ? String(equipo.variant_id) : card.variantId,
    comboId: equipo.combo_id ?? undefined,
    comboItems: comboItemsDesdeCatalogo(card),
    paymentFrequency: equipo.frequency,
    specs: {
      processor: card.specs?.processor?.model || '',
      ram: card.specs?.ram ? `${card.specs.ram.size}GB RAM` : '',
      storage: card.specs?.storage ? `${card.specs.storage.size}GB ${card.specs.storage.type}` : '',
    },
  };
}
