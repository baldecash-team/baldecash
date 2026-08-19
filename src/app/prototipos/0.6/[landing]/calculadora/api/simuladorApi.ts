/**
 * Cliente del simulador público de webservice2.
 *
 * La calculadora de matrícula NO calcula la cuota en el navegador. Delega en
 * `POST /public/simulate`, que es el mismo servicio que usa el resto de la
 * plataforma y el único camino que respeta la tasa especial del convenio de la
 * landing.
 *
 * Por qué `/simulate` y no `/quick-simulate`: el modal de detalle necesita TEA,
 * TCEA y el cronograma completo, y la variante rápida no devuelve ninguno de los
 * tres.
 *
 * Sobre las tasas: mientras el convenio de la landing no tenga una tasa
 * especial cargada, el backend responde con su tabla de tasas por plazo. Son las
 * tasas reales del sistema, no un valor de ejemplo del componente. Esa
 * distinción importa: la TCEA es información regulada, y un valor por defecto
 * inventado en el front no puede publicarse como si fuera la tasa del producto.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

/** Una fila del cronograma, tal como la devuelve el backend. */
export interface CuotaCronograma {
  numero: number;
  fechaVencimiento: string;
  capital: number;
  interes: number;
  total: number;
  saldoPendiente: number;
}

/** Resultado de la simulación, ya normalizado para la UI. */
export interface SimulacionFinanciamiento {
  montoFinanciado: number;
  plazoMeses: number;
  cuotaMensual: number;
  totalAPagar: number;
  interesTotal: number;
  /** Tasa efectiva anual en porcentaje. `null` cuando el backend no la resuelve. */
  tea: number | null;
  /** Tasa de costo efectivo anual en porcentaje. `null` cuando el backend no la resuelve. */
  tcea: number | null;
  primerVencimiento: string | null;
  cronograma: CuotaCronograma[];
}

interface RespuestaSimulacion {
  financed_amount?: number;
  term_months?: number;
  monthly_payment?: number;
  total_amount?: number;
  total_interest?: number;
  tea?: number | null;
  tcea?: number | null;
  first_due_date?: string | null;
  schedule?: Array<{
    number?: number;
    due_date?: string;
    principal?: number;
    interest?: number;
    total?: number;
    remaining?: number;
  }>;
}

export class ErrorSimulacion extends Error {
  constructor(mensaje: string, readonly status?: number) {
    super(mensaje);
    this.name = 'ErrorSimulacion';
  }
}

/**
 * Simula el financiamiento de una matrícula.
 *
 * @param montoTotal  Suma del monto de matrícula y el de la primera cuota.
 * @param plazoMeses  Cantidad de cuotas mensuales.
 * @param landingSlug Slug de la landing. Es lo que habilita la tasa del convenio.
 */
export async function simularFinanciamiento(
  montoTotal: number,
  plazoMeses: number,
  landingSlug: string,
  signal?: AbortSignal
): Promise<SimulacionFinanciamiento> {
  const url = `${API_BASE_URL}/public/simulate?landing_slug=${encodeURIComponent(landingSlug)}`;

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      product_price: montoTotal,
      term_months: plazoMeses,
      // La matrícula no admite cuota inicial: se financia el total.
      initial_payment: 0,
    }),
  });

  if (!respuesta.ok) {
    throw new ErrorSimulacion(
      `El simulador respondió ${respuesta.status}`,
      respuesta.status
    );
  }

  const datos: RespuestaSimulacion = await respuesta.json();

  return {
    montoFinanciado: datos.financed_amount ?? montoTotal,
    plazoMeses: datos.term_months ?? plazoMeses,
    cuotaMensual: datos.monthly_payment ?? 0,
    totalAPagar: datos.total_amount ?? 0,
    interesTotal: datos.total_interest ?? 0,
    // Se preserva el null en vez de convertirlo a 0: "no hay tasa" y "la tasa es
    // cero" son cosas distintas, y la UI las muestra distinto.
    tea: datos.tea ?? null,
    tcea: datos.tcea ?? null,
    primerVencimiento: datos.first_due_date ?? null,
    cronograma: (datos.schedule ?? []).map((fila, indice) => ({
      numero: fila.number ?? indice + 1,
      fechaVencimiento: fila.due_date ?? '',
      capital: fila.principal ?? 0,
      interes: fila.interest ?? 0,
      total: fila.total ?? 0,
      saldoPendiente: fila.remaining ?? 0,
    })),
  };
}
