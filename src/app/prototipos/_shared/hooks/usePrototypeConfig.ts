'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  PrototypeConfig,
  ComponentVersion,
  ComponentConfig,
  SectionConfig
} from '../types/config.types';

interface UsePrototypeConfigReturn {
  config: PrototypeConfig | null;
  isLoading: boolean;
  error: string | null;
  getComponentVersion: (section: string, component: string) => ComponentVersion;
  updateComponentVersion: (
    section: string,
    component: string,
    version: ComponentVersion,
    notes?: string
  ) => void;
  isSectionEnabled: (section: string) => boolean;
  saveConfig: () => Promise<void>;
  reloadConfig: () => Promise<void>;
}

const STORAGE_KEY_PREFIX = 'baldecash_prototype_config_';

/**
 * Hook para manejar la configuración de un prototipo específico
 * @param prototypeVersion - Versión del prototipo (ej: "0.3")
 */
export function usePrototypeConfig(prototypeVersion: string): UsePrototypeConfigReturn {
  const [config, setConfig] = useState<PrototypeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `${STORAGE_KEY_PREFIX}${prototypeVersion}`;

  // Cargar configuración
  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Primero intentar cargar de localStorage (para cambios no guardados)
      const localConfig = localStorage.getItem(storageKey);
      if (localConfig) {
        setConfig(JSON.parse(localConfig));
        setIsLoading(false);
        return;
      }

      // Si no hay en localStorage, intentar cargar del archivo config.json
      const response = await fetch(`/prototipos/${prototypeVersion}/config.json`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        localStorage.setItem(storageKey, JSON.stringify(data));
      } else {
        // Si no existe, crear configuración por defecto
        console.warn(`No config found for prototype ${prototypeVersion}`);
        setConfig(null);
      }
    } catch (err) {
      setError(`Error loading config: ${err}`);
      console.error('Error loading prototype config:', err);
    } finally {
      setIsLoading(false);
    }
  }, [prototypeVersion, storageKey]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Obtener versión de un componente específico
  const getComponentVersion = useCallback(
    (section: string, component: string): ComponentVersion => {
      if (!config?.sections) return 1;

      const sectionConfig = config.sections[section as keyof typeof config.sections];
      if (!sectionConfig?.components) return 1;

      const componentConfig = (sectionConfig.components as Record<string, ComponentConfig>)[component];
      return componentConfig?.version ?? 1;
    },
    [config]
  );

  // Actualizar versión de un componente
  const updateComponentVersion = useCallback(
    (section: string, component: string, version: ComponentVersion, notes?: string) => {
      if (!config) return;

      const updatedConfig = { ...config };
      const sectionConfig = updatedConfig.sections[section as keyof typeof updatedConfig.sections];

      if (sectionConfig?.components) {
        const components = sectionConfig.components as Record<string, ComponentConfig>;
        components[component] = {
          version,
          notes: notes ?? components[component]?.notes,
          updatedAt: new Date().toISOString(),
        };
        sectionConfig.lastUpdated = new Date().toISOString();
      }

      updatedConfig.updatedAt = new Date().toISOString();
      setConfig(updatedConfig);
      localStorage.setItem(storageKey, JSON.stringify(updatedConfig));
    },
    [config, storageKey]
  );

  // Verificar si una sección está habilitada
  const isSectionEnabled = useCallback(
    (section: string): boolean => {
      if (!config?.sections) return false;
      const sectionConfig = config.sections[section as keyof typeof config.sections];
      return sectionConfig?.enabled ?? false;
    },
    [config]
  );

  // Guardar configuración (podría ser a una API en el futuro)
  const saveConfig = useCallback(async () => {
    if (!config) return;

    try {
      // Por ahora solo guardamos en localStorage
      localStorage.setItem(storageKey, JSON.stringify(config));

      // En producción, aquí iría la llamada a la API
      // await fetch(`/api/prototypes/${prototypeVersion}/config`, {
      //   method: 'PUT',
      //   body: JSON.stringify(config)
      // });

      console.log('Config saved successfully');
    } catch (err) {
      setError(`Error saving config: ${err}`);
      throw err;
    }
  }, [config, storageKey]);

  // Recargar configuración desde el origen
  const reloadConfig = useCallback(async () => {
    localStorage.removeItem(storageKey);
    await loadConfig();
  }, [storageKey, loadConfig]);

  return {
    config,
    isLoading,
    error,
    getComponentVersion,
    updateComponentVersion,
    isSectionEnabled,
    saveConfig,
    reloadConfig,
  };
}

export default usePrototypeConfig;
