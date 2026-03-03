'use client';

/**
 * Dynamic Step Client - Unified component for all wizard steps
 * Renders any step based on URL slug from the API configuration
 * Handles both regular form steps and summary steps (is_summary_step=true)
 */

import React, { Suspense, useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { AlertCircle, Edit2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Components
import { WizardLayout } from '../components/solicitar/wizard';
import { DynamicWizardStep } from '../components/solicitar/wizard/DynamicWizardStep';
import { StepSuccessMessage } from '../components/solicitar/celebration/StepSuccessMessage';
import { SelectInput } from '../components/solicitar/fields';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';

// Context
import { useWizard } from '../context/WizardContext';
import { useWizardConfig } from '../context/WizardConfigContext';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

// Types and utils
import { WizardStepId } from '../types/solicitar';
import {
  WizardStep,
  WizardField,
  getStepSlug,
  validateStep as validateStepFields,
  evaluateFieldVisibility,
} from '../../../services/wizardApi';


// Helper function to get Lucide icon by name
function getIconComponent(iconName: string): React.ElementType {
  const iconMap: Record<string, keyof typeof LucideIcons> = {
    'user': 'User',
    'graduation-cap': 'GraduationCap',
    'wallet': 'Wallet',
    'briefcase': 'Briefcase',
    'building': 'Building',
    'book': 'Book',
    'file-text': 'FileText',
    'dollar-sign': 'DollarSign',
    'credit-card': 'CreditCard',
  };

  const lucideIconName = iconMap[iconName] || 'FileText';
  const IconComponent = LucideIcons[lucideIconName] as React.ElementType;
  return IconComponent || LucideIcons.FileText;
}


function StepContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';
  const stepSlug = params.stepSlug as string;

  // Scroll to top on page load
  useScrollToTop();

  // State
  const [showCelebration, setShowCelebration] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryFieldValues, setSummaryFieldValues] = useState<Record<string, string>>({});
  const [summaryFieldErrors, setSummaryFieldErrors] = useState<Record<string, string | null>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Get layout data from context
  const { navbarProps, footerData, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

  // Get wizard config from API
  const {
    getStepByUrlSlug,
    getNavigation,
    getUrlSlugForStep,
    steps,
    isLoading: isConfigLoading,
    error: configError
  } = useWizardConfig();

  const {
    formData,
    setFieldError,
    markStepCompleted,
    getFieldValue,
  } = useWizard();

  // Get step config from API using URL slug
  const step = getStepByUrlSlug(stepSlug);
  const navigation = step ? getNavigation(step.code) : {
    currentIndex: -1,
    prevStep: null,
    nextStep: null,
    isFirst: true,
    isLast: true
  };

  // Separate regular steps from summary steps
  const { regularSteps, summarySteps } = useMemo(() => {
    const regular = steps.filter(s => !s.is_summary_step);
    const summary = steps.filter(s => s.is_summary_step);
    return { regularSteps: regular, summarySteps: summary };
  }, [steps]);

  // Is this a summary step?
  const isSummaryStep = step?.is_summary_step || false;

  // Build form values for validation
  const formValues = useMemo(() => {
    const values: Record<string, string | string[]> = {};
    for (const [key, state] of Object.entries(formData)) {
      if (state?.value !== undefined) {
        values[key] = state.value as string | string[];
      }
    }
    return values;
  }, [formData]);

  // Load summary field values from localStorage
  useEffect(() => {
    if (!isSummaryStep) {
      setIsHydrated(true);
      return;
    }
    try {
      summarySteps.forEach(s => {
        s.fields.forEach(field => {
          const savedValue = localStorage.getItem(`baldecash-wizard-field-${field.code}`);
          if (savedValue !== null) {
            setSummaryFieldValues(prev => ({ ...prev, [field.code]: savedValue }));
          }
        });
      });
    } catch {}
    setIsHydrated(true);
  }, [isSummaryStep, summarySteps]);

  // Save summary field values to localStorage
  useEffect(() => {
    if (!isHydrated || !isSummaryStep) return;
    try {
      Object.entries(summaryFieldValues).forEach(([fieldCode, value]) => {
        localStorage.setItem(`baldecash-wizard-field-${fieldCode}`, value);
      });
    } catch {}
  }, [summaryFieldValues, isHydrated, isSummaryStep]);

  // Validate all fields in the step
  const validateStep = useCallback((): string | null => {
    if (!step) return null;
    return validateStepFields(step, formValues, setFieldError);
  }, [step, formValues, setFieldError]);

  // Helper to update summary field value
  const updateSummaryFieldValue = (fieldCode: string, value: string) => {
    setSummaryFieldValues(prev => ({ ...prev, [fieldCode]: value }));
    if (value) {
      setSummaryFieldErrors(prev => ({ ...prev, [fieldCode]: null }));
    }
  };

  // Get display value for a field in summary
  const getFieldDisplayValue = (field: WizardField, value: string | string[] | undefined): string => {
    if (value === undefined || value === null || value === '') return '-';

    if (field.type === 'file') {
      if (Array.isArray(value) && value.length > 0) {
        return value.length === 1 ? 'Archivo adjunto' : `${value.length} archivos adjuntos`;
      }
      return 'No adjunto';
    }

    if (field.type === 'date' && typeof value === 'string') {
      const parts = value.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return value;
    }

    if (field.type === 'currency' && typeof value === 'string') {
      const prefix = field.prefix || 'S/';
      return `${prefix} ${value}`;
    }

    if (field.options && field.options.length > 0) {
      const strValue = Array.isArray(value) ? value[0] : value;
      const option = field.options.find(opt => opt.value === strValue);
      if (option) return option.label;
    }

    if (field.type === 'phone' && field.prefix && typeof value === 'string') {
      return `${field.prefix} ${value}`;
    }

    return Array.isArray(value) ? value.join(', ') : value;
  };

  // Check if field should be displayed (evaluateFieldVisibility handles hidden + dependencies)
  const shouldDisplayField = (field: WizardField): boolean => {
    return evaluateFieldVisibility(field, formValues);
  };

  // Get visible fields for a step
  const getVisibleFields = (s: WizardStep): WizardField[] => {
    return s.fields.filter(field => shouldDisplayField(field));
  };

  // Navigation handlers
  const handleNext = () => {
    setSubmitted(true);
    const firstErrorField = validateStep();
    if (firstErrorField) {
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (step) {
      markStepCompleted(step.url_slug || step.code);
    }
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    if (navigation.nextStep) {
      const nextSlug = navigation.nextStep.url_slug || navigation.nextStep.code;
      router.push(`/prototipos/0.6/${landing}/solicitar/${nextSlug}`);
    } else {
      // No more steps - go to seguros
      router.push(`/prototipos/0.6/${landing}/solicitar/seguros`);
    }
  };

  const handleBack = () => {
    if (navigation.prevStep) {
      const prevSlug = navigation.prevStep.url_slug || navigation.prevStep.code;
      router.push(`/prototipos/0.6/${landing}/solicitar/${prevSlug}`);
    } else {
      // First step - go back to preview
      router.push(`/prototipos/0.6/${landing}/solicitar`);
    }
  };

  const handleStepClick = (stepId: WizardStepId) => {
    router.push(`/prototipos/0.6/${landing}/solicitar/${stepId}`);
  };

  // Summary specific handlers
  const handleSummarySubmit = async () => {
    // Validate required summary fields
    let hasErrors = false;
    let firstErrorFieldId: string | null = null;

    summarySteps.forEach(s => {
      s.fields.forEach(field => {
        if (field.required && !summaryFieldValues[field.code]) {
          setSummaryFieldErrors(prev => ({ ...prev, [field.code]: 'Este campo es requerido' }));
          hasErrors = true;
          if (!firstErrorFieldId) {
            firstErrorFieldId = field.code;
          }
        }
      });
    });

    if (hasErrors && firstErrorFieldId) {
      document.getElementById(firstErrorFieldId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push(`/prototipos/0.6/${landing}/solicitar/seguros`);
  };

  const handleSummaryBack = () => {
    if (regularSteps.length > 0) {
      const lastStep = regularSteps[regularSteps.length - 1];
      const slug = getStepSlug(lastStep);
      router.push(`/prototipos/0.6/${landing}/solicitar/${slug}`);
    } else {
      router.push(`/prototipos/0.6/${landing}/solicitar`);
    }
  };

  const navigateToStep = (stepPath: string) => {
    router.push(`/prototipos/0.6/${landing}/solicitar/${stepPath}`);
  };

  // Loading state
  if (isLayoutLoading || isConfigLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  // Error state - step not found
  if (configError || !step) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">Error al cargar el formulario</p>
          <p className="text-sm text-neutral-500 mb-4">
            No se encontro el paso: {stepSlug}
          </p>
          <button
            onClick={() => router.push(`/prototipos/0.6/${landing}/solicitar`)}
            className="text-[var(--color-primary)] underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Summary section component
  const SummarySection = ({
    icon: Icon,
    title,
    onEdit,
    children,
  }: {
    icon: React.ElementType;
    title: string;
    onEdit: () => void;
    children: React.ReactNode;
  }) => (
    <div className="bg-neutral-50 rounded-xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-neutral-800">{title}</h3>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:brightness-90 transition-colors cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          <span>Editar</span>
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );

  // Summary item component
  const SummaryItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-neutral-500 flex-shrink-0">{label}</span>
      <span className="text-neutral-800 font-medium text-right break-words min-w-0">{value || '-'}</span>
    </div>
  );

  // Render summary step content
  if (isSummaryStep) {
    const pageContent = (
      <WizardLayout
        currentStep={step.url_slug || step.code}
        title={step.title}
        description={step.description}
        onBack={handleSummaryBack}
        onSubmit={handleSummarySubmit}
        onStepClick={handleStepClick}
        isLastStep
        isSubmitting={isSubmitting}
        canProceed={true}
        navbarProps={navbarProps || undefined}
        motivational={step.motivational}
      >
        <div className="space-y-4">
          {/* Dynamic sections from regular API steps */}
          {regularSteps.map((s) => {
            const visibleFields = getVisibleFields(s);
            if (visibleFields.length === 0) return null;

            const IconComponent = getIconComponent(s.icon);
            const sSlug = getStepSlug(s);

            return (
              <SummarySection
                key={s.id}
                icon={IconComponent}
                title={s.title}
                onEdit={() => navigateToStep(sSlug)}
              >
                {visibleFields.map((field) => {
                  const value = getFieldValue(field.code);
                  const displayValue = getFieldDisplayValue(field, value as string | string[] | undefined);

                  return (
                    <SummaryItem
                      key={field.id}
                      label={field.label}
                      value={displayValue}
                    />
                  );
                })}
              </SummarySection>
            );
          })}

          {/* Dynamic summary steps section (is_summary_step=true) */}
          {summarySteps.map((s) => {
            const visibleFields = getVisibleFields(s);
            if (visibleFields.length === 0) return null;

            const IconComponent = getIconComponent(s.icon);

            return (
              <div key={s.id} className="bg-neutral-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <IconComponent className="w-5 h-5 text-[var(--color-primary)]" />
                  <h3 className="font-semibold text-neutral-800">{s.title}</h3>
                </div>
                <div className="space-y-4">
                  {visibleFields.map((field) => {
                    const options = field.options.map(opt => ({
                      value: opt.value,
                      label: opt.label,
                    }));

                    return (
                      <SelectInput
                        key={field.id}
                        id={field.code}
                        label={field.label}
                        value={summaryFieldValues[field.code] || ''}
                        onChange={(value) => updateSummaryFieldValue(field.code, value)}
                        options={options}
                        placeholder={field.placeholder || 'Selecciona una opcion'}
                        error={summaryFieldErrors[field.code] || undefined}
                        success={!!summaryFieldValues[field.code] && !summaryFieldErrors[field.code]}
                        required={field.required}
                        tooltip={field.help_text ? {
                          title: field.help_text.title || field.label,
                          description: field.help_text.description || '',
                          recommendation: field.help_text.recommendation ?? undefined,
                        } : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </WizardLayout>
    );

    return (
      <>
        {pageContent}
        <Footer data={footerData} />
      </>
    );
  }

  // Render regular form step content
  const pageContent = (
    <>
      <AnimatePresence>
        {showCelebration && (
          <StepSuccessMessage
            stepName={step.title}
            stepNumber={step.order}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>

      <WizardLayout
        currentStep={step.url_slug || step.code}
        title={step.title}
        description={step.description}
        onBack={handleBack}
        onNext={handleNext}
        onStepClick={handleStepClick}
        isFirstStep={navigation.isFirst}
        canProceed={true}
        navbarProps={navbarProps || undefined}
        motivational={step.motivational}
      >
        <DynamicWizardStep
          step={step}
          showErrors={submitted}
        />
      </WizardLayout>
    </>
  );

  return (
    <>
      {pageContent}
      <Footer data={footerData} />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export default function StepClient() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StepContent />
    </Suspense>
  );
}
