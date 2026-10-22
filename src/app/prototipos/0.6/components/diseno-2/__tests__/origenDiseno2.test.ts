/**
 * BAL-4959, decisión del controlador: el Paso 1 de Diseño 2 vuelve a la
 * página de origen del modal "Lo quiero" (catálogo o ficha), no a
 * `/solicitar`. `guardarOrigenDiseno2` la guarda al continuar; `leerOrigenDiseno2`
 * la lee en el Paso 1. Una clave por landing, para no mezclar dos landings
 * abiertas en pestañas distintas.
 */
import { guardarOrigenDiseno2, leerOrigenDiseno2 } from '../origenDiseno2';

function irA(pathname: string, search = '') {
  window.history.pushState({}, '', `${pathname}${search}`);
}

beforeEach(() => {
  sessionStorage.clear();
  irA('/');
});

describe('guardarOrigenDiseno2 / leerOrigenDiseno2', () => {
  it('guarda pathname + search de la página actual', () => {
    irA('/pago-diferido/catalogo', '?categoria=laptops');
    guardarOrigenDiseno2('pago-diferido');
    expect(leerOrigenDiseno2('pago-diferido')).toBe('/pago-diferido/catalogo?categoria=laptops');
  });

  it('sin nada guardado: null', () => {
    expect(leerOrigenDiseno2('pago-diferido')).toBeNull();
  });

  it('una clave por landing: no se mezclan dos landings', () => {
    irA('/pago-diferido/producto/hp-15');
    guardarOrigenDiseno2('pago-diferido');
    irA('/home/catalogo');
    guardarOrigenDiseno2('home');

    expect(leerOrigenDiseno2('pago-diferido')).toBe('/pago-diferido/producto/hp-15');
    expect(leerOrigenDiseno2('home')).toBe('/home/catalogo');
  });

  it('sin sessionStorage disponible, no revienta (guarda y lee devuelven sin tirar error)', () => {
    const real = window.sessionStorage;
    // @ts-expect-error — se simula que sessionStorage no existe (modo privado).
    delete window.sessionStorage;
    expect(() => guardarOrigenDiseno2('pago-diferido')).not.toThrow();
    expect(leerOrigenDiseno2('pago-diferido')).toBeNull();
    Object.defineProperty(window, 'sessionStorage', { value: real, configurable: true });
  });
});
