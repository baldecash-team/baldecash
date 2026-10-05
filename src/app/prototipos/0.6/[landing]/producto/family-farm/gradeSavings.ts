import type { GradeKey, GradeOption } from './familyFarmGrades';

export interface GradeSavings {
  /** Cuánto menos cuesta este grado que el mejor disponible, en soles. */
  amount: number;
  /** Ese ahorro como porcentaje del precio de referencia, redondeado. */
  percent: number;
}

/** De mejor a peor estado. El primero que exista es la referencia. */
const BEST_FIRST: GradeKey[] = ['A', 'B', 'C'];

/**
 * Cuánto ahorra el grado elegido frente al mejor estado que ese equipo tiene.
 *
 * La referencia es el **mejor grado realmente cargado**, con su precio real de
 * `grade_siblings`. No se deriva un Grado A inexistente a partir de las
 * proporciones del catálogo (hoy B = 0.70·A y C = 0.50·A): esas proporciones son
 * una convención de carga, no una regla del sistema, y comparar contra un precio
 * que nadie fijó sería inventarle al cliente cuánto se ahorra.
 *
 * Por eso el Lenovo Tab P11, que solo tiene B y C, compara C contra B.
 *
 * Devuelve `null` cuando no hay nada honesto que mostrar: el grado elegido ya es
 * el mejor, falta algún precio, o la resta no da positiva.
 */
export function gradeSavings(grades: GradeOption[], selected: GradeKey): GradeSavings | null {
  const withPrice = grades.filter((g) => typeof g.price === 'number');

  const selectedPrice = withPrice.find((g) => g.grade === selected)?.price;
  if (selectedPrice === undefined) return null;

  const reference = BEST_FIRST.map((grade) => withPrice.find((g) => g.grade === grade)).find(Boolean);
  if (!reference || reference.grade === selected) return null;

  const amount = reference.price! - selectedPrice;
  if (amount <= 0) return null;

  return { amount, percent: Math.round((amount / reference.price!) * 100) };
}
