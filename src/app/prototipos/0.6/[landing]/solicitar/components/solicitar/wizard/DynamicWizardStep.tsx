'use client';

/**
 * DynamicWizardStep - Renders all fields for a wizard step from API config
 * Uses grid layout based on field.grid_columns
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { WizardStep, evaluateFieldVisibility, getPrefillTargetFieldCodes } from '../../../../../services/wizardApi';
import { DynamicField } from '../fields/DynamicField';
import { useWizard } from '../../../context/WizardContext';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { leadLockKey } from '../../../hooks/useLeadPrefill';

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Primera fecha de pago a mostrar. Base: el mes siguiente. Si la landing es
 * diferida (`extraMonths` = deferred_payment.deferred_months), se corre esa
 * cantidad de meses adicionales, con rollover de año.
 */
function getFirstPaymentDate(selectedDay: number, extraMonths: number = 0): string {
  const today = new Date();
  const monthsAhead = 1 + Math.max(0, extraMonths);
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
}) => {
  const { getFieldValue, updateField, formData } = useWizard();
  const { deferredPayment } = useLayout();

  // Meses adicionales a sumar al primer pago cuando la landing es diferida.
  const deferredMonths = deferredPayment?.enabled ? deferredPayment.deferred_months : 0;

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
        // Prefill-dependent fields: show only when DNI lookup returned no data
        const prefillStatus = formValues[`_prefill_status_${docFieldCode}`] as string | undefined;
        // Vale para cualquier estado del lookup, no solo mientras no contesta:
        // si dependiera del estado, el campo pasaria de visible a oculto en
        // cuanto el lookup respondiera, y el efecto de limpieza de mas abajo
        // borraria lo que la persona acabara de elegir.
        const destapadoPorLead = destaparPorLeadSinBuro(
          formValues,
          docFieldCode,
          docTypeFieldDe[docFieldCode] || 'document_type',
        );
        if (destapadoPorLead || prefillStatus === 'not_found') {
          vis[field.code] = true;
        } else if (prefillStatus === 'found') {
          const isEmpty = formValues[`_prefill_empty_${field.code}`] === 'true';
          vis[field.code] = isEmpty;
        } else {
          vis[field.code] = false;
        }
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

  const paymentDayValue = getFieldValue('payment_day') as string;

  // Fields come already ordered by display_order from the API
  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-1">
      {step.fields.map((field) => {
        // Hide wrapper for invisible fields so grid gap doesn't create empty space
        if (!fieldVisibility[field.code]) return null;

        // Use grid_columns from API (default to 12 = full width)
        const cols = field.grid_columns || 12;
        const colsMobile = field.grid_columns_mobile || 12;

        // Get static Tailwind classes
        const colClass = GRID_COL_CLASSES[cols] || 'sm:col-span-12';
        const colMobileClass = GRID_COL_MOBILE_CLASSES[colsMobile] || 'col-span-12';

        return (
          <React.Fragment key={field.code}>
            <div className={`${colMobileClass} ${colClass}`}>
              <DynamicField
                field={field}
                showError={showErrors}
                stepOrder={stepOrder}
              />
            </div>
            {field.code === 'payment_day' && paymentDayValue && (
              <div className="col-span-12 -mt-1 mb-2">
                <div className="flex items-center gap-3 bg-[#4654CD]/5 border border-[#4654CD]/20 rounded-xl px-4 py-3">
                  <CalendarDays className="w-5 h-5 text-[#4654CD] flex-shrink-0" />
                  <p className="text-sm text-neutral-700">
                    Tu primera fecha de pago será el <span className="font-semibold text-[#4654CD]">{getFirstPaymentDate(Number(paymentDayValue), deferredMonths)}</span>
                  </p>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default DynamicWizardStep;
