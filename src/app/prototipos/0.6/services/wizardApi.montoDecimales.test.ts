/**
 * BAL-4400 — Monto: decimales por campo.
 *
 * `decimal_places` llega del wizard: 0 = solo soles enteros, 2 = hasta 2
 * decimales, null/ausente = como hoy (hasta 2, opcionales). La validación del
 * paso frena un monto con céntimos en un campo «sin decimales» (p. ej. un
 * valor guardado de antes de que el panel cambiara la opción).
 */

import { validateField, WizardField } from './wizardApi';

function campoMonto(overrides: Partial<WizardField> = {}): WizardField {
  return {
    id: 1,
    code: 'ingreso_mensual',
    label: 'Ingreso mensual',
    type: 'currency',
    placeholder: null,
    help_text: null,
    required: true,
    readonly: false,
    hidden: false,
    grid_columns: 12,
    grid_columns_mobile: 12,
    prefix: 'S/',
    suffix: null,
    min_length: null,
    max_length: null,
    min_value: null,
    max_value: null,
    pattern: null,
    mask: null,
    input_mode: null,
    options_source: null,
    options_filter: null,
    options: [],
    validations: [],
    dependency_groups: [],
    accepted_file_types: null,
    max_file_size_mb: null,
    max_files: null,
    ...overrides,
  };
}

const validar = (valor: string, overrides: Partial<WizardField> = {}) =>
  validateField(campoMonto(overrides), valor, { ingreso_mensual: valor });

describe('BAL-4400 · Monto sin decimales', () => {
  it('2500 es válido', () => {
    expect(validar('2500', { decimal_places: 0 }).isValid).toBe(true);
  });

  it('2500.50 se frena con un mensaje claro', () => {
    const r = validar('2500.50', { decimal_places: 0 });
    expect(r.isValid).toBe(false);
    expect(r.error).toMatch(/soles enteros/);
  });

  it('2500.00 no tiene céntimos: es válido', () => {
    expect(validar('2500.00', { decimal_places: 0 }).isValid).toBe(true);
  });
});

describe('BAL-4400 · Monto con 2 decimales o sin definir (como hoy)', () => {
  it.each([[2], [null], [undefined]])('decimal_places=%p acepta 2500.50', (d) => {
    expect(validar('2500.50', { decimal_places: d as 0 | 2 | null | undefined }).isValid).toBe(true);
  });
});
