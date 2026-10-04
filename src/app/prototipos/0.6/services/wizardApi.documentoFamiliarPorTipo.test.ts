/**
 * BAL-4352 — el documento del familiar se valida segun el tipo elegido.
 *
 * El familiar tiene su propio selector de tipo (`supporter_document_type`) y su
 * propio numero (`supporter_document_number`). No hace falta codigo nuevo: la
 * regla «Documento segun su tipo» (`type: 'dni'`) ya acepta en `value` el
 * codigo del campo de tipo, y la web lee las reglas del tipo desde ESE campo.
 *
 * Estas pruebas fijan ese contrato con la configuracion que tendra el campo 28
 * cuando se active la regla en el panel:
 *
 *   validations: [
 *     { type: 'dni', value: 'supporter_document_type' },
 *     { type: 'not_equals_field', value: 'document_number' },   // ya existe
 *   ]
 *
 * y con la ficha de hoy (8 a 9 caracteres para todos). Tambien fijan que un
 * paso SIN el selector de tipo sigue igual que antes: manda la ficha.
 */

import {
  validateField,
  getDocumentTypeRules,
  WizardField,
  CascadingOption,
} from './wizardApi';

function campoFamiliar(overrides: Partial<WizardField> = {}): WizardField {
  return {
    id: 28,
    code: 'supporter_document_number',
    label: 'Número de documento de familiar',
    type: 'document_number',
    placeholder: null,
    help_text: null,
    required: true,
    readonly: false,
    hidden: false,
    grid_columns: 6,
    grid_columns_mobile: 12,
    prefix: null,
    suffix: null,
    // La ficha del campo 28 en el banco: 8 a 9 para todos los tipos.
    min_length: 8,
    max_length: 9,
    min_value: null,
    max_value: null,
    pattern: null,
    mask: null,
    input_mode: 'numeric',
    options_source: null,
    options_filter: null,
    options: [],
    validations: [
      { type: 'dni', value: 'supporter_document_type', message: 'El formato del documento no es válido' },
      {
        type: 'not_equals_field',
        value: 'document_number',
        message: 'El número de documento no puede ser el mismo que el del solicitante',
      },
    ],
    dependency_groups: [],
    accepted_file_types: null,
    max_file_size_mb: null,
    max_files: 1,
    prefill_config: {
      prefill_fields: {
        supporter_full_name: ['first_name', 'paternal_surname', 'maternal_surname'],
      },
      document_type_field: 'supporter_document_type',
    },
    ...overrides,
  };
}

/** Lo que responde `/public/options/document-types` (tabla de BAL-4339). */
const OPCIONES_DEL_BACKEND: CascadingOption[] = [
  {
    value: 'dni',
    label: 'DNI',
    validation: {
      min_length: 8,
      max_length: 8,
      pattern: '^\\d{8}$',
      input_mode: 'numeric',
      placeholder: '12345678',
      error_message: 'El DNI debe tener 8 dígitos',
    },
  },
  {
    value: 'ce',
    label: 'Carnet de Extranjería',
    validation: {
      min_length: 9,
      max_length: 12,
      pattern: '^[a-zA-Z0-9]{9,12}$',
      input_mode: 'text',
      placeholder: '001234567',
      error_message: 'El CE debe tener entre 9 y 12 caracteres',
    },
  },
  {
    value: 'pasaporte',
    label: 'Pasaporte',
    validation: {
      min_length: 6,
      max_length: 12,
      pattern: '^[a-zA-Z0-9]{6,12}$',
      input_mode: 'text',
      placeholder: 'AB123456',
      error_message: 'El pasaporte debe tener entre 6 y 12 caracteres',
    },
  },
];

/**
 * Valida el numero del familiar con el tipo elegido.
 *
 * `cache` = lo que el select de tipo dejo en el wizard. El campo 27 de hoy
 * tiene opciones fijas (dni, ce), asi que no deja nada y manda la tabla de
 * respaldo; si se le pone `options_source: document-types` deja la del backend.
 */
function validar(
  numero: string,
  tipo: string | undefined,
  cache?: Record<string, CascadingOption[]>,
  campo: WizardField = campoFamiliar()
) {
  const valores: Record<string, string> = {
    document_number: '70000001',
    supporter_document_number: numero,
  };
  if (tipo !== undefined) valores.supporter_document_type = tipo;
  return validateField(campo, numero, valores, cache);
}

const CACHE_CON_SELECT_DEL_SISTEMA = { supporter_document_type: OPCIONES_DEL_BACKEND };

describe.each([
  ['sin cache (campo 27 con opciones fijas)', undefined],
  ['con el cache del select de tipo del familiar', CACHE_CON_SELECT_DEL_SISTEMA],
])('BAL-4352 · familiar con tipo elegido · %s', (_nombre, cache) => {
  it('DNI de 8 dígitos pasa', () => {
    expect(validar('42315678', 'dni', cache).isValid).toBe(true);
  });

  it('DNI de 9 dígitos NO pasa (hoy la ficha 8 a 9 lo dejaba pasar)', () => {
    const r = validar('423156789', 'dni', cache);
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('El DNI debe tener 8 dígitos');
  });

  it('DNI de 7 dígitos NO pasa, con el mensaje del tipo', () => {
    const r = validar('4231567', 'dni', cache);
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('El DNI debe tener 8 dígitos');
  });

  it('CE alfanumérico de 12 pasa (la ficha de 9 lo bloqueaba)', () => {
    expect(validar('A12345678901', 'ce', cache).isValid).toBe(true);
  });

  it('CE de 8 NO pasa', () => {
    const r = validar('12345678', 'ce', cache);
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('El CE debe tener entre 9 y 12 caracteres');
  });

  it('pasaporte de 6 pasa (la ficha de 8 lo bloqueaba)', () => {
    expect(validar('AB1234', 'pasaporte', cache).isValid).toBe(true);
  });

  it('pasaporte de 13 NO pasa', () => {
    const r = validar('AB12345678901', 'pasaporte', cache);
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('El pasaporte debe tener entre 6 y 12 caracteres');
  });

  it('la regla «distinto del solicitante» sigue funcionando', () => {
    const r = validar('70000001', 'dni', cache);
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('El número de documento no puede ser el mismo que el del solicitante');
  });
});

describe('BAL-4352 · la regla mira el tipo del FAMILIAR, no el del cliente', () => {
  it('cliente con DNI y familiar con pasaporte: se valida como pasaporte', () => {
    const r = validateField(
      campoFamiliar(),
      'AB1234',
      { document_type: 'dni', document_number: '70000001', supporter_document_type: 'pasaporte', supporter_document_number: 'AB1234' },
      { document_type: OPCIONES_DEL_BACKEND }
    );
    expect(r.isValid).toBe(true);
  });

  it('cliente con pasaporte y familiar con DNI: 6 caracteres no pasan', () => {
    const r = validateField(
      campoFamiliar(),
      'AB1234',
      { document_type: 'pasaporte', document_number: 'ZZ999999', supporter_document_type: 'dni', supporter_document_number: 'AB1234' },
      { document_type: OPCIONES_DEL_BACKEND }
    );
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('El DNI debe tener 8 dígitos');
  });
});

describe('BAL-4352 · sin cambios donde no se configura', () => {
  it('paso SIN selector de tipo del familiar: manda la ficha (8 a 9), como hoy', () => {
    // 9 digitos: la ficha lo acepta y no hay tipo con que exigir 8.
    expect(validar('423156789', undefined).isValid).toBe(true);
    const r = validar('AB1234', undefined);
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('Mínimo 8 caracteres');
  });

  it('campo 28 como está hoy en prod (sin la regla por tipo): manda la ficha aunque haya tipo', () => {
    const comoHoy = campoFamiliar({
      validations: [
        {
          type: 'not_equals_field',
          value: 'document_number',
          message: 'El número de documento no puede ser el mismo que el del solicitante',
        },
      ],
    });
    expect(validar('423156789', 'dni', undefined, comoHoy).isValid).toBe(true);
    expect(validar('AB1234', 'pasaporte', undefined, comoHoy).isValid).toBe(false);
  });
});

describe('BAL-4352 · el input del familiar toma largo y teclado del tipo del familiar', () => {
  // DocumentNumberField llama a getDocumentTypeRules con
  // `prefill_config.document_type_field` (= supporter_document_type).
  it('max_length e input_mode salen del tipo del familiar', () => {
    const valores = { document_type: 'dni', supporter_document_type: 'pasaporte' };
    const reglas = getDocumentTypeRules('supporter_document_type', valores);
    expect(reglas?.max_length).toBe(12);
    expect(reglas?.input_mode).toBe('text');
  });
});
