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
  STEP_CODE_TO_SLUG,
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
      return STEP_CODE_TO_SLUG[stepCode];
    };
  }, []);

  const steps = useMemo(() => {
    if (!config) return [];
    return [...config.steps].sort((a, b) => a.order - b.order);
  }, [config]);

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
    }),
    [config, isLoading, error, getStep, getStepByUrlSlug, getNavigation, getUrlSlugForStep, steps]
  );

  return (
    <WizardConfigContext.Provider value={value}>
      {children}
    </WizardConfigContext.Provider>
  );
};

export default WizardConfigProvider;
