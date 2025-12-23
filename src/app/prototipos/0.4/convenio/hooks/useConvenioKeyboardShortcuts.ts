'use client';

import { useEffect, useCallback, useState } from 'react';
import { ConvenioConfig, ConvenioVersion, versionDescriptions } from '../types/convenio';

type ComponentKey = 'navbar' | 'hero' | 'benefits' | 'testimonials' | 'faq' | 'cta' | 'footer';

interface UseConvenioKeyboardShortcutsOptions {
  config: ConvenioConfig;
  onConfigChange: (config: ConvenioConfig) => void;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
  isSettingsOpen: boolean;
  enabled?: boolean; // Disable all shortcuts when false (e.g., clean mode)
}

interface ShortcutToast {
  message: string;
  type: 'version' | 'navigation' | 'info';
}

const COMPONENT_ORDER: ComponentKey[] = [
  'navbar',
  'hero',
  'benefits',
  'testimonials',
  'faq',
  'cta',
  'footer',
];

const COMPONENT_CONFIG_MAP: Record<ComponentKey, keyof ConvenioConfig> = {
  navbar: 'navbarVersion',
  hero: 'heroVersion',
  benefits: 'benefitsVersion',
  testimonials: 'testimonialsVersion',
  faq: 'faqVersion',
  cta: 'ctaVersion',
  footer: 'footerVersion',
};

const COMPONENT_LABELS: Record<ComponentKey, string> = {
  navbar: 'Navbar',
  hero: 'Hero',
  benefits: 'Beneficios',
  testimonials: 'Testimonios',
  faq: 'FAQ',
  cta: 'CTA',
  footer: 'Footer',
};

export function useConvenioKeyboardShortcuts({
  config,
  onConfigChange,
  onOpenSettings,
  onCloseSettings,
  isSettingsOpen,
  enabled = true,
}: UseConvenioKeyboardShortcutsOptions) {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('hero');
  const [toast, setToast] = useState<ShortcutToast | null>(null);

  // Check if user is typing in an input field
  const isInputActive = useCallback(() => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;

    const tagName = activeElement.tagName.toLowerCase();
    const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    const isContentEditable = activeElement.getAttribute('contenteditable') === 'true';
    const isNextUIInput = activeElement.closest('[data-slot="input"]') !== null;

    return isInput || isContentEditable || isNextUIInput;
  }, []);

  // Show toast notification
  const showToast = useCallback((message: string, type: ShortcutToast['type'] = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Change component version
  const changeVersion = useCallback(
    (version: ConvenioVersion) => {
      const configKey = COMPONENT_CONFIG_MAP[activeComponent];
      const description = versionDescriptions[activeComponent as keyof typeof versionDescriptions]?.[version] || `V${version}`;

      onConfigChange({
        ...config,
        [configKey]: version,
      });

      showToast(`${COMPONENT_LABELS[activeComponent]}: ${description}`, 'version');
    },
    [activeComponent, config, onConfigChange, showToast]
  );

  // Navigate between components
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

      // Scroll to component section
      const sectionIds: Record<ComponentKey, string> = {
        navbar: 'top',
        hero: 'convenio-hero',
        benefits: 'convenio-benefits',
        testimonials: 'convenio-testimonials',
        faq: 'convenio-faq',
        cta: 'convenio-cta',
        footer: 'convenio-footer',
      };

      if (sectionIds[newComponent] === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(sectionIds[newComponent]);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    [activeComponent, showToast]
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip all shortcuts if disabled (clean mode)
      if (!enabled) return;

      // Skip if typing in input
      if (isInputActive()) return;

      // Escape - close modal
      if (e.key === 'Escape') {
        if (isSettingsOpen) {
          e.preventDefault();
          onCloseSettings();
        }
        return;
      }

      // ? or K - open settings
      if (e.key === '?' || (e.key === 'k' && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        if (isSettingsOpen) {
          onCloseSettings();
        } else {
          onOpenSettings();
        }
        return;
      }

      // Don't process other shortcuts if modal is open
      if (isSettingsOpen) return;

      // Tab navigation
      if (e.key === 'Tab') {
        e.preventDefault();
        navigateComponent(e.shiftKey ? 'prev' : 'next');
        return;
      }

      // Number keys 1-6
      if (/^[1-6]$/.test(e.key)) {
        e.preventDefault();
        const version = parseInt(e.key) as ConvenioVersion;
        changeVersion(version);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    isInputActive,
    isSettingsOpen,
    onOpenSettings,
    onCloseSettings,
    navigateComponent,
    changeVersion,
  ]);

  return {
    activeComponent,
    setActiveComponent,
    toast,
    shortcuts: [
      { key: '1-6', description: 'Cambiar versión del componente activo' },
      { key: 'Tab', description: 'Siguiente componente' },
      { key: 'Shift + Tab', description: 'Componente anterior' },
      { key: '? / K', description: 'Abrir/cerrar configuración' },
      { key: 'Esc', description: 'Cerrar modal' },
    ],
  };
}
