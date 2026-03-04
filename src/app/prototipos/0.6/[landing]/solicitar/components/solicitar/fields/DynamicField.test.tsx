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
import userEvent from '@testing-library/user-event';
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
  SegmentedControl: ({ label, options }: { label: string; options: Array<{ value: string; label: string }> }) => (
    <div data-testid="segmented-control">
      <label>{label}</label>
      <div data-option-count={options.length}>
        {options.map((opt) => (
          <button key={opt.value}>{opt.label}</button>
        ))}
      </div>
    </div>
  ),
}));

jest.mock('./RadioGroup', () => ({
  RadioGroup: ({ label, options }: { label: string; options: Array<{ value: string; label: string }> }) => (
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
  ),
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
    dependencies: [],
    accepted_file_types: null,
    max_file_size_mb: null,
    max_files: 1,
    ...overrides,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('DynamicField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFieldValue.mockReturnValue('');
    mockGetFieldError.mockReturnValue(undefined);
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
    it('renders SelectInput for type="select"', () => {
      const field = createField({
        type: 'select',
        label: 'Departamento',
        options: [
          { value: 'lima', label: 'Lima' },
          { value: 'arequipa', label: 'Arequipa' },
        ],
      });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('select-input')).toBeInTheDocument();
      expect(screen.getByTestId('select-input')).toHaveAttribute('data-searchable', 'false');
    });

    it('renders SelectInput with searchable=true for type="autocomplete"', () => {
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

      expect(screen.getByTestId('select-input')).toBeInTheDocument();
      expect(screen.getByTestId('select-input')).toHaveAttribute('data-searchable', 'true');
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
      // @ts-ignore - Testing unknown type
      const field = createField({ type: 'unknown_type', label: 'Unknown' });
      render(<DynamicField field={field} />);

      expect(screen.getByTestId('text-input')).toBeInTheDocument();
    });
  });

  describe('Visibility', () => {
    it('does not render when field is hidden', () => {
      const field = createField({ hidden: true, label: 'Hidden Field' });
      const { container } = render(<DynamicField field={field} />);

      expect(container).toBeEmptyDOMElement();
    });

    it('does not render when conditional visibility is false', () => {
      const field = createField({
        label: 'Conditional Field',
        dependencies: [
          {
            depends_on_field: 'show_extra',
            operator: 'equals',
            value: 'yes',
            action: 'show',
          },
        ],
      });

      // formData doesn't have show_extra = 'yes', so field should be hidden
      const { container } = render(<DynamicField field={field} />);
      expect(container).toBeEmptyDOMElement();
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
