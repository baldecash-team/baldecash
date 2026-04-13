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
import { GamerStepSuccess } from '../components/solicitar/celebration/GamerStepSuccess';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { ConvenioFooter } from '@/app/prototipos/0.6/components/hero/convenio';
import { GamerNavbar } from '@/app/prototipos/0.6/components/zona-gamer/GamerNavbar';
import { GamerFooter } from '@/app/prototipos/0.6/components/zona-gamer/GamerFooter';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';

// Context
import { useWizard, FILE_PENDING_REUPLOAD } from '../context/WizardContext';
import { useWizardConfig } from '../context/WizardConfigContext';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { useProduct } from '../context/ProductContext';

// Hooks
import { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useSubmitApplication } from '../hooks/useSubmitApplication';
import { SubmitOverlay } from '../components/solicitar/submit/SubmitOverlay';
import { useToast } from '@/app/prototipos/_shared';

// Types and utils
import { WizardStepId } from '../types/solicitar';
import {
  WizardStep,
  WizardField,
  WizardMotivational,
  getStepSlug,
  validateStep as validateStepFields,
  evaluateFieldVisibility,
} from '../../../services/wizardApi';

// Event tracking
import { useEventTrackerOptional } from '../context/EventTrackerContext';

// Route builder
import { routes } from '@/app/prototipos/0.6/utils/routes';


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
  const [isHydrated, setIsHydrated] = useState(false);
  const [summaryFieldValues, setSummaryFieldValues] = useState<Record<string, string>>({});

  // Get layout data from context
  const { navbarProps, footerData, agreementData, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

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
    getFieldLabel,
    getAllDynamicOptions,
  } = useWizard();

  // Event tracker
  const tracker = useEventTrackerOptional();

  // Preview mode
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  // Get solicitar flow configuration (to check if there are sections after wizard)
  const { shouldShowComplementos, isCouponRequired, isLoading: isFlowConfigLoading } = useSolicitarFlow({ slug: landing, previewKey });

  // Get applied coupon and term validation from product context
  const { appliedCoupon, hasUnifiedTerms, cartProducts, isOverQuotaLimit, unavailableProductIds, isValidatingAvailability } = useProduct();

  // Redirect to /solicitar if coupon is required but not applied
  useEffect(() => {
    if (!isFlowConfigLoading && isCouponRequired && !appliedCoupon) {
      router.push(routes.solicitar(landing));
    }
  }, [isFlowConfigLoading, isCouponRequired, appliedCoupon, landing, router]);

  // Redirect to /solicitar if terms are not unified (multiple products with different terms)
  useEffect(() => {
    if (cartProducts.length > 1 && !hasUnifiedTerms()) {
      router.push(routes.solicitar(landing));
    }
  }, [cartProducts.length, hasUnifiedTerms, landing, router]);

  // Redirect to /solicitar if monthly quota is exceeded
  useEffect(() => {
    if (isOverQuotaLimit) {
      router.push(routes.solicitar(landing));
    }
  }, [isOverQuotaLimit, landing, router]);

  // Redirect to /solicitar if there are unavailable products
  useEffect(() => {
    if (unavailableProductIds.length > 0) {
      router.push(routes.solicitar(landing));
    }
  }, [unavailableProductIds, landing, router]);

  // Toast notifications for submit
  const { showToast } = useToast(4000);

  // Submit application hook (used when insurance is disabled)
  const { submit: submitApplication, isSubmitting: isAppSubmitting, submitMessage, submitStage } = useSubmitApplication({
    onToast: showToast,
  });

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
        // Treat file reupload marker as empty (file was lost on refresh)
        if (state.value === FILE_PENDING_REUPLOAD) {
          values[key] = '';
          continue;
        }
        values[key] = state.value as string | string[];
      }
    }
    return values;
  }, [formData]);

  // Override motivational when check-person finds data (personalized greeting)
  const stepMotivational = useMemo((): WizardMotivational | null => {
    if (!step) return null;
    const prefillStatus = formData['_prefill_status_document_number']?.value as string | undefined;
    if (prefillStatus !== 'found') return step.motivational;

    const hasMainDocumentNumber = step.fields.some(f => f.type === 'document_number' && f.code === 'document_number');
    if (!hasMainDocumentNumber) return step.motivational;

    const firstName = (formData['first_name']?.value as string) || '';
    if (!firstName) return step.motivational;

    const name = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    return {
      title: `Hola <span class="highlight">${name}</span>, qué bueno verte por aquí`,
      highlight: step.motivational?.highlight || '',
      title_end: step.motivational?.title_end || '',
      subtitle: 'Ya casi terminamos este paso, sigue adelante.',
      illustration: step.motivational?.illustration || '',
    };
  }, [step, formData]);

  // Track form_abandon on beforeunload (when user closes/reloads mid-form)
  useEffect(() => {
    if (!step || !tracker) return;

    const startTime = Date.now();

    const handleBeforeUnload = () => {
      const visibleFields = step.fields.filter(f => evaluateFieldVisibility(f, formValues));
      const filledCount = visibleFields.filter(f => {
        const val = formData[f.code]?.value;
        return Array.isArray(val) ? val.length > 0 : !!val;
      }).length;

      tracker.track('form_abandon', {
        form_id: 'onboarding-solicitud',
        last_active_step: step.order + 1,
        fields_completed: filledCount,
        total_fields: visibleFields.length,
        time_in_form_ms: Date.now() - startTime,
      });
      tracker.flush();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step, tracker, formValues, formData]);

  // Load summary field values from localStorage
  useEffect(() => {
    if (!isSummaryStep) {
      setIsHydrated(true);
      return;
    }
    try {
      summarySteps.forEach(s => {
        s.fields.forEach(field => {
          const savedValue = localStorage.getItem(`baldecash-${landing}-wizard-field-${field.code}`);
          if (savedValue !== null) {
            setSummaryFieldValues(prev => ({ ...prev, [field.code]: savedValue }));
          }
        });
      });
    } catch {}
    setIsHydrated(true);
  }, [isSummaryStep, summarySteps, landing]);

  // Save summary field values to localStorage
  useEffect(() => {
    if (!isHydrated || !isSummaryStep) return;
    try {
      Object.entries(summaryFieldValues).forEach(([fieldCode, value]) => {
        localStorage.setItem(`baldecash-${landing}-wizard-field-${fieldCode}`, value);
      });
    } catch {}
  }, [summaryFieldValues, isHydrated, isSummaryStep, landing]);

  // Validate all fields in the step
  const validateStep = useCallback((): string | null => {
    if (!step) return null;
    return validateStepFields(step, formValues, setFieldError, getAllDynamicOptions());
  }, [step, formValues, setFieldError, getAllDynamicOptions]);

  // Get display value for a field in summary
  const getFieldDisplayValue = (field: WizardField, value: string | string[] | undefined, savedLabel?: string): string => {
    if (value === undefined || value === null || value === '') return '-';

    if (field.type === 'file') {
      if (Array.isArray(value) && value.length > 0) {
        return value.length === 1 ? 'Archivo adjunto' : `${value.length} archivos adjuntos`;
      }
      return 'No adjunto';
    }

    // Checkbox fields: show "Sí" or "No"
    if (field.type === 'checkbox') {
      if (typeof value === 'string') {
        return value === 'true' ? 'Sí' : 'No';
      }
      // Multiple checkbox: show selected labels or count
      if (Array.isArray(value) && value.length > 0) {
        if (field.options && field.options.length > 0) {
          const labels = value.map(v => {
            const opt = field.options.find(o => o.value === v);
            return opt ? opt.label : v;
          });
          return labels.join(', ');
        }
        return value.join(', ');
      }
      return 'No';
    }

    if (field.type === 'date' && typeof value === 'string') {
      // Parse date safely to avoid timezone issues
      try {
        const date = new Date(value + 'T12:00:00');
        return date.toLocaleDateString('es-PE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        const parts = value.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return value;
      }
    }

    if (field.type === 'currency' && typeof value === 'string') {
      const prefix = field.prefix || 'S/';
      const num = parseFloat(value);
      const formatted = !isNaN(num)
        ? num.toLocaleString('es-PE', { minimumFractionDigits: 2 })
        : value;
      return field.suffix ? `${prefix} ${formatted} ${field.suffix}` : `${prefix} ${formatted}`;
    }

    // Check static options first
    if (field.options && field.options.length > 0) {
      const strValue = Array.isArray(value) ? value[0] : value;
      const option = field.options.find(opt => opt.value === strValue);
      if (option) return option.label;
    }

    // Use saved label for dynamic fields (cascading selects, lazy search)
    if (savedLabel) {
      return savedLabel;
    }

    if (field.type === 'phone' && field.prefix && typeof value === 'string') {
      return `${field.prefix} ${value}`;
    }

    // Generic prefix/suffix for other types (number, etc.)
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    if (displayValue && (field.prefix || field.suffix)) {
      const parts: string[] = [];
      if (field.prefix) parts.push(field.prefix);
      parts.push(String(displayValue));
      if (field.suffix) parts.push(field.suffix);
      return parts.join(' ');
    }

    return displayValue;
  };

  // Identify prefill target fields (e.g., supporter_full_name is a prefill target of supporter_document_number)
  // These are hidden fields auto-filled by check-person API and should never appear in the summary
  const prefillTargetFields = useMemo(() => {
    const targets = new Set<string>();
    for (const s of regularSteps) {
      for (const f of s.fields) {
        if (f.type === 'document_number' && f.prefill_config?.prefill_fields) {
          for (const code of Object.keys(f.prefill_config.prefill_fields)) {
            targets.add(code);
          }
        }
      }
    }
    return targets;
  }, [regularSteps]);

  // Check if field should be displayed in summary
  const shouldDisplayField = (field: WizardField): boolean => {
    // Prefill target fields (like supporter_full_name) are internal — never show in summary
    if (field.hidden && prefillTargetFields.has(field.code)) return false;
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
      router.push(routes.solicitarStep(landing, nextSlug));
    } else if (shouldShowComplementos) {
      // No more wizard steps - go to complementos (dynamic sections after wizard)
      router.push(routes.solicitarComplementos(landing));
    } else {
      // No more steps and no complementos - submit directly
      submitApplication({ insuranceId: null });
    }
  };

  const handleBack = () => {
    if (navigation.prevStep) {
      const prevSlug = navigation.prevStep.url_slug || navigation.prevStep.code;
      router.push(routes.solicitarStep(landing, prevSlug));
    } else {
      // First step - go back to preview
      router.push(routes.solicitar(landing));
    }
  };

  const handleStepClick = (stepId: WizardStepId) => {
    router.push(routes.solicitarStep(landing, stepId));
  };

  // Validate all regular steps (cross-step validation before submit)
  const validateAllSteps = useCallback((): { stepTitle: string; stepSlug: string } | null => {
    for (const s of regularSteps) {
      const firstError = validateStepFields(s, formValues, setFieldError, getAllDynamicOptions());
      if (firstError) {
        return {
          stepTitle: s.title || s.name,
          stepSlug: getStepSlug(s),
        };
      }
    }
    return null;
  }, [regularSteps, formValues, setFieldError, getAllDynamicOptions]);

  // Summary specific handlers
  const handleSummarySubmit = async () => {
    // Wait for flow config to be ready
    if (isFlowConfigLoading) return;

    // Validar campos del paso de resumen usando la misma lógica que pasos regulares
    setSubmitted(true);
    const firstErrorField = validateStep();
    if (firstErrorField) {
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Validate ALL regular steps before submitting
    const invalidStep = validateAllSteps();
    if (invalidStep) {
      showToast(
        `Hay campos incompletos en "${invalidStep.stepTitle}". Por favor, revísalos.`,
        'warning'
      );
      // Navigate to the step with errors after a short delay so user can read the toast
      setTimeout(() => {
        navigateToStep(invalidStep.stepSlug);
      }, 1500);
      return;
    }

    // Mark step as completed
    if (step) {
      markStepCompleted(step.url_slug || step.code);
    }

    // Check if there are sections after wizard (complementos page)
    if (shouldShowComplementos) {
      // Navigate to complementos page for insurance/accessories sections
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push(routes.solicitarComplementos(landing));
    } else {
      // No sections after wizard - submit application directly
      await submitApplication({ insuranceId: null });
      // The hook handles navigation to confirmation page on success
    }
  };

  const handleSummaryBack = () => {
    // Usar navigation.prevStep para navegación dinámica
    if (navigation.prevStep) {
      const prevSlug = navigation.prevStep.url_slug || navigation.prevStep.code;
      router.push(routes.solicitarStep(landing, prevSlug));
    } else {
      router.push(routes.solicitar(landing));
    }
  };

  // Handler para pasos de resumen que NO son el último (continúan a otro paso)
  const handleSummaryNext = () => {
    // Validar campos del paso de resumen usando la misma lógica que pasos regulares
    setSubmitted(true);
    const firstErrorField = validateStep();
    if (firstErrorField) {
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Mark step as completed
    if (step) {
      markStepCompleted(step.url_slug || step.code);
    }

    // Navegar al siguiente paso
    if (navigation.nextStep) {
      const nextSlug = navigation.nextStep.url_slug || navigation.nextStep.code;
      router.push(routes.solicitarStep(landing, nextSlug));
    }
  };

  const navigateToStep = (stepPath: string) => {
    router.push(routes.solicitarStep(landing, stepPath));
  };

  // Loading state (include flow config loading and availability check)
  if (isLayoutLoading || isConfigLoading || isFlowConfigLoading || isValidatingAvailability) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
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
            onClick={() => router.push(routes.solicitar(landing))}
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
  const SummaryItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-neutral-500 flex-shrink-0">{label}</span>
      <span className="text-neutral-800 font-medium text-right break-words min-w-0">{value || '-'}</span>
    </div>
  );

  // Render summary step content
  if (isSummaryStep) {
    // Determinar dinámicamente si es el último paso del wizard
    // Solo mostrar "Enviar Solicitud" si no hay más pasos Y no hay complementos
    const isActuallyLastStep = navigation.isLast && !shouldShowComplementos;

    // Determinar el handler correcto para el botón:
    // - Si NO es el último paso real: onNext maneja "Continuar"
    // - Si ES el último paso real: onSubmit maneja "Enviar Solicitud"
    // Nota: handleSummarySubmit ya sabe navegar a complementos si existen
    const nextHandler = !isActuallyLastStep
      ? (navigation.isLast ? handleSummarySubmit : handleSummaryNext)
      : undefined;

    const pageContent = (
      <WizardLayout
        currentStep={step.url_slug || step.code}
        title={step.title}
        description={step.description}
        onBack={handleSummaryBack}
        onNext={nextHandler}
        onSubmit={isActuallyLastStep ? handleSummarySubmit : undefined}
        onStepClick={handleStepClick}
        isLastStep={isActuallyLastStep}
        isSubmitting={isSubmitting || isAppSubmitting}
        submitMessage={submitMessage}
        canProceed={true}
        hideNavbar={landing === 'zona-gamer'}
        navbarProps={landing === 'zona-gamer' ? undefined : (navbarProps || undefined)}
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
                  const savedLabel = getFieldLabel(field.code);

                  // File fields: show filename with link to view
                  if (field.type === 'file') {
                    const fileData = formData[field.code];
                    const files = Array.isArray(value) ? value : [];
                    const lostFileNames = fileData?.label;

                    let fileContent: React.ReactNode;
                    if (files.length > 0 && files[0] && typeof files[0] === 'object' && 'file' in files[0]) {
                      // Files in memory — show clickable links
                      fileContent = (
                        <span className="flex flex-col items-end gap-1">
                          {files.map((f: { id?: string; file?: File; name?: string }, i: number) => (
                            <button
                              key={f.id || i}
                              type="button"
                              onClick={() => {
                                if (f.file) {
                                  const url = URL.createObjectURL(f.file);
                                  window.open(url, '_blank');
                                }
                              }}
                              className="text-[var(--color-primary)] hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <LucideIcons.Paperclip className="w-3.5 h-3.5" />
                              {f.name || 'Archivo adjunto'}
                            </button>
                          ))}
                        </span>
                      );
                    } else if (lostFileNames) {
                      // Files lost after refresh — show names without link
                      fileContent = (
                        <span className="flex items-center gap-1 text-neutral-500">
                          <LucideIcons.Paperclip className="w-3.5 h-3.5" />
                          {lostFileNames}
                        </span>
                      );
                    } else {
                      fileContent = 'No adjunto';
                    }

                    return (
                      <SummaryItem
                        key={field.id}
                        label={field.label}
                        value={fileContent}
                      />
                    );
                  }

                  const displayValue = getFieldDisplayValue(field, value as string | string[] | undefined, savedLabel);

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

          {/* Campos editables del paso de resumen actual - usa DynamicWizardStep para renderizar
              los campos con el tipo correcto (RadioGroup, FileUpload, etc.) */}
          {step.fields.length > 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6">
              <DynamicWizardStep
                step={step}
                showErrors={submitted}
              />
            </div>
          )}
        </div>
      </WizardLayout>
    );

    // Zona Gamer: wrap summary with dark theme, gamer navbar and footer
    if (landing === 'zona-gamer') {
      return (
        <GamerWizardWrapper>
          {pageContent}
          <SubmitOverlay isOpen={isAppSubmitting} stage={submitStage} />
        </GamerWizardWrapper>
      );
    }

    return (
      <>
        {pageContent}
        {agreementData ? <ConvenioFooter data={footerData} agreementData={agreementData} landing={landing} /> : <Footer data={footerData} landing={landing} />}
      </>
    );
  }

  // Render regular form step content
  // Determinar dinámicamente si es el último paso del wizard
  // Solo mostrar "Enviar Solicitud" si no hay más pasos Y no hay complementos
  const isActuallyLastRegularStep = navigation.isLast && !shouldShowComplementos;

  const pageContent = (
    <>
      <AnimatePresence>
        {showCelebration && (
          landing === 'zona-gamer' ? (
            <GamerStepSuccess
              stepName={step.title}
              stepNumber={step.order + 1}
              totalSteps={steps.length}
              onComplete={handleCelebrationComplete}
            />
          ) : (
            <StepSuccessMessage
              stepName={step.title}
              stepNumber={step.order + 1}
              totalSteps={steps.length}
              onComplete={handleCelebrationComplete}
            />
          )
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
        isLastStep={isActuallyLastRegularStep}
        canProceed={true}
        hideNavbar={landing === 'zona-gamer'}
        navbarProps={landing === 'zona-gamer' ? undefined : (navbarProps || undefined)}
        motivational={stepMotivational}
      >
        <DynamicWizardStep
          step={step}
          showErrors={submitted}
          stepOrder={step.order}
        />
      </WizardLayout>
    </>
  );

  // Zona Gamer: wrap with dark theme, gamer navbar and footer
  if (landing === 'zona-gamer') {
    return (
      <GamerWizardWrapper>
        {pageContent}
        <SubmitOverlay isOpen={isAppSubmitting} stage={submitStage} />
      </GamerWizardWrapper>
    );
  }

  return (
    <>
      {pageContent}
      {agreementData ? <ConvenioFooter data={footerData} agreementData={agreementData} landing={landing} /> : <Footer data={footerData} landing={landing} />}
      <SubmitOverlay isOpen={isAppSubmitting} stage={submitStage} />
    </>
  );
}

function LoadingFallback() {
  const params = useParams();
  const isGamer = (params?.landing as string) === 'zona-gamer';

  if (isGamer) {
    const savedTheme = typeof window !== 'undefined' ? sessionStorage.getItem('gamer-theme') : null;
    const isDark = savedTheme !== 'light';

    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isDark ? '#0e0e0e' : '#f5f5f5' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                border: `3px solid ${isDark ? '#2a2a2a' : '#e0e0e0'}`,
                borderTopColor: '#00ffd5',
              }}
            />
          </div>
          <p style={{ color: isDark ? '#555' : '#999', fontFamily: 'Rajdhani, sans-serif', fontSize: 14 }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

// Gamer theme wrapper for zona-gamer wizard steps
function GamerWizardWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [hydrated, setHydrated] = useState(false);
  const params = useParams();
  const landing = (params.landing as string) || 'zona-gamer';

  // Hydrate theme from sessionStorage after mount
  useEffect(() => {
    const saved = sessionStorage.getItem('gamer-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    setHydrated(true);
  }, []);

  const isDark = theme === 'dark';

  const handleToggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    sessionStorage.setItem('gamer-theme', next);
  }, [isDark]);

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0e0e0e' : '#f5f5f5', color: isDark ? '#f0f0f0' : '#1a1a1a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
        /* Gamer cyan overrides - both dark and light modes */
        .gamer-wizard-dark,
        .gamer-wizard-dark *,
        .gamer-wizard-light,
        .gamer-wizard-light * {
          --color-primary: #00ffd5 !important;
          --color-primary-rgb: 0,255,213 !important;
          --color-secondary: #00ffd5 !important;
          --color-secondary-rgb: 0,255,213 !important;
        }
        /* Inline color overrides - both modes */
        .gamer-wizard-dark [style*="color: #4654cd"],
        .gamer-wizard-dark [style*="color:#4654cd"],
        .gamer-wizard-dark [style*="color: #4654CD"],
        .gamer-wizard-dark [style*="color:#4654CD"],
        .gamer-wizard-dark [style*="color: rgb(70, 84, 205)"],
        .gamer-wizard-light [style*="color: #4654cd"],
        .gamer-wizard-light [style*="color:#4654cd"],
        .gamer-wizard-light [style*="color: #4654CD"],
        .gamer-wizard-light [style*="color:#4654CD"],
        .gamer-wizard-light [style*="color: rgb(70, 84, 205)"] {
          color: #00ffd5 !important;
        }
        /* Backgrounds */
        .gamer-wizard-dark .min-h-screen { background: #0e0e0e !important; }
        .gamer-wizard-dark .bg-white { background: #1a1a1a !important; }
        .gamer-wizard-dark .bg-neutral-50 { background: #0e0e0e !important; }
        .gamer-wizard-dark .bg-neutral-100 { background: #252525 !important; }
        .gamer-wizard-dark .bg-content1 { background: #1a1a1a !important; }
        /* Borders */
        .gamer-wizard-dark .border-neutral-200,
        .gamer-wizard-dark .border-neutral-100,
        .gamer-wizard-dark .border-neutral-300 { border-color: #2a2a2a !important; }
        /* Text colors */
        .gamer-wizard-dark .text-neutral-900 { color: #f5f5f5 !important; }
        .gamer-wizard-dark .text-neutral-800 { color: #f0f0f0 !important; }
        .gamer-wizard-dark .text-neutral-700 { color: #d4d4d4 !important; }
        .gamer-wizard-dark .text-neutral-600 { color: #a0a0a0 !important; }
        .gamer-wizard-dark .text-neutral-500 { color: #707070 !important; }
        .gamer-wizard-dark .text-neutral-400 { color: #555 !important; }
        .gamer-wizard-dark .text-foreground { color: #f0f0f0 !important; }
        /* Forms */
        .gamer-wizard-dark input,
        .gamer-wizard-dark select,
        .gamer-wizard-dark textarea {
          background: #1e1e1e !important;
          color: #f0f0f0 !important;
          border-color: #2a2a2a !important;
        }
        .gamer-wizard-dark input::placeholder,
        .gamer-wizard-dark textarea::placeholder { color: #555 !important; }
        .gamer-wizard-dark input:focus,
        .gamer-wizard-dark select:focus,
        .gamer-wizard-dark textarea:focus {
          border-color: #00ffd5 !important;
          box-shadow: 0 0 0 1px rgba(0,255,213,0.3) !important;
        }
        /* Segmented controls */
        .gamer-wizard-dark .bg-neutral-100.border { background: #1e1e1e !important; }
        /* Step progress: inactive circles + lines */
        .gamer-wizard-dark .bg-neutral-200 {
          background: #2a2a2a !important;
        }
        .gamer-wizard-dark .bg-neutral-200.text-neutral-500 {
          background: #2a2a2a !important;
          color: #555 !important;
        }
        /* Shadows */
        .gamer-wizard-dark .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important; }
        .gamer-wizard-dark .shadow-lg { box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important; }
        /* Primary color overrides */
        .gamer-wizard-dark .bg-\\[\\#4654CD\\] { background: #00ffd5 !important; color: #0a0a0a !important; }
        .gamer-wizard-dark .text-\\[\\#4654CD\\],
        .gamer-wizard-dark span.text-\\[\\#4654CD\\],
        .gamer-wizard-dark [class*="text-[#4654CD]"] { color: #00ffd5 !important; }
        .gamer-wizard-dark .border-\\[\\#4654CD\\] { border-color: #00ffd5 !important; }
        .gamer-wizard-dark .ring-\\[\\#4654CD\\]\\/20 { --tw-ring-color: rgba(0,255,213,0.2) !important; }
        .gamer-wizard-dark .ring-\\[\\#4654CD\\]\\/30 { --tw-ring-color: rgba(0,255,213,0.3) !important; }
        .gamer-wizard-dark .shadow-\\[\\#4654CD\\]\\/25 { --tw-shadow-color: rgba(0,255,213,0.25) !important; }
        .gamer-wizard-dark .bg-\\[var\\(--color-primary\\)\\] { background: #00ffd5 !important; color: #0a0a0a !important; }
        .gamer-wizard-dark .text-\\[var\\(--color-primary\\)\\] { color: #00ffd5 !important; }
        /* Hover states */
        .gamer-wizard-dark .hover\\:bg-\\[\\#3a47b3\\]:hover { background: #00b396 !important; }
        .gamer-wizard-dark .hover\\:text-neutral-800:hover { color: #f0f0f0 !important; }
        /* Step progress - active step */
        .gamer-wizard-dark .bg-\\[\\#4654CD\\].text-white {
          background: #00ffd5 !important;
          color: #0a0a0a !important;
        }
        .gamer-wizard-dark .ring-4.ring-\\[\\#4654CD\\]\\/20 {
          --tw-ring-color: rgba(0,255,213,0.2) !important;
        }
        /* Navigation button */
        .gamer-wizard-dark .bg-\\[\\#4654CD\\].text-white.rounded-xl {
          background: #00ffd5 !important; color: #0a0a0a !important;
          color: #fff !important;
        }
        /* Product bar mobile */
        .gamer-wizard-dark .fixed.bottom-0 .bg-white {
          background: #1a1a1a !important;
          border-color: #2a2a2a !important;
        }
        /* Motivational card */
        .gamer-wizard-dark .sticky .bg-white {
          background: #1a1a1a !important;
          border-color: #2a2a2a !important;
        }
        /* Geolocation detected-address card */
        .gamer-wizard-dark .bg-neutral-50.rounded-xl {
          background: #1e1e1e !important;
          border: 1px solid #2a2a2a !important;
        }
        .gamer-wizard-dark .bg-\\[rgba\\(var\\(--color-primary-rgb\\)\\,0\\.1\\)\\] {
          background: rgba(0,255,213,0.1) !important;
        }
        /* Mobile bottom sheet (LocationModal) — dark overrides */
        .gamer-wizard-dark .fixed.bottom-0.bg-white {
          background: #1a1a1a !important;
          border-color: #2a2a2a !important;
        }
        .gamer-wizard-dark .bg-neutral-300.rounded-full {
          background: #555 !important;
        }
        /* Green → Cyan overrides (check icons, success states, completed fields) */
        .gamer-wizard-dark .bg-green-500,
        .gamer-wizard-dark .bg-green-600,
        .gamer-wizard-dark .bg-\\[\\#22c55e\\] { background: #00ffd5 !important; }
        .gamer-wizard-dark .text-green-500,
        .gamer-wizard-dark .text-green-600,
        .gamer-wizard-dark .text-\\[\\#22c55e\\] { color: #00ffd5 !important; }
        .gamer-wizard-dark .border-green-400,
        .gamer-wizard-dark .border-green-500,
        .gamer-wizard-dark .border-\\[\\#22c55e\\] { border-color: #00ffd5 !important; }
        .gamer-wizard-dark .ring-green-500\\/20 { --tw-ring-color: rgba(0,255,213,0.2) !important; }
        /* Also catch any inline green via attribute selector */
        .gamer-wizard-dark [style*="border-color: rgb(34, 197, 94)"],
        .gamer-wizard-dark [style*="#22c55e"] { border-color: #00ffd5 !important; }
        .gamer-wizard-dark [class*="border-[#22c55e]"] { border-color: #00ffd5 !important; }
        .gamer-wizard-dark [class*="text-[#22c55e]"] { color: #00ffd5 !important; }
        /* Labels: muted gray, not white */
        .gamer-wizard-dark label,
        .gamer-wizard-dark .text-sm.font-medium.text-neutral-700 {
          color: #707070 !important;
        }
        /* Input text should be white when filled */
        .gamer-wizard-dark input,
        .gamer-wizard-dark select,
        .gamer-wizard-dark textarea {
          color: #f0f0f0 !important;
        }
        /* Placeholder very subtle */
        .gamer-wizard-dark input::placeholder,
        .gamer-wizard-dark textarea::placeholder {
          color: #3a3a3a !important;
        }
        /* Override browser autofill white background */
        .gamer-wizard-dark input,
        .gamer-wizard-dark textarea,
        .gamer-wizard-dark select {
          box-shadow: #1e1e1e 0 0 0 1000px inset !important;
          -webkit-text-fill-color: #f0f0f0 !important;
        }
        .gamer-wizard-dark input:-webkit-autofill,
        .gamer-wizard-dark input:-webkit-autofill:hover,
        .gamer-wizard-dark input:-webkit-autofill:focus,
        .gamer-wizard-dark textarea:-webkit-autofill,
        .gamer-wizard-dark select:-webkit-autofill {
          box-shadow: #1e1e1e 0 0 0 1000px inset !important;
          -webkit-text-fill-color: #f0f0f0 !important;
          caret-color: #f0f0f0 !important;
        }
        /* Input wrapper bg override */
        .gamer-wizard-dark .bg-white.border-2,
        .gamer-wizard-dark .bg-white.rounded-lg,
        .gamer-wizard-dark div[class*="bg-white"][class*="border-2"] {
          background: #1e1e1e !important;
        }
        /* Input border: default very subtle, cyan only on focus */
        .gamer-wizard-dark input,
        .gamer-wizard-dark select,
        .gamer-wizard-dark textarea {
          border-color: #2a2a2a !important;
        }
        .gamer-wizard-dark input:focus,
        .gamer-wizard-dark select:focus,
        .gamer-wizard-dark textarea:focus {
          border-color: #00ffd5 !important;
          box-shadow: 0 0 0 1px rgba(0,255,213,0.3) !important;
        }
        /* Filled input wrapper gets subtle cyan border */
        .gamer-wizard-dark .border-2.border-\\[\\#4654CD\\] {
          border-color: #00ffd5 !important;
        }
        /* Step completed check → cyan */
        .gamer-wizard-dark [data-completed="true"],
        .gamer-wizard-dark .bg-green-100 { background: rgba(0,255,213,0.1) !important; }
        .gamer-wizard-dark .text-green-700 { color: #00ffd5 !important; }
        /* Modal/overlay backgrounds */
        .gamer-wizard-dark [role="dialog"],
        .gamer-wizard-dark section[role="dialog"] {
          background: #1a1a1a !important;
          border: 1px solid #2a2a2a !important;
        }
        .gamer-wizard-dark [data-overlay="true"],
        .gamer-wizard-dark [data-slot="backdrop"] {
          background: rgba(0,0,0,0.6) !important;
          backdrop-filter: blur(8px) !important;
        }
        /* Geolocation modal button */
        .gamer-wizard-dark .bg-\\[var\\(--color-primary\\)\\].text-white {
          background: #00ffd5 !important;
          color: #0a0a0a !important;
        }
        /* Motivational image sizing for gamer */
        .gamer-wizard-dark .sticky img {
          max-width: 460px !important;
        }
        /* Red error → softer red for dark theme */
        .gamer-wizard-dark .text-red-500,
        .gamer-wizard-dark .text-red-600,
        .gamer-wizard-dark .text-danger { color: #ff6b6b !important; }
        .gamer-wizard-dark .border-red-500,
        .gamer-wizard-dark .border-red-400,
        .gamer-wizard-dark .border-danger { border-color: #ff6b6b !important; }
        .gamer-wizard-dark .bg-red-50,
        .gamer-wizard-dark .bg-red-100 { background: rgba(255,107,107,0.1) !important; }
        /* NextUI dropdown portal */
        .gamer-wizard-dark [data-slot="listbox"],
        .gamer-wizard-dark [data-slot="popover"],
        .gamer-wizard-dark [role="listbox"] {
          background: #1e1e1e !important;
          border: 1px solid #2a2a2a !important;
        }
        .gamer-wizard-dark [data-slot="listbox"] [role="option"],
        .gamer-wizard-dark [role="listbox"] [role="option"] {
          color: #f0f0f0 !important;
        }
        .gamer-wizard-dark [data-slot="listbox"] [role="option"]:hover,
        .gamer-wizard-dark [data-slot="listbox"] [data-hover="true"],
        .gamer-wizard-dark [role="listbox"] [role="option"]:hover {
          background: rgba(0,255,213,0.1) !important;
        }
        .gamer-wizard-dark [data-slot="listbox"] [data-selected="true"],
        .gamer-wizard-dark [role="listbox"] [aria-selected="true"] {
          background: rgba(0,255,213,0.15) !important;
          color: #00ffd5 !important;
        }
        /* Segmented control / radio group active */
        .gamer-wizard-dark .bg-\\[\\#4654CD\\]\\/10,
        .gamer-wizard-dark .bg-\\[var\\(--color-primary\\)\\]\\/10 {
          background: rgba(0,255,213,0.1) !important;
        }
        .gamer-wizard-dark .bg-\\[\\#4654CD\\]\\/5 {
          background: rgba(0,255,213,0.05) !important;
        }
        /* Radio/checkbox indicators */
        .gamer-wizard-dark [data-slot="wrapper"][data-selected="true"],
        .gamer-wizard-dark .border-\\[\\#4654CD\\].bg-\\[\\#4654CD\\] {
          background: #00ffd5 !important;
          border-color: #00ffd5 !important;
        }
        /* Tooltip and popover backgrounds */
        .gamer-wizard-dark [data-slot="content"][role="tooltip"],
        .gamer-wizard-dark [data-slot="content"] {
          background: #252525 !important;
          color: #f0f0f0 !important;
        }
        /* File upload drop zone */
        .gamer-wizard-dark .border-dashed {
          border-color: #2a2a2a !important;
          background: #1a1a1a !important;
        }
        .gamer-wizard-dark .border-dashed:hover {
          border-color: #00ffd5 !important;
          background: rgba(0,255,213,0.05) !important;
        }
        /* bg-gray variants */
        .gamer-wizard-dark .bg-gray-50,
        .gamer-wizard-dark .bg-gray-100 { background: #1e1e1e !important; }
        .gamer-wizard-dark .bg-gray-200 { background: #252525 !important; }
        .gamer-wizard-dark .text-gray-500,
        .gamer-wizard-dark .text-gray-600 { color: #707070 !important; }
        .gamer-wizard-dark .text-gray-700,
        .gamer-wizard-dark .text-gray-800 { color: #a0a0a0 !important; }
        .gamer-wizard-dark .text-gray-900 { color: #f0f0f0 !important; }
        /* Inline style background overrides */
        .gamer-wizard-dark [style*="background: white"],
        .gamer-wizard-dark [style*="background-color: white"],
        .gamer-wizard-dark [style*="background: rgb(255, 255, 255)"],
        .gamer-wizard-dark [style*="background-color: rgb(255, 255, 255)"] {
          background: #1a1a1a !important;
        }
        /* === Step success celebration screen === */
        .gamer-wizard-dark .fixed.inset-0.z-50.bg-white {
          background: #0e0e0e !important;
        }
        .gamer-wizard-dark .fixed.inset-0.z-50 .bg-\\[\\#22c55e\\] {
          background: #00ffd5 !important;
        }
        .gamer-wizard-dark .fixed.inset-0.z-50 .border-\\[\\#22c55e\\] {
          border-color: #00ffd5 !important;
        }
        .gamer-wizard-dark .fixed.inset-0.z-50 .bg-neutral-300 {
          background: #2a2a2a !important;
        }
        /* === Submit overlay === */
        .gamer-wizard-dark .fixed.inset-0.bg-white\\/95 {
          background: rgba(14,14,14,0.95) !important;
        }
        .gamer-wizard-dark .fixed.inset-0 .bg-white.border.border-neutral-200.rounded-xl {
          background: #1a1a1a !important;
          border: 1px solid #00ffd5 !important;
        }
        .gamer-wizard-dark .fixed.inset-0 .bg-green-500.text-white {
          background: #00ffd5 !important;
          color: #0a0a0a !important;
        }
        .gamer-wizard-dark .fixed.inset-0 .bg-\\[var\\(--color-primary\\)\\].text-white {
          background: #00ffd5 !important;
          color: #0a0a0a !important;
        }
        .gamer-wizard-dark .fixed.inset-0 .bg-neutral-200.text-neutral-400 {
          background: #2a2a2a !important;
          color: #555 !important;
        }
        .gamer-wizard-dark .fixed.inset-0 .bg-green-500:not(.text-white) {
          background: #00ffd5 !important;
        }
        /* Scrollbar */
        .gamer-wizard-dark ::-webkit-scrollbar { width: 6px; }
        .gamer-wizard-dark ::-webkit-scrollbar-track { background: #0e0e0e; }
        .gamer-wizard-dark ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
        /* === Portal-level overrides (modals, dropdowns - both dark AND light modes) === */
        body:has(.gamer-wizard-dark) [data-overlay="true"],
        body:has(.gamer-wizard-dark) [data-slot="backdrop"],
        body:has(.gamer-wizard-light) [data-overlay="true"],
        body:has(.gamer-wizard-light) [data-slot="backdrop"] {
          background: rgba(0,0,0,0.5) !important;
          backdrop-filter: blur(8px) !important;
          z-index: 9999 !important;
          position: fixed !important;
          inset: 0 !important;
        }
        /* Dialog: dark mode gets dark bg, light mode stays white */
        body:has(.gamer-wizard-dark) [role="dialog"],
        body:has(.gamer-wizard-dark) section[role="dialog"] {
          background: #1a1a1a !important;
          border: 1px solid #2a2a2a !important;
          color: #f0f0f0 !important;
          border-radius: 16px !important;
          z-index: 10000 !important;
          position: relative !important;
        }
        body:has(.gamer-wizard-light) [role="dialog"],
        body:has(.gamer-wizard-light) section[role="dialog"] {
          background: #ffffff !important;
          border: 1px solid #e5e5e5 !important;
          color: #1a1a1a !important;
          border-radius: 16px !important;
          z-index: 10000 !important;
          position: relative !important;
        }
        /* Dialog dark mode text overrides */
        body:has(.gamer-wizard-dark) [role="dialog"] .text-neutral-800,
        body:has(.gamer-wizard-dark) [role="dialog"] .text-neutral-900 { color: #f0f0f0 !important; }
        body:has(.gamer-wizard-dark) [role="dialog"] .text-neutral-700 { color: #d4d4d4 !important; }
        body:has(.gamer-wizard-dark) [role="dialog"] .text-neutral-500 { color: #a0a0a0 !important; }
        body:has(.gamer-wizard-dark) [role="dialog"] .text-neutral-400 { color: #707070 !important; }
        /* Dialog dark mode error states */
        body:has(.gamer-wizard-dark) [role="dialog"] .bg-red-50 { background: rgba(239,68,68,0.1) !important; }
        body:has(.gamer-wizard-dark) [role="dialog"] .text-red-600 { color: #ff6b6b !important; }
        /* Modal wrapper container */
        body:has(.gamer-wizard-dark) [data-slot="wrapper"][class*="z-"],
        body:has(.gamer-wizard-light) [data-slot="wrapper"][class*="z-"] {
          z-index: 9999 !important;
        }
        /* Hide navbar & promo bar when modal is open */
        body:has([data-overlay="true"]) .gamer-wizard-dark header.sticky,
        body:has([data-overlay="true"]) .gamer-wizard-dark .fixed.top-0,
        body:has([data-overlay="true"]) .gamer-wizard-light header.sticky,
        body:has([data-overlay="true"]) .gamer-wizard-light .fixed.top-0,
        body:has([role="dialog"]) .gamer-wizard-dark header.sticky,
        body:has([role="dialog"]) .gamer-wizard-dark .fixed.top-0,
        body:has([role="dialog"]) .gamer-wizard-light header.sticky,
        body:has([role="dialog"]) .gamer-wizard-light .fixed.top-0,
        body:has(section[role="dialog"]) .gamer-wizard-dark header.sticky,
        body:has(section[role="dialog"]) .gamer-wizard-dark .fixed.top-0,
        body:has(section[role="dialog"]) .gamer-wizard-light header.sticky,
        body:has(section[role="dialog"]) .gamer-wizard-light .fixed.top-0 {
          z-index: 0 !important;
          pointer-events: none !important;
        }
        /* Icon circle - cyan tint */
        body:has(.gamer-wizard-dark) [role="dialog"] .bg-\\[rgba\\(var\\(--color-primary-rgb\\)\\,0\\.1\\)\\],
        body:has(.gamer-wizard-light) [role="dialog"] .bg-\\[rgba\\(var\\(--color-primary-rgb\\)\\,0\\.1\\)\\] {
          background: rgba(0,255,213,0.1) !important;
        }
        /* Icon color - cyan */
        body:has(.gamer-wizard-dark) [role="dialog"] .text-\\[var\\(--color-primary\\)\\],
        body:has(.gamer-wizard-light) [role="dialog"] .text-\\[var\\(--color-primary\\)\\] {
          color: #00d4b0 !important;
        }
        body:has(.gamer-wizard-dark) [role="dialog"] .text-\\[\\#4654CD\\],
        body:has(.gamer-wizard-light) [role="dialog"] .text-\\[\\#4654CD\\] {
          color: #00d4b0 !important;
        }
        /* Button - cyan */
        body:has(.gamer-wizard-dark) [role="dialog"] .bg-\\[var\\(--color-primary\\)\\],
        body:has(.gamer-wizard-dark) [role="dialog"] .bg-\\[\\#4654CD\\],
        body:has(.gamer-wizard-light) [role="dialog"] .bg-\\[var\\(--color-primary\\)\\],
        body:has(.gamer-wizard-light) [role="dialog"] .bg-\\[\\#4654CD\\] {
          background: #00ffd5 !important;
          color: #0a0a0a !important;
        }
        body:has(.gamer-wizard-dark) [role="dialog"] .bg-\\[var\\(--color-primary\\)\\].text-white,
        body:has(.gamer-wizard-light) [role="dialog"] .bg-\\[var\\(--color-primary\\)\\].text-white {
          background: #00ffd5 !important;
          color: #0a0a0a !important;
        }
        /* Detected address card inside dialog */
        body:has(.gamer-wizard-dark) [role="dialog"] .bg-neutral-50 {
          background: #252525 !important;
        }
        body:has(.gamer-wizard-dark) [role="dialog"] .bg-neutral-50.rounded-xl {
          background: #252525 !important;
          border: 1px solid #2a2a2a !important;
        }
        body:has(.gamer-wizard-light) [role="dialog"] .bg-neutral-50 {
          background: #f5f5f5 !important;
        }
        body:has(.gamer-wizard-light) [role="dialog"] .bg-neutral-50.rounded-xl {
          background: #f5f5f5 !important;
          border: 1px solid #e5e5e5 !important;
        }
        /* Inputs inside dialog - dark */
        body:has(.gamer-wizard-dark) [role="dialog"] input,
        body:has(.gamer-wizard-dark) [role="dialog"] select {
          background: #1e1e1e !important;
          color: #f0f0f0 !important;
          border-color: #2a2a2a !important;
        }
        /* Inputs inside dialog - light */
        body:has(.gamer-wizard-light) [role="dialog"] input,
        body:has(.gamer-wizard-light) [role="dialog"] select {
          background: #ffffff !important;
          color: #1a1a1a !important;
          border-color: #e5e5e5 !important;
        }
        body:has(.gamer-wizard-dark) [role="dialog"] input:focus,
        body:has(.gamer-wizard-dark) [role="dialog"] select:focus,
        body:has(.gamer-wizard-light) [role="dialog"] input:focus,
        body:has(.gamer-wizard-light) [role="dialog"] select:focus {
          border-color: #00ffd5 !important;
          box-shadow: 0 0 0 1px rgba(0,255,213,0.3) !important;
        }
        /* Dropdowns - dark mode */
        body:has(.gamer-wizard-dark) [role="listbox"],
        body:has(.gamer-wizard-dark) [data-slot="listbox"] {
          background: #1e1e1e !important;
          border: 1px solid #2a2a2a !important;
        }
        body:has(.gamer-wizard-dark) [role="listbox"] [role="option"] {
          color: #f0f0f0 !important;
        }
        body:has(.gamer-wizard-dark) [role="listbox"] [role="option"]:hover,
        body:has(.gamer-wizard-dark) [data-slot="listbox"] [data-hover="true"] {
          background: rgba(0,255,213,0.1) !important;
        }
        /* Dropdowns - light mode */
        body:has(.gamer-wizard-light) [role="listbox"],
        body:has(.gamer-wizard-light) [data-slot="listbox"] {
          background: #ffffff !important;
          border: 1px solid #e5e5e5 !important;
        }
        body:has(.gamer-wizard-light) [role="listbox"] [role="option"]:hover,
        body:has(.gamer-wizard-light) [data-slot="listbox"] [data-hover="true"] {
          background: rgba(0,255,213,0.1) !important;
        }
        body:has(.gamer-wizard-light) [role="listbox"] [aria-selected="true"],
        body:has(.gamer-wizard-light) [data-slot="listbox"] [data-selected="true"] {
          background: rgba(0,255,213,0.15) !important;
          color: #0a8a76 !important;
        }
      `}</style>
      <div className={isDark ? 'gamer-wizard-dark' : 'gamer-wizard-light'}>
        <GamerNavbar
          theme={theme}
          onToggleTheme={handleToggleTheme}
          catalogUrl={routes.catalogo(landing)}
          hideSecondaryBar
        />
        {/* Spacer for fixed GamerNavbar */}
        <div style={{ height: 80 }} />
        {children}
        <GamerFooter theme={theme} />
      </div>
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
