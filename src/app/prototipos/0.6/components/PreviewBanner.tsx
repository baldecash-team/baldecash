'use client';

/**
 * PreviewBanner - Shows a fixed banner when in preview mode
 * Used across all pages to indicate preview state
 */

import React from 'react';
import { Eye, X } from 'lucide-react';
import { usePreview } from '../context/PreviewContext';

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
  const { isPreviewMode, landingId: contextLandingId, clearPreviewMode, isPreviewingLanding } = usePreview();

  // For admin preview pages that pass landingId directly, always show the banner
  // For regular pages with landingSlug, only show if that specific landing is being previewed
  const shouldShow = propLandingId
    ? true  // Admin preview page with explicit landingId - always show
    : landingSlug
      ? isPreviewingLanding(landingSlug)  // Regular page - check if this landing is being previewed
      : isPreviewMode;  // Fallback - show if any preview is active (legacy behavior)

  // Use prop landingId for admin pages, context landingId for regular pages
  const displayLandingId = propLandingId ?? contextLandingId;
  const displayText = stepName || pageName;

  if (!shouldShow) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-xs text-center py-1 font-medium flex items-center justify-center gap-2">
      <Eye className="w-3.5 h-3.5" />
      <span>
        Modo Preview (ID: {displayLandingId})
        {displayText && <span className="ml-1">- {displayText}</span>}
      </span>
      {showCloseButton && (
        <button
          onClick={clearPreviewMode}
          className="ml-2 p-0.5 hover:bg-amber-600 rounded transition-colors"
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
