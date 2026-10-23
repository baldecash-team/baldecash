/**
 * F8 (BAL-4967): el confeti de la cabecera — 26 piezas, apagado con
 * `prefers-reduced-motion`.
 */
import { piezasDeConfeti, TOTAL_PIEZAS_CONFETI, COLORES_CONFETI } from '../confeti';

describe('piezasDeConfeti', () => {
  it('arma 26 piezas sin reduced-motion', () => {
    const piezas = piezasDeConfeti(false);
    expect(piezas).toHaveLength(26);
    expect(TOTAL_PIEZAS_CONFETI).toBe(26);
  });

  it('no arma ninguna pieza con reduced-motion', () => {
    expect(piezasDeConfeti(true)).toEqual([]);
  });

  it('cada pieza usa uno de los 5 colores de marca', () => {
    const piezas = piezasDeConfeti(false);
    for (const p of piezas) {
      expect(COLORES_CONFETI).toContain(p.background);
    }
  });

  it('es determinista: la misma pieza siempre sale igual', () => {
    expect(piezasDeConfeti(false)[0]).toEqual(piezasDeConfeti(false)[0]);
  });
});
