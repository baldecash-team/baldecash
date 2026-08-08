/**
 * El plazo que ofrece el selector: total, no cuotas.
 *
 * Las armadas se descuentan del plazo, así que 13 cuotas con la inicial en 4
 * armadas y 15 con 2 son las dos «17 semanas». Ofrecerlas como plazos sueltos
 * hace que quien elige «13» no vea que está eligiendo 4 armadas.
 *
 * Lo que este archivo protege es que el cambio **no toque al resto del
 * catálogo**: sin armadas el plazo total ES el `term`, así que para todo
 * producto que no las use la agrupación es la identidad. Ese es el único motivo
 * por el que se puede tocar `getAvailableTerms`, que usan todas las landings.
 */

interface Opt {
  initialPercent: number;
  initialAmount: number;
  monthlyQuota: number;
  initialInstallments?: number;
}

interface Plan {
  term: number;
  termMonths?: number | null;
  options: Opt[];
}

/** Réplica de `plazoTotalDelPlan` del contexto. */
function plazoTotal(plan: Plan): number {
  const armadas = plan.options?.[0]?.initialInstallments ?? 1;
  return armadas > 1 ? plan.term + armadas : plan.term;
}

function plan(term: number, armadas?: number): Plan {
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

describe('el resto del catálogo no cambia', () => {
  it('sin el campo de armadas, el total es el term', () => {
    // El caso de TODOS los productos que no configuraron armadas.
    for (const term of [6, 12, 18, 24, 36, 48]) {
      expect(plazoTotal(plan(term))).toBe(term);
    }
  });

  it('con una sola armada tampoco cambia', () => {
    // Un pago único es inmediato: no ocupa un período del calendario.
    for (const term of [10, 17, 24]) {
      expect(plazoTotal(plan(term, 1))).toBe(term);
    }
  });

  it('los plazos ofrecidos quedan idénticos', () => {
    const catalogoComun = [plan(12), plan(18), plan(24), plan(36)];
    expect(catalogoComun.map(plazoTotal)).toEqual([12, 18, 24, 36]);
  });
});

describe('Family Farms: las seis celdas colapsan en dos plazos', () => {
  const cosechador = [
    plan(10, 1), plan(8, 2), plan(6, 4),
    plan(17, 1), plan(15, 2), plan(13, 4),
  ];

  it('ofrece 10 y 17, no seis plazos sueltos', () => {
    expect(new Set(cosechador.map(plazoTotal))).toEqual(new Set([10, 17]));
  });

  it.each([
    [13, 4, 17],
    [15, 2, 17],
    [17, 1, 17],
    [6, 4, 10],
    [8, 2, 10],
    [10, 1, 10],
  ])('%i cuotas con %i armadas son %i semanas', (term, armadas, esperado) => {
    expect(plazoTotal(plan(term, armadas))).toBe(esperado);
  });
});

describe('elegir un plazo cuando dos planes lo comparten', () => {
  /** Réplica de la resolución del contexto: conserva la modalidad elegida. */
  function elegir(planes: Plan[], total: number, armadasActuales: number): Plan | undefined {
    const candidatos = planes.filter((p) => plazoTotal(p) === total);
    return (
      candidatos.find((p) =>
        p.options.some((o) => (o.initialInstallments ?? 1) === armadasActuales),
      ) ?? candidatos[0]
    );
  }

  const planes = [plan(17, 1), plan(15, 2), plan(13, 4)];

  it('conserva la modalidad que la persona ya tenía', () => {
    expect(elegir(planes, 17, 4)?.term).toBe(13);
    expect(elegir(planes, 17, 2)?.term).toBe(15);
    expect(elegir(planes, 17, 1)?.term).toBe(17);
  });

  it('si esa modalidad no existe, toma el primero', () => {
    expect(elegir(planes, 17, 3)?.term).toBe(17);
  });

  it('un plazo inexistente no devuelve nada', () => {
    expect(elegir(planes, 24, 1)).toBeUndefined();
  });
});
