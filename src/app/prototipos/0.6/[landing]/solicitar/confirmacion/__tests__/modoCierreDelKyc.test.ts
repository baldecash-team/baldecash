/**
 * Quién decide qué cierre ve cada perfil de Family Farms.
 *
 * El flag es pegable a mano en la URL, así que la landing manda: sin ese
 * filtro, cualquiera podría hacer que una solicitud todavía en evaluación se
 * anunciara como resuelta.
 */
import { modoCierreDelKyc } from '../confirmacionClient';

const params = (q: string) => new URLSearchParams(q);

describe('modoCierreDelKyc', () => {
  it('el cosechador celebra al cerrar el KYC: le queda su calendario de armadas', () => {
    expect(modoCierreDelKyc(params('code=APP-1&kyc=1'), 'family-farms-baldecash-c')).toBe('completado');
  });

  it('el cosechador sin cerrar el KYC ve la pantalla del submit', () => {
    // Su landing SI tiene KYC: llegar sin `?kyc=1` significa que no lo cerro.
    expect(modoCierreDelKyc(params('code=APP-1'), 'family-farms-baldecash-c')).toBeNull();
  });

  it('administrativo y obrero fijo quedan aprobados sin pasar por KYC', () => {
    // Su landing trae el KYC apagado, asi que nunca llega `?kyc=1`: exigirlo
    // los dejaria con la pantalla generica de "estamos revisando".
    expect(modoCierreDelKyc(params('code=APP-1'), 'family-farms-baldecash-a')).toBe('aprobado');
    expect(modoCierreDelKyc(params('code=APP-1'), 'family-farms-baldecash-b')).toBe('aprobado');
  });

  it('no aplica fuera de Family Farms: ahí la solicitud sí se evalúa', () => {
    expect(modoCierreDelKyc(params('code=APP-1&kyc=1'), 'copia-home')).toBeNull();
    expect(modoCierreDelKyc(params('code=APP-1'), 'home')).toBeNull();
  });

  it('solo el valor exacto "1" cuenta para el cosechador', () => {
    expect(modoCierreDelKyc(params('kyc=true'), 'family-farms-baldecash-c')).toBeNull();
    expect(modoCierreDelKyc(params('kyc=0'), 'family-farms-baldecash-c')).toBeNull();
  });
});
