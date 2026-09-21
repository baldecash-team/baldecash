/**
 * BAL-4025 — el formulario publico valida el largo del documento segun el tipo
 *
 * El sintoma que reporto el usuario: «al cambiar el tipo (DNI / CE / pasaporte)
 * no se exige la cantidad de caracteres que corresponde a cada uno».
 *
 * Cada assertion de aca mide uno de esos bordes. Dos reglas que NO se pueden
 * romper, porque rompen solicitudes de clientes reales:
 *
 *  1. El CE y el pasaporte son ALFANUMERICOS. Hay carnets de extranjeria reales
 *     con letras. Solo el DNI lleva `^\d+$`.
 *  2. La fuente de verdad son las reglas que manda el backend en
 *     `/public/options/document-types` (cacheadas por el select de tipo). La
 *     tabla de respaldo del front solo entra cuando ese cache todavia no cargo,
 *     y tiene que decir lo mismo.
 */

import {
  validateField,
  getDocumentTypeRules,
  checkDocumentAgainstRules,
  WizardField,
  CascadingOption,
} from './wizardApi';

// ============================================================================
// Factories
// ============================================================================

function createField(overrides: Partial<WizardField> = {}): WizardField {
  return {
    id: 1,
    code: 'document_number',
    label: 'Número de documento',
    type: 'document_number',
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
    validations: [{ type: 'dni', value: null, message: 'El formato del documento no es válido' }],
    dependency_groups: [],
    accepted_file_types: null,
    max_file_size_mb: null,
    max_files: 1,
    ...overrides,
  };
}

/**
 * Copia literal de lo que responde hoy
 * `GET /api/v1/public/options/document-types` en produccion.
 * Asi es como llegan las opciones al `dynamicOptionsCache` del wizard.
 */
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
      placeholder: 'A12345678',
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

const CACHE_DEL_WIZARD: Record<string, CascadingOption[]> = {
  document_type: OPCIONES_DEL_BACKEND,
};

/** Valida el numero con el tipo elegido, tal como lo hace el paso del wizard. */
function validar(numero: string, tipo: string, conCache = true) {
  return validateField(
    createField(),
    numero,
    { document_type: tipo, document_number: numero },
    conCache ? CACHE_DEL_WIZARD : undefined
  );
}

// ============================================================================
// DNI
// ============================================================================

describe('BAL-4025 · largo del documento segun el tipo · DNI', () => {
  it('rechaza un DNI de 7 dígitos', () => {
    const r = validar('1234567', 'dni');
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('El DNI debe tener 8 dígitos');
  });

  it('acepta un DNI de 8 dígitos', () => {
    expect(validar('12345678', 'dni').isValid).toBe(true);
  });

  it('rechaza un DNI de 9 dígitos', () => {
    const r = validar('123456789', 'dni');
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('El DNI debe tener 8 dígitos');
  });

  it('rechaza un DNI con letras (solo el DNI es numérico)', () => {
    const r = validar('1234567A', 'dni');
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('El DNI debe tener 8 dígitos');
  });
});

// ============================================================================
// CE — el riesgo: son alfanumericos
// ============================================================================

describe('BAL-4025 · largo del documento segun el tipo · CE', () => {
  it('rechaza un CE de 8 caracteres', () => {
    const r = validar('12345678', 'ce');
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('El CE debe tener entre 9 y 12 caracteres');
  });

  it('acepta un CE de 9 caracteres', () => {
    expect(validar('123456789', 'ce').isValid).toBe(true);
  });

  it('acepta un CE de 12 caracteres', () => {
    expect(validar('123456789012', 'ce').isValid).toBe(true);
  });

  it('rechaza un CE de 13 caracteres', () => {
    const r = validar('1234567890123', 'ce');
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('El CE debe tener entre 9 y 12 caracteres');
  });

  it('ACEPTA un CE alfanumérico — hay carnets de extranjería reales con letras', () => {
    expect(validar('A12345678', 'ce').isValid).toBe(true);
    expect(validar('AB1234567890', 'ce').isValid).toBe(true);
    expect(validar('CE001234X', 'ce').isValid).toBe(true);
  });
});

// ============================================================================
// Pasaporte
// ============================================================================

describe('BAL-4025 · largo del documento segun el tipo · pasaporte', () => {
  it('rechaza un pasaporte de 5 caracteres', () => {
    const r = validar('AB123', 'pasaporte');
    expect(r.isValid).toBe(false);
    expect(r.error).toBe('El pasaporte debe tener entre 6 y 12 caracteres');
  });

  it('acepta un pasaporte alfanumérico de 6 caracteres', () => {
    expect(validar('AB1234', 'pasaporte').isValid).toBe(true);
  });

  it('acepta un pasaporte alfanumérico de 12 caracteres', () => {
    expect(validar('AB1234567890', 'pasaporte').isValid).toBe(true);
  });

  it('rechaza un pasaporte de 13 caracteres', () => {
    expect(validar('AB12345678901', 'pasaporte').isValid).toBe(false);
  });

  it('reconoce también el código "passport" — es el que usan DocumentNumberField y useCheckPerson', () => {
    // Antes `case 'dni'` solo miraba `pasaporte`, asi que con `passport` el
    // numero pasaba SIN validacion de largo: 3 caracteres entraban igual.
    const r = validar('AB1', 'passport');
    expect(r.isValid).toBe(false);
    expect(validar('AB1234', 'passport').isValid).toBe(true);
  });
});

// ============================================================================
// Cambiar de tipo con un valor ya escrito
// ============================================================================

describe('BAL-4025 · cambiar de tipo con un valor ya escrito revalida', () => {
  it('8 dígitos válidos como DNI pasan a ser inválidos como CE', () => {
    expect(validar('12345678', 'dni').isValid).toBe(true);
    const comoCe = validar('12345678', 'ce');
    expect(comoCe.isValid).toBe(false);
    expect(comoCe.error).toBe('El CE debe tener entre 9 y 12 caracteres');
  });

  it('8 dígitos válidos como DNI siguen siendo válidos como pasaporte (6..20 alfanumérico)', () => {
    expect(validar('12345678', 'dni').isValid).toBe(true);
    expect(validar('12345678', 'pasaporte').isValid).toBe(true);
  });

  it('6 caracteres válidos como pasaporte pasan a ser inválidos como DNI', () => {
    expect(validar('AB1234', 'pasaporte').isValid).toBe(true);
    const comoDni = validar('AB1234', 'dni');
    expect(comoDni.isValid).toBe(false);
    expect(comoDni.error).toBe('El DNI debe tener 8 dígitos');
  });

  it('un CE alfanumérico de 9 deja de valer cuando el tipo pasa a DNI', () => {
    expect(validar('A12345678', 'ce').isValid).toBe(true);
    expect(validar('A12345678', 'dni').isValid).toBe(false);
  });

  it('el veredicto sale del tipo actual, no del anterior: el mismo número cambia de resultado 3 veces', () => {
    const numero = '123456789';
    expect(validar(numero, 'dni').isValid).toBe(false);      // 9 dígitos, el DNI pide 8
    expect(validar(numero, 'ce').isValid).toBe(true);        // 9 entra en 9..12
    expect(validar(numero, 'pasaporte').isValid).toBe(true); // 9 entra en 6..12
  });
});

// ============================================================================
// El respaldo del front dice lo mismo que el backend
// ============================================================================

describe('BAL-4025 · sin el cache del backend, la tabla de respaldo da el mismo veredicto', () => {
  const casos: Array<[string, string, boolean]> = [
    ['1234567', 'dni', false],
    ['12345678', 'dni', true],
    ['123456789', 'dni', false],
    ['1234567A', 'dni', false],
    ['12345678', 'ce', false],
    ['123456789', 'ce', true],
    ['123456789012', 'ce', true],
    ['1234567890123', 'ce', false],
    ['A12345678', 'ce', true],
    ['AB123', 'pasaporte', false],
    ['AB1234', 'pasaporte', true],
    ['AB1234567890', 'pasaporte', true],
  ];

  it.each(casos)('«%s» como %s → %s (sin cache)', (numero, tipo, esperado) => {
    expect(validar(numero, tipo, false).isValid).toBe(esperado);
  });
});

// ============================================================================
// getDocumentTypeRules — lo que consume el input (maxLength, inputMode)
// ============================================================================

describe('BAL-4025 · getDocumentTypeRules alimenta el maxLength del input', () => {
  it('da el max_length de cada tipo, no un 8 ni un 9 fijos', () => {
    const dni = getDocumentTypeRules('document_type', { document_type: 'dni' }, CACHE_DEL_WIZARD);
    const ce = getDocumentTypeRules('document_type', { document_type: 'ce' }, CACHE_DEL_WIZARD);
    const pas = getDocumentTypeRules('document_type', { document_type: 'pasaporte' }, CACHE_DEL_WIZARD);

    expect(dni?.max_length).toBe(8);
    expect(ce?.max_length).toBe(12);
    expect(pas?.max_length).toBe(12);
  });

  it('solo el DNI es numérico: el CE y el pasaporte piden teclado de texto', () => {
    expect(getDocumentTypeRules('document_type', { document_type: 'dni' }, CACHE_DEL_WIZARD)?.input_mode).toBe('numeric');
    expect(getDocumentTypeRules('document_type', { document_type: 'ce' }, CACHE_DEL_WIZARD)?.input_mode).toBe('text');
    expect(getDocumentTypeRules('document_type', { document_type: 'pasaporte' }, CACHE_DEL_WIZARD)?.input_mode).toBe('text');
  });

  it('prefiere las reglas del backend por sobre la tabla de respaldo', () => {
    const cacheRaro: Record<string, CascadingOption[]> = {
      document_type: [
        { value: 'ce', label: 'CE', validation: { min_length: 5, max_length: 5, error_message: 'CE de 5' } },
      ],
    };
    const r = getDocumentTypeRules('document_type', { document_type: 'ce' }, cacheRaro);
    expect(r?.max_length).toBe(5);
    expect(checkDocumentAgainstRules('123456789', r!)).toBe('CE de 5');
  });

  it('sin tipo elegido no inventa reglas — no se bloquea a nadie por un tipo desconocido', () => {
    expect(getDocumentTypeRules('document_type', {}, CACHE_DEL_WIZARD)).toBeNull();
    expect(getDocumentTypeRules('document_type', { document_type: 'rucito' }, CACHE_DEL_WIZARD)).toBeNull();
    // Y en validateField eso se traduce en «no rechaza»
    expect(validar('123', 'rucito').isValid).toBe(true);
  });
});
