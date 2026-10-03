/**
 * Tests for DynamicField Component - Type Mapping
 *
 * Tests the dynamic component rendering based on field.type:
 * - Text inputs (text, email, phone, document_number)
 * - Numeric inputs (currency, number)
 * - Date inputs
 * - Selection inputs (radio → SegmentedControl/RadioGroup/Select)
 * - Select/Autocomplete
 * - File upload
 * - Textarea
 * - Visibility evaluation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { WizardField } from '../../../../../services/wizardApi';

// Mock the WizardContext
const mockUpdateField = jest.fn();
const mockGetFieldValue = jest.fn().mockReturnValue('');
const mockGetFieldError = jest.fn().mockReturnValue(undefined);
const mockFormData: Record<string, { value: string | string[] }> = {};

jest.mock('../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: mockGetFieldValue,
    getFieldError: mockGetFieldError,
    updateField: mockUpdateField,
    formData: mockFormData,
  }),
}));

// Registro de las últimas props que recibió cada componente mockeado, para
// probar cosas que el DOM no expone (p. ej. `disabled` en el desplegable).
const mockUltimasProps: Record<string, unknown> = {};

// El componente vive dentro del layout de la landing y del rastreo de campos.
// Acá se prueba el mapeo de tipos, así que ambos se sustituyen por lo mínimo:
// sin esto `useLayout` revienta por falta de proveedor y no se renderiza nada.
jest.mock('../../../../context/LayoutContext', () => ({
  useLayout: () => ({ agreementData: null, landing: 'una-landing-cualquiera' }),
}));

jest.mock('../../../hooks/useFieldTracking', () => ({
  useFieldTracking: () => ({ onFieldFocus: jest.fn(), onFieldBlur: jest.fn() }),
}));

// Mock the field components
jest.mock('./TextInput', () => ({
  TextInput: ({ label, type, ...props }: { label: string; type?: string }) => (
    <div data-testid="text-input" data-type={type || 'text'}>
      <label>{label}</label>
      <input type={type || 'text'} {...props} />
    </div>
  ),
}));

jest.mock('./SegmentedControl', () => ({
  SegmentedControl: (props: { label: string; options: Array<{ value: string; label: string }>; disabled?: boolean }) => {
    mockUltimasProps['segmented-control'] = props;
    const { label, options } = props;
    return (
      <div data-testid="segmented-control">
        <label>{label}</label>
        <div data-option-count={options.length}>
          {options.map((opt) => (
            <button key={opt.value}>{opt.label}</button>
          ))}
        </div>
      </div>
    );
  },
}));

jest.mock('./RadioGroup', () => ({
  RadioGroup: (props: { label: string; options: Array<{ value: string; label: string }>; disabled?: boolean }) => {
    mockUltimasProps['radio-group'] = props;
    const { label, options } = props;
    return (
      <div data-testid="radio-group">
        <label>{label}</label>
        <div data-option-count={options.length}>
          {options.map((opt) => (
            <label key={opt.value}>
              <input type="radio" value={opt.value} />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    );
  },
}));

jest.mock('./SelectInput', () => ({
  SelectInput: ({ label, options, searchable }: { label: string; options: Array<{ value: string; label: string }>; searchable?: boolean }) => (
    <div data-testid="select-input" data-searchable={searchable ? 'true' : 'false'}>
      <label>{label}</label>
      <select>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

jest.mock('./CascadingSelectField', () => ({
  CascadingSelectField: (props: { field: { code: string; label: string }; searchable?: boolean; disabled?: boolean }) => {
    mockUltimasProps['cascading-select'] = props;
    const { field, searchable } = props;
    return (
      <div data-testid="cascading-select" data-searchable={searchable ? 'true' : 'false'}>
        <label>{field.label}</label>
      </div>
    );
  },
}));

jest.mock('./DateInput', () => ({
  DateInput: ({ label }: { label: string }) => (
    <div data-testid="date-input">
      <label>{label}</label>
      <input type="date" />
    </div>
  ),
}));

jest.mock('./FileUpload', () => ({
  FileUpload: ({ label }: { label: string }) => (
    <div data-testid="file-upload">
      <label>{label}</label>
      <input type="file" />
    </div>
  ),
}));

jest.mock('./TextArea', () => ({
  TextArea: ({ label }: { label: string }) => (
    <div data-testid="textarea">
      <label>{label}</label>
      <textarea />
    </div>
  ),
}));

// Import component after mocks
import { DynamicField } from './DynamicField';

// ============================================================================
// Test Factory
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

/** Última prop recibida por el mock del componente con ese testid. */
function ultimasPropsDe(testId: string): Record<string, unknown> {
  return (mockUltimasProps[testId] as Record<string, unknown>) ?? {};
}

/**
 * Renderiza `DynamicField` con un campo tipo lista. El código por defecto es
 * `lista` (no `test_field`, el de `createField`) porque estos casos sí
 * comprueban qué código viaja a `updateField`.
 */
function renderField(
  overrides: Partial<WizardField> = {},
  wizard: { updateField?: (...args: unknown[]) => void } = {}
) {
  if (wizard.updateField) {
    mockUpdateField.mockImplementation(wizard.updateField);
  }
  const field = createField({ code: 'lista', label: 'Lista', ...overrides });
  return render(<DynamicField field={field} />);
}

const dosOpciones = [
  { value: 'a', label: 'Opción A' },
  { value: 'b', label: 'Opción B' },
];
const seisOpciones = Array.from({ length: 6 }, (_, i) => ({ value: `op${i}`, label: `Opción ${i}` }));
const ochoOpciones = Array.from({ length: 8 }, (_, i) => ({ value: `op${i}`, label: `Opción ${i}` }));

// ============================================================================
// Tests
// ============================================================================

describe('DynamicField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFieldValue.mockReturnValue('');
    mockGetFieldError.mockReturnValue(undefined);
    mockUpdateField.mockImplementation(() => {});
    for (const key of Object.keys(mockUltimasProps)) delete mockUltimasProps[key];
  });

  describe('Type Mapping - Basic Text Inputs', () => {
    it('renders TextInput for type="text"', () => {
      const field = createField({ type: 'text', label: 'Nombre' });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('text-input')).toBeInTheDocument();
      expect(screen.getByTestId('text-input')).toHaveAttribute('data-type', 'text');
    });

    it('renders TextInput with type="email" for type="email"', () => {
      const field = createField({ type: 'email', label: 'Correo' });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('text-input')).toHaveAttribute('data-type', 'email');
    });

    it('renders TextInput with type="tel" for type="phone"', () => {
      const field = createField({ type: 'phone', label: 'Teléfono', prefix: '+51' });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('text-input')).toHaveAttribute('data-type', 'tel');
    });

    it('renders TextInput for type="document_number"', () => {
      const field = createField({ type: 'document_number', label: 'DNI' });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('text-input')).toHaveAttribute('data-type', 'text');
    });
  });

  describe('Type Mapping - Numeric Inputs', () => {
    it('renders TextInput with type="number" for type="currency"', () => {
      const field = createField({ type: 'currency', label: 'Monto', prefix: 'S/' });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('text-input')).toHaveAttribute('data-type', 'number');
    });

    it('renders TextInput with type="number" for type="number"', () => {
      const field = createField({ type: 'number', label: 'Cantidad' });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('text-input')).toHaveAttribute('data-type', 'number');
    });
  });

  describe('Type Mapping - Date Input', () => {
    it('renders DateInput for type="date"', () => {
      const field = createField({ type: 'date', label: 'Fecha de Nacimiento' });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('date-input')).toBeInTheDocument();
    });
  });

  describe('Type Mapping - Radio (Adaptive)', () => {
    it('renders SegmentedControl for radio with 2 options', () => {
      const field = createField({
        type: 'radio',
        label: 'Género',
        options: [
          { value: 'male', label: 'Masculino' },
          { value: 'female', label: 'Femenino' },
        ],
      });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('segmented-control')).toBeInTheDocument();
    });

    it('renders SegmentedControl for radio with 3 options', () => {
      const field = createField({
        type: 'radio',
        label: 'Documento',
        options: [
          { value: 'dni', label: 'DNI' },
          { value: 'ce', label: 'CE' },
          { value: 'passport', label: 'Pasaporte' },
        ],
      });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('segmented-control')).toBeInTheDocument();
    });

    it('renders RadioGroup for radio with 4-5 options', () => {
      const field = createField({
        type: 'radio',
        label: 'Situación Laboral',
        options: [
          { value: 'employed', label: 'Empleado' },
          { value: 'independent', label: 'Independiente' },
          { value: 'unemployed', label: 'Desempleado' },
          { value: 'retired', label: 'Jubilado' },
        ],
      });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    });

    it('renders SelectInput for radio with 6+ options', () => {
      const field = createField({
        type: 'radio',
        label: 'Ocupación',
        options: [
          { value: 'engineer', label: 'Ingeniero' },
          { value: 'doctor', label: 'Doctor' },
          { value: 'lawyer', label: 'Abogado' },
          { value: 'teacher', label: 'Profesor' },
          { value: 'accountant', label: 'Contador' },
          { value: 'other', label: 'Otro' },
        ],
      });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('select-input')).toBeInTheDocument();
      expect(screen.getByTestId('select-input')).toHaveAttribute('data-searchable', 'false');
    });
  });

  describe('Type Mapping - Select and Autocomplete', () => {
    // Un `select` estatico sigue la misma regla visual que un `radio`: con dos
    // o tres opciones se dibujan como botones, no como desplegable.
    it('renders SegmentedControl for a 2-option type="select"', () => {
      const field = createField({
        type: 'select',
        label: 'Departamento',
        options: [
          { value: 'lima', label: 'Lima' },
          { value: 'arequipa', label: 'Arequipa' },
        ],
      });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('segmented-control')).toBeInTheDocument();
    });

    it('renders a searchable CascadingSelectField for type="autocomplete"', () => {
      const field = createField({
        type: 'autocomplete',
        label: 'Distrito',
        options: [
          { value: 'miraflores', label: 'Miraflores' },
          { value: 'surco', label: 'Santiago de Surco' },
          { value: 'san_isidro', label: 'San Isidro' },
        ],
      });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('cascading-select')).toBeInTheDocument();
      expect(screen.getByTestId('cascading-select')).toHaveAttribute('data-searchable', 'true');
    });
  });

  // BAL-4383: la forma de una lista la puede elegir el panel (`display_mode`).
  // Con `display_mode` null/ausente, select y autocomplete se dibujan
  // exactamente igual que antes (casos arriba); estos casos cubren lo nuevo.
  describe('Type Mapping - Lista con forma elegida (BAL-4383)', () => {
    it('autocomplete con 2 opciones y sin forma sigue con buscador', () => {
      renderField({ type: 'autocomplete', options: dosOpciones });
      expect(screen.getByTestId('cascading-select')).toBeInTheDocument();
    });

    it('autocomplete con forma "auto" y 2 opciones se ve como botones', () => {
      renderField({ type: 'autocomplete', display_mode: 'auto', options: dosOpciones });
      expect(screen.getByTestId('segmented-control')).toBeInTheDocument();
    });

    it('select con forma "cards" y 8 opciones se ve como tarjetas', () => {
      renderField({ type: 'select', display_mode: 'cards', options: ochoOpciones });
      expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    });

    it('desplegable de 6+ opciones respeta el bloqueo (antes no recibía disabled)', () => {
      renderField({ type: 'select', options: seisOpciones, readonly: true });
      expect(ultimasPropsDe('cascading-select').disabled).toBe(true);
    });

    it('con una sola opción y autoselección, queda elegida', () => {
      const updateField = jest.fn();
      renderField({ type: 'select', auto_select_single: true, options: [{ value: 'u', label: 'Única' }] }, { updateField });
      expect(updateField).toHaveBeenCalledWith('lista', 'u', 'Única');
    });

    it('sin autoselección no elige nada solo', () => {
      const updateField = jest.fn();
      renderField({ type: 'select', options: [{ value: 'u', label: 'Única' }] }, { updateField });
      expect(updateField).not.toHaveBeenCalled();
    });
  });

  describe('Type Mapping - File Upload', () => {
    it('renders FileUpload for type="file"', () => {
      const field = createField({
        type: 'file',
        label: 'Documento de Identidad',
        accepted_file_types: '.pdf,.jpg,.png',
        max_files: 2,
      });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('file-upload')).toBeInTheDocument();
    });
  });

  describe('Type Mapping - Textarea', () => {
    it('renders TextArea for type="textarea"', () => {
      const field = createField({ type: 'textarea', label: 'Observaciones' });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('textarea')).toBeInTheDocument();
    });
  });

  describe('Type Mapping - Fallback', () => {
    it('renders TextInput for unknown type', () => {
      // @ts-expect-error - Testing unknown type
      const field = createField({ type: 'unknown_type', label: 'Unknown' });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('text-input')).toBeInTheDocument();
    });
  });

  /**
   * Quien decide QUE campos se dibujan es el paso (`DynamicWizardStep`): filtra
   * por `hidden` y por dependencias antes de montar nada. Este componente solo
   * elige COMO se dibuja lo que le llega, y por eso no vuelve a evaluar la
   * visibilidad; el unico caso que no dibuja es el tipo `hidden`, que existe
   * para guardar un valor sin pedirlo.
   */
  describe('Visibility', () => {
    it('renders nothing for type="hidden"', () => {
      const field = createField({ type: 'hidden', label: 'Campo oculto' });
      const { container } = render(<DynamicField field={field} />);

      expect(container).toBeEmptyDOMElement();
    });

    it('dibuja el campo aunque su dependencia no se cumpla: filtrar es del paso', () => {
      const field = createField({
        label: 'Conditional Field',
        dependency_groups: [
          {
            action: 'show',
            logic: 'and',
            conditions: [
              {
                depends_on_field: 'show_extra',
                operator: 'equals',
                value: 'yes',
              },
            ],
          },
        ],
      });

      render(<DynamicField field={field} />);
      expect(screen.getByTestId('text-input')).toBeInTheDocument();
    });
  });

  describe('Labels', () => {
    it('displays field label correctly', () => {
      const field = createField({ type: 'text', label: 'Nombre Completo' });
      render(<DynamicField field={field} />);

      expect(screen.getByText('Nombre Completo')).toBeInTheDocument();
    });
  });
});
