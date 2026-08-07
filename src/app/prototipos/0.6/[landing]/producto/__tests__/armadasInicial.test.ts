/**
 * Las armadas de la inicial, del wire hasta el submit.
 *
 * El campo recorre cuatro capas —API → PricingSelection → SelectedProduct →
 * product_data— y en cada una hay un `?? 1`. Lo que se prueba acá es que ese
 * default aguante: un catálogo que no configuró armadas no puede empezar a
 * mandar `initial_installments` distinto de 1, porque legacy generaría filas de
 * cronograma que nadie pidió.
 */

import { transformPaymentPlanForTest } from '../api/productDetailApi';
import type { InitialPaymentOption } from '../types/detail';

/** Una opción del wire, con lo mínimo que mira el transform. */
function apiOption(extra: Record<string, unknown> = {}) {
  return {
    initial_percent: 25,
    initial_amount: '114.00',
    monthly_quota: '27',
    original_quota: null,
    commission_amount: null,
    tea: 40,
    tea_irr: 40,
    tcea: 40,
    ...extra,
  };
}

function apiPlan(options: ReturnType<typeof apiOption>[]) {
  return {
    term: 13,
    term_months: 3,
    payment_frequency: 'semanal' as const,
    tea: 40,
    tcea: 40,
    options,
  };
}

function primeraOpcion(plan: ReturnType<typeof apiPlan>): InitialPaymentOption {
  return transformPaymentPlanForTest(plan).options[0];
}

describe('el catálogo sin armadas no cambia', () => {
  it('una opción sin el campo cae en pago único', () => {
    // Es el caso de todas las celdas anteriores al feature: la columna no
    // existía y la inicial siempre fue un solo pago.
    expect(primeraOpcion(apiPlan([apiOption()])).initialInstallments).toBe(1);
  });

  it('sin montos de armadas la lista queda vacía, no undefined', () => {
    // El render hace `amounts?.[0]`: un undefined ahí rompería la UI de todo
    // el catálogo, no solo la de Family Farms.
    expect(primeraOpcion(apiPlan([apiOption()])).initialInstallmentAmounts).toEqual([]);
  });

  it('un initial_installments explícito de 1 sigue siendo pago único', () => {
    const op = primeraOpcion(apiPlan([apiOption({ initial_installments: 1 })]));

    expect(op.initialInstallments).toBe(1);
  });
});

describe('las armadas del perfil cosechador', () => {
  it('lee las cuatro armadas de la celda', () => {
    const op = primeraOpcion(apiPlan([apiOption({
      initial_installments: 4,
      initial_installment_amounts: ['28.5', '28.5', '28.5', '28.5'],
    })]));

    expect(op.initialInstallments).toBe(4);
    expect(op.initialInstallmentAmounts).toEqual([28.5, 28.5, 28.5, 28.5]);
  });

  it('los montos llegan como números, no como strings', () => {
    // El wire los manda string para no perder precisión; la UI los formatea
    // con Math.floor y un string ahí daría NaN.
    const op = primeraOpcion(apiPlan([apiOption({
      initial_installments: 2,
      initial_installment_amounts: ['57.00', '57.00'],
    })]));

    op.initialInstallmentAmounts!.forEach((m) => expect(typeof m).toBe('number'));
  });

  it('la suma de las armadas da la inicial exacta', () => {
    // Con S/114 en 4 partes no divide exacto: la última absorbe el sobrante.
    const op = primeraOpcion(apiPlan([apiOption({
      initial_amount: '100.01',
      initial_installments: 4,
      initial_installment_amounts: ['25.00', '25.00', '25.00', '25.01'],
    })]));

    const suma = op.initialInstallmentAmounts!.reduce((a, b) => a + b, 0);
    expect(Number(suma.toFixed(2))).toBe(op.initialAmount);
  });
});
