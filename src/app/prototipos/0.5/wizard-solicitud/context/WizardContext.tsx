'use client';

/**
 * WizardContext - Shared state for wizard form data
 * Persists form data across route-based steps
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { WizardStepId, FieldState, ValidationRule } from '../types/wizard-solicitud';
import { STEP_ORDER } from '../data/wizardSteps';

const STORAGE_KEY = 'wizard-solicitud-data';
const STORAGE_STEPS_KEY = 'wizard-solicitud-steps';

interface WizardContextValue {
  formData: Record<string, FieldState>;
  completedSteps: WizardStepId[];
  updateField: (fieldId: string, value: string | string[] | File[]) => void;
  setFieldError: (fieldId: string, error: string) => void;
  setFieldTouched: (fieldId: string) => void;
  validateField: (fieldId: string, value: string, rules?: ValidationRule) => string | null;
  markStepCompleted: (stepId: WizardStepId) => void;
  isStepCompleted: (stepId: WizardStepId) => boolean;
  getFieldValue: (fieldId: string) => string | string[] | File[];
  getFieldError: (fieldId: string) => string | undefined;
  isFieldTouched: (fieldId: string) => boolean;
  resetForm: () => void;
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
}

// Helper to save to localStorage (excludes File objects)
const saveToStorage = (formData: Record<string, FieldState>, completedSteps: WizardStepId[]) => {
  if (typeof window === 'undefined') return;
  try {
    // Filter out File objects (can't be serialized)
    const serializableData: Record<string, FieldState> = {};
    for (const [key, value] of Object.entries(formData)) {
      if (Array.isArray(value.value) && value.value[0] instanceof File) {
        // Skip file fields
        continue;
      }
      serializableData[key] = value;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableData));
    localStorage.setItem(STORAGE_STEPS_KEY, JSON.stringify(completedSteps));
  } catch {
    // Silent fail if storage is full or unavailable
  }
};

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<Record<string, FieldState>>({});
  const [completedSteps, setCompletedSteps] = useState<WizardStepId[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage only on client after hydration
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedSteps = localStorage.getItem(STORAGE_STEPS_KEY);
      if (savedData) {
        setFormData(JSON.parse(savedData));
      }
      if (savedSteps) {
        setCompletedSteps(JSON.parse(savedSteps));
      }
    } catch {
      // Silent fail
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage whenever formData or completedSteps change (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveToStorage(formData, completedSteps);
    }
  }, [formData, completedSteps, isHydrated]);

  const updateField = useCallback((fieldId: string, value: string | string[] | File[]) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        value,
        touched: true,
      },
    }));
  }, []);

  const setFieldError = useCallback((fieldId: string, error: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        error,
      },
    }));
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
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_STEPS_KEY);
    }
  }, []);

  return (
    <WizardContext.Provider
      value={{
        formData,
        completedSteps,
        updateField,
        setFieldError,
        setFieldTouched,
        validateField,
        markStepCompleted,
        isStepCompleted,
        getFieldValue,
        getFieldError,
        isFieldTouched,
        resetForm,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export default WizardProvider;
