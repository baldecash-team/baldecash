/**
 * BAL-4343 — dominios de correo permitidos por paso
 *
 * Cada paso del formulario puede exigir que el correo termine en ciertos
 * dominios (p. ej. "edu.pe"), configurable desde admin2. Lista vacía/null
 * = acepta cualquier correo (comportamiento actual, sin cambios).
 *
 * Regla (contrato BAL-4343 sección 4): el dominio del correo (lo que va
 * después de la última `@`, en minúsculas) debe ser igual a algún dominio
 * de la lista, o terminar en `.` + ese dominio. No basta con terminar en
 * el texto plano del dominio (por eso "fakeedu.pe" con ["edu.pe"] falla).
 */

import {
  validateField,
  checkEmailDomain,
  WizardField,
} from './wizardApi';

// ============================================================================
// Factory
// ============================================================================

function createField(overrides: Partial<WizardField> = {}): WizardField {
  return {
    id: 1,
    code: 'email',
    label: 'Correo electrónico',
    type: 'email',
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
  };
}

function validar(email: string, overrides: Partial<WizardField> = {}) {
  return validateField(createField(overrides), email, { email });
}

// ============================================================================
// checkEmailDomain — helper puro
// ============================================================================

describe('BAL-4343 · checkEmailDomain (helper puro)', () => {
  it('ana@pucp.edu.pe con ["edu.pe"] -> válido (subdominio)', () => {
    expect(checkEmailDomain('ana@pucp.edu.pe', ['edu.pe'])).toBe(true);
  });

  it('ana@edu.pe con ["edu.pe"] -> válido (dominio exacto)', () => {
    expect(checkEmailDomain('ana@edu.pe', ['edu.pe'])).toBe(true);
  });

  it('ana@gmail.com con ["edu.pe"] -> inválido', () => {
    expect(checkEmailDomain('ana@gmail.com', ['edu.pe'])).toBe(false);
  });

  it('ana@fakeedu.pe con ["edu.pe"] -> inválido (no basta con terminar en el texto)', () => {
    expect(checkEmailDomain('ana@fakeedu.pe', ['edu.pe'])).toBe(false);
  });

  it('sin lista (undefined/null/[]) -> siempre válido', () => {
    expect(checkEmailDomain('ana@gmail.com', undefined)).toBe(true);
    expect(checkEmailDomain('ana@gmail.com', null)).toBe(true);
    expect(checkEmailDomain('ana@gmail.com', [])).toBe(true);
  });

  it('case-insensitive: Ana@PUCP.EDU.PE con ["edu.pe"] -> válido', () => {
    expect(checkEmailDomain('Ana@PUCP.EDU.PE', ['edu.pe'])).toBe(true);
  });

  it('también es insensible a mayúsculas en la lista de dominios', () => {
    expect(checkEmailDomain('ana@pucp.edu.pe', ['EDU.PE'])).toBe(true);
  });
});

// ============================================================================
// validateField — integración con la validación de correo existente
// ============================================================================

describe('BAL-4343 · validateField con allowed_email_domains', () => {
  it('ana@pucp.edu.pe con ["edu.pe"] -> válido', () => {
    const r = validar('ana@pucp.edu.pe', { allowed_email_domains: ['edu.pe'] });
    expect(r.isValid).toBe(true);
  });

  it('ana@edu.pe con ["edu.pe"] -> válido', () => {
    const r = validar('ana@edu.pe', { allowed_email_domains: ['edu.pe'] });
    expect(r.isValid).toBe(true);
  });

  it('ana@gmail.com con ["edu.pe"] -> inválido con el mensaje por defecto', () => {
    const r = validar('ana@gmail.com', { allowed_email_domains: ['edu.pe'] });
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Usa un correo que termine en @edu.pe');
  });

  it('ana@fakeedu.pe con ["edu.pe"] -> inválido (no basta con terminar en el texto)', () => {
    const r = validar('ana@fakeedu.pe', { allowed_email_domains: ['edu.pe'] });
    expect(r.isValid).toBe(false);
  });

  it('mensaje por defecto con varios dominios: unidos por " o ", cada uno con @ delante', () => {
    const r = validar('ana@gmail.com', { allowed_email_domains: ['edu.pe', 'pucp.edu.pe'] });
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Usa un correo que termine en @edu.pe o @pucp.edu.pe');
  });

  it('usa allowed_email_domains_message cuando viene configurado', () => {
    const r = validar('ana@gmail.com', {
      allowed_email_domains: ['edu.pe'],
      allowed_email_domains_message: 'Usa tu correo institucional',
    });
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Usa tu correo institucional');
  });

  it('sin lista (null) -> comportamiento actual, sin cambios', () => {
    const r = validar('ana@gmail.com', { allowed_email_domains: null });
    expect(r.isValid).toBe(true);
  });

  it('sin lista ([]) -> comportamiento actual, sin cambios', () => {
    const r = validar('ana@gmail.com', { allowed_email_domains: [] });
    expect(r.isValid).toBe(true);
  });

  it('sin la propiedad (undefined) -> comportamiento actual, sin cambios', () => {
    const r = validar('ana@gmail.com', {});
    expect(r.isValid).toBe(true);
  });

  it('un correo con formato inválido recibe el error de formato, no el de dominio', () => {
    const r = validar('no-es-un-correo', { allowed_email_domains: ['edu.pe'] });
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Ingresa un correo válido (ejemplo: nombre@dominio.com)');
  });

  it('case-insensitive en validateField: Ana@PUCP.EDU.PE con ["edu.pe"] -> válido', () => {
    const r = validar('Ana@PUCP.EDU.PE', { allowed_email_domains: ['edu.pe'] });
    expect(r.isValid).toBe(true);
  });

  it('un campo que NO es de tipo email ignora allowed_email_domains aunque venga seteado', () => {
    const r = validateField(
      createField({
        type: 'text',
        code: 'nombre',
        allowed_email_domains: ['edu.pe'],
      }),
      'cualquier texto, no es un correo',
      { nombre: 'cualquier texto, no es un correo' }
    );
    expect(r.isValid).toBe(true);
  });
});
