import { parseFiltersFromParams, buildParamsFromFilters, mergeFiltersWithDefaults } from '../queryFilters';

/**
 * BAL-3080: el builder de admin2 emite min_price/max_price y el backend los
 * soporta (verificado en produccion: min_price=3000 -> 10 productos), pero la
 * web los descartaba al parsear, asi que el link se abria sin filtrar.
 */
describe('queryFilters — precio de lista', () => {
  it('lee min_price y max_price de la URL', () => {
    const params = new URLSearchParams('min_price=1500&max_price=3000');
    const filters = parseFiltersFromParams(params);

    expect(filters.priceRange).toEqual({ min: 1500, max: 3000 });
  });

  it('acepta solo uno de los dos extremos', () => {
    const filters = parseFiltersFromParams(new URLSearchParams('min_price=1500'));

    expect(filters.priceRange).toEqual({ min: 1500, max: null });
  });

  it('ignora valores no numericos en vez de propagar NaN', () => {
    const filters = parseFiltersFromParams(new URLSearchParams('min_price=abc'));

    expect(filters.priceRange).toEqual({ min: null, max: null });
  });

  it('reserializa el rango a la URL', () => {
    const params = new URLSearchParams('min_price=1500&max_price=3000');
    const parsed = parseFiltersFromParams(params);
    const filters = mergeFiltersWithDefaults(parsed);

    const out = buildParamsFromFilters(filters, 'recommended');

    expect(out.get('min_price')).toBe('1500');
    expect(out.get('max_price')).toBe('3000');
  });
});
