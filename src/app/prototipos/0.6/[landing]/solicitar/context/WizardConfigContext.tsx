'use client';

/**
 * WizardConfigContext - Provides form configuration from API
 * Fetches wizard config once per landing and provides it to all wizard steps
 */

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useMemo } from 'react';
import { usePathname } from 'next/navigation';
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
import { leerUuidDeSesionGuardado, sesionYaConvertida, useSessionOptional } from './SessionContext';
import { debeRenovarSesionAlEntrar } from '../utils/renovacionDeSesion';

// Respaldo: si a los 5s no apareció ningún uuid (ni en el contexto ni en
// storage), se pide el wizard igual para que la persona no se quede esperando
// para siempre. Se vuelve a leer storage en ese momento; solo si de verdad no
// hay uuid se pide sin sesión y el backend sirve el formulario principal.
const TIMEOUT_ESPERA_SESION_MS = 5000;

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
  badgeText: string | null;
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

/**
 * Decide si ya se puede pedir el wizard y con qué uuid de sesión.
 *
 * El backend elige el formulario con un hash del uuid: no necesita que la
 * sesión exista todavía. Por eso no se espera a la API de sesión; alcanza con
 * conocer el uuid, que está en el contexto o —antes— en storage, porque
 * `initSession` lo guarda ahí antes de llamar a la API.
 *
 * - Sin provider de sesión: se pide ya, sin sesión.
 * - Con uuid (contexto primero, storage después): se pide ya, con ese uuid.
 * - Sin uuid: se espera a que aparezca; agotada la espera se pide sin sesión.
 * - `renovacionPendiente`: el uuid conocido es de una sesión que ya envió una
 *   solicitud y el layout de `/solicitar` la va a soltar al montar. Pedir con
 *   él mostraría el formulario de la sesión vieja y se guardaría con el de la
 *   nueva, así que se espera al uuid nuevo.
 */
export function decidirPedidoDeWizard({
  haySesionProvider,
  sessionUuid,
  uuidGuardado,
  renovacionPendiente = false,
  esperaAgotada = false,
}: {
  haySesionProvider: boolean;
  sessionUuid: string | null;
  uuidGuardado: string | null;
  renovacionPendiente?: boolean;
  esperaAgotada?: boolean;
}): { pedir: boolean; uuid: string | null } {
  if (!haySesionProvider) return { pedir: true, uuid: null };

  const uuid = sessionUuid || uuidGuardado || null;
  if (esperaAgotada) return { pedir: true, uuid };
  if (!uuid || renovacionPendiente) return { pedir: false, uuid: null };
  return { pedir: true, uuid };
}

/**
 * Un pedido del wizard ya decidido. El uuid queda CAPTURADO acá: que la sesión
 * aparezca o cambie después no vuelve a pedir el wizard, porque eso cambiaría
 * el formulario bajo la persona a mitad del llenado.
 */
interface PedidoDeWizard {
  /** Identifica el formulario mostrado: slug + estado de preview. */
  clave: string;
  slug: string;
  previewLandingId: number | null;
  previewKey: string | null;
  uuid: string | null;
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

  // Con varios formularios por landing, el backend sirve el que le toca al
  // uuid de la sesión. Ver `decidirPedidoDeWizard`.
  const sesion = useSessionOptional();
  const haySesionProvider = sesion != null;
  const sessionUuid = sesion?.sessionUuid ?? null;
  // No se usa su valor: es la señal de que `initSession` arrancó y, por lo
  // tanto, de que el uuid ya está en storage aunque la API no haya respondido.
  const sesionCreandose = sesion?.isCreating ?? false;
  const pathname = usePathname();

  // Una sola carga por formulario mostrado: el wizard se vuelve a pedir solo
  // si cambia esta clave (slug o preview), nunca porque cambie la sesión.
  const clave = JSON.stringify([slug, isPreviewMode, previewLandingId, previewKey]);
  const [pedido, setPedido] = useState<PedidoDeWizard | null>(null);
  const yaPedido = pedido?.clave === clave;

  // El respaldo de 5s corre fuera del render: lee el uuid del contexto de acá.
  const sessionUuidRef = useRef(sessionUuid);
  useEffect(() => {
    sessionUuidRef.current = sessionUuid;
  }, [sessionUuid]);

  // Decide el pedido en cuanto hay con qué (wait for preview hydration).
  useEffect(() => {
    if (!isPreviewHydrated || yaPedido) return;

    const decision = decidirPedidoDeWizard({
      haySesionProvider,
      sessionUuid,
      uuidGuardado: leerUuidDeSesionGuardado(slug),
      renovacionPendiente: debeRenovarSesionAlEntrar(pathname) && sesionYaConvertida(slug),
    });
    if (!decision.pedir) return;

    setPedido((prev) =>
      prev?.clave === clave ? prev : { clave, slug, previewLandingId, previewKey, uuid: decision.uuid },
    );
  }, [
    clave,
    slug,
    previewLandingId,
    previewKey,
    isPreviewHydrated,
    yaPedido,
    haySesionProvider,
    sessionUuid,
    sesionCreandose,
    pathname,
  ]);

  // Respaldo por tiempo, solo mientras se espera un uuid.
  useEffect(() => {
    if (!isPreviewHydrated || yaPedido || !haySesionProvider) return;

    const timeoutId = setTimeout(() => {
      const decision = decidirPedidoDeWizard({
        haySesionProvider: true,
        sessionUuid: sessionUuidRef.current,
        uuidGuardado: leerUuidDeSesionGuardado(slug),
        esperaAgotada: true,
      });
      setPedido((prev) =>
        prev?.clave === clave ? prev : { clave, slug, previewLandingId, previewKey, uuid: decision.uuid },
      );
    }, TIMEOUT_ESPERA_SESION_MS);
    return () => clearTimeout(timeoutId);
  }, [clave, slug, previewLandingId, previewKey, isPreviewHydrated, yaPedido, haySesionProvider]);

  // Fetch wizard config: una vez por pedido. No depende de `sessionUuid`.
  useEffect(() => {
    if (!pedido) return;

    let isMounted = true;

    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let data: WizardConfig | null = null;

        if (pedido.previewLandingId && pedido.previewKey) {
          // Use preview API with ID and preview_key
          data = await getWizardConfigById(pedido.previewLandingId, pedido.previewKey, pedido.uuid);
          // Fallback to slug-based API with preview_key
          if (!data) {
            data = await getWizardConfig(pedido.slug, pedido.previewKey, pedido.uuid);
          }
        } else {
          data = await getWizardConfig(pedido.slug, null, pedido.uuid);
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
  }, [pedido]);

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

  // Display values: prefer the new root fields, fall back to legacy flat fields,
  // then compute from steps. The backend currently sends a hybrid payload.
  const displayStepsCount = useMemo(() => {
    if (typeof config?.total_steps === 'number') return config.total_steps;
    if (typeof config?.display_steps_count === 'number') return config.display_steps_count;
    return steps.filter(s => !s.is_summary_step).length;
  }, [config, steps]);

  const displayEstimatedMinutes = useMemo(() => {
    if (typeof config?.estimated_time_minutes === 'number') return config.estimated_time_minutes;
    if (typeof config?.display_estimated_minutes === 'number') return config.display_estimated_minutes;
    if (typeof config?.form?.estimated_time_minutes === 'number') return config.form.estimated_time_minutes;
    return steps.reduce((sum, s) => sum + (s.estimated_time_minutes || 0), 0);
  }, [config, steps]);

  const badgeText: string | null = config?.badge_text ?? null;

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
      badgeText,
    }),
    [config, isLoading, error, getStep, getStepByUrlSlug, getNavigation, getUrlSlugForStep, steps, displayStepsCount, displayEstimatedMinutes, badgeText]
  );

  return (
    <WizardConfigContext.Provider value={value}>
      {children}
    </WizardConfigContext.Provider>
  );
};

export default WizardConfigProvider;
