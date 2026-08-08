/**
 * De qué día arranca el cronograma que se dibuja en el detalle.
 *
 * En los convenios que cobran contra planilla la fecha NO se deriva de cuándo
 * la persona entró a la página: todos empiezan a pagar el mismo día. Anclar en
 * `hoy` mostraba un calendario que no era el que iba a firmar —el 8 de agosto
 * veía sábados y la campaña cobra viernes.
 */

import { inicioDelCronograma } from '../inicioDelCronograma';
import { DEFAULT_LANDING_CONFIG, type LandingConfig } from '@/app/prototipos/0.6/types/landingConfig';

const hoy = new Date(2026, 7, 8); // sábado 8 de agosto de 2026

function config(extra: Record<string, unknown> = {}): LandingConfig {
  return { ...DEFAULT_LANDING_CONFIG, ...extra } as LandingConfig;
}

describe('inicioDelCronograma', () => {
  it('arranca en la fecha de la campaña, no en hoy', () => {
    const inicio = inicioDelCronograma(
      config({ first_payment: { date: '2026-08-21', source: 'family-farms-2026-08' } }),
      hoy,
    );

    expect(inicio.getFullYear()).toBe(2026);
    expect(inicio.getMonth()).toBe(7);
    expect(inicio.getDate()).toBe(21);
  });

  it('sin campaña configurada sigue anclando en hoy', () => {
    expect(inicioDelCronograma(config(), hoy)).toEqual(hoy);
  });

  it('una fecha inválida no rompe el cronograma: cae a hoy', () => {
    expect(inicioDelCronograma(config({ first_payment: { date: '21/08/2026' } }), hoy)).toEqual(hoy);
  });

  it('sin config todavía cargada usa hoy', () => {
    expect(inicioDelCronograma(null, hoy)).toEqual(hoy);
    expect(inicioDelCronograma(undefined, hoy)).toEqual(hoy);
  });
});
