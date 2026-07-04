'use client';

/**
 * useOfferTour — tour guiado propio del catálogo de OFERTA (Caso 4/5).
 *
 * No reusa useOnboarding del catálogo regular porque ese genera pasos que
 * apuntan a botones que NO existen en la oferta (favoritos, carrito, acciones de
 * card). Aquí definimos un set de pasos reducido que apunta SOLO a IDs que el
 * catálogo de oferta sí renderiza (los de CatalogLayoutV4: filtros, orden,
 * quick-cards) + el botón de ayuda propio de la oferta.
 *
 * Reusa el componente visual OnboardingTour / OnboardingWelcomeModal (que ya
 * emiten los eventos de analytics tour_*). Estado persistido en localStorage
 * por token para no repetir el welcome a quien ya lo vio.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OnboardingStep } from '../../../[landing]/catalogo/types/catalog';

// IDs que el catálogo de oferta SÍ renderiza (vía CatalogLayoutV4):
//   onboarding-filters-desktop / -mobile, onboarding-sort, onboarding-quick-cards.
// Y el botón de ayuda propio de la oferta: onboarding-oferta-help.
export const OFFER_TOUR_STEPS: OnboardingStep[] = [
  {
    id: 'oferta-quick-cards',
    targetId: 'onboarding-quick-cards',
    title: 'Elige por tipo de uso',
    description: 'Selecciona para qué usarás tu equipo (estudio, gaming, diseño…) y filtramos los aprobados para ti.',
    position: 'bottom',
    positionMobile: 'bottom',
  },
  {
    id: 'oferta-filters',
    targetId: 'onboarding-filters-desktop',
    targetIdMobile: 'onboarding-filters-mobile',
    title: 'Ajusta los filtros',
    description: 'Marca, cuota mensual, RAM y más. Solo verás equipos que entran en tu cuota aprobada.',
    position: 'right',
    positionMobile: 'bottom',
  },
  {
    id: 'oferta-sort',
    targetId: 'onboarding-sort',
    title: 'Ordena los equipos',
    description: 'Ordena por cuota o destacados para encontrar tu equipo ideal más rápido.',
    position: 'bottom',
    positionMobile: 'bottom',
  },
];

const storageKey = (token: string) => `baldecash-oferta-${token}-tour`;

interface OfferTourState {
  hasSeenWelcome: boolean;
  hasCompletedTour: boolean;
}

const defaultState: OfferTourState = { hasSeenWelcome: false, hasCompletedTour: false };

export function useOfferTour(token: string) {
  const [state, setState] = useState<OfferTourState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const key = useMemo(() => storageKey(token), [token]);

  // Cargar de localStorage al montar (SSR-safe).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setState(JSON.parse(saved) as OfferTourState);
    } catch {
      /* noop */
    }
    setIsHydrated(true);
  }, [key]);

  // Persistir.
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        /* noop */
      }
    }
  }, [state, isHydrated, key]);

  const steps = OFFER_TOUR_STEPS;
  const totalSteps = steps.length;

  const shouldShowWelcome = isHydrated && !state.hasSeenWelcome;
  const shouldShowTour = isHydrated && isActive && !state.hasCompletedTour;
  const currentStepData = shouldShowTour ? steps[currentStep] || null : null;

  const startTour = useCallback(() => {
    setState((p) => ({ ...p, hasSeenWelcome: true }));
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  // "Ver tour" desde el botón de ayuda (sin welcome).
  const restartTour = useCallback(() => {
    setState((p) => ({ ...p, hasSeenWelcome: true, hasCompletedTour: false }));
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const dismissWelcome = useCallback(() => {
    setState((p) => ({ ...p, hasSeenWelcome: true }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((idx) => {
      const next = idx + 1;
      if (next >= totalSteps) {
        setIsActive(false);
        setState((p) => ({ ...p, hasCompletedTour: true }));
        return 0;
      }
      return next;
    });
  }, [totalSteps]);

  const prevStep = useCallback(() => setCurrentStep((idx) => Math.max(0, idx - 1)), []);

  const skipTour = useCallback(() => {
    setState((p) => ({ ...p, hasSeenWelcome: true, hasCompletedTour: true }));
    setIsActive(false);
  }, []);

  return {
    shouldShowWelcome,
    shouldShowTour,
    currentStepData,
    currentStep,
    totalSteps,
    startTour,
    restartTour,
    dismissWelcome,
    nextStep,
    prevStep,
    skipTour,
  };
}
