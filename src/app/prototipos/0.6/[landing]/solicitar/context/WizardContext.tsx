'use client';

/**
 * WizardContext - Shared state for wizard form data
 * Persists form data across route-based steps
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { WizardStepId, FieldState, ValidationRule } from '../types/solicitar';
import { CascadingOption } from '../../../services/wizardApi';

// Dynamic storage key based on landing slug (100% scalable)
// Follows project convention: baldecash-{feature}-{context}
const getStorageKey = (landingSlug: string) => `baldecash-wizard-${landingSlug}-data`;

interface WizardContextValue {
  formData: Record<string, FieldState>;
  completedSteps: WizardStepId[];
  updateField: (fieldId: string, value: string | string[] | File[], label?: string) => void;
  setFieldError: (fieldId: string, error: string | null) => void;
  setFieldTouched: (fieldId: string) => void;
  validateField: (fieldId: string, value: string, rules?: ValidationRule) => string | null;
  markStepCompleted: (stepId: WizardStepId) => void;
  isStepCompleted: (stepId: WizardStepId) => boolean;
  getFieldValue: (fieldId: string) => string | string[] | File[];
  getFieldLabel: (fieldId: string) => string | undefined;
  getFieldError: (fieldId: string) => string | undefined;
  isFieldTouched: (fieldId: string) => boolean;
  resetForm: () => void;
  // Dynamic options cache for fields with validation rules per option
  setDynamicOptions: (fieldCode: string, options: CascadingOption[]) => void;
  getDynamicOptions: (fieldCode: string) => CascadingOption[];
  getAllDynamicOptions: () => Record<string, CascadingOption[]>;
  // Batch update - sets multiple fields at once WITHOUT triggering cascade-clear
  // Used by address autocomplete to set department + province + district atomically
  updateFieldBatch: (updates: Array<{ fieldId: string; value: string; label?: string }>) => void;
  // Field dependencies - scalable system for clearing dependent fields
  registerDependency: (childField: string, parentField: string) => void;
  unregisterDependency: (childField: string, parentField: string) => void;
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

interface WizardProviderProps {
  children: ReactNode;
  landingSlug: string;
}

// Helper to save to localStorage (excludes File objects)
const saveToStorage = (storageKey: string, formData: Record<string, FieldState>) => {
  if (typeof window === 'undefined') return;
  try {
    // Filter out File objects and internal state fields
    const serializableData: Record<string, FieldState> = {};
    for (const [key, value] of Object.entries(formData)) {
      if (Array.isArray(value.value) && value.value[0] instanceof File) {
        continue;
      }
      // Skip internal prefill status — must re-evaluate on each session
      if (key === '_prefill_status') continue;
      serializableData[key] = value;
    }
    localStorage.setItem(storageKey, JSON.stringify(serializableData));
  } catch {
    // Silent fail if storage is full or unavailable
  }
};

export const WizardProvider: React.FC<WizardProviderProps> = ({ children, landingSlug }) => {
  const [formData, setFormData] = useState<Record<string, FieldState>>({});
  const [completedSteps, setCompletedSteps] = useState<WizardStepId[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cache for dynamic options with validation rules (e.g., document_type options)
  // Using ref to avoid re-renders when options change (they're used only for validation lookup)
  const dynamicOptionsCache = useRef<Record<string, CascadingOption[]>>({});

  // Field dependencies map: parentField -> Set of childFields that depend on it
  // This enables automatic clearing of dependent fields when parent changes
  const fieldDependencies = useRef<Map<string, Set<string>>>(new Map());

  // Get storage key for this specific landing
  const storageKey = getStorageKey(landingSlug);

  // Load from localStorage only on client after hydration
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Remove internal state that must re-evaluate each session
        delete parsed['_prefill_status'];
        setFormData(parsed);
      }
      // Note: completedSteps is now calculated dynamically in WizardProgress
    } catch {
      // Silent fail
    }
    setIsHydrated(true);
  }, [storageKey]);

  // Persist to localStorage whenever formData changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveToStorage(storageKey, formData);
    }
  }, [formData, isHydrated, storageKey]);

  const updateField = useCallback((fieldId: string, value: string | string[] | File[], label?: string) => {
    setFormData((prev) => {
      // Check if value is being cleared
      const isEmpty = value === '' || (Array.isArray(value) && value.length === 0);

      // Check if value actually changed (to avoid clearing dependents on same-value updates)
      const prevValue = prev[fieldId]?.value;
      const valueChanged = prevValue !== value;

      // Start with updating the current field, clearing error on change
      const { error: _prevError, ...prevFieldWithoutError } = prev[fieldId] || {};
      const newData = {
        ...prev,
        [fieldId]: {
          ...prevFieldWithoutError,
          value,
          touched: true,
          // Clear label if value is empty, otherwise preserve/update existing label
          ...(isEmpty ? { label: undefined } : (label !== undefined ? { label } : {})),
        },
      };

      // If value changed and this field has dependents, clear them recursively
      if (valueChanged) {
        const clearDependents = (parentField: string, data: Record<string, FieldState>): Record<string, FieldState> => {
          const dependents = fieldDependencies.current.get(parentField);
          if (!dependents || dependents.size === 0) {
            return data;
          }

          let result = { ...data };
          for (const childField of dependents) {
            // Only clear if child has a value
            if (result[childField]?.value) {
              result[childField] = {
                ...result[childField],
                value: '',
                label: undefined,
              };
              // Recursively clear children of this child
              result = clearDependents(childField, result);
            }
          }
          return result;
        };

        return clearDependents(fieldId, newData);
      }

      return newData;
    });
  }, []);

  // Batch update: sets multiple fields atomically WITHOUT triggering cascade-clear.
  // Safe when the caller provides all dependent values together (e.g., department + province + district).
  const updateFieldBatch = useCallback((updates: Array<{ fieldId: string; value: string; label?: string }>) => {
    setFormData((prev) => {
      let newData = { ...prev };
      for (const { fieldId, value, label } of updates) {
        const { error: _prevError, ...prevFieldWithoutError } = newData[fieldId] || {};
        newData[fieldId] = {
          ...prevFieldWithoutError,
          value,
          touched: true,
          ...(label !== undefined ? { label } : {}),
        };
      }
      return newData;
    });
  }, []);

  const setFieldError = useCallback((fieldId: string, error: string | null) => {
    setFormData((prev) => {
      const currentField = prev[fieldId] || {};
      // Si el error es null o vacío, eliminar la propiedad error
      if (!error) {
        const { error: _removed, ...rest } = currentField;
        return {
          ...prev,
          [fieldId]: rest,
        };
      }
      return {
        ...prev,
        [fieldId]: {
          ...currentField,
          error,
        },
      };
    });
  }, []);

  const setFieldTouched = useCallback((fieldId: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        touched: true,
      },
    }));
  }, []);

  const validateField = useCallback(
    (fieldId: string, value: string, rules?: ValidationRule): string | null => {
      if (!rules) return null;

      if (rules.required && !value) {
        return 'Este campo es requerido';
      }

      if (rules.minLength && value.length < rules.minLength) {
        return `Mínimo ${rules.minLength} caracteres`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `Máximo ${rules.maxLength} caracteres`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return rules.patternMessage || 'Formato inválido';
      }

      if (rules.min !== undefined && Number(value) < rules.min) {
        return `El valor mínimo es ${rules.min}`;
      }

      if (rules.max !== undefined && Number(value) > rules.max) {
        return `El valor máximo es ${rules.max}`;
      }

      if (rules.customValidator) {
        return rules.customValidator(value);
      }

      return null;
    },
    []
  );

  const markStepCompleted = useCallback((stepId: WizardStepId) => {
    setCompletedSteps((prev) => {
      if (prev.includes(stepId)) return prev;
      return [...prev, stepId];
    });
  }, []);

  const isStepCompleted = useCallback(
    (stepId: WizardStepId) => {
      return completedSteps.includes(stepId);
    },
    [completedSteps]
  );

  const getFieldValue = useCallback(
    (fieldId: string) => {
      return formData[fieldId]?.value || '';
    },
    [formData]
  );

  const getFieldLabel = useCallback(
    (fieldId: string) => {
      return formData[fieldId]?.label;
    },
    [formData]
  );

  const getFieldError = useCallback(
    (fieldId: string) => {
      return formData[fieldId]?.error;
    },
    [formData]
  );

  const isFieldTouched = useCallback(
    (fieldId: string) => {
      return formData[fieldId]?.touched || false;
    },
    [formData]
  );

  const resetForm = useCallback(() => {
    setFormData({});
    setCompletedSteps([]);
    dynamicOptionsCache.current = {};
    // Clear localStorage for this landing
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Store dynamic options for a field (used for validation lookup)
  const setDynamicOptions = useCallback((fieldCode: string, options: CascadingOption[]) => {
    dynamicOptionsCache.current[fieldCode] = options;
  }, []);

  // Get dynamic options for a field
  const getDynamicOptions = useCallback((fieldCode: string): CascadingOption[] => {
    return dynamicOptionsCache.current[fieldCode] || [];
  }, []);

  // Get all dynamic options (for validation)
  const getAllDynamicOptions = useCallback((): Record<string, CascadingOption[]> => {
    return dynamicOptionsCache.current;
  }, []);

  // Register a dependency: childField depends on parentField
  // When parentField changes, childField will be automatically cleared
  const registerDependency = useCallback((childField: string, parentField: string) => {
    if (!fieldDependencies.current.has(parentField)) {
      fieldDependencies.current.set(parentField, new Set());
    }
    fieldDependencies.current.get(parentField)!.add(childField);
  }, []);

  // Unregister a dependency (useful for cleanup when component unmounts)
  const unregisterDependency = useCallback((childField: string, parentField: string) => {
    const dependents = fieldDependencies.current.get(parentField);
    if (dependents) {
      dependents.delete(childField);
      if (dependents.size === 0) {
        fieldDependencies.current.delete(parentField);
      }
    }
  }, []);

  return (
    <WizardContext.Provider
      value={{
        formData,
        completedSteps,
        updateField,
        updateFieldBatch,
        setFieldError,
        setFieldTouched,
        validateField,
        markStepCompleted,
        isStepCompleted,
        getFieldValue,
        getFieldLabel,
        getFieldError,
        isFieldTouched,
        resetForm,
        setDynamicOptions,
        getDynamicOptions,
        getAllDynamicOptions,
        registerDependency,
        unregisterDependency,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export default WizardProvider;
