/**
 * Normalización y validación de nombres de persona escritos por una persona.
 *
 * Espejo de `is_valid_person_name` / `split_full_name` del backend
 * (ws2: app/utils/text.py). Si cambia una regla aquí, cambiala allá: el
 * backend es el que finalmente rechaza el submit, así que si el filtro del
 * front es más laxo el usuario se lleva un error recién al enviar.
 *
 * BAL-3634. El campo de nombres no filtraba nada, a diferencia del de DNI
 * (que sanitiza con `/[^a-zA-Z0-9]/g`). Por ahí entraron a `person.first_name`
 * celulares ("981971607"), emails ("mpiocanto@gmail.com"), DNIs y códigos de
 * alumno ("U26293402").
 */

/**
 * Los campos del wizard son dinámicos (vienen de `form_field` en BD), así que
 * NO se puede filtrar todo `type: 'text'`: "Empresa donde Labora" y
 * "¿Qué beca tiene?" legítimamente llevan números.
 *
 * Esta es la lista cerrada de códigos que son nombres de persona. Sale de:
 *   SELECT code FROM form_field WHERE deleted_at IS NULL AND field_type='text'
 * quedándose solo con los que alimentan `person.first_name` / los apellidos.
 *
 * BAL-4465 suma `supporter_full_name` y `minor_full_name`: por el familiar y
 * el menor también entraron correos y números cuando el buró no trajo el dato.
 */
export const PERSON_NAME_FIELD_CODES = new Set([
  'first_name',
  'nombres',
  'primer_nombre',
  'paternal_surname',
  'apellido_paterno',
  'maternal_surname',
  'apellido_materno',
  'last_name',
  'apellidos',
  'guardian_first_name',
  'guardian_last_name',
  'supporter_full_name',
  'minor_full_name',
]);

/** ¿Este campo del form builder es un nombre de persona? */
export function isPersonNameField(fieldCode: string): boolean {
  return PERSON_NAME_FIELD_CODES.has(fieldCode);
}

/**
 * Lo único que un nombre escrito a mano puede llevar: letras (con tildes, ñ y
 * ü), espacios, apóstrofo («D'Angelo»), guion («García-Pérez») y punto
 * («Vda.»). Misma lista que `_SIGNOS_DE_NOMBRE` del backend (BAL-4465).
 */
const SOLO_CARACTERES_DE_NOMBRE = /^[\p{L}\p{M}\s'`´’‘.-]*$/u;

/**
 * ¿El valor trae algo que no va en un nombre (`@`, dígitos, signos)?
 *
 * BAL-4465: antes el campo borraba esos caracteres en cada tecla sin avisar, y
 * un correo pegado quedaba como «drufastovillalobosgmailcom», que pasaba como
 * nombre. Ahora el texto se respeta y se avisa debajo del campo.
 */
export function hasNonNameChars(value: string | null | undefined): boolean {
  if (!value) return false;
  return !SOLO_CARACTERES_DE_NOMBRE.test(value);
}

/** Mensaje debajo de cada campo. Los mismos textos que el backend devuelve. */
const MENSAJE_POR_CAMPO: Record<string, string> = {
  first_name: 'Escribe solo tu nombre, sin correo ni números',
  nombres: 'Escribe solo tu nombre, sin correo ni números',
  primer_nombre: 'Escribe solo tu nombre, sin correo ni números',
  paternal_surname: 'Escribe solo tu apellido paterno, sin correo ni números',
  apellido_paterno: 'Escribe solo tu apellido paterno, sin correo ni números',
  maternal_surname: 'Escribe solo tu apellido materno, sin correo ni números',
  apellido_materno: 'Escribe solo tu apellido materno, sin correo ni números',
  last_name: 'Escribe solo tus apellidos, sin correo ni números',
  apellidos: 'Escribe solo tus apellidos, sin correo ni números',
  supporter_full_name: 'Escribe solo el nombre de tu familiar, sin correo ni números',
  guardian_first_name: 'Escribe solo el nombre del apoderado, sin correo ni números',
  guardian_last_name: 'Escribe solo los apellidos del apoderado, sin correo ni números',
  minor_full_name: 'Escribe solo el nombre del estudiante, sin correo ni números',
};

/** El mensaje de un campo de nombre (o el genérico si el código no está). */
export function nameErrorMessage(fieldCode: string): string {
  return MENSAJE_POR_CAMPO[fieldCode] ?? 'Escribe solo el nombre, sin correo ni números';
}

/**
 * Error del campo de nombre escrito a mano, o `null` si está bien o vacío
 * (la obligatoriedad la decide `required`). Regla estricta: la de
 * `isValidPersonName` más solo caracteres de nombre.
 */
export function personNameFieldError(
  fieldCode: string,
  value: string | null | undefined
): string | null {
  if (!isPersonNameField(fieldCode)) return null;
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  if (!isValidPersonName(trimmed) || hasNonNameChars(trimmed)) {
    return nameErrorMessage(fieldCode);
  }
  return null;
}

/**
 * ¿`value` parece un nombre de persona real?
 *
 * Espejo de `is_valid_person_name` del backend. Reemplaza al viejo
 * `isValidName` de DocumentNumberField, que solo miraba `!== '-'` y
 * `length >= 3` — por eso un celular de 9 dígitos o un email entraban al
 * prefill sin que nadie chistara.
 */
export function isValidPersonName(value: string | null | undefined): boolean {
  if (!value) return false;

  const trimmed = value.trim();
  if (trimmed.length < 3) return false;

  // Un email nunca es un nombre.
  if (trimmed.includes('@')) return false;

  // Tiene que haber al menos una letra (descarta "---", "123-456").
  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(trimmed)) return false;

  // Un nombre no lleva dígitos. Corta celulares, DNIs, códigos de alumno
  // ("U26293402") y los "NOMBRE + fecha de nacimiento".
  if (/[0-9]/.test(trimmed)) return false;

  return true;
}
