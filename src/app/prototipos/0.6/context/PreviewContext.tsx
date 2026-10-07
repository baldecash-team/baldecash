'use client';

/**
 * PreviewContext - Global preview mode state
 * Persists preview credentials in sessionStorage so navigation between pages
 * maintains access to draft/unpublished landings.
 *
 * Flow:
 * 1. User visits /preview/6?preview_key=KEY
 * 2. PreviewPageClient calls setPreviewMode(6, "KEY", "slug")
 * 3. User navigates to /slug/catalogo
 * 4. LayoutContext reads preview state and uses getLandingLayoutById instead of by slug
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'baldecash-preview-mode';

interface PreviewState {
  landingId: number;
  previewKey: string;
  slug: string;
  activatedAt: number; // Timestamp to expire old sessions
  /** Formulario a mirar (vista previa del borrador desde el panel, BAL-4484). */
  formId?: number | null;
  /** Ver lo guardado que todavía no se publica. */
  borrador?: boolean;
}

/** Opciones de la vista previa del borrador de un formulario. */
export interface OpcionesDePreview {
  formId?: number | null;
  borrador?: boolean;
}

interface PreviewContextValue {
  /** Whether preview mode is active */
  isPreviewMode: boolean;
  /** Whether sessionStorage has been read */
  isHydrated: boolean;
  /** Landing ID being previewed */
  landingId: number | null;
  /** Preview key for API authentication */
  previewKey: string | null;
  /** Landing slug for URL building */
  slug: string | null;
  /** Formulario a mirar en la vista previa del borrador (o null) */
  formId: number | null;
  /** Si se está mirando el borrador del formulario (lo no publicado) */
  borrador: boolean;
  /** Activate preview mode with credentials */
  setPreviewMode: (landingId: number, previewKey: string, slug: string, opciones?: OpcionesDePreview) => void;
  /** Deactivate preview mode */
  clearPreviewMode: () => void;
  /** Check if a specific landing is being previewed */
  isPreviewingLanding: (landingSlug: string) => boolean;
}

const PreviewContext = createContext<PreviewContextValue | null>(null);

// Preview mode expires after 2 hours of inactivity
const PREVIEW_EXPIRY_MS = 2 * 60 * 60 * 1000;

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PreviewState = JSON.parse(stored);

        // Check if preview has expired
        const now = Date.now();
        if (now - parsed.activatedAt < PREVIEW_EXPIRY_MS) {
          setPreviewState(parsed);
        } else {
          // Expired - clear it
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('[PreviewContext] Error loading preview state:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save state to sessionStorage when it changes
  useEffect(() => {
    if (!isHydrated) return;

    try {
      if (previewState) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(previewState));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('[PreviewContext] Error saving preview state:', error);
    }
  }, [previewState, isHydrated]);

  const setPreviewMode = useCallback(
    (landingId: number, previewKey: string, slug: string, opciones?: OpcionesDePreview) => {
      setPreviewState({
        landingId,
        previewKey,
        slug,
        activatedAt: Date.now(),
        formId: opciones?.formId ?? null,
        borrador: !!opciones?.borrador,
      });
    },
    [],
  );

  const clearPreviewMode = useCallback(() => {
    setPreviewState(null);
  }, []);

  const isPreviewingLanding = useCallback((landingSlug: string): boolean => {
    if (!previewState) return false;
    return previewState.slug === landingSlug;
  }, [previewState]);

  const value = useMemo((): PreviewContextValue => ({
    isPreviewMode: !!previewState,
    isHydrated,
    landingId: previewState?.landingId ?? null,
    previewKey: previewState?.previewKey ?? null,
    slug: previewState?.slug ?? null,
    formId: previewState?.formId ?? null,
    borrador: !!previewState?.borrador,
    setPreviewMode,
    clearPreviewMode,
    isPreviewingLanding,
  }), [previewState, isHydrated, setPreviewMode, clearPreviewMode, isPreviewingLanding]);

  return (
    <PreviewContext.Provider value={value}>
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
}

/**
 * Hook to check if current landing is in preview mode
 * Safe to use outside PreviewProvider (returns false)
 */
export function useIsPreviewMode(landingSlug?: string): boolean {
  const context = useContext(PreviewContext);
  if (!context) return false;
  if (!landingSlug) return context.isPreviewMode;
  return context.isPreviewingLanding(landingSlug);
}

export default PreviewContext;
