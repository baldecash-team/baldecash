'use client';

/**
 * Resumen - Final Step
 * Summary and submission page - Dynamic version using API config
 * Displays all steps and their fields dynamically from the wizard config
 */

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { WizardLayout } from '../components/solicitar/wizard';
import { WizardStepId } from '../types/solicitar';
import { useWizard } from '../context/WizardContext';
import { useWizardConfig } from '../context/WizardConfigContext';
import { AlertCircle, Edit2, CreditCard } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { SelectInput } from '../components/solicitar/fields';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import {
  WizardStep,
  WizardField,
  getStepSlug,
  evaluateFieldVisibility,
} from '../../../services/wizardApi';


// Helper function to get Lucide icon by name
function getIconComponent(iconName: string): React.ElementType {
  // Map common icon names to Lucide icons
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

function ResumenContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Scroll to top on page load
  useScrollToTop();

  const { formData, getFieldValue } = useWizard();
  const { steps, isLoading: isConfigLoading, error: configError } = useWizardConfig();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryFieldValues, setSummaryFieldValues] = useState<Record<string, string>>({});
  const [summaryFieldErrors, setSummaryFieldErrors] = useState<Record<string, string | null>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Separate regular steps from summary steps
  const { regularSteps, summarySteps } = useMemo(() => {
    const regular = steps.filter(s => !s.is_summary_step);
    const summary = steps.filter(s => s.is_summary_step);
    return { regularSteps: regular, summarySteps: summary };
  }, [steps]);

  // Get layout data from context (fetched once at [landing] level)
  const { navbarProps, footerData, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

  // Build form values for field visibility evaluation
  const formValues = useMemo(() => {
    const values: Record<string, string | string[]> = {};
    for (const [key, state] of Object.entries(formData)) {
      if (state?.value !== undefined) {
        values[key] = state.value as string | string[];
      }
    }
    return values;
  }, [formData]);

  // Cargar valores de summary fields desde localStorage al montar
  useEffect(() => {
    try {
      // Load all summary step fields from localStorage
      summarySteps.forEach(step => {
        step.fields.forEach(field => {
          const savedValue = localStorage.getItem(`wizard_${field.code}`);
          if (savedValue !== null) {
            setSummaryFieldValues(prev => ({ ...prev, [field.code]: savedValue }));
          }
        });
      });
    } catch {}
    setIsHydrated(true);
  }, [summarySteps]);

  // Guardar summary field values en localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      Object.entries(summaryFieldValues).forEach(([fieldCode, value]) => {
        localStorage.setItem(`wizard_${fieldCode}`, value);
      });
    } catch {}
  }, [summaryFieldValues, isHydrated]);

  // Helper to update a summary field value
  const updateSummaryFieldValue = (fieldCode: string, value: string) => {
    setSummaryFieldValues(prev => ({ ...prev, [fieldCode]: value }));
    // Clear error when value is set
    if (value) {
      setSummaryFieldErrors(prev => ({ ...prev, [fieldCode]: null }));
    }
  };

  const handleBack = () => {
    // Navigate to the last regular step from API (not summary steps)
    // Use dynamic url_slug from API (100% from BD)
    if (regularSteps.length > 0) {
      const lastStep = regularSteps[regularSteps.length - 1];
      const slug = getStepSlug(lastStep);
      router.push(`/prototipos/0.6/${landing}/solicitar/${slug}`);
    } else {
      router.push(`/prototipos/0.6/${landing}/solicitar/datos-economicos`);
    }
  };

  const handleSubmit = async () => {
    // Validate required summary fields
    let hasErrors = false;
    let firstErrorFieldId: string | null = null;

    summarySteps.forEach(step => {
      step.fields.forEach(field => {
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

  const navigateToStep = (stepPath: string) => {
    router.push(`/prototipos/0.6/${landing}/solicitar/${stepPath}`);
  };

  const handleStepClick = (stepId: WizardStepId) => {
    navigateToStep(stepId);
  };

  /**
   * Get the display value for a field
   * Uses options from API to show labels instead of values
   */
  const getFieldDisplayValue = (field: WizardField, value: string | string[] | undefined): string => {
    if (value === undefined || value === null || value === '') {
      return '-';
    }

    // Handle file fields
    if (field.type === 'file') {
      if (Array.isArray(value) && value.length > 0) {
        return value.length === 1 ? 'Archivo adjunto' : `${value.length} archivos adjuntos`;
      }
      return 'No adjunto';
    }

    // Handle date fields - format DD/MM/YYYY
    if (field.type === 'date' && typeof value === 'string') {
      const parts = value.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return value;
    }

    // Handle currency fields
    if (field.type === 'currency' && typeof value === 'string') {
      const prefix = field.prefix || 'S/';
      return `${prefix} ${value}`;
    }

    // Handle fields with options (radio, select, autocomplete)
    if (field.options && field.options.length > 0) {
      const strValue = Array.isArray(value) ? value[0] : value;
      const option = field.options.find(opt => opt.value === strValue);
      if (option) {
        return option.label;
      }
    }

    // Handle phone with prefix
    if (field.type === 'phone' && field.prefix && typeof value === 'string') {
      return `${field.prefix} ${value}`;
    }

    // Default: return as-is
    return Array.isArray(value) ? value.join(', ') : value;
  };

  /**
   * Check if a field should be displayed in the summary
   * Excludes hidden fields and those that failed visibility conditions
   */
  const shouldDisplayField = (field: WizardField): boolean => {
    // Always hide fields marked as hidden
    if (field.hidden) return false;

    // Check visibility conditions
    return evaluateFieldVisibility(field, formValues);
  };

  /**
   * Get visible fields for a step
   */
  const getVisibleFields = (step: WizardStep): WizardField[] => {
    return step.fields.filter(field => shouldDisplayField(field));
  };

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
          <Icon className="w-5 h-5 text-[#4654CD]" />
          <h3 className="font-semibold text-neutral-800">{title}</h3>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-sm text-[#4654CD] hover:text-[#3a47b3] transition-colors cursor-pointer"
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

  // Loading state
  if (isLayoutLoading || isConfigLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  // Error state
  if (configError) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">Error al cargar el formulario</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[#4654CD] underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Get motivational content from summary step (if available)
  const summaryMotivational = summarySteps.length > 0 ? summarySteps[0].motivational : null;

  const pageContent = (
    <WizardLayout
      currentStep="resumen"
      title="Resumen"
      description="Revisa tu información antes de enviar"
      onBack={handleBack}
      onSubmit={handleSubmit}
      onStepClick={handleStepClick}
      isLastStep
      isSubmitting={isSubmitting}
      canProceed={true}
      navbarProps={navbarProps || undefined}
      motivational={summaryMotivational}
    >
      <div className="space-y-4">
        {/* Dynamic sections from regular API steps (not summary steps) */}
        {regularSteps.map((step) => {
          const visibleFields = getVisibleFields(step);
          if (visibleFields.length === 0) return null;

          const IconComponent = getIconComponent(step.icon);
          const stepSlug = getStepSlug(step);

          return (
            <SummarySection
              key={step.id}
              icon={IconComponent}
              title={step.title}
              onEdit={() => navigateToStep(stepSlug)}
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
        {summarySteps.map((step) => {
          const visibleFields = getVisibleFields(step);
          if (visibleFields.length === 0) return null;

          const IconComponent = getIconComponent(step.icon);

          return (
            <div key={step.id} className="bg-neutral-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <IconComponent className="w-5 h-5 text-[#4654CD]" />
                <h3 className="font-semibold text-neutral-800">{step.title}</h3>
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
                      placeholder={field.placeholder || 'Selecciona una opción'}
                      error={summaryFieldErrors[field.code] || undefined}
                      success={!!summaryFieldValues[field.code] && !summaryFieldErrors[field.code]}
                      required={field.required}
                      tooltip={field.help_text ? {
                        title: field.label,
                        description: field.help_text,
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

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export default function ResumenPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResumenContent />
    </Suspense>
  );
}
