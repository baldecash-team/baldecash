/**
 * El plazo total que llega del wire, y el que se recalcula cuando no llega.
 *
 * `term` son las CUOTAS —es lo que viaja a legacy— y las armadas se descuentan
 * del plazo: 13 cuotas con 4 armadas y 15 con 2 son las dos "17 semanas". Sin
 * `totalTerm` el catálogo ofrece seis plazos sueltos donde en realidad hay dos
 * con tres modalidades de inicial cada uno.
 *
 * El recálculo local existe para que una respuesta vieja no deje la opción sin
 * plazo; usa la misma fórmula que el backend.
 */

import { transformPaymentPlanForTest } from '../api/productDetailApi';

/** Una opción del wire, con lo mínimo que mira el transform. */
function apiOption(extra: Record<string, unknown> = {}) {
  return {
    initial_percent: 25,
    initial_amount: '134.00',
    monthly_quota: '32.20',
    original_quota: null,
    commission_amount: null,
    tea: 40,
    tea_irr: 40,
    tcea: 40,
    ...extra,
  };
}

function apiPlan(term: number, options: ReturnType<typeof apiOption>[]) {
  return {
    term,
    term_months: null,
    payment_frequency: 'semanal' as const,
    tea: 40,
    tcea: 40,
    options,
  };
}

describe('totalTerm desde el wire', () => {
  it('usa el que manda el backend', () => {
    const plan = transformPaymentPlanForTest(
      apiPlan(13, [apiOption({ initial_installments: 4, total_term: 17 })]),
    );
    expect(plan.options[0].totalTerm).toBe(17);
  });

  it('dos modalidades del mismo plazo coinciden', () => {
    const cuatro = transformPaymentPlanForTest(
      apiPlan(13, [apiOption({ initial_installments: 4, total_term: 17 })]),
    );
    const dos = transformPaymentPlanForTest(
      apiPlan(15, [apiOption({ initial_installments: 2, total_term: 17 })]),
    );
    expect(cuatro.options[0].totalTerm).toBe(dos.options[0].totalTerm);
  });
});

describe('totalTerm recalculado cuando no viene', () => {
  it('suma las armadas al plazo', () => {
    const plan = transformPaymentPlanForTest(
      apiPlan(13, [apiOption({ initial_installments: 4 })]),
    );
    expect(plan.options[0].totalTerm).toBe(17);
  });

  it('el pago único no suma: es inmediato', () => {
    const plan = transformPaymentPlanForTest(
      apiPlan(17, [apiOption({ initial_installments: 1 })]),
    );
    expect(plan.options[0].totalTerm).toBe(17);
  });

  it('sin el campo de armadas se comporta como pago único', () => {
    // El caso de TODO el catálogo que no configuró armadas.
    const plan = transformPaymentPlanForTest(apiPlan(24, [apiOption()]));
    expect(plan.options[0].totalTerm).toBe(24);
  });
});

describe('agrupar por plazo', () => {
  it('las seis celdas del cosechador colapsan en dos plazos', () => {
    const celdas: [number, number][] = [
      [6, 4], [8, 2], [10, 1],
      [13, 4], [15, 2], [17, 1],
    ];
    const totales = celdas.map(([term, armadas]) => {
      const plan = transformPaymentPlanForTest(
        apiPlan(term, [apiOption({ initial_installments: armadas })]),
      );
      return plan.options[0].totalTerm;
    });

    expect(new Set(totales)).toEqual(new Set([10, 17]));
  });
});
