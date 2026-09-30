/**
 * Primera fecha de pago del formulario (BAL-4305). La calcula ws2 con la misma
 * regla que el cronograma del legacy: corte por día, diferido al mes destino
 * (`paga-en-<mes>`), fecha fija de campaña y fin de semana al lunes.
 *
 * Antes la web sumaba "+1 mes si hay diferido" y en renueva (paga-en-diciembre)
 * mostraba noviembre. Devuelve null ante cualquier error: el componente cae a
 * su cálculo local y el texto no desaparece.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export async function obtenerPrimeraFechaPago(
  landingSlug: string,
  paymentDay: number,
): Promise<string | null> {
  try {
    const url = `${API_BASE_URL}/public/landing/${encodeURIComponent(landingSlug)}/first-payment-date?payment_day=${paymentDay}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.date === 'string' ? data.date : null;
  } catch {
    return null;
  }
}

/**
 * `2026-12-18` → `18 de diciembre del 2026`. Se parte el texto a mano: con
 * `new Date(iso)` el navegador lo lee en UTC y en Lima retrocede un día.
 */
export function formatearFechaIso(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const mes = MESES[Number(m[2]) - 1];
  if (!mes) return null;
  return `${Number(m[3])} de ${mes} del ${m[1]}`;
}
