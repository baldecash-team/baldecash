/**
 * Fecha mínima y máxima del campo «Fecha» (BAL-4396).
 *
 * El wizard manda `date_min` / `date_max` como texto: una fecha fija
 * `AAAA-MM-DD` o un relativo a hoy (`-18y` = hace 18 años, `+6m`, `-30d`,
 * `0d` = hoy). Ausentes o null = sin límite extra (como antes: solo manda
 * `date_range`).
 *
 * Es la MISMA regla que `app/services/fecha_limites.py` en ws2, que vuelve a
 * validar al recibir el envío: para el mismo texto los dos tienen que dar el
 * mismo día. Al sumar meses o años, si el día no existe en el mes destino
 * (29-feb, 31-abr) se cae al último día del mes. «Hoy» es el de Lima.
 *
 * Todo trabaja con textos `AAAA-MM-DD` (se comparan como texto) para no
 * depender de la zona horaria del navegador.
 */

import * as Sentry from '@sentry/nextjs';

const RELATIVA = /^([+-]?)(\d{1,3})([dmy])$/;
const FIJA = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (n: number, largo = 2) => String(n).padStart(largo, '0');

const aIso = (anio: number, mes: number, dia: number) => `${pad(anio, 4)}-${pad(mes)}-${pad(dia)}`;

const diasDelMes = (anio: number, mes: number) => new Date(Date.UTC(anio, mes, 0)).getUTCDate();

/** Hoy en Lima, como `AAAA-MM-DD`. */
export function hoyLima(ahora: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(ahora);
  } catch (error) {
    // Navegador sin zonas horarias: Perú es UTC-5 todo el año. Se avisa sin
    // datos (solo el motivo) para saber si pasa de verdad.
    Sentry.captureException(error, { tags: { modulo: 'fecha_limites', accion: 'hoy_lima' } });
    const lima = new Date(ahora.getTime() - 5 * 60 * 60 * 1000);
    return aIso(lima.getUTCFullYear(), lima.getUTCMonth() + 1, lima.getUTCDate());
  }
}

function sumarMeses(iso: string, meses: number): string {
  const [anio, mes, dia] = iso.split('-').map(Number);
  const total = mes - 1 + meses;
  const nuevoAnio = anio + Math.floor(total / 12);
  const nuevoMes = (((total % 12) + 12) % 12) + 1;
  return aIso(nuevoAnio, nuevoMes, Math.min(dia, diasDelMes(nuevoAnio, nuevoMes)));
}

function sumarDias(iso: string, dias: number): string {
  const [anio, mes, dia] = iso.split('-').map(Number);
  const d = new Date(Date.UTC(anio, mes - 1, dia + dias));
  return aIso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

function esFechaReal(iso: string): boolean {
  const m = FIJA.exec(iso);
  if (!m) return false;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= diasDelMes(anio, mes);
}

/** El día concreto de un límite, o null si no hay (o el texto no se entiende). */
export function resolverLimite(spec: string | null | undefined, hoy: string = hoyLima()): string | null {
  if (spec == null) return null;
  const limpio = String(spec).trim().toLowerCase();
  if (!limpio) return null;

  const rel = RELATIVA.exec(limpio);
  if (rel) {
    const n = Number(rel[2]) * (rel[1] === '-' ? -1 : 1);
    if (rel[3] === 'd') return sumarDias(hoy, n);
    if (rel[3] === 'm') return sumarMeses(hoy, n);
    return sumarMeses(hoy, n * 12);
  }
  return esFechaReal(limpio) ? limpio : null;
}

/** `AAAA-MM-DD` → `DD/MM/AAAA`. */
export function ddmmaaaa(iso: string): string {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/** El texto automático cuando el campo no trae mensaje propio. */
export function mensajeFueraDeRango(min: string | null, max: string | null): string {
  if (min && max) return `Elige una fecha entre el ${ddmmaaaa(min)} y el ${ddmmaaaa(max)}.`;
  if (min) return `Elige una fecha desde el ${ddmmaaaa(min)}.`;
  return `Elige una fecha hasta el ${ddmmaaaa(max as string)}.`;
}

/** Error si `valor` (AAAA-MM-DD) queda fuera; null si cumple, está vacío o no es fecha. */
export function errorDeFecha(
  valor: string | null | undefined,
  minSpec: string | null | undefined,
  maxSpec: string | null | undefined,
  mensaje?: string | null,
  hoy: string = hoyLima()
): string | null {
  const v = (valor ?? '').trim().slice(0, 10);
  if (!esFechaReal(v)) return null;
  const min = resolverLimite(minSpec, hoy);
  const max = resolverLimite(maxSpec, hoy);
  if ((min && v < min) || (max && v > max)) {
    return (mensaje ?? '').trim() || mensajeFueraDeRango(min, max);
  }
  return null;
}

export interface LimitesDeFecha {
  min: string | null;
  max: string | null;
  mensaje: string | null;
}

/** Los límites ya resueltos de un campo del wizard. */
export function limitesDelCampo(
  field: { date_min?: string | null; date_max?: string | null; date_limit_message?: string | null },
  hoy: string = hoyLima()
): LimitesDeFecha {
  return {
    min: resolverLimite(field.date_min, hoy),
    max: resolverLimite(field.date_max, hoy),
    mensaje: (field.date_limit_message ?? '').trim() || null,
  };
}
