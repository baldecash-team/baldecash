'use client';

/**
 * WizardSummary - Displays a summary of all wizard form data before submission
 *
 * Features:
 * - Iterates all steps and fields from WizardConfig
 * - Shows field.label + resolved value (options resolved to labels)
 * - Respects field visibility (hidden fields not shown)
 * - Groups by step with edit buttons
 * - Fully dynamic - 100% from API config
 * - Auto-resolves labels for dynamic fields from API
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { useWizardConfig } from '../../../context/WizardConfigContext';
import { useWizard } from '../../../context/WizardContext';
import { FieldState } from '../../../types/solicitar';
import {
  WizardStep,
  WizardField,
  evaluateFieldVisibility,
  getStepSlug,
  fetchOptionById,
} from '../../../../../services/wizardApi';

interface WizardSummaryProps {
  /** Callback when user clicks edit on a step */
  onEditStep?: (stepCode: string, stepSlug: string) => void;
  /** Whether to show edit buttons */
  showEditButtons?: boolean;
  /** Optional className for the container */
  className?: string;
}

// Map of field codes to their options_source endpoints
const FIELD_OPTIONS_SOURCE_MAP: Record<string, string> = {
  department: 'geo-units/departments',
  province: 'geo-units/provinces',
  district: 'geo-units/districts',
  institution: 'study-centers',
  career: 'careers',
  marital_status: 'marital-status',
};

/**
 * Resolves a field value to its display label
 */
function resolveFieldValue(
  field: WizardField,
  value: string | string[] | undefined,
  resolvedLabel?: string
): string {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  // Handle array values (checkbox, multi-select)
  if (Array.isArray(value)) {
    if (value.length === 0) return '-';

    // If field has options, resolve each value to its label
    if (field.options && field.options.length > 0) {
      const labels = value.map((v) => {
        const option = field.options.find((opt) => opt.value === v);
        return option ? option.label : v;
      });
      return labels.join(', ');
    }

    return value.join(', ');
  }

  // Single value with options (radio, select)
  if (field.options && field.options.length > 0) {
    const option = field.options.find((opt) => opt.value === value);
    if (option) {
      return option.label;
    }
  }

  // Use resolved label from API
  if (resolvedLabel) {
    return resolvedLabel;
  }

  // Date formatting
  if (field.type === 'date' && value) {
    try {
      // Parse date safely to avoid timezone issues
      const date = new Date(value + 'T12:00:00');
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return value;
    }
  }

  // Currency formatting
  if (field.type === 'currency' && value) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    }
  }

  // Phone with prefix
  if (field.type === 'phone' && field.prefix && value) {
    return `${field.prefix} ${value}`;
  }

  return String(value);
}

/**
 * Renders a single field row in the summary
 */
const SummaryFieldRow: React.FC<{
  field: WizardField;
  value: string | string[] | undefined;
  resolvedLabel?: string;
}> = ({ field, value, resolvedLabel }) => {
  const displayValue = resolveFieldValue(field, value, resolvedLabel);

  return (
    <div className="flex justify-between items-start py-2 border-b border-neutral-100 last:border-b-0">
      <span className="text-sm text-neutral-600 flex-shrink-0 pr-4">
        {field.label}
      </span>
      <span className="text-sm font-medium text-neutral-800 text-right">
        {displayValue}
      </span>
    </div>
  );
};

/**
 * Renders a step section with its fields
 */
const SummaryStepSection: React.FC<{
  step: WizardStep;
  formValues: Record<string, string | string[]>;
  formData: Record<string, FieldState>;
  resolvedLabels: Record<string, string>;
  prefillTargetFields: Set<string>;
  onEdit?: () => void;
  showEditButton?: boolean;
}> = ({ step, formValues, formData, resolvedLabels, prefillTargetFields, onEdit, showEditButton = true }) => {
  // Filter visible fields
  const visibleFields = useMemo(() => {
    return step.fields.filter((field) => {
      // Prefill target fields that were auto-filled are internal — don't show in summary.
      // But if the field was manually completed (API returned null), show it.
      if (field.hidden && prefillTargetFields.has(field.code)) {
        const wasEmpty = formValues[`_prefill_empty_${field.code}`] === 'true';
        // Show in summary only if the user had to fill it manually (API returned null)
        return wasEmpty && !!formValues[field.code];
      }

      // Check visibility based on dependencies
      return evaluateFieldVisibility(field, formValues);
    });
  }, [step.fields, formValues, prefillTargetFields]);

  // Don't render section if no visible fields
  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Step Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <div>
          <h3 className="text-base font-semibold text-neutral-800">
            {step.title || step.name}
          </h3>
          {step.description && (
            <p className="text-xs text-neutral-500 mt-0.5">{step.description}</p>
          )}
        </div>
        {showEditButton && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            <Edit2 size={14} />
            <span>Editar</span>
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="px-4 py-2">
        {visibleFields.map((field) => {
          // Priority: 1) resolved from API, 2) saved in localStorage, 3) raw value
          const resolvedLabel = resolvedLabels[field.code] || formData[field.code]?.label;
          return (
            <SummaryFieldRow
              key={field.code}
              field={field}
              value={formValues[field.code]}
              resolvedLabel={resolvedLabel}
            />
          );
        })}
      </div>
    </div>
  );
};

/**
 * Main WizardSummary component
 */
export const WizardSummary: React.FC<WizardSummaryProps> = ({
  onEditStep,
  showEditButtons = true,
  className = '',
}) => {
  const { steps, isLoading, error } = useWizardConfig();
  const { formData, updateField } = useWizard();
  const [resolvedLabels, setResolvedLabels] = useState<Record<string, string>>({});
  const [isResolvingLabels, setIsResolvingLabels] = useState(false);

  // Build form values object from formData
  const formValues = useMemo(() => {
    const values: Record<string, string | string[]> = {};
    for (const [key, state] of Object.entries(formData)) {
      if (state?.value !== undefined) {
        values[key] = state.value as string | string[];
      }
    }
    return values;
  }, [formData]);

  // Filter to only show regular steps (not summary steps)
  const regularSteps = useMemo(() => {
    return steps.filter((step) => !step.is_summary_step);
  }, [steps]);

  // Identify prefill target fields (e.g., supporter_full_name filled by check-person API)
  // These are internal fields that should never appear in the summary
  const prefillTargetFields = useMemo(() => {
    const targets = new Set<string>();
    for (const s of regularSteps) {
      for (const f of s.fields) {
        if (f.type === 'document_number' && f.prefill_config?.prefill_fields) {
          for (const code of Object.keys(f.prefill_config.prefill_fields)) {
            targets.add(code);
          }
        }
      }
    }
    return targets;
  }, [regularSteps]);

  // Identify fields that need label resolution
  const fieldsNeedingResolution = useMemo(() => {
    const fields: Array<{ code: string; value: string; optionsSource: string }> = [];

    for (const step of regularSteps) {
      for (const field of step.fields) {
        const value = formValues[field.code];
        const savedLabel = formData[field.code]?.label;

        // Skip if no value, already has label, or not a dynamic field
        if (!value || savedLabel || Array.isArray(value)) {
          continue;
        }

        // Check if field has options_source or is in our known map
        const optionsSource = field.options_source || FIELD_OPTIONS_SOURCE_MAP[field.code];

        // Skip if field has static options that can resolve the value
        if (field.options && field.options.length > 0) {
          const found = field.options.find(opt => opt.value === value);
          if (found) {
            continue;
          }
        }

        if (optionsSource) {
          fields.push({ code: field.code, value: value as string, optionsSource });
        }
      }
    }

    return fields;
  }, [regularSteps, formValues, formData]);

  // Fetch labels for fields that need resolution
  useEffect(() => {
    if (fieldsNeedingResolution.length === 0) {
      return;
    }

    const resolveLabels = async () => {
      setIsResolvingLabels(true);
      const newLabels: Record<string, string> = {};

      // Fetch all labels in parallel
      const promises = fieldsNeedingResolution.map(async ({ code, value, optionsSource }) => {
        try {
          const option = await fetchOptionById(optionsSource, value);
          if (option) {
            newLabels[code] = option.label;
            // Also save to localStorage for future use
            updateField(code, value, option.label);
          }
        } catch {
          // Error resolving label, field will show raw value
        }
      });

      await Promise.all(promises);
      setResolvedLabels(prev => ({ ...prev, ...newLabels }));
      setIsResolvingLabels(false);
    };

    resolveLabels();
  }, [fieldsNeedingResolution, updateField]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse"
          >
            <div className="h-5 bg-neutral-200 rounded w-1/3 mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-neutral-100 rounded w-full" />
              <div className="h-4 bg-neutral-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (regularSteps.length === 0) {
    return (
      <div className={`bg-neutral-50 border border-neutral-200 rounded-xl p-4 ${className}`}>
        <p className="text-neutral-500 text-sm text-center">
          No hay datos para mostrar
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {isResolvingLabels && (
        <div className="text-center text-sm text-neutral-500 py-2">
          Cargando información...
        </div>
      )}
      {regularSteps.map((step) => (
        <SummaryStepSection
          key={step.code}
          step={step}
          formValues={formValues}
          formData={formData}
          resolvedLabels={resolvedLabels}
          prefillTargetFields={prefillTargetFields}
          showEditButton={showEditButtons}
          onEdit={
            onEditStep
              ? () => onEditStep(step.code, getStepSlug(step))
              : undefined
          }
        />
      ))}
    </div>
  );
};

export default WizardSummary;
