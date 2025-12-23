'use client';

import { useEffect, useCallback, useRef } from 'react';

export type ComponentVersion = 1 | 2 | 3 | 4 | 5 | 6;

export interface ShortcutConfig {
  /** Lista de IDs de componentes en orden de navegación (Tab/Shift+Tab) */
  componentOrder: string[];
  /** Callback cuando se cambia versión de un componente */
  onVersionChange: (componentId: string, version: ComponentVersion) => void;
  /** Callback cuando se navega a otro componente (Tab/Shift+Tab) */
  onNavigate?: (componentId: string, direction: 'next' | 'prev') => void;
  /** Callback cuando se presiona ? o K para abrir/cerrar modal */
  onToggleSettings?: () => void;
  /** Obtener la versión actual de un componente */
  getCurrentVersion: (componentId: string) => ComponentVersion;
  /** Está el modal abierto? Si true, desactiva shortcuts excepto Escape */
  isModalOpen?: boolean;
}

/**
 * Hook para manejar atajos de teclado en previews de prototipos
 *
 * ## Atajos disponibles:
 * - `1-6`: Cambiar versión del componente actual
 * - `Shift + 1-6`: Cambiar versión de subrayado (si aplica)
 * - `Tab`: Siguiente componente
 * - `Shift + Tab`: Componente anterior
 * - `?` o `K`: Abrir/cerrar modal de configuración
 * - `Escape`: Cerrar modal
 *
 * ## Uso:
 * ```tsx
 * useKeyboardShortcuts({
 *   componentOrder: ['navbar', 'hero', 'cta', 'footer'],
 *   onVersionChange: (id, version) => updateConfig(id, version),
 *   onToggleSettings: () => setModalOpen(prev => !prev),
 *   getCurrentVersion: (id) => config[id],
 *   isModalOpen: isSettingsOpen,
 * });
 * ```
 */
export function useKeyboardShortcuts({
  componentOrder,
  onVersionChange,
  onNavigate,
  onToggleSettings,
  getCurrentVersion,
  isModalOpen = false,
}: ShortcutConfig) {
  const currentComponentIndex = useRef(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key;
      const isShift = event.shiftKey;

      // Escape siempre cierra el modal
      if (key === 'Escape' && isModalOpen && onToggleSettings) {
        event.preventDefault();
        onToggleSettings();
        return;
      }

      // Si el modal está abierto, no procesar otros shortcuts
      if (isModalOpen) {
        return;
      }

      // ? o K - Toggle settings modal
      if ((key === '?' || key === 'k' || key === 'K') && onToggleSettings) {
        event.preventDefault();
        onToggleSettings();
        return;
      }

      // Tab - Navegación entre componentes
      if (key === 'Tab') {
        event.preventDefault();
        const direction = isShift ? 'prev' : 'next';
        if (isShift) {
          // Shift + Tab - Anterior
          currentComponentIndex.current =
            (currentComponentIndex.current - 1 + componentOrder.length) % componentOrder.length;
        } else {
          // Tab - Siguiente
          currentComponentIndex.current =
            (currentComponentIndex.current + 1) % componentOrder.length;
        }
        const newComponentId = componentOrder[currentComponentIndex.current];
        // Callback de navegación si está definido
        if (onNavigate) {
          onNavigate(newComponentId, direction);
        }
        return;
      }

      // 1-6 - Cambiar versión
      const numKey = parseInt(key, 10);
      if (numKey >= 1 && numKey <= 6) {
        event.preventDefault();
        const componentId = componentOrder[currentComponentIndex.current];

        if (componentId) {
          onVersionChange(componentId, numKey as ComponentVersion);
          console.log(`[Shortcuts] ${componentId} → V${numKey}`);
        }
        return;
      }
    },
    [componentOrder, onVersionChange, onNavigate, onToggleSettings, isModalOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    currentComponentIndex: currentComponentIndex.current,
    currentComponent: componentOrder[currentComponentIndex.current],
    setCurrentComponent: (id: string) => {
      const index = componentOrder.indexOf(id);
      if (index !== -1) {
        currentComponentIndex.current = index;
      }
    },
  };
}

export default useKeyboardShortcuts;
