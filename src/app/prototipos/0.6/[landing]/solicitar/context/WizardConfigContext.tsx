'use client';

/**
 * WizardConfigContext - Provides form configuration from API
 * Fetches wizard config once per landing and provides it to all wizard steps
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  WizardConfig,
  WizardStep,
  WizardField,
  getWizardConfig,
  getWizardConfigById,
  getStepByCode,
  getStepBySlug,
  getStepNavigation,
  getStepSlug,
} from '../../../services/wizardApi';
import { usePreview } from '../../../context/PreviewContext';

interface WizardConfigContextValue {
  config: WizardConfig | null;
  isLoading: boolean;
  error: string | null;
  getStep: (stepCode: string) => WizardStep | undefined;
  getStepByUrlSlug: (slug: string) => WizardStep | undefined;
  getNavigation: (stepCode: string) => ReturnType<typeof getStepNavigation>;
  getUrlSlugForStep: (stepCode: string) => string | undefined;
  steps: WizardStep[];
  // Display values for intro page (from admin config)
  displayStepsCount: number;
  displayEstimatedMinutes: number;
}

const WizardConfigContext = createContext<WizardConfigContextValue | undefined>(undefined);

export const useWizardConfig = () => {
  const context = useContext(WizardConfigContext);
  if (!context) {
    throw new Error('useWizardConfig must be used within a WizardConfigProvider');
  }
  return context;
};

interface WizardConfigProviderProps {
  children: ReactNode;
  slug: string;
}

export const WizardConfigProvider: React.FC<WizardConfigProviderProps> = ({ children, slug }) => {
  const [config, setConfig] = useState<WizardConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're in preview mode for this landing
  const preview = usePreview();
  const isPreviewHydrated = preview.isHydrated;
  const isPreviewMode = preview.isPreviewingLanding(slug);
  const previewLandingId = isPreviewMode ? preview.landingId : null;
  const previewKey = isPreviewMode ? preview.previewKey : null;

  // Fetch wizard config on mount (wait for preview hydration)
  useEffect(() => {
    if (!isPreviewHydrated) return;

    let isMounted = true;

    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let data: WizardConfig | null = null;

        if (isPreviewMode && previewLandingId && previewKey) {
          // Use preview API with ID and preview_key
          data = await getWizardConfigById(previewLandingId, previewKey);
          // Fallback to slug-based API with preview_key
          if (!data) {
            data = await getWizardConfig(slug, previewKey);
          }
        } else {
          data = await getWizardConfig(slug);
        }

        if (!isMounted) return;

        if (data) {
          setConfig(data);
        } else {
          setError('No se pudo cargar la configuración del formulario');
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Error al cargar el formulario');
        console.error('Error fetching wizard config:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, [slug, isPreviewHydrated, isPreviewMode, previewLandingId, previewKey]);

  // Memoized helper functions
  const getStep = useMemo(() => {
    return (stepCode: string) => {
      if (!config) return undefined;
      return getStepByCode(config, stepCode);
    };
  }, [config]);

  const getStepByUrlSlug = useMemo(() => {
    return (urlSlug: string) => {
      if (!config) return undefined;
      return getStepBySlug(config, urlSlug);
    };
  }, [config]);

  const getNavigation = useMemo(() => {
    return (stepCode: string) => {
      if (!config) {
        return {
          currentIndex: -1,
          prevStep: null,
          nextStep: null,
          isFirst: true,
          isLast: true,
        };
      }
      return getStepNavigation(config, stepCode);
    };
  }, [config]);

  const getUrlSlugForStep = useMemo(() => {
    return (stepCode: string) => {
      if (!config) return undefined;
      const step = getStepByCode(config, stepCode);
      return step ? getStepSlug(step) : undefined;
    };
  }, [config]);

  const steps = useMemo(() => {
    if (!config) return [];
    return [...config.steps].sort((a, b) => a.order - b.order);
  }, [config]);

  // Display values from admin config (fallback to calculated if not set)
  const displayStepsCount = useMemo(() => {
    if (config?.display_steps_count !== undefined) {
      return config.display_steps_count;
    }
    // Fallback: count non-summary steps
    return steps.filter(s => !s.is_summary_step).length;
  }, [config, steps]);

  const displayEstimatedMinutes = useMemo(() => {
    if (config?.display_estimated_minutes !== undefined) {
      return config.display_estimated_minutes;
    }
    // Fallback: sum estimated times
    return steps.reduce((sum, s) => sum + (s.estimated_time_minutes || 0), 0);
  }, [config, steps]);

  const value = useMemo(
    () => ({
      config,
      isLoading,
      error,
      getStep,
      getStepByUrlSlug,
      getNavigation,
      getUrlSlugForStep,
      steps,
      displayStepsCount,
      displayEstimatedMinutes,
    }),
    [config, isLoading, error, getStep, getStepByUrlSlug, getNavigation, getUrlSlugForStep, steps, displayStepsCount, displayEstimatedMinutes]
  );

  return (
    <WizardConfigContext.Provider value={value}>
      {children}
    </WizardConfigContext.Provider>
  );
};

export default WizardConfigProvider;
