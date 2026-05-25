'use client';

import { useEffect, useState } from 'react';
import { routes } from '@/app/prototipos/0.6/utils/routes';

const LEAD_ID_PREFIX = 'baldecash-lead-';
const LEAD_LANDING_PREFIX = 'baldecash-lead-landing-';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

/** Marca esta landing como tipo 'lead' en localStorage */
export function markLeadLanding(landing: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${LEAD_LANDING_PREFIX}${landing}`, '1');
}

/** Verifica si la landing es de tipo 'lead' (solo localStorage, síncrono) */
export function isLeadLandingType(landing: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`${LEAD_LANDING_PREFIX}${landing}`) === '1';
}

export function getLeadId(landing: string): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(`${LEAD_ID_PREFIX}${landing}`);
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? null : parsed;
}

export function saveLeadId(landing: string, leadId: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${LEAD_ID_PREFIX}${landing}`, String(leadId));
}

const LEAD_FIRST_NAME_PREFIX = 'baldecash-lead-first-name-';

/** Prefilla DNI y teléfono del wizard, y guarda el nombre del lead */
export function saveLeadPrefill(landing: string, data: {
  document_number: string;
  phone: string;
  first_name: string;
}): void {
  if (typeof window === 'undefined') return;
  const prefix = `baldecash-${landing}-wizard-field-`;
  if (data.document_number) localStorage.setItem(`${prefix}document_number`, data.document_number);
  if (data.phone) localStorage.setItem(`${prefix}phone`, data.phone);
  if (data.first_name) localStorage.setItem(`${LEAD_FIRST_NAME_PREFIX}${landing}`, data.first_name);
}

/** Retorna el nombre del lead registrado para esta landing */
export function getLeadFirstName(landing: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${LEAD_FIRST_NAME_PREFIX}${landing}`);
}

export function clearLeadId(landing: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${LEAD_ID_PREFIX}${landing}`);
}

/**
 * Consulta la API para saber si una landing es de tipo 'lead'.
 * Cachea el resultado en localStorage para no repetir la llamada.
 * Si la landing no es pública (draft), intenta con ?preview=true.
 * Retorna null si no se puede determinar (error de red).
 */
async function fetchIsLeadLanding(landing: string): Promise<boolean | null> {
  try {
    // Usar el endpoint /hero que sí expone landing_type
    const res = await fetch(`${API_BASE_URL}/public/landing/${landing}/hero`);
    if (!res.ok) return null;
    const data = await res.json();
    const isLead = data.landing?.landing_type === 'lead';
    if (isLead) markLeadLanding(landing);
    return isLead;
  } catch {
    return null;
  }
}

/**
 * Guard para landings tipo 'lead'.
 * - Si hay flag en localStorage: chequeo síncrono (rápido).
 * - Si no hay flag: consulta la API para verificar (cubre acceso directo por URL).
 * - Si es landing lead y no tiene lead_id → redirige a home con scroll al formulario.
 * - Retorna true cuando el acceso está permitido.
 */
export function useLeadGuard(landing: string) {
  // null = aún verificando, true/false = resultado final
  const [hasAccess, setHasAccess] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return true;
    // Si no está marcada como lead, permitir acceso optimistamente (API verificará)
    if (!isLeadLandingType(landing)) return null;
    // Está marcada como lead: chequear lead_id
    return getLeadId(landing) !== null;
  });

  useEffect(() => {
    const redirectToForm = () => {
      window.location.replace(`${routes.landingHome(landing)}#lead-form`);
    };

    // Si ya tenemos el flag de lead en localStorage
    if (isLeadLandingType(landing)) {
      const leadId = getLeadId(landing);
      if (leadId === null) {
        setHasAccess(false);
        redirectToForm();
      } else {
        setHasAccess(true);
      }
      return;
    }

    // No hay flag en localStorage → consultar API para verificar
    fetchIsLeadLanding(landing).then((isLead) => {
      if (isLead === null) {
        // No se pudo determinar (error de red) — permitir acceso para no bloquear
        setHasAccess(true);
        return;
      }
      if (!isLead) {
        // No es landing lead, acceso libre
        setHasAccess(true);
        return;
      }
      // Es landing lead: verificar lead_id
      const leadId = getLeadId(landing);
      if (leadId === null) {
        setHasAccess(false);
        redirectToForm();
      } else {
        setHasAccess(true);
      }
    });
  }, [landing]);

  // null = verificando (mostrar loading), true = acceso, false = redirigiendo
  return hasAccess;
}
