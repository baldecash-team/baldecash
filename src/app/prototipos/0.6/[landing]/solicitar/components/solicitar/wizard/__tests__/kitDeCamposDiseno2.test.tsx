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
  // BAL-5261 (OK de Emilio): el mensaje propio aplica en los dos diseños
  // (antes, BAL-4969 · I1, solo en Diseño 2).
  const D2 = { diseno2: true };

  it('Diseño 2: reemplaza al genérico cuando el obligatorio está vacío', () => {
    const conMensaje = { ...CORREO, required_message: 'Ingresa tu correo para enviarte el contrato.' } as WizardField;
    expect(validateField(conMensaje, '', {}, undefined, true, D2).error).toBe('Ingresa tu correo para enviarte el contrato.');
  });

  it('Diseño 1: con mensaje propio, sale el mensaje propio (BAL-5261)', () => {
    const conMensaje = { ...CORREO, required_message: 'Ingresa tu correo para enviarte el contrato.' } as WizardField;
    expect(validateField(conMensaje, '', {}, undefined, true).error).toBe('Ingresa tu correo para enviarte el contrato.');
    expect(validateField(conMensaje, '', {}, undefined, true, { diseno2: false }).error).toBe('Ingresa tu correo para enviarte el contrato.');
  });

  it('sin mensaje propio sigue el genérico de siempre (los dos diseños)', () => {
    expect(validateField(CORREO, '', {}, undefined, true).error).toBe('Este campo es requerido');
    expect(validateField(CORREO, '', {}, undefined, true, D2).error).toBe('Este campo es requerido');
  });

  it('también en la casilla obligatoria: con mensaje propio en los dos diseños', () => {
    const casilla = campo({ code: 'consent', type: 'checkbox', required: true });
    expect(validateField(casilla, 'false', {}, undefined, true, D2).error).toBe('Debes marcar esta casilla para continuar');
    expect(validateField(casilla, 'false', {}, undefined, true).error).toBe('Debes marcar esta casilla para continuar');
    const conMensaje = { ...casilla, required_message: 'Marca la casilla para continuar.' } as WizardField;
    expect(validateField(conMensaje, 'false', {}, undefined, true, D2).error).toBe('Marca la casilla para continuar.');
    expect(validateField(conMensaje, 'false', {}, undefined, true).error).toBe('Marca la casilla para continuar.');
  });

  it('validateStep («Continuar») da el mensaje propio en los dos diseños', () => {
    const conMensaje = { ...CORREO, required_message: 'Ingresa tu correo.' } as WizardField;
    const step = paso([conMensaje]);
    const errores: Record<string, string | null> = {};
    const set = (c: string, e: string | null) => { errores[c] = e; };
    validateStep(step, {}, set);
    expect(errores[conMensaje.code]).toBe('Ingresa tu correo.');
    validateStep(step, {}, set, undefined, { diseno2: false });
    expect(errores[conMensaje.code]).toBe('Ingresa tu correo.');
    validateStep(step, {}, set, undefined, D2);
    expect(errores[conMensaje.code]).toBe('Ingresa tu correo.');
    // Sin mensaje propio, el genérico de siempre.
    validateStep(paso([CORREO]), {}, set);
    expect(errores[CORREO.code]).toBe('Este campo es requerido');
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
    expect(ce.className).toContain('border-[var(--d2-borde-campo)]');
    expect(ce.className).toContain('text-[var(--d2-texto)]');
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

describe('Ancho de los campos en Diseño 2 (BAL-4966)', () => {
  it('usa grid_columns / grid_columns_mobile del paso, como Diseño 1', () => {
    const { container } = pintarV2(paso([
      { ...TIPO_DOC, grid_columns: 4, grid_columns_mobile: 12 } as WizardField,
      { ...CELULAR_2, grid_columns: 6, grid_columns_mobile: 6 } as WizardField,
    ]));
    const tipo = container.querySelector('[data-campo="document_type"]') as HTMLElement;
    const celular = container.querySelector('[data-campo="phone_secondary"]') as HTMLElement;
    expect(tipo.className).toMatch(/(^| )col-span-12( |$)/);
    expect(tipo.className).toContain('sm:col-span-4');
    expect(celular.className).toMatch(/(^| )col-span-6( |$)/);
    expect(celular.className).toContain('sm:col-span-6');
    // Sigue siendo un campo de Diseño 2.
    expect(tipo.className).toContain('campo-v2');
  });

  it('sin grid_columns (null) va a ancho completo', () => {
    const { container } = pintarV2(paso([
      { ...TIPO_DOC, grid_columns: null, grid_columns_mobile: null } as unknown as WizardField,
    ]));
    const tipo = container.querySelector('[data-campo="document_type"]') as HTMLElement;
    expect(tipo.className).toMatch(/(^| )col-span-12( |$)/);
    expect(tipo.className).toContain('sm:col-span-12');
  });
});

describe('Casilla obligatoria en Diseño 2', () => {
  const CASILLA = campo({
    code: 'work_verification_consent',
    label: 'Autorizo a BaldeCash a verificar la información de mis ingresos.',
    type: 'checkbox',
    required: true,
  });

  it('diseño de Brenda (BAL-5383): ámbar con brillo, naranja con sacudida, verde con «¡Listo!»', () => {
    const { container, unmount } = pintarV2(paso([CASILLA]));
    const casilla = container.querySelector('[data-casilla-v2]');
    expect(casilla).toHaveAttribute('data-casilla-v2', 'aviso');
    const label = container.querySelector('label');
    expect(label).toHaveClass('border-2', 'rounded-[14px]', 'border-[var(--d2-aviso-borde)]', 'bg-[var(--d2-aviso-suave)]', 'd2-brillo-consentimiento');
    expect(screen.getByText('Necesario para continuar con tu solicitud.')).toHaveClass('text-[var(--d2-aviso-texto)]');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    // Etiqueta «Obligatorio»: solo escritorio (`md:`), decorativa.
    const etiqueta = screen.getByText('Obligatorio');
    expect(etiqueta).toHaveClass('hidden', 'md:inline-flex', 'bg-[var(--d2-aviso-etiqueta)]');
    expect(etiqueta).toHaveAttribute('aria-hidden', 'true');
    unmount();

    formData = { work_verification_consent: { value: 'false', error: 'Marca la casilla para continuar.' } };
    const conError = pintarV2(paso([CASILLA]), true);
    expect(conError.container.querySelector('[data-casilla-v2]')).toHaveAttribute('data-casilla-v2', 'error');
    const labelError = conError.container.querySelector('label');
    expect(labelError).toHaveClass('border-[var(--d2-error)]', 'bg-[var(--d2-error-suave)]', 'casilla-v2-sacudida');
    expect(labelError).not.toHaveClass('d2-brillo-consentimiento');
    expect(screen.getByRole('alert')).toHaveTextContent('Marca la casilla para continuar.');
    expect(screen.getByRole('alert')).toHaveClass('font-bold', 'text-[var(--d2-error-texto)]');
    expect(screen.getByText('Obligatorio')).toHaveClass('bg-[var(--d2-error-etiqueta)]', 'text-[var(--d2-error-etiqueta-texto)]');
    conError.unmount();

    formData = { work_verification_consent: { value: 'true' } };
    const marcada = pintarV2(paso([CASILLA]));
    expect(marcada.container.querySelector('[data-casilla-v2]')).toHaveAttribute('data-casilla-v2', 'marcada');
    expect(marcada.container.querySelector('label')).toHaveClass('border-[var(--d2-ok)]', 'bg-[var(--d2-ok-suave-3)]');
    expect(screen.getByText('¡Listo! Ya puedes continuar.')).toHaveClass('font-semibold', 'text-[var(--d2-ok-texto)]');
    expect(screen.queryByText('Obligatorio')).not.toBeInTheDocument();
  });

  it('el mensaje genérico del validador se muestra con el texto de Brenda; el required_message propio se respeta', () => {
    formData = { work_verification_consent: { value: 'false', error: 'Debes marcar esta casilla para continuar' } };
    const generico = pintarV2(paso([CASILLA]), true);
    expect(screen.getByRole('alert')).toHaveTextContent('Marca la casilla para continuar.');
    generico.unmount();

    formData = { work_verification_consent: { value: 'false', error: 'Necesitamos tu autorización.' } };
    pintarV2(paso([CASILLA]), true);
    expect(screen.getByRole('alert')).toHaveTextContent('Necesitamos tu autorización.');
  });

  it('opcional: se queda neutra (sin ámbar, sin «Obligatorio» ni «Necesario…»)', () => {
    const OPCIONAL = campo({ code: 'promos', label: 'Quiero recibir promociones', type: 'checkbox', required: false });
    const { container } = pintarV2(paso([OPCIONAL]));
    expect(container.querySelector('[data-casilla-v2]')).toHaveAttribute('data-casilla-v2', 'neutra');
    const label = container.querySelector('label');
    expect(label).toHaveClass('border-[var(--d2-borde-campo)]', 'bg-[var(--d2-tarjeta)]');
    expect(label).not.toHaveClass('d2-brillo-consentimiento');
    expect(screen.queryByText('Obligatorio')).not.toBeInTheDocument();
    expect(screen.queryByText('Necesario para continuar con tu solicitud.')).not.toBeInTheDocument();
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

  describe('la caja que se ve no es la nativa (se veía negra sin marcar en Chromium)', () => {
    const caja = (c: HTMLElement) => c.querySelector('[data-caja-casilla]') as HTMLElement;

    it('el input nativo queda solo para la semántica: oculto, accesible y sin accentColor', () => {
      const { container } = pintarV2(paso([CASILLA]));
      const input = screen.getByRole('checkbox', { name: /Autorizo a BaldeCash/ });
      expect(input.className).toContain('sr-only');
      expect(input).not.toHaveAttribute('style');
      expect(caja(container)).toHaveAttribute('aria-hidden', 'true');
    });

    it('sin marcar: borde gris de casilla sobre la tarjeta, sin check', () => {
      const { container } = pintarV2(paso([CASILLA]));
      expect(caja(container).className).toContain('border-[var(--d2-borde-casilla)]');
      expect(caja(container).className).toContain('bg-[var(--d2-tarjeta)]');
      expect(caja(container).querySelector('svg')).toBeNull();
    });

    it('marcada: relleno verde con el check blanco', () => {
      formData = { work_verification_consent: { value: 'true' } };
      const { container } = pintarV2(paso([CASILLA]));
      expect(caja(container).className).toContain('bg-[var(--d2-ok-relleno)]');
      expect(caja(container).className).toContain('border-[var(--d2-ok)]');
      expect(caja(container).querySelector('svg')).not.toBeNull();
    });

    it('con error: borde rojo', () => {
      formData = { work_verification_consent: { value: 'false', error: 'Marca la casilla para continuar.' } };
      const { container } = pintarV2(paso([CASILLA]), true);
      expect(caja(container).className).toContain('border-[var(--d2-error)]');
    });

    it('el foco de teclado se ve en la caja', () => {
      const { container } = pintarV2(paso([CASILLA]));
      expect(caja(container).className).toContain('peer-focus-visible:ring-2');
    });
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

describe('Pista en Diseño 1 (BAL-5261)', () => {
  const PISTA = 'Te enviaremos ahí el contrato.';
  const conPista = (f: WizardField) => ({ ...f, hint: PISTA }) as WizardField;

  it('sale bajo el campo, texto chico gris, en la línea del error', () => {
    const { container } = pintarV1(paso([CORREO_CON_PISTA]));
    const pista = container.querySelector('[data-pista="email"]');
    expect(pista).toHaveTextContent(PISTA);
    expect(pista?.className).toBe('text-xs text-neutral-500');
    // Dentro del campo, después de la caja (no arriba como el helpText).
    const caja = container.querySelector('#email > div.h-11');
    expect(caja && pista && caja.compareDocumentPosition(pista) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Sin el vestido de Diseño 2.
    expect(container.querySelector('[data-campo]')).toBeNull();
  });

  it('si hay error, el error la reemplaza (no salen los dos)', () => {
    formData = { email: { value: '', error: 'Ingresa tu correo.' } };
    const { container } = pintarV1(paso([CORREO_CON_PISTA]), true);
    expect(screen.getByText('Ingresa tu correo.')).toBeInTheDocument();
    expect(screen.queryByText(PISTA)).not.toBeInTheDocument();
    expect(container.querySelector('[data-pista]')).toBeNull();
  });

  it.each([
    ['celular', CELULAR_2],
    ['lista de botones', TIPO_DOC],
    ['tarjetas (radio 4-5)', SITUACION],
    ['desplegable (radio 6+)', LISTA_LARGA],
    ['dirección', DIRECCION],
    ['casilla simple', CONSENTIMIENTO_SIMPLE],
    ['área de texto', campo({ id: 9, code: 'comentario', label: 'Comentario', type: 'textarea' })],
    ['número', campo({ id: 10, code: 'hijos', label: 'Hijos', type: 'number' })],
    ['monto', campo({ id: 11, code: 'ingreso', label: 'Ingreso', type: 'currency' })],
    ['fecha', campo({ id: 12, code: 'inicio', label: 'Inicio', type: 'date' })],
  ])('%s: la pinta una sola vez y el error la reemplaza', (_n, f) => {
    const { unmount } = pintarV1(paso([conPista(f)]));
    expect(screen.getAllByText(PISTA)).toHaveLength(1);
    expect(screen.getByText(PISTA).className).toContain('text-xs text-neutral-500');
    unmount();

    formData = { [f.code]: { value: '', error: 'Falta este dato.' } };
    pintarV1(paso([conPista(f)]), true);
    expect(screen.getByText('Falta este dato.')).toBeInTheDocument();
    expect(screen.queryByText(PISTA)).not.toBeInTheDocument();
  });

  it('convive con el globo de ayuda: el globo sigue en la etiqueta, la pista bajo el campo', () => {
    const conAyuda = {
      ...CORREO_CON_PISTA,
      help_text: { title: 'Correo', description: 'Para el contrato.' },
    } as unknown as WizardField;
    const { container } = pintarV1(paso([conAyuda]));
    const etiqueta = container.querySelector('#email label');
    expect(etiqueta?.querySelector('button, [role="button"], svg')).not.toBeNull();
    expect(etiqueta).not.toHaveTextContent(PISTA);
    expect(container.querySelector('[data-pista="email"]')).toHaveTextContent(PISTA);
  });

  it('Diseño 2 sigue igual: la pista con su estilo de Diseño 2, no el de Diseño 1', () => {
    const { container } = pintarV2(paso([CORREO_CON_PISTA]));
    const pistas = container.querySelectorAll('[data-pista="email"]');
    expect(pistas).toHaveLength(1);
    expect(pistas[0].className).not.toContain('text-neutral-500');
    expect(pistas[0].className).toContain('text-[13px]');
  });
});

describe('Diseño 1 no cambia', () => {
  // La pista (`hint`) sí sale en Diseño 1 desde BAL-5261: ver «Pista en Diseño 1».
  it('el mismo campo con collapsed_optional / groups da el mismo DOM que sin ellos', () => {
    const base = paso([TIPO_DOC, CORREO, CELULAR_2]);
    const conDatosNuevos = paso([TIPO_DOC, CORREO, CELULAR_2_PLEGADO], {
      groups: [{ code: 'contacto', name: 'Contacto', order: 0, is_collapsible: true, field_codes: ['email'] }],
    });

    const antes = pintarV1(base).container.innerHTML;
    const despues = pintarV1(conDatosNuevos).container.innerHTML;
    expect(despues).toBe(antes);
  });

  it('sin variante: columnas de la BD, sin pista si no hay hint, sin enlace, sin data-campo', () => {
    const { container } = pintarV1(paso([CORREO, CELULAR_2_PLEGADO]));
    expect(container.querySelector('[data-pista]')).toBeNull();
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
