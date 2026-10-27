/**
 * Application API Service - BaldeCash v0.6
 * Service for submitting loan applications
 */

import * as Sentry from '@sentry/nextjs';
import {
  mensajeDelError,
  detalleNoEsTexto,
  MENSAJE_ERROR_GENERICO,
  MENSAJE_ERROR_INESPERADO,
  MENSAJE_ENVIO_SIN_CONFIRMAR,
  ERROR_CODE_ENVIO_SIN_CONFIRMAR,
} from './mensajeDelError';

/**
 * Tope del envío. Sin él, una conexión colgada deja a la persona mirando
 * "Esto está tardando…" para siempre. Es largo a propósito: el envío puede
 * llevar archivos, y ws2 es idempotente por sesión si la persona reintenta.
 */
export const TIEMPO_MAXIMO_ENVIO_MS = 120_000;

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

// ============================================
// Types
// ============================================

/** File to upload with the application */
export interface UploadedFileData {
  /** Field code (e.g., "dni_front", "payslip") - used for DocumentType matching */
  fieldCode: string;
  /** The actual File object */
  file: File;
}

export interface SubmitApplicationRequest {
  /** Tracking session UUID */
  session_uuid: string;
  /**
   * Form data collected from wizard steps. `string[]` es para las opciones
   * marcadas de una casilla de selección múltiple (BAL-4354) — el resto de
   * campos sigue siendo escalar.
   */
  form_data: Record<string, string | number | boolean | string[]>;
  /** Product and pricing configuration - backend calculates final amounts */
  product_data: {
    product_id: number;
    variant_id?: number;
    /**
     * Combo de la card elegida, o `null` si el cliente compro el producto suelto.
     * SIEMPRE se envia, incluido el `null`: el backend necesita distinguir "eligio
     * el pelado" de "este front no lo manda". Sin el, cae a una heuristica por
     * precio que no ve los combos de regalo (mismo precio que el equipo solo).
     */
    combo_id?: number | null;
    /** Raw term in native units of payment_frequency (weeks / fortnights / months). */
    term: number;
    /** Term normalized to months (12 for 24 quincenas, etc.). */
    term_months: number;
    initial_percent: number; // 0, 10, 20, 30 - backend calculates amounts
    /** Initial payment amount in soles (hint for backend; it still recomputes). */
    initial_amount?: number;
    /**
     * En cuantas armadas se cobra la inicial: 1 (pago unico), 2 o 4.
     *
     * Es un fallback, no la fuente de verdad: manda la celda del pricing y el
     * backend solo mira esto si la celda no configuro armadas. Ademas lo sanea
     * a {2,4}, asi que un valor cualquiera degrada a pago unico.
     */
    initial_installments?: number;
    unit_price?: number; // Hint for backend, will be validated against DB
    /** Payment frequency of the primary product: 'semanal' | 'quincenal' | 'mensual' */
    payment_frequency?: string;
    /** Multiple products for cart functionality */
    products?: {
      product_id: number;
      variant_id?: number;  // Color/variant selection
      /** Combo de la card elegida para este item, o `null` si es el producto suelto. */
      combo_id?: number | null;
      quantity: number;
      unit_price?: number;
      monthly_price?: number;  // Cuota mensual con intereses
      /** Raw term in native units of payment_frequency. */
      term?: number;
      /** Term normalized to months. */
      term_months?: number;
      initial_percent?: number;
      initial_amount?: number;
      payment_frequency?: string;
    }[];
    accessories?: {
      accessory_id: number;
    }[];
    insurance_id?: number;
    insurance_ids?: number[];
    /** Token del link especial (equipo no visible). Solo si el pase abrió este producto. */
    special_link_token?: string;
  };
  /** Optional coupon code for discount */
  coupon_code?: string;
  /**
   * `form_id` del formulario que el wizard le mostró a esta sesión (varios
   * formularios por landing, repartidos por peso). Viaja para que la
   * solicitud se guarde con ESE formulario aunque el reparto cambie mientras
   * la persona lo está llenando. Se omite si no se conoce el formulario.
   */
  wizard_form_id?: number;
  /**
   * `form_version_id` del MISMO objeto de config de donde salió `wizard_form_id`,
   * para que ambos siempre describan la misma respuesta del wizard. Se omite
   * si no se conoce la versión.
   */
  wizard_form_version_id?: number;
  /**
   * Casillas de consentimiento que marcó la persona (BAL-5007). Viajan en la
   * RAÍZ del JSON, al lado de `form_data`: ws2 escribe una fila en
   * `application_consent` por cada una en `true`. Se omite si no hay ningún
   * dato — nunca se rellena con `true` — y ws2 lo avisa a Sentry.
   */
  consents?: { terms: boolean; privacy: boolean; promos: boolean };
  /** Optional files to upload (e.g., DNI, payslips) */
  files?: UploadedFileData[];
}

export interface UploadedDocument {
  field_code: string;
  file_name: string;
  s3_key: string;
  document_type: string | null;
  size_kb: number;
}

export interface SubmitApplicationResponse {
  success: boolean;
  application_id?: number;
  application_code?: string;
  public_token?: string;  // UUID for secure public URLs
  /**
   * Token del KYC emitido en el submit: el mismo del link de "continuar
   * despues" (hasheado, con TTL, revocable). Sirve de prueba de titularidad
   * para que el KYC no tenga que pedir el DNI.
   *
   * Opcional a proposito: el mint es best-effort y nunca bloquea el submit, asi
   * que el front debe caer a la ruta por `application_code` si no llega.
   */
  kyc_resume_token?: string;
  kyc_resume_url?: string;
  kyc_resume_expires_at?: string;
  status?: string;
  error?: string;
  error_code?: string;
  person_id?: number;
  discount_amount?: number;
  /** Document upload results */
  documents?: {
    uploaded_count: number;
    uploaded: UploadedDocument[];
    errors: Array<{ field_code: string; error: string }> | null;
  };
  documents_error?: string;
}

export interface CheckPersonRequest {
  document_type: 'dni' | 'ce' | 'passport';
  document_number: string;
  /** Slug de la landing (p. ej. "canal-preferente"). El backend lo usa para evaluar whitelist. */
  landing_slug?: string;
}

/** Resultado de whitelist devuelto por check-person. allowed=false bloquea el flujo. */
export interface CheckPersonWhitelist {
  allowed: boolean;
  message: string;
  /** true si el DNI esta invitado a otra landing del mismo `whitelist_group`. */
  found_in_sibling?: boolean;
  /** Slug de esa landing hermana, para ofrecer ir alla en vez de rechazar. */
  sibling_landing_slug?: string | null;
  sibling_landing_name?: string | null;
  /** Nombre de pila en la whitelist de la hermana. Puede venir vacio. */
  first_name?: string | null;
}

export interface PrefillData {
  first_name: string | null;
  paternal_surname: string | null;
  maternal_surname: string | null;
  birth_date: string | null;
  gender: 'male' | 'female' | null;
  source: 'person' | 'equifax_cache' | 'equifax_api';
}

export interface CheckPersonResponse {
  exists: boolean;
  prefill_data: PrefillData | null;
  /** Si viene con allowed=false, el flujo se bloquea mostrando `message`. */
  whitelist?: CheckPersonWhitelist | null;
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
 *
 * Always uses multipart/form-data for consistency.
 * Files are optional but the format is always multipart.
 */
export async function submitApplication(
  data: SubmitApplicationRequest
): Promise<SubmitApplicationResponse> {
  try {
    // Always use multipart/form-data
    const formData = new FormData();

    // Add JSON data as form_data field
    const jsonData = {
      session_uuid: data.session_uuid,
      form_data: data.form_data,
      product_data: data.product_data,
      coupon_code: data.coupon_code,
      // Se omite la clave por completo si no se conoce el formulario mostrado, para no cambiar el payload de las
      // landings que todavía no reparten varios formularios.
      ...(data.wizard_form_id !== undefined
        ? { wizard_form_id: data.wizard_form_id }
        : {}),
      ...(typeof data.wizard_form_version_id === 'number'
        ? { wizard_form_version_id: data.wizard_form_version_id }
        : {}),
      // Sin dato no se manda la clave: un `consents: null` o vacío se leería
      // igual que "no aceptó nada", y lo que ws2 tiene que ver es que falta.
      ...(data.consents ? { consents: data.consents } : {}),
    };
    formData.append('form_data', JSON.stringify(jsonData));

    // Add files if any, with "file__" prefix for field identification
    if (data.files && data.files.length > 0) {
      for (const uploadedFile of data.files) {
        // Get file extension from original filename
        const ext = uploadedFile.file.name.split('.').pop() || '';
        // Create filename with field code prefix: file__dni_front.jpg
        const filename = `file__${uploadedFile.fieldCode}.${ext}`;
        formData.append('files', uploadedFile.file, filename);
      }
    }

    const controlador = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const temporizador = controlador ? setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_ENVIO_MS) : null;
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/public/form/submit`, {
        method: 'POST',
        // Don't set Content-Type header - browser will set it with boundary
        body: formData,
        ...(controlador ? { signal: controlador.signal } : {}),
      });
    } catch (error) {
      // Sin respuesta: el POST pudo haber llegado y la solicitud estar
      // creándose (ver MENSAJE_ENVIO_SIN_CONFIRMAR). Ni el corte por tiempo ni
      // el de red se dicen como "error de conexión, intenta nuevamente".
      const porTiempo = (error as { name?: string })?.name === 'AbortError';
      if (porTiempo) {
        Sentry.captureMessage('submit: el envío superó el tiempo máximo', {
          level: 'warning',
          tags: { modulo: 'solicitud', accion: 'submit' },
        });
      } else {
        Sentry.captureException(error, {
          tags: { modulo: 'solicitud', accion: 'submit', motivo: 'sin_respuesta' },
          extra: { session_uuid: data.session_uuid },
        });
      }
      return {
        success: false,
        error: MENSAJE_ENVIO_SIN_CONFIRMAR,
        error_code: ERROR_CODE_ENVIO_SIN_CONFIRMAR,
      };
    } finally {
      if (temporizador) clearTimeout(temporizador);
    }

    // Un 500/502 con cuerpo HTML no es JSON: no es "error de conexión", es
    // del servidor. Se lee aparte para no confundirlos (BAL-4969).
    let result: Record<string, unknown> | null = null;
    try {
      result = await response.json();
    } catch {
      result = null;
    }

    // 502/503/504 los pone el balanceador, no ws2: corta la conexión mientras
    // el submit sigue corriendo atrás y la solicitud puede terminar creada.
    if ([502, 503, 504].includes(response.status)) {
      Sentry.captureMessage('submit: el balanceador cortó el envío', {
        level: 'warning',
        tags: { modulo: 'solicitud', accion: 'submit', status: String(response.status) },
        extra: { session_uuid: data.session_uuid },
      });
      return {
        success: false,
        error: MENSAJE_ENVIO_SIN_CONFIRMAR,
        error_code: ERROR_CODE_ENVIO_SIN_CONFIRMAR,
      };
    }

    if (!response.ok) {
      const detail = result?.detail ?? result?.message;
      // `detail` como lista (422) u objeto: se convierte a texto y se avisa.
      if (detalleNoEsTexto(result?.detail)) {
        Sentry.captureMessage('submit: detail del error no es texto', {
          level: 'warning',
          tags: { modulo: 'solicitud', accion: 'submit', status: String(response.status) },
          extra: { detail: result?.detail, error_code: result?.error_code ?? null },
        });
      }
      return {
        success: false,
        error: mensajeDelError(response.status, detail),
        // El 400 del submit trae el motivo en `error_code` junto a `detail`
        // (OUT_OF_STOCK, COUPON_USER_LIMIT_REACHED, ...). Sin pasarlo acá,
        // useSubmitApplication no puede elegir el mensaje y la analítica
        // registra `unknown`: así se perdió el caso del DNI 60477990
        // (21/22-09-2026, 27 envíos fallidos, todos `unknown`).
        error_code: typeof result?.error_code === 'string' ? result.error_code : undefined,
      };
    }

    if (!result) return { success: false, error: MENSAJE_ERROR_GENERICO };
    return result as unknown as SubmitApplicationResponse;
  } catch (error) {
    // Acá ya no llega la red (eso se resuelve arriba): es un error del código
    // que arma el envío. Decir "error de conexión" mandaba a buscar el
    // problema en el wifi de la persona.
    console.error('Error submitting application:', error);
    Sentry.captureException(error, {
      tags: { modulo: 'solicitud', accion: 'submit', motivo: 'excepcion_cliente' },
    });
    return {
      success: false,
      error: MENSAJE_ERROR_INESPERADO,
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
        prefill_data: null,
        whitelist: null,
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking person:', error);
    return {
      exists: false,
      prefill_data: null,
      whitelist: null,
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
  /** Ver `ApplicationStatusData.reference`: el numero que se le muestra al cliente. */
  reference?: string | null;
  code: string;
  status: string;
  submitted_at: string | null;
  evaluated_at?: string | null;
  approved_at?: string | null;
  applicant_name?: string | null;
  /** Celular del titular enmascarado ("9XX XXX 321"), para "al +51 …" (BAL-4969). */
  applicant_phone_masked?: string | null;

  // Products array (multiple products support)
  products?: Array<{
    name: string;
    image: string | null;
    quantity: number;
    unit_price: number;
    final_price: number;
    monthly_quota: number;
    // Variant/Color info
    variant?: {
      id: number;
      color_name: string;
      color_hex: string;
    } | null;
  }>;

  /**
   * Número real de cuotas en la frecuencia natural (`payment_frequency`).
   * BE lo emite desde Phase 5.2 — preferirlo sobre `term_months`.
   */
  term?: number;
  /** @deprecated Usar `term` + `payment_frequency`. Para no-mensual no es nº de cuotas. */
  term_months?: number;
  /** Payment frequency of the primary product: 'semanal' | 'quincenal' | 'mensual' */
  payment_frequency?: string;

  // Initial payment info (NEW - for coherent data display)
  initial_payment_percent?: number;
  initial_payment?: number;

  accessories?: Array<{
    name: string;
    monthly_quota: number;
    /** BAL-4200: regalo del combo (viene incluido, no suma a la cuota). */
    is_gift?: boolean;
    image?: string | null;
    thumbnail_url?: string | null;
    /**
     * Origen del regalo: `regalo_dinet` (lo regala BaldeCash, se anuncia en un
     * bloque aparte) o `combo`. Opcional: backend viejo no lo manda.
     */
    gift_source?: 'regalo_dinet' | 'combo' | null;
  }> | null;

  insurance?: {
    name: string;
    monthly_price: number;
  } | null;

  /** Multiple insurances support */
  insurances?: Array<{
    name: string;
    monthly_price: number;
  }> | null;

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

  /**
   * `true` cuando `/status` respondió recortado (link sin token, BAL-4188):
   * sin nombre, equipo ni cuota. Ver `ApplicationStatusData.limited`.
   */
  limited?: boolean;
  /** Slug de la landing dueña de la solicitud. Ver `ApplicationStatusData.landing_slug`. */
  landing_slug?: string | null;
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

// ============================================
// WS2 → Legacy Sync Endpoints
// /api/v1/applications/{app_id}/...
// ============================================

// --- Types ---

export interface SyncPersonaRequest {
  documento: string;
  nombres: string;
  ape_pat: string;
  ape_mat: string;
  fecha_nacimiento: string;
  celular: string;
  genero: 'male' | 'female';
}

export interface SyncPersonaResponse {
  status: 'ok' | 'error';
  persona_id: number;
  action: 'created' | 'updated';
  fields_updated: string[];
}

export interface SyncProductoRequest {
  solicitud_id: number;
  producto: {
    sku: string;
    nombre: string;
    precio_lista: number;
  };
}

export interface SyncProductoResponse {
  status: 'ok' | 'error';
  producto_id: number;
  categoria_producto_prestamo_id: number | null;
}

export interface SyncPrestamoRequest {
  solicitud_id: number;
  prestamo: {
    monto: number;
    tea: number;
    tcea: number;
    cuotas: number;
    monto_cuota: number;
    monto_inicial: number;
    concurrencia: string;
    cuota_lista: number;
  };
}

export interface SyncPrestamoResponse {
  status: 'ok' | 'error';
  prestamo_id: number;
  categoria_producto_prestamo_id: number;
}

export interface SyncDocumentacionRequest {
  solicitud_id: number;
  documento: {
    url: string;
    nombre: string;
    nombre_archivo: string;
    tipo: string;
    tipo_documentacion_id: number;
    storage: string;
  };
}

export interface SyncDocumentacionResponse {
  status: 'ok' | 'error';
  documentacion_id: number;
  action: 'created' | 'updated';
}

export interface SyncPerifericoRequest {
  action: 'create' | 'update' | 'delete';
  legacy_periferico_id?: number;
  nombre: string;
  monto: number;
  precio_compra: number;
  tipo_periferico: string;
}

export interface SyncPerifericoResponse {
  status: 'ok' | 'error';
  periferico_id: number;
  action: 'created' | 'updated' | 'deleted';
  fields_updated?: string[];
}

export interface SyncDireccionRequest {
  documento: string;
  direcciones: Array<{
    direccion: string;
    tipo: number;
    seleccionada: boolean;
  }>;
}

export interface SyncDireccionResponse {
  status: 'ok' | 'error';
  persona_id: number;
  creadas: number;
  omitidas: number;
}

export interface SyncTelefonoRequest {
  documento: string;
  telefonos: Array<{
    celular: string;
    tipo: number;
    seleccionado: boolean;
  }>;
}

export interface SyncTelefonoResponse {
  status: 'ok' | 'error';
  persona_id: number;
  creados: number;
  omitidos: number;
}

export interface SyncStatusRequest {
  solicitud_id: number;
  status_nuevo: string;
  owner_id?: number;
}

export interface SyncStatusResponse {
  status: 'ok' | 'error';
  solicitud_id: number;
  status_anterior: string;
  status_nuevo: string;
}

export interface ReadyToAcceptRequest {
  solicitud_id: number;
  motivo: string;
  rci: string;
  user_name: string;
}

export interface ReadyToAcceptResponse {
  status: 'ok' | 'error';
  solicitud_id?: number;
  message?: string;
}

export interface ReadyForAdmissionRequest {
  solicitud_id: number;
  user_name: string;
}

export interface ReadyForAdmissionResponse {
  status: 'ok' | 'error';
  solicitud_id: number;
  status_anterior: string;
  status_nuevo: string;
  owner_id: number;
}

export interface ReadyToRejectRequest {
  solicitud_id: number;
  observacion: string;
  motivoDesiste: string;
  user_name: string;
}

export interface ReadyToRejectResponse {
  status: 'ok' | 'error';
  solicitud_id: number;
  status_anterior: string;
  status_nuevo: string;
}

export interface FullRejectRequest {
  solicitud_id: number;
  sendCajaLima: boolean;
  sendMail: boolean;
  observacion: string;
  motivoDesiste: string;
  user_name: string;
}

export interface FullRejectResponse {
  status: 'ok' | 'error';
  solicitud_id: number;
  status_anterior: string;
  status_nuevo: string;
  motivo: string;
}

export interface ObserveRequest {
  solicitud_id: number;
  observacion: string;
  user_name: string;
}

export interface ObserveResponse {
  status: 'ok' | 'error';
  solicitud_id: number;
  status_anterior: string;
  status_nuevo: string;
  observacion: string;
}

export interface ApproveRequest {
  solicitud_id: number;
  user_name: string;
}

export interface ApproveResponse {
  status: 'ok' | 'error';
  solicitud_id?: number;
  message?: string;
}

export interface CambioEquipoRequest {
  solicitud_id: number;
  product_id: number;
  prestamo: {
    monto: number;
    monto_cuota: number;
    cuotas: number;
    monto_inicial: number;
    tea: number;
    tcea: number;
    concurrencia: string;
    cuota_lista: number;
  };
}

export interface CambioEquipoResponse {
  status: 'ok' | 'error';
  message?: string;
}

export interface CambiarDocumentoRequest {
  documento_actual: string;
  documento_nuevo: string;
}

export interface CambiarDocumentoResponse {
  status: 'ok' | 'error';
  persona_id: number;
  documento_anterior: string;
  documento_nuevo: string;
  registros_actualizados: number;
}

// --- Generic helper ---

async function syncRequest<TReq, TRes>(
  appId: number,
  endpoint: string,
  body: TReq,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
): Promise<TRes> {
  const response = await fetch(
    `${API_BASE_URL}/applications/${appId}/${endpoint}`,
    {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de conexión' }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  return response.json();
}

// --- API Functions ---

/** 1. POST /sync-persona → Legacy /fast-api-sync/persona */
export function syncPersona(appId: number, data: SyncPersonaRequest) {
  return syncRequest<SyncPersonaRequest, SyncPersonaResponse>(appId, 'sync-persona', data);
}

/** 2. POST /sync-producto → Legacy /fast-api-sync/producto */
export function syncProducto(appId: number, data: SyncProductoRequest) {
  return syncRequest<SyncProductoRequest, SyncProductoResponse>(appId, 'sync-producto', data);
}

/** 3. POST /sync-prestamo → Legacy /fast-api-sync/prestamo */
export function syncPrestamo(appId: number, data: SyncPrestamoRequest) {
  return syncRequest<SyncPrestamoRequest, SyncPrestamoResponse>(appId, 'sync-prestamo', data);
}

/** 4. POST /sync-documentacion → Legacy /fast-api-sync/documentacion */
export function syncDocumentacion(appId: number, data: SyncDocumentacionRequest) {
  return syncRequest<SyncDocumentacionRequest, SyncDocumentacionResponse>(appId, 'sync-documentacion', data);
}

/** 5. DELETE /sync-documentacion → Legacy /fast-api-sync/documentacion (DELETE) */
export function deleteSyncDocumentacion(appId: number, data: { documentacion_id: number }) {
  return syncRequest<{ documentacion_id: number }, { status: string }>(appId, 'sync-documentacion', data, 'DELETE');
}

/** 6. POST /sync-periferico → Legacy /fast-api-sync/periferico */
export function syncPeriferico(appId: number, data: SyncPerifericoRequest) {
  return syncRequest<SyncPerifericoRequest, SyncPerifericoResponse>(appId, 'sync-periferico', data);
}

/** 7. POST /sync-direccion → Legacy /fast-api-sync/direccion */
export function syncDireccion(appId: number, data: SyncDireccionRequest) {
  return syncRequest<SyncDireccionRequest, SyncDireccionResponse>(appId, 'sync-direccion', data);
}

/** 8. POST /sync-telefono → Legacy /fast-api-sync/telefono */
export function syncTelefono(appId: number, data: SyncTelefonoRequest) {
  return syncRequest<SyncTelefonoRequest, SyncTelefonoResponse>(appId, 'sync-telefono', data);
}

/** 9. POST /sync-status → Legacy /fast-api-sync/solicitud-status */
export function syncStatus(appId: number, data: SyncStatusRequest) {
  return syncRequest<SyncStatusRequest, SyncStatusResponse>(appId, 'sync-status', data);
}

/** 10. POST /ready-to-accept → Legacy /fast-api-sync/ready-to-accept */
export function readyToAccept(appId: number, data: ReadyToAcceptRequest) {
  return syncRequest<ReadyToAcceptRequest, ReadyToAcceptResponse>(appId, 'ready-to-accept', data);
}

/** 11. POST /ready-for-admission → Legacy /fast-api-sync/ready-for-admission */
export function readyForAdmission(appId: number, data: ReadyForAdmissionRequest) {
  return syncRequest<ReadyForAdmissionRequest, ReadyForAdmissionResponse>(appId, 'ready-for-admission', data);
}

/** 12. POST /ready-to-reject → Legacy /fast-api-sync/ready-to-reject */
export function readyToReject(appId: number, data: ReadyToRejectRequest) {
  return syncRequest<ReadyToRejectRequest, ReadyToRejectResponse>(appId, 'ready-to-reject', data);
}

/** 13. POST /full-reject → Legacy /fast-api-sync/reject */
export function fullReject(appId: number, data: FullRejectRequest) {
  return syncRequest<FullRejectRequest, FullRejectResponse>(appId, 'full-reject', data);
}

/** 14. POST /observe → Legacy /fast-api-sync/observar */
export function observe(appId: number, data: ObserveRequest) {
  return syncRequest<ObserveRequest, ObserveResponse>(appId, 'observe', data);
}

/** 15. POST /approve → Legacy /fast-api-sync/approve */
export function approve(appId: number, data: ApproveRequest) {
  return syncRequest<ApproveRequest, ApproveResponse>(appId, 'approve', data);
}

/** 16. POST /cambio-equipo → Legacy /fast-api-sync/cambio-equipo */
export function cambioEquipo(appId: number, data: CambioEquipoRequest) {
  return syncRequest<CambioEquipoRequest, CambioEquipoResponse>(appId, 'cambio-equipo', data);
}

/** 17. PUT /cambiar-documento → Legacy /fast-api-sync/persona/cambiar-documento + Equifax */
export function cambiarDocumento(appId: number, data: CambiarDocumentoRequest) {
  return syncRequest<CambiarDocumentoRequest, CambiarDocumentoResponse>(appId, 'cambiar-documento', data, 'PUT');
}
