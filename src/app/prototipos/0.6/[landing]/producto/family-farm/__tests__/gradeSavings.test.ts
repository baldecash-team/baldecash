import { gradeSavings } from '../gradeSavings';

// Precios reales de producción, tal como llegan en `grade_siblings`.
const advance = [
  { grade: 'A' as const, price: 574, isAvailable: true },
  { grade: 'B' as const, price: 402, isAvailable: true },
  { grade: 'C' as const, price: 287, isAvailable: true },
];

// Lenovo Tab P11 de la landing 208: solo tiene B y C, no existe el Grado A.
const tabP11 = [
  { grade: 'B' as const, price: 940, isAvailable: true },
  { grade: 'C' as const, price: 672, isAvailable: true },
];

describe('gradeSavings', () => {
  describe('con Grado A presente', () => {
    it('compara el Grado C contra el A', () => {
      expect(gradeSavings(advance, 'C')).toEqual({ amount: 287, percent: 50 });
    });

    it('compara el Grado B contra el A', () => {
      expect(gradeSavings(advance, 'B')).toEqual({ amount: 172, percent: 30 });
    });

    // El mejor grado ES la referencia: no tiene contra qué ahorrar.
    it('no devuelve nada para el Grado A', () => {
      expect(gradeSavings(advance, 'A')).toBeNull();
    });
  });

  // Sin Grado A la referencia es el mejor grado que el equipo SÍ tiene. No se
  // deriva un Grado A inexistente: sería comparar contra un precio que nadie fijó.
  describe('sin Grado A', () => {
    it('compara el Grado C contra el B, que es el mejor disponible', () => {
      expect(gradeSavings(tabP11, 'C')).toEqual({ amount: 268, percent: 29 });
    });

    it('no devuelve nada para el Grado B, que pasa a ser la referencia', () => {
      expect(gradeSavings(tabP11, 'B')).toBeNull();
    });
  });

  describe('cuando no hay nada que comparar', () => {
    it('no devuelve nada con un solo grado', () => {
      expect(gradeSavings([{ grade: 'B', price: 940, isAvailable: true }], 'B')).toBeNull();
    });

    it('no devuelve nada sin grados', () => {
      expect(gradeSavings([], 'A')).toBeNull();
    });

    it('no devuelve nada si el grado elegido no está en la lista', () => {
      expect(gradeSavings(tabP11, 'A')).toBeNull();
    });
  });

  describe('datos incompletos o inconsistentes', () => {
    it('ignora los grados sin precio al buscar la referencia', () => {
      const grades = [
        { grade: 'A' as const, isAvailable: true },
        { grade: 'B' as const, price: 940, isAvailable: true },
        { grade: 'C' as const, price: 672, isAvailable: true },
      ];
      expect(gradeSavings(grades, 'C')).toEqual({ amount: 268, percent: 29 });
    });

    it('no devuelve nada si el grado elegido no trae precio', () => {
      const grades = [
        { grade: 'A' as const, price: 574, isAvailable: true },
        { grade: 'C' as const, isAvailable: true },
      ];
      expect(gradeSavings(grades, 'C')).toBeNull();
    });

    // Si un grado peor saliera más caro que el mejor, el "ahorro" sería negativo.
    // Mostrar "ahorras -S/50" es peor que no mostrar nada.
    it('no devuelve nada si el ahorro no es positivo', () => {
      const grades = [
        { grade: 'A' as const, price: 500, isAvailable: true },
        { grade: 'C' as const, price: 700, isAvailable: true },
      ];
      expect(gradeSavings(grades, 'C')).toBeNull();
    });

    it('no devuelve nada si los precios son iguales', () => {
      const grades = [
        { grade: 'A' as const, price: 500, isAvailable: true },
        { grade: 'B' as const, price: 500, isAvailable: true },
      ];
      expect(gradeSavings(grades, 'B')).toBeNull();
    });
  });

  it('redondea el porcentaje al entero más cercano', () => {
    // 1000 → 714 son 286 de ahorro, 28.6% → 29%
    const grades = [
      { grade: 'B' as const, price: 1000, isAvailable: true },
      { grade: 'C' as const, price: 714, isAvailable: true },
    ];
    expect(gradeSavings(grades, 'C')).toEqual({ amount: 286, percent: 29 });
  });

  // La disponibilidad no entra en la cuenta: un grado agotado sigue siendo la
  // referencia de precio válida del equipo.
  it('toma como referencia el mejor grado aunque esté sin stock', () => {
    const grades = [
      { grade: 'A' as const, price: 574, isAvailable: false },
      { grade: 'C' as const, price: 287, isAvailable: true },
    ];
    expect(gradeSavings(grades, 'C')).toEqual({ amount: 287, percent: 50 });
  });
});
