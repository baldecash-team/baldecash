import {
  captureSpecialLink,
  getSpecialLinkToken,
  clearSpecialLink,
  specialLinkTokenFor,
  avisoDelLinkEspecial,
} from '../specialLink';

describe('specialLink', () => {
  beforeEach(() => sessionStorage.clear());

  it('guarda el token de ?acceso= por landing', () => {
    captureSpecialLink('home', new URLSearchParams('term=12&acceso=abc'));
    expect(getSpecialLinkToken('home')).toBe('abc');
    expect(getSpecialLinkToken('otra')).toBeNull();
  });

  it('sin acceso en la URL no borra el que ya estaba (navegar dentro del flujo)', () => {
    captureSpecialLink('home', new URLSearchParams('acceso=abc'));
    captureSpecialLink('home', new URLSearchParams('term=24'));
    expect(getSpecialLinkToken('home')).toBe('abc');
  });

  it('clear lo quita', () => {
    captureSpecialLink('home', new URLSearchParams('acceso=abc'));
    clearSpecialLink('home');
    expect(getSpecialLinkToken('home')).toBeNull();
  });

  it('si sessionStorage explota, no rompe', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('x'); });
    expect(getSpecialLinkToken('home')).toBeNull();
    spy.mockRestore();
  });

  describe('specialLinkTokenFor', () => {
    it('devuelve el token solo si el pase abrió ESTE producto', () => {
      captureSpecialLink('home', new URLSearchParams('acceso=abc'));
      expect(specialLinkTokenFor('home', 42, '42')).toBe('abc');
      expect(specialLinkTokenFor('home', 42, '7')).toBeUndefined();
    });

    it('sin pase en el detalle no marca nada aunque haya token guardado', () => {
      captureSpecialLink('home', new URLSearchParams('acceso=abc'));
      expect(specialLinkTokenFor('home', undefined, '42')).toBeUndefined();
    });

    it('sin token guardado no marca nada', () => {
      expect(specialLinkTokenFor('home', 42, '42')).toBeUndefined();
    });
  });

  describe('avisoDelLinkEspecial', () => {
    it.each(['invalid', 'expired', 'consumed', 'revoked'])('%s: muestra el aviso', (motivo) => {
      expect(avisoDelLinkEspecial(motivo)).toBe(
        'Tu link especial venció o ya se usó. Pídele uno nuevo a tu asesora.',
      );
    });

    it('mismatch (token de otro equipo) no muestra nada', () => {
      expect(avisoDelLinkEspecial('mismatch')).toBeNull();
    });

    it('sin motivo no muestra nada', () => {
      expect(avisoDelLinkEspecial(undefined)).toBeNull();
    });
  });
});
