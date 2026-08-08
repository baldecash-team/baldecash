/**
 * Agrupa las opciones de pago por modalidad de inicial y por plazo.
 *
 * El backend manda una opción por celda, y con armadas eso produce seis
 * opciones donde la persona percibe dos plazos: las armadas se descuentan del
 * total, así que 13 cuotas con 4 armadas y 15 con 2 son las dos "17 semanas".
 * Ofrecer los seis como plazos sueltos hace que quien elige "13 semanas" no vea
 * que está eligiendo pagar la inicial en cuatro partes.
 *
 * El orden de la pantalla es: primero cómo paga la inicial, después el plazo.
 * En el perfil del cosechador la inicial es obligatoria, así que es la primera
 * decisión real; el plazo se elige sobre lo que queda para esa modalidad.
 */

import type { InitialPaymentOption, PaymentPlan } from '../types/detail';

/** Una opción con el plazo al que pertenece, ya resuelto. */
export interface OpcionConPlazo {
  /** Plazo total que percibe la persona (armadas incluidas). */
  totalTerm: number;
  /** Cuotas de financiamiento: lo que viaja a legacy. */
  term: number;
  /** En cuántas partes se paga la inicial. 1 = un solo pago. */
  installments: number;
  option: InitialPaymentOption;
}

/** Las modalidades de inicial disponibles, en el orden en que se muestran. */
export interface ModalidadInicial {
  installments: number;
  /** Texto para el chip: «En 1 pago», «En 2 armadas»… */
  label: string;
  /** Monto de cada parte. Con pago único es el total de la inicial. */
  amounts: number[];
}

/** Aplana los planes a opciones con su plazo total resuelto. */
export function aplanarOpciones(plans: PaymentPlan[]): OpcionConPlazo[] {
  return plans.flatMap((plan) =>
    plan.options.map((option) => {
      const installments = option.initialInstallments ?? 1;
      return {
        // `?? ` y no `||`: un totalTerm de 0 no existe, pero si el backend no
        // lo mandó hay que reconstruirlo con la misma regla.
        totalTerm:
          option.totalTerm ?? (installments > 1 ? plan.term + installments : plan.term),
        term: plan.term,
        installments,
        option,
      };
    }),
  );
}

/**
 * Las modalidades de inicial que ofrece el producto, ordenadas de menos a más
 * partes: pagar de una es lo simple y va primero.
 */
export function modalidadesDisponibles(plans: PaymentPlan[]): ModalidadInicial[] {
  const porInstallments = new Map<number, ModalidadInicial>();

  for (const { installments, option } of aplanarOpciones(plans)) {
    if (porInstallments.has(installments)) continue;
    porInstallments.set(installments, {
      installments,
      label: installments > 1 ? `En ${installments} armadas` : 'En 1 pago',
      amounts:
        installments > 1
          ? (option.initialInstallmentAmounts ?? [])
          : [option.initialAmount],
    });
  }

  return [...porInstallments.values()].sort((a, b) => a.installments - b.installments);
}

/**
 * Los plazos disponibles para una modalidad, de menor a mayor.
 *
 * Devuelve el plazo TOTAL, que es lo que la persona elige, junto con la opción
 * que le corresponde — de ahí salen la cuota y el número de cuotas reales.
 */
export function plazosDeLaModalidad(
  plans: PaymentPlan[],
  installments: number,
): OpcionConPlazo[] {
  return aplanarOpciones(plans)
    .filter((o) => o.installments === installments)
    .sort((a, b) => a.totalTerm - b.totalTerm);
}

/**
 * La opción exacta para una modalidad y un plazo total.
 *
 * `null` cuando esa combinación no existe: no todas las modalidades ofrecen
 * los mismos plazos, así que al cambiar de modalidad hay que revalidar el
 * plazo elegido en vez de asumir que sigue estando.
 */
export function buscarOpcion(
  plans: PaymentPlan[],
  installments: number,
  totalTerm: number,
): OpcionConPlazo | null {
  return (
    aplanarOpciones(plans).find(
      (o) => o.installments === installments && o.totalTerm === totalTerm,
    ) ?? null
  );
}

/**
 * Plazo que queda seleccionado al cambiar de modalidad.
 *
 * Se conserva el que tenía si esa modalidad lo ofrece; si no, se cae al más
 * largo, que es el de cuota más baja. Sin esto, cambiar de modalidad podía
 * dejar la pantalla sin plazo válido y sin cuota que mostrar.
 */
export function plazoTrasCambiarModalidad(
  plans: PaymentPlan[],
  installments: number,
  plazoActual: number | null,
): number | null {
  const disponibles = plazosDeLaModalidad(plans, installments);
  if (disponibles.length === 0) return null;
  if (plazoActual !== null && disponibles.some((o) => o.totalTerm === plazoActual)) {
    return plazoActual;
  }
  return disponibles[disponibles.length - 1].totalTerm;
}
