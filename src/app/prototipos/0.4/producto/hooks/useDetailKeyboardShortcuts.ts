'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { ProductDetailConfig, DetailVersion, versionDescriptions } from '../types/detail';

type ComponentKey = 'infoHeader' | 'gallery' | 'pricing' | 'certifications' | 'tabs' | 'specs' | 'cronograma' | 'similarProducts' | 'limitations';

interface UseDetailKeyboardShortcutsOptions {
  config: ProductDetailConfig;
  onConfigChange: (config: ProductDetailConfig) => void;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
  isSettingsOpen: boolean;
}

interface ShortcutToast {
  message: string;
  type: 'version' | 'navigation' | 'info';
}

const COMPONENT_ORDER: ComponentKey[] = [
  'gallery',
  'infoHeader',
  'pricing',
  'certifications',
  'tabs',
  'specs',
  'cronograma',
  'similarProducts',
  'limitations',
];

const COMPONENT_CONFIG_MAP: Record<ComponentKey, keyof ProductDetailConfig> = {
  infoHeader: 'infoHeaderVersion',
  gallery: 'galleryVersion',
  tabs: 'tabsVersion',
  specs: 'specsVersion',
  pricing: 'pricingVersion',
  cronograma: 'cronogramaVersion',
  similarProducts: 'similarProductsVersion',
  limitations: 'limitationsVersion',
  certifications: 'certificationsVersion',
};

const COMPONENT_LABELS: Record<ComponentKey, string> = {
  infoHeader: 'Info Header',
  gallery: 'Galeria',
  tabs: 'Tabs',
  specs: 'Especificaciones',
  pricing: 'Calculadora',
  cronograma: 'Cronograma',
  similarProducts: 'Similares',
  limitations: 'Limitaciones',
  certifications: 'Certificaciones',
};

const SECTION_IDS: Record<ComponentKey, string> = {
  gallery: 'section-gallery',
  infoHeader: 'section-info',
  pricing: 'section-pricing',
  certifications: 'section-certifications',
  tabs: 'section-tabs',
  specs: 'section-specs',
  cronograma: 'section-cronograma',
  similarProducts: 'section-similar',
  limitations: 'section-limitations',
};

export function useDetailKeyboardShortcuts({
  config,
  onConfigChange,
  onOpenSettings,
  onCloseSettings,
  isSettingsOpen,
}: UseDetailKeyboardShortcutsOptions) {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('gallery');
  const [toast, setToast] = useState<ShortcutToast | null>(null);
  const lastScrolledComponent = useRef<ComponentKey | null>(null);

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

  // Scroll to component section
  const scrollToComponent = useCallback((component: ComponentKey) => {
    const sectionId = SECTION_IDS[component];
    const element = document.getElementById(sectionId);

    if (element) {
      // Cancel any previous scroll
      lastScrolledComponent.current = component;

      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // Change component version
  const changeVersion = useCallback(
    (version: DetailVersion) => {
      const configKey = COMPONENT_CONFIG_MAP[activeComponent];
      const descriptions = versionDescriptions[activeComponent as keyof typeof versionDescriptions];
      const description = descriptions?.[version] || `V${version}`;

      onConfigChange({
        ...config,
        [configKey]: version,
      });

      showToast(`${COMPONENT_LABELS[activeComponent]}: V${version}`, 'version');

      // Scroll to the component after version change
      setTimeout(() => {
        scrollToComponent(activeComponent);
      }, 100);
    },
    [activeComponent, config, onConfigChange, showToast, scrollToComponent]
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

      // Scroll to the new component
      setTimeout(() => {
        scrollToComponent(newComponent);
      }, 50);
    },
    [activeComponent, showToast, scrollToComponent]
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

      // ? or K or S - open settings
      if (e.key === '?' || e.key === 'k' || e.key === 's') {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          if (isSettingsOpen) {
            onCloseSettings();
          } else {
            onOpenSettings();
          }
        }
        return;
      }

      // Don't process other shortcuts if modal is open
      if (isSettingsOpen) return;

      // O - toggle overlays (handled by parent)
      if (e.key === 'o') {
        return; // Let parent handle this
      }

      // Tab navigation
      if (e.key === 'Tab') {
        e.preventDefault();
        navigateComponent(e.shiftKey ? 'prev' : 'next');
        return;
      }

      // Number keys 1-6
      if (/^[1-6]$/.test(e.key)) {
        e.preventDefault();
        const version = parseInt(e.key) as DetailVersion;
        changeVersion(version);
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
  ]);

  return {
    activeComponent,
    setActiveComponent,
    toast,
    COMPONENT_LABELS,
    shortcuts: [
      { key: '1-6', description: 'Cambiar version del componente activo' },
      { key: 'Tab', description: 'Siguiente componente' },
      { key: 'Shift + Tab', description: 'Componente anterior' },
      { key: 'S / K / ?', description: 'Abrir/cerrar configuracion' },
      { key: 'Esc', description: 'Cerrar modal' },
    ],
  };
}
