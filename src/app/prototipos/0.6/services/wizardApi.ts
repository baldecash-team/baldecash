/**
 * Wizard API Service - BaldeCash v0.6
 * Servicio para consumir configuración de formularios dinámicos desde el backend
 */

import { getVipToken } from '../components/hero/DniModal';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

function appendVipToken(url: string, slug: string): string {
  if (typeof window === 'undefined') return url;
  const token = getVipToken(slug);
  if (!token) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}vip_token=${encodeURIComponent(token)}`;
}

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

export interface DependencyGroupCondition {
  depends_on_field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'is_empty' | 'is_not_empty'
    | 'greater_than' | 'less_than' | 'contains' | 'not_contains'
    | 'age_greater_than' | 'age_less_than';
  value: string | string[] | null;
}

export interface DependencyGroupActionParams {
  max_value?: number;
  min_value?: number;
  value?: string;
}

export interface DependencyGroup {
  action: 'show' | 'hide' | 'set_max' | 'set_min' | 'set_value';
  logic: 'and' | 'or';
  conditions: DependencyGroupCondition[];
  action_params?: DependencyGroupActionParams | null;
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
  type: 'text' | 'email' | 'phone' | 'document_number' | 'date' | 'radio' | 'select' | 'autocomplete' | 'file' | 'textarea' | 'currency' | 'number' | 'checkbox' | 'address' | 'address_autocomplete' | 'hidden';
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
  step?: number | null;
  pattern?: string | null;
  mask?: string | null;
  input_mode?: string | null;
  options_source?: string | null;
  options_filter?: Record<string, string> | null;
  options: WizardFieldOption[];
  validations: WizardFieldValidation[];
  dependency_groups: DependencyGroup[];
  accepted_file_types?: string | null;
  max_file_size_mb?: number | null;
  max_files: number | null;
  // Cascading selects (department → province → district)
  cascade_from?: string | null;    // Parent field code (e.g., "department")
  cascade_param?: string | null;   // Query param for API (e.g., "parent_id")
  // Lazy loading for large datasets (study-centers, careers)
  min_search_length?: number | null; // Minimum characters before searching
  // Dynamic validation from another field's option (e.g., document_number validated by document_type selection)
  validation_source_field?: string | null; // Field code whose selected option provides validation rules
  // Default value for auto-selection (e.g., "dni" for document_type)
  default_value?: string | null;
  // Address autocomplete configuration (Google Maps Places)
  address_config?: {
    country_restriction?: string;      // "pe" | "co" | "mx" etc.
    auto_fill_fields?: {               // Fields to auto-fill when address is selected
      department?: string;             // code of department field
      province?: string;               // code of province field
      district?: string;               // code of district field
      latitude?: string;               // code of lat field (hidden)
      longitude?: string;              // code of lng field (hidden)
    };
    show_use_location?: boolean;       // Show "Use my location" button
    require_selection?: boolean;       // Must select from suggestions
  } | null;
  // Prefill configuration. Two shapes coexist during the backend migration:
  // - Legacy: { prefill_fields: Record<target, source | source[]>, document_type_field }
  //   where the value is the API response key (or an array to concatenate).
  // - New:    { lookup_endpoint, fields_to_fill: string[], trigger }
  //   where each entry in fields_to_fill is both the target field code and the
  //   response key. Helpers below read whichever shape is present.
  prefill_config?: {
    // Legacy
    prefill_fields?: Record<string, string | string[]>;
    document_type_field?: string;
    // New
    lookup_endpoint?: string;
    fields_to_fill?: string[];
    trigger?: 'on_blur' | 'on_change';
  } | null;
}

/**
 * Returns the set of form field codes that a prefill_config will autocomplete,
 * regardless of whether the payload uses the legacy `prefill_fields` Record or
 * the new `fields_to_fill` array.
 */
export function getPrefillTargetFieldCodes(
  prefillConfig: WizardField['prefill_config']
): string[] {
  if (!prefillConfig) return [];
  if (prefillConfig.fields_to_fill?.length) return prefillConfig.fields_to_fill;
  if (prefillConfig.prefill_fields) return Object.keys(prefillConfig.prefill_fields);
  return [];
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

export interface WizardConfigLanding {
  id: number;
  slug: string;
  name: string;
  logo_url?: string | null;
}

export interface WizardConfigForm {
  id: number;
  code: string;
  name: string;
  estimated_time_minutes: number;
}

/**
 * WizardConfig supports two coexisting shapes from the backend during migration:
 * - Legacy flat: `landing_id`, `landing_slug`, `landing_name`, `display_steps_count`,
 *   `display_estimated_minutes`, `badge_text`.
 * - Nested: `landing: {...}`, `form: {...}`, `estimated_time_minutes` at root.
 * Both are optional; consumers should prefer nested values and fall back to flat.
 */
export interface WizardConfig {
  // Nested shape (new)
  landing?: WizardConfigLanding;
  form?: WizardConfigForm;
  estimated_time_minutes?: number;

  // Flat shape (legacy)
  landing_id?: number;
  landing_slug?: string;
  landing_name?: string;
  display_steps_count?: number;
  display_estimated_minutes?: number;
  badge_text?: string | null;
  total_fields?: number;

  // Shared
  steps: WizardStep[];
  total_steps?: number;
}

// ============================================================================
// API FUNCTION
// ============================================================================

/**
 * Obtiene la configuración del wizard para una landing
 */
export async function getWizardConfig(slug: string, previewKey?: string | null): Promise<WizardConfig | null> {
  try {
    let url = previewKey
      ? `${API_BASE_URL}/public/landing/${slug}/wizard?preview_key=${encodeURIComponent(previewKey)}`
      : `${API_BASE_URL}/public/landing/${slug}/wizard`;
    url = appendVipToken(url, slug);
    const response = await fetch(url, {
      ...(previewKey ? { cache: 'no-store' as const } : { next: { revalidate: 60 } }),
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 403) {
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
      if (response.status === 404 || response.status === 403) {
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
 *
 * ARQUITECTURA ESCALABLE:
 * - Soporta MÚLTIPLES pasos de resumen (is_summary_step=true)
 * - Los pasos regulares van primero, luego los pasos de resumen (ambos ordenados por 'order')
 * - La navegación funciona a través de toda la secuencia
 * - isLast es true SOLO para el último paso de la secuencia completa
 *
 * Esto permite:
 * - Un paso de resumen que continúa a otro paso
 * - Múltiples pasos de resumen en secuencia
 * - Determinar dinámicamente el texto del botón basado en navegación, no en tipo de paso
 */
export function getStepNavigation(config: WizardConfig, currentStepCode: string): {
  currentIndex: number;
  prevStep: WizardStep | null;
  nextStep: WizardStep | null;
  isFirst: boolean;
  isLast: boolean;
} {
  // Separar y ordenar pasos regulares y de resumen
  const regularSteps = config.steps.filter(s => !s.is_summary_step);
  const summarySteps = config.steps.filter(s => s.is_summary_step);

  const sortedRegularSteps = [...regularSteps].sort((a, b) => a.order - b.order);
  const sortedSummarySteps = [...summarySteps].sort((a, b) => a.order - b.order);

  // Secuencia completa: pasos regulares primero, luego pasos de resumen
  const fullSequence = [...sortedRegularSteps, ...sortedSummarySteps];

  // Buscar índice en la secuencia completa
  const currentIndex = fullSequence.findIndex(step => step.code === currentStepCode);

  if (currentIndex === -1) {
    // Paso no encontrado
    return {
      currentIndex: -1,
      prevStep: null,
      nextStep: null,
      isFirst: true,
      isLast: true,
    };
  }

  return {
    currentIndex,
    prevStep: currentIndex > 0 ? fullSequence[currentIndex - 1] : null,
    nextStep: currentIndex < fullSequence.length - 1 ? fullSequence[currentIndex + 1] : null,
    isFirst: currentIndex === 0,
    isLast: currentIndex === fullSequence.length - 1,
  };
}

/**
 * Evalúa si un campo debe mostrarse basado en sus dependency_groups.
 * Grupos con action=hide se evalúan primero (cualquier match = oculto).
 * Grupos con action=show: al menos un grupo debe cumplirse (OR entre grupos).
 */
export function evaluateFieldVisibility(
  field: WizardField,
  formValues: Record<string, string | string[]>
): boolean {
  if (!field.dependency_groups || field.dependency_groups.length === 0) {
    return true;
  }
  return evaluateGroupedVisibility(field.dependency_groups, formValues);
}

function evaluateGroupedVisibility(
  groups: DependencyGroup[],
  formValues: Record<string, string | string[]>
): boolean {
  const hideGroups = groups.filter(g => g.action === 'hide');
  const showGroups = groups.filter(g => g.action === 'show');

  // HIDE priority: any hide group fully met → hidden
  for (const group of hideGroups) {
    if (evaluateGroup(group, formValues)) return false;
  }

  // SHOW: at least one group must be fully met
  if (showGroups.length > 0) {
    return showGroups.some(g => evaluateGroup(g, formValues));
  }

  return true; // no show groups = visible by default
}

function evaluateGroup(
  group: DependencyGroup,
  formValues: Record<string, string | string[]>
): boolean {
  if (group.conditions.length === 0) return false;

  return group.logic === 'and'
    ? group.conditions.every(c => evaluateCondition(c, formValues))
    : group.conditions.some(c => evaluateCondition(c, formValues));
}

/**
 * Computes age in years from an ISO date string (YYYY-MM-DD).
 * Returns NaN if the input is empty or invalid.
 */
export function calculateAge(dateString: string): number {
  if (!dateString) return NaN;
  const birth = new Date(dateString + 'T12:00:00');
  if (isNaN(birth.getTime())) return NaN;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function evaluateCondition(
  cond: DependencyGroupCondition,
  formValues: Record<string, string | string[]>
): boolean {
  const raw = formValues[cond.depends_on_field];
  const fieldValue = raw != null ? String(raw).toLowerCase() : '';
  const depValue = cond.value != null ? String(cond.value).toLowerCase() : '';

  switch (cond.operator) {
    case 'equals':
      return fieldValue === depValue;
    case 'not_equals':
      return fieldValue !== depValue;
    case 'in':
      return Array.isArray(cond.value)
        && cond.value.map(v => String(v).toLowerCase()).includes(fieldValue);
    case 'not_in':
      return Array.isArray(cond.value)
        && !cond.value.map(v => String(v).toLowerCase()).includes(fieldValue);
    case 'is_empty':
      return !fieldValue;
    case 'is_not_empty':
      return !!fieldValue;
    case 'contains':
      return fieldValue.includes(depValue);
    case 'not_contains':
      return !fieldValue.includes(depValue);
    case 'greater_than':
      return parseFloat(fieldValue) > parseFloat(depValue);
    case 'less_than':
      return parseFloat(fieldValue) < parseFloat(depValue);
    case 'age_greater_than': {
      const age = calculateAge(String(raw ?? ''));
      return !isNaN(age) && age > parseFloat(depValue);
    }
    case 'age_less_than': {
      const age = calculateAge(String(raw ?? ''));
      return !isNaN(age) && age < parseFloat(depValue);
    }
    default:
      return false;
  }
}

/**
 * Returns the effective max_value for a numeric field, applying any
 * dependency_groups with action=set_max whose conditions are currently met.
 * When multiple set_max groups fire, the strictest (lowest) max wins.
 */
export function getEffectiveMaxValue(
  field: WizardField,
  formValues: Record<string, string | string[]>
): number | null {
  let effective: number | null = field.max_value ?? null;
  for (const group of field.dependency_groups || []) {
    if (group.action !== 'set_max') continue;
    if (!evaluateGroup(group, formValues)) continue;
    const newMax = group.action_params?.max_value;
    if (newMax == null) continue;
    effective = effective != null ? Math.min(effective, newMax) : newMax;
  }
  return effective;
}

/**
 * Returns the effective min_value for a numeric field, applying set_min groups.
 * When multiple set_min groups fire, the strictest (highest) min wins.
 */
export function getEffectiveMinValue(
  field: WizardField,
  formValues: Record<string, string | string[]>
): number | null {
  let effective: number | null = field.min_value ?? null;
  for (const group of field.dependency_groups || []) {
    if (group.action !== 'set_min') continue;
    if (!evaluateGroup(group, formValues)) continue;
    const newMin = group.action_params?.min_value;
    if (newMin == null) continue;
    effective = effective != null ? Math.max(effective, newMin) : newMin;
  }
  return effective;
}

/**
 * Returns the value this field must be locked to when any set_value
 * dependency group is currently satisfied, or null when the field is free.
 * The first matching group wins.
 */
export function getForcedValue(
  field: WizardField,
  formValues: Record<string, string | string[]>
): string | null {
  for (const group of field.dependency_groups || []) {
    if (group.action !== 'set_value') continue;
    if (!evaluateGroup(group, formValues)) continue;
    const forced = group.action_params?.value;
    if (forced != null) return String(forced);
  }
  return null;
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
 * @param field - Configuración del campo
 * @param value - Valor actual del campo
 * @param formValues - Valores de todos los campos del formulario
 * @param dynamicOptionsCache - Cache de opciones dinámicas con reglas de validación por opción
 */
export function validateField(
  field: WizardField,
  value: string | string[] | undefined,
  formValues: Record<string, string | string[]>,
  dynamicOptionsCache?: Record<string, CascadingOption[]>,
  skipVisibilityCheck?: boolean
): FieldValidationResult {
  // Si el campo no es visible, es válido (no validar campos ocultos)
  // Skip when caller already handled visibility (e.g., validateStep with prefill logic)
  if (!skipVisibilityCheck && !evaluateFieldVisibility(field, formValues)) {
    return { isValid: true, error: null };
  }

  // Normalizar valor
  const strValue = Array.isArray(value) ? value.join(',') : (value || '');
  const trimmedValue = strValue.trim();
  const isEmpty = !trimmedValue || (Array.isArray(value) && value.length === 0);

  // 1. Validación de requerido
  // Para checkbox simple, "false" cuenta como no marcado → requerido debe fallar
  if (field.required && field.type === 'checkbox' && !Array.isArray(value) && trimmedValue === 'false') {
    return { isValid: false, error: 'Debes marcar esta casilla para continuar' };
  }
  if (field.required && isEmpty) {
    return { isValid: false, error: 'Este campo es requerido' };
  }

  // Si está vacío y no es requerido, es válido
  if (isEmpty) {
    return { isValid: true, error: null };
  }

  // 2. Dynamic validation from source field (e.g., document_number validated by document_type)
  if (field.validation_source_field && dynamicOptionsCache) {
    const sourceFieldValue = formValues[field.validation_source_field] as string;
    const sourceOptions = dynamicOptionsCache[field.validation_source_field] || [];
    const selectedOption = sourceOptions.find((opt) => String(opt.value) === sourceFieldValue);

    if (selectedOption?.validation) {
      const v = selectedOption.validation;

      // Apply validation rules from the selected option
      if (v.min_length && trimmedValue.length < v.min_length) {
        return {
          isValid: false,
          error: v.error_message || `Mínimo ${v.min_length} caracteres`,
        };
      }

      if (v.max_length && trimmedValue.length > v.max_length) {
        return {
          isValid: false,
          error: v.error_message || `Máximo ${v.max_length} caracteres`,
        };
      }

      if (v.pattern) {
        try {
          const regex = new RegExp(v.pattern);
          if (!regex.test(trimmedValue)) {
            return {
              isValid: false,
              error: v.error_message || 'Formato inválido',
            };
          }
        } catch {
          // Invalid pattern, skip
        }
      }

      // If dynamic validation passed, skip static min/max_length validation
      return { isValid: true, error: null };
    }
  }

  // 3. Validaciones de longitud (propiedades directas del campo)
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
    const effectiveMin = getEffectiveMinValue(field, formValues);
    const effectiveMax = getEffectiveMaxValue(field, formValues);
    if (effectiveMin !== null && numValue < effectiveMin) {
      return { isValid: false, error: `El valor mínimo es ${effectiveMin}` };
    }
    if (effectiveMax !== null && numValue > effectiveMax) {
      return { isValid: false, error: `El valor máximo es ${effectiveMax}` };
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
      case 'required':
        // Already enforced by `field.required` above when the value is empty.
        break;

      case 'age_greater_than':
        if (validation.value) {
          const age = calculateAge(trimmedValue);
          if (!isNaN(age) && age <= parseFloat(validation.value)) {
            hasError = true;
          }
        }
        break;

      case 'age_less_than':
        if (validation.value) {
          const age = calculateAge(trimmedValue);
          if (!isNaN(age) && age >= parseFloat(validation.value)) {
            hasError = true;
          }
        }
        break;

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

      case 'not_equals_field':
        if (validation.value) {
          const otherValue = String(formValues[validation.value] || '').trim();
          if (otherValue && trimmedValue === otherValue) {
            hasError = true;
          }
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
 * @param step - Configuración del step
 * @param formValues - Valores de todos los campos
 * @param setFieldError - Función para setear error en un campo
 * @param dynamicOptionsCache - Cache de opciones dinámicas con reglas de validación
 */
export function validateStep(
  step: WizardStep,
  formValues: Record<string, string | string[]>,
  setFieldError: (fieldCode: string, error: string | null) => void,
  dynamicOptionsCache?: Record<string, CascadingOption[]>
): string | null {
  let firstErrorField: string | null = null;

  // Map prefill target fields to their trigger field code (the field that runs the lookup).
  // Works for both legacy (prefill_fields Record) and new (fields_to_fill array) shapes.
  const prefillFieldToDocField: Record<string, string> = {};
  for (const field of step.fields) {
    const targets = getPrefillTargetFieldCodes(field.prefill_config);
    for (const code of targets) {
      prefillFieldToDocField[code] = field.code;
    }
  }

  for (const field of step.fields) {
    // Compute effective visibility matching DynamicWizardStep logic
    let isVisible: boolean;
    const docFieldCode = prefillFieldToDocField[field.code];
    if (field.hidden && docFieldCode) {
      const prefillStatus = formValues[`_prefill_status_${docFieldCode}`] as string | undefined;
      if (prefillStatus === 'not_found') {
        isVisible = true;
      } else if (prefillStatus === 'found') {
        isVisible = formValues[`_prefill_empty_${field.code}`] === 'true';
      } else {
        isVisible = false;
      }
    } else if (field.hidden && (!field.dependency_groups || field.dependency_groups.length === 0)) {
      // hidden=true with no dependency groups = always hidden
      isVisible = false;
    } else {
      isVisible = evaluateFieldVisibility(field, formValues);
    }

    if (!isVisible) {
      setFieldError(field.code, null);
      continue;
    }

    const value = formValues[field.code];
    const result = validateField(field, value as string | string[] | undefined, formValues, dynamicOptionsCache, true);

    // Siempre actualizar el error (limpiar si es válido, setear si hay error)
    setFieldError(field.code, result.error);

    if (!result.isValid && !firstErrorField) {
      firstErrorField = field.code;
    }
  }

  return firstErrorField;
}

// ============================================================================
// CASCADING OPTIONS
// ============================================================================

/**
 * Validation rules that can be attached to select options
 * Used for dynamic field validation (e.g., document_number validation based on document_type)
 */
export interface OptionValidation {
  min_length?: number;
  max_length?: number;
  pattern?: string;
  input_mode?: string;
  placeholder?: string;
  error_message?: string;
}

export interface CascadingOption {
  value: string | number;
  label: string;
  code?: string;
  parent_id?: number;
  validation?: OptionValidation;
}

/**
 * Fetches options for a cascading select field
 * @param optionsSource - API path (e.g., "geo-units/provinces")
 * @param cascadeParam - Query param name (e.g., "parent_id")
 * @param parentValue - Value of parent field
 */
/**
 * Fetches options for a cascading select field (with parent dependency)
 * @param optionsSource - API path (e.g., "geo-units/provinces")
 * @param cascadeParam - Query param name (e.g., "parent_id")
 * @param parentValue - Value of parent field
 */
export async function fetchCascadingOptions(
  optionsSource: string,
  cascadeParam: string,
  parentValue: string | number
): Promise<CascadingOption[]> {
  try {
    const url = `${API_BASE_URL}/public/options/${optionsSource}?${cascadeParam}=${parentValue}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`Error fetching cascading options: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.options || [];
  } catch (error) {
    console.error('Error fetching cascading options:', error);
    return [];
  }
}

/**
 * Fetches options for a field with options_source but NO cascade dependency
 * Used for root-level selects like "department" that load all options on mount
 * @param optionsSource - API path (e.g., "geo-units/departments")
 */
export async function fetchOptionsFromSource(
  optionsSource: string,
  extraParams?: Record<string, string | number | undefined>
): Promise<CascadingOption[]> {
  try {
    const params = new URLSearchParams();
    if (extraParams) {
      for (const [key, value] of Object.entries(extraParams)) {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      }
    }
    const query = params.toString();
    const url = `${API_BASE_URL}/public/options/${optionsSource}${query ? `?${query}` : ''}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`Error fetching options from source: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.options || [];
  } catch (error) {
    console.error('Error fetching options from source:', error);
    return [];
  }
}

/**
 * Fetches options with search query (lazy loading)
 * Used for large datasets like study-centers (41k+) and careers (1100+)
 * @param optionsSource - API path (e.g., "study-centers", "careers")
 * @param searchTerm - Search query (min 3 characters)
 * @param filterType - Optional type filter (e.g., "university", "institute" for study-centers)
 */
export async function fetchOptionsWithSearch(
  optionsSource: string,
  searchTerm: string,
  filterType?: string
): Promise<CascadingOption[]> {
  try {
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    if (filterType) {
      params.append('type', filterType);
    }

    const url = `${API_BASE_URL}/public/options/${optionsSource}?${params.toString()}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`Error fetching options with search: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.options || [];
  } catch (error) {
    console.error('Error fetching options with search:', error);
    return [];
  }
}

/**
 * Fetches a single option by its ID
 * Used to resolve labels for existing data that doesn't have a saved label
 * @param optionsSource - API path (e.g., "study-centers", "careers", "geo-units/departments")
 * @param optionId - The ID of the option to fetch
 */
export async function fetchOptionById(
  optionsSource: string,
  optionId: string | number
): Promise<CascadingOption | null> {
  try {
    const url = `${API_BASE_URL}/public/options/${optionsSource}?id=${optionId}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`Error fetching option by ID: ${response.status}`);
      return null;
    }

    const data = await response.json();
    // API returns { options: [...] } - we expect single result when querying by ID
    const options = data.options || [];
    return options.length > 0 ? options[0] : null;
  } catch (error) {
    console.error('Error fetching option by ID:', error);
    return null;
  }
}

// ============================================================================
// GEO RESOLUTION - Convert Google Maps text names to GeoUnit IDs
// ============================================================================

export interface GeoResolvedUnit {
  id: number;
  label: string;
  code: string;
}

export interface GeoResolveResponse {
  department: GeoResolvedUnit | null;
  province: GeoResolvedUnit | null;
  district: GeoResolvedUnit | null;
}

/**
 * Resolve text geographic names (from Google Maps) to GeoUnit IDs.
 *
 * @param data - Text names from Google Places (department, province, district)
 * @returns Resolved GeoUnit IDs or null if request fails
 */
export async function resolveGeoUnits(
  data: { department: string; province?: string; district?: string }
): Promise<GeoResolveResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/options/geo-units/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
