'use client';

/**
 * useScreenshot - Hook para capturar screenshots con modern-screenshot
 * Captura SOLO el viewport visible (no toda la página)
 * Usado por FeedbackButton en mode=clean
 *
 * Usa modern-screenshot en lugar de html2canvas porque soporta
 * funciones de color modernas como lab(), oklch(), etc.
 *
 * Maneja:
 * - Elementos sticky (convertidos a fixed, EXCEPTO sidebars/aside)
 * - Scroll interno (solo con atributo data-scroll-fix explícito)
 *
 * Limitaciones:
 * - Sidebars sticky (<aside>) no se modifican para evitar romper layout
 * - Scroll interno en sidebars no se captura correctamente
 */

import { useState, useCallback } from 'react';
import { domToJpeg } from 'modern-screenshot';

// Tipo para elementos sticky que necesitan restauración
interface StickyElementFix {
  type: 'sticky';
  el: HTMLElement;
  originalPosition: string;
  originalTop: string;
  originalLeft: string;
  originalWidth: string;
}

// Tipo para elementos con scroll interno que necesitan restauración
interface ScrollElementFix {
  type: 'scroll';
  el: HTMLElement;
  wrapper: HTMLElement;
  originalScrollTop: number;
}

type ElementFix = StickyElementFix | ScrollElementFix;

export function useScreenshot() {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    setIsCapturing(true);

    // Guardar elementos que necesitan restauración
    const elementsToFix: ElementFix[] = [];

    try {
      // 1. Manejar elementos con scroll interno (overflow-y: auto/scroll)
      // Esto debe hacerse ANTES de sticky para que el contenido se desplace correctamente
      document.querySelectorAll('*').forEach((el) => {
        if (el instanceof HTMLElement) {
          const computed = getComputedStyle(el);
          const overflowY = computed.overflowY;

          // Detectar elementos con scroll interno que están scrolleados
          // Solo aplicar a elementos dentro de aside/nav (sidebars), no al contenido principal
          if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollTop > 0) {
            // No modificar elementos de feedback
            if (
              el.hasAttribute('data-feedback-button') ||
              el.hasAttribute('data-feedback-overlay') ||
              el.closest('[data-feedback-button]') ||
              el.closest('[data-feedback-overlay]')
            ) {
              return;
            }

            // Solo aplicar a elementos con data-scroll-fix explícito
            // NO aplicar automáticamente a sidebars porque interfiere con el fix de sticky
            if (!el.hasAttribute('data-scroll-fix')) {
              return;
            }

            const currentScrollTop = el.scrollTop;

            // Crear wrapper temporal para todos los hijos
            const wrapper = document.createElement('div');
            wrapper.style.transform = `translateY(-${currentScrollTop}px)`;

            // Mover todos los hijos al wrapper
            while (el.firstChild) {
              wrapper.appendChild(el.firstChild);
            }
            el.appendChild(wrapper);

            elementsToFix.push({
              type: 'scroll',
              el,
              wrapper,
              originalScrollTop: currentScrollTop,
            });

            // Resetear scrollTop
            el.scrollTop = 0;
          }
        }
      });

      // 2. Convertir elementos sticky a fixed para que se capturen correctamente
      document.querySelectorAll('*').forEach((el) => {
        if (el instanceof HTMLElement) {
          const computed = getComputedStyle(el);
          const position = computed.position;

          if (position === 'sticky') {
            // No modificar elementos de feedback
            if (
              el.hasAttribute('data-feedback-button') ||
              el.hasAttribute('data-feedback-overlay') ||
              el.closest('[data-feedback-button]') ||
              el.closest('[data-feedback-overlay]')
            ) {
              return;
            }

            // Solo convertir sticky a fixed para elementos que NO son aside/sidebars
            // Los sidebars causan problemas de layout al convertirlos
            if (el.tagName.toLowerCase() === 'aside' || el.closest('aside')) {
              return;
            }

            // Obtener la posición visual actual del elemento sticky
            const rect = el.getBoundingClientRect();

            elementsToFix.push({
              type: 'sticky',
              el,
              originalPosition: position,
              originalTop: el.style.top,
              originalLeft: el.style.left,
              originalWidth: el.style.width,
            });

            // Convertir a fixed compensando el transform del body
            el.style.position = 'fixed';
            el.style.top = `${rect.top + window.scrollY}px`;
            el.style.left = `${rect.left}px`;
            el.style.width = `${rect.width}px`;
          }
        }
      });

      // 3. Capturar el viewport visible
      const dataUrl = await domToJpeg(document.body, {
        quality: 0.8,
        scale: 1,
        width: window.innerWidth,
        height: window.innerHeight,
        style: {
          transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`,
        },
        // Excluir elementos de feedback del screenshot
        filter: (node) => {
          if (node instanceof HTMLElement) {
            if (
              node.hasAttribute('data-feedback-button') ||
              node.hasAttribute('data-feedback-overlay') ||
              node.closest('[data-feedback-button]') ||
              node.closest('[data-feedback-overlay]')
            ) {
              return false;
            }
          }
          return true;
        },
      });

      return dataUrl;
    } catch (error) {
      console.error('Error capturando screenshot:', error);
      return null;
    } finally {
      // Restaurar todos los elementos modificados
      elementsToFix.forEach((fix) => {
        if (fix.type === 'sticky') {
          fix.el.style.position = fix.originalPosition;
          fix.el.style.top = fix.originalTop;
          fix.el.style.left = fix.originalLeft;
          fix.el.style.width = fix.originalWidth;
        } else if (fix.type === 'scroll') {
          // Mover hijos de vuelta al contenedor original
          while (fix.wrapper.firstChild) {
            fix.el.appendChild(fix.wrapper.firstChild);
          }
          // Eliminar wrapper temporal
          fix.wrapper.remove();
          // Restaurar scroll
          fix.el.scrollTop = fix.originalScrollTop;
        }
      });
      setIsCapturing(false);
    }
  }, []);

  return { captureScreenshot, isCapturing };
}
