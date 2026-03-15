'use client';

/**
 * CascadingSelectField - Select field with dynamic options support
 *
 * Handles four types of select fields:
 * 1. Static options: Uses staticOptions from FormFieldOption/options_static
 *    → If staticOptions has items, always use them (priority over API)
 * 2. Lazy search: Has min_search_length > 0 (large datasets like study-centers, careers)
 *    → Shows "write at least X chars" message, searches API on user input
 * 3. Root-level dynamic: Has options_source, no cascade_from, AND staticOptions is empty
 *    → Loads options on mount from API (e.g., department)
 * 4. Cascading: Has cascade_from + cascade_param + options_source
 *    → Loads options when parent field value changes (e.g., province, district)
 *
 * Priority logic:
 * - staticOptions (from FormFieldOption) > options_source (API)
 * - This ensures fields with predefined options use those even if options_source is defined
 *
 * Examples:
 * - department: staticOptions=[], options_source="geo-units/departments" → loads from API
 * - institution: min_search_length=3, options_source="study-centers" → lazy search
 * - career: min_search_length=3, options_source="careers" → lazy search
 * - province: cascade_from="department" → loads when department is selected
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WizardField, fetchCascadingOptions, fetchOptionsFromSource, fetchOptionsWithSearch, fetchOptionById, CascadingOption } from '../../../../../services/wizardApi';
import { useWizard } from '../../../context/WizardContext';
import { SelectInput } from './SelectInput';

interface CascadingSelectFieldProps {
  field: WizardField;
  /** Filtered static options from API config */
  staticOptions: Array<{ value: string; label: string; description?: string }>;
  showError?: boolean;
  /** Whether to enable search in dropdown */
  searchable?: boolean;
}

export const CascadingSelectField: React.FC<CascadingSelectFieldProps> = ({
  field,
  staticOptions,
  showError = false,
  searchable = false,
}) => {
  const { getFieldValue, getFieldLabel, getFieldError, updateField, setDynamicOptions, registerDependency, unregisterDependency } = useWizard();

  // Current field value, saved label, and error
  const value = getFieldValue(field.code) as string;
  const savedLabel = getFieldLabel(field.code);
  const error = showError ? getFieldError(field.code) : undefined;

  // Cascading state (local options loaded from API)
  const [localDynamicOptions, setLocalDynamicOptions] = useState<CascadingOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const prevParentValue = useRef<string | undefined>(undefined);
  const initialLoadDone = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check field type:
  // - isLazySearch: has min_search_length > 0 (large datasets requiring lazy loading)
  // - isCascading: has cascade_from (depends on parent field)
  // - hasOptionsSource: has options_source but no cascade (root-level dynamic options)
  //   BUT only if staticOptions is empty AND not lazy search
  const minSearchLength = field.min_search_length || 0;
  const isLazySearch = minSearchLength > 0 && staticOptions.length === 0;
  const isCascading = Boolean(field.cascade_from && field.cascade_param && field.options_source);
  const hasOptionsSource = Boolean(
    field.options_source && !field.cascade_from && staticOptions.length === 0 && !isLazySearch
  );

  // Get parent field value (only for cascading fields)
  const parentValue = isCascading ? (getFieldValue(field.cascade_from!) as string) : undefined;

  // Get filter field code for options_filter dependency
  const filterFieldCode = field.options_filter?.depends_on;

  // Register field dependencies on mount, unregister on unmount
  // This enables automatic clearing when parent fields change
  useEffect(() => {
    // Register dependency for cascade_from
    if (field.cascade_from) {
      registerDependency(field.code, field.cascade_from);
    }
    // Register dependency for options_filter.depends_on
    if (filterFieldCode) {
      registerDependency(field.code, filterFieldCode);
    }
    // Register dependency for validation_source_field
    if (field.validation_source_field) {
      registerDependency(field.code, field.validation_source_field);
    }

    // Cleanup on unmount
    return () => {
      if (field.cascade_from) {
        unregisterDependency(field.code, field.cascade_from);
      }
      if (filterFieldCode) {
        unregisterDependency(field.code, filterFieldCode);
      }
      if (field.validation_source_field) {
        unregisterDependency(field.code, field.validation_source_field);
      }
    };
  }, [field.code, field.cascade_from, filterFieldCode, field.validation_source_field, registerDependency, unregisterDependency]);

  // Load initial options for root-level fields with options_source (e.g., department)
  useEffect(() => {
    if (!hasOptionsSource || initialLoadDone.current) {
      return;
    }

    const loadInitialOptions = async () => {
      setIsLoading(true);
      try {
        const options = await fetchOptionsFromSource(field.options_source!);
        setLocalDynamicOptions(options);
        // Store in WizardContext for validation rules lookup
        setDynamicOptions(field.code, options);
        initialLoadDone.current = true;
      } catch (error) {
        console.error('Error loading initial options:', error);
        setLocalDynamicOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialOptions();
  }, [hasOptionsSource, field.options_source, field.code, setDynamicOptions]);

  // Handle parent value changes for cascading fields - fetch new options
  useEffect(() => {
    if (!isCascading) {
      return;
    }

    // Check if parent value actually changed
    const parentChanged = prevParentValue.current !== parentValue;

    // If parent changed and we had a previous parent, clear this field's value
    if (parentChanged && prevParentValue.current !== undefined && prevParentValue.current !== '') {
      updateField(field.code, '');
    }

    prevParentValue.current = parentValue;

    // If no parent value, clear options
    if (!parentValue) {
      setLocalDynamicOptions([]);
      return;
    }

    // Fetch new options
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const options = await fetchCascadingOptions(
          field.options_source!,
          field.cascade_param!,
          parentValue
        );
        setLocalDynamicOptions(options);
      } catch (error) {
        console.error('Error loading cascading options:', error);
        setLocalDynamicOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [isCascading, parentValue, field.options_source, field.cascade_param, field.code, updateField]);

  // Auto-repair missing labels: when options load and we have a value without a saved label,
  // find the matching option and save its label (handles legacy data migration)
  useEffect(() => {
    // Only repair if we have options, a value, but no saved label
    if (localDynamicOptions.length === 0 || !value || savedLabel) {
      return;
    }

    // Find the option matching our current value
    const matchingOption = localDynamicOptions.find((opt) => String(opt.value) === value);
    if (matchingOption) {
      // Save the label to repair legacy data
      updateField(field.code, value, matchingOption.label);
    }
  }, [localDynamicOptions, value, savedLabel, field.code, updateField]);

  // Ref to track if we already attempted label repair for lazy search fields
  const labelRepairAttempted = useRef(false);

  // Auto-repair for lazy search fields: fetch label by ID when we have a value but no label
  // This handles legacy data that was saved before we started storing labels
  useEffect(() => {
    // Only for lazy search fields with a value but no saved label
    if (!isLazySearch || !field.options_source || !value || savedLabel || labelRepairAttempted.current) {
      return;
    }

    // Mark that we attempted repair to avoid multiple API calls
    labelRepairAttempted.current = true;

    const repairLabel = async () => {
      try {
        const option = await fetchOptionById(field.options_source!, value);
        if (option) {
          updateField(field.code, value, option.label);
        }
      } catch (error) {
        console.error('Error repairing label for lazy search field:', error);
      }
    };

    repairLabel();
  }, [isLazySearch, field.options_source, value, savedLabel, field.code, updateField]);

  // Get filter value for lazy search (used to filter API results)
  // Note: Clearing of this field when filter changes is handled by WizardContext.updateField
  // via the registered dependency (registerDependency above)
  const filterValue = filterFieldCode ? (getFieldValue(filterFieldCode) as string) : undefined;

  // Handle lazy search (debounced)
  const handleSearch = useCallback((searchTerm: string) => {
    if (!isLazySearch || !field.options_source) return;

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if less than min characters
    if (searchTerm.length < minSearchLength) {
      setLocalDynamicOptions([]);
      return;
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const options = await fetchOptionsWithSearch(
          field.options_source!,
          searchTerm,
          filterValue // Use filterValue from outer scope (institution_type value)
        );
        setLocalDynamicOptions(options);
      } catch (error) {
        console.error('Error searching options:', error);
        setLocalDynamicOptions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [isLazySearch, field.options_source, minSearchLength, filterValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Build tooltip from help_text
  const tooltip = field.help_text
    ? {
        title: field.help_text.title || field.label,
        description: field.help_text.description || '',
        recommendation: field.help_text.recommendation ?? undefined,
      }
    : undefined;

  // Determine options to use:
  // - isLazySearch, isCascading or hasOptionsSource: use localDynamicOptions from API
  // - otherwise: use staticOptions passed from DynamicField
  const options = (isLazySearch || isCascading || hasOptionsSource)
    ? localDynamicOptions.map((opt) => ({
        value: String(opt.value),
        label: opt.label,
        description: undefined,
      }))
    : staticOptions;

  // Determine placeholder
  const getPlaceholder = (): string => {
    // For cascading fields without parent value selected
    if (isCascading && !parentValue) {
      const parentLabels: Record<string, string> = {
        department: 'departamento',
        province: 'provincia',
      };
      const parentLabel = parentLabels[field.cascade_from!] || field.cascade_from;
      return `Primero selecciona ${parentLabel}`;
    }

    // For any field loading options
    if (isLoading) {
      return 'Cargando...';
    }

    // For lazy search fields
    if (isLazySearch) {
      return field.placeholder || 'Escribe para buscar...';
    }

    return field.placeholder || 'Selecciona una opción';
  };

  // Determine if disabled:
  // - readonly from field config
  // - cascading field without parent value
  // - field with options_source still loading initial options
  const isDisabled = field.readonly || (isCascading && !parentValue) || (hasOptionsSource && isLoading && localDynamicOptions.length === 0);

  return (
    <SelectInput
      id={field.code}
      label={field.label}
      value={value}
      onChange={(newValue: string, selectedLabel?: string) => updateField(field.code, newValue, selectedLabel)}
      options={options}
      placeholder={getPlaceholder()}
      error={error}
      success={!error && !!value}
      required={field.required}
      disabled={isDisabled}
      searchable={searchable}
      tooltip={tooltip}
      // Lazy search props
      onSearch={isLazySearch ? handleSearch : undefined}
      isSearching={isSearching}
      minSearchLength={isLazySearch ? minSearchLength : 0}
      searchPrompt={isLazySearch ? `Escribe al menos ${minSearchLength} letras para buscar` : undefined}
      // Saved label for lazy-loaded fields (persisted across refresh)
      savedLabel={savedLabel}
    />
  );
};

export default CascadingSelectField;
