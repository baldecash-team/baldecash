'use client';

/**
 * DocumentNumberField - Document number input with automatic prefill
 *
 * When user enters a complete document number (8 digits for DNI):
 * 1. Calls check-person API
 * 2. Auto-fills related fields (names, email, phone, etc.)
 * 3. Shows loading indicator while checking
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { WizardField } from '../../../../../services/wizardApi';
import { useWizard } from '../../../context/WizardContext';
import { useCheckPerson } from '../../../hooks/useCheckPerson';
import { TextInput } from './TextInput';
import { PrefillData } from '../../../../../services/applicationApi';

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

export const DocumentNumberField: React.FC<DocumentNumberFieldProps> = ({
  field,
  showError = false,
}) => {
  const { getFieldValue, getFieldError, updateField, formData } = useWizard();
  const prefilledRef = useRef(false);

  // Get prefill config from field configuration
  const prefillConfig = field.prefill_config;

  // Document type comes from a sibling field. The legacy shape specifies which
  // field via `document_type_field`; the new shape drops it and the convention
  // 'document_type' applies.
  const documentTypeField = prefillConfig?.document_type_field || 'document_type';
  const documentType = (getFieldValue(documentTypeField) as string) || 'dni';

  // Get current value and error
  const value = getFieldValue(field.code) as string;
  const error = showError ? getFieldError(field.code) : undefined;

  // Handle prefill when data is received
  const handlePrefillReady = useCallback((data: PrefillData) => {
    // Set prefill status FIRST so visibility evaluates before cleanup runs
    updateField(`_prefill_status_${field.code}`, 'found');

    if (prefillConfig?.prefill_fields) {
      // Legacy mode: Record<target, source | source[]> from form builder.
      // Array values concatenate multiple API fields into one target (e.g.
      // supporter_full_name = first_name + paternal_surname + maternal_surname).
      for (const [formFieldCode, apiSource] of Object.entries(prefillConfig.prefill_fields)) {
        if (Array.isArray(apiSource)) {
          const parts = apiSource.map(key => data[key as keyof PrefillData]).filter(Boolean);
          const joined = parts.join(' ');
          updateField(formFieldCode, joined);
          updateField(`_prefill_empty_${formFieldCode}`, joined ? '' : 'true');
        } else {
          const val = data[apiSource as keyof PrefillData];
          updateField(formFieldCode, val ? String(val) : '');
          updateField(`_prefill_empty_${formFieldCode}`, val ? '' : 'true');
        }
      }
    } else if (prefillConfig?.fields_to_fill) {
      // New mode: identity mapping — each entry is both target and response key.
      for (const formFieldCode of prefillConfig.fields_to_fill) {
        const value = data[formFieldCode as keyof PrefillData];
        updateField(formFieldCode, value ? String(value) : '');
        updateField(`_prefill_empty_${formFieldCode}`, value ? '' : 'true');
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
            if (prefillValue) {
              updateField(code, String(prefillValue));
            } else {
              updateField(code, '');
            }
            // Mark whether this field received a null/empty value from the API
            updateField(`_prefill_empty_${code}`, prefillValue ? '' : 'true');
            break;
          }
        }
      }
    }

    prefilledRef.current = true;
  }, [prefillConfig, formData, updateField]);

  // Handle clearing fields when no prefill data is available
  // Only clear if fields were previously auto-filled (not manually entered)
  const handleNoPrefillData = useCallback(() => {
    // Mark as not found — this triggers visibility of personal fields
    updateField(`_prefill_status_${field.code}`, 'not_found');

    if (!prefilledRef.current) return; // Don't clear manually entered data

    const targets = prefillConfig?.prefill_fields
      ? Object.keys(prefillConfig.prefill_fields)
      : prefillConfig?.fields_to_fill ?? null;

    if (targets) {
      // Clear fields and their empty markers (covers both legacy and new shapes)
      for (const formFieldCode of targets) {
        updateField(formFieldCode, '');
        updateField(`_prefill_empty_${formFieldCode}`, '');
      }
    } else {
      // Legacy mode
      const formFieldCodes = Object.keys(formData);

      for (const [prefillKey, possibleCodes] of Object.entries(DEFAULT_PREFILL_MAP)) {
        if (prefillKey === 'source') continue;

        for (const code of possibleCodes) {
          if (formFieldCodes.includes(code) || code === possibleCodes[0]) {
            updateField(code, '');
            updateField(`_prefill_empty_${code}`, '');
            break;
          }
        }
      }
    }

    prefilledRef.current = false;
  }, [prefillConfig, formData, updateField]);

  // Initialize the check-person hook
  const { check, isChecking, response, reset: resetCheck } = useCheckPerson({
    onPrefillReady: handlePrefillReady,
    onNoPrefillData: handleNoPrefillData,
    debounceMs: 500,
  });

  // Trigger check when document number is complete
  useEffect(() => {
    const cleanValue = value?.trim() || '';

    // Check based on document type
    if (documentType === 'dni' && cleanValue.length === 8 && /^\d+$/.test(cleanValue)) {
      check(documentType, cleanValue);
    } else if (documentType === 'ce' && cleanValue.length >= 9) {
      check(documentType, cleanValue);
    } else if (documentType === 'passport' && cleanValue.length >= 6) {
      check(documentType, cleanValue);
    }
  }, [value, documentType, check]);

  // Handle value change — filter input based on document type
  const handleChange = useCallback((newValue: string) => {
    let filtered: string;
    if (documentType === 'pasaporte' || documentType === 'passport') {
      // Passport: alphanumeric only
      filtered = newValue.replace(/[^a-zA-Z0-9]/g, '');
    } else {
      // DNI, CE: digits only
      filtered = newValue.replace(/\D/g, '');
    }
    updateField(field.code, filtered);
    // Always reset prefill status when user modifies the document number
    // so prefill-dependent fields hide until next lookup completes
    updateField(`_prefill_status_${field.code}`, '');
    resetCheck(); // Allow re-checking when DNI changes
  }, [field.code, documentType, updateField, resetCheck]);

  // Build tooltip from API help_text
  const tooltip = field.help_text ? {
    title: field.help_text.title || field.label,
    description: field.help_text.description || '',
    recommendation: field.help_text.recommendation ?? undefined,
  } : undefined;

  // Determine success state
  const hasValue = !!value;
  const isSuccess = !error && hasValue;

  const isPassport = documentType === 'pasaporte' || documentType === 'passport';

  return (
    <TextInput
      id={field.code}
      label={field.label}
      value={value}
      onChange={handleChange}
      error={error}
      required={field.required}
      disabled={field.readonly}
      tooltip={tooltip}
      type="text"
      inputMode={isPassport ? 'text' : 'numeric'}
      placeholder={field.placeholder || undefined}
      maxLength={field.max_length || undefined}
      success={isSuccess}
      isLoading={isChecking}
    />
  );
};

export default DocumentNumberField;
