/**
 * Types for Wizard - PROMPT_08
 * Estructura del Wizard de Solicitud
 */

export interface WizardConfig {
  layoutVersion: 1 | 2 | 3;
  progressVersion: 1 | 2 | 3;
  navigationVersion: 1 | 2 | 3;
  stepLayoutVersion: 1 | 2 | 3;
  motivationVersion: 1 | 2 | 3;
  celebrationVersion: 1 | 2 | 3;
  allowFreeNavigation: boolean;
  autoSave: boolean;
  showTimeEstimate: boolean;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'pattern' | 'minLength' | 'maxLength' | 'custom';
  value?: string | number | RegExp;
  message: string;
}

export interface WizardStep {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  order?: number;
  estimatedMinutes: number;
  fields: string[];
  validationRules: ValidationRule[];
  motivationalMessage?: string;
}

export interface WizardState {
  currentStep: number;
  completedSteps: number[];
  formData: Record<string, unknown>;
  startedAt?: Date;
  lastSavedAt?: Date;
  isSubmitting: boolean;
  isSaving?: boolean;
  errors: Record<string, string>;
}

export interface WizardNavigation {
  canGoBack: boolean;
  canGoForward: boolean;
  canSubmit: boolean;
  nextStep?: WizardStep;
  prevStep?: WizardStep;
}

// Props interfaces for components
export interface WizardLayoutProps {
  children: React.ReactNode;
  steps: WizardStep[];
  currentStep: number;
  showTimeEstimate?: boolean;
  estimatedMinutesRemaining?: number;
  progressComponent?: React.ReactNode;
  onStepClick?: (stepIndex: number) => void;
  onClose?: () => void;
}

export interface ProgressIndicatorProps {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  allowFreeNavigation?: boolean;
}

export interface WizardButtonsProps {
  onBack: () => void;
  onNext: () => void;
  onSave?: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isSubmitting: boolean;
  isLastStep: boolean;
  showSaveButton?: boolean;
}

export interface MotivationalMessageProps {
  currentStep: number;
  stepCode: string;
  remainingMinutes: number;
  completedSteps: number;
  totalSteps: number;
}

export interface StepLayoutProps {
  children: React.ReactNode;
  step: WizardStep;
  showDescription?: boolean;
}

export interface StepCelebrationProps {
  stepName: string;
  stepNumber: number;
  onComplete?: () => void;
}

export interface MilestoneAnimationProps {
  milestone: 25 | 50 | 75 | 100;
  onComplete?: () => void;
}

// Default config
export const defaultWizardConfig: WizardConfig = {
  layoutVersion: 1,
  progressVersion: 1,
  navigationVersion: 1,
  stepLayoutVersion: 1,
  motivationVersion: 1,
  celebrationVersion: 1,
  allowFreeNavigation: false,
  autoSave: true,
  showTimeEstimate: true,
};
