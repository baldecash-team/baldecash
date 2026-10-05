/**
 * BAL-4396 — `validateField` respeta la fecha mínima y máxima del campo.
 *
 * El calendario ya no deja elegir fuera del rango, pero el valor puede llegar
 * por otro lado (prefill, sesión guardada, valor por defecto): la validación
 * del paso tiene que frenarlo con el mismo mensaje.
 */
import { validateField, WizardField } from './wizardApi';

function campoFecha(overrides: Partial<WizardField> = {}): WizardField {
  return {
    id: 1,
    code: 'birth_date',
    label: 'Fecha de nacimiento',
    type: 'date',
    placeholder: null,
    help_text: null,
    required: true,
    readonly: false,
    hidden: false,
    grid_columns: 12,
    grid_columns_mobile: 12,
    options: [],
    validations: [],
    dependency_groups: [],
    max_files: null,
    ...overrides,
  };
}

describe('BAL-4396 · validateField con fecha mínima/máxima', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // 3-oct-2026 al mediodía en Lima
    jest.setSystemTime(new Date('2026-10-03T17:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());

  it('mayor de 18: rechaza a un menor con el mensaje automático', () => {
    const r = validateField(campoFecha({ date_max: '-18y' }), '2010-01-01', {});
    expect(r).toEqual({ isValid: false, error: 'Elige una fecha hasta el 03/10/2008.' });
  });

  it('acepta justo el borde', () => {
    expect(validateField(campoFecha({ date_max: '-18y' }), '2008-10-03', {}).isValid).toBe(true);
  });

  it('usa el mensaje propio del campo', () => {
    const r = validateField(
      campoFecha({ date_min: '-100y', date_max: '-18y', date_limit_message: 'Debes ser mayor de 18 años' }),
      '2015-06-01',
      {}
    );
    expect(r.error).toBe('Debes ser mayor de 18 años');
  });

  it('sin límites (null) es como antes', () => {
    expect(validateField(campoFecha({ date_min: null, date_max: null }), '2030-01-01', {}).isValid).toBe(true);
    expect(validateField(campoFecha(), '2030-01-01', {}).isValid).toBe(true);
  });
});
