/**
 * Regla del número de documento en el modal del cupón.
 *
 * Es la misma regla de la lista de documentos del cupón: solo letras A-Z y
 * números, sin espacios y en mayúsculas; el largo depende del tipo.
 *
 * Los largos NO se escriben acá. Salen del catálogo de tipos de documento
 * (`GET /public/options/document-types`, el mismo que usa el formulario de
 * solicitud) y, si el catálogo todavía no cargó o falló, de la tabla de
 * respaldo de `wizardApi` (`getDocumentTypeRules`), que dice lo mismo.
 *
 * Lo único propio del modal son los códigos que manda al backend
 * (`DNI` / `CE` / `PAS`) y la redacción del mensaje, que es la misma que usa el
 * backend al rechazar con 422.
 */

import {
  getDocumentTypeRules,
  type CascadingOption,
} from '../../services/wizardApi';

export type TipoDocumento = 'DNI' | 'CE' | 'PAS';

interface TipoDelModal {
  /** Lo que viaja en `document_type`. */
  value: TipoDocumento;
  /** Lo que se lee en el selector. */
  label: string;
  /** El código del mismo tipo en el catálogo de tipos de documento. */
  codigoCatalogo: string;
  /** Cómo arranca el mensaje de error. */
  sujeto: string;
}

/** En el orden en que se listan en el selector. */
export const TIPOS_DOCUMENTO: TipoDelModal[] = [
  { value: 'DNI', label: 'DNI', codigoCatalogo: 'dni', sujeto: 'El DNI' },
  { value: 'PAS', label: 'Pasaporte', codigoCatalogo: 'pasaporte', sujeto: 'El pasaporte' },
  { value: 'CE', label: 'Carné de extranjería', codigoCatalogo: 'ce', sujeto: 'El carné de extranjería' },
];

export interface ReglaDocumento {
  min: number;
  max: number;
  /** Solo dígitos (DNI). Los demás admiten letras. */
  numerico: boolean;
  placeholder: string;
  mensaje: string;
}

/** El campo del catálogo donde vive el tipo; es la clave que espera `getDocumentTypeRules`. */
const CAMPO_TIPO = 'document_type';

function redactarMensaje(sujeto: string, min: number, max: number, numerico: boolean): string {
  const unidad = numerico ? 'dígitos' : 'letras o números';
  return min === max
    ? `${sujeto} debe tener ${min} ${unidad}`
    : `${sujeto} debe tener entre ${min} y ${max} ${unidad}`;
}

/**
 * La regla de un tipo. `opcionesCatalogo` es la respuesta de
 * `/public/options/document-types`; sin ella (o si viene incompleta) manda la
 * tabla de respaldo.
 */
export function reglaDeDocumento(
  tipo: TipoDocumento | '',
  opcionesCatalogo?: CascadingOption[]
): ReglaDocumento | null {
  const def = TIPOS_DOCUMENTO.find((t) => t.value === tipo);
  if (!def) return null;

  const valores = { [CAMPO_TIPO]: def.codigoCatalogo };
  const delCatalogo = opcionesCatalogo?.length
    ? getDocumentTypeRules(CAMPO_TIPO, valores, { [CAMPO_TIPO]: opcionesCatalogo })
    : null;
  const regla = delCatalogo?.min_length && delCatalogo?.max_length
    ? delCatalogo
    : getDocumentTypeRules(CAMPO_TIPO, valores);
  if (!regla?.min_length || !regla?.max_length) return null;

  const numerico = regla.input_mode === 'numeric';
  return {
    min: regla.min_length,
    max: regla.max_length,
    numerico,
    placeholder: regla.placeholder || '',
    mensaje: redactarMensaje(def.sujeto, regla.min_length, regla.max_length, numerico),
  };
}

/**
 * Deja el número como se guarda: sin espacios ni símbolos y en mayúsculas.
 * Con un tipo numérico (DNI) se quedan solo los dígitos. No recorta el largo:
 * eso lo decide quien llama.
 */
export function normalizarDocumento(crudo: string, regla?: ReglaDocumento | null): string {
  const limpio = String(crudo ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return regla?.numerico ? limpio.replace(/\D/g, '') : limpio;
}

/**
 * El mensaje de error de un número para su tipo, o null si cumple.
 * Valida el texto TAL CUAL llega: minúsculas, espacios y símbolos se rechazan
 * (para aceptarlos hay que pasar antes por `normalizarDocumento`).
 */
export function errorDeDocumento(
  tipo: TipoDocumento | '',
  numero: string,
  opcionesCatalogo?: CascadingOption[]
): string | null {
  if (!tipo) return 'Elige tu tipo de documento.';
  const regla = reglaDeDocumento(tipo, opcionesCatalogo);
  if (!regla) return null;

  const formato = regla.numerico ? /^\d+$/ : /^[A-Z0-9]+$/;
  const cumple =
    formato.test(numero) && numero.length >= regla.min && numero.length <= regla.max;
  return cumple ? null : regla.mensaje;
}

export interface ErrorDelServidor {
  campo: 'doc' | 'name' | 'phone' | 'terms';
  mensaje: string;
}

const CAMPO_POR_LOC: Record<string, ErrorDelServidor['campo']> = {
  document_number: 'doc',
  document_type: 'doc',
  first_name: 'name',
  phone: 'phone',
  terms_accepted: 'terms',
};

const PREFIJO_VALIDADOR = /^Value error,\s*/i;

/**
 * Lo que el backend explica al rechazar con 422.
 *
 * Dos formas: `{"detail": "texto"}` (la regla del documento) o la lista de
 * FastAPI `{"detail": [{loc, msg}]}`, que dice a qué campo se refiere. Devuelve
 * null si no hay un texto que mostrar.
 */
export function errorDel422(cuerpo: unknown): ErrorDelServidor | null {
  const detalle = (cuerpo as { detail?: unknown } | null)?.detail;

  if (typeof detalle === 'string') {
    const mensaje = detalle.trim();
    return mensaje ? { campo: 'doc', mensaje } : null;
  }

  if (Array.isArray(detalle)) {
    for (const item of detalle) {
      const { loc, msg } = (item ?? {}) as { loc?: unknown; msg?: unknown };
      if (typeof msg !== 'string') continue;
      // Solo los mensajes que escribió el backend: Pydantic los marca con
      // «Value error, ». Los automáticos («String should have at least 8
      // characters») están en inglés y no son para el cliente.
      if (!PREFIJO_VALIDADOR.test(msg)) continue;
      const mensaje = msg.replace(PREFIJO_VALIDADOR, '').trim();
      const nombre = Array.isArray(loc) ? String(loc[loc.length - 1]) : '';
      const campo = CAMPO_POR_LOC[nombre];
      if (!campo || !mensaje) continue;
      return { campo, mensaje };
    }
  }

  return null;
}
