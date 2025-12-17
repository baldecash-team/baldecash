'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ComponentVersion, SettingsGroup } from '../types/config.types';

interface UseSectionSettingsReturn {
  settings: Record<string, ComponentVersion>;
  updateSetting: (componentId: string, version: ComponentVersion) => void;
  resetToDefaults: () => void;
  hasChanges: boolean;
  applySettings: () => void;
}

const STORAGE_KEY_PREFIX = 'baldecash_section_settings_';

/**
 * Hook para manejar settings de una sección específica
 * Permite preview en tiempo real antes de guardar
 *
 * @param sectionName - Nombre de la sección (ej: "hero", "catalogo")
 * @param prototypeVersion - Versión del prototipo (ej: "0.3")
 * @param defaultSettings - Configuración por defecto de la sección
 * @param onApply - Callback cuando se aplican los cambios
 */
export function useSectionSettings(
  sectionName: string,
  prototypeVersion: string,
  defaultSettings: Record<string, ComponentVersion>,
  onApply?: (settings: Record<string, ComponentVersion>) => void
): UseSectionSettingsReturn {
  const storageKey = `${STORAGE_KEY_PREFIX}${prototypeVersion}_${sectionName}`;

  // Estado inicial: cargar de localStorage o usar defaults
  const [settings, setSettings] = useState<Record<string, ComponentVersion>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });

  const [initialSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Detectar cambios
  useEffect(() => {
    const changed = Object.keys(settings).some(
      (key) => settings[key] !== initialSettings[key]
    );
    setHasChanges(changed);
  }, [settings, initialSettings]);

  // Actualizar un setting individual
  const updateSetting = useCallback(
    (componentId: string, version: ComponentVersion) => {
      setSettings((prev) => {
        const updated = { ...prev, [componentId]: version };
        // Guardar en localStorage para persistencia de preview
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    },
    [storageKey]
  );

  // Resetear a valores por defecto
  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
  }, [defaultSettings, storageKey]);

  // Aplicar settings (confirmar cambios)
  const applySettings = useCallback(() => {
    if (onApply) {
      onApply(settings);
    }
    // Aquí se podría hacer más lógica como guardar en config.json
  }, [settings, onApply]);

  return {
    settings,
    updateSetting,
    resetToDefaults,
    hasChanges,
    applySettings,
  };
}

/**
 * Genera los grupos de settings para el modal basado en la configuración
 */
export function generateSettingsGroups(
  sectionType: 'hero' | 'catalogo' | 'wizard' | 'results',
  currentSettings: Record<string, ComponentVersion>
): SettingsGroup[] {
  const sectionGroups: Record<string, SettingsGroup[]> = {
    hero: [
      {
        id: 'brandIdentity',
        label: 'Brand Identity',
        currentVersion: currentSettings.brandIdentity ?? 1,
        options: [
          { value: 1, label: 'V1 - Centrado', description: 'Logo + tagline centrado' },
          { value: 2, label: 'V2 - Lateral', description: 'Logo lateral + mensaje' },
          { value: 3, label: 'V3 - Minimalista', description: 'Logo minimalista' },
        ],
      },
      {
        id: 'profileIdentification',
        label: 'Profile Identification',
        currentVersion: currentSettings.profileIdentification ?? 1,
        options: [
          { value: 1, label: 'V1 - Modal', description: 'Modal centrado al entrar' },
          { value: 2, label: 'V2 - Cards', description: 'Cards integradas en hero' },
          { value: 3, label: 'V3 - Banner', description: 'Banner sticky superior' },
          { value: 4, label: 'V4 - Sin friccion', description: 'Sin seccion (directo)' },
        ],
      },
      {
        id: 'socialProof',
        label: 'Social Proof',
        currentVersion: currentSettings.socialProof ?? 1,
        options: [
          { value: 1, label: 'V1 - Marquee', description: 'Logos en movimiento' },
          { value: 2, label: 'V2 - Grid', description: 'Todos los logos visibles' },
          { value: 3, label: 'V3 - Contador', description: 'Contador + logos destacados' },
        ],
      },
      {
        id: 'navbar',
        label: 'Navbar',
        currentVersion: currentSettings.navbar ?? 1,
        options: [
          { value: 1, label: 'V1 - Sticky solido', description: 'Siempre visible con fondo' },
          { value: 2, label: 'V2 - Hide/Show', description: 'Se oculta al bajar' },
          { value: 3, label: 'V3 - Transparente', description: 'Transparente a solido' },
        ],
      },
      {
        id: 'heroCta',
        label: 'Hero CTA',
        currentVersion: currentSettings.heroCta ?? 1,
        options: [
          { value: 1, label: 'V1 - Ver laptops', description: 'Accion directa al catalogo' },
          { value: 2, label: 'V2 - Precio', description: 'Desde S/49/mes - Solicitar' },
          { value: 3, label: 'V3 - Monto', description: 'Descubre tu monto disponible' },
        ],
      },
    ],
    catalogo: [
      {
        id: 'layout',
        label: 'Layout',
        currentVersion: currentSettings.layout ?? 1,
        options: [
          { value: 1, label: 'V1 - Sidebar', description: 'Sidebar 280px izquierdo' },
          { value: 2, label: 'V2 - Horizontal', description: 'Filtros horizontales arriba' },
          { value: 3, label: 'V3 - Drawer', description: 'Mobile-first con drawer' },
        ],
      },
      {
        id: 'brandFilter',
        label: 'Filtro de Marcas',
        currentVersion: currentSettings.brandFilter ?? 1,
        options: [
          { value: 1, label: 'V1 - Texto', description: 'Solo texto con checkbox' },
          { value: 2, label: 'V2 - Logo + Texto', description: 'Logo pequeno + texto' },
          { value: 3, label: 'V3 - Grid logos', description: 'Grid de logos clickeables' },
        ],
      },
      {
        id: 'cardEnfoque',
        label: 'Enfoque de Card',
        currentVersion: currentSettings.cardEnfoque ?? 1,
        options: [
          { value: 1, label: 'V1 - Tecnico', description: 'Specs prominentes' },
          { value: 2, label: 'V2 - Beneficios', description: 'Uso recomendado' },
          { value: 3, label: 'V3 - Hibrido', description: 'Specs + beneficios' },
        ],
      },
      {
        id: 'badgePosition',
        label: 'Posicion Badges',
        currentVersion: currentSettings.badgePosition ?? 1,
        options: [
          { value: 1, label: 'V1 - Esquina', description: 'Esquina superior overlay' },
          { value: 2, label: 'V2 - Arriba', description: 'Fila arriba de imagen' },
          { value: 3, label: 'V3 - Ribbon', description: 'Ribbon diagonal' },
        ],
      },
      {
        id: 'hoverBehavior',
        label: 'Comportamiento Hover',
        currentVersion: currentSettings.hoverBehavior ?? 1,
        options: [
          { value: 1, label: 'V1 - Descripcion', description: 'Muestra descripcion' },
          { value: 2, label: 'V2 - Specs', description: 'Muestra specs adicionales' },
          { value: 3, label: 'V3 - Estatico', description: 'Solo scale sutil' },
        ],
      },
    ],
    wizard: [
      {
        id: 'layout',
        label: 'Layout Wizard',
        currentVersion: currentSettings.layout ?? 1,
        options: [
          { value: 1, label: 'V1 - Fullscreen', description: 'Pagina completa sin header' },
          { value: 2, label: 'V2 - Header min', description: 'Header minimalista' },
          { value: 3, label: 'V3 - Progress', description: 'Header + progress sticky' },
        ],
      },
      {
        id: 'progress',
        label: 'Indicador Progreso',
        currentVersion: currentSettings.progress ?? 1,
        options: [
          { value: 1, label: 'V1 - Pasos', description: 'Paso 2 de 5' },
          { value: 2, label: 'V2 - Barra', description: 'Barra con porcentaje' },
          { value: 3, label: 'V3 - Dots', description: 'Dots con labels' },
        ],
      },
      {
        id: 'celebration',
        label: 'Micro-celebraciones',
        currentVersion: currentSettings.celebration ?? 1,
        options: [
          { value: 1, label: 'V1 - Confetti', description: 'Confetti sutil' },
          { value: 2, label: 'V2 - Checkmark', description: 'Checkmark animado' },
          { value: 3, label: 'V3 - Sin', description: 'Transicion suave' },
        ],
      },
    ],
    results: [
      {
        id: 'approval',
        label: 'Pantalla Aprobacion',
        currentVersion: currentSettings.approval ?? 1,
        options: [
          { value: 1, label: 'V1 - Confetti', description: 'Confetti + ilustracion' },
          { value: 2, label: 'V2 - Ilustracion', description: 'Solo ilustracion' },
          { value: 3, label: 'V3 - Checkmark', description: 'Checkmark animado' },
        ],
      },
      {
        id: 'rejection',
        label: 'Pantalla Rechazo',
        currentVersion: currentSettings.rejection ?? 1,
        options: [
          { value: 1, label: 'V1 - Neutro', description: 'Colores neutros' },
          { value: 2, label: 'V2 - Calido', description: 'Colores calidos' },
          { value: 3, label: 'V3 - Marca', description: 'Marca suavizada' },
        ],
      },
    ],
  };

  return sectionGroups[sectionType] ?? [];
}

export default useSectionSettings;
