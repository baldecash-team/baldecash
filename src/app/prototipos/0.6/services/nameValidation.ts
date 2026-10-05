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
 * Deliberadamente NO incluye `supporter_full_name` ni `minor_full_name`: esos
 * son nombres completos y el backend los parte con `split_full_name`; filtrar
 * el input igual sería correcto, pero se deja fuera para no cambiar el
 * comportamiento de esos campos en el mismo pase.
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
]);

/** ¿Este campo del form builder es un nombre de persona? */
export function isPersonNameField(fieldCode: string): boolean {
  return PERSON_NAME_FIELD_CODES.has(fieldCode);
}

/**
 * Caracteres que un nombre peruano puede llevar: letras (con tildes y ñ),
 * espacios, apóstrofo y guión ("D'Angelo", "Maria-Jose", "de la Cruz").
 * Todo lo demás — dígitos, `@`, puntos, símbolos — se cae.
 */
const NON_NAME_CHARS = /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g;

/**
 * Limpieza suave para aplicar en cada tecla. Es el inverso del filtro del DNI:
 * allá se quita todo lo que no sea alfanumérico, acá todo lo que no sea letra.
 *
 * No hace `trim()` de los bordes ni colapsa espacios internos: eso pelearía
 * con el nombre a medio escribir ("Maria " camino a "Maria Jose"). La
 * normalización final la hace el submit.
 */
export function sanitizeNameInput(value: string): string {
  if (!value) return '';
  return value.replace(NON_NAME_CHARS, '');
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
