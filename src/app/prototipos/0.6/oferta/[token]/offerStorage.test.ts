/**
 * offerStorage — BAL-4196: el accesorio del Perfil B llega preseleccionado a
 * complementos al aceptar la exclusiva, y el cliente puede desmarcarlo.
 */
import { accesoriosIniciales, saveOfferSelection, readOfferSelection } from './offerStorage';

describe('accesoriosIniciales', () => {
  const disponibles = new Set(['11', '22', '33']);

  it('sin nada guardado marca el accesorio preseleccionado', () => {
    expect(accesoriosIniciales(null, ['22'], disponibles)).toEqual(['22']);
  });

  it('lo guardado manda: si el cliente lo desmarcó, no se vuelve a marcar', () => {
    expect(accesoriosIniciales([], ['22'], disponibles)).toEqual([]);
    expect(accesoriosIniciales(['11'], ['22'], disponibles)).toEqual(['11']);
  });

  it('no marca un accesorio que /addons ya no ofrece', () => {
    expect(accesoriosIniciales(null, ['99'], disponibles)).toEqual([]);
  });

  it('sin preselección no marca nada', () => {
    expect(accesoriosIniciales(null, undefined, disponibles)).toEqual([]);
  });
});

describe('saveOfferSelection', () => {
  beforeEach(() => window.localStorage.clear());

  it('conserva los accesorios a preseleccionar', () => {
    saveOfferSelection('tok', {
      variantId: 5, comboId: null, slug: 'x', name: 'Equipo', preselectAccessoryIds: ['22'],
    });
    expect(readOfferSelection('tok')?.preselectAccessoryIds).toEqual(['22']);
  });
});
