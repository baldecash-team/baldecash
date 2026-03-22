'use client';

/**
 * DynamicWizardStep - Renders all fields for a wizard step from API config
 * Uses grid layout based on field.grid_columns
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { WizardStep, evaluateFieldVisibility } from '../../../../../services/wizardApi';
import { DynamicField } from '../fields/DynamicField';
import { useWizard } from '../../../context/WizardContext';

interface DynamicWizardStepProps {
  step: WizardStep;
  showErrors?: boolean;
  /** Step order number for event tracking */
  stepOrder?: number;
}

// Tailwind requires static class names - dynamic classes like `col-span-${n}` get purged
// Map grid_columns values to static Tailwind classes
const GRID_COL_CLASSES: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
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

export const DynamicWizardStep: React.FC<DynamicWizardStepProps> = ({
  step,
  showErrors = false,
  stepOrder,
}) => {
  const { getFieldValue, updateField, formData } = useWizard();

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

  // Map each prefill target field to its source document_number field code.
  // e.g., { "supporter_full_name": "supporter_document_number", "first_name": "document_number" }
  const prefillFieldToDocField = useMemo(() => {
    const map: Record<string, string> = {};
    for (const field of step.fields) {
      if (field.type === 'document_number' && field.prefill_config?.prefill_fields) {
        for (const code of Object.keys(field.prefill_config.prefill_fields)) {
          map[code] = field.code;
        }
      }
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
        const prefillStatus = formValues[`_prefill_status_${docFieldCode}`] as string | undefined;
        vis[field.code] = prefillStatus === 'not_found';
      } else {
        vis[field.code] = evaluateFieldVisibility(field, formValues);
      }
    }
    return vis;
  }, [step.fields, formValues, prefillFieldToDocField]);

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

  // Fields come already ordered by display_order from the API
  return (
    <div className="grid grid-cols-12 gap-4">
      {step.fields.map((field) => {
        // Hide wrapper for invisible fields so grid gap doesn't create empty space
        if (!fieldVisibility[field.code]) return null;

        // Use grid_columns from API (default to 12 = full width)
        const cols = field.grid_columns || 12;
        const colsMobile = field.grid_columns_mobile || 12;

        // Get static Tailwind classes
        const colClass = GRID_COL_CLASSES[cols] || 'md:col-span-12';
        const colMobileClass = GRID_COL_MOBILE_CLASSES[colsMobile] || 'col-span-12';

        return (
          <div
            key={field.code}
            className={`${colMobileClass} ${colClass}`}
          >
            <DynamicField
              field={field}
              showError={showErrors}
              stepOrder={stepOrder}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DynamicWizardStep;
