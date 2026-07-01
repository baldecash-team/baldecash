/**
 * institutionalDomains — configuración editable de correos institucionales.
 *
 * Primera pasada: mapa pequeño de las principales instituciones y sus dominios
 * de correo. Sirve para, cuando el postulante ingresa un "correo institucional"
 * en el gate de OTP, marcar si pertenece a una institución conocida
 * (`is_institutional: true`) o si es texto libre (`is_institutional: false`)
 * para análisis posterior.
 *
 * Para agregar/editar instituciones basta con tocar `INSTITUTIONAL_DOMAINS`.
 * Cada entrada mapea un CÓDIGO corto de institución a la lista de dominios
 * válidos (en minúsculas, sin el `@`).
 */

/** Código de institución conocido (clave del mapa). */
export type InstitutionCode =
  | 'UPN'
  | 'UPC'
  | 'PUCP'
  | 'UP'
  | 'UCV'
  | 'SENATI'
  | 'UCB';

/**
 * Mapa institución → dominios de correo válidos.
 * Mantener en minúsculas. Editar aquí para sumar nuevas instituciones.
 */
export const INSTITUTIONAL_DOMAINS: Record<InstitutionCode, string[]> = {
  UPN: ['upn.pe'],
  UPC: ['upc.edu.pe'],
  PUCP: ['pucp.edu.pe'],
  UP: ['up.edu.pe', 'alum.up.edu.pe'],
  UCV: ['ucvvirtual.edu.pe'],
  SENATI: ['senati.pe'],
  // UCB — placeholder: dominio pendiente de confirmar con negocio.
  UCB: ['ucb.edu.pe'],
};

export interface InstitutionalCheckResult {
  /** true si el correo tiene forma válida y su dominio pertenece al mapa. */
  isInstitutional: boolean;
  /** Código de la institución detectada, o null si no coincide / es inválido. */
  institutionCode: InstitutionCode | null;
  /** Dominio normalizado extraído del correo (minúsculas), o null si inválido. */
  domain: string | null;
}

/** Regex simple para validar forma básica de email (primera pasada). */
const EMAIL_RE = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;

/**
 * Evalúa un correo institucional contra el mapa de dominios conocidos.
 *
 * - Correo con forma inválida → { isInstitutional: false, institutionCode: null }.
 * - Correo válido cuyo dominio está en el mapa → isInstitutional: true + código.
 * - Correo válido con dominio desconocido → isInstitutional: false (texto libre,
 *   se permite igual para análisis futuro).
 */
export function checkInstitutionalEmail(email: string): InstitutionalCheckResult {
  const match = EMAIL_RE.exec((email ?? '').trim().toLowerCase());
  if (!match) {
    return { isInstitutional: false, institutionCode: null, domain: null };
  }

  const domain = match[1];
  for (const [code, domains] of Object.entries(INSTITUTIONAL_DOMAINS) as [
    InstitutionCode,
    string[],
  ][]) {
    // Coincide si el dominio es exacto o subdominio de uno conocido
    // (ej. "alumnos.upn.pe" cae bajo "upn.pe").
    if (domains.some((d) => domain === d || domain.endsWith(`.${d}`))) {
      return { isInstitutional: true, institutionCode: code, domain };
    }
  }

  return { isInstitutional: false, institutionCode: null, domain };
}
