/// <reference types="jest" />
/**
 * BAL-4960 (F2) — Kit de campos de Diseño 2.
 *
 * `DynamicWizardStep` con `camposTocados` (Diseño 2) pinta la pista, los
 * opcionales plegados, una sola columna y la variante visual de cada campo.
 * Sin `camposTocados` (Diseño 1) el DOM es el de siempre aunque el snapshot
 * traiga `hint` / `collapsed_optional` / `groups`.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { validateField, type WizardField, type WizardStep } from '../../../../../../services/wizardApi';

type Valor = string | string[];
let formData: Record<string, { value: Valor; error?: string | null }> = {};

const updateField = jest.fn((fieldId: string, value: Valor) => {
  formData = { ...formData, [fieldId]: { ...formData[fieldId], value } };
});

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    formData,
    updateField,
    getFieldValue: (code: string) => formData[code]?.value ?? '',
    getFieldError: (code: string) => formData[code]?.error ?? undefined,
    getFieldLabel: () => undefined,
    isFieldTouched: () => false,
    setFieldError: jest.fn(),
    setDynamicOptions: jest.fn(),
    getDynamicOptions: () => [],
  }),
  FILE_PENDING_REUPLOAD: '__FILE_PENDING_REUPLOAD__',
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ deferredPayment: null, agreementData: null, landing: 'pago-diferido' }),
}));

jest.mock('../../../../hooks/useFieldTracking', () => ({
  useFieldTracking: () => ({ onFieldFocus: jest.fn(), onFieldBlur: jest.fn() }),
}));

jest.mock('../../../../../calculadora/utils/useDatosMatricula', () => ({
  useDatosMatricula: () => null,
}));

import { DynamicWizardStep } from '../DynamicWizardStep';

function campo(overrides: Partial<WizardField>): WizardField {
  return {
    id: 1,
    code: 'x',
    label: 'X',
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
    step: null,
    pattern: null,
    mask: null,
    input_mode: null,
    options_source: null,
    options_filter: null,
    options: [],
    validations: [],
    dependency_groups: [],
    max_files: null,
    default_value: null,
    ...overrides,
  } as WizardField;
}

function paso(fields: WizardField[], extra: Partial<WizardStep> = {}): WizardStep {
  return {
    id: 1,
    code: 'personal_data',
    url_slug: 'datos-personales',
    name: 'Datos personales',
    title: 'Datos personales',
    description: '',
    icon: '',
    order: 1,
    required: true,
    skippable: false,
    estimated_time_minutes: 1,
    is_summary_step: false,
    motivational: null,
    fields,
    ...extra,
  };
}

const CORREO = campo({ id: 2, code: 'email', label: 'Correo electrónico', type: 'email', required: true });
const CORREO_CON_PISTA = { ...CORREO, hint: 'Te enviaremos ahí el contrato.' } as WizardField;
const CELULAR_2 = campo({
  id: 3,
  code: 'phone_secondary',
  label: 'Celular Secundario',
  type: 'phone',
  prefix: '+51',
  grid_columns: 6,
});
const CELULAR_2_PLEGADO = { ...CELULAR_2, collapsed_optional: true } as WizardField;
const TIPO_DOC = campo({
  id: 4,
  code: 'document_type',
  label: 'Tipo de documento',
  type: 'select',
  required: true,
  display_mode: 'buttons',
  grid_columns: 4,
  options: [
    { value: 'dni', label: 'DNI' },
    { value: 'ce', label: 'Carné de extranjería' },
    { value: 'pasaporte', label: 'Pasaporte' },
  ],
} as Partial<WizardField>);

const V2 = new Set<string>();
const pintarV2 = (step: WizardStep, showErrors = false) =>
  render(<DynamicWizardStep step={step} showErrors={showErrors} camposTocados={V2} />);
const pintarV1 = (step: WizardStep, showErrors = false) =>
  render(<DynamicWizardStep step={step} showErrors={showErrors} />);

beforeEach(() => {
  updateField.mockClear();
  formData = {};
});

describe('Pista (hint)', () => {
  it('sale bajo el campo solo si viene en el snapshot', () => {
    const { container, unmount } = pintarV2(paso([CORREO_CON_PISTA]));
    expect(screen.getByText('Te enviaremos ahí el contrato.')).toBeInTheDocument();
    expect(container.querySelector('[data-pista="email"]')).not.toBeNull();
    unmount();

    const sinPista = pintarV2(paso([CORREO]));
    expect(sinPista.container.querySelector('[data-pista]')).toBeNull();
  });

  it('el error reemplaza a la pista', () => {
    formData = { email: { value: '', error: 'Ingresa tu correo para enviarte el contrato.' } };
    const { container } = pintarV2(paso([CORREO_CON_PISTA]), true);
    expect(screen.getByRole('alert')).toHaveTextContent('Ingresa tu correo para enviarte el contrato.');
    expect(screen.queryByText('Te enviaremos ahí el contrato.')).not.toBeInTheDocument();
    expect(container.querySelector('[data-campo="email"]')).toHaveAttribute('data-estado', 'error');
  });
});

describe('Mensaje de obligatorio (required_message)', () => {
  it('reemplaza al genérico cuando el obligatorio está vacío', () => {
    const conMensaje = { ...CORREO, required_message: 'Ingresa tu correo para enviarte el contrato.' } as WizardField;
    expect(validateField(conMensaje, '', {}, undefined, true).error).toBe('Ingresa tu correo para enviarte el contrato.');
  });

  it('sin mensaje propio sigue el genérico de siempre', () => {
    expect(validateField(CORREO, '', {}, undefined, true).error).toBe('Este campo es requerido');
  });

  it('también en la casilla obligatoria', () => {
    const casilla = campo({ code: 'consent', type: 'checkbox', required: true });
    expect(validateField(casilla, 'false', {}, undefined, true).error).toBe('Debes marcar esta casilla para continuar');
    const conMensaje = { ...casilla, required_message: 'Marca la casilla para continuar.' } as WizardField;
    expect(validateField(conMensaje, 'false', {}, undefined, true).error).toBe('Marca la casilla para continuar.');
  });

  it('no toca otros errores (formato) aunque el campo tenga mensaje propio', () => {
    const conMensaje = {
      ...CORREO,
      required_message: 'Ingresa tu correo.',
      validations: [{ type: 'email', value: null, message: 'Correo inválido' }],
    } as unknown as WizardField;
    expect(validateField(conMensaje, 'no-es-correo', {}, undefined, true).error).not.toBe('Ingresa tu correo.');
  });
});

describe('Opcional plegado (collapsed_optional)', () => {
  it('muestra "+ Agregar …" en lugar del campo y al tocarlo aparece el campo con foco', () => {
    const { container } = pintarV2(paso([CELULAR_2_PLEGADO]));
    expect(container.querySelector('input[name="phone_secondary"]')).toBeNull();
    const enlace = screen.getByRole('button', { name: 'Agregar celular secundario' });

    fireEvent.click(enlace);

    const input = container.querySelector<HTMLInputElement>('input[name="phone_secondary"]');
    expect(input).not.toBeNull();
    expect(document.activeElement).toBe(input);
    expect(screen.queryByRole('button', { name: 'Agregar celular secundario' })).not.toBeInTheDocument();
  });

  it('con valor (borrador) aparece abierto', () => {
    formData = { phone_secondary: { value: '987654321' } };
    const { container } = pintarV2(paso([CELULAR_2_PLEGADO]));
    expect(container.querySelector<HTMLInputElement>('input[name="phone_secondary"]')?.value).toBe('987654321');
    expect(screen.queryByRole('button', { name: /Agregar/ })).not.toBeInTheDocument();
  });

  it('un obligatorio nunca se pliega aunque venga marcado', () => {
    const obligatorio = { ...CELULAR_2_PLEGADO, required: true } as WizardField;
    const { container } = pintarV2(paso([obligatorio]));
    expect(container.querySelector('input[name="phone_secondary"]')).not.toBeNull();
  });
});

describe('Lista con display_mode de botones', () => {
  it('se pinta como botones-chip y el elegido queda presionado', () => {
    formData = { document_type: { value: 'dni' } };
    pintarV2(paso([TIPO_DOC]));
    const dni = screen.getByRole('button', { name: 'DNI' });
    const ce = screen.getByRole('button', { name: 'Carné de extranjería' });
    expect(dni).toHaveAttribute('aria-pressed', 'true');
    expect(ce).toHaveAttribute('aria-pressed', 'false');
    expect(dni.className).toContain('bg-[#4654CD]');
    expect(dni.className).toContain('text-white');
    expect(ce.className).toContain('text-[#4654CD]');
    expect(dni.className).toContain('min-h-[48px]');

    fireEvent.click(ce);
    expect(updateField).toHaveBeenCalledWith('document_type', 'ce');
  });
});

describe('Una columna en Diseño 2', () => {
  it('ignora grid_columns: todo a ancho completo', () => {
    const { container } = pintarV2(paso([TIPO_DOC, CELULAR_2]));
    for (const el of container.querySelectorAll('[data-campo]')) {
      expect(el.className).toContain('col-span-12');
      expect(el.className).not.toMatch(/sm:col-span-(?!12)/);
    }
  });
});

describe('Casilla obligatoria en Diseño 2', () => {
  const CASILLA = campo({
    code: 'work_verification_consent',
    label: 'Autorizo a BaldeCash a verificar la información de mis ingresos.',
    type: 'checkbox',
    required: true,
  });

  it('neutra al inicio, roja con el mensaje al intentar continuar, verde con «¡Listo!» marcada', () => {
    const { container, unmount } = pintarV2(paso([CASILLA]));
    expect(container.querySelector('[data-casilla-v2]')).toHaveAttribute('data-casilla-v2', 'neutra');
    expect(screen.getByText('Obligatorio')).toBeInTheDocument();
    unmount();

    formData = { work_verification_consent: { value: 'false', error: 'Marca la casilla para continuar.' } };
    const conError = pintarV2(paso([CASILLA]), true);
    expect(conError.container.querySelector('[data-casilla-v2]')).toHaveAttribute('data-casilla-v2', 'error');
    expect(screen.getByRole('alert')).toHaveTextContent('Marca la casilla para continuar.');
    expect(conError.container.querySelector('.casilla-v2-sacudida')).not.toBeNull();
    conError.unmount();

    formData = { work_verification_consent: { value: 'true' } };
    const marcada = pintarV2(paso([CASILLA]));
    expect(marcada.container.querySelector('[data-casilla-v2]')).toHaveAttribute('data-casilla-v2', 'marcada');
    expect(screen.getByText('¡Listo!')).toBeInTheDocument();
  });

  it('al tocarla cambia el valor como siempre ("true"/"false")', () => {
    formData = { work_verification_consent: { value: 'false' } };
    pintarV2(paso([CASILLA]));
    fireEvent.click(screen.getByRole('checkbox'));
    expect(updateField).toHaveBeenCalledWith('work_verification_consent', 'true');
  });
});

describe('Diseño 1 no cambia', () => {
  it('el mismo campo con hint / collapsed_optional / groups da el mismo DOM que sin ellos', () => {
    const base = paso([TIPO_DOC, CORREO, CELULAR_2]);
    const conDatosNuevos = paso([TIPO_DOC, CORREO_CON_PISTA, CELULAR_2_PLEGADO], {
      groups: [{ code: 'contacto', name: 'Contacto', order: 0, is_collapsible: true, field_codes: ['email'] }],
    });

    const antes = pintarV1(base).container.innerHTML;
    const despues = pintarV1(conDatosNuevos).container.innerHTML;
    expect(despues).toBe(antes);
  });

  it('sin variante: columnas de la BD, sin pista, sin enlace, sin data-campo', () => {
    const { container } = pintarV1(paso([CORREO_CON_PISTA, CELULAR_2_PLEGADO]));
    expect(screen.queryByText('Te enviaremos ahí el contrato.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Agregar/ })).not.toBeInTheDocument();
    expect(container.querySelector('input[name="phone_secondary"]')).not.toBeNull();
    expect(container.querySelector('[data-campo]')).toBeNull();
    expect(container.querySelector('.sm\\:col-span-6')).not.toBeNull();
    // El vestido de siempre: caja de 44px y borde de 2px.
    expect(container.querySelector('.h-11.border-2')).not.toBeNull();
    expect(container.innerHTML).not.toContain('h-[50px]');
  });

  it('la lista de botones de Diseño 1 sigue siendo el segmentado de siempre', () => {
    formData = { document_type: { value: 'dni' } };
    pintarV1(paso([TIPO_DOC]));
    expect(screen.getByRole('button', { name: 'DNI' })).not.toHaveAttribute('aria-pressed');
    expect(screen.getByText('Seleccionado')).toBeInTheDocument();
  });
});

describe('Secciones (groups) en Diseño 2', () => {
  it('su presencia no rompe nada: los campos salen en el orden normal', () => {
    const { container } = pintarV2(
      paso([TIPO_DOC, CORREO, CELULAR_2], {
        groups: [{ code: 'contacto', name: 'Contacto', order: 0, is_collapsible: true, field_codes: ['email', 'phone_secondary'] }],
      }),
    );
    const orden = Array.from(container.querySelectorAll<HTMLElement>('[data-campo]')).map((el) => el.dataset.campo);
    expect(orden).toEqual(['document_type', 'email', 'phone_secondary']);
  });
});
