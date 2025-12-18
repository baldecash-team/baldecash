/**
 * Types for Form Fields - BaldeCash Web 3.0
 * Section C.1 - Form Components
 */

// ============================================
// FIELD CONFIGURATION
// ============================================

export interface FieldConfig {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'select' | 'checkbox' | 'radio' | 'file' | 'date';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  validation: ValidationRule[];
  mask?: string;
  autoComplete?: string;
  dependsOn?: string;
  options?: FieldOption[];
  maxLength?: number;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom' | 'email' | 'phone' | 'dni';
  value?: string | number | RegExp;
  message: string;
}

export interface FieldOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
}

export interface FieldState {
  value: string | number | boolean | string[];
  touched: boolean;
  dirty: boolean;
  valid: boolean;
  errors: string[];
}

// ============================================
// FILE UPLOAD
// ============================================

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

// ============================================
// WIZARD CONFIGURATION
// ============================================

export interface WizardConfig {
  // C1.1 - Label style
  labelVersion: 1 | 2 | 3;
  // C1.4 - Input style
  inputVersion: 1 | 2 | 3;
  // C1.13 - Radio/Option style
  radioVersion: 1 | 2 | 3;
  // C1.15 - Upload style
  uploadVersion: 1 | 2 | 3;
  // C1.16 - File preview style
  previewVersion: 1 | 2 | 3;
  // C1.17 - Progress bar style
  progressVersion: 1 | 2 | 3;
  // C1.21 - Validation on submit
  validationSubmitVersion: 1 | 2 | 3;
  // C1.23 - Error message position
  errorMessageVersion: 1 | 2 | 3;
  // C1.24 - Error styling
  errorStyleVersion: 1 | 2 | 3;
  // C1.28 - Help display
  helpVersion: 1 | 2 | 3;
  // C1.29 - Document examples
  documentExampleVersion: 1 | 2 | 3;
}

export const defaultWizardConfig: WizardConfig = {
  labelVersion: 1,
  inputVersion: 1,
  radioVersion: 1,
  uploadVersion: 1,
  previewVersion: 1,
  progressVersion: 1,
  validationSubmitVersion: 1,
  errorMessageVersion: 1,
  errorStyleVersion: 1,
  helpVersion: 1,
  documentExampleVersion: 1,
};

// Version descriptions for settings modal
export const versionDescriptions = {
  label: {
    1: 'Label arriba (siempre visible)',
    2: 'Label flotante (moderno, ahorra espacio)',
    3: 'Solo placeholder (minimalista)',
  },
  input: {
    1: 'Bordes completos (clásico)',
    2: 'Línea inferior (Material Design)',
    3: 'Fondo filled sin bordes (moderno)',
  },
  radio: {
    1: 'Radio buttons tradicionales',
    2: 'Segmented control (tabs)',
    3: 'Cards clickeables',
  },
  upload: {
    1: 'Drag & drop prominente + botón',
    2: 'Solo botón (más simple)',
    3: 'Área drag & drop clickeable',
  },
  preview: {
    1: 'Thumbnail de imagen/PDF',
    2: 'Solo nombre + tamaño + X',
    3: 'Preview en modal al click',
  },
  progress: {
    1: 'Barra horizontal con porcentaje',
    2: 'Spinner con porcentaje',
    3: 'Sin barra (solo estado)',
  },
  validationSubmit: {
    1: 'Mostrar todos los errores arriba',
    2: 'Scroll al primer error',
    3: 'Shake en campos con error',
  },
  errorMessage: {
    1: 'Debajo del campo (inline)',
    2: 'Tooltip al hover/focus',
    3: 'Resumen arriba + inline',
  },
  errorStyle: {
    1: 'Borde rojo',
    2: 'Borde rojo + fondo rojo suave',
    3: 'Solo mensaje rojo (menos agresivo)',
  },
  help: {
    1: 'Tooltip al hover/click',
    2: 'Texto siempre visible debajo',
    3: 'Expandible "¿Necesitas ayuda?"',
  },
  documentExample: {
    1: 'Imagen de ejemplo en tooltip',
    2: 'Gallery de ejemplos en modal',
    3: 'Inline pequeño al lado',
  },
};

// ============================================
// COMPONENT PROPS
// ============================================

export interface BaseInputProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  error?: string;
  isValid?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  maxLength?: number;
}

export interface SelectProps extends Omit<BaseInputProps, 'value' | 'onChange'> {
  options: FieldOption[];
  value: string;
  onChange: (value: string) => void;
  searchable?: boolean;
  loading?: boolean;
}

export interface CheckboxProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
}

export interface RadioGroupProps {
  name: string;
  label: string;
  options: FieldOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  maxSize?: number;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  error?: string;
  helpText?: string;
  multiple?: boolean;
}
