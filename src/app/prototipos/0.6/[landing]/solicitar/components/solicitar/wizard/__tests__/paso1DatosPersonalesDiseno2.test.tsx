/// <reference types="jest" />
/**
 * BAL-4963 (F4) — Paso 1 · Datos personales en Diseño 2.
 *
 * Monta `DynamicWizardStep` con el `DocumentNumberField` real. Lo único
 * simulado es el lookup (`useCheckPerson`): el test llama a mano los mismos
 * callbacks que llamaría con la respuesta de `check-person`.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  validateField,
  validateStep,
  type WizardField,
  type WizardStep,
} from '../../../../../../services/wizardApi';
import type { PrefillData } from '../../../../../../services/applicationApi';
import {
  adaptarPasoDiseno2,
  capitalizarPrimerNombre,
  mensajeCelularV2,
  mensajeDocumentoV2,
  nombreDelSaludoDelPaso,
  ayudaDelNumero,
  MENSAJES_CELULAR_V2,
  MENSAJES_DOCUMENTO_V2,
  MENSAJES_OTRO_CELULAR_V2,
} from '@/app/prototipos/0.6/components/diseno-2/paso1/datosPersonalesV2';

// --- WizardContext de mentira, con re-render real al cambiar un campo -------
type Valor = string | string[];
type Estado = Record<string, { value: Valor; error?: string | null }>;
const store: { data: Estado; oyentes: Set<() => void> } = { data: {}, oyentes: new Set() };
function emitir() {
  store.oyentes.forEach((o) => o());
}
function poner(code: string, value: Valor, error?: string | null) {
  store.data = { ...store.data, [code]: { ...store.data[code], value, ...(error !== undefined ? { error } : {}) } };
  emitir();
}
// Catálogo de tipos de documento (lo que deja `CascadingSelectField` en el cache).
let opcionesDinamicas: Record<string, Array<{ value: string; label: string }>> = {};
const updateField = jest.fn((code: string, value: Valor) => poner(code, value));
const setFieldError = jest.fn((code: string, error: string | null) => {
  store.data = { ...store.data, [code]: { ...store.data[code], value: store.data[code]?.value ?? '', error } };
  emitir();
});

jest.mock('../../../../context/WizardContext', () => {
  const R = jest.requireActual('react') as typeof React;
  return {
    useWizard: () => {
      const formData = R.useSyncExternalStore(
        (cb: () => void) => {
          store.oyentes.add(cb);
          return () => store.oyentes.delete(cb);
        },
        () => store.data,
      );
      return {
        formData,
        updateField,
        setFieldError,
        getFieldValue: (code: string) => formData[code]?.value ?? '',
        getFieldError: (code: string) => formData[code]?.error ?? undefined,
        getFieldLabel: () => undefined,
        isFieldTouched: () => false,
        setDynamicOptions: jest.fn(),
        getDynamicOptions: () => [],
        getAllDynamicOptions: () => opcionesDinamicas,
      };
    },
    FILE_PENDING_REUPLOAD: '__FILE_PENDING_REUPLOAD__',
  };
});

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ deferredPayment: null, agreementData: null, landing: 'pago-diferido', landingId: 170 }),
}));

jest.mock('../../../../hooks/useFieldTracking', () => ({
  useFieldTracking: () => ({ onFieldFocus: jest.fn(), onFieldBlur: jest.fn() }),
}));

jest.mock('../../../../../calculadora/utils/useDatosMatricula', () => ({
  useDatosMatricula: () => null,
}));

// El lookup: se guardan los callbacks para dispararlos desde el test.
type OpcionesLookup = { onPrefillReady?: (d: PrefillData) => void; onNoPrefillData?: () => void };
let lookup: OpcionesLookup = {};
const resetLookup = jest.fn();
let respuestaLookup: unknown = null;
jest.mock('../../../../hooks/useCheckPerson', () => ({
  useCheckPerson: (opciones: OpcionesLookup) => {
    lookup = opciones;
    return { check: jest.fn(), isChecking: false, response: respuestaLookup, reset: resetLookup };
  },
}));
jest.mock('../../../../hooks/useCouponDocumentCheck', () => ({ useCouponDocumentCheck: () => undefined }));
jest.mock('../../../../context/SessionContext', () => ({ useSessionOptional: () => null }));
jest.mock('../../coupon/CouponDocumentStatus', () => ({ CouponDocumentStatus: () => null }));

import { DynamicWizardStep } from '../DynamicWizardStep';
import { DniNoInvitadoModal } from '../../fields/DniNoInvitadoModal';

// --- Paso de prueba: la forma del Paso 1 local (form 1) ---------------------
function campo(overrides: Partial<WizardField>): WizardField {
  return {
    id: 1, code: 'x', label: 'X', type: 'text', placeholder: null, help_text: null,
    required: false, readonly: false, hidden: false, grid_columns: 12, grid_columns_mobile: 12,
    prefix: null, suffix: null, min_length: null, max_length: null, min_value: null, max_value: null,
    step: null, pattern: null, mask: null, input_mode: null, options_source: null, options_filter: null,
    options: [], validations: [], dependency_groups: [], max_files: null, default_value: null,
    ...overrides,
  } as WizardField;
}

const TIPO_DOC = campo({
  id: 1, code: 'document_type', label: 'Tipo de Documento', type: 'select', required: true,
  options: [
    { value: 'dni', label: 'DNI' },
    { value: 'ce', label: 'Carné de extranjería' },
    { value: 'pasaporte', label: 'Pasaporte' },
  ],
} as Partial<WizardField>);
const DOCUMENTO = campo({
  id: 2, code: 'document_number', label: 'Número de Documento', type: 'document_number', required: true,
  hint: 'Lo usamos para validar tu identidad.',
  validations: [{ type: 'dni', value: null, message: 'El formato del documento no es válido' }],
  prefill_config: {
    prefill_fields: {
      first_name: 'first_name', paternal_surname: 'paternal_surname', maternal_surname: 'maternal_surname',
      birth_date: 'birth_date', gender: 'gender',
    },
    document_type_field: 'document_type',
  },
} as Partial<WizardField>);
const NOMBRES = campo({ id: 3, code: 'first_name', label: 'Nombres', required: true, hidden: true });
const PATERNO = campo({ id: 4, code: 'paternal_surname', label: 'Apellido Paterno', required: true, hidden: true });
const MATERNO = campo({ id: 5, code: 'maternal_surname', label: 'Apellido Materno', required: true, hidden: true });
const NACIMIENTO = campo({ id: 6, code: 'birth_date', label: 'Fecha de Nacimiento', type: 'date', required: true, hidden: true });
const SEXO = campo({
  id: 7, code: 'gender', label: 'Sexo', type: 'select', required: true, hidden: true,
  options: [{ value: 'male', label: 'Masculino' }, { value: 'female', label: 'Femenino' }],
} as Partial<WizardField>);
const CELULAR = campo({
  id: 8, code: 'phone', label: 'Celular', type: 'phone', required: true, prefix: '+51', max_length: 9,
  required_message: 'Ingresa tu celular para avisarte cómo va tu solicitud.',
  validations: [{ type: 'phone', value: null, message: 'El celular debe tener 9 dígitos' }],
} as Partial<WizardField>);
const CELULAR_2 = campo({
  id: 9, code: 'phone_secondary', label: 'Celular para llamadas', type: 'phone', prefix: '+51', max_length: 9,
  collapsed_optional: true,
  validations: [{ type: 'not_equals_field', value: 'phone', message: '' }],
} as Partial<WizardField>);

function paso(fields: WizardField[]): WizardStep {
  return {
    id: 1, code: 'personal_data', url_slug: 'datos-personales', name: 'Datos personales',
    title: 'Datos Personales', description: '', icon: '', order: 0, required: true, skippable: false,
    estimated_time_minutes: 1, is_summary_step: false, motivational: null, fields,
  };
}
const PASO = paso([TIPO_DOC, DOCUMENTO, NOMBRES, PATERNO, MATERNO, NACIMIENTO, SEXO, CELULAR, CELULAR_2]);

const RENIEC: PrefillData = {
  first_name: 'MARÍA JOSÉ',
  paternal_surname: 'PÉREZ',
  maternal_surname: 'GÓMEZ',
  birth_date: '2002-03-12',
  gender: 'female',
  source: 'person',
} as PrefillData;

function valores(): Record<string, Valor> {
  return Object.fromEntries(Object.entries(store.data).map(([k, v]) => [k, v.value]));
}

function montar(v2: boolean, step: WizardStep = PASO, showErrors = false) {
  return render(
    <DynamicWizardStep step={step} showErrors={showErrors} camposTocados={v2 ? new Set<string>() : undefined} />,
  );
}

beforeEach(() => {
  store.data = { document_type: { value: 'dni' } };
  store.oyentes.clear();
  lookup = {};
  respuestaLookup = null;
  opcionesDinamicas = {};
  jest.clearAllMocks();
  localStorage.clear();
});

describe('Saludo por prefill (Diseño 2)', () => {
  it('found con first_name: caja "¡Hola, María!" con "Corrige tu DNI"; la pista se va', () => {
    poner('document_number', '12345678');
    montar(true);
    expect(screen.getByText('Lo usamos para validar tu identidad.')).toBeInTheDocument();

    act(() => lookup.onPrefillReady!(RENIEC));

    const saludo = document.querySelector('[data-saludo-v2]')!;
    expect(saludo).toHaveTextContent('¡Hola, María!');
    expect(screen.getByRole('button', { name: 'Corrige tu DNI' })).toBeInTheDocument();
    expect(screen.queryByText('Lo usamos para validar tu identidad.')).not.toBeInTheDocument();
  });

  it('el título del paso: nombreDelSaludoDelPaso devuelve el nombre capitalizado solo con found', () => {
    expect(nombreDelSaludoDelPaso(PASO, { _prefill_status_document_number: 'found', first_name: 'MARÍA JOSÉ' })).toBe('María');
    expect(nombreDelSaludoDelPaso(PASO, { _prefill_status_document_number: 'not_found', first_name: 'Ana' })).toBeNull();
    expect(nombreDelSaludoDelPaso(PASO, { _prefill_status_document_number: 'found', first_name: '' })).toBeNull();
    expect(capitalizarPrimerNombre('  ÑAKI  pedro')).toBe('Ñaki');
  });

  it('al recargar (el estado del prefill no se guarda en el borrador) el nombre sale del valor del campo', () => {
    // Sin `_prefill_status_*`: el borrador sí trae `first_name`.
    expect(nombreDelSaludoDelPaso(PASO, { document_number: '12345678', first_name: 'BRENDA LUZ' })).toBe('Brenda');
    // Con estado del prefill, manda el estado: not_found o corrigiendo ('') no saludan.
    expect(nombreDelSaludoDelPaso(PASO, { _prefill_status_document_number: '', first_name: 'Ana' })).toBeNull();
    // Sin valor no hay nombre, y la whitelist sigue mandando.
    expect(nombreDelSaludoDelPaso(PASO, { first_name: '' })).toBeNull();
    expect(nombreDelSaludoDelPaso(PASO, { _whitelist_blocked: 'true', first_name: 'Ana' })).toBeNull();
  });

  it('"Corrige tu DNI" borra número, prefill y los campos que llenó, y enfoca el campo', () => {
    poner('document_number', '12345678');
    montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));

    fireEvent.click(screen.getByRole('button', { name: 'Corrige tu DNI' }));

    const v = valores();
    expect(v.document_number).toBe('');
    expect(v._prefill_status_document_number).toBe('');
    for (const code of ['first_name', 'paternal_surname', 'maternal_surname', 'birth_date', 'gender']) {
      expect(v[code]).toBe('');
      expect(v[`_prefill_empty_${code}`]).toBe('');
    }
    expect(resetLookup).toHaveBeenCalled();
    expect(document.activeElement).toBe(document.getElementById('document_number-input'));
    expect(document.querySelector('[data-saludo-v2]')).toBeNull();
    expect(document.querySelector('[data-resumen-prellenado-v2]')).toBeNull();
  });

  it('con carné de extranjería el enlace dice "Corrige tu documento"', () => {
    poner('document_type', 'ce');
    poner('document_number', '001234567');
    montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));
    expect(screen.getByRole('button', { name: 'Corrige tu documento' })).toBeInTheDocument();
  });
});

describe('Campos prellenados (Diseño 2)', () => {
  it('found: resumen en una línea, sin inputs de nombres', () => {
    poner('document_number', '12345678');
    montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));

    const resumen = document.querySelector('[data-resumen-prellenado-v2]')!;
    expect(resumen).toHaveTextContent('María José Pérez Gómez · 12/03/2002 · Femenino');
    expect(screen.queryByText('Nombres')).not.toBeInTheDocument();
    // Los valores siguen en el formulario, tal cual vinieron.
    expect(valores().first_name).toBe('MARÍA JOSÉ');
  });

  it('"Corregir" los abre como inputs, enfoca el primero y la validación los cuenta', () => {
    poner('document_number', '12345678');
    montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));

    fireEvent.click(screen.getByRole('button', { name: 'Corregir' }));

    expect(document.querySelector('[data-resumen-prellenado-v2]')).toBeNull();
    expect(screen.getByText('Nombres')).toBeInTheDocument();
    expect(screen.getByText('Apellido Paterno')).toBeInTheDocument();
    expect(document.activeElement).toBe(document.getElementById('first_name-input'));

    // Abierto y borrado, el nombre vuelve a ser obligatorio al continuar.
    poner('first_name', '');
    const errores: Record<string, string | null> = {};
    const primero = validateStep(PASO, { ...valores(), phone: '987654321' }, (c, e) => { errores[c] = e; });
    expect(primero).toBe('first_name');
  });

  it('un dato que el prefill dejó vacío sale como input (no en el resumen)', () => {
    poner('document_number', '12345678');
    montar(true);
    act(() => lookup.onPrefillReady!({ ...RENIEC, birth_date: null } as unknown as PrefillData));

    expect(document.querySelector('[data-resumen-prellenado-v2]')).toHaveTextContent('María José Pérez Gómez · Femenino');
    expect(screen.getByText('Fecha de Nacimiento')).toBeInTheDocument();
  });

  it('not_found: inputs normales, sin resumen ni saludo', () => {
    poner('document_number', '12345678');
    montar(true);
    act(() => lookup.onNoPrefillData!());

    expect(document.querySelector('[data-resumen-prellenado-v2]')).toBeNull();
    expect(document.querySelector('[data-saludo-v2]')).toBeNull();
    expect(screen.getByText('Nombres')).toBeInTheDocument();
    expect(screen.getByText('Sexo')).toBeInTheDocument();
  });
});

describe('Mensajes por tipo de documento (Diseño 2)', () => {
  it('tabla de Brenda por tipo, vacío y required_message', () => {
    const base = { error: 'x' };
    expect(mensajeDocumentoV2({ ...base, valor: '123', tipo: 'dni' })).toBe('Tu DNI tiene 8 números.');
    expect(mensajeDocumentoV2({ ...base, valor: 'AB1', tipo: 'ce' })).toBe('Revisa tu carné: tiene entre 9 y 12 caracteres.');
    expect(mensajeDocumentoV2({ ...base, valor: 'AB1', tipo: 'pasaporte' })).toBe('Revisa tu pasaporte: tiene entre 6 y 12 caracteres.');
    expect(mensajeDocumentoV2({ ...base, valor: 'AB1', tipo: 'passport' })).toBe(MENSAJES_DOCUMENTO_V2.pasaporte);
    expect(mensajeDocumentoV2({ ...base, valor: '', tipo: 'dni' })).toBe('Ingresa tu número de documento.');
    expect(mensajeDocumentoV2({ ...base, valor: '', tipo: 'dni', requiredMessage: 'De la BD' })).toBe('De la BD');
    expect(mensajeDocumentoV2({ error: null, valor: '123', tipo: 'dni' })).toBeUndefined();
    // Tipo fuera de la tabla: el mensaje del validador.
    expect(mensajeDocumentoV2({ error: 'Del validador', valor: '1', tipo: 'ruc' })).toBe('Del validador');
  });

  it('el campo pinta el texto de Brenda con el error del validador de siempre', () => {
    const tipos: Array<[string, string, string]> = [
      ['dni', '123', 'Tu DNI tiene 8 números.'],
      ['ce', '1234', 'Revisa tu carné: tiene entre 9 y 12 caracteres.'],
      ['pasaporte', '12', 'Revisa tu pasaporte: tiene entre 6 y 12 caracteres.'],
    ];
    for (const [tipo, numero, texto] of tipos) {
      store.data = { document_type: { value: tipo } };
      // Cuándo hay error lo sigue diciendo validateField.
      const { error } = validateField(DOCUMENTO, numero, { document_type: tipo });
      expect(error).toBeTruthy();
      poner('document_number', numero, error);
      const { unmount } = montar(true, PASO, true);
      expect(screen.getByRole('alert')).toHaveTextContent(texto);
      unmount();
    }
  });

  it('vacío: "Ingresa tu número de documento."', () => {
    const { error } = validateField(DOCUMENTO, '', { document_type: 'dni' });
    poner('document_number', '', error);
    montar(true, PASO, true);
    expect(screen.getByRole('alert')).toHaveTextContent('Ingresa tu número de documento.');
  });
});

describe('Celular (Diseño 2)', () => {
  const PASO_V2 = adaptarPasoDiseno2(PASO);
  const CEL_V2 = PASO_V2.fields.find((f) => f.code === 'phone')!;
  const CEL2_V2 = PASO_V2.fields.find((f) => f.code === 'phone_secondary')!;

  it('vacío, corto y no empieza con 9', () => {
    expect(mensajeCelularV2({ error: 'x', valor: '', field: CEL_V2 })).toBe('Ingresa tu celular para avisarte cómo va tu solicitud.');
    expect(mensajeCelularV2({ error: 'x', valor: '', field: { ...CEL_V2, required_message: undefined } })).toBe(MENSAJES_CELULAR_V2.vacio);
    expect(mensajeCelularV2({ error: 'x', valor: '98765', field: CEL_V2 })).toBe('Tu celular tiene 9 números.');
    expect(mensajeCelularV2({ error: 'x', valor: '812345678', field: CEL_V2 })).toBe('Los celulares en Perú empiezan con 9.');
    expect(mensajeCelularV2({ error: null, valor: '987654321', field: CEL_V2 })).toBeUndefined();
  });

  it('la regla "empieza con 9" existe solo en el paso de Diseño 2', () => {
    expect(validateField(CELULAR, '812345678', {}).isValid).toBe(true); // Diseño 1: sin cambios
    expect(validateField(CEL_V2, '812345678', {}).error).toBe('Los celulares en Perú empiezan con 9.');
    expect(validateField(CEL_V2, '987654321', {}).isValid).toBe(true);
    expect(validateField(CEL_V2, '98765', {}).error).toBe('El celular debe tener 9 dígitos'); // el texto lo cambia la vista
    // Un campo que ya lo exige no recibe la regla dos veces.
    const conPatron = { ...CELULAR, validations: [...CELULAR.validations, { type: 'pattern', value: '^9\\d{8}$', message: 'm' }] };
    expect(adaptarPasoDiseno2(paso([conPatron])).fields[0]).toBe(conPatron);
  });

  it('número repetido: el mensaje de la regla, o el de Brenda si la regla no trae', () => {
    expect(validateField(CEL2_V2, '987654321', { phone: '987654321' }).error).toBe(MENSAJES_CELULAR_V2.repetido);
    const conMensaje = { ...CELULAR_2, validations: [{ type: 'not_equals_field', value: 'phone', message: 'De la BD' }] };
    expect(validateField(adaptarPasoDiseno2(paso([conMensaje])).fields[0], '987654321', { phone: '987654321' }).error).toBe('De la BD');
  });

  it('el campo pinta los textos de Brenda', () => {
    poner('phone', '812345678', validateField(CEL_V2, '812345678', {}).error);
    montar(true, PASO_V2, true);
    expect(screen.getByRole('alert')).toHaveTextContent('Los celulares en Perú empiezan con 9.');
  });

  it('"+ Agregar celular para llamadas" sale con la etiqueta del campo', () => {
    montar(true, PASO_V2);
    expect(screen.getByRole('button', { name: /agregar celular para llamadas/i })).toBeInTheDocument();
  });

  it('adaptarPasoDiseno2 devuelve el mismo paso si no hay nada que cambiar', () => {
    const sinCelular = paso([TIPO_DOC, DOCUMENTO]);
    expect(adaptarPasoDiseno2(sinCelular)).toBe(sinCelular);
  });
});

describe('Diseño 1 no cambia', () => {
  it('found: sin saludo, sin resumen; los prellenados siguen escondidos y la pista no se pinta', () => {
    poner('document_number', '12345678');
    montar(false);
    act(() => lookup.onPrefillReady!(RENIEC));

    expect(document.querySelector('[data-saludo-v2]')).toBeNull();
    expect(document.querySelector('[data-resumen-prellenado-v2]')).toBeNull();
    expect(screen.queryByText('Nombres')).not.toBeInTheDocument();
    expect(screen.queryByText('Lo usamos para validar tu identidad.')).not.toBeInTheDocument();
  });

  it('los mensajes son los del validador, sin la tabla de Brenda', () => {
    const errDoc = validateField(DOCUMENTO, '123', { document_type: 'dni' }).error;
    poner('document_number', '123', errDoc);
    poner('phone', '98765', validateField(CELULAR, '98765', {}).error);
    montar(false, PASO, true);
    expect(screen.getByText('El DNI debe tener 8 dígitos')).toBeInTheDocument();
    expect(screen.getByText('El celular debe tener 9 dígitos')).toBeInTheDocument();
    expect(screen.queryByText('Tu DNI tiene 8 números.')).not.toBeInTheDocument();
    expect(screen.queryByText('Tu celular tiene 9 números.')).not.toBeInTheDocument();
  });

  it('el DOM del documento es el mismo con y sin prefill found (nada nuevo bajo el campo)', () => {
    poner('document_number', '12345678');
    const { container, unmount } = montar(false);
    const antes = container.querySelector('#document_number')!.parentElement!.innerHTML;
    act(() => lookup.onPrefillReady!(RENIEC));
    const despues = container.querySelector('#document_number')!.parentElement!.innerHTML;
    expect(despues).toBe(antes);
    unmount();
  });

  it('DniNoInvitadoModal: Diseño 1 conserva sus clases; Diseño 2 usa las del kit', () => {
    const { unmount } = render(<DniNoInvitadoModal dni="12345678" onCerrar={() => undefined} />);
    expect(screen.getByRole('heading')).toHaveClass('mb-3 text-lg font-bold text-gray-900');
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveClass(
      'flex-1 cursor-pointer rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50',
    );
    unmount();
    render(<DniNoInvitadoModal dni="12345678" onCerrar={() => undefined} v2 />);
    expect(screen.getByRole('heading').className).toContain("font-['Baloo_2',_sans-serif]");
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveClass('min-h-[48px]', 'rounded-[10px]', 'border-[var(--color-primary)]');
    expect(screen.getByRole('link', { name: 'Ver el catálogo principal' })).toHaveClass('min-h-[48px]', 'bg-[var(--color-primary)]');
  });
});

// ---------------------------------------------------------------------------
// Correcciones de la revisión de F4
// ---------------------------------------------------------------------------

const SIN_PREFILL_STATUS = (data: Estado): Estado =>
  Object.fromEntries(
    Object.entries(data).filter(([k]) => !k.startsWith('_prefill_status_') && !k.startsWith('_prefill_empty_')),
  );

describe('Revisión 1 · "Corrige tu DNI" con documento bloqueado', () => {
  it('bloqueado por la puerta VIP: saludo sin enlace', () => {
    localStorage.setItem('baldecash-dni-pago-diferido', '12345678');
    localStorage.setItem('baldecash-vip-token-pago-diferido', 'tok');
    montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));
    expect(document.querySelector('[data-saludo-v2]')).toHaveTextContent('¡Hola, María!');
    expect(screen.queryByRole('button', { name: /Corrige tu/ })).not.toBeInTheDocument();
    expect(document.getElementById('document_number-input')).toBeDisabled();
  });

  it('bloqueado por el lead de un socio: saludo sin enlace', () => {
    poner('document_number', '12345678');
    poner('_lead_locked_document_number', 'true');
    montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));
    expect(document.querySelector('[data-saludo-v2]')).toHaveTextContent('¡Hola, María!');
    expect(screen.queryByRole('button', { name: /Corrige tu/ })).not.toBeInTheDocument();
  });

  it('limpiar no vacía los campos bloqueados por el lead (y el prefill tampoco los pisa)', () => {
    poner('document_number', '12345678');
    poner('_lead_locked_first_name', 'true');
    poner('first_name', 'NombreDelLead'); // lo dejó el lead del socio, antes del lookup
    montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));
    // BAL-4963 (ronda 2): el lookup de ESTE documento no pisa el campo
    // bloqueado — el lead es la fuente de verdad, no el lookup.
    expect(valores().first_name).toBe('NombreDelLead');

    fireEvent.click(screen.getByRole('button', { name: 'Corrige tu DNI' }));
    const v = valores();
    expect(v.document_number).toBe('');
    expect(v.first_name).toBe('NombreDelLead'); // bloqueado: no se toca
    expect(v.paternal_surname).toBe(''); // el resto sí se limpia
  });

  it('role="status" solo envuelve el texto del saludo, no el botón', () => {
    poner('document_number', '12345678');
    montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));
    const estado = screen.getByRole('status');
    expect(estado).toHaveTextContent('¡Hola, María!');
    expect(estado.querySelector('button')).toBeNull();
  });

  it('con la whitelist bloqueando no hay saludo ni título "¡Hola, …!"', () => {
    respuestaLookup = { whitelist: { allowed: false, message: 'No invitado' } };
    poner('document_number', '55556666');
    montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));
    expect(document.querySelector('[data-saludo-v2]')).toBeNull();
    expect(nombreDelSaludoDelPaso(PASO, valores())).toBeNull();
  });
});

describe('Revisión 2 y 3 · celular del titular vs otros celulares', () => {
  const FAMILIAR = campo({
    id: 20, code: 'supporter_phone', label: 'Celular del familiar', type: 'phone', required: true, max_length: 9,
    validations: [{ type: 'phone', value: null, message: 'El celular debe tener 9 dígitos' }],
  } as Partial<WizardField>);

  it('el celular de un familiar usa textos genéricos (o su required_message)', () => {
    expect(mensajeCelularV2({ error: 'x', valor: '', field: FAMILIAR })).toBe('Ingresa el celular.');
    expect(mensajeCelularV2({ error: 'x', valor: '98765', field: FAMILIAR })).toBe('El celular tiene 9 números.');
    expect(mensajeCelularV2({ error: 'x', valor: '', field: { ...FAMILIAR, required_message: 'De la BD' } })).toBe('De la BD');
    // No se le dice "Los celulares en Perú empiezan con 9.": esa regla es del titular.
    expect(mensajeCelularV2({ error: 'Del validador', valor: '812345678', field: FAMILIAR })).toBe('Del validador');
    expect(MENSAJES_OTRO_CELULAR_V2.vacio).toBe('Ingresa el celular.');
  });

  it('pintado: el familiar no ve "Ingresa tu celular para avisarte…"', () => {
    const p = adaptarPasoDiseno2(paso([CELULAR, FAMILIAR]));
    poner('supporter_phone', '', 'requerido');
    poner('phone', '', 'requerido');
    montar(true, p, true);
    const alertas = screen.getAllByRole('alert').map((a) => a.textContent);
    expect(alertas).toContain('Ingresa el celular.');
    expect(alertas).toContain('Ingresa tu celular para avisarte cómo va tu solicitud.');
  });

  it('la regla del 9 solo va al celular del titular', () => {
    const p = adaptarPasoDiseno2(paso([CELULAR, FAMILIAR]));
    expect(validateField(p.fields[0], '812345678', {}).error).toBe('Los celulares en Perú empiezan con 9.');
    expect(p.fields[1]).toBe(FAMILIAR);
    expect(validateField(p.fields[1], '812345678', {}).isValid).toBe(true);
  });

  it('con el celular bloqueado por el lead no se exige la regla del 9', () => {
    const p = adaptarPasoDiseno2(paso([CELULAR]), { bloqueado: (c) => c === 'phone' });
    expect(p.fields[0]).toBe(CELULAR);
    expect(validateField(p.fields[0], '812345678', {}).isValid).toBe(true);
    expect(mensajeCelularV2({ error: 'Otro', valor: '812345678', field: CELULAR, bloqueado: true })).toBe('Otro');
  });

  it('el respaldo "Es tu mismo número…" solo va a not_equals_field de celulares', () => {
    const correo = campo({
      id: 21, code: 'email_2', type: 'email',
      validations: [{ type: 'not_equals_field', value: 'email', message: '' }],
    } as Partial<WizardField>);
    const p = adaptarPasoDiseno2(paso([correo]));
    expect(p.fields[0]).toBe(correo);
  });
});

describe('Revisión 4 · área de toque de 44px', () => {
  it('"Corrige tu DNI" y "Corregir" tienen min-h de 44px', () => {
    poner('document_number', '12345678');
    montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));
    expect(screen.getByRole('button', { name: 'Corrige tu DNI' })).toHaveClass('min-h-[44px]');
    expect(screen.getByRole('button', { name: 'Corregir' })).toHaveClass('min-h-[44px]');
  });
});

describe('Revisión 5 · lo corregido no se pierde al volver al Paso 1', () => {
  it('corregir el nombre, volver al Paso 1: el lookup no lo pisa', () => {
    poner('document_number', '12345678');
    const primera = montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));
    fireEvent.click(screen.getByRole('button', { name: 'Corregir' }));
    fireEvent.change(document.getElementById('first_name-input')!, { target: { value: 'Mariana' } });
    expect(valores().first_name).toBe('Mariana');
    primera.unmount();

    // Volver (o recargar): el borrador no guarda status ni empty.
    store.data = SIN_PREFILL_STATUS(store.data);
    montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));

    const v = valores();
    expect(v.first_name).toBe('Mariana');
    expect(v.paternal_surname).toBe('PÉREZ');
    // Sigue abierto como input, con lo corregido.
    expect((document.getElementById('first_name-input') as HTMLInputElement).value).toBe('Mariana');
    expect(document.querySelector('[data-saludo-v2]')).toHaveTextContent('¡Hola, Mariana!');
  });

  it('con otro documento (otra persona) el prefill escribe como siempre', () => {
    poner('document_number', '12345678');
    const primera = montar(true);
    act(() => lookup.onPrefillReady!(RENIEC));
    fireEvent.click(screen.getByRole('button', { name: 'Corregir' }));
    fireEvent.change(document.getElementById('first_name-input')!, { target: { value: 'Mariana' } });
    primera.unmount();

    store.data = SIN_PREFILL_STATUS(store.data);
    poner('document_number', '87654321');
    montar(true);
    act(() => lookup.onPrefillReady!({ ...RENIEC, first_name: 'ROSA' } as PrefillData));
    expect(valores().first_name).toBe('ROSA');
  });

  it('Diseño 1 no escribe marcas nuevas', () => {
    poner('document_number', '12345678');
    montar(false);
    act(() => lookup.onPrefillReady!(RENIEC));
    expect(Object.keys(store.data).filter((k) => k.startsWith('_prefill_valor_') || k.startsWith('_prefill_doc_'))).toEqual([]);
  });
});

describe('Revisión 6 · etiqueta, ayuda y borrado por tipo de documento', () => {
  const SIN_HINT = { ...DOCUMENTO, hint: undefined } as WizardField;
  const PASO_SIN_HINT = paso([TIPO_DOC, SIN_HINT, NOMBRES, PATERNO, MATERNO, NACIMIENTO, SEXO]);
  const catalogo = () => {
    opcionesDinamicas = {
      document_type: [
        { value: 'dni', label: 'DNI' },
        { value: 'ce', label: 'Carné de extranjería' },
        { value: 'pasaporte', label: 'Pasaporte' },
      ],
    };
  };

  it('la etiqueta sale de la opción elegida y la ayuda de las reglas del tipo', () => {
    catalogo();
    montar(true, PASO_SIN_HINT);
    expect(screen.getByText('Número de DNI')).toBeInTheDocument();
    expect(screen.getByText('8 números')).toBeInTheDocument();

    act(() => poner('document_type', 'ce'));
    expect(screen.getByText('Número de Carné de extranjería')).toBeInTheDocument();
    expect(screen.getByText('Entre 9 y 12 caracteres')).toBeInTheDocument();

    act(() => poner('document_type', 'pasaporte'));
    expect(screen.getByText('Número de Pasaporte')).toBeInTheDocument();
    expect(screen.getByText('Entre 6 y 12 caracteres')).toBeInTheDocument();
  });

  it('el hint de la BD gana sobre la ayuda por tipo', () => {
    catalogo();
    montar(true);
    expect(screen.getByText('Lo usamos para validar tu identidad.')).toBeInTheDocument();
    expect(screen.queryByText('8 números')).not.toBeInTheDocument();
  });

  it('ayudaDelNumero con las reglas de respaldo', () => {
    expect(ayudaDelNumero({ min_length: 8, max_length: 8, input_mode: 'numeric' })).toBe('8 números');
    expect(ayudaDelNumero({ min_length: 9, max_length: 12, input_mode: 'text' })).toBe('Entre 9 y 12 caracteres');
    expect(ayudaDelNumero(null)).toBeNull();
  });

  it('cambiar de tipo borra el número y lo que llenó el prefill', () => {
    poner('document_number', '12345678');
    montar(true, PASO_SIN_HINT);
    act(() => lookup.onPrefillReady!(RENIEC));
    resetLookup.mockClear();

    act(() => poner('document_type', 'ce'));

    const v = valores();
    expect(v.document_number).toBe('');
    expect(v._prefill_status_document_number).toBe('');
    expect(v.first_name).toBe('');
    expect(resetLookup).toHaveBeenCalled();
    expect(document.querySelector('[data-saludo-v2]')).toBeNull();
  });

  it('QA F10 (menor): al cambiar de tipo, el número vaciado vuelve a "no tocado" (sin error adelantado)', () => {
    const avisos: string[] = [];
    const oir = (e: Event) => avisos.push((e as CustomEvent<string>).detail);
    window.addEventListener('diseno2:campo-reiniciado', oir);
    try {
      poner('document_number', '7000');
      montar(true, PASO_SIN_HINT);
      act(() => poner('document_type', 'ce'));
      expect(valores().document_number).toBe('');
      expect(avisos).toEqual(['document_number']);
    } finally {
      window.removeEventListener('diseno2:campo-reiniciado', oir);
    }
  });

  it('un documento bloqueado no se borra al cambiar de tipo', () => {
    poner('document_number', '12345678');
    poner('_lead_locked_document_number', 'true');
    montar(true, PASO_SIN_HINT);
    act(() => poner('document_type', 'ce'));
    expect(valores().document_number).not.toBe('');
  });

  it('Diseño 1: la etiqueta es la de la BD, sin ayuda, y el número no se borra al cambiar de tipo', () => {
    catalogo();
    poner('document_number', '12345678');
    montar(false, PASO_SIN_HINT);
    expect(screen.getByText('Número de Documento')).toBeInTheDocument();
    expect(screen.queryByText('8 números')).not.toBeInTheDocument();
    act(() => poner('document_type', 'pasaporte'));
    expect(valores().document_number).toBe('12345678');
  });
});

// ---------------------------------------------------------------------------
// Correcciones de la re-revisión de F4 (ronda 2, BAL-4963)
// ---------------------------------------------------------------------------

describe('Re-revisión 1 · el prefill no pisa un campo bloqueado por el lead', () => {
  it('first_name bloqueado por el lead: DNI A encontrado no lo pisa; "Corrige" + DNI B no encontrado lo deja intacto', () => {
    poner('document_number', '12345678');
    poner('_lead_locked_first_name', 'true');
    poner('first_name', 'NombreDelLead');
    montar(true);

    // DNI A: se encuentra a alguien más. El nombre del lead no se pisa.
    act(() => lookup.onPrefillReady!(RENIEC));
    expect(valores().first_name).toBe('NombreDelLead');

    // "Corrige tu DNI": limpia lo que llenó el prefill (first_name, bloqueado, no se toca).
    fireEvent.click(screen.getByRole('button', { name: 'Corrige tu DNI' }));
    expect(valores().first_name).toBe('NombreDelLead');

    // DNI B: no se encuentra a nadie. first_name sigue siendo el del lead.
    act(() => poner('document_number', '87654321'));
    act(() => lookup.onNoPrefillData!());
    expect(valores().first_name).toBe('NombreDelLead');
  });
});

describe('Re-revisión 2 · "Número de {tipo}" solo en el documento del titular', () => {
  const DOCUMENTO_FAMILIAR = campo({
    id: 30, code: 'documento_familiar', label: 'Documento del familiar', type: 'document_number', required: true,
    validations: [{ type: 'dni', value: null, message: 'El formato del documento no es válido' }],
  } as Partial<WizardField>);

  it('el documento de un familiar conserva la etiqueta de la BD, no "Número de {tipo}"', () => {
    opcionesDinamicas = { document_type: [{ value: 'dni', label: 'DNI' }] };
    montar(true, paso([TIPO_DOC, DOCUMENTO_FAMILIAR]));
    expect(screen.getByText('Documento del familiar')).toBeInTheDocument();
    expect(screen.queryByText(/^Número de /)).not.toBeInTheDocument();
  });

  it('el documento del titular sí recibe "Número de {tipo}" en el mismo paso', () => {
    opcionesDinamicas = { document_type: [{ value: 'dni', label: 'DNI' }] };
    montar(true, paso([TIPO_DOC, DOCUMENTO, DOCUMENTO_FAMILIAR]));
    expect(screen.getByText('Número de DNI')).toBeInTheDocument(); // titular: etiqueta por tipo
    expect(screen.getByText('Documento del familiar')).toBeInTheDocument(); // familiar: etiqueta de la BD
  });
});

describe('Re-revisión 3a · "no encontrado" borra las marcas del prefill aunque no venga de esta sesión', () => {
  it('borrador cargado con marcas de OTRO documento: not_found las limpia sin tocar lo escrito a mano', () => {
    // Nadie disparó el prefill en esta sesión (prefilledRef sigue en false):
    // son marcas que persistieron con el borrador, de un documento anterior.
    store.data = {
      document_type: { value: 'dni' },
      document_number: { value: '12345678' },
      _prefill_doc_document_number: { value: '99999999' },
      _prefill_valor_first_name: { value: 'ALGUIEN' },
      first_name: { value: 'Mariana' }, // lo que la persona escribió a mano
    };
    montar(true);

    act(() => lookup.onNoPrefillData!());

    const v = valores();
    expect(v._prefill_doc_document_number).toBe('');
    expect(v._prefill_valor_first_name).toBe('');
    expect(v.first_name).toBe('Mariana'); // no se toca: no vino de prefill en esta sesión
  });
});
