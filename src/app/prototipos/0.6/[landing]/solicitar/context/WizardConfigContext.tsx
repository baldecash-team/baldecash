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
  getStepByCode,
  getStepBySlug,
  getStepNavigation,
  getStepSlug,
} from '../../../services/wizardApi';

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

  // Fetch wizard config on mount
  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getWizardConfig(slug);

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
  }, [slug]);

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
