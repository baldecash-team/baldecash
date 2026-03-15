'use client';

/**
 * DocumentNumberField - Document number input with automatic prefill
 *
 * When user enters a complete document number (8 digits for DNI):
 * 1. Calls check-person API
 * 2. Auto-fills related fields (names, email, phone, etc.)
 * 3. Shows loading indicator while checking
 */

import React, { useEffect, useCallback, useState } from 'react';
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
const PREFILL_FIELD_MAP: Record<keyof PrefillData, string[]> = {
  first_name: ['first_name', 'nombres', 'primer_nombre'],
  paternal_surname: ['paternal_surname', 'apellido_paterno'],
  maternal_surname: ['maternal_surname', 'apellido_materno'],
  birth_date: ['birth_date', 'fecha_nacimiento'],
  gender: ['gender', 'genero', 'sexo'],
  email: ['email', 'correo', 'correo_electronico'],
  phone: ['phone', 'phone_mobile', 'celular', 'telefono'],
  department: ['department', 'departamento', 'address_department'],
  province: ['province', 'provincia', 'address_province'],
  district: ['district', 'distrito', 'address_district'],
  source: [], // Internal, don't prefill
};

export const DocumentNumberField: React.FC<DocumentNumberFieldProps> = ({
  field,
  showError = false,
}) => {
  const { getFieldValue, getFieldError, updateField, formData } = useWizard();
  const [prefilled, setPrefilled] = useState(false);

  // Get the document_type value (usually from another field)
  const documentTypeField = 'document_type';
  const documentType = (getFieldValue(documentTypeField) as string) || 'dni';

  // Get current value and error
  const value = getFieldValue(field.code) as string;
  const error = showError ? getFieldError(field.code) : undefined;

  // Handle prefill when data is received
  const handlePrefillReady = useCallback((data: PrefillData) => {
    // Get all field codes from current form data
    const formFieldCodes = Object.keys(formData);

    // For each prefill field, find matching form field and update
    for (const [prefillKey, possibleCodes] of Object.entries(PREFILL_FIELD_MAP)) {
      const prefillValue = data[prefillKey as keyof PrefillData];

      // Skip if no value or if it's the source field
      if (!prefillValue || prefillKey === 'source') continue;

      // Find a matching field code in the form
      for (const code of possibleCodes) {
        if (formFieldCodes.includes(code) || code === possibleCodes[0]) {
          // Only update if the field exists or it's the primary code
          const existingValue = formData[code]?.value;
          // Don't overwrite if user already filled this field
          if (!existingValue) {
            updateField(code, String(prefillValue));
          }
          break;
        }
      }
    }

    setPrefilled(true);
  }, [formData, updateField]);

  // Initialize the check-person hook
  const { check, isChecking, response } = useCheckPerson({
    onPrefillReady: handlePrefillReady,
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

  // Handle value change
  const handleChange = useCallback((newValue: string) => {
    updateField(field.code, newValue);
    // Reset prefilled state when user changes the value
    if (prefilled) {
      setPrefilled(false);
    }
  }, [field.code, updateField, prefilled]);

  // Build tooltip from API help_text
  const tooltip = field.help_text ? {
    title: field.help_text.title || field.label,
    description: field.help_text.description || '',
    recommendation: field.help_text.recommendation ?? undefined,
  } : undefined;

  // Determine success state
  const hasValue = !!value;
  const isSuccess = !error && hasValue;

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
      placeholder={field.placeholder || undefined}
      maxLength={field.max_length || undefined}
      success={isSuccess}
      isLoading={isChecking}
    />
  );
};

export default DocumentNumberField;
