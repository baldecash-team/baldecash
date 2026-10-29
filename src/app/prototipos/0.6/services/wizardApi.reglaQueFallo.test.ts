/**
 * BAL-5254 — `form_step_validation_error` dice qué regla falló y qué texto vio
 * la persona. `validateField` informa la regla en `rule` y
 * `validateStepDetallado` la sube junto al mensaje del primer error.
 * `validateStep` sigue devolviendo solo el código del campo.
 */

import {
  validateField,
  validateStep,
  validateStepDetallado,
  WizardField,
  WizardStep,
} from './wizardApi';

function campo(overrides: Partial<WizardField> = {}): WizardField {
  return {
    id: 1,
    code: 'phone',
    label: 'Celular',
    type: 'tel',
    placeholder: null,
    help_text: null,
    required: true,
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
  } as WizardField;
}

function paso(fields: WizardField[]): WizardStep {
  return { code: 'datos_personales', url_slug: 'datos-personales', title: 'Datos', fields } as unknown as WizardStep;
}

describe('validateField informa la regla que falló', () => {
  it('vacío y requerido → required', () => {
    expect(validateField(campo(), '', {})).toEqual({
      isValid: false,
      error: 'Este campo es requerido',
      rule: 'required',
    });
  });

  it('regla del API → su validation_type y su mensaje', () => {
    const f = campo({ validations: [{ type: 'phone', message: 'Ingresa un celular de 9 dígitos' }] });
    expect(validateField(f, '12345', {})).toEqual({
      isValid: false,
      error: 'Ingresa un celular de 9 dígitos',
      rule: 'phone',
    });
  });

  it('not_equals_field', () => {
    const f = campo({
      code: 'supporter_phone',
      validations: [{ type: 'not_equals_field', value: 'phone', message: 'Debe ser distinto a tu celular' }],
    });
    const r = validateField(f, '999888777', { phone: '999888777' });
    expect(r.rule).toBe('not_equals_field');
    expect(r.error).toBe('Debe ser distinto a tu celular');
  });

  it('largo propio del campo → min_length', () => {
    expect(validateField(campo({ min_length: 9 }), '123', {}).rule).toBe('min_length');
  });

  it('válido → sin regla', () => {
    expect(validateField(campo(), '987654321', {})).toEqual({ isValid: true, error: null });
  });
});

describe('validateStepDetallado', () => {
  const campos = [
    campo({ code: 'first_name', type: 'text' }),
    campo({ code: 'phone', validations: [{ type: 'phone', message: 'Celular inválido' }] }),
  ];

  it('devuelve el primer campo con error, su regla y su mensaje', () => {
    const set = jest.fn();
    expect(validateStepDetallado(paso(campos), { first_name: 'Ana', phone: '12' }, set)).toEqual({
      field: 'phone',
      rule: 'phone',
      message: 'Celular inválido',
    });
    expect(set).toHaveBeenCalledWith('phone', 'Celular inválido');
  });

  it('nunca incluye lo que escribió la persona', () => {
    const r = validateStepDetallado(paso(campos), { first_name: 'Ana', phone: '12' }, jest.fn());
    expect(JSON.stringify(r)).not.toContain('12"');
    expect(Object.values(r ?? {})).not.toContain('12');
  });

  it('sin errores → null', () => {
    expect(validateStepDetallado(paso(campos), { first_name: 'Ana', phone: '987654321' }, jest.fn())).toBeNull();
  });

  it('validateStep sigue devolviendo solo el código del campo', () => {
    expect(validateStep(paso(campos), { first_name: '', phone: '' }, jest.fn())).toBe('first_name');
    expect(validateStep(paso(campos), { first_name: 'Ana', phone: '987654321' }, jest.fn())).toBeNull();
  });
});
