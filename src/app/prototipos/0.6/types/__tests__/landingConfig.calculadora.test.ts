/**
 * El namespace `calculadora` de la configuracion de la landing.
 *
 * Toda la configuracion de negocio de la calculadora —producto, variante, rango
 * del monto, plazos, tasa y comision— vive en el backend: los plazos se derivan
 * de las celdas de precio y el resto del JSON de la landing. El componente no
 * define ninguno de esos valores, asi que cambiar la tasa deja de ser un
 * despliegue.
 *
 * Este lector es la unica puerta de entrada a ese namespace. Lo que no pasa por
 * aca no llega al componente.
 */
import { getCalculadora, type LandingConfig } from '../landingConfig';

function config(calculadora?: unknown): LandingConfig {
  return {
    layout: { has_catalog: true },
    features: {} as LandingConfig['features'],
    ...(calculadora !== undefined ? { calculadora } : {}),
  } as LandingConfig;
}

/** Namespace completo, tal como lo emite el backend para una landing sembrada. */
const COMPLETA = {
  enabled: true,
  efectivo_product_id: 1585,
  variant_id: 1411,
  monto: { min: 1, max: 10000, step: 1 },
  planes: [
    { plazo: 3, iniciales: [0], tea: 80.0, comision: 25.0 },
    { plazo: 6, iniciales: [0], tea: 80.0, comision: 25.0 },
    { plazo: 9, iniciales: [0], tea: 80.0, comision: 25.0 },
    { plazo: 12, iniciales: [0], tea: 80.0, comision: 25.0 },
  ],
  comision_desglose: [
    { concepto: 'Gestion del prestamo', monto: 8.93 },
    { concepto: 'Plataforma de pagos', monto: 5.36 },
  ],
  mora_diaria: 1.0,
};

describe('getCalculadora', () => {
  it('devuelve el namespace completo cuando la landing esta sembrada', () => {
    const cfg = getCalculadora(config(COMPLETA));

    expect(cfg).not.toBeNull();
    expect(cfg!.productId).toBe(1585);
    expect(cfg!.variantId).toBe(1411);
    expect(cfg!.amount).toEqual({ min: 1, max: 10000, step: 1 });
    expect(cfg!.dailyLateFee).toBe(1.0);
  });

  it('deriva los plazos de los planes, en orden', () => {
    const cfg = getCalculadora(config(COMPLETA));

    expect(cfg!.terms).toEqual([3, 6, 9, 12]);
  });

  it('ordena los plazos aunque el backend los mande desordenados', () => {
    const desordenados = {
      ...COMPLETA,
      planes: [
        { plazo: 12, iniciales: [0], tea: 80.0, comision: 25.0 },
        { plazo: 3, iniciales: [0], tea: 80.0, comision: 25.0 },
      ],
    };

    expect(getCalculadora(config(desordenados))!.terms).toEqual([3, 12]);
  });

  it('conserva el desglose de la comision para el texto legal del modal', () => {
    const cfg = getCalculadora(config(COMPLETA));

    expect(cfg!.commissionBreakdown).toHaveLength(2);
    expect(cfg!.commissionBreakdown[0]).toEqual({
      concept: 'Gestion del prestamo',
      amount: 8.93,
    });
  });

  /**
   * El identificador del producto viaja bajo `efectivo_product_id`.
   *
   * El documento de integracion muestra `product_id` en su fragmento de
   * ejemplo, y esa clave no existe en la respuesta. Leerla devuelve indefinido,
   * y sin producto no hay solicitud posible. La landing se apaga en vez de
   * entregar una calculadora que no puede continuar.
   */
  it('no acepta `product_id`: la clave del producto lleva prefijo', () => {
    const conClaveVieja = { ...COMPLETA } as Record<string, unknown>;
    delete conClaveVieja.efectivo_product_id;
    conClaveVieja.product_id = 1585;

    expect(getCalculadora(config(conClaveVieja))).toBeNull();
  });

  it('devuelve null cuando la calculadora esta apagada', () => {
    expect(getCalculadora(config({ ...COMPLETA, enabled: false }))).toBeNull();
  });

  it('devuelve null cuando el namespace esta ausente', () => {
    expect(getCalculadora(config())).toBeNull();
  });

  /**
   * Sin planes no hay nada que cotizar.
   *
   * El backend ya fuerza `enabled: false` en ese caso, pero el lector no confia
   * en eso: mostrar un control que despues no puede entregar una cuota es peor
   * que no mostrarlo.
   */
  it('devuelve null cuando no hay planes, aunque figure habilitada', () => {
    expect(getCalculadora(config({ ...COMPLETA, planes: [] }))).toBeNull();
  });

  it('devuelve null sin variante: sin ella la solicitud queda con dos tasas distintas', () => {
    const sinVariante = { ...COMPLETA } as Record<string, unknown>;
    delete sinVariante.variant_id;

    expect(getCalculadora(config(sinVariante))).toBeNull();
  });

  it('descarta un maximo invalido en vez de ofrecer un rango imposible', () => {
    expect(getCalculadora(config({ ...COMPLETA, monto: { min: 1, max: 0, step: 1 } }))).toBeNull();
  });

  /**
   * Un salto en cero haria que cualquier monto con decimales sea rechazado, y
   * los dos importes que se suman aca casi siempre traen centimos. Se conserva
   * el valor sembrado en vez de sustituirlo por un default.
   */
  it('conserva el salto sembrado, que es lo que deja pasar los centimos', () => {
    expect(getCalculadora(config(COMPLETA))!.amount.step).toBe(1);
  });

  it('tolera un desglose ausente: es texto legal, no condicion de arranque', () => {
    const sinDesglose = { ...COMPLETA } as Record<string, unknown>;
    delete sinDesglose.comision_desglose;

    const cfg = getCalculadora(config(sinDesglose));

    expect(cfg).not.toBeNull();
    expect(cfg!.commissionBreakdown).toEqual([]);
  });
});
