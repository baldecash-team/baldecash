/**
 * Tests for wizardApi - Dynamic Form System
 *
 * Tests the core functions that power the dynamic wizard:
 * - evaluateFieldVisibility: Conditional field display
 * - validateField: Dynamic validation rules
 * - filterFieldOptions: Option filtering based on conditions
 * - Helper functions: Navigation and step lookup
 */

import {
  evaluateFieldVisibility,
  validateField,
  filterFieldOptions,
  getStepByCode,
  getStepBySlug,
  getStepNavigation,
  WizardField,
  WizardFieldOption,
  WizardConfig,
  WizardStep,
  DependencyGroup,
} from './wizardApi';

// ============================================================================
// Test Factories - Create test data
// ============================================================================

function createField(overrides: Partial<WizardField> = {}): WizardField {
  return {
    id: 1,
    code: 'test_field',
    label: 'Test Field',
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
    max_files: 1,
    ...overrides,
  };
}

function createStep(overrides: Partial<WizardStep> = {}): WizardStep {
  return {
    id: 1,
    code: 'step_1',
    url_slug: 'paso-1',
    name: 'Paso 1',
    title: 'Paso 1',
    description: 'Descripción del paso',
    icon: 'User',
    order: 1,
    required: true,
    skippable: false,
    estimated_time_minutes: 5,
    is_summary_step: false,
    motivational: null,
    fields: [],
    ...overrides,
  };
}

function createConfig(overrides: Partial<WizardConfig> = {}): WizardConfig {
  return {
    landing_id: 1,
    landing_slug: 'test-landing',
    landing_name: 'Test Landing',
    steps: [
      createStep({ id: 1, code: 'personal', url_slug: 'datos-personales', order: 1 }),
      createStep({ id: 2, code: 'economic', url_slug: 'datos-economicos', order: 2 }),
      createStep({ id: 3, code: 'documents', url_slug: 'documentos', order: 3 }),
    ],
    ...overrides,
  };
}

// ============================================================================
// evaluateFieldVisibility Tests
// ============================================================================

describe('evaluateFieldVisibility', () => {
  describe('fields without dependency groups', () => {
    it('returns true for field with empty dependency_groups', () => {
      const field = createField({ hidden: false, dependency_groups: [] });
      const result = evaluateFieldVisibility(field, {});
      expect(result).toBe(true);
    });

    it('returns true for hidden field without groups (visibility controlled by caller)', () => {
      const field = createField({ hidden: true, dependency_groups: [] });
      const result = evaluateFieldVisibility(field, {});
      expect(result).toBe(true);
    });
  });

  describe('equals operator', () => {
    it('shows field when condition is met (equals)', () => {
      const field = createField({
        dependency_groups: [{
          action: 'show', logic: 'and',
          conditions: [{ depends_on_field: 'document_type', operator: 'equals', value: 'dni' }],
        }],
      });

      expect(evaluateFieldVisibility(field, { document_type: 'dni' })).toBe(true);
      expect(evaluateFieldVisibility(field, { document_type: 'ce' })).toBe(false);
    });

    it('hides field when condition is met (equals + hide)', () => {
      const field = createField({
        dependency_groups: [{
          action: 'hide', logic: 'and',
          conditions: [{ depends_on_field: 'is_foreigner', operator: 'equals', value: 'yes' }],
        }],
      });

      expect(evaluateFieldVisibility(field, { is_foreigner: 'yes' })).toBe(false);
      expect(evaluateFieldVisibility(field, { is_foreigner: 'no' })).toBe(true);
    });
  });

  describe('not_equals operator', () => {
    it('shows field when value does NOT match', () => {
      const field = createField({
        dependency_groups: [{
          action: 'show', logic: 'and',
          conditions: [{ depends_on_field: 'employment_type', operator: 'not_equals', value: 'unemployed' }],
        }],
      });

      expect(evaluateFieldVisibility(field, { employment_type: 'employed' })).toBe(true);
      expect(evaluateFieldVisibility(field, { employment_type: 'unemployed' })).toBe(false);
    });
  });

  describe('in operator', () => {
    it('shows field when value is in array', () => {
      const field = createField({
        dependency_groups: [{
          action: 'show', logic: 'and',
          conditions: [{ depends_on_field: 'income_range', operator: 'in', value: ['1000-2000', '2000-3000', '3000-5000'] }],
        }],
      });

      expect(evaluateFieldVisibility(field, { income_range: '2000-3000' })).toBe(true);
      expect(evaluateFieldVisibility(field, { income_range: '500-1000' })).toBe(false);
    });
  });

  describe('not_in operator', () => {
    it('shows field when value is NOT in array', () => {
      const field = createField({
        dependency_groups: [{
          action: 'show', logic: 'and',
          conditions: [{ depends_on_field: 'region', operator: 'not_in', value: ['excluded_region_1', 'excluded_region_2'] }],
        }],
      });

      expect(evaluateFieldVisibility(field, { region: 'lima' })).toBe(true);
      expect(evaluateFieldVisibility(field, { region: 'excluded_region_1' })).toBe(false);
    });
  });

  describe('is_empty operator', () => {
    it('shows field when dependent field is empty', () => {
      const field = createField({
        dependency_groups: [{
          action: 'show', logic: 'and',
          conditions: [{ depends_on_field: 'referral_code', operator: 'is_empty', value: null }],
        }],
      });

      expect(evaluateFieldVisibility(field, { referral_code: '' })).toBe(true);
      expect(evaluateFieldVisibility(field, {})).toBe(true);
      expect(evaluateFieldVisibility(field, { referral_code: 'ABC123' })).toBe(false);
    });
  });

  describe('is_not_empty operator', () => {
    it('shows field when dependent field has value', () => {
      const field = createField({
        dependency_groups: [{
          action: 'show', logic: 'and',
          conditions: [{ depends_on_field: 'company_name', operator: 'is_not_empty', value: null }],
        }],
      });

      expect(evaluateFieldVisibility(field, { company_name: 'ACME Corp' })).toBe(true);
      expect(evaluateFieldVisibility(field, { company_name: '' })).toBe(false);
      expect(evaluateFieldVisibility(field, {})).toBe(false);
    });
  });

  // ============================================================================
  // Group logic (AND/OR within groups, OR between groups)
  // ============================================================================

  describe('group logic', () => {
    it('returns true when no groups', () => {
      const field = createField({ dependency_groups: [] });
      expect(evaluateFieldVisibility(field, {})).toBe(true);
    });

    it('single group AND: all conditions must match', () => {
      const field = createField({
        dependency_groups: [{
          action: 'show', logic: 'and',
          conditions: [
            { depends_on_field: 'a', operator: 'equals', value: '1' },
            { depends_on_field: 'b', operator: 'equals', value: '2' },
          ]
        }]
      });
      expect(evaluateFieldVisibility(field, { a: '1', b: '2' })).toBe(true);
      expect(evaluateFieldVisibility(field, { a: '1', b: '9' })).toBe(false);
      expect(evaluateFieldVisibility(field, { a: '9', b: '2' })).toBe(false);
    });

    it('single group OR: any condition matches', () => {
      const field = createField({
        dependency_groups: [{
          action: 'show', logic: 'or',
          conditions: [
            { depends_on_field: 'a', operator: 'equals', value: '1' },
            { depends_on_field: 'b', operator: 'equals', value: '2' },
          ]
        }]
      });
      expect(evaluateFieldVisibility(field, { a: '1', b: '9' })).toBe(true);
      expect(evaluateFieldVisibility(field, { a: '9', b: '2' })).toBe(true);
      expect(evaluateFieldVisibility(field, { a: '9', b: '9' })).toBe(false);
    });

    it('multiple show groups: OR between groups (any group met = visible)', () => {
      const field = createField({
        dependency_groups: [
          { action: 'show', logic: 'and', conditions: [
            { depends_on_field: 'source', operator: 'equals', value: 'empleado' },
            { depends_on_field: 'proof', operator: 'equals', value: 'recibo' },
          ]},
          { action: 'show', logic: 'and', conditions: [
            { depends_on_field: 'source', operator: 'equals', value: 'negocio' },
            { depends_on_field: 'proof', operator: 'equals', value: 'ninguno' },
          ]},
        ]
      });
      expect(evaluateFieldVisibility(field, { source: 'empleado', proof: 'recibo' })).toBe(true);
      expect(evaluateFieldVisibility(field, { source: 'negocio', proof: 'ninguno' })).toBe(true);
      expect(evaluateFieldVisibility(field, { source: 'empleado', proof: 'ninguno' })).toBe(false);
      expect(evaluateFieldVisibility(field, { source: 'negocio', proof: 'recibo' })).toBe(false);
    });

    it('hide group takes priority over show groups', () => {
      const field = createField({
        dependency_groups: [
          { action: 'show', logic: 'and', conditions: [
            { depends_on_field: 'a', operator: 'equals', value: '1' },
          ]},
          { action: 'hide', logic: 'and', conditions: [
            { depends_on_field: 'b', operator: 'equals', value: 'blocked' },
          ]},
        ]
      });
      expect(evaluateFieldVisibility(field, { a: '1', b: 'ok' })).toBe(true);
      expect(evaluateFieldVisibility(field, { a: '1', b: 'blocked' })).toBe(false);
    });

    it('case-insensitive comparison within groups', () => {
      const field = createField({
        dependency_groups: [{
          action: 'show', logic: 'and',
          conditions: [
            { depends_on_field: 'role', operator: 'equals', value: 'Developer' },
          ]
        }]
      });
      expect(evaluateFieldVisibility(field, { role: 'developer' })).toBe(true);
      expect(evaluateFieldVisibility(field, { role: 'DEVELOPER' })).toBe(true);
      expect(evaluateFieldVisibility(field, { role: 'Designer' })).toBe(false);
    });

    it('in/not_in operators work within groups', () => {
      const field = createField({
        dependency_groups: [{
          action: 'show', logic: 'and',
          conditions: [
            { depends_on_field: 'country', operator: 'in', value: ['pe', 'co', 'mx'] },
          ]
        }]
      });
      expect(evaluateFieldVisibility(field, { country: 'PE' })).toBe(true);
      expect(evaluateFieldVisibility(field, { country: 'co' })).toBe(true);
      expect(evaluateFieldVisibility(field, { country: 'us' })).toBe(false);
    });

    it('empty group evaluates to false (never shows)', () => {
      const field = createField({
        dependency_groups: [{
          action: 'show', logic: 'and',
          conditions: []
        }]
      });
      expect(evaluateFieldVisibility(field, {})).toBe(false);
    });

    it('real scenario: Datos Economicos with OR between AND groups', () => {
      const field = createField({
        dependency_groups: [
          { action: 'show', logic: 'and', conditions: [
            { depends_on_field: 'income_source', operator: 'equals', value: 'empleado' },
            { depends_on_field: 'income_proof_type', operator: 'equals', value: 'recibo_nomina' },
          ]},
          { action: 'show', logic: 'and', conditions: [
            { depends_on_field: 'income_source', operator: 'equals', value: 'negocio_personal' },
            { depends_on_field: 'income_proof_type', operator: 'not_equals', value: 'ninguno' },
          ]},
        ]
      });
      expect(evaluateFieldVisibility(field, {
        income_source: 'empleado', income_proof_type: 'recibo_nomina'
      })).toBe(true);
      expect(evaluateFieldVisibility(field, {
        income_source: 'negocio_personal', income_proof_type: 'boletas'
      })).toBe(true);
      expect(evaluateFieldVisibility(field, {
        income_source: 'negocio_personal', income_proof_type: 'ninguno'
      })).toBe(false);
      expect(evaluateFieldVisibility(field, {
        income_source: 'jubilado', income_proof_type: 'recibo_nomina'
      })).toBe(false);
    });
  });
});

// ============================================================================
// validateField Tests
// ============================================================================

describe('validateField', () => {
  describe('required validation', () => {
    it('fails for required empty field', () => {
      const field = createField({ required: true });
      const result = validateField(field, '', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Este campo es requerido');
    });

    it('fails for required field with only whitespace', () => {
      const field = createField({ required: true });
      const result = validateField(field, '   ', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Este campo es requerido');
    });

    it('passes for required field with value', () => {
      const field = createField({ required: true });
      const result = validateField(field, 'some value', {});
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('passes for non-required empty field', () => {
      const field = createField({ required: false });
      const result = validateField(field, '', {});
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('hidden field validation', () => {
    it('validates hidden fields without dependency groups (they are now visible)', () => {
      const field = createField({
        required: true,
        hidden: true,
        dependency_groups: [],
      });
      const result = validateField(field, '', {});
      // hidden=true sin dependency_groups ahora es visible, así que se valida
      expect(result.isValid).toBe(false);
    });

    it('skips validation when field is conditionally hidden', () => {
      const field = createField({
        required: true,
        dependency_groups: [{
          action: 'show', logic: 'and',
          conditions: [{ depends_on_field: 'show_extra', operator: 'equals', value: 'yes' }],
        }],
      });
      // Field is hidden because show_extra !== 'yes'
      const result = validateField(field, '', { show_extra: 'no' });
      expect(result.isValid).toBe(true);
    });
  });

  describe('length validations', () => {
    it('fails for value below min_length', () => {
      const field = createField({ min_length: 8 });
      const result = validateField(field, 'abc', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Mínimo 8 caracteres');
    });

    it('fails for value above max_length', () => {
      const field = createField({ max_length: 5 });
      const result = validateField(field, 'abcdefgh', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Máximo 5 caracteres');
    });

    it('passes for value within length limits', () => {
      const field = createField({ min_length: 3, max_length: 10 });
      const result = validateField(field, 'hello', {});
      expect(result.isValid).toBe(true);
    });
  });

  describe('numeric validations (currency/number)', () => {
    it('fails for non-numeric value in currency field', () => {
      const field = createField({ type: 'currency' });
      const result = validateField(field, 'not a number', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ingresa un valor numérico válido');
    });

    it('fails for value below min_value', () => {
      const field = createField({ type: 'currency', min_value: 100 });
      const result = validateField(field, '50', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El valor mínimo es 100');
    });

    it('fails for value above max_value', () => {
      const field = createField({ type: 'number', max_value: 1000 });
      const result = validateField(field, '1500', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El valor máximo es 1000');
    });

    it('passes for numeric value within range', () => {
      const field = createField({ type: 'currency', min_value: 100, max_value: 1000 });
      const result = validateField(field, '500', {});
      expect(result.isValid).toBe(true);
    });
  });

  describe('pattern validation', () => {
    it('fails when value does not match pattern', () => {
      const field = createField({ pattern: '^[A-Z]{3}$' });
      const result = validateField(field, 'abc', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Formato inválido');
    });

    it('passes when value matches pattern', () => {
      const field = createField({ pattern: '^[A-Z]{3}$' });
      const result = validateField(field, 'ABC', {});
      expect(result.isValid).toBe(true);
    });
  });

  describe('email validation (from validations array)', () => {
    it('fails for invalid email format', () => {
      const field = createField({
        validations: [{ type: 'email', message: 'Email inválido' }],
      });
      const result = validateField(field, 'not-an-email', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email inválido');
    });

    it('passes for valid email format', () => {
      const field = createField({
        validations: [{ type: 'email', message: 'Email inválido' }],
      });
      const result = validateField(field, 'user@example.com', {});
      expect(result.isValid).toBe(true);
    });
  });

  describe('phone validation', () => {
    it('fails for invalid phone (not 9 digits)', () => {
      const field = createField({
        validations: [{ type: 'phone', message: 'Teléfono debe tener 9 dígitos' }],
      });
      const result = validateField(field, '12345', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Teléfono debe tener 9 dígitos');
    });

    it('passes for valid 9-digit phone', () => {
      const field = createField({
        validations: [{ type: 'phone', message: 'Teléfono debe tener 9 dígitos' }],
      });
      const result = validateField(field, '987654321', {});
      expect(result.isValid).toBe(true);
    });
  });

  describe('DNI validation (context-aware)', () => {
    it('fails for invalid DNI (not 8 digits)', () => {
      const field = createField({
        validations: [{ type: 'dni', message: 'Documento inválido' }],
      });
      const result = validateField(field, '1234', { document_type: 'dni' });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El DNI debe tener 8 dígitos');
    });

    it('passes for valid 8-digit DNI', () => {
      const field = createField({
        validations: [{ type: 'dni', message: 'Documento inválido' }],
      });
      const result = validateField(field, '12345678', { document_type: 'dni' });
      expect(result.isValid).toBe(true);
    });

    it('fails for invalid CE (not 9 digits)', () => {
      const field = createField({
        validations: [{ type: 'dni', message: 'Documento inválido' }],
      });
      const result = validateField(field, '12345678', { document_type: 'ce' });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El CE debe tener 9 dígitos');
    });

    it('passes for valid 9-digit CE', () => {
      const field = createField({
        validations: [{ type: 'dni', message: 'Documento inválido' }],
      });
      const result = validateField(field, '123456789', { document_type: 'ce' });
      expect(result.isValid).toBe(true);
    });

    it('validates passport format (6-12 alphanumeric)', () => {
      const field = createField({
        validations: [{ type: 'dni', message: 'Documento inválido' }],
      });
      expect(validateField(field, 'AB1234', { document_type: 'pasaporte' }).isValid).toBe(true);
      expect(validateField(field, 'AB123456789X', { document_type: 'pasaporte' }).isValid).toBe(true);
      expect(validateField(field, 'AB', { document_type: 'pasaporte' }).isValid).toBe(false);
    });
  });

  describe('regex validation from validations array', () => {
    it('fails when regex does not match', () => {
      const field = createField({
        validations: [
          { type: 'regex', value: '^BC-\\d{4}-[A-Z]{3}\\d{5}$', message: 'Código inválido' },
        ],
      });
      const result = validateField(field, 'invalid-code', {});
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Código inválido');
    });

    it('passes when regex matches', () => {
      const field = createField({
        validations: [
          { type: 'regex', value: '^BC-\\d{4}-[A-Z]{3}\\d{5}$', message: 'Código inválido' },
        ],
      });
      const result = validateField(field, 'BC-2025-ABC12345', {});
      expect(result.isValid).toBe(true);
    });
  });
});

// ============================================================================
// filterFieldOptions Tests
// ============================================================================

describe('filterFieldOptions', () => {
  it('returns all options when no visibility_conditions', () => {
    const field = createField({
      options: [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' },
        { value: 'opt3', label: 'Option 3' },
      ],
    });

    const result = filterFieldOptions(field, {});
    expect(result).toHaveLength(3);
  });

  it('filters options based on visibility_conditions', () => {
    const field = createField({
      options: [
        { value: 'personal', label: 'Cuenta Personal', visibility_conditions: { account_type: 'personal' } },
        { value: 'business', label: 'Cuenta Empresarial', visibility_conditions: { account_type: 'business' } },
        { value: 'both', label: 'Ambos', visibility_conditions: null },
      ],
    });

    const personalResult = filterFieldOptions(field, { account_type: 'personal' });
    expect(personalResult).toHaveLength(2);
    expect(personalResult.map((o) => o.value)).toEqual(['personal', 'both']);

    const businessResult = filterFieldOptions(field, { account_type: 'business' });
    expect(businessResult).toHaveLength(2);
    expect(businessResult.map((o) => o.value)).toEqual(['business', 'both']);
  });

  it('handles multiple conditions (AND logic)', () => {
    const field = createField({
      options: [
        {
          value: 'premium',
          label: 'Plan Premium',
          visibility_conditions: { user_type: 'premium', region: 'lima' },
        },
        { value: 'basic', label: 'Plan Básico', visibility_conditions: null },
      ],
    });

    // Both conditions met
    const result1 = filterFieldOptions(field, { user_type: 'premium', region: 'lima' });
    expect(result1).toHaveLength(2);

    // Only one condition met
    const result2 = filterFieldOptions(field, { user_type: 'premium', region: 'arequipa' });
    expect(result2).toHaveLength(1);
    expect(result2[0].value).toBe('basic');
  });
});

// ============================================================================
// Helper Functions Tests
// ============================================================================

describe('getStepByCode', () => {
  it('finds step by code', () => {
    const config = createConfig();
    const step = getStepByCode(config, 'economic');
    expect(step).toBeDefined();
    expect(step?.code).toBe('economic');
  });

  it('returns undefined for non-existent code', () => {
    const config = createConfig();
    const step = getStepByCode(config, 'non_existent');
    expect(step).toBeUndefined();
  });
});

describe('getStepBySlug', () => {
  it('finds step by url_slug', () => {
    const config = createConfig();
    const step = getStepBySlug(config, 'datos-personales');
    expect(step).toBeDefined();
    expect(step?.code).toBe('personal');
  });

  it('falls back to code if url_slug not found', () => {
    const config = createConfig({
      steps: [createStep({ code: 'test_step', url_slug: null })],
    });
    const step = getStepBySlug(config, 'test_step');
    expect(step).toBeDefined();
    expect(step?.code).toBe('test_step');
  });

  it('returns undefined for non-existent slug', () => {
    const config = createConfig();
    const step = getStepBySlug(config, 'non-existent-slug');
    expect(step).toBeUndefined();
  });
});

describe('getStepNavigation', () => {
  it('returns correct navigation for first step', () => {
    const config = createConfig();
    const nav = getStepNavigation(config, 'personal');

    expect(nav.currentIndex).toBe(0);
    expect(nav.isFirst).toBe(true);
    expect(nav.isLast).toBe(false);
    expect(nav.prevStep).toBeNull();
    expect(nav.nextStep?.code).toBe('economic');
  });

  it('returns correct navigation for middle step', () => {
    const config = createConfig();
    const nav = getStepNavigation(config, 'economic');

    expect(nav.currentIndex).toBe(1);
    expect(nav.isFirst).toBe(false);
    expect(nav.isLast).toBe(false);
    expect(nav.prevStep?.code).toBe('personal');
    expect(nav.nextStep?.code).toBe('documents');
  });

  it('returns correct navigation for last step', () => {
    const config = createConfig();
    const nav = getStepNavigation(config, 'documents');

    expect(nav.currentIndex).toBe(2);
    expect(nav.isFirst).toBe(false);
    expect(nav.isLast).toBe(true);
    expect(nav.prevStep?.code).toBe('economic');
    expect(nav.nextStep).toBeNull();
  });

  it('respects step order property', () => {
    const config = createConfig({
      steps: [
        createStep({ code: 'step_c', order: 3 }),
        createStep({ code: 'step_a', order: 1 }),
        createStep({ code: 'step_b', order: 2 }),
      ],
    });

    const nav = getStepNavigation(config, 'step_b');
    expect(nav.prevStep?.code).toBe('step_a');
    expect(nav.nextStep?.code).toBe('step_c');
  });
});
