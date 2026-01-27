'use client';

/**
 * useHomeConfig - Hook para cargar configuración dinámica del Home
 * v0.6 - Integración con Backend
 * Endpoint: GET /api/landings/slug/{slug}/hero
 */

import { useState, useEffect, useCallback } from 'react';
import { HomeConfig, HomeConfigState, HeroConfig, HeroAPIResponse } from '../types/home';
import { mockHomeConfig, mockHomeConfigUPN } from '../data/mockHomeConfig';

// Endpoint base desde .env (incluye /api/v1/)
// Ejemplo: http://localhost:8001/api/v1/
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1/';

// Flag para usar mock data durante desarrollo
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Color primario por defecto (BaldeCash brand)
const DEFAULT_PRIMARY_COLOR = '#4654CD';

interface UseHomeConfigOptions {
  /** Slug de la landing (ej: 'upn', 'upc', 'general') */
  slug?: string;
  /** Forzar uso de mock data */
  useMock?: boolean;
  /** Tiempo de espera para fetch en ms */
  timeout?: number;
  /** Reintentar en caso de error */
  retryOnError?: boolean;
  /** Número máximo de reintentos */
  maxRetries?: number;
}

/**
 * Transforma la respuesta cruda del API en HeroConfig
 * TODOS los campos son configurables desde el backend
 */
function transformAPIResponse(apiResponse: HeroAPIResponse): HeroConfig {
  return {
    // Textos principales
    title: apiResponse.title,
    subtitle: apiResponse.subtitle,
    badge_text: apiResponse.badge_text,

    // Precio (soporta ambos formatos)
    price: apiResponse.price,
    min_quota: apiResponse.min_quota,

    // Visual
    image_url: apiResponse.image_url,
    background_url: apiResponse.background_url,
    background_color: apiResponse.background_color,

    // CTAs
    cta: apiResponse.cta,
    secondary_cta: apiResponse.secondary_cta,

    // Trust signals
    trust_signals: apiResponse.trust_signals,

    // Promo bar
    promo_bar: apiResponse.promo_bar,

    // Branding (usa valores del backend o defaults)
    branding: apiResponse.branding || {
      primary_color: DEFAULT_PRIMARY_COLOR,
      accent_color: '#03DBD0',
    },

    // Legacy
    offer: apiResponse.offer,
    landing: apiResponse.landing,
  };
}

/**
 * Transforma la respuesta del hero en la configuración completa del home
 */
function transformHeroToHomeConfig(hero: HeroConfig): HomeConfig {
  // Si hay offer, habilitar navbar offer
  const hasOffer = hero.offer !== null;

  return {
    hero,
    navbarOffer: hasOffer && hero.offer
      ? {
          enabled: true,
          badge: hero.offer.badge,
          badge_color: hero.offer.badge_color,
          badge_bg_color: hero.offer.badge_bg_color,
          text: hero.offer.text,
          text_color: hero.offer.text_color,
          linkText: hero.cta.text,
          linkUrl: hero.cta.url,
          backgroundColor: hero.branding.primary_color,
        }
      : {
          enabled: false,
          text: '',
        },
  };
}

export function useHomeConfig(options: UseHomeConfigOptions = {}) {
  const {
    slug = 'default',
    useMock = USE_MOCK_DATA,
    timeout = 10000,
    retryOnError = true,
    maxRetries = 3,
  } = options;

  const [state, setState] = useState<HomeConfigState>({
    config: null,
    isLoading: true,
    error: null,
  });

  const [retryCount, setRetryCount] = useState(0);

  const fetchConfig = useCallback(async (): Promise<HomeConfig> => {
    // Usar mock data si está configurado
    if (useMock) {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Retornar mock según el slug
      if (slug === 'upn') {
        return mockHomeConfigUPN;
      }
      return mockHomeConfig;
    }

    // Fetch real al backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // API_BASE_URL ya incluye /api/v1/ (ej: http://localhost:8001/api/v1/)
      const url = `${API_BASE_URL.replace(/\/$/, '')}/landings/slug/${slug}/hero`;
      const response = await fetch(
        url,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData: HeroAPIResponse = await response.json();

      // Transformar respuesta del API a HeroConfig con branding
      const heroConfig = transformAPIResponse(apiData);

      // Transformar a configuración completa del home
      return transformHeroToHomeConfig(heroConfig);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Tiempo de espera agotado');
        }
        throw error;
      }

      throw new Error('Error desconocido al cargar configuración');
    }
  }, [useMock, slug, timeout]);

  const loadConfig = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const config = await fetchConfig();
      setState({
        config,
        isLoading: false,
        error: null,
      });
      setRetryCount(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Reintentar si está habilitado y no hemos alcanzado el límite
      if (retryOnError && retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(loadConfig, delay);
      }
    }
  }, [fetchConfig, retryOnError, retryCount, maxRetries]);

  // Cargar configuración al montar o cuando cambie el slug
  useEffect(() => {
    loadConfig();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para recargar manualmente
  const refresh = useCallback(() => {
    setRetryCount(0);
    loadConfig();
  }, [loadConfig]);

  return {
    ...state,
    refresh,
    retryCount,
    slug,
  };
}

export default useHomeConfig;
