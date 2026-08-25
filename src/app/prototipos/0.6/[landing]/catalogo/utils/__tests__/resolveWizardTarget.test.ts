/**
 * BAL-3270 — "Lo quiero" en la card del producto suelto abria el combo.
 *
 * Un producto puede tener VARIAS cards en la misma landing (el suelto y cada
 * uno de sus combos), y todas comparten el mismo `id`. Resolver la card por
 * `id` devuelve la primera de la lista, no la que el usuario toco.
 */
import { resolveWizardTarget } from '../resolveWizardTarget';
import type { CatalogProduct, ProductColor } from '../../types/catalog';

const color = (over: Partial<ProductColor>): ProductColor =>
  ({ id: '900', name: 'Azul', hex: '#00f', ...over } as ProductColor);

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

const azul = color({
  productId: '900',
  slug: 'ipad-11-azul',
  displayName: 'iPad 11 Azul',
  price: 2199,
  quotaMonthly: 125,
});

describe('resolveWizardTarget', () => {
  it('devuelve la card suelta cuando es la que se toco, aunque el combo del mismo producto vaya antes en el catalogo', () => {
    const target = resolveWizardTarget(sueltaCard, '518');

    expect(target.slug).toBe('ipad-11-pulgadas-wi-fi-tbapme0000835');
    expect(target.quotaMonthly).toBe(119);
  });

  it('devuelve la card del combo cuando es la que se toco', () => {
    const target = resolveWizardTarget(comboCard, '518');

    expect(target.slug).toBe('ipad-11-pulgadas-wi-fi-tbapme0000835-combo-166');
    expect(target.quotaMonthly).toBe(133);
  });

  it('resuelve el color hermano elegido dentro de la card que se toco', () => {
    const conColores = card({ landingProductId: 3, colors: [azul] });

    const target = resolveWizardTarget(conColores, '900');

    expect(target.id).toBe('900');
    expect(target.slug).toBe('ipad-11-azul');
    expect(target.quotaMonthly).toBe(125);
  });

  it('mergea el hermano sobre la card tocada, no sobre otra card del mismo producto que liste el mismo color', () => {
    // Las dos cards del producto traen el MISMO `color_siblings` del API, asi
    // que las dos listan al hermano. Los campos que no vienen del hermano
    // (landingProductId, comboId, deviceType...) tienen que salir de la card
    // tocada; si salen del combo, es BAL-3270 otra vez en el camino del color.
    const conColores = card({ landingProductId: 3, colors: [azul] });

    const target = resolveWizardTarget(conColores, '900');

    expect(target.slug).toBe('ipad-11-azul');
    expect(target.landingProductId).toBe(3);
  });

  it('devuelve la card tocada cuando el id activo no resuelve a ningun hermano', () => {
    const target = resolveWizardTarget(sueltaCard, 'id-que-no-existe');

    expect(target.slug).toBe('ipad-11-pulgadas-wi-fi-tbapme0000835');
    expect(target.landingProductId).toBe(2);
  });

  /**
   * BAL-3340 — elegir el grado C en la card y dar "Lo quiero" llevaba a
   * solicitar el grado B.
   *
   * Cada grado es un Product aparte. Sin resolverlo, `resolveWizardTarget` caia
   * a `return clickedCard` (el grado que trajo el listado) y el wizard recibia
   * el equipo equivocado: no es un detalle visual, es pedir otro producto.
   *
   * Datos reales de produccion (Advance CN4058, 25/08/2026).
   */
  describe('hermanos de grado (reacondicionados)', () => {
    const gradoC = {
      grade: 'C',
      productId: 1567,
      slug: 'advance-notebook-cn4058-2-en-1-reacondicionada-grado-c-1169',
      price: 287,
      // Las dos puntas del grado: `lowestQuota` es la del plazo mas largo (la
      // que muestra la card) y `minTermQuota` la del mas corto (la del detalle).
      lowestQuota: 32,
      minTermQuota: 68,
      isAvailable: true,
    };
    const gradoB = {
      grade: 'B',
      productId: 1566,
      slug: 'advance-notebook-cn4058-2-en-1-reacondicionada-grado-b-1168',
      price: 402,
      lowestQuota: 40,
      minTermQuota: 90,
      isAvailable: true,
    };
    // La card que trae el listado es la del grado B.
    const cardGradoB = card({
      id: '1566',
      landingProductId: 7,
      slug: gradoB.slug,
      price: 402,
      quotaMonthly: 90,
      gradeSiblings: [gradoB, gradoC],
    });

    it('resuelve el grado elegido, no el que trajo el listado', () => {
      const target = resolveWizardTarget(cardGradoB, '1567');

      expect(target.id).toBe('1567');
      expect(target.slug).toBe(gradoC.slug);
      expect(target.price).toBe(287);
      // La cuota que muestra la card, no la del plazo mas corto.
      expect(target.quotaMonthly).toBe(32);
    });

    it('conserva de la card lo que el hermano de grado no trae', () => {
      // Un grado solo trae identidad y precio: fotos, specs y el
      // landingProductId de la card tocada tienen que sobrevivir.
      const target = resolveWizardTarget(cardGradoB, '1567');

      expect(target.landingProductId).toBe(7);
      expect(target.brand).toBe('APPLE');
    });

    it('devuelve la card tal cual cuando el grado elegido es el suyo', () => {
      const target = resolveWizardTarget(cardGradoB, '1566');

      expect(target.slug).toBe(gradoB.slug);
      expect(target.quotaMonthly).toBe(90);
    });

    it('no toca las cards sin grados (resto de landings)', () => {
      const target = resolveWizardTarget(sueltaCard, '518');

      expect(target.slug).toBe('ipad-11-pulgadas-wi-fi-tbapme0000835');
      expect(target.quotaMonthly).toBe(119);
    });

    // El backend manda `null` cuando no puede cotizar el grado (pasaba en TODO
    // el listado hasta el arreglo del `target_initial`). La identidad SI cambia
    // —es otro producto— pero la cuota cae a la de la card en vez de quedar en
    // blanco o en 0.
    it('cae a la cuota de la card cuando el grado no trae cuota', () => {
      const sinCuota = { ...gradoC, lowestQuota: null, minTermQuota: null };
      const cardConGradoSinCuota = card({
        id: '1566',
        landingProductId: 7,
        slug: gradoB.slug,
        quotaMonthly: 40,
        gradeSiblings: [gradoB, sinCuota],
      });

      const target = resolveWizardTarget(cardConGradoSinCuota, '1567');

      expect(target.id).toBe('1567');
      expect(target.slug).toBe(gradoC.slug);
      expect(target.quotaMonthly).toBe(40);
    });
  });
});
