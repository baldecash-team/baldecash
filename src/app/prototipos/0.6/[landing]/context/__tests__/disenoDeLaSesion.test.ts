import { leerDisenoDeLaSesion, guardarDisenoDeLaSesion } from '../disenoDeLaSesion';

/**
 * Diseño de la solicitud de ESTA sesión (BAL-5296): lo fija el formulario que
 * le tocó a la visita. Se guarda por landing en sessionStorage.
 */
beforeEach(() => sessionStorage.clear());

it('sin nada guardado devuelve null', () => {
  expect(leerDisenoDeLaSesion('home')).toBeNull();
});

it('guarda por landing', () => {
  guardarDisenoDeLaSesion('home', 2);
  expect(leerDisenoDeLaSesion('home')).toBe(2);
  expect(leerDisenoDeLaSesion('otra')).toBeNull();
});

it('un valor raro guardado se ignora', () => {
  sessionStorage.setItem('baldecash-home-diseno-sesion', '7');
  expect(leerDisenoDeLaSesion('home')).toBeNull();
});

it('si sessionStorage revienta, no se cae: devuelve null y guardar no lanza', () => {
  const get = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado'); });
  const set = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('bloqueado'); });
  expect(leerDisenoDeLaSesion('home')).toBeNull();
  expect(() => guardarDisenoDeLaSesion('home', 1)).not.toThrow();
  get.mockRestore();
  set.mockRestore();
});
