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
import { validateField, validateStep, type WizardField, type WizardStep } from '../../../../../../services/wizardApi';

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

// El campo de dirección (Diseño 1 no cambia) depende de Google Maps, que no
// carga en jsdom. Se mockea en "ya cargado, sin error" para que el campo
// renderice su DOM estable y comparable.
jest.mock('../../../../hooks/useGooglePlacesAutocomplete', () => ({
  useGooglePlacesAutocomplete: () => ({ isLoaded: true, isLoading: false, error: null }),
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

const SITUACION = campo({
  id: 5,
  code: 'situacion',
  label: 'Situación actual',
  type: 'radio',
  required: true,
  options: [
    { value: 'a', label: 'Trabajo dependiente' },
    { value: 'b', label: 'Trabajo independiente' },
    { value: 'c', label: 'Estudiante' },
    { value: 'd', label: 'Sin ingresos' },
  ],
} as Partial<WizardField>);

const LISTA_LARGA = campo({
  id: 6,
  code: 'departamento',
  label: 'Departamento',
  type: 'radio',
  required: true,
  options: Array.from({ length: 6 }, (_, i) => ({ value: String(i), label: `Opción ${i}` })),
} as Partial<WizardField>);

const DIRECCION = campo({
  id: 7,
  code: 'address',
  label: 'Dirección',
  type: 'address',
  required: true,
} as Partial<WizardField>);

const CONSENTIMIENTO_SIMPLE = campo({
  id: 8,
  code: 'consent_simple',
  label: 'Acepto los términos',
  type: 'checkbox',
  required: true,
});

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
  // I1 (BAL-4969, decisión de Emilio): el mensaje propio aplica SOLO en Diseño 2.
  const D2 = { diseno2: true };

  it('Diseño 2: reemplaza al genérico cuando el obligatorio está vacío', () => {
    const conMensaje = { ...CORREO, required_message: 'Ingresa tu correo para enviarte el contrato.' } as WizardField;
    expect(validateField(conMensaje, '', {}, undefined, true, D2).error).toBe('Ingresa tu correo para enviarte el contrato.');
  });

  it('Diseño 1: aunque el campo tenga mensaje propio, sale el genérico de siempre', () => {
    const conMensaje = { ...CORREO, required_message: 'Ingresa tu correo para enviarte el contrato.' } as WizardField;
    expect(validateField(conMensaje, '', {}, undefined, true).error).toBe('Este campo es requerido');
    expect(validateField(conMensaje, '', {}, undefined, true, { diseno2: false }).error).toBe('Este campo es requerido');
  });

  it('sin mensaje propio sigue el genérico de siempre (los dos diseños)', () => {
    expect(validateField(CORREO, '', {}, undefined, true).error).toBe('Este campo es requerido');
    expect(validateField(CORREO, '', {}, undefined, true, D2).error).toBe('Este campo es requerido');
  });

  it('también en la casilla obligatoria: Diseño 2 con mensaje, Diseño 1 genérico', () => {
    const casilla = campo({ code: 'consent', type: 'checkbox', required: true });
    expect(validateField(casilla, 'false', {}, undefined, true, D2).error).toBe('Debes marcar esta casilla para continuar');
    const conMensaje = { ...casilla, required_message: 'Marca la casilla para continuar.' } as WizardField;
    expect(validateField(conMensaje, 'false', {}, undefined, true, D2).error).toBe('Marca la casilla para continuar.');
    expect(validateField(conMensaje, 'false', {}, undefined, true).error).toBe('Debes marcar esta casilla para continuar');
  });

  it('validateStep pasa el diseño: Diseño 1 genérico, Diseño 2 el mensaje propio', () => {
    const conMensaje = { ...CORREO, required_message: 'Ingresa tu correo.' } as WizardField;
    const step = paso([conMensaje]);
    const errores: Record<string, string | null> = {};
    const set = (c: string, e: string | null) => { errores[c] = e; };
    validateStep(step, {}, set);
    expect(errores[conMensaje.code]).toBe('Este campo es requerido');
    validateStep(step, {}, set, undefined, D2);
    expect(errores[conMensaje.code]).toBe('Ingresa tu correo.');
  });

  it('no toca otros errores (formato) aunque el campo tenga mensaje propio', () => {
    const conMensaje = {
      ...CORREO,
      required_message: 'Ingresa tu correo.',
      validations: [{ type: 'email', value: null, message: 'Correo inválido' }],
    } as unknown as WizardField;
    expect(validateField(conMensaje, 'no-es-correo', {}, undefined, true, D2).error).not.toBe('Ingresa tu correo.');
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
  it('se pinta como botones-chip (role="radio") y el elegido queda marcado', () => {
    formData = { document_type: { value: 'dni' } };
    pintarV2(paso([TIPO_DOC]));
    const dni = screen.getByRole('radio', { name: 'DNI' });
    const ce = screen.getByRole('radio', { name: 'Carné de extranjería' });
    expect(dni).toHaveAttribute('aria-checked', 'true');
    expect(ce).toHaveAttribute('aria-checked', 'false');
    // Prototipo de Brenda (BTN / BTN_ON): elegido con fondo de marca suave y
    // texto de marca; el otro neutro con borde #C9CEF0 y texto oscuro.
    expect(dni.className).toContain('bg-[rgba(var(--color-primary-rgb),0.1)]');
    expect(dni.className).toContain('text-[var(--color-primary-text)]');
    expect(ce.className).toContain('border-[#C9CEF0]');
    expect(ce.className).toContain('text-[#1E2230]');
    expect(dni.className).toContain('min-h-[52px]');

    fireEvent.click(ce);
    expect(updateField).toHaveBeenCalledWith('document_type', 'ce');
  });

  it('el grupo es role="radiogroup" y las flechas mueven y eligen la opción vecina', () => {
    formData = { document_type: { value: 'dni' } };
    const { container } = pintarV2(paso([TIPO_DOC]));
    expect(container.querySelector('[role="radiogroup"]')).not.toBeNull();

    const dni = screen.getByRole('radio', { name: 'DNI' });
    fireEvent.keyDown(dni, { key: 'ArrowRight' });
    expect(updateField).toHaveBeenCalledWith('document_type', 'ce');
  });
});

describe('IMPORTANTE — foco visible en Diseño 2 (revisión F2)', () => {
  it('las tarjetas de RadioGroup tienen la clase de foco visible', () => {
    const { container } = pintarV2(paso([SITUACION]));
    const tarjetas = container.querySelectorAll('button');
    expect(tarjetas.length).toBeGreaterThan(0);
    for (const t of Array.from(tarjetas)) {
      expect(t.className).toContain('focus-visible:ring-2');
      expect(t.className).toContain('ring-[var(--color-primary)]');
    }
  });

  it('el disparador de SelectInput tiene la clase de foco visible y no depende solo de isOpen', () => {
    const { container } = pintarV2(paso([LISTA_LARGA]));
    const disparador = container.querySelector('[role="button"]');
    expect(disparador?.className).toContain('focus-visible:ring-2');
    expect(disparador?.className).toContain('ring-[var(--color-primary)]');
  });

  it('SelectInput: el label lleva htmlFor apuntando al disparador', () => {
    const { container } = pintarV2(paso([LISTA_LARGA]));
    const label = container.querySelector('label');
    const disparador = container.querySelector('[role="button"]');
    expect(label).toHaveAttribute('for', disparador?.id);
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

  it('neutra al inicio (blanco, borde gris, sin ámbar ni «Obligatorio» resaltado) — decisión de Emilio', () => {
    const { container, unmount } = pintarV2(paso([CASILLA]));
    const casilla = container.querySelector('[data-casilla-v2]');
    expect(casilla).toHaveAttribute('data-casilla-v2', 'neutra');
    const label = container.querySelector('label');
    expect(label?.className).toContain('border-[#C9CEF0]');
    expect(label?.className).toContain('bg-white');
    expect(label?.className).not.toContain('#F2B632');
    expect(label?.className).not.toContain('#FFF6D8');
    expect(screen.queryByText('Obligatorio')).not.toBeInTheDocument();
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

  it('IMPORTANTE: el label (la caja clickeable) tiene la clase de foco visible', () => {
    const { container } = pintarV2(paso([CASILLA]));
    const label = container.querySelector('label');
    expect(label?.className).toContain('focus-within:ring-2');
    expect(label?.className).toContain('ring-[var(--color-primary)]');
  });

  it('el label y el subtítulo no se anuncian dos veces: el input no lleva aria-describedby a ellos', () => {
    formData = { work_verification_consent: { value: 'false', error: 'Marca la casilla para continuar.' } };
    const { container } = pintarV2(paso([CASILLA]), true);
    const input = container.querySelector('input[type="checkbox"]');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('el <style> de las keyframes no se repite por casilla (una sola vez, global)', () => {
    const CASILLA_2 = campo({ code: 'otra_casilla', label: 'Otra', type: 'checkbox', required: true });
    const { container } = pintarV2(paso([CASILLA, CASILLA_2]));
    const estilosEnLinea = Array.from(container.querySelectorAll('style')).filter((s) =>
      s.textContent?.includes('casillaV2Sacudida')
    );
    expect(estilosEnLinea).toHaveLength(0);
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

  /**
   * IMPORTANTE (revisión F2): clases EXACTAS del markup de Diseño 1 tal como
   * estaban en `42efc176` (antes de BAL-4960), obtenidas con
   * `git show 42efc176:ruta`. No basta comparar "antes vs. después" dentro
   * del propio commit — así se escapó el `min-w-0` que BAL-4960 agregó
   * también a `AddressAutocompleteField` en Diseño 1 (no solo en Diseño 2).
   */
  it('TextInput: la caja y el input mantienen las clases de 42efc176 (sin CAJA_V2)', () => {
    const { container } = pintarV1(paso([CORREO]));
    const caja = container.querySelector('#email > div');
    expect(caja?.className).toContain('h-11');
    expect(caja?.className).toContain('border-2');
    expect(caja?.className).toContain('border-neutral-300');
    expect(caja?.className).not.toContain('rounded-[10px]');
    const input = container.querySelector('#email input');
    expect(input?.className).toContain('text-neutral-800');
    expect(input?.className).not.toContain('min-w-0');
  });

  it('SelectInput: el disparador mantiene las clases de 42efc176 (sin CAJA_V2, sin role button disfrazado)', () => {
    const { container } = pintarV1(paso([LISTA_LARGA]));
    const disparador = container.querySelector('[role="button"]');
    expect(disparador?.className).toContain('h-11');
    expect(disparador?.className).toContain('border-2');
    expect(disparador?.className).toContain('border-neutral-300');
    expect(disparador?.className).not.toContain('rounded-[10px]');
    // Diseño 1 nunca le pone id ni el label nunca lleva htmlFor (eso es de Diseño 2).
    expect(container.querySelector('label')).not.toHaveAttribute('for');
  });

  it('RadioGroup: las tarjetas mantienen las clases de 42efc176 (sin !border-[1.5px])', () => {
    const { container } = pintarV1(paso([SITUACION]));
    const tarjetas = container.querySelectorAll('button');
    for (const t of Array.from(tarjetas)) {
      expect(t.className).toContain('border-2');
      expect(t.className).toContain('border-neutral-200');
      expect(t.className).not.toContain('!border-[1.5px]');
      expect(t.className).not.toContain('focus-visible:ring-2');
    }
  });

  it('CheckboxField (simple): la caja mantiene las clases de 42efc176 (sin CasillaV2)', () => {
    const { container } = pintarV1(paso([CONSENTIMIENTO_SIMPLE]));
    expect(container.querySelector('[data-casilla-v2]')).toBeNull();
    const caja = container.querySelector('#consent_simple div');
    expect(caja?.className).toContain('border-2');
    expect(caja?.className).toContain('border-neutral-300');
    expect(caja?.className).not.toContain('#C9CEF0');
  });

  it('Dirección (AddressAutocompleteField): el input NO lleva `min-w-0` en Diseño 1 (BAL-4960 lo agregó por error en los dos diseños)', () => {
    const { container } = pintarV1(paso([DIRECCION]));
    const caja = container.querySelector('#address > div');
    expect(caja?.className).toContain('h-11');
    expect(caja?.className).toContain('border-2');
    expect(caja?.className).toContain('border-neutral-300');
    const input = container.querySelector('#address input[type="text"]');
    expect(input).not.toBeNull();
    expect(input?.className).not.toContain('min-w-0');
    expect(input?.className).toContain('text-neutral-800');
    expect(input?.className).toContain('placeholder:text-neutral-400');
  });
});

describe('Secciones (groups) en Diseño 2', () => {
  // F5 (BAL-4964): las secciones ya se pintan. Lo de cada sección va primero,
  // en el orden del paso, y lo que no tiene sección va al final. Ver
  // `paso2DatosAcademicosDiseno2.test.tsx`.
  it('los campos de la sección van primero y los sin sección al final', () => {
    const { container } = pintarV2(
      paso([TIPO_DOC, CORREO, CELULAR_2], {
        groups: [{ code: 'contacto', name: 'Contacto', order: 0, is_collapsible: true, field_codes: ['email', 'phone_secondary'] }],
      }),
    );
    const orden = Array.from(container.querySelectorAll<HTMLElement>('[data-campo]')).map((el) => el.dataset.campo);
    expect(orden).toEqual(['email', 'phone_secondary', 'document_type']);
    expect(container.querySelector('[data-seccion="contacto"]')).not.toBeNull();
  });
});
