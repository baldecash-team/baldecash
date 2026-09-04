/**
 * Formulario posterior a la solicitud — cliente HTTP.
 *
 * Contrato: `docs/FORMULARIO_POSTERIOR_API.md` en ws2 (sección 2 público).
 * El token de la URL es la ÚNICA prueba de titularidad: ni el id ni el código
 * de la solicitud viajan. El FE no decide qué pedir: dibuja `modulos` tal
 * como vienen, y los módulos comunes (resumen, contacto, dudas) siempre.
 *
 * Nada de lo que la persona escribe acá pisa datos de la solicitud: teléfono
 * y dirección corregidos viven en el formulario del backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export type ModuloCode =
  | 'utility_bill' | 'payslip' | 'tax_report'
  | 'fee_receipt_1' | 'fee_receipt_2' | 'fee_receipt_3'
  | 'income_movements' | 'income_detail';

export type ModuloStatus = 'pending' | 'uploaded' | 'verified' | 'rejected' | 'skipped';
export type FulfilledBy = 'document' | 'text' | 'voice_note';
export type ContactSlot = '09_12' | '12_14' | '15_18' | '18_20' | 'exact';
export type ContactChannel = 'whatsapp' | 'call';
export type FormularioStatus =
  | 'not_applicable' | 'pending' | 'sent' | 'opened' | 'submitted' | 'expired';

export interface DocumentoSubido {
  id: number;
  file_name: string;
  mime_type: string | null;
  uploaded_at: string | null;
  view_url: string | null;
}

export interface DocumentType {
  code: string;
  name: string;
  accepted_formats: string[] | null;
  max_file_size_mb: number | null;
  max_files: number | null;
}

export interface Modulo {
  code: ModuloCode;
  status: ModuloStatus;
  fulfilled_by: FulfilledBy | null;
  is_required: boolean;
  min_files: number;
  files_count: number;
  attempt_count: number;
  max_attempts: number;
  last_rejected_at: string | null;
  verified_at: string | null;
  rejection_message: string | null;
  document_type: DocumentType | null;
  documents: DocumentoSubido[];
}

export interface ResumenItem {
  nombre: string;
  spec: string | null;
  cuota: number;
  imagen: string | null;
  es_principal: boolean;
}

export interface Contacto {
  contact_date: string | null;
  contact_slot: ContactSlot | null;
  contact_time: string | null;
  contact_at: string | null;
  contact_channel: ContactChannel | null;
  contact_phone: string | null;
  phone_changed: boolean;
}

export interface Pantalla {
  status: FormularioStatus;
  situation: string;
  campaign: string | null;
  requires_utility_bill: boolean;
  numero_solicitud: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  direccion_tiene_numero: boolean;
  resumen: {
    items: ResumenItem[];
    cuota: number;
    plazo: number;
    monto: number;
    frecuencia: string;
    primer_pago: string | null;
    seguro: boolean;
    garantia: boolean;
  };
  modulos: Modulo[];
  contacto: Contacto;
  respuesta: {
    corrected_address: string | null;
    income_description: string | null;
    questions: string | null;
  };
  submitted_at: string | null;
}

export interface EnviarPayload {
  contact_date: string;
  contact_slot: ContactSlot;
  contact_time?: string;
  contact_channel: ContactChannel;
  contact_phone: string;
  corrected_address?: string;
  questions?: string;
}

export interface EnviarRespuesta {
  ok: true;
  contacto: { dia: string; horario: string; canal: string; telefono: string };
}

/** Guardado por sección: todo opcional, solo viaja lo que la sección tocó. */
export type GuardarParcialPayload = Partial<EnviarPayload>;

export interface FormularioApiError {
  error: string;
  reason: string;
  /** Códigos de módulos pendientes cuando `reason === 'modules_pending'`. */
  modulos?: string[];
}

export function isFormularioApiError(x: unknown): x is FormularioApiError {
  return typeof x === 'object' && x !== null && 'reason' in x && 'error' in x;
}

const NETWORK: FormularioApiError = {
  reason: 'network', error: 'No pudimos conectarnos. Revisa tu conexión.',
};

/** Traduce el `detail` del backend a `{reason, error}`.
 *
 * Vive aparte de `toError` porque la subida va por XHR y ahí el cuerpo ya
 * viene parseado: el mapeo del `detail` es el mismo y no puede divergir. */
function errorDeDetail(d: unknown): FormularioApiError {
  // FastAPI devuelve los errores de validación de Pydantic como un ARRAY de
  // `{loc, msg, type}`, no como el `{reason, message}` propio del dominio.
  if (Array.isArray(d)) {
    return { reason: 'validation_error', error: 'Revisa los datos e intenta nuevamente.' };
  }
  if (d && typeof d === 'object') {
    const o = d as { reason?: string; message?: string; modules?: unknown };
    return {
      reason: o.reason || 'unknown',
      error: o.message || 'Ocurrió un error.',
      modulos: Array.isArray(o.modules) ? (o.modules as string[]) : undefined,
    };
  }
  return { reason: 'unknown', error: typeof d === 'string' ? d : 'Ocurrió un error.' };
}

/** Extrae `{reason, message}` del `detail` del backend. */
async function toError(response: Response): Promise<FormularioApiError> {
  try {
    const data = await response.json();
    return errorDeDetail(data?.detail);
  } catch {
    return { reason: 'unknown', error: 'Ocurrió un error.' };
  }
}

const base = (token: string) => `${API_BASE_URL}/public/formulario/${encodeURIComponent(token)}`;

/** Canjea el token y devuelve lo que la pantalla muestra. Marca `opened`. */
export async function getFormulario(token: string): Promise<Pantalla | FormularioApiError> {
  try {
    const response = await fetch(base(token));
    if (!response.ok) return await toError(response);
    return (await response.json()) as Pantalla;
  } catch {
    return NETWORK;
  }
}

/** Sube un archivo a un módulo. Devuelve el módulo actualizado.
 *
 * Va por XHR y no por `fetch` para poder informar el avance: `fetch` no expone
 * el progreso de SUBIDA (su `ReadableStream` es solo de bajada), y en un
 * celular con señal pobre una foto tarda lo suficiente como para que sin
 * porcentaje la pantalla parezca colgada.
 *
 * `onProgress` recibe 0..100 y se llama solo cuando el navegador puede medir
 * (`lengthComputable`). Al terminar de subir, el servidor todavía guarda y
 * valida, así que el porcentaje se queda en 99 hasta que llega la respuesta:
 * mostrar 100 y seguir esperando es peor que no mostrarlo. */
export async function subirArchivo(
  token: string,
  code: ModuloCode,
  file: File,
  fulfilledBy: FulfilledBy = 'document',
  onProgress?: (porcentaje: number) => void,
): Promise<Modulo | FormularioApiError> {
  const body = new FormData();
  body.append('file', file);
  body.append('fulfilled_by', fulfilledBy);

  return new Promise((resolve) => {
    let xhr: XMLHttpRequest;
    try {
      xhr = new XMLHttpRequest();
    } catch {
      resolve(NETWORK);
      return;
    }
    xhr.open('POST', `${base(token)}/modulos/${code}/archivo`);

    xhr.upload.onprogress = (e) => {
      if (!onProgress || !e.lengthComputable || e.total === 0) return;
      // Tope en 99: lo que falta es el guardado del servidor, no la subida.
      onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
    };

    xhr.onload = () => {
      let cuerpo: unknown = null;
      try {
        cuerpo = JSON.parse(xhr.responseText);
      } catch {
        /* respuesta sin JSON: cae al manejo de abajo */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(cuerpo as Modulo);
        return;
      }
      resolve(errorDeDetail((cuerpo as { detail?: unknown } | null)?.detail));
    };
    xhr.onerror = () => resolve(NETWORK);
    xhr.ontimeout = () => resolve(NETWORK);
    xhr.onabort = () => resolve(NETWORK);

    xhr.send(body);
  });
}

/** Cumple un módulo con texto (boleta → "cómo percibo mis ingresos", detalle). */
export async function cumplirConTexto(
  token: string,
  code: ModuloCode,
  text: string,
): Promise<Modulo | FormularioApiError> {
  try {
    const response = await fetch(`${base(token)}/modulos/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fulfilled_by: 'text', text }),
    });
    if (!response.ok) return await toError(response);
    return (await response.json()) as Modulo;
  } catch {
    return NETWORK;
  }
}

/** Quita un archivo subido por error. Devuelve el módulo actualizado. */
export async function borrarArchivo(
  token: string,
  code: ModuloCode,
  documentId: number,
): Promise<Modulo | FormularioApiError> {
  try {
    const response = await fetch(`${base(token)}/modulos/${code}/archivos/${documentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) return await toError(response);
    return (await response.json()) as Modulo;
  } catch {
    return NETWORK;
  }
}

/** Guarda lo que la sección lleva escrito, sin cerrar el formulario.
 *
 * No crea la cita ni consume el link: eso sigue siendo del botón Enviar. Sirve
 * para que el estudiante que abandona a mitad de camino igual nos deje su
 * horario, su teléfono o su dirección corregida. Devuelve la pantalla entera,
 * ya con lo guardado. */
export async function guardarParcial(
  token: string,
  payload: GuardarParcialPayload,
): Promise<Pantalla | FormularioApiError> {
  try {
    const response = await fetch(base(token), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return await toError(response);
    return (await response.json()) as Pantalla;
  } catch {
    return NETWORK;
  }
}

/** Botón Enviar: contacto, dirección corregida y dudas. Consume el link. */
export async function enviarFormulario(
  token: string,
  payload: EnviarPayload,
): Promise<EnviarRespuesta | FormularioApiError> {
  try {
    const response = await fetch(`${base(token)}/enviar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return await toError(response);
    return (await response.json()) as EnviarRespuesta;
  } catch {
    return NETWORK;
  }
}

export interface RenovarRespuesta {
  ok: true;
  /** Celular enmascarado al que se mandó el enlace nuevo (`***-***-777`). */
  telefono: string;
  /** Cuándo vence el enlace nuevo, hora Lima sin zona (`2026-09-04T11:55:00`).
   * Hereda el vencimiento del primero: renovar NO reinicia el plazo. */
  expires_at?: string;
}

/**
 * Pide un enlace nuevo desde uno vencido/reemplazado/usado. El backend lo
 * manda por WhatsApp al celular registrado y NUNCA lo devuelve acá: quien
 * tenga una URL vieja (un mensaje reenviado) no obtiene la nueva.
 *
 * Errores: 409 `already_submitted` | `not_applicable`, 429 `rate_limited`,
 * 502 `send_failed`, 404 `invalid`.
 */
export async function renovarEnlace(token: string): Promise<RenovarRespuesta | FormularioApiError> {
  try {
    const response = await fetch(`${base(token)}/renovar`, { method: 'POST' });
    if (!response.ok) return await toError(response);
    return (await response.json()) as RenovarRespuesta;
  } catch {
    return NETWORK;
  }
}
