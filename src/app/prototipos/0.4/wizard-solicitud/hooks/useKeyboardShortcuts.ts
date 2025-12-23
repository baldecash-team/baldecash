'use client';

import { useEffect, useCallback, useState } from 'react';
import { WizardSolicitudConfig } from '../types/wizard-solicitud';

type ComponentKey = 'wizardLayout' | 'progress' | 'navigation' | 'celebration' | 'input' | 'options' | 'upload' | 'header' | 'hero' | 'cta';

interface UseKeyboardShortcutsOptions {
  config: WizardSolicitudConfig;
  onConfigChange: (config: WizardSolicitudConfig) => void;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
  isSettingsOpen: boolean;
  onOpenQuickSwitcher?: () => void;
  onCloseQuickSwitcher?: () => void;
  isQuickSwitcherOpen?: boolean;
}

interface ShortcutToast {
  message: string;
  type: 'version' | 'navigation' | 'info';
}

const COMPONENT_ORDER: ComponentKey[] = [
  'header',
  'hero',
  'cta',
  'wizardLayout',
  'progress',
  'navigation',
  'celebration',
  'input',
  'options',
  'upload',
];

const COMPONENT_CONFIG_MAP: Record<ComponentKey, keyof WizardSolicitudConfig> = {
  header: 'headerVersion',
  hero: 'heroVersion',
  cta: 'ctaVersion',
  wizardLayout: 'wizardLayoutVersion',
  progress: 'progressVersion',
  navigation: 'navigationVersion',
  celebration: 'celebrationVersion',
  input: 'inputVersion',
  options: 'optionsVersion',
  upload: 'uploadVersion',
};

const COMPONENT_LABELS: Record<ComponentKey, string> = {
  header: 'Header (B.1)',
  hero: 'Hero (B.5)',
  cta: 'CTA (B.6)',
  wizardLayout: 'Layout (C.1)',
  progress: 'Progreso (C.5)',
  navigation: 'Navegación (C.14)',
  celebration: 'Celebración (C.20)',
  input: 'Input+Label (C1.1+C1.4)',
  options: 'Opciones (C1.13)',
  upload: 'Upload (C1.15)',
};

export function useKeyboardShortcuts({
  config,
  onConfigChange,
  onOpenSettings,
  onCloseSettings,
  isSettingsOpen,
  onOpenQuickSwitcher,
  onCloseQuickSwitcher,
  isQuickSwitcherOpen = false,
}: UseKeyboardShortcutsOptions) {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('wizardLayout');
  const [toast, setToast] = useState<ShortcutToast | null>(null);

  const isInputActive = useCallback(() => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    const tagName = activeElement.tagName.toLowerCase();
    const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    const isContentEditable = activeElement.getAttribute('contenteditable') === 'true';
    const isNextUIInput = activeElement.closest('[data-slot="input"]') !== null;
    return isInput || isContentEditable || isNextUIInput;
  }, []);

  const showToast = useCallback((message: string, type: ShortcutToast['type'] = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const changeVersion = useCallback(
    (version: 1 | 2 | 3 | 4 | 5 | 6) => {
      const configKey = COMPONENT_CONFIG_MAP[activeComponent];
      onConfigChange({
        ...config,
        [configKey]: version,
      });
      showToast(`${COMPONENT_LABELS[activeComponent]}: V${version}`, 'version');
    },
    [activeComponent, config, onConfigChange, showToast]
  );

  const navigateComponent = useCallback(
    (direction: 'next' | 'prev') => {
      const currentIndex = COMPONENT_ORDER.indexOf(activeComponent);
      let newIndex: number;

      if (direction === 'next') {
        newIndex = (currentIndex + 1) % COMPONENT_ORDER.length;
      } else {
        newIndex = currentIndex === 0 ? COMPONENT_ORDER.length - 1 : currentIndex - 1;
      }

      const newComponent = COMPONENT_ORDER[newIndex];
      setActiveComponent(newComponent);
      showToast(`Componente: ${COMPONENT_LABELS[newComponent]}`, 'navigation');
    },
    [activeComponent, showToast]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputActive()) return;

      if (e.key === 'Escape') {
        if (isSettingsOpen) {
          e.preventDefault();
          onCloseSettings();
        }
        if (isQuickSwitcherOpen && onCloseQuickSwitcher) {
          e.preventDefault();
          onCloseQuickSwitcher();
        }
        return;
      }

      // C key - Quick Switcher
      if (e.key === 'c' || e.key === 'C') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          if (isQuickSwitcherOpen && onCloseQuickSwitcher) {
            onCloseQuickSwitcher();
          } else if (onOpenQuickSwitcher) {
            onOpenQuickSwitcher();
          }
          return;
        }
      }

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (isSettingsOpen) {
          onCloseSettings();
        } else {
          onOpenSettings();
        }
        return;
      }

      if (isSettingsOpen) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        navigateComponent(e.shiftKey ? 'prev' : 'next');
        return;
      }

      if (/^[1-6]$/.test(e.key)) {
        e.preventDefault();
        const version = parseInt(e.key) as 1 | 2 | 3 | 4 | 5 | 6;
        changeVersion(version);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isInputActive,
    isSettingsOpen,
    isQuickSwitcherOpen,
    onOpenSettings,
    onCloseSettings,
    onOpenQuickSwitcher,
    onCloseQuickSwitcher,
    navigateComponent,
    changeVersion,
  ]);

  return {
    activeComponent,
    setActiveComponent,
    toast,
    componentLabel: COMPONENT_LABELS[activeComponent],
  };
}

export default useKeyboardShortcuts;
