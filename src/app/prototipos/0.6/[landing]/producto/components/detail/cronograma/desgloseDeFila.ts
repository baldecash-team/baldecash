/**
 * El desglose de una fila del cronograma: capital, interés, comisión y monto.
 *
 * La regla que no se puede romper es que **las columnas sumen el monto**. Se
 * consigue derivando el capital por resta y no calculándolo aparte: si cada
 * parte se redondea por su cuenta, la tabla muestra un capital que no cuadra
 * con lo que la persona paga.
 *
 * `conCentavos` decide si se trunca. Todo el catálogo muestra montos enteros
 * —el motor los redondea con `floor`, así que truncar al pintarlos nunca
 * cambiaba nada— y Family Farms es el primer convenio con centavos reales,
 * donde truncar miente: la cuota es S/32,20 y la armada S/33,50.
 */

import type { FilaCronograma } from './filasDelCronograma';

/** La fila de amortización que corresponde a esta cuota, si amortiza. */
export interface AmortizacionDeFila {
  interest: number;
  balance: number;
}

export interface OpcionesDesglose {
  amort?: AmortizacionDeFila;
  /** Comisión por cuota. `null` o 0 = la landing no cobra comisión. */
  commissionAmount?: number | null;
  conCentavos: boolean;
}

export interface Desglose {
  monto: number;
  capital: number;
  interest: number;
  commission: number;
  balance: number;
  esArmada: boolean;
}

/** Trunca salvo que la landing muestre centavos. */
function ajustar(valor: number, conCentavos: boolean): number {
  if (!Number.isFinite(valor)) return 0;
  return conCentavos ? valor : Math.floor(valor);
}

export function desgloseDeFila(
  fila: FilaCronograma,
  { amort, commissionAmount, conCentavos }: OpcionesDesglose,
): Desglose {
  const monto = ajustar(fila.monto, conCentavos);

  // Una armada es parte de la inicial: no amortiza capital ni genera interés
  // —el principal ya viene con la inicial restada—, así que repartirla en
  // capital e interés sería inventar números que no existen en el préstamo.
  if (fila.esArmada) {
    return {
      monto, capital: monto, interest: 0, commission: 0,
      balance: ajustar(amort?.balance ?? 0, conCentavos),
      esArmada: true,
    };
  }

  const commission = commissionAmount != null && commissionAmount > 0
    ? ajustar(commissionAmount, conCentavos)
    : 0;
  const interest = ajustar(amort?.interest ?? 0, conCentavos);

  return {
    monto,
    // Por resta, para que las columnas cierren en el monto exacto.
    capital: monto - interest - commission,
    interest,
    commission,
    balance: ajustar(amort?.balance ?? 0, conCentavos),
    esArmada: false,
  };
}
