const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface CompareFacesResult {
  success: boolean;
  is_match?: boolean;
  similarity?: number;
  threshold?: number;
  comparison_id?: number;
  error?: string;
  /**
   * Código crudo de AWS (`InvalidParameterException`, `ThrottlingException`…).
   * Se propaga porque el front necesita distinguir un fallo del que se sale
   * repitiendo la foto de uno del que se sale reintentando: sin esto, la única
   * señal era el texto del mensaje y la UI ofrecía "Reintentar" incluso cuando
   * reintentar con la misma imagen no podía funcionar.
   */
  error_code?: string;
}

export interface CompareFacesKeys {
  source_key?: string;
  target_key?: string;
}

/**
 * Compara selfie (source) vs DNI (target) contra el endpoint nativo de ws2.
 * `sourceImage`/`targetImage` aceptan dataURL base64 (Fase 2a) o URL de S3
 * (Fase 2b, tras subir con `getKycUploadUrl`/`uploadToS3`). `keys` es opcional
 * y agrega `source_key`/`target_key` al body cuando se subió a S3.
 * Fail-safe: ante error de red o HTTP no-OK devuelve { success:false, error }.
 */
export async function compareFaces(
  sourceImage: string,
  targetImage: string,
  applicationId?: number,
  keys?: CompareFacesKeys,
): Promise<CompareFacesResult> {
  try {
    const body: Record<string, unknown> = {
      source_image: sourceImage,
      target_image: targetImage,
      application_id: applicationId,
    };
    if (keys?.source_key) body.source_key = keys.source_key;
    if (keys?.target_key) body.target_key = keys.target_key;

    const response = await fetch(`${API_BASE_URL}/public/kyc/compare-faces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // 400 de AWS trae { detail: { success:false, error, error_code } }
      let error = 'No pudimos verificar tu identidad. Intenta nuevamente.';
      let error_code: string | undefined;
      try {
        const data = await response.json();
        error = data?.detail?.error || data?.error || error;
        error_code = data?.detail?.error_code || data?.error_code;
      } catch { /* noop */ }
      return { success: false, error, error_code };
    }

    return (await response.json()) as CompareFacesResult;
  } catch {
    return { success: false, error: 'Error de conexión. Intenta nuevamente.' };
  }
}

/** Veredicto de `verify-dni`. El backend NUNCA devuelve el texto OCR. */
export type VerifyDniStatus =
  | 'verified'        // el número declarado aparece en la foto
  | 'not_found'       // se leyó bien y el número no está → documento ajeno
  | 'low_confidence'  // se intuye el número pero mal leído → repetir foto
  | 'unreadable';     // no se pudo leer nada → repetir foto

export interface VerifyDniResult {
  success: boolean;
  status?: VerifyDniStatus;
  /** `reason` del dominio cuando el backend rechaza (403/429): titularidad, rate-limit. */
  reason?: string;
  error?: string;
  /*
   * Métrica de la lectura de Textract. El endpoint ya las devolvía y el tipo no
   * las declaraba, así que se perdían: sin `occurrences` ni `max_confidence` no
   * se puede saber si un rechazo viene de un umbral mal calibrado o de una foto
   * realmente ilegible. Opcionales porque en los errores de guard no vienen.
   */
  /** Cuántas veces se leyó el número con confianza suficiente. */
  occurrences?: number;
  /** Cuántas veces apareció, contando las de baja confianza. */
  occurrences_total?: number;
  /** Umbral de apariciones exigido (`TEXTRACT_MIN_OCCURRENCES`). */
  min_occurrences?: number;
  /** Umbral de confianza por línea (`TEXTRACT_MIN_CONFIDENCE`). */
  min_confidence?: number;
  /** Mejor confianza obtenida; 0 cuando no se leyó nada. */
  max_confidence?: number;
  /** Líneas que Textract detectó en la imagen. Pocas ⇒ foto ilegible. */
  lines_detected?: number;
}

/**
 * Verifica que el DNI declarado aparezca en la foto del documento (Textract).
 *
 * Responde la pregunta que `compare-faces` no puede: **si la foto es un
 * documento**. La comparación facial solo mira dos rostros, así que dos selfies
 * dan 100% de coincidencia y pasan — que es exactamente lo que ocurría antes de
 * cablear esto.
 *
 * `documentNumber` dobla como prueba de titularidad: el backend lo valida
 * contra la solicitud ANTES de gastar una llamada a Textract.
 *
 * Fail-safe: ante error de red devuelve `{ success:false }` con un mensaje
 * reintentable, nunca lanza.
 */
export async function verifyDni(args: {
  image: string;
  documentNumber: string;
  applicationCode: string;
}): Promise<VerifyDniResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/kyc/verify-dni`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: args.image,
        document_number: args.documentNumber,
        application_code: args.applicationCode,
      }),
    });

    if (!response.ok) {
      let reason: string | undefined;
      let error = 'No pudimos validar tu documento. Intenta nuevamente.';
      try {
        const data = await response.json();
        reason = data?.detail?.reason;
        error = data?.detail?.message || error;
      } catch { /* noop */ }
      return { success: false, reason, error };
    }

    const data = await response.json();
    return { success: true, status: data?.status as VerifyDniStatus };
  } catch {
    return { success: false, error: 'Error de conexión. Intenta nuevamente.' };
  }
}

export interface KycUploadUrl {
  upload_url: string;
  file_url: string;
  key: string;
}

/**
 * Pide una URL presignada de S3 para subir la selfie, el DNI o un documento
 * del paso `documents` (kind='document', que además acepta application/pdf).
 * Fail-safe: ante error de red o HTTP no-OK devuelve null (el caller decide
 * cómo degradar: mostrar error reintentable, nunca lanzar).
 */
export async function getKycUploadUrl(
  applicationCode: string,
  kind: 'selfie' | 'dni' | 'document',
  contentType = 'image/jpeg',
): Promise<KycUploadUrl | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/kyc/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_code: applicationCode,
        kind,
        content_type: contentType,
      }),
    });

    if (!response.ok) return null;
    return (await response.json()) as KycUploadUrl;
  } catch {
    return null;
  }
}

/**
 * Sube un blob a la URL presignada de S3 (PUT directo).
 * Fail-safe: ante error de red o HTTP no-OK devuelve false.
 */
export async function uploadToS3(
  uploadUrl: string,
  blob: Blob,
  contentType = 'image/jpeg',
): Promise<boolean> {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob,
    });
    return response.ok;
  } catch {
    return false;
  }
}

export interface KycDocumentFile {
  key: string;
  file_name: string;
  mime_type?: string;
  size_kb?: number;
}

/**
 * Registra en el backend (`application_document`) los archivos del paso
 * `documents` YA subidos a S3 con `getKycUploadUrl`/`uploadToS3`. Sin este
 * registro los archivos quedan huérfanos en el bucket y no se pueden cablear
 * después (revisión en admin, OCR, etc.).
 *
 * Exige prueba de titularidad — `documentNumber` (sesión original) o
 * `resumeToken` (página `/kyc/{token}`) — igual que step-complete.
 * Fail-safe: ante error devuelve null (el caller muestra error reintentable).
 */
export async function registerKycDocuments(
  applicationCode: string,
  files: KycDocumentFile[],
  documentNumber?: string,
  resumeToken?: string,
): Promise<{ success: boolean; document_ids: number[] } | null> {
  const prueba = documentNumber
    ? { document_number: documentNumber }
    : resumeToken
      ? { resume_token: resumeToken }
      : null;
  if (!prueba || files.length === 0) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/public/kyc/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_code: applicationCode,
        files,
        ...prueba,
      }),
    });

    if (!response.ok) return null;
    return (await response.json()) as { success: boolean; document_ids: number[] };
  } catch {
    return null;
  }
}

/**
 * Convierte un dataURL (`data:<mime>;base64,<data>`) capturado por <canvas>
 * en un Blob listo para subir con `uploadToS3`.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64 = ''] = dataUrl.split(',');
  const mimeMatch = /data:(.*?);base64/.exec(header);
  const mime = mimeMatch?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

// ── "Continuar en otro momento" ──────────────────────────────────────────────
// El backend exige prueba de titularidad porque los application_code son
// secuenciales: en sesión se prueba con el DNI, y desde el link con el token.

export type KycStepStatus = 'pending' | 'completed';

export interface KycProgressStep {
  type: string;
  status: KycStepStatus;
  completed_at: string | null;
}

export interface KycVeredicto {
  aprobado: boolean;
  tiene_cuota_inicial: boolean;
  /** Magic link a Zona Estudiantes (`/zona/payDues`). Null si no hay qué cobrar. */
  link_pago: string | null;
  /** Legacy además aplicó la firma (Airtable, firmado, hito). */
  firmado?: boolean;
  /**
   * `contrato_vencido`: no se aprobó porque el contrato aceptado quedó viejo.
   * El paso `contract` se reabre con el contrato nuevo.
   */
  motivo?: 'contrato_vencido';
  /**
   * La constancia de aceptación: el contrato aceptado con el hash estampado y
   * la hoja de constancia. Es la copia que hay que poner a disposición en el
   * acto (§4 paso 12). `null` cuando legacy no pudo emitirla: la operación
   * vale igual, lo que falta es el PDF que la muestra.
   */
  constancia_url?: string | null;
}

/**
 * Cierra el KYC: dispara la aprobación en legacy y devuelve si corresponde
 * mostrar el paso de pago de la cuota inicial.
 *
 * `documentNumber` dobla como prueba de titularidad (los `application_code` son
 * secuenciales); sin él el backend responde 403 y ni se llama.
 *
 * Fail-safe: cualquier error devuelve null y el wizard degrada a confirmación.
 * Un fallo acá no puede dejar al solicitante atrapado; si la solicitud igual
 * quedó aprobada, el seguimiento normal la recoge.
 */
export async function completarKyc(
  applicationCode: string,
  documentNumber?: string,
  resumeToken?: string,
): Promise<KycVeredicto | null> {
  // Prueba de titularidad: el DNI o el token, exactamente una. Entrando por la
  // pagina tokenizada no hay DNI —no se le pide a nadie— y exigirlo dejaba esa
  // via sin cerrar el KYC, o sea sin paso de pago: se iba derecho a
  // confirmacion aunque hubiera inicial que cobrar.
  const prueba = documentNumber
    ? { document_number: documentNumber }
    : resumeToken
      ? { resume_token: resumeToken }
      : null;
  if (!prueba) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/public/kyc/completar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_code: applicationCode,
        ...prueba,
      }),
    });

    if (!response.ok) return null;
    return (await response.json()) as KycVeredicto;
  } catch {
    return null;
  }
}

export interface KycProgressState {
  application_code: string;
  landing_slug: string | null;
  steps: KycProgressStep[];
  next_step: string | null;
  next_step_index: number | null;
  is_complete: boolean;
  /** false cuando la landing no tiene sub-pasos KYC habilitados. */
  kyc_enabled: boolean;
  resume: { enabled: boolean; ttl_hours: number };
  /** Solo lo devuelve /resume/{token}. */
  expires_at?: string;
  /**
   * Link de pago de la cuota inicial, si la aprobacion ya lo minteo. Viaja
   * con el estado —y no solo en la respuesta de `/completar`— para que el
   * sub-paso de pago pueda existir desde que se carga el KYC.
   */
  link_pago?: string | null;
  /**
   * Pase para el gate de la landing, solo en /resume/{token} y solo si la
   * landing tiene gate. Vence con el link y está atado al mismo DNI.
   */
  landing_access_token?: string;
  /**
   * DNI del titular, solo en /resume/{token}. El link se abre en cualquier
   * dispositivo (WhatsApp), donde no existe el localStorage del wizard: sin
   * este campo, `dni_selfie` no sabía qué número contrastar y el botón
   * "Verificar identidad" quedaba deshabilitado para siempre.
   */
  document_number?: string | null;
}

export interface KycApiError {
  error: string;
  reason: string;
}

function isError(x: unknown): x is KycApiError {
  return typeof x === 'object' && x !== null && 'reason' in x;
}

/** Extrae `{reason, message}` del `detail` del backend. */
async function toError(response: Response): Promise<KycApiError> {
  try {
    const data = await response.json();
    const d = data?.detail;
    // FastAPI devuelve los errores de validación (422 de Pydantic) como un
    // ARRAY de `{loc, msg, type}`, no como el `{reason, message}` propio del
    // dominio. Sin esta rama caía en `typeof d === 'object'` (los arrays lo
    // son) y salía como `reason:'unknown'` — indistinguible de un 500.
    if (Array.isArray(d)) {
      return { reason: 'validation_error', error: 'Revisa los datos e intenta nuevamente.' };
    }
    if (d && typeof d === 'object') {
      return { reason: d.reason ?? 'unknown', error: d.message ?? 'Ocurrió un error.' };
    }
  } catch { /* noop */ }
  return { reason: 'unknown', error: 'Ocurrió un error. Intenta nuevamente.' };
}

/** Estado del KYC. Fail-safe: null ante error, el caller cae al localStorage. */
export async function getKycProgress(applicationCode: string): Promise<KycProgressState | null> {
  try {
    const r = await fetch(
      `${API_BASE_URL}/public/kyc/progress?application_code=${encodeURIComponent(applicationCode)}`,
    );
    if (!r.ok) return null;
    return (await r.json()) as KycProgressState;
  } catch {
    return null;
  }
}

/** Una fila del cronograma: una armada de la inicial o una cuota. */
export interface FilaCronograma {
  numero: number;
  /** ISO `YYYY-MM-DD`. */
  fecha: string;
  /** Decimal como string: el JSON no puede perder centavos. */
  monto: string;
  es_armada: boolean;
  /** «Armada 1 de 4» / «Cuota 1 de 13». */
  etiqueta: string;
}

export interface CronogramaPreview {
  filas: FilaCronograma[];
  total: string;
}

/**
 * La vista previa del cronograma de la solicitud, armadas incluidas.
 *
 * Misma prueba de titularidad que el resto de las lecturas del KYC. Fail-safe:
 * `null` ante error — el paso muestra el flujo sin cronograma antes que fechas
 * que no son las de esta persona.
 */
export async function getCronograma(args: {
  applicationCode: string;
  documentNumber?: string;
  resumeToken?: string;
}): Promise<CronogramaPreview | null> {
  const params = new URLSearchParams({ application_code: args.applicationCode });
  if (args.resumeToken) params.set('resume_token', args.resumeToken);
  else if (args.documentNumber) params.set('document_number', args.documentNumber);

  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/cronograma?${params.toString()}`);
    if (!r.ok) return null;
    return (await r.json()) as CronogramaPreview;
  } catch {
    return null;
  }
}

/**
 * La identidad validada y el contacto de la solicitud.
 *
 * `nombre` y `documento` son de solo lectura: corresponden a la identidad que
 * ya se validó y el backend no tiene forma de cambiarlos. `aviso_identidad` lo
 * sirve ws2 y se pinta tal cual — es la explicación de por qué esos campos no
 * se pueden tocar, y decirla de dos maneras distintas en dos pantallas es peor
 * que no decirla.
 */
export interface ContactoKyc {
  nombre?: string | null;
  documento?: string | null;
  email?: string | null;
  telefono?: string | null;
  aviso_identidad: string;
}

export async function getContacto(args: {
  applicationCode: string;
  documentNumber?: string;
  resumeToken?: string;
}): Promise<ContactoKyc | null> {
  const params = new URLSearchParams({ application_code: args.applicationCode });
  if (args.resumeToken) params.set('resume_token', args.resumeToken);
  else if (args.documentNumber) params.set('document_number', args.documentNumber);

  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/contacto?${params.toString()}`);
    if (!r.ok) return null;
    return (await r.json()) as ContactoKyc;
  } catch {
    return null;
  }
}

/**
 * Actualiza correo y/o teléfono. Son los únicos dos campos que se pueden
 * cambiar; mandar cualquier otro no hace nada, porque el backend no lo declara.
 *
 * Devuelve el contacto ya guardado, o `null` si no se pudo: la pantalla avisa
 * en vez de dejar creer que quedó.
 */
export async function actualizarContacto(args: {
  applicationCode: string;
  documentNumber?: string;
  resumeToken?: string;
  email?: string;
  telefono?: string;
}): Promise<ContactoKyc | null> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/contacto`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_code: args.applicationCode,
        document_number: args.resumeToken ? undefined : args.documentNumber,
        resume_token: args.resumeToken,
        email: args.email,
        telefono: args.telefono,
      }),
    });
    if (!r.ok) return null;
    return (await r.json()) as ContactoKyc;
  } catch {
    return null;
  }
}

/**
 * Los números de la operación, para mostrarlos ANTES del contrato.
 *
 * Todo opcional y todo string: son importes, y un `number` los redondea
 * distinto de como los redondeó quien emitió el contrato. `null` es "la
 * solicitud no tiene este dato" y NO cero — un cero se lee como una condición
 * pactada.
 */
export interface ResumenOperacion {
  equipo?: string | null;
  sku?: string | null;
  precio?: string | null;
  cuota_inicial?: string | null;
  cuotas?: number | null;
  monto_cuota?: string | null;
  frecuencia?: string | null;
  tea?: string | null;
  tcea?: string | null;
  seguro?: string | null;
  total?: string | null;
}

/**
 * El resumen económico de la solicitud.
 *
 * Misma prueba de titularidad que el resto de las lecturas del KYC. Fail-safe:
 * `null` ante error — el paso muestra el contrato sin la tarjeta antes que
 * números que no son los de esta persona.
 */
export async function getResumenOperacion(args: {
  applicationCode: string;
  documentNumber?: string;
  resumeToken?: string;
}): Promise<ResumenOperacion | null> {
  const params = new URLSearchParams({ application_code: args.applicationCode });
  if (args.resumeToken) params.set('resume_token', args.resumeToken);
  else if (args.documentNumber) params.set('document_number', args.documentNumber);

  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/resumen?${params.toString()}`);
    if (!r.ok) return null;
    return (await r.json()) as ResumenOperacion;
  } catch {
    return null;
  }
}

/** De dónde sale el contrato y, por lo tanto, qué se le puede exigir al cliente. */
export type ContratoModo =
  /** La landing tiene la firma por aceptación: el contrato existe ANTES de
   *  aprobar y aceptarlo ES firmarlo. Sin documento no se puede continuar. */
  | 'aceptacion'
  /** El camino de siempre: el contrato lo emite la aprobación, que en el KYC
   *  corre al final. Su ausencia es normal y NO puede trabar el flujo. */
  | 'emitido';

export type ContratoEstado = 'generando' | 'listo' | 'error';

/** Por qué falló. Solo viene con `estado: 'error'`. */
export type ContratoMotivo =
  /** La solicitud no llegó a legacy: nadie puede emitirle un contrato.
   *  Reintentar no lo arregla. */
  | 'sin_registro'
  /** Legacy no pudo emitirlo, o se agotó la espera. Reintentar sí sirve. */
  | 'generacion';

/** El contrato que el paso de firma muestra. */
export interface ContratoKyc {
  modo: ContratoModo;
  estado: ContratoEstado;
  motivo?: ContratoMotivo;
  /** `estado === 'listo'`. Se mantiene por compatibilidad de lectura. */
  disponible: boolean;
  /** PDF (presignado en el camino `aceptacion`). */
  url?: string;
  /** Snapshot congelado; solo lo trae el camino `emitido`. */
  html?: string;
  /** sha256 del PDF. Es lo que viaja al aceptar, y solo existe en `aceptacion`. */
  hash?: string;
  external_id?: string;
  emitido_at?: string;
  /**
   * Los textos de la aceptación, tal como los sirve ws2. Solo en `aceptacion`.
   *
   * NO se escriben acá: la misma redacción que se muestra es la que el backend
   * sella como evidencia de qué se aceptó, así que componerla en el front la
   * haría poder desviarse de lo aprobado sin que nadie se entere.
   */
  aceptacion?: TextosAceptacion;
}

/** Lo que ws2 manda para armar la pantalla de aceptación. */
export interface TextosAceptacion {
  /** Número de la redacción. Es lo que queda grabado en la evidencia. */
  version: number;
  /** Aviso previo al checkbox: qué se está por hacer y a qué queda asociado. */
  aviso: string;
  /** La declaración del checkbox, con el código de la operación adentro. */
  declaracion: string;
  /** El botón que dispara la aceptación. */
  boton: string;
}

/**
 * Trae el contrato de la solicitud. Misma prueba de titularidad que el resto
 * de las lecturas sensibles: el DNI (flujo en sesión) o el token (flujo por
 * link), nunca las dos.
 *
 * `reintentar` fuerza a pedirle otro a legacy cuando el anterior falló.
 *
 * Fail-safe: `null` ante error de red o de permisos. El paso lo trata igual
 * que «todavía no hay contrato» — nunca cae a un documento genérico.
 */
export async function getContrato(args: {
  applicationCode: string;
  documentNumber?: string;
  resumeToken?: string;
  reintentar?: boolean;
}): Promise<ContratoKyc | null> {
  const params = new URLSearchParams({ application_code: args.applicationCode });
  if (args.resumeToken) params.set('resume_token', args.resumeToken);
  else if (args.documentNumber) params.set('document_number', args.documentNumber);
  if (args.reintentar) params.set('reintentar', '1');

  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/contrato?${params.toString()}`);
    if (!r.ok) return null;
    return adaptarContrato(await r.json());
  } catch {
    return null;
  }
}

/**
 * Tolera la respuesta del backend anterior a la firma por aceptación, que solo
 * traía `disponible` + `html`/`url`. Sin esto, un front nuevo contra un ws2 sin
 * desplegar dejaría el paso en un estado indefinido.
 */
function adaptarContrato(raw: Record<string, unknown>): ContratoKyc {
  const modo: ContratoModo = raw.modo === 'aceptacion' ? 'aceptacion' : 'emitido';
  const estado: ContratoEstado =
    raw.estado === 'listo' || raw.estado === 'error' || raw.estado === 'generando'
      ? raw.estado
      : raw.disponible ? 'listo' : 'generando';

  return {
    modo,
    estado,
    motivo: (raw.motivo as ContratoMotivo) || undefined,
    disponible: estado === 'listo',
    url: (raw.url as string) || undefined,
    html: (raw.html as string) || undefined,
    hash: (raw.hash as string) || undefined,
    external_id: (raw.external_id as string) || undefined,
    emitido_at: (raw.emitido_at as string) || undefined,
    aceptacion: adaptarTextos(raw.aceptacion),
  };
}

/**
 * Los textos, solo si vienen COMPLETOS.
 *
 * A medias no sirven: media pantalla con la redacción aprobada y media con un
 * texto de relleno es peor que la de siempre, porque no se distingue mirándola.
 * Sin esto el paso cae al texto genérico, que es lo que ya hacía.
 */
function adaptarTextos(raw: unknown): TextosAceptacion | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const t = raw as Record<string, unknown>;
  if (
    typeof t.version !== 'number' ||
    typeof t.aviso !== 'string' ||
    typeof t.declaracion !== 'string' ||
    typeof t.boton !== 'string' ||
    !t.aviso ||
    !t.declaracion ||
    !t.boton
  ) {
    return undefined;
  }

  return { version: t.version, aviso: t.aviso, declaracion: t.declaracion, boton: t.boton };
}

/** El resultado del avance: el estado nuevo, o que el contrato quedó viejo. */
export interface CompleteStepResult {
  state: KycProgressState | null;
  /** 409 `contract_outdated`: hay que recargar el contrato y aceptarlo de nuevo. */
  outdated: boolean;
}

/**
 * Marca un sub-paso completado. Requiere EXACTAMENTE una prueba: el DNI (flujo
 * en sesión) o el token (flujo por link). Si llegan las dos, se prioriza el
 * token y se omite el DNI — mandar ambas devuelve 422 `missing_proof`.
 *
 * `contractHash` solo aplica al sub-paso `contract` con firma por aceptación:
 * es lo que ata la aceptación al PDF que se mostró. Un 409 significa que el
 * contrato cambió mientras la persona lo leía.
 */
export async function completeKycStep(args: {
  applicationCode: string;
  stepType: string;
  documentNumber?: string;
  resumeToken?: string;
  contractHash?: string;
}): Promise<CompleteStepResult> {
  const body: Record<string, string> = {
    application_code: args.applicationCode,
    step_type: args.stepType,
  };
  if (args.resumeToken) body.resume_token = args.resumeToken;
  else if (args.documentNumber) body.document_number = args.documentNumber;
  if (args.contractHash) body.contract_hash = args.contractHash;

  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/progress/step-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (r.status === 409) return { state: null, outdated: true };
    if (!r.ok) return { state: null, outdated: false };
    return { state: (await r.json()) as KycProgressState, outdated: false };
  } catch {
    return { state: null, outdated: false };
  }
}

/** Pausa el KYC y dispara el envío del link por WhatsApp. */
export async function pauseKyc(args: {
  applicationCode: string;
  documentNumber: string;
}): Promise<{ masked_phone: string; expires_at: string; ttl_hours: number } | KycApiError> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_code: args.applicationCode,
        document_number: args.documentNumber,
      }),
    });
    if (!r.ok) return await toError(r);
    return await r.json();
  } catch {
    return { reason: 'network', error: 'Error de conexión. Intenta nuevamente.' };
  }
}

/** Canjea el token del link. No lo consume: es reutilizable. */
export async function resumeKyc(token: string): Promise<KycProgressState | KycApiError> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/resume/${encodeURIComponent(token)}`);
    if (!r.ok) return await toError(r);
    return (await r.json()) as KycProgressState;
  } catch {
    return { reason: 'network', error: 'Error de conexión. Intenta nuevamente.' };
  }
}

export { isError as isKycApiError };
