'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  getSolicitarConfig,
  getEnabledSections,
  isSectionEnabled,
  DEFAULT_SOLICITAR_FLOW,
  type SolicitarFlowConfig,
  type SolicitarSection,
  type SolicitarSectionType,
} from '../services/landingApi';

interface UseSolicitarFlowOptions {
  /**
   * Slug de la landing
   */
  slug: string;
  /**
   * Clave de preview para acceder a landings no publicadas
   */
  previewKey?: string | null;
}

interface UseSolicitarFlowResult {
  /**
   * Configuración completa del flujo
   */
  config: SolicitarFlowConfig;
  /**
   * Solo las secciones habilitadas, ordenadas
   */
  enabledSections: SolicitarSection[];
  /**
   * Verificar si una sección específica está habilitada
   */
  isEnabled: (type: SolicitarSectionType) => boolean;
  /**
   * Obtener la posición (1-indexed) de una sección en el flujo habilitado
   */
  getPosition: (type: SolicitarSectionType) => number | null;
  /**
   * Estado de carga
   */
  isLoading: boolean;
  /**
   * Error si falló la carga
   */
  error: Error | null;
  /**
   * Orden del wizard en el flujo (usado para determinar antes/después)
   */
  wizardOrder: number;
  /**
   * Secciones habilitadas que vienen ANTES del wizard (order < wizardOrder)
   */
  sectionsBeforeWizard: SolicitarSection[];
  /**
   * Secciones habilitadas que vienen DESPUÉS del wizard (order > wizardOrder)
   */
  sectionsAfterWizard: SolicitarSection[];
  /**
   * True si hay secciones después del wizard (debe mostrarse /complementos)
   */
  shouldShowComplementos: boolean;
}

/**
 * Hook para obtener y manejar la configuración del flujo de solicitud
 *
 * @example
 * ```tsx
 * const { enabledSections, isEnabled, getPosition, isLoading } = useSolicitarFlow({
 *   slug: 'home',
 * });
 *
 * // Verificar si accesorios está habilitado
 * if (isEnabled('accessories')) {
 *   // Mostrar sección de accesorios
 * }
 *
 * // Obtener el orden de las secciones
 * enabledSections.forEach((section, index) => {
 *   console.log(`${section.type} está en posición ${index + 1}`);
 * });
 * ```
 */
export function useSolicitarFlow({
  slug,
  previewKey,
}: UseSolicitarFlowOptions): UseSolicitarFlowResult {
  const [config, setConfig] = useState<SolicitarFlowConfig>(DEFAULT_SOLICITAR_FLOW);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getSolicitarConfig(slug, previewKey);
        if (!cancelled) {
          setConfig(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Error loading config'));
          // Usar config por defecto en caso de error
          setConfig(DEFAULT_SOLICITAR_FLOW);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, [slug, previewKey]);

  const enabledSections = useMemo(() => getEnabledSections(config), [config]);

  const isEnabled = useMemo(
    () => (type: SolicitarSectionType) => isSectionEnabled(config, type),
    [config]
  );

  const getPosition = useMemo(
    () => (type: SolicitarSectionType): number | null => {
      const index = enabledSections.findIndex(s => s.type === type);
      return index >= 0 ? index + 1 : null;
    },
    [enabledSections]
  );

  // Obtener el orden del wizard (siempre está habilitado)
  const wizardOrder = useMemo(() => {
    const wizard = enabledSections.find(s => s.type === 'wizard_steps');
    return wizard?.order ?? 999;
  }, [enabledSections]);

  // Secciones que vienen ANTES del wizard
  const sectionsBeforeWizard = useMemo(
    () =>
      enabledSections
        .filter(s => s.type !== 'wizard_steps' && s.order < wizardOrder)
        .sort((a, b) => a.order - b.order),
    [enabledSections, wizardOrder]
  );

  // Secciones que vienen DESPUÉS del wizard
  const sectionsAfterWizard = useMemo(
    () =>
      enabledSections
        .filter(s => s.type !== 'wizard_steps' && s.order > wizardOrder)
        .sort((a, b) => a.order - b.order),
    [enabledSections, wizardOrder]
  );

  // Si hay secciones después del wizard, debe mostrarse /complementos
  const shouldShowComplementos = sectionsAfterWizard.length > 0;

  return {
    config,
    enabledSections,
    isEnabled,
    getPosition,
    isLoading,
    error,
    wizardOrder,
    sectionsBeforeWizard,
    sectionsAfterWizard,
    shouldShowComplementos,
  };
}

/**
 * Obtener la siguiente sección habilitada después de la actual
 */
export function getNextSection(
  enabledSections: SolicitarSection[],
  currentType: SolicitarSectionType
): SolicitarSectionType | null {
  const currentIndex = enabledSections.findIndex(s => s.type === currentType);
  if (currentIndex >= 0 && currentIndex < enabledSections.length - 1) {
    return enabledSections[currentIndex + 1].type;
  }
  return null;
}

/**
 * Obtener la sección anterior habilitada antes de la actual
 */
export function getPreviousSection(
  enabledSections: SolicitarSection[],
  currentType: SolicitarSectionType
): SolicitarSectionType | null {
  const currentIndex = enabledSections.findIndex(s => s.type === currentType);
  if (currentIndex > 0) {
    return enabledSections[currentIndex - 1].type;
  }
  return null;
}
