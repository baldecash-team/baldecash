import { LANDING_IDS } from '../landingIds';

describe('LANDING_IDS.SEMINUEVOS', () => {
  it('está definido y es un número', () => {
    expect(typeof LANDING_IDS.SEMINUEVOS).toBe('number');
  });

  it('no colisiona con los ids de las otras landings especiales', () => {
    const ids = Object.values(LANDING_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
