/**
 * BAL-3277 (PR 1) — detectar que la card guardada murio, no solo el producto.
 *
 * La validacion comparaba `productId` contra los productos vivos. Pero el
 * suelto y sus combos comparten `id`: si al usuario se le archiva el combo que
 * habia guardado, el productId sigue existiendo (por la card suelta), el item
 * nunca se marca no disponible, y el boton lo manda a una pagina muerta.
 *
 * BAL-3328 (PR 2) — la salida paso de `productId` a cardKey (slug, o
 * productId si el item no tiene slug), porque el storage de wishlist ahora
 * puede tener dos entradas con el mismo productId.
 *
 * BAL-3328 (PR 3, regresion) — un fix intermedio le quitaba el slug a los
 * items del carrito ANTES de llamar a findUnavailableIds, para que la salida
 * fuera productId. Eso rompio el FILTRO: sin slug, todo item de carrito caia
 * a comparar por productId — exactamente lo que BAL-3277 vino a reemplazar.
 * El filtro debe seguir siendo slug-aware para ambos llamadores; solo la
 * PROYECCION de salida cambia (parametro `output`).
 */
import { findUnavailableIds } from '../findUnavailableIds';

const cardViva = (id: string, slug: string) => ({ id, slug });

describe('findUnavailableIds', () => {
  it('no marca un item cuyo slug sigue vivo', () => {
    const items = [{ productId: '518', slug: 'ipad-11' }];
    const activas = [cardViva('518', 'ipad-11'), cardViva('518', 'ipad-11-combo-166')];

    expect(findUnavailableIds(items, activas)).toEqual([]);
  });

  it('marca el item cuando SU card murio aunque el producto siga vivo', () => {
    // El combo 166 se archivo; la card suelta del mismo producto sigue ahi.
    const items = [{ productId: '518', slug: 'ipad-11-combo-166' }];
    const activas = [cardViva('518', 'ipad-11')];

    // La salida es el cardKey (slug) del item guardado, no el productId: asi
    // el consumidor puede distinguirlo de otra entrada con el mismo productId.
    expect(findUnavailableIds(items, activas)).toEqual(['ipad-11-combo-166']);
  });

  it('marca el item cuando el producto entero salio del catalogo', () => {
    const items = [{ productId: '518', slug: 'ipad-11' }];

    expect(findUnavailableIds(items, [])).toEqual(['ipad-11']);
  });

  it('cae a comparar por id cuando el item guardado no tiene slug', () => {
    const items = [{ productId: '518' }, { productId: '999' }];
    const activas = [cardViva('518', 'ipad-11')];

    expect(findUnavailableIds(items, activas)).toEqual(['999']);
  });

  it('trata un slug vacio como ausente', () => {
    const items = [{ productId: '518', slug: '' }];
    const activas = [cardViva('518', 'ipad-11')];

    expect(findUnavailableIds(items, activas)).toEqual([]);
  });

  it('no marca nada con la lista vacia', () => {
    expect(findUnavailableIds([], [])).toEqual([]);
  });

  it('carrito: marca el item por slug (no por productId) y reporta su productId', () => {
    // Caso de la regresion: el combo guardado en el carrito se archivo, pero
    // el suelto del mismo producto sigue vivo. Si el llamador le quita el
    // slug al item antes de pasarlo, el filtro cae a comparar por productId
    // y NO lo marca (bug). Con el slug intacto y output: 'productId', debe
    // marcarlo y reportar el productId crudo (identidad del carrito).
    const items = [{ productId: '518', slug: 'ipad-11-combo-166' }];
    const activas = [cardViva('518', 'ipad-11')];

    expect(findUnavailableIds(items, activas, { output: 'productId' })).toEqual(['518']);
  });
});
