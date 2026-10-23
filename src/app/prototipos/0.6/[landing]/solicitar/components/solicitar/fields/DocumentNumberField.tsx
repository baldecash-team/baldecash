'use client';

/**
 * DocumentNumberField - Document number input with automatic prefill
 *
 * When user enters a complete document number (8 digits for DNI):
 * 1. Calls check-person API
 * 2. Auto-fills related fields (names, email, phone, etc.)
 * 3. Shows loading indicator while checking
 */

import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { WizardField, getDocumentTypeRules, checkDocumentAgainstRules } from '../../../../../services/wizardApi';
import { useWizard } from '../../../context/WizardContext';
import { useCheckPerson } from '../../../hooks/useCheckPerson';
import { useCouponDocumentCheck } from '../../../hooks/useCouponDocumentCheck';
import { useSessionOptional } from '../../../context/SessionContext';
import { leadLockKey } from '../../../hooks/useLeadPrefill';
import { useLayout } from '../../../../context/LayoutContext';
import { TextInput } from './TextInput';
import { DniNoInvitadoModal } from './DniNoInvitadoModal';
import { CouponDocumentStatus } from '../coupon/CouponDocumentStatus';
import { isValidPersonName } from '../../../../../services/nameValidation';
import { PrefillData } from '../../../../../services/applicationApi';
import { useCamposV2 } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';
import { SaludoPrellenadoV2 } from '@/app/prototipos/0.6/components/diseno-2/paso1/SaludoPrellenadoV2';
import { reiniciarCampoTocado } from '@/app/prototipos/0.6/components/diseno-2/useErroresAlSalir';
import {
  etiquetaDelNumero,
  mensajeDocumentoV2,
  nombreDelSaludo,
} from '@/app/prototipos/0.6/components/diseno-2/paso1/datosPersonalesV2';

// BAL-3634: antes esto era `trimmed !== "-" && trimmed.length >= 3`, que dejaba
// pasar al prefill cualquier celular o email guardado en `person.first_name`.
// Como `check-person` lee de esa misma tabla, los 30 registros sucios de prod
// se re-inyectaban en el formulario cada vez que la persona reingresaba.
// La regla ahora es la misma del backend (ver `nameValidation.ts`).
const isValidName = isValidPersonName;

function getSavedDni(slug: string): string | null {
  try {
    return localStorage.getItem(`baldecash-dni-${slug}`);
  } catch {
    return null;
  }
}

/**
 * ¿La puerta VIP aprobo ESTE documento en ESTA landing?
 *
 * El token solo existe si `validate-dni` respondio que si, pero el token por
 * si solo dice «esta persona valido algun DNI», no cual. Hay que compararlo
 * contra el documento que se esta por fijar.
 *
 * Sin esa comparacion, quien valido un DNI y despues vuelve con otro se
 * encontraba el documento VIEJO fijo y `disabled`, sin poder corregirlo: el
 * token de la validacion anterior seguia ahi y bloqueaba cualquier documento.
 * La unica salida era limpiar el localStorage a mano (le paso a Haru).
 *
 * En modo `form` no hay puerta, asi que nunca hay token: el DNI guardado es
 * apenas una comodidad de prellenado y tiene que poder corregirse.
 */
function tokenVipApruebaEsteDni(slug: string, dni: string): boolean {
  try {
    if (localStorage.getItem(`baldecash-vip-token-${slug}`) === null) return false;
    // El documento que la puerta guardo al validar. Si el que estamos por
    // fijar no es ese, el token no lo respalda.
    return localStorage.getItem(`baldecash-dni-${slug}`) === dni;
  } catch {
    return false;
  }
}

interface DocumentNumberFieldProps {
  field: WizardField;
  showError?: boolean;
}

// Mapping from backend field names to frontend field codes
// This should match how fields are defined in the form builder
const DEFAULT_PREFILL_MAP: Record<keyof PrefillData, string[]> = {
  first_name: ['first_name', 'nombres', 'primer_nombre'],
  paternal_surname: ['paternal_surname', 'apellido_paterno'],
  maternal_surname: ['maternal_surname', 'apellido_materno'],
  birth_date: ['birth_date', 'fecha_nacimiento'],
  gender: ['gender', 'genero', 'sexo'],
  source: [], // Internal, don't prefill
};

/**
 * Diseño 2 (BAL-4963): lo que el prefill escribió en cada campo, y para qué
 * documento. Persisten con el borrador (no empiezan con `_prefill_status_` ni
 * `_prefill_empty_`), así que al volver al Paso 1 el lookup que se repite
 * sabe si la persona corrigió el campo después: mismo documento y un valor
 * que no es el que escribió el prefill → gana el de la persona. Con otro
 * documento (otra persona) el prefill escribe como siempre.
 */
const prefillValorKey = (code: string) => `_prefill_valor_${code}`;
const prefillDocKey = (code: string) => `_prefill_doc_${code}`;

export const DocumentNumberField: React.FC<DocumentNumberFieldProps> = ({
  field,
  showError = false,
}) => {
  const { getFieldValue, getFieldError, getFieldLabel, updateField, setFieldError, formData, getAllDynamicOptions } = useWizard();
  // Diseño 2 (BAL-4963): saludo, mensajes por tipo y modal con el estilo del kit.
  const v2 = useCamposV2();
  const inputRef = useRef<HTMLInputElement>(null);

  // Prellenado desde el lead de un socio: solo lectura, igual que el resto de
  // los campos que llegaron con el lead (ver `useLeadPrefill`).
  const isLockedFromLead = formData[leadLockKey(field.code)]?.value === 'true';
  const { landing, landingId, overlayVariant } = useLayout();
  const session = useSessionOptional();
  const prefilledRef = useRef(false);
  const [lockedByModal, setLockedByModal] = useState(false);
  // Documento fijo: no se edita ni se "corrige" desde el saludo.
  const documentoBloqueado = !!field.readonly || lockedByModal || isLockedFromLead;

  // Pre-fill from DNI overlay (VIP gate, CADE, InlineDniGate)
  //
  // Prellenar SIEMPRE; bloquear SOLO si la puerta valido ese DNI contra la
  // whitelist (o sea, si dejo token VIP).
  //
  // Antes bloqueaba con solo encontrar el DNI guardado, y eso rompia a quien
  // volvia a la campana por tercera o cuarta vez: el documento de una visita
  // anterior quedaba fijo y `disabled`, asi que si no estaba en la lista la
  // persona no podia corregirlo y quedaba trabada. La unica salida era limpiar
  // el localStorage a mano. En modo `form` no hay puerta ni token, con lo cual
  // el campo nunca debe bloquearse por esta via.
  useEffect(() => {
    const savedDni = getSavedDni(landing);
    if (!savedDni) return;
    const current = getFieldValue(field.code) as string;
    if (!current) {
      updateField(field.code, savedDni);
    }
    if (tokenVipApruebaEsteDni(landing, savedDni)) {
      setLockedByModal(true);
    }
  }, []);

  // Pre-fill + lock DNI from lead form capture
  //
  // Mismo criterio: el dni que dejo el formulario de captura prellena, pero
  // solo queda fijo si ademas hubo validacion de whitelist.
  useEffect(() => {
    const leadDni = localStorage.getItem(`baldecash-${landing}-wizard-field-document_number`);
    if (!leadDni) return;
    const current = getFieldValue(field.code) as string;
    if (!current) updateField(field.code, leadDni);
    if (tokenVipApruebaEsteDni(landing, leadDni)) {
      setLockedByModal(true);
    }
  }, []);

  // Get prefill config from field configuration
  const prefillConfig = field.prefill_config;

  // Document type comes from a sibling field. The legacy shape specifies which
  // field via `document_type_field`; the new shape drops it and the convention
  // 'document_type' applies.
  const documentTypeField = prefillConfig?.document_type_field || 'document_type';
  const documentType = (getFieldValue(documentTypeField) as string) || 'dni';

  // BAL-4025: el largo y el formato que se le exigen al numero dependen del
  // tipo elegido. Las reglas las da el backend (`/public/options/document-types`,
  // ya cacheado por el select de tipo); la tabla de respaldo vive en wizardApi.
  //
  // Antes el input llevaba `field.max_length` fijo (9 en prod), asi que cortaba
  // el pasaporte y el CE largos, y aceptaba 9 digitos como DNI.
  //
  // `getAllDynamicOptions` se llama con guarda a proposito: el cache es una
  // comodidad, no un requisito. Sin el (primer render, o un contexto parcial)
  // manda la tabla de respaldo, que dice lo mismo que el backend.
  const documentRules = useMemo(
    () => getDocumentTypeRules(
      documentTypeField,
      { [documentTypeField]: documentType },
      getAllDynamicOptions?.()
    ),
    [documentTypeField, documentType, getAllDynamicOptions]
  );

  // Get current value and error
  const value = getFieldValue(field.code) as string;
  const error = showError ? getFieldError(field.code) : undefined;

  // Handle prefill when data is received
  const handlePrefillReady = useCallback((data: PrefillData) => {
    let hasInvalidNames = false;

    // Escribe lo que trajo el lookup. En Diseño 2, si la persona ya corrigió
    // el campo (su valor no es el que el prefill dejó la vez anterior), su
    // valor gana y el campo queda abierto como input. Diseño 1 no cambia.
    const mismoDocumento = !!value && formData[prefillDocKey(field.code)]?.value === value;
    const escribir = (code: string, valor: string) => {
      // BAL-4963 (ronda 2): un campo bloqueado por el lead de un socio nunca
      // se pisa con lo que traiga ESTE lookup. El lead es la fuente de
      // verdad (ver `useLeadPrefill`); sin esta guarda, el DNI del titular
      // podía dejar el nombre de OTRA persona (el que trajo el lookup)
      // encima del nombre que llegó bloqueado. Y como "limpiar" tampoco toca
      // los campos bloqueados, ese nombre ajeno quedaba pegado: "Corrige" +
      // un segundo documento que no encuentra a nadie no lo hacía volver al
      // del lead.
      if (formData[leadLockKey(code)]?.value === 'true') return;
      if (v2) {
        const anterior = formData[prefillValorKey(code)]?.value;
        const actual = formData[code]?.value;
        const corregido = mismoDocumento && anterior !== undefined
          && typeof actual === 'string' && actual.trim() !== '' && actual !== anterior;
        updateField(prefillValorKey(code), valor);
        if (corregido) {
          updateField(`_prefill_empty_${code}`, 'true');
          return;
        }
      }
      updateField(code, valor);
      updateField(`_prefill_empty_${code}`, valor ? '' : 'true');
    };

    if (prefillConfig?.prefill_fields) {
      // Legacy mode: Record<target, source | source[]> from form builder.
      // Array values concatenate multiple API fields into one target (e.g.
      // supporter_full_name = first_name + paternal_surname + maternal_surname).
      for (const [formFieldCode, apiSource] of Object.entries(prefillConfig.prefill_fields)) {
        if (Array.isArray(apiSource)) {
          const parts = apiSource.map(key => {
            const val = data[key as keyof PrefillData];
            const str = val ? String(val) : '';
            // Check if any source is an invalid name
            if (['first_name', 'nombres', 'primer_nombre', 'paternal_surname', 'apellido_paterno', 'maternal_surname', 'apellido_materno'].includes(key) && !isValidName(str)) {
              hasInvalidNames = true;
            }
            return str;
          }).filter(Boolean);
          const joined = parts.join(' ');
          escribir(formFieldCode, joined);
        } else {
          const val = data[apiSource as keyof PrefillData];
          const strVal = val ? String(val) : '';
          const isNameField = ['first_name', 'nombres', 'primer_nombre', 'paternal_surname', 'apellido_paterno', 'maternal_surname', 'apellido_materno'].includes(apiSource);
          const isValid = !isNameField || isValidName(strVal);

          if (isNameField && !isValid) {
            hasInvalidNames = true;
          }

          escribir(formFieldCode, isValid ? strVal : '');
        }
      }
    } else if (prefillConfig?.fields_to_fill) {
      // New mode: identity mapping — each entry is both target and response key.
      for (const formFieldCode of prefillConfig.fields_to_fill) {
        const value = data[formFieldCode as keyof PrefillData];
        const strVal = value ? String(value) : '';
        const isNameField = ['first_name', 'nombres', 'primer_nombre', 'paternal_surname', 'apellido_paterno', 'maternal_surname', 'apellido_materno'].includes(formFieldCode);
        const isValid = !isNameField || isValidName(strVal);

        if (isNameField && !isValid) {
          hasInvalidNames = true;
        }

        escribir(formFieldCode, isValid ? strVal : '');
      }
    } else {
      // Legacy mode: use DEFAULT_PREFILL_MAP for backward compatibility
      const formFieldCodes = Object.keys(formData);

      for (const [prefillKey, possibleCodes] of Object.entries(DEFAULT_PREFILL_MAP)) {
        const prefillValue = data[prefillKey as keyof PrefillData];

        // Skip if it's the source field (internal use only)
        if (prefillKey === 'source') continue;

        // Find a matching field code in the form
        for (const code of possibleCodes) {
          if (formFieldCodes.includes(code) || code === possibleCodes[0]) {
            const strVal = prefillValue ? String(prefillValue) : '';
            const isNameField = ['first_name', 'nombres', 'primer_nombre', 'paternal_surname', 'apellido_paterno', 'maternal_surname', 'apellido_materno'].includes(code);
            const isValid = !isNameField || isValidName(strVal);

            if (isNameField && !isValid) {
              hasInvalidNames = true;
            }

            escribir(code, isValid ? strVal : '');
            break;
          }
        }
      }
    }

    if (v2) updateField(prefillDocKey(field.code), value || '');
    updateField(`_prefill_status_${field.code}`, hasInvalidNames ? 'not_found' : 'found');
    prefilledRef.current = true;
  }, [prefillConfig, formData, updateField, v2, value, field.code]);

  // Los campos que llena el prefill de este documento.
  const codigosDelPrellenado = useCallback((): string[] => {
    if (prefillConfig?.prefill_fields) return Object.keys(prefillConfig.prefill_fields);
    if (prefillConfig?.fields_to_fill) return [...prefillConfig.fields_to_fill];
    // Legacy mode
    const formFieldCodes = Object.keys(formData);
    const codigos: string[] = [];
    for (const [prefillKey, possibleCodes] of Object.entries(DEFAULT_PREFILL_MAP)) {
      if (prefillKey === 'source') continue;
      const code = possibleCodes.find((c) => formFieldCodes.includes(c) || c === possibleCodes[0]);
      if (code) codigos.push(code);
    }
    return codigos;
  }, [prefillConfig, formData]);

  // Borra solo las marcas de contabilidad del prefill (`_prefill_valor_*` y
  // `_prefill_doc_*`), SIN tocar el valor de los campos. Las usa
  // `limpiarCamposDelPrellenado` (que además vacía los campos) y, directo,
  // el "no encontrado" de abajo cuando el prefill no corrió en esta sesión:
  // aunque no haya nada que limpiar en pantalla, las marcas pueden venir de
  // un documento ANTERIOR que ya no es el que está puesto (borrador
  // recargado), y dejarlas ahí confundiría la próxima comparación de
  // "la persona corrigió este campo" si alguien vuelve a escribir ese
  // documento viejo.
  const limpiarMarcasDelPrellenado = useCallback(() => {
    for (const formFieldCode of codigosDelPrellenado()) {
      if (formData[prefillValorKey(formFieldCode)] !== undefined) {
        updateField(prefillValorKey(formFieldCode), '');
      }
    }
    if (formData[prefillDocKey(field.code)]?.value) updateField(prefillDocKey(field.code), '');
  }, [codigosDelPrellenado, formData, updateField, field.code]);

  // Borra los campos que llenó el prefill y sus marcas. Lo usan el
  // `not_found` de abajo y, en Diseño 2, "Corrige tu DNI".
  //
  // Un campo que llegó con el lead de un socio (`_lead_locked_*`) no se toca:
  // está bloqueado, así que vaciarlo dejaría a la persona sin poder llenarlo.
  const limpiarCamposDelPrellenado = useCallback(() => {
    for (const formFieldCode of codigosDelPrellenado()) {
      if (formData[leadLockKey(formFieldCode)]?.value === 'true') continue;
      updateField(formFieldCode, '');
      updateField(`_prefill_empty_${formFieldCode}`, '');
    }
    limpiarMarcasDelPrellenado();

    prefilledRef.current = false;
  }, [codigosDelPrellenado, formData, updateField, limpiarMarcasDelPrellenado]);

  // Handle clearing fields when no prefill data is available
  // Only clear if fields were previously auto-filled (not manually entered)
  const handleNoPrefillData = useCallback(() => {
    // Mark as not found — this triggers visibility of personal fields
    updateField(`_prefill_status_${field.code}`, 'not_found');

    if (!prefilledRef.current) {
      // BAL-4963 (ronda 2): el prefill no corrió en ESTA sesión (borrador
      // recién cargado, o el lookup nunca llegó a "found" para este
      // documento), así que no se tocan los campos — pueden ser datos que la
      // persona escribió a mano. Pero las marcas sí se limpian: si no, un
      // "no encontrado" con un documento NUEVO deja las marcas del documento
      // VIEJO en el borrador.
      limpiarMarcasDelPrellenado();
      return; // Don't clear manually entered data
    }

    limpiarCamposDelPrellenado();
  }, [field.code, updateField, limpiarCamposDelPrellenado, limpiarMarcasDelPrellenado]);

  // Initialize the check-person hook
  const { check, isChecking, response, reset: resetCheck } = useCheckPerson({
    onPrefillReady: handlePrefillReady,
    onNoPrefillData: handleNoPrefillData,
    debounceMs: 500,
    landingSlug: landing,
    // Este es el momento en que el visitante se identifica: el documento pasa
    // también a `session.dni`, sin esperar al submit.
    sessionUuid: session?.sessionUuid ?? null,
  });

  // Whitelist: si el backend responde allowed === false, se bloquea el flujo.
  // Guardamos el estado en formData para que StepClient impida avanzar y mostramos
  // el mensaje del backend como error del campo.
  const whitelist = response?.whitelist;
  const isWhitelistBlocked = whitelist?.allowed === false;

  // El modal se cierra a mano, y el cierre vale SOLO para la respuesta que se
  // esta viendo: apenas el documento cambia, la marca se borra.
  //
  // Antes esto guardaba el dni cerrado (`modalCerradoPara !== value`) y nunca
  // lo limpiaba, asi que cerrar el modal para un documento lo silenciaba para
  // siempre: al volver a ese mismo dni despues de probar otro, ya no salia.
  // Comparar contra `value` ademas lo reabria en mitad del tipeo, porque el
  // valor cambia con cada tecla mientras el backend todavia responde por el
  // numero anterior.
  const [modalCerrado, setModalCerrado] = useState(false);
  useEffect(() => {
    setModalCerrado(false);
  }, [value, documentType]);

  const mostrarModal = isWhitelistBlocked && !modalCerrado;
  const whitelistMessage = isWhitelistBlocked
    ? (whitelist?.message || 'No es posible continuar con este documento.')
    : '';

  useEffect(() => {
    updateField('_whitelist_blocked', isWhitelistBlocked ? 'true' : '');
    updateField('_whitelist_message', whitelistMessage);
    if (isWhitelistBlocked) {
      updateField('_whitelist_field', field.code);
    }
  }, [isWhitelistBlocked, whitelistMessage, updateField, field.code]);

  // Trigger check when document number is complete
  useEffect(() => {
    const cleanValue = value?.trim() || '';

    // BAL-4025: el largo a partir del cual vale la pena consultar sale de las
    // reglas del tipo, no de una escalera de `if` con los numeros a mano (que
    // ademas se olvidaba de `pasaporte` y solo contemplaba `passport`).
    const minLength = documentRules?.min_length;
    if (!minLength || cleanValue.length < minLength) return;
    if (documentRules?.input_mode === 'numeric' && !/^\d+$/.test(cleanValue)) return;
    check(documentType, cleanValue);
  }, [value, documentType, documentRules, check]);

  // El cupón se validó antes de conocer el documento. Con el documento del
  // TITULAR completo se revalida: la lista cerrada de invitados y el tope por
  // persona dependen de él. Solo el campo del titular (el mismo que lee el
  // envío): este componente también pinta el documento de un familiar.
  const esDocumentoDelTitular = field.code === 'document_number' || field.code === 'numero_documento';
  const documentoCompleto = useMemo(() => {
    const cleanValue = value?.trim() || '';
    const minLength = documentRules?.min_length;
    if (!minLength || cleanValue.length < minLength) return null;
    if (documentRules?.input_mode === 'numeric' && !/^\d+$/.test(cleanValue)) return null;
    return cleanValue;
  }, [value, documentRules]);
  useCouponDocumentCheck({
    documentNumber: esDocumentoDelTitular ? documentoCompleto : null,
    landingId,
  });

  // Handle value change — filter input based on document type
  const handleChange = useCallback((newValue: string) => {
    // BAL-4025: SOLO el DNI es numerico. El CE y el pasaporte son
    // alfanumericos, y hay carnets de extranjeria reales con letras: filtrarlos
    // a digitos borraba en silencio lo que la persona escribia.
    const filtered = documentType === 'dni'
      ? newValue.replace(/\D/g, '')
      : newValue.replace(/[^a-zA-Z0-9]/g, '');
    updateField(field.code, filtered);
    // Always reset prefill status when user modifies the document number
    // so prefill-dependent fields hide until next lookup completes
    updateField(`_prefill_status_${field.code}`, '');
    resetCheck(); // Allow re-checking when DNI changes
  }, [field.code, documentType, updateField, resetCheck]);

  // BAL-4025: al CAMBIAR de tipo hay que recalcular el estado del numero que ya
  // estaba escrito. Sin esto, quien tipeaba 8 digitos como DNI y despues pasaba
  // a pasaporte se quedaba con el veredicto del tipo anterior colgado: un error
  // que ya no corresponde, o peor, un "valido" que la regla nueva rechaza.
  //
  // Tambien recorta el valor al `max_length` del tipo nuevo: el atributo
  // `maxLength` del input frena lo que se TIPEA, no lo que ya estaba.
  const tipoAnterior = useRef(documentType);
  // El tipo tal como está en el formulario ('' si nadie lo eligió todavía).
  // Sirve para no confundir con un cambio de la persona lo que es el borrador
  // recién cargado o el default que se fija al montar.
  const tipoCrudo = (getFieldValue(documentTypeField) as string) || '';
  const tipoCrudoAnterior = useRef(tipoCrudo);
  useEffect(() => {
    if (tipoAnterior.current === documentType) return;
    tipoAnterior.current = documentType;
    // BAL-4963 (ronda 2, documentando lo que ya hacía este código): si el
    // campo tipo estaba en '' (nadie lo había elegido todavía) y pasa a tener
    // un valor, ESE cambio no cuenta como "la persona cambió de tipo" — es la
    // resolución del default (o el tipo que trajo el borrador) al montar, no
    // un gesto de la persona. `loEligioLaPersona` queda en `false` ahí, así
    // que el bloque de abajo no borra nada.
    //
    // Importa porque el número puede llegar ANTES de que exista un tipo: la
    // persona puede tipear el documento mientras el combo de tipo sigue en
    // blanco (o el combo tarda un render en resolver su default). Sin esta
    // guarda, el primer `documentType` que aparece —aunque sea el default y
    // no una elección— borraría lo que la persona ya escribió, antes de que
    // ella haya tocado el selector de tipo siquiera una vez.
    const loEligioLaPersona = tipoCrudoAnterior.current !== '';

    const actual = (getFieldValue(field.code) as string) || '';
    if (!actual) {
      setFieldError?.(field.code, null);
      return;
    }

    // Diseño 2 (como el prototipo): cambiar de tipo borra el número y lo que
    // llenó el prefill. Un documento bloqueado no se toca.
    if (v2 && loEligioLaPersona && !documentoBloqueado) {
      const habiaPrellenado =
        prefilledRef.current || getFieldValue(`_prefill_status_${field.code}`) === 'found';
      updateField(field.code, '');
      updateField(`_prefill_status_${field.code}`, '');
      if (habiaPrellenado) limpiarCamposDelPrellenado();
      resetCheck();
      setFieldError?.(field.code, null);
      // El campo quedó vacío por el cambio de tipo, no por la persona: no
      // muestra "Ingresa tu número…" hasta que lo toque o intente continuar.
      reiniciarCampoTocado(field.code);
      return;
    }

    // El CE y el pasaporte admiten letras; el DNI no. Al pasar a DNI se caen
    // las letras, no se arrastran para que despues el pattern las rechace.
    let siguiente = documentType === 'dni'
      ? actual.replace(/\D/g, '')
      : actual.replace(/[^a-zA-Z0-9]/g, '');

    const max = documentRules?.max_length;
    if (max && siguiente.length > max) siguiente = siguiente.slice(0, max);

    if (siguiente !== actual) {
      updateField(field.code, siguiente);
      updateField(`_prefill_status_${field.code}`, '');
      resetCheck();
    }

    setFieldError?.(
      field.code,
      documentRules ? checkDocumentAgainstRules(siguiente, documentRules) : null
    );
  }, [documentType, documentRules, field.code, getFieldValue, updateField, setFieldError, resetCheck,
    v2, documentoBloqueado, limpiarCamposDelPrellenado]);
  useEffect(() => {
    tipoCrudoAnterior.current = tipoCrudo;
  }, [tipoCrudo]);

  // Build tooltip from API help_text
  const tooltip = field.help_text ? {
    title: field.help_text.title || field.label,
    description: field.help_text.description || '',
    recommendation: field.help_text.recommendation ?? undefined,
  } : undefined;

  // El mensaje de whitelist (bloqueo) tiene prioridad y se muestra siempre,
  // aunque el campo todavía no haya sido marcado como "submitted".
  // El bloqueo de whitelist lo comunica el modal, no un texto al pie: son dos
  // cosas distintas y mostrarlas juntas es ruido. El campo solo pinta los
  // errores de formato.
  //
  // Diseño 2: el texto del error sale de la tabla de Brenda por tipo (y
  // `required_message` de la BD gana cuando está vacío). Cuándo hay error lo
  // sigue decidiendo el validador de siempre.
  const displayError = v2
    ? mensajeDocumentoV2({ error, valor: value, tipo: documentType, requiredMessage: field.required_message })
    : error;

  // Diseño 2: "¡Hola, {Nombre}!" con el estado del prefill que ya existe.
  const nombreSaludo = useMemo(
    () => (v2 ? nombreDelSaludo(field, Object.fromEntries(
      Object.entries(formData).map(([k, st]) => [k, st?.value as string | string[] | undefined]),
    )) : null),
    [v2, field, formData],
  );

  // Diseño 2: "Número de {tipo}" con la etiqueta de la opción elegida (la del
  // catálogo de tipos, o la que guardó el select). Sin opción, la de la BD.
  //
  // BAL-4963 (ronda 2): SOLO el documento del titular recibe este tratamiento.
  // El documento de un familiar (este mismo componente también lo pinta, ver
  // `esDocumentoDelTitular` arriba) conserva la etiqueta que trae la BD —
  // "Documento del familiar", "DNI del aval", etc. — tal cual la escribió
  // Brenda, en vez de que todos los documentos de la ficha digan lo mismo.
  const etiquetaDelTipo = v2 && esDocumentoDelTitular
    ? (getAllDynamicOptions?.()?.[documentTypeField] || []).find(
        (o) => String(o.value).toLowerCase() === documentType.toLowerCase(),
      )?.label ?? getFieldLabel?.(documentTypeField)
    : undefined;
  const etiqueta = v2 && esDocumentoDelTitular ? etiquetaDelNumero(etiquetaDelTipo, field.label) : field.label;

  // "Corrige tu DNI": lo mismo que pasa hoy al cambiar el documento (número,
  // prefill y campos que llenó, en blanco) y el foco vuelve al campo.
  const corregirDocumento = useCallback(() => {
    updateField(field.code, '');
    setFieldError?.(field.code, null);
    updateField(`_prefill_status_${field.code}`, '');
    limpiarCamposDelPrellenado();
    resetCheck();
    inputRef.current?.focus();
  }, [field.code, updateField, setFieldError, limpiarCamposDelPrellenado, resetCheck]);

  // Determine success state
  const hasValue = !!value;
  const isSuccess = !displayError && hasValue;

  const isNumericDoc = (documentRules?.input_mode ?? (documentType === 'dni' ? 'numeric' : 'text')) === 'numeric';

  return (
    <>
      <TextInput
        id={field.code}
        label={etiqueta}
        value={value}
        onChange={handleChange}
        error={displayError}
        required={field.required}
        disabled={documentoBloqueado}
        tooltip={tooltip}
        type="text"
        inputMode={isNumericDoc ? 'numeric' : 'text'}
        placeholder={documentRules?.placeholder || field.placeholder || undefined}
        maxLength={documentRules?.max_length || field.max_length || undefined}
        success={isSuccess}
        isLoading={isChecking}
        {...(v2 ? { inputRef } : {})}
      />

      {nombreSaludo && (
        <SaludoPrellenadoV2
          nombre={nombreSaludo}
          esDni={documentType === 'dni'}
          // Documento bloqueado (puerta VIP o lead de un socio): sin enlace.
          onCorregir={documentoBloqueado ? undefined : corregirDocumento}
        />
      )}

      {esDocumentoDelTitular && (
        <CouponDocumentStatus documentComplete={documentoCompleto !== null} />
      )}

      {mostrarModal && (
        // El documento NO se limpia al cerrar: quien se equivoco en un digito
        // no tiene que escribir los ocho de nuevo para corregirlo.
        <DniNoInvitadoModal
          dni={value}
          hermana={
            whitelist?.found_in_sibling && whitelist.sibling_landing_slug
              ? {
                  slug: whitelist.sibling_landing_slug,
                  name: whitelist.sibling_landing_name || 'la otra campaña',
                }
              : null
          }
          firstName={whitelist?.first_name ?? null}
          onCerrar={() => setModalCerrado(true)}
          {...(v2 ? { v2: true } : {})}
        />
      )}
    </>
  );
};

export default DocumentNumberField;
