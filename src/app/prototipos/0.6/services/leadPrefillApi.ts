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

  /**
   * Institución y sede que el socio declaró en el push.
   *
   * Los `_id` son la fila del catálogo —`study_center` para `institution`,
   * `agreement_branch` para `sede`—, o sea exactamente lo que esos campos
   * guardan cuando la persona los elige a mano. Los `_name` vienen para que el
   * select los muestre sin una segunda vuelta al servidor.
   *
   * `institution_type` llega ya traducido al vocabulario del formulario
   * (`university` | `institute` | `school`), que no es el de `study_center`.
   * Puede venir `null` con `institution_id` presente: el catálogo tiene tipos
   * que el formulario no ofrece (ver `useLeadPrefill`).
   *
   * Opcionales en el tipo —no solo nullables— porque el backend que los sirve
   * puede ser anterior al frontend que los lee: durante esa ventana las claves
   * no vienen en el JSON.
   */
  institution_id?: number | null;
  institution_name?: string | null;
  institution_type?: string | null;
  sede_id?: number | null;
  sede_name?: string | null;

  /**
   * Socio que empujó este lead (`a365`). No es un dato de la persona: es quién
   * nos la trajo, lo mismo que ya viaja en `utm_campaign`. El formulario lo usa
   * para destapar los campos propios de ese socio en landings que comparte con
   * el tráfico orgánico.
   *
   * Opcional por la misma razón que institución y sede: el backend que lo sirve
   * puede ser anterior al frontend que lo lee.
   */
  partner_code?: string | null;
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
