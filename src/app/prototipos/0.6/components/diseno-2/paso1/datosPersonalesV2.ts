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

import type {
  OptionValidation,
  WizardField,
  WizardFieldValidation,
  WizardStep,
} from '@/app/prototipos/0.6/services/wizardApi';

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
 * `true` si el documento escrito no puede mostrar el nombre de su dueño:
 * - fuera de la whitelist (manda el modal de no invitado), o
 * - link especial de otro DNI o que ya no sirve.
 * Vale para todo saludo con nombre: el del Paso 1 y el del panel lateral.
 */
export function saludoBloqueado(valores: Valores): boolean {
  return valores._whitelist_blocked === 'true' || valores._special_link_blocked === 'true';
}

/**
 * El nombre para "¡Hola, {Nombre}!" (y "¡Último paso, {Nombre}!"), o `null`
 * si no hay saludo. Sale, en este orden:
 *
 * 1. Del estado del prefill (`_prefill_status_*`), si existe: con `found`, el
 *    nombre que dejó el lookup del documento DEL TITULAR (el prefill ya
 *    descarta los nombres sucios); con otro estado (`not_found`, o `''` porque
 *    se está corrigiendo el documento), no hay saludo.
 * 2. Si no existe —ese estado no se guarda en el borrador, así que al recargar
 *    desaparece—, del VALOR del campo de primer nombre, que sí se guarda. Es
 *    el mismo campo que llena el prefill (`campoDelNombre`).
 *
 * Siempre la primera palabra, con mayúscula inicial.
 */
export function nombreDelSaludo(field: WizardField, valores: Valores): string | null {
  if (!CODIGOS_DOCUMENTO_TITULAR.includes(field.code)) return null;
  if (saludoBloqueado(valores)) return null;
  const estado = valores[`_prefill_status_${field.code}`];
  if (estado !== undefined && estado !== 'found') return null;
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

/** Los de cualquier otro celular (familiar, alterno, `supporter_phone`…). */
export const MENSAJES_OTRO_CELULAR_V2 = {
  vacio: 'Ingresa el celular.',
  corto: 'El celular tiene 9 números.',
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
 * El celular del titular: el campo `phone`, el mismo código que llena y
 * bloquea el lead de un socio (`useLeadPrefill`). Los demás celulares
 * (familiar, alterno, `supporter_phone`) no son "tu celular".
 */
export const CODIGO_CELULAR_TITULAR = 'phone';

export function esCelularDelTitular(field: Pick<WizardField, 'type' | 'code'>): boolean {
  return field.type === 'phone' && field.code === CODIGO_CELULAR_TITULAR;
}

/**
 * El mensaje que se ve bajo un celular en Diseño 2.
 *
 * Celular del titular (`phone`):
 * - Vacío → `required_message` de la BD si existe; si no, el de Brenda.
 * - Peruano con menos de 9 números → "Tu celular tiene 9 números."
 * - Peruano que no empieza con 9 → "Los celulares en Perú empiezan con 9."
 *   (no aplica si está bloqueado por el lead: ahí la regla no se exige).
 *
 * Cualquier otro celular: "Ingresa el celular." / "El celular tiene 9
 * números.", con `required_message` ganando si existe.
 *
 * Cualquier otro error (p. ej. número repetido) → el de la regla, tal cual.
 */
export function mensajeCelularV2(opciones: {
  error: string | null | undefined;
  valor: string | null | undefined;
  field: Pick<WizardField, 'type' | 'code' | 'validations' | 'required_message'>;
  bloqueado?: boolean;
}): string | undefined {
  const { error, field, bloqueado = false } = opciones;
  if (!error) return undefined;
  const valor = String(opciones.valor ?? '').trim();
  const titular = esCelularDelTitular(field);
  if (!valor) {
    return field.required_message || (titular ? MENSAJES_CELULAR_V2.vacio : MENSAJES_OTRO_CELULAR_V2.vacio);
  }
  if (esCelularPeruano(field)) {
    if (!/^\d{9}$/.test(valor)) return titular ? MENSAJES_CELULAR_V2.corto : MENSAJES_OTRO_CELULAR_V2.corto;
    if (titular && !bloqueado && !valor.startsWith('9')) return MENSAJES_CELULAR_V2.empiezaCon9;
  }
  return error;
}

// ---------------------------------------------------------------------------
// Etiqueta y ayuda del número por tipo de documento
// ---------------------------------------------------------------------------

/** "Número de DNI", "Número de Carné de extranjería"… con la etiqueta de la opción. */
export function etiquetaDelNumero(etiquetaDeLaOpcion: string | null | undefined, etiquetaDelCampo: string): string {
  const opcion = String(etiquetaDeLaOpcion ?? '').trim();
  return opcion ? `Número de ${opcion}` : etiquetaDelCampo;
}

/**
 * La ayuda bajo el número, sacada de las reglas del tipo (las mismas que
 * validan): "8 números", "Entre 9 y 12 caracteres"… Sin reglas, sin ayuda.
 */
export function ayudaDelNumero(reglas: OptionValidation | null | undefined): string | null {
  if (!reglas) return null;
  const { min_length: min, max_length: max, input_mode: modo } = reglas;
  const unidad = modo === 'numeric' ? 'números' : 'caracteres';
  if (min && max && min === max) return `${min} ${unidad}`;
  if (min && max) return `Entre ${min} y ${max} ${unidad}`;
  if (max) return `Hasta ${max} ${unidad}`;
  if (min) return `Al menos ${min} ${unidad}`;
  return null;
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
 * 1. El celular del titular (`phone`, con la regla `phone`) que no exige
 *    empezar con 9 recibe la regla `pattern ^9` (la validación de Diseño 1 no
 *    la tiene; Brenda sí). No la recibe si está bloqueado por el lead de un
 *    socio: la persona no podría corregirlo y quedaría trabada.
 * 2. Una regla `not_equals_field` sin mensaje en un celular recibe el texto
 *    de Brenda ("Es tu mismo número de WhatsApp…").
 *
 * Devuelve el MISMO objeto si no hay nada que cambiar.
 */
export function adaptarPasoDiseno2(
  step: WizardStep,
  opciones: { bloqueado?: (codigo: string) => boolean } = {},
): WizardStep {
  const bloqueado = opciones.bloqueado ?? (() => false);
  let cambio = false;
  const fields = step.fields.map((field) => {
    let validations = field.validations || [];
    let tocado = false;
    if (
      esCelularDelTitular(field) &&
      esCelularPeruano(field) &&
      !bloqueado(field.code) &&
      !yaExigeEmpezarCon9(field)
    ) {
      validations = [...validations, { ...REGLA_EMPIEZA_CON_9 }];
      tocado = true;
    }
    if (field.type === 'phone' && validations.some((v) => v.type === 'not_equals_field' && !v.message)) {
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
