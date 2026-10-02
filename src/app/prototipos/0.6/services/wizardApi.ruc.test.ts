/**
 * BAL-4351 — regla de validación «ruc» (inicios permitidos)
 *
 * El panel de admin2 ya permite configurar una regla de tipo `ruc` en el
 * form builder, pero el formulario público la ignoraba: `validateField` no
 * tenía `case 'ruc'`. Esta regla valida que el valor sea un RUC de 11
 * dígitos y, si se configuró una lista de inicios permitidos, que empiece
 * por uno de ellos.
 *
 * Forma de la regla (contrato BAL-4351):
 *  - `value` = inicios permitidos, de 2 dígitos cada uno, separados por
 *    coma (p. ej. "10,15,17,20"). `null`/vacío = cualquier inicio.
 *  - El texto, tras trim, debe ser exactamente 11 dígitos (`^\d{11}$`).
 *  - Campo vacío no dispara la regla (lo decide «requerido»).
 */

import { validateField, checkRuc, WizardField } from './wizardApi';

// ============================================================================
// Factory
// ============================================================================

function createField(overrides: Partial<WizardField> = {}): WizardField {
  return {
    id: 1,
    code: 'ruc',
    label: 'RUC',
    type: 'text',
    placeholder: null,
    help_text: null,
    required: false,
    readonly: false,
    hidden: false,
    grid_columns: 12,
    grid_columns_mobile: 12,
    prefix: null,
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

function validar(value: string, overrides: Partial<WizardField> = {}) {
  return validateField(createField(overrides), value, { ruc: value });
}

// ============================================================================
// checkRuc — helper puro
// ============================================================================

describe('BAL-4351 · checkRuc (helper puro)', () => {
  it('11 dígitos sin lista -> válido', () => {
    expect(checkRuc('20100105678', null)).toBe(true);
    expect(checkRuc('20100105678', undefined)).toBe(true);
    expect(checkRuc('20100105678', '')).toBe(true);
  });

  it('11 dígitos con lista y el inicio está en la lista -> válido', () => {
    expect(checkRuc('20100105678', '10,15,17,20')).toBe(true);
    expect(checkRuc('10100105678', '10,15,17,20')).toBe(true);
  });

  it('11 dígitos con lista y el inicio NO está en la lista -> inválido', () => {
    expect(checkRuc('30100105678', '10,15,17,20')).toBe(false);
  });

  it('tolera espacios dentro de la lista', () => {
    expect(checkRuc('20100105678', ' 10, 15 , 17,20 ')).toBe(true);
    expect(checkRuc('30100105678', ' 10, 15 , 17,20 ')).toBe(false);
  });

  it('10 dígitos -> inválido (muy corto)', () => {
    expect(checkRuc('2010010567', '10,15,17,20')).toBe(false);
    expect(checkRuc('2010010567', null)).toBe(false);
  });

  it('12 dígitos -> inválido (muy largo)', () => {
    expect(checkRuc('201001056789', '10,15,17,20')).toBe(false);
    expect(checkRuc('201001056789', null)).toBe(false);
  });

  it('con letras -> inválido', () => {
    expect(checkRuc('2010010567A', null)).toBe(false);
    expect(checkRuc('ABCDEFGHIJK', null)).toBe(false);
  });

  it('hace trim del valor antes de validar', () => {
    expect(checkRuc('  20100105678  ', '10,15,17,20')).toBe(true);
  });
});

// ============================================================================
// validateField — integración con la regla `ruc`
// ============================================================================

describe('BAL-4351 · validateField con regla `ruc`', () => {
  it('RUC válido sin lista -> sin error', () => {
    const r = validar('20100105678', {
      validations: [{ type: 'ruc', value: null, message: '' }],
    });
    expect(r.isValid).toBe(true);
    expect(r.error).toBeNull();
  });

  it('RUC válido con lista y el inicio correcto -> sin error', () => {
    const r = validar('20100105678', {
      validations: [{ type: 'ruc', value: '10,15,17,20', message: '' }],
    });
    expect(r.isValid).toBe(true);
  });

  it('usa el mensaje configurado cuando la regla trae `message`', () => {
    const r = validar('123', {
      validations: [
        { type: 'ruc', value: '10,20', message: 'Ese RUC no es válido' },
      ],
    });
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Ese RUC no es válido');
  });

  it('mensaje por defecto SIN lista', () => {
    const r = validar('123', {
      validations: [{ type: 'ruc', value: null, message: '' }],
    });
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Ingresa un RUC válido de 11 dígitos');
  });

  it('mensaje por defecto CON lista: une con comas y "o" antes del último', () => {
    const r = validar('30100105678', {
      validations: [{ type: 'ruc', value: '10,15,17,20', message: '' }],
    });
    expect(r.isValid).toBe(false);
    expect(r.error).toBe(
      'Ingresa un RUC válido de 11 dígitos que empiece en 10, 15, 17 o 20'
    );
  });

  it('mensaje por defecto con lista de un solo inicio: sin comas', () => {
    const r = validar('30100105678', {
      validations: [{ type: 'ruc', value: '20', message: '' }],
    });
    expect(r.isValid).toBe(false);
    expect(r.error).toBe(
      'Ingresa un RUC válido de 11 dígitos que empiece en 20'
    );
  });

  it('campo vacío y no requerido -> sin error (la regla `ruc` no se dispara)', () => {
    const r = validar('', {
      required: false,
      validations: [{ type: 'ruc', value: '10,20', message: '' }],
    });
    expect(r.isValid).toBe(true);
    expect(r.error).toBeNull();
  });

  it('la regla `pattern` del campo sigue funcionando igual (no se rompió nada)', () => {
    const r = validar('abc', { pattern: '^[A-Z]{3}$' });
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Formato inválido');

    const ok = validar('ABC', { pattern: '^[A-Z]{3}$' });
    expect(ok.isValid).toBe(true);
  });
});
