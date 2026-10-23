'use client';

/**
 * El mes de la primera cuota de una landing diferida ("1.ª cuota en enero").
 *
 * Lo calcula ws2 (`first-payment-date`): acá solo se traduce el número de mes.
 * Sin respuesta, o si la landing no es diferida, devuelve `null` y no se
 * muestra nada. Lo usan el modal "Lo quiero" y el panel "Tu solicitud" de
 * Diseño 2, para que los dos digan lo mismo.
 */

import { useEffect, useState } from 'react';
import { obtenerPrimeraFechaPago } from '@/app/prototipos/0.6/[landing]/solicitar/utils/primeraFechaPago';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** `2026-12-18` → `diciembre`. Cualquier otra forma → `null`. */
export function mesDeFechaIso(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const m = /^\d{4}-(\d{2})-\d{2}$/.exec(iso);
  return m ? MESES[Number(m[1]) - 1] ?? null : null;
}

export function useMesPrimeraCuota(landing: string, esDiferida: boolean): string | null {
  const [mes, setMes] = useState<string | null>(null);
  useEffect(() => {
    if (!esDiferida) return;
    let cancelado = false;
    obtenerPrimeraFechaPago(landing).then((iso) => {
      if (cancelado) return;
      const nombre = mesDeFechaIso(iso);
      if (nombre) setMes(nombre);
    });
    return () => {
      cancelado = true;
    };
  }, [esDiferida, landing]);
  return esDiferida ? mes : null;
}
