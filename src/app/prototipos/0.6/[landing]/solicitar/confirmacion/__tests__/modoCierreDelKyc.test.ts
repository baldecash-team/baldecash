/**
 * Quién decide qué cierre ve cada perfil de Family Farms.
 *
 * El flag es pegable a mano en la URL, así que la landing manda: sin ese
 * filtro, cualquiera podría hacer que una solicitud todavía en evaluación se
 * anunciara como terminada.
 */
import { modoCierreDelKyc } from '../confirmacionClient';

const params = (q: string) => new URLSearchParams(q);

describe('modoCierreDelKyc', () => {
  it('el cosechador celebra: le queda su calendario de armadas por delante', () => {
    expect(modoCierreDelKyc(params('code=APP-1&kyc=1'), 'family-farms-baldecash-c')).toBe('completado');
  });

  it('administrativo y obrero fijo esperan contacto: el siguiente paso no es suyo', () => {
    expect(modoCierreDelKyc(params('code=APP-1&kyc=1'), 'family-farms-baldecash-a')).toBe('contactaremos');
    expect(modoCierreDelKyc(params('code=APP-1&kyc=1'), 'family-farms-baldecash-b')).toBe('contactaremos');
  });

  it('ignora el flag fuera de Family Farms: ahí la solicitud sigue en evaluación', () => {
    expect(modoCierreDelKyc(params('code=APP-1&kyc=1'), 'copia-home')).toBeNull();
    expect(modoCierreDelKyc(params('code=APP-1&kyc=1'), 'home')).toBeNull();
  });

  it('sin flag es la confirmación del submit, aun en Family Farms', () => {
    expect(modoCierreDelKyc(params('code=APP-1'), 'family-farms-baldecash-c')).toBeNull();
  });

  it('solo el valor exacto "1" cuenta', () => {
    expect(modoCierreDelKyc(params('kyc=true'), 'family-farms-baldecash-c')).toBeNull();
    expect(modoCierreDelKyc(params('kyc=0'), 'family-farms-baldecash-c')).toBeNull();
  });
});
