import { accesorioEsRegalo } from '../accesorioEsRegalo';

/**
 * En la confirmación, el accesorio que regala un cupón salía «+S/0/mes» al
 * lado de los regalos del combo, que dicen «Regalo · Incluido». El backend
 * marca `is_gift` solo en los del combo; el del cupón llega sin marca y con
 * cuota 0.
 */
describe('accesorioEsRegalo', () => {
  it('el regalo del combo (is_gift) es regalo', () => {
    expect(accesorioEsRegalo({ is_gift: true, monthly_quota: 0 })).toBe(true);
  });

  it('el regalo del cupón (sin marca, cuota 0) también es regalo', () => {
    expect(accesorioEsRegalo({ is_gift: false, monthly_quota: 0 })).toBe(true);
    expect(accesorioEsRegalo({ monthly_quota: 0 })).toBe(true);
  });

  it('el accesorio que se paga no es regalo', () => {
    expect(accesorioEsRegalo({ is_gift: false, monthly_quota: 12 })).toBe(false);
    expect(accesorioEsRegalo({ monthly_quota: 3.5 })).toBe(false);
  });

  it('sin cuota informada se lee como regalo: no hay nada que cobrar', () => {
    expect(accesorioEsRegalo({ monthly_quota: null })).toBe(true);
  });
});
