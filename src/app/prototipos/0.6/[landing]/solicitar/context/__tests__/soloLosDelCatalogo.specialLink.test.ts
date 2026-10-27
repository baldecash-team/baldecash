import { soloLosDelCatalogo } from '../productoFueraDeCatalogo';
import type { SelectedProduct } from '../ProductContext';

const p = (over: Partial<SelectedProduct>) => ({ id: '1', ...over }) as SelectedProduct;

it('el producto del link especial no se valida contra el catálogo', () => {
  const lista = [p({ id: '1', specialLinkToken: 'abc' }), p({ id: '2' })];
  expect(soloLosDelCatalogo(lista).map(x => x.id)).toEqual(['2']);
});

it('sin token, el filtro deja pasar todo lo del catálogo como siempre', () => {
  const lista = [p({ id: '1' }), p({ id: '2' })];
  expect(soloLosDelCatalogo(lista).map(x => x.id)).toEqual(['1', '2']);
});
