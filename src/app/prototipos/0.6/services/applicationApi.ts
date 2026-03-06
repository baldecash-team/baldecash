/**
 * Application API Service - BaldeCash v0.6
 * Service for submitting loan applications
 */

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

// ============================================
// Types
// ============================================

export interface SubmitApplicationRequest {
  /** Tracking session UUID */
  session_uuid: string;
  /** Form data collected from wizard steps */
  form_data: Record<string, string | number | boolean>;
  /** Product and pricing configuration - backend calculates final amounts */
  product_data: {
    product_id: number;
    variant_id?: number;
    term_months: number;
    initial_percent: number; // 0, 10, 20, 30 - backend calculates amounts
    unit_price?: number; // Hint for backend, will be validated against DB
    /** Multiple products for cart functionality */
    products?: {
      product_id: number;
      quantity: number;
      unit_price?: number;
      monthly_price?: number;  // Cuota mensual con intereses
      initial_percent?: number;
    }[];
    accessories?: {
      accessory_id: number;
    }[];
    insurance_id?: number;
  };
  /** Optional coupon code for discount */
  coupon_code?: string;
}

export interface SubmitApplicationResponse {
  success: boolean;
  application_id?: number;
  application_code?: string;
  public_token?: string;  // UUID for secure public URLs
  status?: string;
  error?: string;
  person_id?: number;
  discount_amount?: number;
}

export interface CheckPersonRequest {
  document_type: 'dni' | 'ce' | 'passport';
  document_number: string;
}

export interface CheckPersonResponse {
  exists: boolean;
  is_preapproved: boolean;
  prefill_data?: {
    nombres?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    email?: string;
    phone_mobile?: string;
  };
}

export interface SaveStepRequest {
  session_uuid: string;
  step_code: string;
  data: Record<string, string | number | boolean>;
}

export interface SaveStepResponse {
  success: boolean;
  lead_id?: number;
  error?: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Submit a complete loan application
 *
 * Creates or updates person record and creates the application
 * with all related data (products, accessories, employment, etc.)
 */
export async function submitApplication(
  data: SubmitApplicationRequest
): Promise<SubmitApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/form/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.detail || 'Error al enviar la solicitud',
      };
    }

    return result;
  } catch (error) {
    console.error('Error submitting application:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor intenta nuevamente.',
    };
  }
}

/**
 * Check if a person exists by document number
 *
 * Used to prefill form data and check preapproval status
 */
export async function checkPerson(
  data: CheckPersonRequest
): Promise<CheckPersonResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/form/check-person`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return {
        exists: false,
        is_preapproved: false,
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking person:', error);
    return {
      exists: false,
      is_preapproved: false,
    };
  }
}

/**
 * Save form step data (partial save)
 *
 * Allows users to save progress and continue later
 * Also updates lead scoring for marketing
 */
export async function saveFormStep(
  data: SaveStepRequest
): Promise<SaveStepResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/form/save-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.detail || 'Error al guardar el paso',
      };
    }

    return result;
  } catch (error) {
    console.error('Error saving form step:', error);
    return {
      success: false,
      error: 'Error de conexión. Por favor intenta nuevamente.',
    };
  }
}

/**
 * Application status response type
 */
export interface ApplicationStatusResponse {
  code: string;
  status: string;
  submitted_at: string | null;
  evaluated_at?: string | null;
  approved_at?: string | null;
  applicant_name?: string | null;

  // Products array (multiple products support)
  products?: Array<{
    name: string;
    image: string | null;
    quantity: number;
    unit_price: number;
    final_price: number;
    monthly_quota: number;
  }>;

  term_months?: number;

  accessories?: Array<{
    name: string;
    monthly_quota: number;
  }> | null;

  insurance?: {
    name: string;
    monthly_price: number;
  } | null;

  coupon?: {
    code: string;
    discount_amount: number;
  } | null;

  total_monthly_payment?: number;

  status_history: Array<{
    previous_status: string | null;
    new_status: string;
    reason_code: string | null;
    reason_text: string | null;
    changed_at: string | null;
  }>;
}

/**
 * Get application status by code
 *
 * Public endpoint for applicants to check their status
 */
export async function getApplicationStatus(
  code: string
): Promise<ApplicationStatusResponse | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/public/form/application/${encodeURIComponent(code)}/status`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching application status:', error);
    return null;
  }
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate document number format (client-side)
 */
export function validateDocumentNumber(
  documentNumber: string,
  documentType: 'dni' | 'ce' | 'passport' = 'dni'
): { isValid: boolean; message: string } {
  if (documentType === 'dni') {
    const isValid = documentNumber.length === 8 && /^\d+$/.test(documentNumber);
    return {
      isValid,
      message: isValid ? 'Válido' : 'DNI debe tener 8 dígitos',
    };
  }

  if (documentType === 'ce') {
    const isValid =
      documentNumber.length >= 9 && documentNumber.length <= 12;
    return {
      isValid,
      message: isValid ? 'Válido' : 'CE debe tener entre 9 y 12 caracteres',
    };
  }

  if (documentType === 'passport') {
    const isValid =
      documentNumber.length >= 6 && documentNumber.length <= 20;
    return {
      isValid,
      message: isValid ? 'Válido' : 'Pasaporte inválido',
    };
  }

  return { isValid: false, message: 'Tipo de documento desconocido' };
}

/**
 * Validate email format (client-side)
 */
export function validateEmail(email: string): { isValid: boolean; message: string } {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = pattern.test(email);
  return {
    isValid,
    message: isValid ? 'Email válido' : 'Formato de email inválido',
  };
}

/**
 * Validate Peruvian phone number (client-side)
 */
export function validatePhone(phone: string): {
  isValid: boolean;
  type: 'mobile' | 'landline' | 'unknown';
  message: string;
} {
  const cleanPhone = phone.replace(/[\s-]/g, '');

  const isMobile = cleanPhone.length === 9 && cleanPhone.startsWith('9');
  const isLandline =
    cleanPhone.length >= 7 &&
    cleanPhone.length <= 8 &&
    /^\d+$/.test(cleanPhone);

  if (isMobile) {
    return { isValid: true, type: 'mobile', message: 'Número válido' };
  }

  if (isLandline) {
    return { isValid: true, type: 'landline', message: 'Número válido' };
  }

  return { isValid: false, type: 'unknown', message: 'Número inválido' };
}
