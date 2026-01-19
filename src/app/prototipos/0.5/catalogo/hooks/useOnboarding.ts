'use client';

/**
 * useOnboarding - Hook para manejar el estado del tour de ayuda
 * Persiste en localStorage para no mostrar a usuarios que ya lo vieron
 * Soporta hidratación segura (SSR-safe)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  OnboardingConfig,
  OnboardingStep,
  OnboardingStepCount,
  OnboardingHighlightStyle,
  defaultOnboardingConfig,
  onboardingStepsMinimal,
  onboardingStepsComplete,
} from '../types/catalog';

const STORAGE_KEY = 'baldecash-onboarding-catalog';

export interface OnboardingState {
  hasSeenWelcome: boolean;
  hasCompletedTour: boolean;
  currentStep: number;
  dismissedAt: string | null;
}

const defaultState: OnboardingState = {
  hasSeenWelcome: false,
  hasCompletedTour: false,
  currentStep: 0,
  dismissedAt: null,
};

interface UseOnboardingReturn {
  // State
  state: OnboardingState;
  config: OnboardingConfig;
  isHydrated: boolean;

  // Computed
  shouldShowWelcome: boolean;
  shouldShowTour: boolean;
  currentStepData: OnboardingStep | null;
  steps: OnboardingStep[];
  totalSteps: number;
  progress: number; // 0-100

  // Actions
  setConfig: (config: OnboardingConfig) => void;
  startTour: () => void;
  restartTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  dismissWelcome: () => void;
  resetOnboarding: () => void;
}

export function useOnboarding(
  initialConfig: OnboardingConfig = defaultOnboardingConfig
): UseOnboardingReturn {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [config, setConfigState] = useState<OnboardingConfig>(initialConfig);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);

  // Get steps based on config
  const steps = config.stepCount === 'complete'
    ? onboardingStepsComplete
    : onboardingStepsMinimal;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as OnboardingState;
        setState(parsed);
      }
    } catch (e) {
      console.error('Error loading onboarding state:', e);
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage when state changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Error saving onboarding state:', e);
      }
    }
  }, [state, isHydrated]);

  // Computed values
  const shouldShowWelcome = isHydrated && !state.hasSeenWelcome;
  const shouldShowTour = isHydrated && isTourActive && !state.hasCompletedTour;
  const currentStepData = shouldShowTour ? steps[state.currentStep] || null : null;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round((state.currentStep / totalSteps) * 100) : 0;

  // Actions
  const setConfig = useCallback((newConfig: OnboardingConfig) => {
    setConfigState(newConfig);
    // Reset step if changing step count and current step is out of bounds
    const newSteps = newConfig.stepCount === 'complete'
      ? onboardingStepsComplete
      : onboardingStepsMinimal;
    if (state.currentStep >= newSteps.length) {
      setState(prev => ({ ...prev, currentStep: 0 }));
    }
  }, [state.currentStep]);

  const startTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasSeenWelcome: true,
      currentStep: 0,
    }));
    setIsTourActive(true);
  }, []);

  // Restart tour without showing welcome modal (for "Ver tour guiado" button)
  const restartTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasSeenWelcome: true, // Keep this true to prevent welcome modal from showing
      hasCompletedTour: false,
      currentStep: 0,
      dismissedAt: null,
    }));
    setIsTourActive(true);
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      const nextStepIndex = prev.currentStep + 1;
      if (nextStepIndex >= steps.length) {
        // Tour completed
        setIsTourActive(false);
        return {
          ...prev,
          hasCompletedTour: true,
          currentStep: 0,
        };
      }
      return {
        ...prev,
        currentStep: nextStepIndex,
      };
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  const skipTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasSeenWelcome: true,
      hasCompletedTour: true,
      dismissedAt: new Date().toISOString(),
    }));
    setIsTourActive(false);
  }, []);

  const completeTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasCompletedTour: true,
      currentStep: 0,
    }));
    setIsTourActive(false);
  }, []);

  const dismissWelcome = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasSeenWelcome: true,
      dismissedAt: new Date().toISOString(),
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(defaultState);
    setIsTourActive(false);
  }, []);

  return {
    // State
    state,
    config,
    isHydrated,

    // Computed
    shouldShowWelcome,
    shouldShowTour,
    currentStepData,
    steps,
    totalSteps,
    progress,

    // Actions
    setConfig,
    startTour,
    restartTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    dismissWelcome,
    resetOnboarding,
  };
}

export default useOnboarding;
