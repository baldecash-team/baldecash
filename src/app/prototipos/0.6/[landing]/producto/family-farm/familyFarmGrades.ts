/**
 * Contenido del selector de grados de Family Farms.
 *
 * Los textos salen del diseño entregado por Vania (`detalle.html`), que a su vez
 * los tomó de la ficha de producción cambiando de grado uno por uno: el API no
 * devuelve descripciones de grado, solo `grade_siblings` con precio y stock.
 *
 * Los valores técnicos (batería, aspecto, condición, piezas) coinciden con la
 * constante `GRADES` de las variantes copia-home, que es de donde salieron.
 */

export type GradeKey = 'A' | 'B' | 'C';

export interface GradeCopy {
  /** Título corto del grado, el que acompaña al precio en la tarjeta. */
  titulo: string;
  /** Una frase sobre en qué estado llega el equipo. */
  resumen: string;
  /** Qué se va a encontrar la persona. Tres puntos concretos, sin adornos. */
  espera: [string, string, string];
}

export const GRADE_COPY: Record<GradeKey, GradeCopy> = {
  A: {
    titulo: 'Excelente estado',
    resumen: 'Equipos con mínimo uso. Estética casi impecable y rendimiento como nuevo.',
    espera: [
      'Señales de uso mínimas o imperceptibles',
      'Pantalla y teclado en excelente estado',
      'Batería con alta capacidad (≥ 80%)',
    ],
  },
  B: {
    titulo: 'Buen estado',
    resumen: 'Uso normal y cuidado. Marcas leves que no se notan al usarlo.',
    espera: [
      'Micro rayas o marcas leves en la carcasa',
      'Pantalla sin fallas de imagen',
      'Batería entre 70% y 80%',
    ],
  },
  C: {
    titulo: 'Funcional y ahorrador',
    resumen: 'El más económico. Se nota el uso por fuera, funciona completo por dentro.',
    espera: [
      'Marcas de uso visibles en carcasa o bordes',
      'Puede traer batería o teclado repuestos',
      'Batería entre 60% y 70%',
    ],
  },
};

/** Aclaración que va debajo del cuadro, para que el grado no se lea como "roto". */
export const GRADE_NOTE = 'Todos los grados son 100% funcionales y revisados por técnicos certificados.';

export const GRADE_HEADING = 'Elige el estado de tu equipo';
export const GRADE_SUBHEADING = 'El grado refleja el nivel de uso y el estado estético del equipo';

/** ¿La letra corresponde a un grado conocido? */
export function isGradeKey(value?: string | null): value is GradeKey {
  return value === 'A' || value === 'B' || value === 'C';
}
