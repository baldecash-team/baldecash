/**
 * Datos del lead que un socio (A365) ya nos empujó, para prellenar el wizard.
 *
 * El link que el socio le manda a su postulante trae `alk` —el código del link
 * de activación— y nada más: documento, nombre, teléfono y correo se piden
 * contra ese código. Colgarlos como query params habría sido más simple, pero
 * los dejaría en el historial del navegador, en los logs del CDN y en el
 * `Referer` que se filtra a terceros.
 *
 * Backend: `GET /public/leads/by-link/{alk}` (ws2, `affiliate_lead_prefill.py`).
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface LeadPrefill {
  document_type: string;
  document_number: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
}

/**
 * `null` cuando no hay datos para ese link: código inexistente, link
 * desactivado o link de difusión (el backend devuelve 404 uniforme para los
 * tres a propósito). Nunca lanza: un prellenado que falla no puede impedir
 * que la persona llene el formulario a mano.
 */
export async function fetchLeadPrefill(alk: string): Promise<LeadPrefill | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/leads/by-link/${encodeURIComponent(alk)}`);
    if (!res.ok) return null;
    return (await res.json()) as LeadPrefill;
  } catch {
    return null;
  }
}
