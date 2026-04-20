'use client';

/**
 * PreviewBanner - Shows a fixed banner when in preview mode
 * Used across all pages to indicate preview state
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import { Eye, X } from 'lucide-react';
import { usePreview } from '../context/PreviewContext';
import { routes } from '@/app/prototipos/0.6/utils/routes';

interface PreviewBannerProps {
  /** Current landing slug - only show banner if this matches the previewed landing */
  landingSlug?: string;
  /** Direct landing ID for admin preview pages (e.g., /preview-wizard) */
  landingId?: number;
  /** Additional text to show (e.g., page name) */
  pageName?: string;
  /** Step name for wizard preview */
  stepName?: string;
  /** Whether to show the close button */
  showCloseButton?: boolean;
}

export function PreviewBanner({ landingSlug, landingId: propLandingId, pageName, stepName, showCloseButton = true }: PreviewBannerProps) {
  const { isPreviewMode, landingId: contextLandingId, slug: contextSlug, clearPreviewMode, isPreviewingLanding } = usePreview();
  const pathname = usePathname();

  // For admin preview pages that pass landingId directly, always show the banner
  // For regular pages with landingSlug, only show if that specific landing is being previewed
  const shouldShow = propLandingId
    ? true  // Admin preview page with explicit landingId - always show
    : landingSlug
      ? isPreviewingLanding(landingSlug)  // Regular page - check if this landing is being previewed
      : isPreviewMode;  // Fallback - show if any preview is active (legacy behavior)

  // Display landing name: use prop slug, context slug, or fallback to ID
  const displayLandingName = landingSlug || contextSlug;
  const displayText = stepName || pageName || 'Los cambios se muestran en tiempo real';

  if (!shouldShow) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] bg-amber-500 text-white text-xs text-center py-1 font-medium flex items-center justify-center gap-2">
      <Eye className="w-3.5 h-3.5" />
      <span>
        Modo Preview (Landing: {displayLandingName})
        {displayText && <span className="ml-1">- {displayText}</span>}
      </span>
      {showCloseButton && (
        <button
          onClick={() => {
            clearPreviewMode();
            // On /preview/ pages, redirect to the landing slug instead of reload
            // (reload would re-activate preview from the ?preview_key= query param)
            const isPreviewPage = pathname.includes('/preview/');
            const targetSlug = contextSlug || landingSlug;
            if (isPreviewPage && targetSlug) {
              window.location.href = routes.landingHome(targetSlug);
            } else {
              window.location.reload();
            }
          }}
          className="ml-2 p-0.5 hover:bg-amber-600 rounded transition-colors cursor-pointer"
          title="Salir del modo preview"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/**
 * Hook to get preview banner offset for layout adjustments
 */
export function usePreviewBannerOffset(): number {
  const { isPreviewMode } = usePreview();
  return isPreviewMode ? 24 : 0; // Banner height is 24px
}

export default PreviewBanner;
