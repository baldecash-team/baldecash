/**
 * El cliente del endpoint de simulacion de la landing.
 *
 * Es la unica fuente de la cuota: el componente no hace una sola operacion
 * aritmetica. Tres puntos donde una segunda implementacion se desviaria —la
 * tasa mensual es la raiz doceava de uno mas la tasa anual y no la anual entre
 * doce; el redondeo mueve la cuota hasta un sol; y el costo efectivo sale de una
 * busqueda iterativa que dos implementaciones no resuelven igual—, y lo que se
 * registra en la solicitud es siempre lo que calculo el backend.
 */
import { simularCalculadora, ErrorSimulacion } from './simuladorApi';

const LANDING = 'prestamo-matricula';

/** Respuesta del endpoint para 950 soles a 3 meses, con tasa 80 y comision 25. */
const RESPUESTA = {
  monto: 950,
  plazo: 3,
  inicial_percent: 0,
  inicial_amount: 0,
  financiado: 950,
  cuota: 373.98,
  cuota_base: 348.98,
  comision: 25.0,
  comision_desglose: [
    { concepto: 'Gestion del prestamo', monto: 8.93 },
    { concepto: 'Plataforma de pagos', monto: 5.36 },
  ],
  comision_total: 75.0,
  interes_total: 96.94,
  total_a_pagar: 1121.94,
  tea: 80.0,
  tcea: 201.81,
  mora_diaria: 1.0,
  cronograma: [
    { n: 1, fecha: '2026-09-20', cuota: 373.98 },
    { n: 2, fecha: '2026-10-20', cuota: 373.98 },
    { n: 3, fecha: '2026-11-20', cuota: 373.98 },
  ],
};

function responder(cuerpo: unknown, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => cuerpo,
  }) as unknown as typeof fetch;
}

describe('simularCalculadora', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('pide la cuota al endpoint propio de la landing', async () => {
    responder(RESPUESTA);

    await simularCalculadora(950, 3, LANDING);

    const [url, opciones] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`/public/landing/${LANDING}/calculadora/simulate`);
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body)).toEqual({
      monto: 950,
      plazo: 3,
      inicial_percent: 0,
    });
  });

  /**
   * La cuota que se muestra es la que incluye la comision. La base existe
   * aparte solo para el desglose del modal.
   */
  it('la cuota mensual es la que incluye la comision', async () => {
    responder(RESPUESTA);

    const simulacion = await simularCalculadora(950, 3, LANDING);

    expect(simulacion.cuotaMensual).toBe(373.98);
    expect(simulacion.cuotaBase).toBe(348.98);
    expect(simulacion.comisionMensual).toBe(25.0);
  });

  /**
   * El desglose es lo que el modal necesitaba y el simulador generico no
   * entregaba: sin el, el texto legal solo puede decir que la cuota "incluye
   * comisiones operativas", sin decir cuales.
   */
  it('trae el desglose de la comision por concepto', async () => {
    responder(RESPUESTA);

    const simulacion = await simularCalculadora(950, 3, LANDING);

    expect(simulacion.comisionDesglose).toEqual([
      { concepto: 'Gestion del prestamo', monto: 8.93 },
      { concepto: 'Plataforma de pagos', monto: 5.36 },
    ]);
    expect(simulacion.comisionTotal).toBe(75.0);
  });

  it('trae la mora diaria, que hoy esta escrita a mano en el texto legal', async () => {
    responder(RESPUESTA);

    expect((await simularCalculadora(950, 3, LANDING)).moraDiaria).toBe(1.0);
  });

  it('normaliza el cronograma a la forma que dibuja el modal', async () => {
    responder(RESPUESTA);

    const { cronograma, primerVencimiento } = await simularCalculadora(950, 3, LANDING);

    expect(cronograma).toHaveLength(3);
    expect(cronograma[0]).toEqual({
      numero: 1,
      fechaVencimiento: '2026-09-20',
      total: 373.98,
    });
    expect(primerVencimiento).toBe('2026-09-20');
  });

  it('conserva el total y el interes tal como los devolvio el backend', async () => {
    responder(RESPUESTA);

    const simulacion = await simularCalculadora(950, 3, LANDING);

    expect(simulacion.totalAPagar).toBe(1121.94);
    expect(simulacion.interesTotal).toBe(96.94);
    expect(simulacion.montoFinanciado).toBe(950);
    expect(simulacion.tea).toBe(80.0);
    expect(simulacion.tcea).toBe(201.81);
  });

  /**
   * Un monto fuera de rango, un monto que no respeta el salto, o un plazo sin
   * celda de precio devuelven 422. Antes esas combinaciones caian en silencio a
   * la regla global y registraban la solicitud con otra tasa.
   */
  it('un 422 se propaga con su estado, para que el componente limpie la cuota', async () => {
    responder({ detail: 'monto fuera de rango [1, 10000]' }, false, 422);

    await expect(simularCalculadora(20000, 3, LANDING)).rejects.toThrow(ErrorSimulacion);

    responder({ detail: 'monto fuera de rango [1, 10000]' }, false, 422);
    await expect(simularCalculadora(20000, 3, LANDING)).rejects.toMatchObject({ status: 422 });
  });

  it('propaga la senal de cancelacion, para anular la simulacion anterior', async () => {
    responder(RESPUESTA);
    const controlador = new AbortController();

    await simularCalculadora(950, 3, LANDING, controlador.signal);

    const [, opciones] = (global.fetch as jest.Mock).mock.calls[0];
    expect(opciones.signal).toBe(controlador.signal);
  });
});
