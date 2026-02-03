/**
 * Wizard Solicitar Types - v0.6
 * Route-based wizard with fixed configuration
 */

// Step identifiers for routing
export type WizardStepId = 'datos-personales' | 'datos-academicos' | 'datos-economicos' | 'resumen';

// Field types supported
export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'radio' | 'file' | 'textarea';

// Validation rules
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  min?: number;
  max?: number;
  customValidator?: (value: string) => string | null;
}

// Field configuration
export interface FieldConfig {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  validation?: ValidationRule;
  options?: { value: string; label: string }[];
  accept?: string; // For file inputs
  maxFiles?: number; // For file inputs
  rows?: number; // For textarea
}

// Step configuration
export interface WizardStep {
  id: WizardStepId;
  title: string;
  description: string;
  fields: FieldConfig[];
}

// Form field state
export interface FieldState {
  value: string | string[] | File[];
  error?: string;
  touched: boolean;
}

// Full wizard state
export interface WizardState {
  currentStep: WizardStepId;
  formData: Record<string, FieldState>;
  completedSteps: WizardStepId[];
  isSubmitting: boolean;
}

// Navigation helpers
export interface StepNavigation {
  canGoBack: boolean;
  canGoNext: boolean;
  nextStep: WizardStepId | null;
  prevStep: WizardStepId | null;
}

// Uploaded file type (for file inputs)
export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress?: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}
