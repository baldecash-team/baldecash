/**
 * La fecha fija de arranque de cobro de la campaña.
 *
 * El convenio cobra contra planilla: todos empiezan el mismo día sin importar
 * cuándo solicitaron. Si el cronograma la ignora y arranca "hoy", la persona ve
 * un calendario que no es el que va a pagar.
 */
import { getFirstPaymentDate, type LandingConfig } from '../landingConfig';

function config(firstPayment?: unknown): LandingConfig {
  return {
    layout: { has_catalog: true },
    features: {} as LandingConfig['features'],
    ...(firstPayment !== undefined ? { first_payment: firstPayment } : {}),
  } as LandingConfig;
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

describe('getFirstPaymentDate', () => {
  it('devuelve la fecha configurada por la campaña', () => {
    const d = getFirstPaymentDate(config({ date: '2026-08-21', source: 'family-farms-2026-08' }));

    expect(d).not.toBeNull();
    expect(iso(d!)).toBe('2026-08-21');
  });

  it('no se corre un día por el huso', () => {
    // `new Date('2026-08-21')` es UTC y en Lima (-5) cae el 20.
    const d = getFirstPaymentDate(config({ date: '2026-08-21' }));

    expect(d!.getDate()).toBe(21);
    expect(d!.getMonth()).toBe(7);
  });

  it('el 21 de agosto de 2026 es viernes: los 17 pagos caen hasta el 11 de diciembre', () => {
    const d = getFirstPaymentDate(config({ date: '2026-08-21' }))!;
    expect(d.getDay()).toBe(5);

    const ultima = new Date(d);
    ultima.setDate(ultima.getDate() + 7 * 16);
    expect(iso(ultima)).toBe('2026-12-11');
  });

  it('sin el namespace devuelve null: el resto del catálogo no tiene fecha fija', () => {
    expect(getFirstPaymentDate(config())).toBeNull();
  });

  it('una fecha mal cargada se ignora en vez de arrancar en otro mes', () => {
    expect(getFirstPaymentDate(config({ date: '2026-02-31' }))).toBeNull();
    expect(getFirstPaymentDate(config({ date: '21/08/2026' }))).toBeNull();
    expect(getFirstPaymentDate(config({ date: '' }))).toBeNull();
    expect(getFirstPaymentDate(config({ note: 'sin date' }))).toBeNull();
  });
});
