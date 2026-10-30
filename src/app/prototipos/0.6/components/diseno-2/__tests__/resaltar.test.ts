/// <reference types="jest" />
/**
 * BAL-5206 — `resaltar()` solo mueve la página si el campo no se ve, y lo justo.
 * Antes lo centraba siempre: al llenar un campo la página bajaba de más.
 */
import { resaltar, estaALaVista } from '../useGuiaDeCampos';

function caja(top: number, height: number): HTMLElement {
  const el = document.createElement('div');
  el.getBoundingClientRect = () =>
    ({ top, bottom: top + height, height, left: 0, right: 100, width: 100, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;
  el.scrollIntoView = jest.fn();
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = '';
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
  document.documentElement.style.setProperty('--header-total-height', '104px');
  window.scrollBy = jest.fn() as unknown as typeof window.scrollBy;
});

it('un campo que ya se ve entero no mueve la página', () => {
  const el = caja(300, 60);
  expect(estaALaVista(el)).toBe(true);
  resaltar(el);
  expect(window.scrollBy).not.toHaveBeenCalled();
  expect(el.scrollIntoView).not.toHaveBeenCalled();
});

it('un campo debajo de la pantalla sube solo lo justo (no al centro)', () => {
  const el = caja(900, 60);
  resaltar(el);
  // baja hasta que el borde de abajo quede a 24 px del borde de la pantalla
  expect(window.scrollBy).toHaveBeenCalledWith(expect.objectContaining({ top: 900 + 60 - (800 - 24) }));
});

it('un campo tapado por la cabecera fija baja lo justo para quedar debajo de ella', () => {
  const el = caja(50, 60);
  resaltar(el);
  expect(window.scrollBy).toHaveBeenCalledWith(expect.objectContaining({ top: 50 - (104 + 16) }));
});

it('sigue marcando el brillo aunque no se mueva', () => {
  const el = caja(300, 60);
  resaltar(el);
  expect(el.getAttribute('data-guia')).toBe('brillo');
});

it('con mover: false solo pone el brillo, aunque el campo no se vea (BAL-5360)', () => {
  const el = caja(900, 60);
  resaltar(el, { mover: false });
  expect(window.scrollBy).not.toHaveBeenCalled();
  expect(el.scrollIntoView).not.toHaveBeenCalled();
  expect(el.getAttribute('data-guia')).toBe('brillo');
});
