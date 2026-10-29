/**
 * Barra de pasos de Zona Estudiantes en la confirmación de Diseño 2
 * (BAL-5274, diseño de Brenda v53 del 28-oct).
 *
 * La página no sabe en qué va la solicitud (no consulta el avance): siempre
 * marca «Evaluación» (el paso 2) como el actual, y por eso no muestra horas
 * ni «en este momento». «Cuota inicial» solo existe si la persona eligió
 * pagar inicial; entonces son 5 pasos en vez de 4.
 */

export interface PasoZonaEstudiantes {
  nombre: string;
  estado: 'hecho' | 'actual' | 'pendiente';
}

/** El paso en el que queda la solicitud recién enviada (1-based). */
export const PASO_ACTUAL = 2;

export function pasosZonaEstudiantes(conInicial: boolean): PasoZonaEstudiantes[] {
  const nombres = ['Recibida', 'Evaluación', 'Firma', ...(conInicial ? ['Cuota inicial'] : []), 'Entrega'];
  return nombres.map((nombre, i) => ({
    nombre,
    estado: i + 1 < PASO_ACTUAL ? 'hecho' : i + 1 === PASO_ACTUAL ? 'actual' : 'pendiente',
  }));
}

/** «Paso 2 de N:» — el rótulo en negrita de la línea debajo de la barra. */
export function rotuloDelPaso(conInicial: boolean): string {
  return `Paso ${PASO_ACTUAL} de ${pasosZonaEstudiantes(conInicial).length}:`;
}

/** La persona eligió pagar cuota inicial (monto mayor a cero). */
export function eligioInicial(initialPayment: number | null | undefined): boolean {
  return typeof initialPayment === 'number' && initialPayment > 0;
}

/** Zona Estudiantes (antes Zona Clientes): se abre en otra pestaña. */
export const URL_ZONA_ESTUDIANTES = 'https://zonaclientes.baldecash.com';
