'use client';

import { useEffect, useCallback, useState } from 'react';
import { HeroConfig, HeroVersion, UnderlineStyle, versionDescriptions } from '../types/hero';

type ComponentKey = 'heroBanner' | 'socialProof' | 'navbar' | 'cta' | 'footer' | 'howItWorks' | 'faq';

interface UseKeyboardShortcutsOptions {
  config: HeroConfig;
  onConfigChange: (config: HeroConfig) => void;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
  isSettingsOpen: boolean;
}

interface ShortcutToast {
  message: string;
  type: 'version' | 'underline' | 'navigation' | 'info';
}

const COMPONENT_ORDER: ComponentKey[] = [
  'navbar',
  'heroBanner',
  'socialProof',
  'howItWorks',
  'cta',
  'faq',
  'footer',
];

const COMPONENT_CONFIG_MAP: Record<ComponentKey, keyof HeroConfig> = {
  navbar: 'navbarVersion',
  heroBanner: 'heroBannerVersion',
  socialProof: 'socialProofVersion',
  howItWorks: 'howItWorksVersion',
  cta: 'ctaVersion',
  faq: 'faqVersion',
  footer: 'footerVersion',
};

const COMPONENT_LABELS: Record<ComponentKey, string> = {
  navbar: 'Navbar',
  heroBanner: 'Hero Banner',
  socialProof: 'Social Proof',
  howItWorks: 'Cómo Funciona',
  cta: 'CTA',
  faq: 'FAQ',
  footer: 'Footer',
};

export function useKeyboardShortcuts({
  config,
  onConfigChange,
  onOpenSettings,
  onCloseSettings,
  isSettingsOpen,
}: UseKeyboardShortcutsOptions) {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('heroBanner');
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
    (version: HeroVersion) => {
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

  // Change underline style
  const changeUnderlineStyle = useCallback(
    (style: UnderlineStyle) => {
      const description = versionDescriptions.underline[style];
      onConfigChange({
        ...config,
        underlineStyle: style,
      });
      showToast(`Subrayado: ${description}`, 'underline');
    },
    [config, onConfigChange, showToast]
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
        heroBanner: 'top',
        socialProof: 'social-proof',
        howItWorks: 'como-funciona',
        cta: 'cta',
        faq: 'faq',
        footer: 'footer',
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
        const version = parseInt(e.key) as HeroVersion;

        if (e.shiftKey) {
          // Shift + 1-6: Change underline style
          changeUnderlineStyle(version as UnderlineStyle);
        } else {
          // 1-6: Change active component version
          changeVersion(version);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isInputActive,
    isSettingsOpen,
    onOpenSettings,
    onCloseSettings,
    navigateComponent,
    changeVersion,
    changeUnderlineStyle,
  ]);

  return {
    activeComponent,
    setActiveComponent,
    toast,
    shortcuts: [
      { key: '1-6', description: 'Cambiar versión del componente activo' },
      { key: 'Shift + 1-6', description: 'Cambiar estilo de subrayado' },
      { key: 'Tab', description: 'Siguiente componente' },
      { key: 'Shift + Tab', description: 'Componente anterior' },
      { key: '? / K', description: 'Abrir/cerrar configuración' },
      { key: 'Esc', description: 'Cerrar modal' },
    ],
  };
}
