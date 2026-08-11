/**
 * Los planes de pago viajan con el equipo elegido hasta /solicitar.
 *
 * El selector de plazo del wizard rotula «17 semanas · 2 armadas» leyendo los
 * planes del producto guardado. El detalle de copia-home los mandaba en
 * `undefined` —el detalle estándar y el gamer sí los mandan—, así que en Family
 * Farms el selector perdía las armadas y quien elegía «15» no veía que estaba
 * eligiendo pagar la inicial en dos partes.
 */

import { etiquetasDePlazo } from '../../../solicitar/components/solicitar/product/etiquetaDePlazo';
import type { PlanDePago } from '../../../solicitar/components/solicitar/product/etiquetaDePlazo';

/** Las seis celdas del cosechador: dos plazos totales, tres modalidades cada uno. */
const PLANES: PlanDePago[] = [
  { term: 6, options: [{ initialPercent: 25, initialInstallments: 4 }] },
  { term: 8, options: [{ initialPercent: 25, initialInstallments: 2 }] },
  { term: 10, options: [{ initialPercent: 25, initialInstallments: 1 }] },
  { term: 13, options: [{ initialPercent: 25, initialInstallments: 4 }] },
  { term: 15, options: [{ initialPercent: 25, initialInstallments: 2 }] },
  { term: 17, options: [{ initialPercent: 25, initialInstallments: 1 }] },
];

describe('los planes que el detalle guarda con el equipo', () => {
  it('con planes, el selector nombra el plazo total y las armadas', () => {
    const etiquetas = etiquetasDePlazo(PLANES, 'semanal');

    expect(etiquetas.get(15)).toBe('17 semanas · 2 armadas');
    expect(etiquetas.get(13)).toBe('17 semanas · 4 armadas');
    expect(etiquetas.get(8)).toBe('10 semanas · 2 armadas');
  });

  it('sin planes se pierde el rótulo: es lo que pasaba al mandarlos en undefined', () => {
    expect(etiquetasDePlazo([], 'semanal').size).toBe(0);
  });

  it('sin armadas el resto del catálogo no se entera', () => {
    const sinArmadas: PlanDePago[] = [
      { term: 12, options: [{ initialPercent: 0, initialInstallments: 1 }] },
      { term: 24, options: [{ initialPercent: 0 }] },
    ];

    expect(etiquetasDePlazo(sinArmadas, 'quincenal').size).toBe(0);
  });
});
