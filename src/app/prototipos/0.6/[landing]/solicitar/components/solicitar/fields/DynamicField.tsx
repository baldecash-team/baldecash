'use client';

/**
 * DynamicField - Renders the correct field component based on API config
 * Maps WizardField type to the appropriate UI component
 */

import React, { useMemo } from 'react';
import { WizardField, WizardFieldOption, evaluateFieldVisibility, filterFieldOptions } from '../../../../../services/wizardApi';
import { useWizard } from '../../../context/WizardContext';
import { TextInput } from './TextInput';
import { SegmentedControl } from './SegmentedControl';
import { RadioGroup } from './RadioGroup';
import { SelectInput } from './SelectInput';
import { DateInput } from './DateInput';
import { FileUpload } from './FileUpload';
import { TextArea } from './TextArea';

interface DynamicFieldProps {
  field: WizardField;
  showError?: boolean;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({ field, showError = false }) => {
  const { getFieldValue, getFieldError, updateField, formData } = useWizard();

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
    error,
    required: field.required,
    disabled: field.readonly,
    tooltip,
    helpText: undefined as string | undefined,
  };

  // Render based on field type
  switch (field.type) {
    case 'text':
    case 'document_number':
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
      const selectOptions = filteredOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
        description: opt.description || undefined,
      }));

      return (
        <SelectInput
          {...commonProps}
          options={selectOptions}
          placeholder={field.placeholder || 'Selecciona una opción'}
          searchable={false}
          success={!error && !!value}
        />
      );

    case 'autocomplete':
      const autocompleteOptions = filteredOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
        description: opt.description || undefined,
      }));

      return (
        <SelectInput
          {...commonProps}
          options={autocompleteOptions}
          placeholder={field.placeholder || 'Buscar...'}
          searchable={true}
          success={!error && !!value}
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
