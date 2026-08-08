/**
 * Agrupar las opciones por modalidad de inicial y por plazo.
 *
 * El caso que define todo es el del cosechador: seis celdas del backend que la
 * persona percibe como dos plazos —10 y 17 semanas— con tres formas de pagar la
 * inicial cada uno. Si se ofrecen los seis como plazos sueltos, quien elige
 * "13 semanas" no ve que está eligiendo pagar la inicial en cuatro partes.
 */

import type { PaymentPlan } from '../../types/detail';
import {
  aplanarOpciones,
  buscarOpcion,
  modalidadesDisponibles,
  plazoTrasCambiarModalidad,
  plazosDeLaModalidad,
} from '../modalidadInicial';

/** Un plan con una sola opción, que es como los manda el backend por celda. */
function plan(term: number, installments: number, quota: number): PaymentPlan {
  return {
    term,
    termMonths: null,
    paymentFrequency: 'semanal',
    tea: 40,
    tcea: 40,
    options: [
      {
        initialPercent: 25,
        initialAmount: 134,
        monthlyQuota: quota,
        commissionAmount: null,
        tea: 40,
        teaIrr: 40,
        tcea: 40,
        initialInstallments: installments,
        initialInstallmentAmounts:
          installments > 1 ? Array(installments).fill(134 / installments) : [],
        totalTerm: installments > 1 ? term + installments : term,
      },
    ],
  } as PaymentPlan;
}

/** Las seis celdas reales del perfil cosechador. */
const COSECHADOR: PaymentPlan[] = [
  plan(10, 1, 41.5), plan(8, 2, 51.5), plan(6, 4, 68.3),
  plan(17, 1, 25), plan(15, 2, 28.1), plan(13, 4, 32.2),
];

describe('modalidades de inicial', () => {
  it('ofrece las tres formas de pagar, de menos a más partes', () => {
    expect(modalidadesDisponibles(COSECHADOR).map((m) => m.installments)).toEqual([1, 2, 4]);
  });

  it('las etiqueta para la pantalla', () => {
    expect(modalidadesDisponibles(COSECHADOR).map((m) => m.label)).toEqual([
      'En 1 pago', 'En 2 armadas', 'En 4 armadas',
    ]);
  });

  it('el pago único muestra el total de la inicial', () => {
    const [unico] = modalidadesDisponibles(COSECHADOR);
    expect(unico.amounts).toEqual([134]);
  });

  it('las armadas muestran el monto de cada parte', () => {
    const cuatro = modalidadesDisponibles(COSECHADOR).find((m) => m.installments === 4);
    expect(cuatro?.amounts).toHaveLength(4);
  });

  it('un producto sin armadas ofrece una sola modalidad', () => {
    // El catálogo entero que no configuró armadas.
    expect(modalidadesDisponibles([plan(24, 1, 100)])).toHaveLength(1);
  });
});

describe('plazos por modalidad', () => {
  it('las seis celdas colapsan en dos plazos', () => {
    const totales = new Set(aplanarOpciones(COSECHADOR).map((o) => o.totalTerm));
    expect(totales).toEqual(new Set([10, 17]));
  });

  it.each([[1], [2], [4]])('la modalidad de %i parte(s) ofrece 10 y 17', (n) => {
    expect(plazosDeLaModalidad(COSECHADOR, n).map((o) => o.totalTerm)).toEqual([10, 17]);
  });

  it('cada plazo conserva sus cuotas reales', () => {
    // 17 semanas con 4 armadas son 13 cuotas: es lo que viaja a legacy.
    const opcion = buscarOpcion(COSECHADOR, 4, 17);
    expect(opcion?.term).toBe(13);
    expect(opcion?.option.monthlyQuota).toBe(32.2);
  });

  it('el pago único a 17 semanas son 17 cuotas', () => {
    expect(buscarOpcion(COSECHADOR, 1, 17)?.term).toBe(17);
  });

  it('una combinación inexistente devuelve null', () => {
    expect(buscarOpcion(COSECHADOR, 4, 24)).toBeNull();
  });
});

describe('al cambiar de modalidad', () => {
  it('conserva el plazo si la nueva modalidad lo ofrece', () => {
    expect(plazoTrasCambiarModalidad(COSECHADOR, 4, 17)).toBe(17);
  });

  it('cae al más largo cuando el plazo no existe en la nueva', () => {
    // El más largo es el de cuota más baja: es el default razonable.
    const soloCorto = [plan(10, 1, 41.5), plan(6, 4, 68.3)];
    expect(plazoTrasCambiarModalidad(soloCorto, 4, 17)).toBe(10);
  });

  it('sin plazo previo elige el más largo', () => {
    expect(plazoTrasCambiarModalidad(COSECHADOR, 1, null)).toBe(17);
  });

  it('devuelve null si la modalidad no tiene plazos', () => {
    expect(plazoTrasCambiarModalidad(COSECHADOR, 3, 17)).toBeNull();
  });
});
