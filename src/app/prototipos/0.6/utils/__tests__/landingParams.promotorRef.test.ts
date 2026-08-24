/**
 * Captura y persistencia del `ref` de la promotora.
 *
 * Existe porque el querystring NO sobrevive al recorrido: `routes.catalogo()`
 * arma una URL limpia, así que al pasar de la landing al catálogo se pierde
 * todo lo que no se haya guardado. El cupón sobrevive por esto mismo; `ref`
 * ahora también, y de él depende a quién se le acredita el lead.
 */
import { captureLandingParams, getPromotorRef, readPromotorRef } from '../landingParams';

const LANDING = 'wiener';
const REF = 'ekscah';

function entrarCon(search: string) {
  window.history.replaceState({}, '', `/${LANDING}/${search}`);
}

beforeEach(() => {
  localStorage.clear();
  entrarCon('');
});

describe('leer el ref de la URL', () => {
  it('lo devuelve normalizado', () => {
    expect(readPromotorRef(`?ref=${REF}`)).toBe(REF);
    expect(readPromotorRef('?ref=EKSCAH')).toBe(REF);
    expect(readPromotorRef('?ref=  Ekscah  ')).toBe(REF);
  });

  it('convive con el resto de los parámetros del flyer', () => {
    const search =
      '?utm_campaign=activacion_norbert-wiener_2026_08&utm_source=qr&utm_medium=offline' +
      `&utm_term=punto_los-olivos__promo_1vlqax8__act_1odsq6r&ref=${REF}`;
    expect(readPromotorRef(search)).toBe(REF);
  });

  it.each([
    ['sin parámetro', ''],
    ['vacío', '?ref='],
    ['corto', '?ref=eksca'],
    ['largo', '?ref=ekscaha'],
    ['con caracteres ambiguos', '?ref=eksca0'],
    ['con la URL entera pegada', '?ref=https%3A%2F%2Fx.com%2Fr%2Fekscah'],
  ])('%s devuelve null', (_caso, search) => {
    // Lo que se guarda acá viaja al backend como atribución: guardar basura es
    // peor que no guardar nada, porque ensucia el dato con el que se le paga a
    // alguien.
    expect(readPromotorRef(search)).toBeNull();
  });
});

describe('persistencia por landing', () => {
  it('sobrevive a que la URL suelte el querystring', () => {
    entrarCon(`?ref=${REF}`);
    captureLandingParams(LANDING);

    // El catálogo se abre con una URL limpia: es justo el caso que rompía.
    entrarCon('');
    expect(getPromotorRef(LANDING)).toBe(REF);
  });

  it('no se limpia al leerlo', () => {
    // La atribución vale para toda la visita, no para un paso: quien llegó por
    // el flyer de alguien sigue siendo su referido aunque recargue o vuelva atrás.
    entrarCon(`?ref=${REF}`);
    captureLandingParams(LANDING);

    expect(getPromotorRef(LANDING)).toBe(REF);
    expect(getPromotorRef(LANDING)).toBe(REF);
  });

  it('no se mezcla entre landings', () => {
    entrarCon(`?ref=${REF}`);
    captureLandingParams(LANDING);

    expect(getPromotorRef('upn')).toBeNull();
  });

  it('un ref inválido no pisa el que ya estaba guardado', () => {
    entrarCon(`?ref=${REF}`);
    captureLandingParams(LANDING);

    entrarCon('?ref=basura!');
    captureLandingParams(LANDING);

    expect(getPromotorRef(LANDING)).toBe(REF);
  });

  it('sin ref en la URL no inventa nada', () => {
    captureLandingParams(LANDING);
    expect(getPromotorRef(LANDING)).toBeNull();
  });
});
