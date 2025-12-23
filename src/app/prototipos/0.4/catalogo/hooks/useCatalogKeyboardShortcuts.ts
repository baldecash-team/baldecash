'use client';

import { useEffect, useCallback, useState } from 'react';
import { CatalogLayoutConfig } from '../types/catalog';

type ComponentKey = 'layout' | 'brandFilter' | 'card' | 'technicalFilters' | 'skeleton' | 'loadMore' | 'imageGallery' | 'gallerySize' | 'tagDisplay';

interface UseCatalogKeyboardShortcutsOptions {
  config: CatalogLayoutConfig;
  onConfigChange: (config: CatalogLayoutConfig) => void;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
  isSettingsOpen: boolean;
}

interface ShortcutToast {
  message: string;
  type: 'version' | 'navigation' | 'info';
}

const COMPONENT_ORDER: ComponentKey[] = [
  'layout',
  'brandFilter',
  'card',
  'technicalFilters',
  'skeleton',
  'loadMore',
  'imageGallery',
  'gallerySize',
  'tagDisplay',
];

const COMPONENT_CONFIG_MAP: Record<ComponentKey, keyof CatalogLayoutConfig> = {
  layout: 'layoutVersion',
  brandFilter: 'brandFilterVersion',
  card: 'cardVersion',
  technicalFilters: 'technicalFiltersVersion',
  skeleton: 'skeletonVersion',
  loadMore: 'loadMoreVersion',
  imageGallery: 'imageGalleryVersion',
  gallerySize: 'gallerySizeVersion',
  tagDisplay: 'tagDisplayVersion',
};

const COMPONENT_LABELS: Record<ComponentKey, string> = {
  layout: 'Layout',
  brandFilter: 'Filtro Marca',
  card: 'Product Card',
  technicalFilters: 'Filtros Técnicos',
  skeleton: 'Skeleton',
  loadMore: 'Load More',
  imageGallery: 'Galería',
  gallerySize: 'Tamaño Galería',
  tagDisplay: 'Tags',
};

// Components with max version 3 (instead of 6)
const MAX_VERSION_3: ComponentKey[] = ['technicalFilters', 'skeleton', 'loadMore', 'imageGallery', 'gallerySize', 'tagDisplay'];

const VERSION_DESCRIPTIONS: Record<ComponentKey, Record<number, string>> = {
  layout: {
    1: 'Sidebar Clásico',
    2: 'Panel Flotante',
    3: 'Mobile-First Drawer',
    4: 'Quick Cards + Sidebar',
    5: 'Split 50/50 Preview',
    6: 'Centrado Sticky',
  },
  brandFilter: {
    1: 'Solo Texto',
    2: 'Logo + Texto',
    3: 'Grid de Logos',
    4: 'Carousel de Logos',
    5: 'Dropdown con Logos',
    6: 'Chips Seleccionables',
  },
  card: {
    1: 'Enfoque Técnico',
    2: 'Enfoque Beneficios',
    3: 'Híbrido Flat',
    4: 'Abstracto Flotante',
    5: 'Split 50/50',
    6: 'Centrado Impacto',
  },
  technicalFilters: {
    1: 'Checkboxes Clásicos',
    2: 'Chips Compactos',
    3: 'Cards con Iconos',
  },
  skeleton: {
    1: 'Pulse Simple',
    2: 'Shimmer Wave',
    3: 'Gradient Flow',
  },
  loadMore: {
    1: 'Minimal Line',
    2: 'Progress Bar',
    3: 'Gradient CTA',
  },
  imageGallery: {
    1: 'Dots Carousel',
    2: 'Thumbnails',
    3: 'Arrow Navigation',
  },
  gallerySize: {
    1: 'Compact',
    2: 'Standard',
    3: 'Expanded',
  },
  tagDisplay: {
    1: 'Pills Simples',
    2: 'Chips con Iconos',
    3: 'Tags Compactos',
  },
};

export function useCatalogKeyboardShortcuts({
  config,
  onConfigChange,
  onOpenSettings,
  onCloseSettings,
  isSettingsOpen,
}: UseCatalogKeyboardShortcutsOptions) {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('layout');
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

  // Get max version for current component
  const getMaxVersion = useCallback((component: ComponentKey) => {
    return MAX_VERSION_3.includes(component) ? 3 : 6;
  }, []);

  // Change component version
  const changeVersion = useCallback(
    (version: number) => {
      const maxVersion = getMaxVersion(activeComponent);
      if (version > maxVersion) {
        showToast(`${COMPONENT_LABELS[activeComponent]} solo tiene ${maxVersion} versiones`, 'info');
        return;
      }

      const configKey = COMPONENT_CONFIG_MAP[activeComponent];
      const description = VERSION_DESCRIPTIONS[activeComponent]?.[version] || `V${version}`;

      onConfigChange({
        ...config,
        [configKey]: version,
      });

      showToast(`${COMPONENT_LABELS[activeComponent]}: ${description}`, 'version');
    },
    [activeComponent, config, onConfigChange, showToast, getMaxVersion]
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
      const maxVersion = getMaxVersion(newComponent);
      setActiveComponent(newComponent);
      showToast(`${COMPONENT_LABELS[newComponent]} (1-${maxVersion})`, 'navigation');
    },
    [activeComponent, showToast, getMaxVersion]
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

      // S or K - open settings
      if ((e.key === 's' || e.key === 'S' || e.key === 'k' || e.key === 'K') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (isSettingsOpen) {
          onCloseSettings();
        } else {
          onOpenSettings();
        }
        return;
      }

      // ? - show shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        showToast('Tab: navegar | 1-6: versión | S: config', 'info');
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
        const version = parseInt(e.key);
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
    showToast,
  ]);

  return {
    activeComponent,
    setActiveComponent,
    toast,
    getMaxVersion,
    shortcuts: [
      { key: '1-6', description: 'Cambiar versión del componente activo' },
      { key: 'Tab', description: 'Siguiente componente' },
      { key: 'Shift + Tab', description: 'Componente anterior' },
      { key: 'S / K', description: 'Abrir/cerrar configuración' },
      { key: '?', description: 'Mostrar ayuda de atajos' },
      { key: 'Esc', description: 'Cerrar modal' },
    ],
  };
}
