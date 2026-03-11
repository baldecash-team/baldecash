'use client';

/**
 * useCascadingOptions - Hook for cascading select fields
 *
 * Handles:
 * - Fetching options when parent field value changes
 * - Clearing child value when parent changes
 * - Loading state management
 */

import { useState, useEffect, useRef } from 'react';
import { fetchCascadingOptions, CascadingOption } from '../../../services/wizardApi';

interface UseCascadingOptionsParams {
  /** Code of the parent field to watch */
  cascadeFrom: string | null | undefined;
  /** Query param name for API (e.g., "parent_id") */
  cascadeParam: string | null | undefined;
  /** API endpoint path (e.g., "geo-units/provinces") */
  optionsSource: string | null | undefined;
  /** Current value of the parent field */
  parentValue: string | undefined;
  /** Static options from API config (used when no cascading) */
  staticOptions: CascadingOption[];
  /** Callback to clear this field's value */
  onClear: () => void;
}

interface UseCascadingOptionsResult {
  /** Options to display (either static or dynamically loaded) */
  options: CascadingOption[];
  /** Whether options are currently loading */
  isLoading: boolean;
  /** Whether the field should be disabled (no parent selected) */
  isDisabled: boolean;
  /** Placeholder text (changes when parent not selected) */
  placeholder: string;
}

export function useCascadingOptions({
  cascadeFrom,
  cascadeParam,
  optionsSource,
  parentValue,
  staticOptions,
  onClear,
}: UseCascadingOptionsParams): UseCascadingOptionsResult {
  const [options, setOptions] = useState<CascadingOption[]>(staticOptions);
  const [isLoading, setIsLoading] = useState(false);
  const prevParentValue = useRef<string | undefined>(undefined);

  // Check if this is a cascading field
  const isCascading = Boolean(cascadeFrom && cascadeParam && optionsSource);

  useEffect(() => {
    // Skip if not a cascading field - use static options
    if (!isCascading) {
      setOptions(staticOptions);
      return;
    }

    // Detect parent value change
    const parentChanged = prevParentValue.current !== parentValue;
    prevParentValue.current = parentValue;

    // If parent changed and we had a previous value, clear child
    if (parentChanged && prevParentValue.current !== undefined) {
      onClear();
    }

    // If no parent value, clear options and disable
    if (!parentValue) {
      setOptions([]);
      return;
    }

    // Fetch new options based on parent value
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const newOptions = await fetchCascadingOptions(
          optionsSource!,
          cascadeParam!,
          parentValue
        );
        setOptions(newOptions);
      } catch (error) {
        console.error('Error loading cascading options:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [isCascading, cascadeFrom, cascadeParam, optionsSource, parentValue, staticOptions, onClear]);

  // Determine placeholder based on state
  const getPlaceholder = (): string => {
    if (!isCascading) {
      return 'Selecciona una opción';
    }
    if (!parentValue) {
      // Friendly message based on cascade_from
      const parentLabels: Record<string, string> = {
        department: 'departamento',
        province: 'provincia',
      };
      const parentLabel = parentLabels[cascadeFrom!] || cascadeFrom;
      return `Primero selecciona ${parentLabel}`;
    }
    if (isLoading) {
      return 'Cargando...';
    }
    return 'Selecciona una opción';
  };

  return {
    options,
    isLoading,
    isDisabled: isCascading && !parentValue,
    placeholder: getPlaceholder(),
  };
}

export default useCascadingOptions;
