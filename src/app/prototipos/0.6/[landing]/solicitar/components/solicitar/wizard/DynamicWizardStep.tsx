'use client';

/**
 * DynamicWizardStep - Renders all fields for a wizard step from API config
 * Uses grid layout based on field.grid_columns
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { WizardStep, WizardField, evaluateFieldVisibility, evaluatePrefillFieldVisibility, getPrefillTargetFieldCodes, getDocumentTypeRules, validateField } from '../../../../../services/wizardApi';
import { DynamicField, pistaVaEnElCampo } from '../fields/DynamicField';
import { useWizard } from '../../../context/WizardContext';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { leadLockKey } from '../../../hooks/useLeadPrefill';
import { formatearFechaIso, obtenerPrimeraFechaPago } from '../../../utils/primeraFechaPago';
import { CamposV2Provider, PISTA_V2, TARJETA_V2, TARJETA_V2_ESTILO } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';
import { AgregarOpcionalV2 } from '@/app/prototipos/0.6/components/diseno-2/campos/AgregarOpcionalV2';
import { ayudaDelNumero, nombreDelSaludo } from '@/app/prototipos/0.6/components/diseno-2/paso1/datosPersonalesV2';
import { SeccionPlegable } from '@/app/prototipos/0.6/components/diseno-2/SeccionPlegable';
import { armarBloques, camposPegados, ordenConPegados, otrasEnElCampo, resumenDeSeccion, seccionCompleta } from '@/app/prototipos/0.6/components/diseno-2/secciones';
import { OtraEnElCampoV2 } from '@/app/prototipos/0.6/components/diseno-2/campos/OtraEnElCampoV2';
import { reiniciarCampoTocado } from '@/app/prototipos/0.6/components/diseno-2/useErroresAlSalir';
import { useFieldTracking } from '../../../hooks/useFieldTracking';
import { useEventTrackerOptional } from '../../../context/EventTrackerContext';

/** Lo primero que se puede enfocar dentro de un campo (al abrir un plegado). */
const ENFOCABLE_DEL_CAMPO =
  'input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [role="button"][tabindex="0"]';

function tieneValor(valor: unknown): boolean {
  if (Array.isArray(valor)) return valor.length > 0;
  return typeof valor === 'string' ? valor.trim() !== '' && valor !== 'false' : !!valor;
}

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Cuántos meses corre el legacy el primer vencimiento, según el día elegido y
 * el día del mes en que se arma el cronograma.
 *
 * Espejo de `generar_fechas_mensuales_fijo` (webservice,
 * `SolicitudController.php`): cada día del catálogo tiene su propio corte, y
 * pasado ese corte el primer pago se va un mes más para dejarle colchón a la
 * persona. Antes acá se asumía «mes siguiente» siempre, y en la segunda
 * quincena el aviso prometía un mes antes de lo que el legacy iba a cobrar
 * (día 3 y día 10 son los únicos con corte a dos meses).
 *
 * Lo que NO se replica a propósito: el corrimiento a lunes cuando el
 * vencimiento cae fin de semana. Eso mueve días, no el mes, y este aviso es
 * una referencia del mes de cobro.
 */
export function monthsAheadForPaymentDay(selectedDay: number, todayDay: number): number {
  switch (selectedDay) {
    case 3:
      return todayDay >= 14 ? 2 : 1;
    case 10:
      return todayDay >= 21 ? 2 : 1;
    case 18:
      return 1;
    case 25:
      return todayDay >= 6 ? 1 : 0;
    case 30:
      return 1;
    default:
      // Días sin regla propia en el legacy: se quedan en el mes en curso y solo
      // saltan al siguiente si ese vencimiento ya pasó (el `isPast()` del loop).
      return selectedDay <= todayDay ? 1 : 0;
  }
}

/**
 * Primera fecha de pago a mostrar. Es una referencia: el cronograma real lo
 * arma el legacy recién al aprobar, y con el `now()` de ese momento — si la
 * aprobación cruza un corte, la fecha se corre.
 *
 * Cuando la landing es diferida se suma **un** mes, que es lo que agrega el
 * legacy (`$fecha_inicial->addMonth()` para `is_diferido`), sin importar el
 * `deferred_months` de la config.
 */
function getFirstPaymentDate(selectedDay: number, isDeferred: boolean = false): string {
  const today = new Date();
  const monthsAhead = monthsAheadForPaymentDay(selectedDay, today.getDate()) + (isDeferred ? 1 : 0);
  const total = today.getMonth() + monthsAhead;
  const targetMonth = ((total % 12) + 12) % 12;
  const targetYear = today.getFullYear() + Math.floor(total / 12);

  return `${selectedDay} de ${MONTH_NAMES[targetMonth]} del ${targetYear}`;
}

interface DynamicWizardStepProps {
  step: WizardStep;
  showErrors?: boolean;
  /** Step order number for event tracking */
  stepOrder?: number;
  /**
   * Solo Diseño 2 (`diseno-2/ShellV2`): campos que la persona ya dejó (blur).
   *
   * Con este prop cada contenedor de campo lleva `data-campo` (lo usa la guía
   * de campos para ubicarlo) y `data-estado` (`error`/`ok`, que pinta el borde
   * rojo o verde), y el error de un campo tocado se muestra sin esperar a
   * "Continuar". Sin el prop —Diseño 1— el render es el de siempre.
   *
   * También prende el kit de campos de Diseño 2 (BAL-4960): una sola columna,
   * la variante visual de cada campo (`CamposV2Provider`), la pista (`hint`)
   * bajo el campo y los opcionales plegados (`collapsed_optional`) como
   * "+ Agregar …".
   *
   * F5 (BAL-4964): si el paso trae `groups`, los campos se agrupan en
   * secciones (`SeccionPlegable`) y los que no tienen sección van al final.
   * Un "Otra (escríbela)" se pinta pegado bajo la lista que lo destapa.
   */
  camposTocados?: ReadonlySet<string>;
}

// Tailwind requires static class names - dynamic classes like `col-span-${n}` get purged
// Map grid_columns values to static Tailwind classes
// Uses sm: (≥640px) so 2-column layouts activate on large phones/tablets,
// matching the wizard layout which only flips to 2-column at lg: (≥1024px).
const GRID_COL_CLASSES: Record<number, string> = {
  1: 'sm:col-span-1',
  2: 'sm:col-span-2',
  3: 'sm:col-span-3',
  4: 'sm:col-span-4',
  5: 'sm:col-span-5',
  6: 'sm:col-span-6',
  7: 'sm:col-span-7',
  8: 'sm:col-span-8',
  9: 'sm:col-span-9',
  10: 'sm:col-span-10',
  11: 'sm:col-span-11',
  12: 'sm:col-span-12',
};

const GRID_COL_MOBILE_CLASSES: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
};

/**
 * Si hay que destapar los campos personales aunque el lookup del documento no
 * haya contestado.
 *
 * Esos campos (nombres, apellidos, fecha, Sexo) llegan escondidos y los destapa
 * el lookup: con DNI el buro los devuelve, y cuando no encuentra a la persona
 * el `not_found` los muestra vacios para que los escriba. Quien entra por el
 * link corto del socio con un documento que no es DNI se queda fuera de las dos
 * ramas si el lookup no llega a correr -- el numero viene prellenado y
 * bloqueado, asi que nunca lo tipea, y el buro no responde por CE. El paso
 * entonces se dibuja sin Sexo, y como los nombres si vinieron del lead el
 * formulario se ve completo: la solicitud entra sin ese dato y nadie lo nota.
 *
 * Acotado a esa entrada a proposito: el documento tiene que venir del lead
 * (marcador `_lead_locked_`) y no ser DNI. Quien llega por su cuenta, o con
 * DNI, sigue dependiendo del lookup como hasta ahora.
 */
export function destaparPorLeadSinBuro(
  formValues: Record<string, string | string[]>,
  docFieldCode: string,
  docTypeFieldCode: string,
): boolean {
  const vinoDelLead = formValues[leadLockKey(docFieldCode)] === 'true';
  const tipo = String(formValues[docTypeFieldCode] ?? '').trim().toLowerCase();
  return vinoDelLead && tipo !== '' && tipo !== 'dni';
}

export const DynamicWizardStep: React.FC<DynamicWizardStepProps> = ({
  step,
  showErrors = false,
  stepOrder,
  camposTocados,
}) => {
  const { getFieldValue, getFieldLabel, updateField, formData, getAllDynamicOptions } = useWizard();
  const { deferredPayment, landing } = useLayout();
  // El «¿Cuál…?» escrito en el mismo campo (BAL-5205) no pasa por DynamicField:
  // su foco y salida se registran acá, igual que los de cualquier campo.
  const { onFieldFocus, onFieldBlur } = useFieldTracking(stepOrder);

  // El legacy corre un mes el primer pago cuando la landing es diferida.
  const isDeferred = Boolean(deferredPayment?.enabled);

  // Initialize fields with default_value from API (only if field has no value yet)
  useEffect(() => {
    for (const field of step.fields) {
      if (field.default_value && !getFieldValue(field.code)) {
        updateField(field.code, field.default_value);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.code]);

  // Build form values for visibility evaluation (shared across all fields)
  // formData structure: { [code]: { value: "...", error: "..." } }
  const formValues = useMemo(() => {
    const values: Record<string, string | string[]> = {};
    for (const [key, state] of Object.entries(formData)) {
      if (state?.value !== undefined) {
        values[key] = state.value as string | string[];
      }
    }
    return values;
  }, [formData]);

  // Map each prefill target field to the code of the field that triggers the lookup.
  // Works for both legacy (prefill_fields Record) and new (fields_to_fill array) shapes.
  const prefillFieldToDocField = useMemo(() => {
    const map: Record<string, string> = {};
    for (const field of step.fields) {
      const targets = getPrefillTargetFieldCodes(field.prefill_config);
      for (const code of targets) {
        map[code] = field.code;
      }
    }
    return map;
  }, [step.fields]);

  // Con que campo declara cada disparador el tipo de documento. La forma legacy
  // lo nombra en `document_type_field`; la nueva lo omite y rige la convencion.
  const docTypeFieldDe = useMemo(() => {
    const map: Record<string, string> = {};
    for (const field of step.fields) {
      map[field.code] = field.prefill_config?.document_type_field || 'document_type';
    }
    return map;
  }, [step.fields]);

  // Compute visibility for all fields
  const fieldVisibility = useMemo(() => {
    const vis: Record<string, boolean> = {};

    for (const field of step.fields) {
      // Prefill-dependent fields: show only when their specific DNI lookup returned no data
      const docFieldCode = prefillFieldToDocField[field.code];
      if (field.hidden && docFieldCode) {
        // Vale para cualquier estado del lookup, no solo mientras no contesta:
        // si dependiera del estado, el campo pasaria de visible a oculto en
        // cuanto el lookup respondiera, y el efecto de limpieza de mas abajo
        // borraria lo que la persona acabara de elegir.
        const destapadoPorLead = destaparPorLeadSinBuro(
          formValues,
          docFieldCode,
          docTypeFieldDe[docFieldCode] || 'document_type',
        );
        // La condicion de negocio del campo manda sobre las dos vias de
        // destape: un campo que la regla `show` apaga no vuelve por el lead ni
        // por el lookup (BAL-4026).
        vis[field.code] = destapadoPorLead
          ? evaluateFieldVisibility(field, formValues)
          : evaluatePrefillFieldVisibility(field, formValues, docFieldCode);
      } else if (field.hidden && (!field.dependency_groups || field.dependency_groups.length === 0)) {
        // hidden=true with no dependency groups = always hidden (no condition can activate it)
        vis[field.code] = false;
      } else {
        vis[field.code] = evaluateFieldVisibility(field, formValues);
      }
    }
    return vis;
  }, [step.fields, formValues, prefillFieldToDocField, docTypeFieldDe]);

  // Clear field values when they become hidden
  const prevVisibilityRef = useRef<Record<string, boolean>>({});
  const prevValuesRef = useRef<Record<string, string | string[]>>({});
  useEffect(() => {
    const prevVis = prevVisibilityRef.current;
    const prevVals = prevValuesRef.current;
    for (const field of step.fields) {
      const wasVisible = prevVis[field.code];
      const isNowVisible = fieldVisibility[field.code];
      // Only clear if transitioning from visible to hidden (not on first render)
      if (wasVisible === true && isNowVisible === false) {
        const currentValue = formData[field.code]?.value;
        const prevValue = prevVals[field.code];
        // Skip cleanup if the value was just set programmatically (prefill):
        // if the value changed in the same render that visibility changed,
        // it was likely set by prefill — don't clear it.
        // Un campo bloqueado por el lead de un socio nunca se vacía: el lead
        // es la fuente de verdad (BAL-4963). En Diseño 2 los prellenados se
        // ven (BAL-4961), así que "Corrige tu DNI" los esconde y pasarían por acá.
        const bloqueadoPorLead = formData[leadLockKey(field.code)]?.value === 'true';
        if (currentValue && currentValue === prevValue && !bloqueadoPorLead) {
          updateField(field.code, '');
        }
      }
    }
    prevVisibilityRef.current = { ...fieldVisibility };
    // Snapshot current values for next comparison
    const vals: Record<string, string | string[]> = {};
    for (const field of step.fields) {
      const v = formData[field.code]?.value;
      if (v !== undefined) vals[field.code] = v as string | string[];
    }
    prevValuesRef.current = vals;
  }, [fieldVisibility, step.fields, formData, updateField]);

  // Diseño 2: opcionales plegados que la persona abrió con "+ Agregar …". Un
  // plegado con valor (borrador) sale abierto sin pasar por acá.
  const esV2 = camposTocados !== undefined;
  const [abiertos, setAbiertos] = useState<ReadonlySet<string>>(() => new Set());

  // Diseño 2: errores LOCALES que un campo (DateInput, AddressAutocompleteField)
  // calcula por su cuenta y nunca llegan a `formData` — regla "si hay error
  // visible, la pista no se muestra" (BAL-4960, revisión F2). No duplica la
  // lógica de validación: el campo avisa, acá solo se guarda el booleano.
  const [erroresLocales, setErroresLocales] = useState<Record<string, boolean>>({});
  const reportarErrorLocal = useCallback((codigo: string, hayError: boolean) => {
    setErroresLocales((prev) => (prev[codigo] === hayError ? prev : { ...prev, [codigo]: hayError }));
  }, []);
  const [porEnfocar, setPorEnfocar] = useState<string | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!porEnfocar) return;
    const campo = contenedorRef.current?.querySelector<HTMLElement>(`[data-campo="${CSS.escape(porEnfocar)}"]`);
    campo?.querySelector<HTMLElement>(ENFOCABLE_DEL_CAMPO)?.focus();
    setPorEnfocar(null);
  }, [porEnfocar]);
  // Diseño 2 (BAL-4961, corrección de Emilio): con la persona encontrada por
  // su documento, nombres, apellidos, fecha de nacimiento y sexo NO se
  // muestran, con la MISMA regla de Diseño 1 (`hidden` + prefill `found` con
  // valor; un prefill vacío o inválido trae `_prefill_empty_` y se muestra
  // para llenarlo). Lo único visible es el saludo; "¿No eres tú?" limpia el
  // documento y el prefill y los campos vuelven vacíos. Sin tarjeta "Tus datos".
  const abrirPlegado = (codigo: string) => {
    setAbiertos((prev) => new Set(prev).add(codigo));
    setPorEnfocar(codigo);
  };

  const paymentDayValue = getFieldValue('payment_day') as string;

  // La fecha la calcula ws2 con la regla del legacy (BAL-4305). Mientras
  // llega, o si falla, se muestra el cálculo local de siempre.
  const [fechaBackend, setFechaBackend] = useState<string | null>(null);
  useEffect(() => {
    setFechaBackend(null);
    const dia = Number(paymentDayValue);
    if (!landing || !dia) return;
    let cancelado = false;
    obtenerPrimeraFechaPago(landing, dia).then((iso) => {
      if (!cancelado) setFechaBackend(iso ? formatearFechaIso(iso) : null);
    });
    return () => { cancelado = true; };
  }, [landing, paymentDayValue]);

  // Diseño 2: el error se ve cuando el campo se tocó o se intentó continuar.
  const mostrarErrorDe = (codigo: string) => showErrors || (esV2 && camposTocados.has(codigo));
  const errorVisibleDe = (codigo: string) =>
    mostrarErrorDe(codigo) && (!!formData[codigo]?.error || !!erroresLocales[codigo]);

  // Diseño 2 (F5): "Otra (escríbela)" pegada a la lista que la destapa; desde
  // BAL-5205 se escribe en el MISMO campo de la lista (`OtraEnElCampoV2`).
  // Institución y carrera buscan sus opciones en ws2 y el paso no trae sus
  // etiquetas: para ellas cuenta la etiqueta de lo elegido. La firma evita
  // recalcular a cada tecla: solo cambia cuando cambia lo elegido en esas listas.
  const firmaListasRemotas = esV2
    ? step.fields
      .filter((f) => f.options_source && !f.options?.length)
      .map((f) => `${f.code}=${String(formData[f.code]?.value ?? '')}|${formData[f.code]?.label ?? ''}`)
      .join(';')
    : '';
  const pegados = useMemo(
    () => (esV2
      ? camposPegados(step, (codigo) => ({
        value: formData[codigo]?.value as string | undefined,
        label: formData[codigo]?.label,
      }))
      : new Map<string, string>()),
    // `formData` entra por `firmaListasRemotas`: solo importa lo elegido en las listas remotas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [esV2, step, firmaListasRemotas],
  );
  // BAL-5227: de esas, las que se escriben DENTRO del campo de la lista
  // (`other_inline`, por campo del paso). Las apagadas siguen pegadas (orden
  // y sección junto a su lista) pero se pintan aparte, debajo de la lista.
  const enElCampo = useMemo(() => otrasEnElCampo(step, pegados), [step, pegados]);
  // Al revés: lista → su «¿Cuál…?» dentro del campo.
  const pegadoDeLaLista = useMemo(() => {
    const m = new Map<string, string>();
    enElCampo.forEach((lista, pegado) => m.set(lista, pegado));
    return m;
  }, [enElCampo]);
  const camposPorCodigo = useMemo(() => new Map(step.fields.map((f) => [f.code, f])), [step.fields]);

  // Qué paso ya terminó de montar. La caja del «¿Cuál…?» que aparece en ese
  // primer render (la persona vuelve a un paso que ya estaba en «Otro») no
  // toma el foco; la que aparece después (acaba de elegir «Otro») sí.
  const pasoMontadoRef = useRef<string | null>(null);
  useEffect(() => {
    pasoMontadoRef.current = step.code;
  }, [step.code]);

  // BAL-5207: abrir «Otr…» y volver con «Ver opciones» (solo Diseño 2).
  const tracker = useEventTrackerOptional();
  const propsDeOtra = (codigoLista: string, codigoOtra: string) => ({
    field_code: codigoLista,
    other_field_code: codigoOtra,
    step_code: step.code,
    diseno: 2,
  });

  /** «Ver opciones»: vacía la lista y su «¿Cuál…?» y vuelve a la lista, sin errores todavía. */
  const verOpciones = (codigoLista: string, codigoOtra: string) => {
    tracker?.track('form_field_other_back', propsDeOtra(codigoLista, codigoOtra));
    updateField(codigoOtra, '');
    updateField(codigoLista, '');
    reiniciarCampoTocado(codigoOtra);
    reiniciarCampoTocado(codigoLista);
    setPorEnfocar(codigoLista);
  };
  // Bloques (con secciones) u orden (sin secciones): solo cambian con el paso.
  const bloques = useMemo(
    () => (esV2 && step.groups?.length ? armarBloques(step, pegados) : []),
    [esV2, step, pegados],
  );
  const ordenV2 = useMemo(
    () => (esV2 && !step.groups?.length ? ordenConPegados(step.fields, pegados) : []),
    [esV2, step, pegados],
  );

  // Diseño 2 (BAL-4969): los campos visibles al montar el paso entran con la
  // tarjeta; los que aparecen DESPUÉS (una dependencia los destapa, o
  // "+ Agregar …") entran con `bcPop` 0,25 s del prototipo. Se anota la
  // primera foto de visibilidad que tenga datos.
  const [visiblesAlMontar, setVisiblesAlMontar] = useState<ReadonlySet<string> | null>(null);
  if (esV2 && visiblesAlMontar === null && Object.keys(fieldVisibility).length > 0) {
    setVisiblesAlMontar(new Set(Object.keys(fieldVisibility).filter((c) => fieldVisibility[c])));
  }

  const pintarCampo = (field: WizardField) => {
    // Hide wrapper for invisible fields so grid gap doesn't create empty space
    if (!fieldVisibility[field.code]) return null;
    // BAL-5205: el «¿Cuál…?» ya no se pinta aparte; va dentro del campo de su
    // lista. BAL-5227: salvo que el paso lo apague (`other_inline: false`):
    // entonces va aparte, pegado debajo de su lista, como antes.
    if (esV2 && enElCampo.has(field.code)) return null;
    const pegadoA = esV2 ? pegados.get(field.code) : undefined;
    const codigoOtra = esV2 ? pegadoDeLaLista.get(field.code) : undefined;
    const campoOtra = codigoOtra && fieldVisibility[codigoOtra] ? camposPorCodigo.get(codigoOtra) : undefined;

    // Use grid_columns from API (default to 12 = full width)
    const cols = field.grid_columns || 12;
    const colsMobile = field.grid_columns_mobile || 12;

    // Get static Tailwind classes
    const colClass = GRID_COL_CLASSES[cols] || 'sm:col-span-12';
    const colMobileClass = GRID_COL_MOBILE_CLASSES[colsMobile] || 'col-span-12';

    // Diseño 2: el estado del campo (`data-estado`). Se calcula recién
    // cuando el campo se tocó o se intentó continuar, igual que el mensaje
    // de error. El borde rojo o verde lo pinta ahora el propio campo.
    const mostrarError = mostrarErrorDe(field.code);
    const valorCampo = formData[field.code]?.value;
    const conValor = tieneValor(valorCampo);
    const errorVisible = errorVisibleDe(field.code);
    const estadoV2 = !esV2 || !mostrarError
      ? undefined
      : errorVisible
        ? 'error'
        : conValor ? 'ok' : undefined;

    // Con el saludo bajo el documento, la pista sobra.
    const conSaludo = esV2 && field.type === 'document_number' && !!nombreDelSaludo(field, formValues);
    // Pista: el `hint` de la BD gana. Sin él, el número de documento dice
    // lo que pide su tipo ("8 números", "Entre 9 y 12 caracteres"…), con
    // las mismas reglas que lo validan.
    const codigoTipo = field.prefill_config?.document_type_field || 'document_type';
    const pista = !esV2
      ? null
      : field.hint || (field.type === 'document_number'
        ? ayudaDelNumero(getDocumentTypeRules(
          codigoTipo,
          { [codigoTipo]: formValues[codigoTipo] || 'dni' },
          getAllDynamicOptions?.(),
        ))
        : null);

    // BAL-4960: un campo de texto con contador pinta él mismo la pista, en
    // la fila del contador (pista a la izquierda, número a la derecha).
    const pistaEnElCampo = pistaVaEnElCampo(field, esV2);

    // Diseño 2: opcional plegado. Con valor (borrador) sale abierto.
    const plegado = esV2 && field.collapsed_optional === true && !field.required
      && !conValor && !abiertos.has(field.code);

    return (
      <React.Fragment key={field.code}>
        <div
          // El ancho sale de la configuración del paso, en los dos diseños
          // (BAL-4966, decisión de Emilio; reemplaza a D7 y a la fila de
          // cascada armada en código): `grid_columns` desde `sm` y
          // `grid_columns_mobile` debajo, 12 (ancho completo) si vienen
          // vacíos. Diseño 2 suma sus clases (`campo-v2`).
          className={esV2
            ? `${colMobileClass} ${colClass} campo-v2 rounded-xl px-2 py-1 -mx-2 transition-[box-shadow,background-color] duration-200${pegadoA ? ' -mt-3' : ''}`
            : `${colMobileClass} ${colClass}`}
          {...(esV2 ? { 'data-campo': field.code, 'data-estado': estadoV2, ...(pegadoA ? { 'data-pegado-a': pegadoA } : {}) } : {})}
        >
          {campoOtra ? (
            // BAL-5205: la lista está en su «Otr…»: en su lugar, la caja del
            // «¿Cuál…?» con su etiqueta, su error y su `data-campo` (la guía,
            // «Continuar» y el error al salir lo encuentran como siempre).
            <div data-campo={campoOtra.code}>
              <OtraEnElCampoV2
                id={campoOtra.code}
                etiqueta={campoOtra.label}
                valor={String(formData[campoOtra.code]?.value ?? '')}
                placeholder={campoOtra.placeholder || undefined}
                pista={campoOtra.hint}
                maxLength={campoOtra.max_length || undefined}
                inputMode={campoOtra.input_mode === 'numeric' ? 'numeric' : undefined}
                error={errorVisibleDe(campoOtra.code) ? formData[campoOtra.code]?.error ?? undefined : undefined}
                // Si el paso ya llegó en «Otro», no abre el teclado solo.
                enfocarAlMontar={pasoMontadoRef.current === step.code}
                onAbiertaPorLaPersona={() => tracker?.track('form_field_other_open', propsDeOtra(field.code, campoOtra.code))}
                onCambiar={(v) => updateField(campoOtra.code, v)}
                onEnfocar={() => onFieldFocus(campoOtra.code)}
                onVerOpciones={() => verOpciones(field.code, campoOtra.code)}
                onSalir={() => onFieldBlur(campoOtra.code, !!String(getFieldValue(campoOtra.code) ?? '').trim())}
              />
            </div>
          ) : plegado ? (
            <AgregarOpcionalV2 label={field.label} onAbrir={() => abrirPlegado(field.code)} />
          ) : (
            <EntradaDelCampo
              anima={esV2 && (abiertos.has(field.code) || (visiblesAlMontar !== null && !visiblesAlMontar.has(field.code)))}
            >
              <DynamicField
                field={field}
                showError={mostrarError}
                stepOrder={stepOrder}
                onLocalErrorChange={esV2 ? reportarErrorLocal : undefined}
                // BAL-4960: con contador, la pista va en su misma fila (la pinta el campo).
                pista={pistaEnElCampo && !errorVisible && !conSaludo ? pista : null}
              />
              {/* Pista bajo el campo; si hay error, el error la reemplaza. */}
              {pista && !pistaEnElCampo && !errorVisible && !conSaludo && (
                <p className={`mt-1.5 ${PISTA_V2}`} data-pista={field.code}>{pista}</p>
              )}
            </EntradaDelCampo>
          )}
        </div>
        {field.code === 'payment_day' && paymentDayValue && (
          <div className="col-span-12 -mt-1 mb-2">
            {/* Diseño 2 (I5, BAL-4969): el color de la landing; Diseño 1 igual que siempre. */}
            <div className={esV2
              ? 'd2-pop-lento flex items-center gap-3 bg-[rgba(var(--color-primary-rgb),0.05)] border border-[rgba(var(--color-primary-rgb),0.2)] rounded-xl px-4 py-3'
              : 'flex items-center gap-3 bg-[#4654CD]/5 border border-[#4654CD]/20 rounded-xl px-4 py-3'}>
              <CalendarDays className={esV2 ? 'w-5 h-5 text-[var(--color-primary-text)] flex-shrink-0' : 'w-5 h-5 text-[#4654CD] flex-shrink-0'} />
              <p className="text-sm text-neutral-700">
                Tu primera fecha de pago será el <span className={esV2 ? 'font-semibold text-[var(--color-primary-text)]' : 'font-semibold text-[#4654CD]'}>{fechaBackend ?? getFirstPaymentDate(Number(paymentDayValue), isDeferred)}</span>
              </p>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  };

  let campos: React.ReactNode;
  if (!esV2) {
    // Diseño 1, como siempre. Fields come already ordered by display_order from the API
    campos = (
      <div ref={contenedorRef} className="grid grid-cols-12 gap-x-4 gap-y-1">
        {step.fields.map((field) => pintarCampo(field))}
      </div>
    );
  } else if (!step.groups?.length) {
    // Diseño 2 sin secciones: una columna, en el orden del paso.
    campos = (
      <div ref={contenedorRef} className="grid grid-cols-12 gap-x-3 gap-y-4">
        {ordenV2.map((field) => pintarCampo(field))}
      </div>
    );
  } else {
    // Diseño 2 con secciones (`step.groups`); los campos sin sección, al final.
    // Cada sección va en su propia tarjeta, como en el prototipo de Brenda.
    const opciones = getAllDynamicOptions?.();
    campos = (
      <div ref={contenedorRef} className="flex flex-col gap-5">
        {bloques.map((bloque) => {
          if (bloque.tipo === 'sueltos') {
            if (!bloque.campos.some((f) => fieldVisibility[f.code])) return null;
            return (
              <div key="__sin-seccion" data-tarjeta-v2 className={`grid grid-cols-12 gap-x-3 gap-y-4 ${TARJETA_V2}`} style={TARJETA_V2_ESTILO}>
                {bloque.campos.map((field) => pintarCampo(field))}
              </div>
            );
          }
          const visibles = bloque.campos.filter((f) => fieldVisibility[f.code]);
          // Sin ningún campo en pantalla (una dependencia los escondió todos),
          // la sección no se pinta: un título sin nada abajo confunde.
          if (visibles.length === 0) return null;
          const completa =
            !visibles.some((f) => erroresLocales[f.code]) &&
            seccionCompleta(
              visibles,
              (f) => validateField(f, formValues[f.code], formValues, opciones, true).isValid,
              formValues,
            );
          return (
            <div key={bloque.grupo.code} data-tarjeta-v2 className={`grid grid-cols-12 ${TARJETA_V2}`} style={TARJETA_V2_ESTILO}>
            <SeccionPlegable
              codigo={bloque.grupo.code}
              titulo={bloque.grupo.name}
              icono={bloque.grupo.icon}
              descripcion={bloque.grupo.description}
              tituloEnElCampo={
                bloque.campos.length === 1 &&
                !bloque.grupo.icon &&
                !bloque.grupo.description &&
                bloque.campos[0].label.trim().toLowerCase() === bloque.grupo.name.trim().toLowerCase()
              }
              plegable={bloque.grupo.is_collapsible}
              completa={completa}
              resumen={resumenDeSeccion(visibles, formValues, getFieldLabel, pegados)}
              conError={showErrors && visibles.some((f) => errorVisibleDe(f.code))}
            >
              {bloque.campos.map((field) => pintarCampo(field))}
            </SeccionPlegable>
            </div>
          );
        })}
      </div>
    );
  }

  return esV2 ? <CamposV2Provider>{campos}</CamposV2Provider> : campos;
};

/**
 * Diseño 2: envoltorio de un campo que aparece después de montado el paso.
 * La animación va en un hijo y no en `.campo-v2`, porque ahí vive el
 * `brilloCampoV2` de la guía: compartir la propiedad `animation` haría que
 * el pop se repitiera al apagarse el brillo. Sin `anima`, no envuelve nada.
 */
function EntradaDelCampo({ anima, children }: { anima: boolean; children: React.ReactNode }) {
  if (!anima) return <>{children}</>;
  return <div className="d2-pop">{children}</div>;
}

export default DynamicWizardStep;
