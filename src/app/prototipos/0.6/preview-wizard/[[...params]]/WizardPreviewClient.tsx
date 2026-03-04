'use client';

/**
 * WizardPreviewClient - Preview mode for wizard configuration
 * Shows wizard steps and fields in read-only preview mode
 *
 * URL patterns:
 * - /preview-wizard/6?preview_key=KEY → Overview of all steps
 * - /preview-wizard/6/datos-personales?preview_key=KEY → Specific step
 */

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, ChevronRight, Eye } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Services
import {
  WizardConfig,
  WizardStep,
  getWizardConfigById,
  getStepBySlug,
  getStepSlug,
} from '../../services/wizardApi';
import { getLandingHeroDataById } from '../../services/landingApi';

// Components
import { Navbar } from '../../components/hero/Navbar';
import { Footer } from '../../components/hero/Footer';
import { NotFoundContent } from '../../components/NotFoundContent';
import { CubeGridSpinner } from '@/app/prototipos/_shared';

// Types
import type { PromoBannerData, FooterData, CompanyData } from '../../types/hero';

// Helper to transform API footer data
function transformFooterData(apiData: {
  config?: Record<string, unknown>;
  content_config?: Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} | null, company?: any): FooterData | null {
  if (!apiData) return null;

  const config = apiData.config || {};
  const contentConfig = apiData.content_config || {};

  return {
    columns: (contentConfig.columns as FooterData['columns']) || [],
    newsletter: config.show_newsletter ? {
      enabled: true,
      title: 'Suscríbete',
      description: 'Recibe nuestras ofertas',
      placeholder: 'Tu correo',
      button_text: 'Suscribir',
    } : undefined,
    company: company ? {
      name: company.name as string || 'BaldeCash',
      logo_url: company.logo_url as string || '',
      sbs_registration: company.sbs_registration as string || '',
      social_links: company.social_links as CompanyData['social_links'],
    } : undefined,
  };
}

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
    'check-circle': 'CheckCircle',
    'clipboard-list': 'ClipboardList',
  };

  const lucideIconName = iconMap[iconName] || 'FileText';
  const IconComponent = LucideIcons[lucideIconName] as React.ElementType;
  return IconComponent || LucideIcons.FileText;
}

interface WizardPreviewClientProps {
  pathId: string | null;
  stepSlug: string | null;
}

function PreviewContent({ pathId, stepSlug }: WizardPreviewClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [wizardConfig, setWizardConfig] = useState<WizardConfig | null>(null);
  const [navbarProps, setNavbarProps] = useState<{
    promoBannerData?: PromoBannerData | null;
    logoUrl?: string;
    customerPortalUrl?: string;
    navbarItems?: { label: string; href: string; section: string | null }[];
    activeSections?: string[];
  } | null>(null);
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get preview key and landing ID
  const previewKey = searchParams.get('preview_key');
  const landingId = pathId ? parseInt(pathId, 10) : null;

  // Fetch data on mount
  useEffect(() => {
    if (!landingId || isNaN(landingId)) {
      setError('ID de landing no válido');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch wizard config and landing data in parallel
        const [wizardData, landingData] = await Promise.all([
          getWizardConfigById(landingId, previewKey),
          getLandingHeroDataById(landingId, previewKey),
        ]);

        if (!wizardData) {
          setError('No se encontró la configuración del wizard');
          return;
        }

        setWizardConfig(wizardData);

        // Transform landing data for navbar/footer
        if (landingData) {
          const { landing, components, company } = landingData;

          // Find navbar component
          const navbarComponent = components.find(c => c.component_code === 'navbar');

          setNavbarProps({
            logoUrl: landing.logo_url,
            navbarItems: navbarComponent?.content_config?.items as { label: string; href: string; section: string | null }[] || [],
            activeSections: ['hero'],
          });

          // Find footer component
          const footerComponent = components.find(c => c.component_code === 'footer');
          setFooterData(transformFooterData(footerComponent || null, company || null));
        }
      } catch (err) {
        console.error('Error fetching preview data:', err);
        setError('Error al cargar los datos de preview');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [landingId, previewKey]);

  // Get current step if stepSlug is provided
  const currentStep = useMemo(() => {
    if (!wizardConfig || !stepSlug) return null;
    return getStepBySlug(wizardConfig, stepSlug);
  }, [wizardConfig, stepSlug]);

  // Sort steps by order
  const sortedSteps = useMemo(() => {
    if (!wizardConfig) return [];
    return [...wizardConfig.steps].sort((a, b) => a.order - b.order);
  }, [wizardConfig]);

  // Separate regular steps from summary steps
  const { regularSteps, summarySteps } = useMemo(() => {
    const regular = sortedSteps.filter(s => !s.is_summary_step);
    const summary = sortedSteps.filter(s => s.is_summary_step);
    return { regularSteps: regular, summarySteps: summary };
  }, [sortedSteps]);

  // Navigate to specific step
  const handleStepClick = (step: WizardStep) => {
    const slug = getStepSlug(step);
    const url = previewKey
      ? `/prototipos/0.6/preview-wizard/${landingId}/${slug}?preview_key=${previewKey}`
      : `/prototipos/0.6/preview-wizard/${landingId}/${slug}`;
    router.push(url);
  };

  // Back to overview
  const handleBackToOverview = () => {
    const url = previewKey
      ? `/prototipos/0.6/preview-wizard/${landingId}?preview_key=${previewKey}`
      : `/prototipos/0.6/preview-wizard/${landingId}`;
    router.push(url);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <CubeGridSpinner />
      </div>
    );
  }

  // Error state
  if (error || !wizardConfig) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  // Render step detail view
  if (stepSlug && currentStep) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Preview Banner */}
        <PreviewBanner landingId={landingId} stepName={currentStep.title} />

        {/* Navbar */}
        <Navbar {...navbarProps} />
        <div className="h-[104px]" />

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back button */}
          <button
            onClick={handleBackToOverview}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 mb-6 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Volver al resumen</span>
          </button>

          {/* Step Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {React.createElement(getIconComponent(currentStep.icon), {
                className: 'w-6 h-6 text-[var(--color-primary)]',
              })}
              <h1 className="text-2xl font-bold text-neutral-800">{currentStep.title}</h1>
            </div>
            <p className="text-neutral-600">{currentStep.description}</p>
          </div>

          {/* Step Fields */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="grid grid-cols-12 gap-4">
              {currentStep.fields.map((field) => {
                const cols = field.grid_columns || 12;

                return (
                  <div
                    key={field.code}
                    className="col-span-12 md:col-span-6"
                    style={{ gridColumn: `span ${Math.min(cols, 12)} / span ${Math.min(cols, 12)}` }}
                  >
                    <FieldPreview field={field} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Motivational Card Preview */}
          {currentStep.motivational && (
            <div className="mt-6 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-primary)]/10 rounded-xl p-6 border border-[var(--color-primary)]/20">
              <h3 className="text-sm font-medium text-neutral-500 mb-2">Tarjeta Motivacional (Sidebar)</h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-lg font-semibold text-neutral-800">
                  {currentStep.motivational.title}{' '}
                  <span className="text-[var(--color-primary)]">{currentStep.motivational.highlight}</span>{' '}
                  {currentStep.motivational.title_end}
                </p>
                <p className="text-neutral-600 text-sm mt-1">{currentStep.motivational.subtitle}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer data={footerData} />
      </div>
    );
  }

  // Render overview (all steps)
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Preview Banner */}
      <PreviewBanner landingId={landingId} />

      {/* Navbar */}
      <Navbar {...navbarProps} />
      <div className="h-[104px]" />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            Preview del Wizard: {wizardConfig.landing_name}
          </h1>
          <p className="text-neutral-600">
            Landing: <code className="bg-neutral-100 px-2 py-1 rounded text-sm">{wizardConfig.landing_slug}</code>
            {' '}&middot;{' '}
            {regularSteps.length} pasos regulares
            {summarySteps.length > 0 && `, ${summarySteps.length} pasos de resumen`}
          </p>
        </div>

        {/* Regular Steps */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-neutral-700">Pasos del Formulario</h2>
          {regularSteps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index + 1}
              onClick={() => handleStepClick(step)}
            />
          ))}
        </div>

        {/* Summary Steps */}
        {summarySteps.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-700">Pasos de Resumen</h2>
            {summarySteps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={regularSteps.length + index + 1}
                onClick={() => handleStepClick(step)}
                isSummary
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer data={footerData} />
    </div>
  );
}

// Preview Banner Component
function PreviewBanner({ landingId, stepName }: { landingId: number | null; stepName?: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-400 text-amber-900 text-center py-1 text-sm font-medium">
      <Eye className="w-4 h-4 inline-block mr-2" />
      Modo Preview - Wizard (ID: {landingId})
      {stepName && <span className="ml-1">- {stepName}</span>}
    </div>
  );
}

// Step Card Component
function StepCard({
  step,
  index,
  onClick,
  isSummary = false,
}: {
  step: WizardStep;
  index: number;
  onClick: () => void;
  isSummary?: boolean;
}) {
  const IconComponent = getIconComponent(step.icon);

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-sm border border-neutral-200 p-5 text-left hover:border-[var(--color-primary)]/50 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-neutral-400">
              Paso {index}
              {isSummary && ' (Resumen)'}
            </span>
            {step.required && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Requerido</span>
            )}
            {step.skippable && (
              <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">Omitible</span>
            )}
          </div>
          <h3 className="font-semibold text-neutral-800 group-hover:text-[var(--color-primary)] transition-colors">
            {step.title}
          </h3>
          <p className="text-sm text-neutral-500 line-clamp-2">{step.description}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-neutral-400">
            <span>{step.fields.length} campos</span>
            {step.estimated_time_minutes > 0 && (
              <span>~{step.estimated_time_minutes} min</span>
            )}
            <span className="font-mono">/{step.url_slug || step.code}</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-[var(--color-primary)] transition-colors" />
      </div>
    </button>
  );
}

// Field Preview Component
function FieldPreview({ field }: { field: WizardStep['fields'][0] }) {
  const typeLabels: Record<string, string> = {
    text: 'Texto',
    email: 'Email',
    phone: 'Teléfono',
    document_number: 'Documento',
    date: 'Fecha',
    radio: 'Radio',
    select: 'Select',
    autocomplete: 'Autocomplete',
    file: 'Archivo',
    textarea: 'Textarea',
    currency: 'Moneda',
    number: 'Número',
  };

  return (
    <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-sm font-medium text-neutral-800">{field.label}</span>
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </div>
        <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded">
          {typeLabels[field.type] || field.type}
        </span>
      </div>

      {field.placeholder && (
        <p className="text-xs text-neutral-400 mb-2">Placeholder: {field.placeholder}</p>
      )}

      {field.help_text?.description && (
        <p className="text-xs text-neutral-500 mb-2">{field.help_text.description}</p>
      )}

      {field.options && field.options.length > 0 && (
        <div className="mt-2">
          <span className="text-xs text-neutral-400">Opciones ({field.options.length}):</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {field.options.slice(0, 5).map((opt) => (
              <span key={opt.value} className="text-xs bg-white border border-neutral-200 px-2 py-0.5 rounded">
                {opt.label}
              </span>
            ))}
            {field.options.length > 5 && (
              <span className="text-xs text-neutral-400">+{field.options.length - 5} más</span>
            )}
          </div>
        </div>
      )}

      {field.validations && field.validations.length > 0 && (
        <div className="mt-2 text-xs text-neutral-400">
          Validaciones: {field.validations.map(v => v.type).join(', ')}
        </div>
      )}

      <div className="mt-2 flex gap-2 text-xs text-neutral-400">
        <span>Grid: {field.grid_columns || 12}/12</span>
        {field.hidden && <span className="text-amber-600">Oculto</span>}
        {field.readonly && <span className="text-blue-600">Solo lectura</span>}
      </div>
    </div>
  );
}

// Main export with Suspense
export function WizardPreviewClient(props: WizardPreviewClientProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <CubeGridSpinner />
        </div>
      }
    >
      <PreviewContent {...props} />
    </Suspense>
  );
}

export default WizardPreviewClient;
