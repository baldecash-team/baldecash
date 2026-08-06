import { appendUniqueProducts } from '../useCatalogProducts';
import type { CatalogProduct } from '../../types/catalog';

/**
 * La card del catalogo se renderiza con key={landingProductId ?? id}. El scroll
 * infinito concatena paginas, y si una respuesta trae un producto que ya estaba
 * en la lista React advierte "two children with the same key" — y puede omitir
 * o duplicar tarjetas al re-renderizar.
 */
const acumularSinDuplicados = appendUniqueProducts;

function producto(id: string, landingProductId?: number): CatalogProduct {
  return { id, landingProductId, name: `Producto ${id}` } as CatalogProduct;
}

const keysDe = (lista: CatalogProduct[]) =>
  lista.map(p => String(p.landingProductId ?? p.id));

describe('useCatalogProducts – acumulacion de paginas', () => {
  it('descarta el producto que ya estaba en la lista', () => {
    const previos = [producto('1451', 3787), producto('1320', 4682)];
    // La segunda pagina repite el 3787 y trae uno nuevo
    const entrantes = [producto('1451', 3787), producto('1418', 4700)];

    const resultado = acumularSinDuplicados(previos, entrantes);

    expect(keysDe(resultado)).toEqual(['3787', '4682', '4700']);
    expect(new Set(keysDe(resultado)).size).toBe(resultado.length);
  });

  it('agrega normalmente cuando no hay repetidos', () => {
    const previos = [producto('1451', 3787)];
    const entrantes = [producto('1320', 4682), producto('1418', 4700)];

    expect(keysDe(acumularSinDuplicados(previos, entrantes))).toEqual(['3787', '4682', '4700']);
  });

  it('devuelve la misma referencia si todo lo entrante ya estaba', () => {
    const previos = [producto('1451', 3787), producto('1320', 4682)];
    const entrantes = [producto('1451', 3787)];

    // Misma referencia evita un re-render inutil de toda la grilla
    expect(acumularSinDuplicados(previos, entrantes)).toBe(previos);
  });

  it('cae al id cuando el producto no trae landingProductId', () => {
    const previos = [producto('1451')];
    const entrantes = [producto('1451'), producto('1320')];

    expect(keysDe(acumularSinDuplicados(previos, entrantes))).toEqual(['1451', '1320']);
  });

  it('no confunde un id con un landingProductId de igual valor', () => {
    const previos = [producto('4682')];              // key "4682" por id
    const entrantes = [producto('1320', 4682)];      // key "4682" por landingProductId

    // Comparten key, asi que el segundo se descarta: es exactamente el choque
    // que React reporta, y la card no sabria cual de los dos mostrar.
    expect(keysDe(acumularSinDuplicados(previos, entrantes))).toEqual(['4682']);
  });
});
