'use client';

/**
 * Prellenado del wizard con el lead que un socio (A365) ya nos empujó.
 *
 * El postulante llega por un link que su agente le mandó, y ese push ya trajo
 * documento, nombre, teléfono y correo, y puede haber traído institución y
 * sede. Volver a pedírselos es la fricción que lo hace abandonar — y en el caso
 * de la institución es peor que fricción: es buscar la propia universidad en un
 * catálogo de decenas de miles. El link solo lleva el `alk`; los datos se piden
 * contra él (ver `services/leadPrefillApi.ts`).
 *
 * `institution` y `sede` se prellenan con el **id** del catálogo, el mismo que
 * el select habría guardado a mano, más su nombre como etiqueta. En una landing
 * de convenio la institución la fija la landing y `DynamicField` la vuelve a
 * imponer sobre lo que ponga el lead: es correcto, ahí la institución no la
 * elige nadie.
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
 * Datos del lead que pueden aterrizar en un campo del wizard. Los `_name` de
 * institución y sede quedan afuera: no son campos, son la etiqueta que el
 * select muestra para el id (ver `ETIQUETA_DE`).
 */
type CampoDeLead = Exclude<keyof LeadPrefill, 'institution_name' | 'sede_name'>;

/**
 * Códigos con los que cada dato puede aparecer en el form builder, en orden de
 * preferencia. Solo se escribe en un código que el wizard realmente declare.
 *
 * `last_name` NO se reparte en `apellido_paterno`/`apellido_materno`: el socio
 * manda los apellidos en un solo texto y partirlo por el espacio inventa datos
 * (apellidos compuestos, personas con uno solo). Si el form los pide separados,
 * los completa la consulta por DNI, que sí los trae discriminados.
 */
const CODIGOS: Record<CampoDeLead, string[]> = {
  document_type: ['document_type', 'tipo_documento'],
  document_number: ['document_number', 'numero_documento', 'dni'],
  first_name: ['first_name', 'nombres', 'primer_nombre'],
  last_name: ['last_name', 'apellidos'],
  phone: ['phone', 'telefono', 'celular', 'phone_number', 'numero_celular'],
  email: ['email', 'correo', 'correo_electronico'],
  institution_type: ['institution_type', 'tipo_institucion'],
  institution_id: ['institution', 'institucion', 'study_center'],
  sede_id: ['sede', 'branch', 'campus'],
};

/**
 * Qué dato del lead es la etiqueta de cuál. `institution` y `sede` son selects
 * sobre catálogos: guardan un id y muestran un nombre. Sin la etiqueta el campo
 * quedaría con el id puesto, bloqueado y en blanco a la vista — el peor de los
 * dos mundos. (El backend ya manda las dos cosas justamente para esto.)
 */
const ETIQUETA_DE: Partial<Record<CampoDeLead, keyof LeadPrefill>> = {
  institution_id: 'institution_name',
  sede_id: 'sede_name',
};

export interface CampoAPrellenar {
  fieldId: string;
  value: string;
  label?: string;
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

  // Qué código terminó llevando cada dato: lo necesita la regla de la
  // institución huérfana, que no puede asumir que el campo se llama
  // `institution` (el form builder también acepta `institucion`).
  const codigoDe: Partial<Record<CampoDeLead, string>> = {};
  const updates: CampoAPrellenar[] = [];

  for (const [dato, candidatos] of Object.entries(CODIGOS) as Array<[CampoDeLead, string[]]>) {
    const value = lead[dato];
    if (value === null || value === undefined || !String(value).trim()) continue;

    const code = candidatos.find(c => declarados.has(c));
    if (!code) continue;               // el form no pide este dato
    if (valorActual(code)) continue;   // lo que ya hay gana

    const etiqueta = ETIQUETA_DE[dato];
    const label = etiqueta ? lead[etiqueta] : undefined;

    codigoDe[dato] = code;
    updates.push({
      fieldId: code,
      value: String(value).trim(),
      ...(label ? { label: String(label).trim() } : {}),
    });
  }

  return sinInstitucionHuerfana(updates, codigoDe, declarados);
}

/**
 * La institución sin su tipo se cae sola: mejor no ponerla.
 *
 * `institution` se limpia cuando cambia `institution_type` (dependencia
 * registrada en `CascadingSelectField`, ejecutada por `WizardContext.updateField`).
 * Si prellenamos la institución y dejamos el tipo a elección de la persona, el
 * primer toque en el tipo borra el valor — y como el campo quedó bloqueado por
 * ser dato del socio, queda vacío y sin forma de arreglarlo.
 *
 * Pasa de verdad en dos casos: cuando el catálogo trae un tipo que el
 * formulario no ofrece (el backend lo manda en `null`), y cuando la persona ya
 * eligió un tipo antes de que llegara el prellenado. En los dos, la salida es
 * la misma: dejar `institution` sin tocar y que la elija a mano, que es
 * molesto pero reversible.
 *
 * Si el formulario no declara `institution_type`, no hay quién la limpie y la
 * institución se prellena igual.
 */
function sinInstitucionHuerfana(
  updates: CampoAPrellenar[],
  codigoDe: Partial<Record<CampoDeLead, string>>,
  declarados: Set<string>,
): CampoAPrellenar[] {
  const codigoInstitucion = codigoDe.institution_id;
  const formPideTipo = CODIGOS.institution_type.some(c => declarados.has(c));

  if (!codigoInstitucion || !formPideTipo || codigoDe.institution_type) {
    return updates;
  }
  return updates.filter(u => u.fieldId !== codigoInstitucion);
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
