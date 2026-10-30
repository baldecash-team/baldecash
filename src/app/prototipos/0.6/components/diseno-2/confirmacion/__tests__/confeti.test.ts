/**
 * F8 (BAL-4967): el confeti de la cabecera, apagado con
 * `prefers-reduced-motion`. BAL-5361: confeti mínimo, que cae una vez. BAL-5401: 12 piezas.
 */
import { piezasDeConfeti, TOTAL_PIEZAS_CONFETI, COLORES_CONFETI, CAIDAS_CONFETI } from '../confeti';

describe('piezasDeConfeti', () => {
  it('arma 12 piezas sin reduced-motion, y caen una sola vez', () => {
    const piezas = piezasDeConfeti(false);
    expect(piezas).toHaveLength(12);
    expect(TOTAL_PIEZAS_CONFETI).toBe(12);
    expect(CAIDAS_CONFETI).toBe(1);
  });

  it('las 4 primeras son las piezas del prototipo de Brenda (v56)', () => {
    expect(piezasDeConfeti(false).slice(0, 4).map((p) => [p.left, p.width, p.height, p.background, p.sway, p.duracion, p.demora])).toEqual([
      ['7%', 6, 6, '#FFD666', '-35px', '2.80s', '0.00s'],
      ['44%', 9, 15, '#5FD3BE', '-12px', '3.25s', '0.30s'],
      ['81%', 12, 18, '#FFFFFF', '11px', '3.70s', '0.60s'],
      ['18%', 6, 6, '#9AA5F0', '34px', '4.15s', '0.90s'],
    ]);
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
