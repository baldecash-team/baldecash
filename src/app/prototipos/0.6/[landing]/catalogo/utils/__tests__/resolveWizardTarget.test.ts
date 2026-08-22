/**
 * BAL-3270 — "Lo quiero" en la card del producto suelto abria el combo.
 *
 * Un producto puede tener VARIAS cards en la misma landing (el suelto y cada
 * uno de sus combos), y todas comparten el mismo `id`. Resolver la card por
 * `id` devuelve la primera de la lista, no la que el usuario toco.
 */
import { resolveWizardTarget } from '../resolveWizardTarget';
import type { CatalogProduct } from '../../types/catalog';

const card = (over: Partial<CatalogProduct>): CatalogProduct =>
  ({
    id: '518',
    slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835',
    name: 'iPad 11 pulgadas Wi-Fi',
    displayName: 'iPad 11 pulgadas Wi-Fi A16 Bionic 128GB',
    brand: 'APPLE',
    thumbnail: '',
    images: [],
    price: 2099,
    quotaMonthly: 119,
    quotaBiweekly: 0,
    quotaWeekly: 0,
    maxTermMonths: 24,
    ...over,
  } as CatalogProduct);

// Orden real de la landing `home`: la card del combo va ANTES que la suelta.
const comboCard = card({
  landingProductId: 1,
  slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835-combo-166',
  name: 'iPad 11 pulgadas Wi-Fi (con lapiz y case incluidos)',
  displayName: 'iPad 11 pulgadas Wi-Fi (con lapiz y case incluidos)',
  price: 2348,
  quotaMonthly: 133,
});
const sueltaCard = card({ landingProductId: 2 });
const catalogo = [comboCard, sueltaCard];

describe('resolveWizardTarget', () => {
  it('devuelve la card suelta cuando es la que se toco, aunque el combo del mismo producto vaya antes en el catalogo', () => {
    const target = resolveWizardTarget(sueltaCard, '518', catalogo);

    expect(target.slug).toBe('ipad-11-pulgadas-wi-fi-tbapme0000835');
    expect(target.quotaMonthly).toBe(119);
  });

  it('devuelve la card del combo cuando es la que se toco', () => {
    const target = resolveWizardTarget(comboCard, '518', catalogo);

    expect(target.slug).toBe('ipad-11-pulgadas-wi-fi-tbapme0000835-combo-166');
    expect(target.quotaMonthly).toBe(133);
  });

  it('resuelve el color hermano elegido dentro de la card que se toco', () => {
    const conColores = card({
      landingProductId: 3,
      colors: [
        { productId: '900', slug: 'ipad-11-azul', displayName: 'iPad 11 Azul', quotaMonthly: 125 },
      ],
    } as Partial<CatalogProduct>);

    const target = resolveWizardTarget(conColores, '900', [comboCard, conColores]);

    expect(target.id).toBe('900');
    expect(target.slug).toBe('ipad-11-azul');
    expect(target.quotaMonthly).toBe(125);
  });
});
