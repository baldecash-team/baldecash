'use client';

/**
 * PreviewBanner - Shows a fixed banner when in preview mode
 * Used across all pages to indicate preview state
 */

import React from 'react';
import { Eye, X } from 'lucide-react';
import { usePreview } from '../context/PreviewContext';

interface PreviewBannerProps {
  /** Additional text to show (e.g., page name) */
  pageName?: string;
  /** Whether to show the close button */
  showCloseButton?: boolean;
}

export function PreviewBanner({ pageName, showCloseButton = true }: PreviewBannerProps) {
  const { isPreviewMode, landingId, clearPreviewMode } = usePreview();

  if (!isPreviewMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-xs text-center py-1 font-medium flex items-center justify-center gap-2">
      <Eye className="w-3.5 h-3.5" />
      <span>
        Modo Preview (ID: {landingId})
        {pageName && <span className="ml-1">- {pageName}</span>}
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
