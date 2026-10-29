/**
 * Textos del familiar según el vínculo (BAL-5285, pedido de Brenda).
 *
 * Los textos del formulario (etiqueta, placeholder, ayuda, pista, «obligatorio»
 * y mensajes de error) aceptan dos marcas que se reemplazan según lo elegido en
 * «Vínculo con tu familiar» (`supporter_relationship`):
 *
 * | vínculo   | `{de_tu_familiar}`   | `{tu_familiar}`   |
 * |-----------|----------------------|-------------------|
 * | `madre`   | de tu mamá           | tu mamá           |
 * | `padre`   | de tu papá           | tu papá           |
 * | `hermano` | de tu hermano(a)     | tu hermano(a)     |
 * | `abuelo`  | de tu abuelo(a)      | tu abuelo(a)      |
 * | otro/vacío| de tu familiar       | tu familiar       |
 *
 * Los `value` son los de las opciones del campo en la BD (form_field_option
 * del campo 26). Un texto sin marcas sale idéntico: ningún otro formulario
 * cambia. Funciones puras, sin React.
 *
 * BAL-5288: cada opción puede traer «Cómo se nombra en los textos»
 * (`text_reference`, p. ej. «tu mamá») desde admin2. Al cargar el formulario
 * se recuerdan con `recordarNombresDelVinculo`; ese nombre manda. Si la opción
 * no lo trae, vale el mapa fijo de arriba (y un vínculo nuevo sin nombre,
 * «tu familiar»).
 */

import type { WizardField, WizardStep } from '../services/wizardApi';

/** Código del campo que decide cómo se nombra al familiar. */
export const CAMPO_VINCULO = 'supporter_relationship';

const NOMBRE_POR_VINCULO: Record<string, string> = {
  madre: 'tu mamá',
  padre: 'tu papá',
  hermano: 'tu hermano(a)',
  abuelo: 'tu abuelo(a)',
};
const NOMBRE_SIN_VINCULO = 'tu familiar';

/** Nombres que vinieron en las opciones del formulario cargado (BAL-5288). */
let nombresDelFormulario: Record<string, string> = {};

/**
 * Recuerda el «cómo se nombra» de cada opción del vínculo que trae el
 * formulario. Llamarla de nuevo (otro formulario) reemplaza lo anterior.
 */
export function recordarNombresDelVinculo(
  steps: ReadonlyArray<Pick<WizardStep, 'fields'>> | null | undefined,
): void {
  const nombres: Record<string, string> = {};
  for (const step of steps ?? []) {
    for (const field of step.fields ?? []) {
      if (field.code !== CAMPO_VINCULO) continue;
      for (const opcion of field.options ?? []) {
        const nombre = (opcion.text_reference ?? '').trim();
        const valor = String(opcion.value ?? '').trim().toLowerCase();
        if (nombre && valor) nombres[valor] = nombre;
      }
    }
  }
  nombresDelFormulario = nombres;
}

/** Cómo se nombra al familiar para ese vínculo. */
export function nombreDelVinculo(vinculo?: string | null): string {
  const clave = String(vinculo ?? '').trim().toLowerCase();
  if (!clave) return NOMBRE_SIN_VINCULO;
  return nombresDelFormulario[clave] ?? NOMBRE_POR_VINCULO[clave] ?? NOMBRE_SIN_VINCULO;
}

const MARCAS = /\{(de_tu_familiar|tu_familiar)\}/g;

/** El vínculo elegido en los valores del formulario ('' si no hay). */
export function vinculoDe(formValues: Record<string, unknown> | null | undefined): string {
  const v = formValues?.[CAMPO_VINCULO];
  return String(Array.isArray(v) ? v[0] ?? '' : v ?? '').trim().toLowerCase();
}

/** Reemplaza las marcas del texto según el vínculo. Sin marcas, el mismo texto. */
export function textoSegunVinculo<T extends string | null | undefined>(texto: T, vinculo?: string | null): T {
  if (!texto || !texto.includes('{')) return texto;
  const nombre = nombreDelVinculo(vinculo);
  return texto.replace(MARCAS, (_m, marca: string) => (marca === 'de_tu_familiar' ? `de ${nombre}` : nombre)) as T;
}

/** ¿El texto trae alguna marca? */
function tieneMarca(texto: string | null | undefined): boolean {
  if (!texto) return false;
  MARCAS.lastIndex = 0;
  const hay = MARCAS.test(texto);
  MARCAS.lastIndex = 0;
  return hay;
}

/**
 * El campo con sus textos según el vínculo. Si ningún texto trae marcas,
 * devuelve el MISMO objeto (no rompe memos ni comparaciones por referencia).
 */
export function campoSegunVinculo(field: WizardField, vinculo?: string | null): WizardField {
  const ayuda = field.help_text;
  const conMarca =
    tieneMarca(field.label) ||
    tieneMarca(field.placeholder) ||
    tieneMarca(field.hint) ||
    tieneMarca(field.required_message) ||
    tieneMarca(field.date_limit_message) ||
    tieneMarca(field.allowed_email_domains_message) ||
    tieneMarca(field.cascade_from_label) ||
    tieneMarca(ayuda?.title) ||
    tieneMarca(ayuda?.description) ||
    tieneMarca(ayuda?.recommendation) ||
    (field.validations ?? []).some((v) => tieneMarca(v.message));
  if (!conMarca) return field;

  const t = <T extends string | null | undefined>(x: T) => textoSegunVinculo(x, vinculo);
  const resuelto: WizardField = {
    ...field,
    label: t(field.label),
    placeholder: t(field.placeholder),
    help_text: ayuda
      ? { ...ayuda, title: t(ayuda.title), description: t(ayuda.description), recommendation: t(ayuda.recommendation) }
      : ayuda,
    date_limit_message: t(field.date_limit_message),
    allowed_email_domains_message: t(field.allowed_email_domains_message),
    cascade_from_label: t(field.cascade_from_label),
    validations: (field.validations ?? []).map((v) => (tieneMarca(v.message) ? { ...v, message: t(v.message) } : v)),
  };
  // `hint` y `required_message` solo vienen si tienen valor: no crear la llave.
  if (field.hint !== undefined) resuelto.hint = t(field.hint);
  if (field.required_message !== undefined) resuelto.required_message = t(field.required_message);
  return resuelto;
}

/**
 * El paso con los textos de sus campos según el vínculo. Si ningún campo
 * cambia, devuelve el MISMO paso.
 */
export function pasoSegunVinculo<P extends Pick<WizardStep, 'fields'>>(step: P, vinculo?: string | null): P {
  let cambio = false;
  const fields = step.fields.map((f) => {
    const r = campoSegunVinculo(f, vinculo);
    if (r !== f) cambio = true;
    return r;
  });
  return cambio ? { ...step, fields } : step;
}
