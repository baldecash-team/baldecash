/**
 * El producto que el wizard dejo guardado ANTES del fix de BAL-3994 no tiene
 * `paymentFrequency`.
 *
 * No es "el carrito": el carrito multi-producto esta apagado
 * (`marketing.allow_multi_product = false` desde el 02-abr-2026, sin una sola
 * solicitud de dos equipos en 6 meses). Es el UNICO producto que /solicitar
 * persiste entre visitas.
 *
 * El campo nacio representando "mensual" como su propia ausencia, asi que los
 * objetos que quedaron en localStorage no lo traen y el tipo no los delata.
 * Al rehidratarlos, el submit los completaba con 'mensual': en los equipos que
 * NO se venden en mensual eso hacia nacer la solicitud con TEA 0 y la cuota de
 * otra frecuencia.
 *
 * Medido en produccion el 21-sep-2026: `APP-2026-99835331` (Redmi A7 Pro,
 * variante 1417, solo quincenal/semanal) nacio con `mensual`, `tea = 0` y
 * `term_months = 48` sin convertir.
 *
 * Ver BAL-4029 y BAL-3994.
 */

import { completarFrecuenciaPersistida } from '../ProductContext';
import { necesitaPlanesDePago } from '../productoFueraDeCatalogo';
import type { PaymentPlan } from '../ProductContext';

/** Lo minimo que mira el helper. Evita construir un SelectedProduct entero. */
interface ProductoPersistido {
  paymentFrequency?: string;
  paymentPlans?: PaymentPlan[];
  outOfCatalog?: boolean;
}

describe('completarFrecuenciaPersistida', () => {
  it('deriva la frecuencia de los planes que el objeto ya guarda', () => {
    // El caso real: iPhone 15 (variante 327), que solo se vende en
    // quincenal/semanal. Sus planes guardados dicen 'semanal'.
    const guardado: ProductoPersistido = {
      paymentPlans: [
        { term: 12, termMonths: 3, paymentFrequency: 'semanal', options: [] },
        { term: 24, termMonths: 6, paymentFrequency: 'semanal', options: [] },
      ],
    };

    expect(completarFrecuenciaPersistida(guardado)?.paymentFrequency).toBe('semanal');
  });

  it('NO pisa una frecuencia que la persona ya eligio', () => {
    // El catalogo puede ofrecer varias: la elegida manda sobre la del plan.
    const elegida: ProductoPersistido = {
      paymentFrequency: 'quincenal',
      paymentPlans: [{ term: 24, paymentFrequency: 'semanal', options: [] }],
    };

    expect(completarFrecuenciaPersistida(elegida)?.paymentFrequency).toBe('quincenal');
  });

  it('un producto mensual normal queda en mensual', () => {
    // El 91% del volumen. No debe cambiar de comportamiento.
    const mensual: ProductoPersistido = {
      paymentPlans: [{ term: 24, termMonths: 24, paymentFrequency: 'mensual', options: [] }],
    };

    expect(completarFrecuenciaPersistida(mensual)?.paymentFrequency).toBe('mensual');
  });

  it('no toca un producto fuera del catalogo', () => {
    // La calculadora de matricula arma su propio financiamiento: sus planes no
    // salen del catalogo y su frecuencia no se deriva de ahi.
    const calculadora: ProductoPersistido = {
      outOfCatalog: true,
      paymentPlans: [{ term: 24, paymentFrequency: 'semanal', options: [] }],
    };

    expect(completarFrecuenciaPersistida(calculadora)?.paymentFrequency).toBeUndefined();
  });

  it('sin planes la deja ausente, para que actue el guard del backend', () => {
    // Inventar una frecuencia aca seria repetir el bug. Ausente, el submit es
    // rechazado por `submit.pricing_guard_enforce` con un mensaje claro.
    expect(completarFrecuenciaPersistida({} as ProductoPersistido)?.paymentFrequency).toBeUndefined();
  });

  it('si los planes no declaran frecuencia, la deja ausente', () => {
    const sinPf: ProductoPersistido = { paymentPlans: [{ term: 24, options: [] }] };

    expect(completarFrecuenciaPersistida(sinPf)?.paymentFrequency).toBeUndefined();
  });

  it('tolera null', () => {
    expect(completarFrecuenciaPersistida(null)).toBeNull();
  });
});

/**
 * El objeto que persiste el flujo REAL guardaba sus planes sin
 * `paymentFrequency`: `cartPaymentPlans` copiaba solo term/termMonths/options
 * y descartaba el campo. Medido en produccion el 21-sep-2026 agregando un
 * iPhone 15 con el boton "¡Lo quiero!".
 *
 * Sin frecuencia en el producto NI en sus planes no hay de donde derivarla, y
 * hay que volver a pedirlos al catalogo.
 */
describe('necesitaPlanesDePago: planes sin frecuencia', () => {
  it('pide planes cuando ninguno declara frecuencia y el producto tampoco', () => {
    const guardadoPorElFlujoReal = {
      paymentPlans: [
        { term: 12, termMonths: 3, options: [] },
        { term: 24, termMonths: 6, options: [] },
      ],
    } as unknown as Parameters<typeof necesitaPlanesDePago>[0];

    expect(necesitaPlanesDePago(guardadoPorElFlujoReal)).toBe(true);
  });

  it('NO los pide si el producto ya trae su frecuencia', () => {
    const conFrecuencia = {
      paymentFrequency: 'semanal',
      paymentPlans: [{ term: 24, termMonths: 6, options: [] }],
    } as unknown as Parameters<typeof necesitaPlanesDePago>[0];

    expect(necesitaPlanesDePago(conFrecuencia)).toBe(false);
  });

  it('NO los pide si algun plan declara frecuencia', () => {
    const planesConFrecuencia = {
      paymentPlans: [{ term: 24, termMonths: 6, paymentFrequency: 'semanal', options: [] }],
    } as unknown as Parameters<typeof necesitaPlanesDePago>[0];

    expect(necesitaPlanesDePago(planesConFrecuencia)).toBe(false);
  });
});
