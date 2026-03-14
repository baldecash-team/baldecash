'use client';

/**
 * DynamicField - Renders the correct field component based on API config
 * Maps WizardField type to the appropriate UI component
 */

import React, { useMemo, useCallback } from 'react';
import { WizardField, WizardFieldOption, evaluateFieldVisibility, filterFieldOptions } from '../../../../../services/wizardApi';
import { useWizard } from '../../../context/WizardContext';
import { useFieldTracking } from '../../../hooks/useFieldTracking';
import { TextInput } from './TextInput';
import { SegmentedControl } from './SegmentedControl';
import { RadioGroup } from './RadioGroup';
import { SelectInput } from './SelectInput';
import { CascadingSelectField } from './CascadingSelectField';
import { DateInput } from './DateInput';
import { FileUpload } from './FileUpload';
import { TextArea } from './TextArea';
import { CheckboxField } from './CheckboxField';
import { DocumentNumberField } from './DocumentNumberField';
import { AddressAutocompleteField } from './AddressAutocompleteField';

interface DynamicFieldProps {
  field: WizardField;
  showError?: boolean;
  /** Step order number for event tracking */
  stepOrder?: number;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({ field, showError = false, stepOrder }) => {
  const { getFieldValue, getFieldError, updateField, formData } = useWizard();
  const { onFieldFocus, onFieldBlur } = useFieldTracking(stepOrder);

  // Get current value and error
  const value = getFieldValue(field.code) as string;
  const error = showError ? getFieldError(field.code) : undefined;

  // Build form values object for visibility evaluation
  const formValues = useMemo(() => {
    const values: Record<string, string | string[]> = {};
    for (const [key, state] of Object.entries(formData)) {
      if (state?.value !== undefined) {
        values[key] = state.value as string | string[];
      }
    }
    return values;
  }, [formData]);

  // Check if field should be visible
  const isVisible = useMemo(() => {
    return evaluateFieldVisibility(field, formValues);
  }, [field, formValues]);

  // Filter options based on visibility conditions
  const filteredOptions = useMemo(() => {
    return filterFieldOptions(field, formValues);
  }, [field, formValues]);

  // Build tooltip from API help_text (100% from BD)
  // NOTE: Must be before conditional return to maintain hooks order
  const tooltip = useMemo(() => {
    if (field.help_text) {
      return {
        title: field.help_text.title || field.label,
        description: field.help_text.description || '',
        recommendation: field.help_text.recommendation ?? undefined,
      };
    }
    return undefined;
  }, [field.help_text, field.label]);

  // Focus/blur handlers for event tracking
  const handleFocus = useCallback(() => {
    onFieldFocus(field.code);
  }, [field.code, onFieldFocus]);

  const handleBlur = useCallback(() => {
    const currentValue = getFieldValue(field.code);
    const hasValue = Array.isArray(currentValue)
      ? currentValue.length > 0
      : !!currentValue;
    onFieldBlur(field.code, hasValue);
  }, [field.code, getFieldValue, onFieldBlur]);

  // If field is not visible, don't render
  if (!isVisible) {
    return null;
  }

  // Common props for all field types
  const commonProps = {
    id: field.code,
    label: field.label,
    value,
    onChange: (newValue: string) => updateField(field.code, newValue),
    onFocus: handleFocus,
    onBlur: handleBlur,
    error,
    required: field.required,
    disabled: field.readonly,
    tooltip,
    helpText: undefined as string | undefined,
  };

  // Render based on field type
  switch (field.type) {
    case 'document_number':
      // Special field that triggers auto-prefill on complete document number
      return (
        <DocumentNumberField
          field={field}
          showError={showError}
        />
      );

    case 'address_autocomplete':
      // Google Maps Places autocomplete for address input
      return (
        <AddressAutocompleteField
          field={field}
          showError={showError}
        />
      );

    case 'text':
      return (
        <TextInput
          {...commonProps}
          type="text"
          placeholder={field.placeholder || undefined}
          maxLength={field.max_length || undefined}
          success={!error && !!value}
        />
      );

    case 'email':
      return (
        <TextInput
          {...commonProps}
          type="email"
          placeholder={field.placeholder || undefined}
          inputMode="email"
          success={!error && !!value}
        />
      );

    case 'phone':
      return (
        <div className="relative">
          {field.prefix && (
            <div className="absolute left-3 top-[38px] text-neutral-500 text-base z-10">
              {field.prefix}
            </div>
          )}
          <TextInput
            {...commonProps}
            type="tel"
            placeholder={field.placeholder || undefined}
            maxLength={field.max_length || undefined}
            inputMode="tel"
            success={!error && !!value}
          />
          <style jsx>{`
            div :global(input) {
              padding-left: ${field.prefix ? '3rem' : '0.75rem'};
            }
          `}</style>
        </div>
      );

    case 'currency':
      return (
        <div className="relative">
          {field.prefix && (
            <div className="absolute left-3 top-[38px] text-neutral-500 text-base z-10">
              {field.prefix}
            </div>
          )}
          <TextInput
            {...commonProps}
            type="number"
            placeholder={field.placeholder || undefined}
            inputMode="numeric"
            success={!error && !!value}
          />
          <style jsx>{`
            div :global(input) {
              padding-left: ${field.prefix ? '2.5rem' : '0.75rem'};
            }
          `}</style>
        </div>
      );

    case 'number':
      return (
        <TextInput
          {...commonProps}
          type="number"
          placeholder={field.placeholder || undefined}
          inputMode="numeric"
          success={!error && !!value}
        />
      );

    case 'date':
      return (
        <DateInput
          {...commonProps}
          placeholder={field.placeholder || 'Selecciona una fecha'}
          success={!error && !!value}
        />
      );

    case 'radio':
      // Use SegmentedControl for 2-3 options, RadioGroup for 4-5, SelectInput for 6+
      const radioOptions = filteredOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
      }));

      if (radioOptions.length <= 3) {
        // 2-3 options: horizontal buttons
        return (
          <SegmentedControl
            {...commonProps}
            options={radioOptions}
            success={!error && !!value}
          />
        );
      }
      if (radioOptions.length <= 5) {
        // 4-5 options: vertical card list (like 0.5)
        return (
          <RadioGroup
            {...commonProps}
            options={radioOptions}
            success={!error && !!value}
          />
        );
      }
      // 6+ options: dropdown select
      return (
        <SelectInput
          {...commonProps}
          options={radioOptions}
          placeholder={field.placeholder || 'Selecciona una opción'}
          searchable={false}
          success={!error && !!value}
        />
      );

    case 'select':
      // Map options for select
      const selectOptions = filteredOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
        description: opt.description || undefined,
      }));

      // Check if this is a dynamic select (API-sourced options)
      const isDynamicSelect = Boolean(field.options_source || field.cascade_from);

      // For dynamic selects (API), always use dropdown
      if (isDynamicSelect) {
        return (
          <CascadingSelectField
            field={field}
            staticOptions={selectOptions}
            showError={showError}
            searchable={true}
          />
        );
      }

      // For static selects, apply visual rules based on option count
      if (selectOptions.length <= 3) {
        // 2-3 options: horizontal buttons (SegmentedControl)
        return (
          <SegmentedControl
            {...commonProps}
            options={selectOptions}
            success={!error && !!value}
          />
        );
      }
      if (selectOptions.length <= 5) {
        // 4-5 options: vertical card list (RadioGroup)
        return (
          <RadioGroup
            {...commonProps}
            options={selectOptions}
            success={!error && !!value}
          />
        );
      }
      // 6+ options: dropdown select
      return (
        <CascadingSelectField
          field={field}
          staticOptions={selectOptions}
          showError={showError}
          searchable={selectOptions.length >= 10}
        />
      );

    case 'autocomplete':
      // Use CascadingSelectField for all autocompletes (handles both regular and cascading)
      const autocompleteOptions = filteredOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
        description: opt.description || undefined,
      }));

      return (
        <CascadingSelectField
          field={field}
          staticOptions={autocompleteOptions}
          showError={showError}
          searchable={true}
        />
      );

    case 'textarea':
      return (
        <TextArea
          {...commonProps}
          placeholder={field.placeholder || undefined}
          maxLength={field.max_length || undefined}
          rows={4}
          success={!error && !!value}
        />
      );

    case 'checkbox':
      // Checkbox puede ser simple (sin opciones) o múltiple (con opciones)
      const checkboxOptions = filteredOptions.length > 0
        ? filteredOptions.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))
        : undefined;

      // Para checkbox, el value puede ser string o array
      const checkboxValue = formData[field.code]?.value;

      return (
        <CheckboxField
          id={field.code}
          label={field.label}
          value={checkboxValue as string | string[]}
          onChange={(newValue) => updateField(field.code, newValue as string | string[])}
          onFocus={handleFocus}
          onBlur={handleBlur}
          options={checkboxOptions}
          error={error}
          required={field.required}
          disabled={field.readonly}
          tooltip={tooltip}
          success={!error && (Array.isArray(checkboxValue) ? checkboxValue.length > 0 : !!checkboxValue)}
        />
      );

    case 'file':
      // FileUpload expects different value type
      const fileValue = formData[field.code]?.value;
      const files = Array.isArray(fileValue) ? fileValue : [];

      return (
        <FileUpload
          id={field.code}
          label={field.label}
          value={files as unknown as { id: string; file: File; name: string; size: number; type: string }[]}
          onChange={(newFiles) => updateField(field.code, newFiles as unknown as File[])}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accept={field.accepted_file_types || '.pdf,.jpg,.jpeg,.png'}
          maxFiles={field.max_files || 1}
          maxSize={(field.max_file_size_mb || 5) * 1024 * 1024}
          error={error}
          required={field.required}
          disabled={field.readonly}
          tooltip={tooltip}
        />
      );

    default:
      // Fallback to text input
      return (
        <TextInput
          {...commonProps}
          type="text"
          placeholder={field.placeholder || undefined}
          success={!error && !!value}
        />
      );
  }
};

export default DynamicField;
