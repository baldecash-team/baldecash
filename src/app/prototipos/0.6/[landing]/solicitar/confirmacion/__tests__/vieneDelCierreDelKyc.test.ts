/**
 * Quien decide si la confirmación celebra o habla de evaluación.
 *
 * El flag es pegable a mano en la URL, así que la landing manda: sin ese
 * filtro, cualquiera podría hacer que una solicitud todavía en evaluación se
 * anunciara como terminada.
 */
import { vieneDelCierreDelKyc } from '../confirmacionClient';

const params = (q: string) => new URLSearchParams(q);

describe('vieneDelCierreDelKyc', () => {
  it('enciende la vista de cierre en las landings de Family Farms', () => {
    for (const slug of [
      'family-farms-baldecash-a',
      'family-farms-baldecash-b',
      'family-farms-baldecash-c',
    ]) {
      expect(vieneDelCierreDelKyc(params('code=APP-1&kyc=1'), slug)).toBe(true);
    }
  });

  it('ignora el flag fuera de Family Farms: ahí la solicitud sigue en evaluación', () => {
    expect(vieneDelCierreDelKyc(params('code=APP-1&kyc=1'), 'copia-home')).toBe(false);
    expect(vieneDelCierreDelKyc(params('code=APP-1&kyc=1'), 'home')).toBe(false);
  });

  it('sin flag es la confirmación del submit, aun en Family Farms', () => {
    expect(vieneDelCierreDelKyc(params('code=APP-1'), 'family-farms-baldecash-b')).toBe(false);
  });

  it('solo el valor exacto "1" cuenta', () => {
    expect(vieneDelCierreDelKyc(params('kyc=true'), 'family-farms-baldecash-b')).toBe(false);
    expect(vieneDelCierreDelKyc(params('kyc=0'), 'family-farms-baldecash-b')).toBe(false);
  });
});
