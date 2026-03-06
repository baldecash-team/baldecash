/**
 * Wizard API Service - BaldeCash v0.6
 * Servicio para consumir configuración de formularios dinámicos desde el backend
 */

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

// ============================================================================
// TIPOS - Mapean la respuesta del endpoint /wizard
// ============================================================================

export interface WizardFieldOption {
  value: string;
  label: string;
  description?: string | null;
  icon?: string | null;
  visibility_conditions?: Record<string, string> | null;
}

export interface WizardFieldValidation {
  type: string;
  value?: string | null;
  message: string;
}

export interface WizardFieldDependency {
  depends_on_field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'is_empty' | 'is_not_empty' | 'greater_than' | 'less_than';
  value: string | string[] | null;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'unrequire';
}

export interface WizardMotivational {
  title: string;
  highlight: string;
  title_end: string;
  subtitle: string;
  illustration: string;
}

export interface WizardHelpText {
  title?: string | null;
  description?: string | null;
  recommendation?: string | null;
}

export interface WizardField {
  id: number;
  code: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'document_number' | 'date' | 'radio' | 'select' | 'autocomplete' | 'file' | 'textarea' | 'currency' | 'number' | 'checkbox';
  placeholder?: string | null;
  help_text?: WizardHelpText | null;
  required: boolean;
  readonly: boolean;
  hidden: boolean;
  grid_columns: number;
  grid_columns_mobile: number;
  prefix?: string | null;
  suffix?: string | null;
  min_length?: number | null;
  max_length?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  pattern?: string | null;
  mask?: string | null;
  input_mode?: string | null;
  options_source?: string | null;
  options_filter?: Record<string, string> | null;
  options: WizardFieldOption[];
  validations: WizardFieldValidation[];
  dependencies: WizardFieldDependency[];
  accepted_file_types?: string | null;
  max_file_size_mb?: number | null;
  max_files: number;
}

export interface WizardStep {
  id: number;
  code: string;
  url_slug: string | null; // URL-friendly slug for routing (e.g., "datos-personales")
  name: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  required: boolean;
  skippable: boolean;
  estimated_time_minutes: number;
  is_summary_step: boolean; // If true, step appears in summary page, not in progress bar
  motivational: WizardMotivational | null; // Motivational content for sidebar card
  fields: WizardField[];
}

export interface WizardConfig {
  landing_id: number;
  landing_slug: string;
  landing_name: string;
  steps: WizardStep[];
}

// ============================================================================
// API FUNCTION
// ============================================================================

/**
 * Obtiene la configuración del wizard para una landing
 */
export async function getWizardConfig(slug: string): Promise<WizardConfig | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/landing/${slug}/wizard`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching wizard config:', error);
    return null;
  }
}

/**
 * Obtiene la configuración del wizard para una landing por ID
 * Usado para preview en admin cuando se necesita acceder por ID + preview_key
 * @param landingId - Landing ID
 * @param previewKey - Hash de preview para acceder a landings no publicadas
 */
export async function getWizardConfigById(landingId: number, previewKey: string | null = null): Promise<WizardConfig | null> {
  try {
    const url = previewKey
      ? `${API_BASE_URL}/public/landing/id/${landingId}/wizard?preview_key=${encodeURIComponent(previewKey)}`
      : `${API_BASE_URL}/public/landing/id/${landingId}/wizard`;

    const response = await fetch(url, {
      cache: 'no-store', // Siempre no-store para preview por ID
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching wizard config by ID:', error);
    return null;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Obtiene un step por su código
 */
export function getStepByCode(config: WizardConfig, stepCode: string): WizardStep | undefined {
  return config.steps.find(step => step.code === stepCode);
}

/**
 * Obtiene el slug de URL para un step
 * Usa el url_slug del API (100% dinámico desde BD)
 */
export function getStepSlug(step: WizardStep): string {
  return step.url_slug || step.code;
}

/**
 * Obtiene el step por slug de URL
 * Busca primero por url_slug, luego por code como fallback
 */
export function getStepBySlug(config: WizardConfig, slug: string): WizardStep | undefined {
  // Buscar por url_slug (preferido)
  const byUrlSlug = config.steps.find(step => step.url_slug === slug);
  if (byUrlSlug) return byUrlSlug;

  // Fallback: buscar por code
  return config.steps.find(step => step.code === slug);
}

/**
 * Obtiene la navegación del wizard (prev/next) basado en el step actual
 */
export function getStepNavigation(config: WizardConfig, currentStepCode: string): {
  currentIndex: number;
  prevStep: WizardStep | null;
  nextStep: WizardStep | null;
  isFirst: boolean;
  isLast: boolean;
} {
  const sortedSteps = [...config.steps].sort((a, b) => a.order - b.order);
  const currentIndex = sortedSteps.findIndex(step => step.code === currentStepCode);

  return {
    currentIndex,
    prevStep: currentIndex > 0 ? sortedSteps[currentIndex - 1] : null,
    nextStep: currentIndex < sortedSteps.length - 1 ? sortedSteps[currentIndex + 1] : null,
    isFirst: currentIndex === 0,
    isLast: currentIndex === sortedSteps.length - 1,
  };
}

/**
 * Evalúa si un campo debe mostrarse basado en sus dependencias
 */
export function evaluateFieldVisibility(
  field: WizardField,
  formValues: Record<string, string | string[]>
): boolean {
  // Si no tiene dependencias, siempre visible (excepto si hidden=true)
  if (field.dependencies.length === 0) {
    return !field.hidden;
  }

  // Evaluar cada dependencia con acción 'show' o 'hide'
  for (const dep of field.dependencies) {
    const fieldValue = formValues[dep.depends_on_field];
    let conditionMet = false;

    switch (dep.operator) {
      case 'equals':
        conditionMet = fieldValue === dep.value;
        break;
      case 'not_equals':
        conditionMet = fieldValue !== dep.value;
        break;
      case 'in':
        if (Array.isArray(dep.value)) {
          conditionMet = dep.value.includes(fieldValue as string);
        }
        break;
      case 'not_in':
        if (Array.isArray(dep.value)) {
          conditionMet = !dep.value.includes(fieldValue as string);
        }
        break;
      case 'is_empty':
        conditionMet = !fieldValue || fieldValue === '';
        break;
      case 'is_not_empty':
        conditionMet = !!fieldValue && fieldValue !== '';
        break;
      default:
        conditionMet = false;
    }

    // Aplicar acción
    if (dep.action === 'show') {
      return conditionMet;
    } else if (dep.action === 'hide') {
      return !conditionMet;
    }
  }

  return !field.hidden;
}

/**
 * Filtra opciones de un campo basado en visibility_conditions
 */
export function filterFieldOptions(
  field: WizardField,
  formValues: Record<string, string | string[]>
): WizardFieldOption[] {
  return field.options.filter(option => {
    // Si no tiene conditions, siempre visible
    if (!option.visibility_conditions) {
      return true;
    }

    // Evaluar cada condition (AND logic)
    for (const [fieldCode, expectedValue] of Object.entries(option.visibility_conditions)) {
      const actualValue = formValues[fieldCode];
      if (actualValue !== expectedValue) {
        return false;
      }
    }

    return true;
  });
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Resultado de validación de un campo
 */
export interface FieldValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Valida un campo individual usando la configuración del API
 */
export function validateField(
  field: WizardField,
  value: string | string[] | undefined,
  formValues: Record<string, string | string[]>
): FieldValidationResult {
  // Si el campo no es visible, es válido (no validar campos ocultos)
  if (!evaluateFieldVisibility(field, formValues)) {
    return { isValid: true, error: null };
  }

  // Normalizar valor
  const strValue = Array.isArray(value) ? value.join(',') : (value || '');
  const trimmedValue = strValue.trim();
  const isEmpty = !trimmedValue || (Array.isArray(value) && value.length === 0);

  // 1. Validación de requerido
  if (field.required && isEmpty) {
    return { isValid: false, error: 'Este campo es requerido' };
  }

  // Si está vacío y no es requerido, es válido
  if (isEmpty) {
    return { isValid: true, error: null };
  }

  // 2. Validaciones de longitud (propiedades directas del campo)
  if (field.min_length && trimmedValue.length < field.min_length) {
    return { isValid: false, error: `Mínimo ${field.min_length} caracteres` };
  }

  if (field.max_length && trimmedValue.length > field.max_length) {
    return { isValid: false, error: `Máximo ${field.max_length} caracteres` };
  }

  // 3. Validaciones numéricas (para currency/number)
  if (field.type === 'currency' || field.type === 'number') {
    const numValue = Number(trimmedValue);
    if (isNaN(numValue)) {
      return { isValid: false, error: 'Ingresa un valor numérico válido' };
    }
    if (field.min_value !== null && field.min_value !== undefined && numValue < field.min_value) {
      return { isValid: false, error: `El valor mínimo es ${field.min_value}` };
    }
    if (field.max_value !== null && field.max_value !== undefined && numValue > field.max_value) {
      return { isValid: false, error: `El valor máximo es ${field.max_value}` };
    }
  }

  // 4. Validación de pattern (regex)
  if (field.pattern) {
    try {
      const regex = new RegExp(field.pattern);
      if (!regex.test(trimmedValue)) {
        return { isValid: false, error: 'Formato inválido' };
      }
    } catch {
      // Si el pattern es inválido, ignorar
    }
  }

  // 5. Validaciones del array validations[] del API
  for (const validation of field.validations) {
    let hasError = false;
    let errorMessage = validation.message;

    switch (validation.type) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
          hasError = true;
        }
        break;

      case 'phone':
        if (!/^\d{9}$/.test(trimmedValue)) {
          hasError = true;
        }
        break;

      case 'dni':
        // Validación dinámica según tipo de documento
        const docType = formValues['document_type'] as string;
        if (docType === 'dni' && !/^\d{8}$/.test(trimmedValue)) {
          hasError = true;
          errorMessage = 'El DNI debe tener 8 dígitos';
        } else if (docType === 'ce' && !/^\d{9}$/.test(trimmedValue)) {
          hasError = true;
          errorMessage = 'El CE debe tener 9 dígitos';
        } else if (docType === 'pasaporte' && !/^[a-zA-Z0-9]{6,12}$/.test(trimmedValue)) {
          hasError = true;
          errorMessage = 'El pasaporte debe tener entre 6 y 12 caracteres';
        }
        break;

      case 'min_length':
        if (validation.value && trimmedValue.length < parseInt(validation.value)) {
          hasError = true;
        }
        break;

      case 'max_length':
        if (validation.value && trimmedValue.length > parseInt(validation.value)) {
          hasError = true;
        }
        break;

      case 'min_value':
        if (validation.value && Number(trimmedValue) < parseFloat(validation.value)) {
          hasError = true;
        }
        break;

      case 'max_value':
        if (validation.value && Number(trimmedValue) > parseFloat(validation.value)) {
          hasError = true;
        }
        break;

      case 'regex':
      case 'pattern':
        if (validation.value) {
          try {
            const regex = new RegExp(validation.value);
            if (!regex.test(trimmedValue)) {
              hasError = true;
            }
          } catch {
            // Si el pattern es inválido, ignorar
          }
        }
        break;
    }

    if (hasError) {
      return { isValid: false, error: errorMessage };
    }
  }

  // Pasó todas las validaciones
  return { isValid: true, error: null };
}

/**
 * Valida todos los campos de un step
 * Retorna el código del primer campo con error, o null si todo es válido
 */
export function validateStep(
  step: WizardStep,
  formValues: Record<string, string | string[]>,
  setFieldError: (fieldCode: string, error: string | null) => void
): string | null {
  let firstErrorField: string | null = null;

  for (const field of step.fields) {
    const value = formValues[field.code];
    const result = validateField(field, value as string | string[] | undefined, formValues);

    // Siempre actualizar el error (limpiar si es válido, setear si hay error)
    setFieldError(field.code, result.error);

    if (!result.isValid && !firstErrorField) {
      firstErrorField = field.code;
    }
  }

  return firstErrorField;
}
