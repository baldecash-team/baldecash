/**
 * Fija las tres decisiones que aíslan del catálogo a un producto que no salió
 * de él. Cada una corresponde a un sitio distinto del contexto de productos que
 * hoy le pisa la cuota o lo bloquea.
 */

import {
  estaFueraDelCatalogo,
  necesitaPlanesDePago,
  admiteRecalculoDeCuota,
  soloLosDelCatalogo,
} from '../productoFueraDeCatalogo';
import type { SelectedProduct } from '../ProductContext';

function producto(extra: Partial<SelectedProduct> = {}): SelectedProduct {
  return {
    id: '1585',
    name: 'Financiamiento de Matrícula',
    brand: 'BaldeCash',
    price: 950,
    monthlyPayment: 373.98,
    months: 3,
    term: 3,
    initialPercent: 0,
    initialAmount: 0,
    image: '',
    paymentFrequency: 'mensual',
    ...extra,
  } as SelectedProduct;
}

const planes = [
  {
    term: 6,
    termMonths: null,
    paymentFrequency: 'mensual',
    options: [{ initialPercent: 0, initialAmount: 0, monthlyQuota: 0 }],
  },
] as unknown as SelectedProduct['paymentPlans'];

describe('producto fuera del catálogo', () => {
  it('un producto normal no está marcado', () => {
    expect(estaFueraDelCatalogo(producto())).toBe(false);
  });

  it('reconoce el producto que la calculadora marcó', () => {
    expect(estaFueraDelCatalogo(producto({ outOfCatalog: true }))).toBe(true);
  });
});

describe('necesitaPlanesDePago', () => {
  it('un producto del catálogo sin planes sí los necesita', () => {
    expect(necesitaPlanesDePago(producto())).toBe(true);
  });

  it('un producto del catálogo que ya los tiene no los vuelve a pedir', () => {
    expect(necesitaPlanesDePago(producto({ paymentPlans: planes }))).toBe(false);
  });

  /**
   * Este es el caso del error: el producto de la calculadora nunca trae planes,
   * así que calificaba SIEMPRE, y la respuesta del catálogo le pisaba la cuota.
   */
  it('un producto fuera del catálogo no los pide aunque no los tenga', () => {
    expect(necesitaPlanesDePago(producto({ outOfCatalog: true }))).toBe(false);
  });
});

describe('admiteRecalculoDeCuota', () => {
  it('un producto del catálogo admite que se le recalcule la cuota', () => {
    expect(admiteRecalculoDeCuota(producto())).toBe(true);
  });

  /**
   * Cubre los dos caminos que recalculan: cambiar el plazo desde el resumen y
   * cambiar la inicial. Los dos reemplazarían la cuota del simulador por una de
   * la grilla del catálogo.
   */
  it('un producto fuera del catálogo conserva su cuota', () => {
    expect(admiteRecalculoDeCuota(producto({ outOfCatalog: true }))).toBe(false);
  });
});

describe('soloLosDelCatalogo', () => {
  it('deja afuera los marcados y conserva el resto', () => {
    const delCatalogo = producto({ id: '100' });
    const fuera = producto({ id: '1585', outOfCatalog: true });

    expect(soloLosDelCatalogo([delCatalogo, fuera])).toEqual([delCatalogo]);
  });

  /**
   * Con un solo producto y fuera del catálogo, la lista queda vacía. Quien
   * consuma esto tiene que tratar la lista vacía como "no hay nada que validar",
   * no como "no hay productos".
   */
  it('puede devolver una lista vacía', () => {
    expect(soloLosDelCatalogo([producto({ outOfCatalog: true })])).toEqual([]);
  });

  it('no modifica la lista recibida', () => {
    const lista = [producto({ outOfCatalog: true })];
    soloLosDelCatalogo(lista);

    expect(lista).toHaveLength(1);
  });
});
