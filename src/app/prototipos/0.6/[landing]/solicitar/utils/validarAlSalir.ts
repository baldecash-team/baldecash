/**
 * Validar al salir del campo los datos del familiar (BAL-5255, pedido 4 de Brenda).
 *
 * El celular, el DNI y el correo del familiar fallaban recién al apretar
 * «Continuar» (el celular del familiar, 23% en Express 2). Ahora se validan
 * al salir del campo si tienen algo escrito, con el MISMO validador de
 * «Continuar» (`validateField`), así el mensaje es idéntico: dígitos que
 * faltan, formato, o «es tu mismo número / DNI / correo» (`not_equals_field`).
 *
 * Qué campos: los que se comparan contra un dato del solicitante, es decir
 * los que traen una regla `not_equals_field` en el banco (`supporter_phone`,
 * `supporter_document_number`, `supporter_email`, `celular_del_familiar`…).
 * Sale de la BD, no de una lista escrita acá.
 *
 * Vacío al salir no avisa nada: «obligatorio» sigue saliendo al «Continuar»,
 * para no regañar a quien solo pasó por el campo.
 */

import {
  validateField,
  type CascadingOption,
  type OpcionesDeValidacion,
  type WizardField,
} from '../../../services/wizardApi';

/** ¿Este campo se valida al salir? Los que se comparan contra el solicitante. */
export function seValidaAlSalir(field: Pick<WizardField, 'validations'>): boolean {
  return (field.validations ?? []).some((v) => v.type === 'not_equals_field');
}

/** ¿El valor está vacío? (misma idea que `validateField`). */
export function estaVacio(value: string | string[] | undefined | null): boolean {
  if (Array.isArray(value)) return value.length === 0 || !value.join(',').trim();
  return !String(value ?? '').trim();
}

/**
 * El error que se muestra al salir del campo, o `null` si no hay nada que
 * decir (campo vacío o válido). Es el mismo texto que daría «Continuar».
 */
export function errorAlSalir(
  field: WizardField,
  value: string | string[] | undefined,
  formValues: Record<string, string | string[]>,
  dynamicOptionsCache?: Record<string, CascadingOption[]>,
  opciones: OpcionesDeValidacion = {},
): string | null {
  if (estaVacio(value)) return null;
  // El campo estaba en pantalla (la persona acaba de salir de él).
  return validateField(field, value, formValues, dynamicOptionsCache, true, opciones).error;
}
