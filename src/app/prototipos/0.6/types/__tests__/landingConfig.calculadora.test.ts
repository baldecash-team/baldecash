import { getCalculadora, DEFAULT_LANDING_CONFIG } from '../landingConfig';

test('returns null when calculadora namespace absent', () => {
  expect(getCalculadora(DEFAULT_LANDING_CONFIG)).toBeNull();
});

test('returns null when disabled', () => {
  const cfg = { ...DEFAULT_LANDING_CONFIG, calculadora: { enabled: false } } as any;
  expect(getCalculadora(cfg)).toBeNull();
});

test('maps snake_case efectivo_product_id and coerces fields', () => {
  const cfg = {
    ...DEFAULT_LANDING_CONFIG,
    calculadora: {
      enabled: true,
      efectivo_product_id: 123,
      monto: { min: 500, max: 8000, step: 100 },
      plazos: [6, 12],
      inicial: { percents: [0, 10] },
      tea: 89.9,
    },
  } as any;
  const out = getCalculadora(cfg)!;
  expect(out.enabled).toBe(true);
  expect(out.efectivoProductId).toBe(123);
  expect(out.monto.max).toBe(8000);
  expect(out.plazos).toEqual([6, 12]);
  expect(out.inicial.percents).toEqual([0, 10]);
  expect(out.tea).toBeCloseTo(89.9);
});
