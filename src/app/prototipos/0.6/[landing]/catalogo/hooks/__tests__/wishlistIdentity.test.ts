import { cardKey } from '../../utils/cardKey';

// Reproduce la logica de dedup del store sobre una lista plana, sin React.
// Si esta logica usa el id, el combo y el suelto colapsan (BAL-3328).
function toggle(lista: Array<{ productId: string; slug?: string }>, item: { productId: string; slug?: string }) {
  const k = cardKey(item);
  const existe = lista.find((w) => cardKey(w) === k);
  if (existe) return lista.filter((w) => cardKey(w) !== k);
  return [...lista, item];
}

describe('identidad de favoritos', () => {
  const suelto = { productId: '518', slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835' };
  const combo = { productId: '518', slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835-combo-166' };

  it('el suelto y su combo conviven como dos favoritos distintos', () => {
    const lista = toggle(toggle([], combo), suelto);
    expect(lista).toHaveLength(2);
  });

  it('quitar el combo no quita el suelto', () => {
    const conAmbos = toggle(toggle([], combo), suelto);
    const soloSuelto = toggle(conAmbos, combo);
    expect(soloSuelto).toHaveLength(1);
    expect(cardKey(soloSuelto[0])).toBe(cardKey(suelto));
  });

  it('marcar dos veces la misma card la quita, no la duplica', () => {
    expect(toggle(toggle([], combo), combo)).toHaveLength(0);
  });
});
