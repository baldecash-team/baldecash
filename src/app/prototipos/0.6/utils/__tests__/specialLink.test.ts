import {
  captureSpecialLink,
  getSpecialLinkToken,
  clearSpecialLink,
  specialLinkTokenFor,
  avisoDelLinkEspecial,
  urlSinAcceso,
  ACCESO_EARLY_SCRIPT,
  PENDING_SPECIAL_LINK_KEY,
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

  describe('el token no queda en la URL (GA4 manda la URL completa)', () => {
    afterEach(() => {
      jest.useRealTimers();
      window.history.replaceState(null, '', '/');
    });

    it('urlSinAcceso quita solo acceso y conserva el resto', () => {
      expect(urlSinAcceso('https://baldecash.com/home/producto/x/?term=12&acceso=abc&initial=0#f'))
        .toBe('/home/producto/x/?term=12&initial=0#f');
      expect(urlSinAcceso('/home/producto/x/?acceso=abc')).toBe('/home/producto/x/');
      expect(urlSinAcceso('/home/producto/x/?term=12')).toBeNull();
    });

    it('el script temprano guarda el token y limpia la barra antes que gtag', () => {
      window.history.replaceState(null, '', '/home/producto/laptop/?term=12&acceso=abc&frecuency=semanal');
      // eslint-disable-next-line no-new-func
      new Function(ACCESO_EARLY_SCRIPT)();
      expect(window.location.search).toBe('?term=12&frecuency=semanal');
      expect(window.location.href).not.toContain('abc');
      expect(sessionStorage.getItem(PENDING_SPECIAL_LINK_KEY)).toBe('abc');
    });

    it('el script temprano no toca páginas que no son ficha', () => {
      window.history.replaceState(null, '', '/home/?acceso=abc');
      // eslint-disable-next-line no-new-func
      new Function(ACCESO_EARLY_SCRIPT)();
      expect(window.location.search).toBe('?acceso=abc');
      expect(sessionStorage.getItem(PENDING_SPECIAL_LINK_KEY)).toBeNull();
    });

    it('la ficha pasa el token pendiente a la llave de su landing', () => {
      sessionStorage.setItem(PENDING_SPECIAL_LINK_KEY, 'abc');
      captureSpecialLink('home', new URLSearchParams('term=12'));
      expect(getSpecialLinkToken('home')).toBe('abc');
      expect(sessionStorage.getItem(PENDING_SPECIAL_LINK_KEY)).toBeNull();
    });

    it('si el token llega en la URL (navegación SPA), lo saca de la barra', () => {
      jest.useFakeTimers();
      window.history.replaceState(null, '', '/home/producto/laptop/?term=12&acceso=abc');
      captureSpecialLink('home', new URLSearchParams(window.location.search));
      expect(getSpecialLinkToken('home')).toBe('abc');
      jest.runAllTimers();
      expect(window.location.search).toBe('?term=12');
    });
  });
});
