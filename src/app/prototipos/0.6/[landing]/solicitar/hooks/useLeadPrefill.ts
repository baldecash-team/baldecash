'use client';

/**
 * Prellenado del wizard con el lead que un socio (A365) ya nos empujó.
 *
 * El postulante llega por un link que su agente le mandó, y ese push ya trajo
 * documento, nombre, teléfono y correo. Volver a pedírselos es la fricción que
 * lo hace abandonar. El link solo lleva el `alk`; los datos se piden contra él
 * (ver `services/leadPrefillApi.ts`).
 *
 * Dos reglas que definen el comportamiento:
 *
 * - **Solo rellena vacíos.** Lo que la persona ya escribió gana siempre, y el
 *   hook puede correr de nuevo (recarga, volver atrás) sin pisarlo.
 * - **Lo prellenado queda de solo lectura.** Cada campo completado deja un
 *   marcador `_lead_locked_{code}` en `formData`, que `DynamicField` y
 *   `DocumentNumberField` leen para deshabilitarse. Los datos son los que el
 *   socio declaró y sobre los que se le liquida: si el postulante los edita,
 *   el lead y la solicitud dejan de ser la misma persona. Los marcadores
 *   empiezan con `_`, así que el submit los descarta como el resto.
 */
import { useEffect, useRef } from 'react';

import { getLeadLinkCode } from '@/app/prototipos/0.6/utils/landingParams';
import { fetchLeadPrefill, LeadPrefill } from '@/app/prototipos/0.6/services/leadPrefillApi';
import { WizardStep } from '../../../services/wizardApi';
import { useWizard } from '../context/WizardContext';

/**
 * Códigos con los que cada dato puede aparecer en el form builder, en orden de
 * preferencia. Solo se escribe en un código que el wizard realmente declare.
 *
 * `last_name` NO se reparte en `apellido_paterno`/`apellido_materno`: el socio
 * manda los apellidos en un solo texto y partirlo por el espacio inventa datos
 * (apellidos compuestos, personas con uno solo). Si el form los pide separados,
 * los completa la consulta por DNI, que sí los trae discriminados.
 */
const CODIGOS: Record<keyof LeadPrefill, string[]> = {
  document_type: ['document_type', 'tipo_documento'],
  document_number: ['document_number', 'numero_documento', 'dni'],
  first_name: ['first_name', 'nombres', 'primer_nombre'],
  last_name: ['last_name', 'apellidos'],
  phone: ['phone', 'telefono', 'celular', 'phone_number', 'numero_celular'],
  email: ['email', 'correo', 'correo_electronico'],
};

export interface CampoAPrellenar {
  fieldId: string;
  value: string;
}

/** Marcador que deshabilita un campo prellenado desde el lead del socio. */
export const leadLockKey = (code: string) => `_lead_locked_${code}`;

/**
 * Un marcador por campo efectivamente prellenado — nunca por campo candidato.
 * Es la diferencia entre bloquear lo que trajo el socio y bloquear también lo
 * que la persona ya había escrito, que quedaría atrapado sin poder corregirlo.
 */
export function marcadoresDeBloqueo(updates: CampoAPrellenar[]): CampoAPrellenar[] {
  return updates.map(u => ({ fieldId: leadLockKey(u.fieldId), value: 'true' }));
}

/**
 * Qué campos del wizard se pueden completar con este lead. Pura a propósito:
 * es la parte que se puede testear sin montar React ni tocar la red.
 */
export function calcularPrellenado(
  lead: LeadPrefill,
  steps: WizardStep[],
  valorActual: (code: string) => string,
): CampoAPrellenar[] {
  const declarados = new Set<string>();
  for (const step of steps) {
    for (const field of step.fields) declarados.add(field.code);
  }

  const updates: CampoAPrellenar[] = [];
  for (const [dato, candidatos] of Object.entries(CODIGOS) as Array<[keyof LeadPrefill, string[]]>) {
    const value = lead[dato];
    if (!value || !String(value).trim()) continue;

    const code = candidatos.find(c => declarados.has(c));
    if (!code) continue;               // el form no pide este dato
    if (valorActual(code)) continue;   // lo que ya hay gana

    updates.push({ fieldId: code, value: String(value).trim() });
  }
  return updates;
}

export function useLeadPrefill(landingSlug: string, steps: WizardStep[]): void {
  const { updateFieldBatch, getFieldValue } = useWizard();
  // El fetch se dispara una sola vez por montaje: sin esto, cada render que
  // cambie `steps` volvería a pedir los datos.
  const pedidoRef = useRef(false);

  useEffect(() => {
    if (pedidoRef.current || !landingSlug || !steps.length) return;

    const alk = getLeadLinkCode(landingSlug);
    if (!alk) return;

    pedidoRef.current = true;
    let vigente = true;

    fetchLeadPrefill(alk).then(lead => {
      if (!vigente || !lead) return;
      const updates = calcularPrellenado(lead, steps, code => (getFieldValue(code) as string) || '');
      if (!updates.length) return;

      // El marcador va en el MISMO batch que el valor: en dos llamadas hay un
      // render intermedio donde el campo ya tiene el dato y todavía se puede
      // editar.
      updateFieldBatch([...updates, ...marcadoresDeBloqueo(updates)]);
    });

    return () => { vigente = false; };
  }, [landingSlug, steps, getFieldValue, updateFieldBatch]);
}
