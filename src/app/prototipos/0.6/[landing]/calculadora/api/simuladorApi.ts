/**
 * Cliente del endpoint de simulación de la landing.
 *
 * La calculadora NO calcula la cuota en el navegador: la pide. El endpoint
 * resuelve la tasa y la comisión desde las celdas de precio de la landing, que
 * es la misma jerarquía que después usa el registro de la solicitud y el envío
 * al sistema legado. Por eso lo que se muestra y lo que se firma coinciden.
 *
 * Antes se usaba el simulador genérico de la plataforma, que resuelve la tasa
 * por su propia tabla por plazo. Con eso la pantalla podía mostrar una tasa y
 * la solicitud registrarse con otra, y el desglose de comisiones —que el modal
 * de detalle necesita para el texto legal— no llegaba.
 *
 * Por qué el navegador no puede calcularlo, aunque la fórmula sea conocida: la
 * tasa mensual es la raíz doceava de uno más la tasa anual y no la anual entre
 * doce; el redondeo mueve la cuota hasta un sol y la última cuota absorbe el
 * residuo de céntimos; y el costo efectivo sale de una búsqueda iterativa que
 * dos implementaciones no resuelven al mismo número.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

/** Un concepto del desglose de la comisión periódica, para el texto legal. */
export interface ConceptoComision {
  concepto: string;
  monto: number;
}

/** Una fila del cronograma, tal como la dibuja el modal de detalle. */
export interface CuotaCronograma {
  numero: number;
  fechaVencimiento: string;
  /** Importe de la cuota. La última absorbe el residuo de céntimos. */
  total: number;
}

/** Resultado de la simulación, ya normalizado para la UI. */
export interface SimulacionFinanciamiento {
  montoFinanciado: number;
  plazoMeses: number;
  /** La que se muestra: incluye la comisión. */
  cuotaMensual: number;
  /** Cuota sin comisión. Solo para el desglose. */
  cuotaBase: number;
  comisionMensual: number;
  comisionTotal: number;
  comisionDesglose: ConceptoComision[];
  totalAPagar: number;
  interesTotal: number;
  /** Tasa efectiva anual en porcentaje. `null` cuando el backend no la resuelve. */
  tea: number | null;
  /** Tasa de costo efectivo anual en porcentaje. `null` cuando el backend no la resuelve. */
  tcea: number | null;
  /** Interés moratorio en soles por día de atraso. */
  moraDiaria: number;
  primerVencimiento: string | null;
  cronograma: CuotaCronograma[];
}

interface RespuestaSimulacion {
  financiado?: number;
  plazo?: number;
  cuota?: number;
  cuota_base?: number;
  comision?: number;
  comision_total?: number;
  comision_desglose?: Array<{ concepto?: string; monto?: number }>;
  total_a_pagar?: number;
  interes_total?: number;
  tea?: number | null;
  tcea?: number | null;
  mora_diaria?: number;
  cronograma?: Array<{ n?: number; fecha?: string; cuota?: number }>;
}

export class ErrorSimulacion extends Error {
  constructor(mensaje: string, readonly status?: number) {
    super(mensaje);
    this.name = 'ErrorSimulacion';
  }
}

/**
 * Simula el financiamiento contra el endpoint de la landing.
 *
 * @param monto          Monto total a financiar. Para matrícula, la suma de los dos importes.
 * @param plazo          Cantidad de cuotas. Tiene que ser uno de los plazos que ofrece la landing.
 * @param landingSlug    Ruta corta de la landing. Es lo que resuelve el producto y sus celdas.
 * @param signal         Para anular la simulación anterior cuando cambia un dato.
 * @param inicialPercent Porcentaje de cuota inicial. En matrícula se financia el total.
 *
 * Un 422 significa monto fuera de rango, monto que no respeta el salto, o plazo
 * e inicial sin celda de precio. El componente tiene que limpiar el resultado y
 * bloquear la continuación: nunca mostrar la cuota anterior, que corresponde a
 * otra combinación.
 */
export async function simularCalculadora(
  monto: number,
  plazo: number,
  landingSlug: string,
  signal?: AbortSignal,
  inicialPercent = 0
): Promise<SimulacionFinanciamiento> {
  const url = `${API_BASE_URL}/public/landing/${encodeURIComponent(landingSlug)}/calculadora/simulate`;

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      monto,
      plazo,
      inicial_percent: inicialPercent,
    }),
  });

  if (!respuesta.ok) {
    throw new ErrorSimulacion(
      `El simulador respondió ${respuesta.status}`,
      respuesta.status
    );
  }

  const datos: RespuestaSimulacion = await respuesta.json();

  const cronograma: CuotaCronograma[] = (datos.cronograma ?? []).map((fila, indice) => ({
    numero: fila.n ?? indice + 1,
    fechaVencimiento: fila.fecha ?? '',
    total: fila.cuota ?? 0,
  }));

  return {
    montoFinanciado: datos.financiado ?? monto,
    plazoMeses: datos.plazo ?? plazo,
    cuotaMensual: datos.cuota ?? 0,
    cuotaBase: datos.cuota_base ?? 0,
    comisionMensual: datos.comision ?? 0,
    comisionTotal: datos.comision_total ?? 0,
    comisionDesglose: (datos.comision_desglose ?? [])
      .filter((item) => typeof item?.concepto === 'string' && typeof item?.monto === 'number')
      .map((item) => ({ concepto: item.concepto as string, monto: item.monto as number })),
    totalAPagar: datos.total_a_pagar ?? 0,
    interesTotal: datos.interes_total ?? 0,
    // Se preserva el null en vez de convertirlo a 0: "no hay tasa" y "la tasa es
    // cero" son cosas distintas, y la UI las muestra distinto.
    tea: datos.tea ?? null,
    tcea: datos.tcea ?? null,
    moraDiaria: datos.mora_diaria ?? 0,
    primerVencimiento: cronograma[0]?.fechaVencimiento || null,
    cronograma,
  };
}
