/**
 * El rótulo del selector de plazo.
 *
 * Lo primero que fija este archivo es que el resto del catálogo NO cambia: sin
 * armadas no hay sufijo y el rótulo es el de siempre. Ese es el único motivo por
 * el que se puede tocar un componente que usan todas las landings.
 */

import {
  armadasDelPlan,
  etiquetasDePlazo,
  getTermUnit,
  hayArmadas,
  ordenarTerms,
  plazoTotalDelPlan,
  type PlanDePago,
} from '../etiquetaDePlazo';

function plan(term: number, armadas?: number): PlanDePago {
  return {
    term,
    termMonths: null,
    options: [
      {
        initialPercent: 25,
        initialAmount: 134,
        monthlyQuota: 32.2,
        ...(armadas !== undefined ? { initialInstallments: armadas } : {}),
      },
    ],
  };
}

/** Las seis celdas reales del cosechador de Family Farms. */
const cosechador = [
  plan(6, 4), plan(8, 2), plan(10, 1),
  plan(13, 4), plan(15, 2), plan(17, 1),
];

describe('el resto del catálogo no cambia', () => {
  const catalogoComun = [plan(12), plan(18), plan(24), plan(36)];

  it('sin armadas no hay etiquetas: el selector cae a su rótulo de siempre', () => {
    expect(etiquetasDePlazo(catalogoComun, 'mensual').size).toBe(0);
  });

  it('con una sola armada tampoco: un pago único es lo que hace todo el catálogo', () => {
    expect(etiquetasDePlazo([plan(24, 1), plan(36, 1)], 'mensual').size).toBe(0);
  });

  it('el orden queda igual que el numérico de siempre', () => {
    expect(ordenarTerms(catalogoComun, [36, 12, 24, 18])).toEqual([12, 18, 24, 36]);
  });

  it('sin armadas el plazo total ES el term', () => {
    // El pago único es inmediato: no ocupa un período del calendario.
    for (const term of [6, 12, 18, 24, 36, 48]) {
      expect(plazoTotalDelPlan(plan(term))).toBe(term);
      expect(plazoTotalDelPlan(plan(term, 1))).toBe(term);
    }
  });
});

describe('Family Farms: el plazo total con la modalidad al lado', () => {
  it('rotula las seis celdas con el total, no con las cuotas', () => {
    expect(etiquetasDePlazo(cosechador, 'semanal')).toEqual(
      new Map([
        [6, '10 semanas · 4 armadas'],
        [8, '10 semanas · 2 armadas'],
        [10, '10 semanas · 1 pago'],
        [13, '17 semanas · 4 armadas'],
        [15, '17 semanas · 2 armadas'],
        [17, '17 semanas · 1 pago'],
      ]),
    );
  });

  it.each([
    [13, 4, 17],
    [15, 2, 17],
    [17, 1, 17],
    [6, 4, 10],
    [8, 2, 10],
    [10, 1, 10],
  ])('%i cuotas con %i armadas son %i semanas', (term, armadas, total) => {
    expect(plazoTotalDelPlan(plan(term, armadas))).toBe(total);
  });

  it('ordena por plazo total y, dentro de uno, de menos a más armadas', () => {
    // La persona lee «10, 10, 10, 17, 17, 17», no «6, 8, 10, 13, 15, 17».
    expect(ordenarTerms(cosechador, [6, 8, 10, 13, 15, 17])).toEqual([10, 8, 6, 17, 15, 13]);
  });

  it('un producto con una sola modalidad, si tiene armadas, igual la muestra', () => {
    // No se depende de que haya varias modalidades para que el sufijo aparezca:
    // si la inicial se paga en cuatro partes, eso se dice.
    expect(etiquetasDePlazo([plan(13, 4)], 'semanal')).toEqual(
      new Map([[13, '17 semanas · 4 armadas']]),
    );
  });

  it('la unidad sigue a la frecuencia', () => {
    expect(etiquetasDePlazo([plan(13, 4)], 'quincenal').get(13)).toBe('17 quincenas · 4 armadas');
    expect(etiquetasDePlazo([plan(13, 4)], 'mensual').get(13)).toBe('17 meses · 4 armadas');
  });

  it('un term que no tiene plan no rompe el orden', () => {
    // El selector interseca los plazos de varios productos: puede llegar un term
    // que este producto no ofrece.
    expect(ordenarTerms(cosechador, [13, 99])).toEqual([13, 99]);
  });
});

describe('hayArmadas', () => {
  it('es falso para el catálogo entero', () => {
    expect(hayArmadas([plan(24), plan(36, 1)])).toBe(false);
    expect(hayArmadas([])).toBe(false);
  });

  it('es verdadero apenas una opción se fracciona', () => {
    expect(hayArmadas([plan(24), plan(13, 4)])).toBe(true);
  });
});

describe('armadasDelPlan', () => {
  it('sin el campo asume pago único', () => {
    expect(armadasDelPlan(plan(24))).toBe(1);
    expect(armadasDelPlan({ term: 24, options: [] })).toBe(1);
  });

  it('lee las armadas de la opción', () => {
    expect(armadasDelPlan(plan(13, 4))).toBe(4);
  });
});

describe('getTermUnit', () => {
  it('singulariza', () => {
    expect(getTermUnit(1, 'semanal')).toBe('semana');
    expect(getTermUnit(1, 'quincenal')).toBe('quincena');
    expect(getTermUnit(1, 'mensual')).toBe('mes');
  });

  it('sin frecuencia asume meses', () => {
    expect(getTermUnit(24, undefined)).toBe('meses');
  });
});
