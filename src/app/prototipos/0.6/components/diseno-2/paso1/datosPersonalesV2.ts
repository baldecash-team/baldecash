/**
 * Paso 1 · Datos personales en Diseño 2 (BAL-4963): reglas puras.
 *
 * Nada de esto fija preguntas: trabaja con los campos que vengan de la BD.
 * Lo único escrito acá son los TEXTOS de Brenda para los mensajes de error,
 * y siempre como respaldo de lo que diga la BD (`required_message`, el
 * mensaje de la regla `not_equals_field`).
 *
 * Solo se usa en Diseño 2. Diseño 1 no importa este archivo.
 */

import type { WizardField, WizardFieldValidation, WizardStep } from '@/app/prototipos/0.6/services/wizardApi';
import { getPrefillTargetFieldCodes } from '@/app/prototipos/0.6/services/wizardApi';

type Valores = Record<string, string | string[] | undefined>;
type PrefillConfig = WizardField['prefill_config'];

/** Los códigos del documento del titular (los mismos que lee el envío). */
const CODIGOS_DOCUMENTO_TITULAR = ['document_number', 'numero_documento'];

// ---------------------------------------------------------------------------
// Saludo por prefill
// ---------------------------------------------------------------------------

/**
 * El campo del formulario que recibe el `first_name` del lookup, según la
 * forma del `prefill_config` (legacy `prefill_fields`, nueva `fields_to_fill`
 * o, sin config, la convención `first_name`).
 */
export function campoDelNombre(config: PrefillConfig | null | undefined): string | null {
  if (config?.prefill_fields) {
    for (const [destino, origen] of Object.entries(config.prefill_fields)) {
      if (origen === 'first_name') return destino;
    }
    // Un destino que concatena varios orígenes (nombre completo) no sirve
    // para saludar: se busca uno que sea SOLO el nombre.
    return null;
  }
  if (config?.fields_to_fill) {
    return config.fields_to_fill.includes('first_name') ? 'first_name' : null;
  }
  return 'first_name';
}

/** "MARÍA JOSÉ" → "María". Primera palabra, con mayúscula inicial. */
export function capitalizarPrimerNombre(nombre: string | null | undefined): string {
  const primera = String(nombre || '').trim().split(/\s+/)[0] || '';
  if (!primera) return '';
  return primera.charAt(0).toLocaleUpperCase('es-PE') + primera.slice(1).toLocaleLowerCase('es-PE');
}

function texto(valor: string | string[] | undefined): string {
  return Array.isArray(valor) ? valor.join(' ') : String(valor ?? '');
}

/**
 * El nombre para "¡Hola, {Nombre}!", o `null` si no hay saludo.
 *
 * Hay saludo solo cuando el lookup del documento DEL TITULAR respondió
 * `found` y dejó un nombre (el prefill ya descarta los nombres sucios). Es el
 * mismo estado que ya existe (`_prefill_status_*`): no agrega esperas.
 */
export function nombreDelSaludo(field: WizardField, valores: Valores): string | null {
  if (!CODIGOS_DOCUMENTO_TITULAR.includes(field.code)) return null;
  if (valores[`_prefill_status_${field.code}`] !== 'found') return null;
  const codigoNombre = campoDelNombre(field.prefill_config);
  if (!codigoNombre) return null;
  return capitalizarPrimerNombre(texto(valores[codigoNombre])) || null;
}

/** El saludo del paso: busca el documento del titular entre sus campos. */
export function nombreDelSaludoDelPaso(step: WizardStep | null | undefined, valores: Valores): string | null {
  if (!step) return null;
  for (const field of step.fields) {
    if (field.type !== 'document_number') continue;
    const nombre = nombreDelSaludo(field, valores);
    if (nombre) return nombre;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Resumen de los campos que llenó el prefill
// ---------------------------------------------------------------------------

/**
 * Los campos que el prefill llenó y hoy están escondidos (`found`, con valor,
 * sin la marca `_prefill_empty_`). Son los que Diseño 2 muestra como resumen.
 * En `not_found` (o CE/pasaporte sin datos) no hay ninguno: esos campos se ven
 * como inputs normales por la regla de visibilidad de siempre.
 */
export function camposDelResumen(step: WizardStep, docField: WizardField, valores: Valores): WizardField[] {
  if (valores[`_prefill_status_${docField.code}`] !== 'found') return [];
  const destinos = new Set(getPrefillTargetFieldCodes(docField.prefill_config));
  return step.fields.filter(
    (f) =>
      destinos.has(f.code) &&
      f.hidden &&
      valores[`_prefill_empty_${f.code}`] !== 'true' &&
      texto(valores[f.code]).trim() !== '',
  );
}

function tituloDeNombre(valor: string): string {
  return valor
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0).toLocaleUpperCase('es-PE') + p.slice(1).toLocaleLowerCase('es-PE'))
    .join(' ');
}

/** "2002-03-12" → "12/03/2002". Otro formato se deja tal cual. */
function fechaCorta(valor: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor.trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : valor;
}

/**
 * El texto del resumen: los campos de texto (nombres, apellidos) van juntos
 * con espacio; el resto (fecha, listas) separado por " · ". Las listas
 * muestran la etiqueta de la opción, no el valor.
 */
export function textoDelResumen(campos: WizardField[], valores: Valores): string {
  const nombre: string[] = [];
  const otros: string[] = [];
  for (const f of campos) {
    const v = texto(valores[f.code]).trim();
    if (!v) continue;
    if (f.type === 'text') nombre.push(tituloDeNombre(v));
    else if (f.type === 'date') otros.push(fechaCorta(v));
    else if (f.options?.length) otros.push(f.options.find((o) => String(o.value) === v)?.label ?? v);
    else otros.push(v);
  }
  return [nombre.join(' '), ...otros].filter(Boolean).join(' · ');
}

// ---------------------------------------------------------------------------
// Mensajes (solo cambian el TEXTO; cuándo hay error lo decide el validador)
// ---------------------------------------------------------------------------

export const MENSAJES_DOCUMENTO_V2 = {
  vacio: 'Ingresa tu número de documento.',
  dni: 'Tu DNI tiene 8 números.',
  ce: 'Revisa tu carné: tiene entre 9 y 12 caracteres.',
  pasaporte: 'Revisa tu pasaporte: tiene entre 6 y 12 caracteres.',
} as const;

export const MENSAJES_CELULAR_V2 = {
  vacio: 'Ingresa tu celular para avisarte cómo va tu solicitud.',
  corto: 'Tu celular tiene 9 números.',
  empiezaCon9: 'Los celulares en Perú empiezan con 9.',
  repetido: 'Es tu mismo número de WhatsApp. Si contestas llamadas ahí, no necesitas agregarlo.',
} as const;

function tipoNormalizado(tipo: string | null | undefined): string {
  const t = String(tipo || '').trim().toLowerCase();
  return t === 'passport' ? 'pasaporte' : t;
}

/**
 * El mensaje que se ve bajo el número de documento en Diseño 2.
 *
 * - Sin error → sin mensaje.
 * - Vacío → `required_message` de la BD si existe; si no, el de Brenda.
 * - Error de formato → el texto de Brenda según el tipo elegido. Un tipo que
 *   no está en la tabla conserva el mensaje que dio el validador.
 */
export function mensajeDocumentoV2(opciones: {
  error: string | null | undefined;
  valor: string | null | undefined;
  tipo: string | null | undefined;
  requiredMessage?: string | null;
}): string | undefined {
  const { error, valor, tipo, requiredMessage } = opciones;
  if (!error) return undefined;
  if (!String(valor ?? '').trim()) return requiredMessage || MENSAJES_DOCUMENTO_V2.vacio;
  const t = tipoNormalizado(tipo) as keyof typeof MENSAJES_DOCUMENTO_V2;
  if (t === 'dni' || t === 'ce' || t === 'pasaporte') return MENSAJES_DOCUMENTO_V2[t];
  return error;
}

/** ¿Es un celular peruano? Lo dice la regla `phone` del campo (9 dígitos). */
export function esCelularPeruano(field: Pick<WizardField, 'type' | 'validations'>): boolean {
  return field.type === 'phone' && (field.validations || []).some((v) => v.type === 'phone');
}

/**
 * El mensaje que se ve bajo un celular en Diseño 2.
 *
 * - Vacío → `required_message` de la BD si existe; si no, el de Brenda.
 * - Celular peruano con menos de 9 números → "Tu celular tiene 9 números."
 * - Celular peruano que no empieza con 9 → "Los celulares en Perú empiezan con 9."
 * - Cualquier otro error (p. ej. número repetido) → el de la regla, tal cual.
 */
export function mensajeCelularV2(opciones: {
  error: string | null | undefined;
  valor: string | null | undefined;
  field: Pick<WizardField, 'type' | 'validations' | 'required_message'>;
}): string | undefined {
  const { error, field } = opciones;
  if (!error) return undefined;
  const valor = String(opciones.valor ?? '').trim();
  if (!valor) return field.required_message || MENSAJES_CELULAR_V2.vacio;
  if (esCelularPeruano(field)) {
    if (!/^\d{9}$/.test(valor)) return MENSAJES_CELULAR_V2.corto;
    if (!valor.startsWith('9')) return MENSAJES_CELULAR_V2.empiezaCon9;
  }
  return error;
}

// ---------------------------------------------------------------------------
// Reglas que Diseño 2 agrega al paso
// ---------------------------------------------------------------------------

/** La regla "empieza con 9" que agrega Diseño 2 (si el campo no la trae). */
export const REGLA_EMPIEZA_CON_9: WizardFieldValidation = {
  type: 'pattern',
  value: '^9',
  message: MENSAJES_CELULAR_V2.empiezaCon9,
};

function yaExigeEmpezarCon9(field: WizardField): boolean {
  const patrones = [
    field.pattern,
    ...(field.validations || []).filter((v) => v.type === 'pattern' || v.type === 'regex').map((v) => v.value),
  ];
  return patrones.some((p) => typeof p === 'string' && p.replace(/^\^/, '').startsWith('9'));
}

/**
 * El paso tal como lo valida Diseño 2. Dos ajustes, y solo en los campos que
 * ya los piden por su configuración:
 *
 * 1. Un celular peruano (regla `phone`) que no exige empezar con 9 recibe la
 *    regla `pattern ^9` (la validación de Diseño 1 no la tiene; Brenda sí).
 * 2. Una regla `not_equals_field` sin mensaje recibe el texto de Brenda.
 *
 * Devuelve el MISMO objeto si no hay nada que cambiar.
 */
export function adaptarPasoDiseno2(step: WizardStep): WizardStep {
  let cambio = false;
  const fields = step.fields.map((field) => {
    let validations = field.validations || [];
    let tocado = false;
    if (esCelularPeruano(field) && !yaExigeEmpezarCon9(field)) {
      validations = [...validations, { ...REGLA_EMPIEZA_CON_9 }];
      tocado = true;
    }
    if (validations.some((v) => v.type === 'not_equals_field' && !v.message)) {
      validations = validations.map((v) =>
        v.type === 'not_equals_field' && !v.message ? { ...v, message: MENSAJES_CELULAR_V2.repetido } : v,
      );
      tocado = true;
    }
    if (!tocado) return field;
    cambio = true;
    return { ...field, validations };
  });
  return cambio ? { ...step, fields } : step;
}
