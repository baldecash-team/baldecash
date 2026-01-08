'use client';

/**
 * WizardContext - Shared state for wizard form data
 * Persists form data across route-based steps
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WizardStepId, FieldState, ValidationRule } from '../types/wizard-solicitud';
import { STEP_ORDER } from '../data/wizardSteps';

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

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<Record<string, FieldState>>({});
  const [completedSteps, setCompletedSteps] = useState<WizardStepId[]>([]);

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
