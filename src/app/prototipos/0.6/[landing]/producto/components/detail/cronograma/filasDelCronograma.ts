/**
 * Las filas del cronograma: las armadas de la inicial y después las cuotas.
 *
 * Cuando la inicial se fracciona, esas armadas son pagos con fecha propia y
 * ocupan períodos del calendario: por eso 13 cuotas con la inicial en 4 armadas
 * duran 17 semanas y no 13. Mostrar solo las cuotas dejaba fuera los primeros
 * pagos que la persona realmente hace.
 *
 * Mismo modelo que `construir_cronograma` en ws2 (`es_armada` + `etiqueta`),
 * para que la pantalla, el PDF y el contrato cuenten lo mismo.
 */

export interface FilaCronograma {
  /** Posición en el calendario completo, arrancando en 1. */
  numero: number;
  fecha: Date;
  monto: number;
  esArmada: boolean;
  /** «Armada 1 de 4» / «Cuota 1 de 13». */
  etiqueta: string;
  /**
   * Índice de la cuota dentro del financiamiento (0-based), para alinear la
   * fila con la tabla de amortización. `null` en las armadas: no amortizan.
   */
  indiceCuota: number | null;
}

/** Avanza una fecha un período de la frecuencia dada. */
export function siguienteFecha(desde: Date, frecuencia: string, periodos: number): Date {
  const d = new Date(desde);
  if (frecuencia === 'semanal') d.setDate(d.getDate() + periodos * 7);
  else if (frecuencia === 'quincenal') d.setDate(d.getDate() + periodos * 15);
  else d.setMonth(d.getMonth() + periodos);
  return d;
}

export interface ArgsFilas {
  cuotas: number;
  montoCuota: number;
  frecuencia: string;
  inicio: Date;
  /** 1 = pago único, el default de todo el catálogo. */
  armadas?: number;
  /** Montos exactos por armada si el backend los mandó; si no, se reparte. */
  montosArmadas?: number[];
  /** Inicial total, para repartir cuando no vienen los montos exactos. */
  montoInicial?: number;
}

export function construirFilas({
  cuotas, montoCuota, frecuencia, inicio,
  armadas = 1, montosArmadas, montoInicial = 0,
}: ArgsFilas): FilaCronograma[] {
  const filas: FilaCronograma[] = [];

  // Un pago único es inmediato: no ocupa un período del calendario y por eso
  // no se dibuja como fila. Es el caso de todo el catálogo sin armadas.
  const n = armadas > 1 ? armadas : 0;

  for (let i = 0; i < n; i++) {
    // El reparto es el fallback: si el backend mandó los montos exactos, esos
    // mandan — el redondeo de la última armada es suyo, no nuestro.
    const monto = montosArmadas?.[i] ?? montoInicial / n;
    filas.push({
      numero: i + 1,
      fecha: siguienteFecha(inicio, frecuencia, i),
      monto,
      esArmada: true,
      etiqueta: `Armada ${i + 1} de ${n}`,
      indiceCuota: null,
    });
  }

  for (let i = 0; i < cuotas; i++) {
    filas.push({
      numero: n + i + 1,
      fecha: siguienteFecha(inicio, frecuencia, n + i),
      monto: montoCuota,
      esArmada: false,
      etiqueta: `Cuota ${i + 1} de ${cuotas}`,
      indiceCuota: i,
    });
  }

  return filas;
}
