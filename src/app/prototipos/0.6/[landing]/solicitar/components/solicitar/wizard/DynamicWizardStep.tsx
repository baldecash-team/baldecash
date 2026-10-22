'use client';

/**
 * DynamicWizardStep - Renders all fields for a wizard step from API config
 * Uses grid layout based on field.grid_columns
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { WizardStep, evaluateFieldVisibility, evaluatePrefillFieldVisibility, getPrefillTargetFieldCodes } from '../../../../../services/wizardApi';
import { DynamicField } from '../fields/DynamicField';
import { useWizard } from '../../../context/WizardContext';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { leadLockKey } from '../../../hooks/useLeadPrefill';
import { formatearFechaIso, obtenerPrimeraFechaPago } from '../../../utils/primeraFechaPago';
import { CamposV2Provider, PISTA_V2 } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';
import { AgregarOpcionalV2 } from '@/app/prototipos/0.6/components/diseno-2/campos/AgregarOpcionalV2';
import { ResumenPrellenadoV2 } from '@/app/prototipos/0.6/components/diseno-2/paso1/ResumenPrellenadoV2';
import { camposDelResumen, nombreDelSaludo, textoDelResumen } from '@/app/prototipos/0.6/components/diseno-2/paso1/datosPersonalesV2';

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
   * "+ Agregar …". Las secciones (`step.groups`) todavía no se pintan (F5/F6):
   * los campos salen en su orden de siempre.
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
  const { getFieldValue, updateField, formData } = useWizard();
  const { deferredPayment, landing } = useLayout();

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
        if (currentValue && currentValue === prevValue) {
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
  // Diseño 2 (BAL-4963): "Corregir" en el resumen de lo que llenó el
  // prefill. Marca esos campos como `_prefill_empty_`, la misma marca de un
  // prefill que vino vacío: la regla de visibilidad de siempre los destapa
  // como inputs, y la validación y el resumen final los tratan igual.
  const corregirPrellenado = (codigos: string[]) => {
    for (const codigo of codigos) updateField(`_prefill_empty_${codigo}`, 'true');
    if (codigos[0]) setPorEnfocar(codigos[0]);
  };
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

  // Fields come already ordered by display_order from the API
  const campos = (
    <div ref={contenedorRef} className={esV2 ? 'grid grid-cols-12 gap-y-4' : 'grid grid-cols-12 gap-x-4 gap-y-1'}>
      {step.fields.map((field) => {
        // Hide wrapper for invisible fields so grid gap doesn't create empty space
        if (!fieldVisibility[field.code]) return null;

        // Use grid_columns from API (default to 12 = full width)
        const cols = field.grid_columns || 12;
        const colsMobile = field.grid_columns_mobile || 12;

        // Get static Tailwind classes
        const colClass = GRID_COL_CLASSES[cols] || 'sm:col-span-12';
        const colMobileClass = GRID_COL_MOBILE_CLASSES[colsMobile] || 'col-span-12';

        // Diseño 2: el estado del campo (`data-estado`). Se calcula recién
        // cuando el campo se tocó o se intentó continuar, igual que el mensaje
        // de error. El borde rojo o verde lo pinta ahora el propio campo.
        const mostrarError = showErrors || (esV2 && camposTocados.has(field.code));
        const valorCampo = formData[field.code]?.value;
        const conValor = tieneValor(valorCampo);
        const errorVisible = mostrarError && (!!formData[field.code]?.error || !!erroresLocales[field.code]);
        const estadoV2 = !esV2 || !mostrarError
          ? undefined
          : errorVisible
            ? 'error'
            : conValor ? 'ok' : undefined;

        // Diseño 2: los campos que llenó el prefill de ESTE documento, en una
        // línea bajo el campo (punto 2 del brief). Vacío en Diseño 1.
        const resumen = esV2 && field.prefill_config ? camposDelResumen(step, field, formValues) : [];
        // Con el saludo bajo el documento, la pista sobra.
        const conSaludo = esV2 && field.type === 'document_number' && !!nombreDelSaludo(field, formValues);

        // Diseño 2: opcional plegado. Con valor (borrador) sale abierto.
        const plegado = esV2 && field.collapsed_optional === true && !field.required
          && !conValor && !abiertos.has(field.code);

        return (
          <React.Fragment key={field.code}>
            <div
              // Diseño 2: una sola columna (decisión D7), se ignoran
              // `grid_columns` / `grid_columns_mobile`.
              className={esV2
                ? 'col-span-12 campo-v2 rounded-xl px-2 py-1 -mx-2 transition-[box-shadow,background-color] duration-200'
                : `${colMobileClass} ${colClass}`}
              {...(esV2 ? { 'data-campo': field.code, 'data-estado': estadoV2 } : {})}
            >
              {plegado ? (
                <AgregarOpcionalV2 label={field.label} onAbrir={() => abrirPlegado(field.code)} />
              ) : (
                <>
                  <DynamicField
                    field={field}
                    showError={mostrarError}
                    stepOrder={stepOrder}
                    onLocalErrorChange={esV2 ? reportarErrorLocal : undefined}
                  />
                  {/* Pista bajo el campo; si hay error, el error la reemplaza. */}
                  {esV2 && field.hint && !errorVisible && !conSaludo && (
                    <p className={`mt-1.5 ${PISTA_V2}`} data-pista={field.code}>{field.hint}</p>
                  )}
                </>
              )}
            </div>
            {resumen.length > 0 && (
              <div className="col-span-12">
                <ResumenPrellenadoV2
                  texto={textoDelResumen(resumen, formValues)}
                  onCorregir={() => corregirPrellenado(resumen.map((f) => f.code))}
                />
              </div>
            )}
            {field.code === 'payment_day' && paymentDayValue && (
              <div className="col-span-12 -mt-1 mb-2">
                <div className="flex items-center gap-3 bg-[#4654CD]/5 border border-[#4654CD]/20 rounded-xl px-4 py-3">
                  <CalendarDays className="w-5 h-5 text-[#4654CD] flex-shrink-0" />
                  <p className="text-sm text-neutral-700">
                    Tu primera fecha de pago será el <span className="font-semibold text-[#4654CD]">{fechaBackend ?? getFirstPaymentDate(Number(paymentDayValue), isDeferred)}</span>
                  </p>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return esV2 ? <CamposV2Provider>{campos}</CamposV2Provider> : campos;
};

export default DynamicWizardStep;
