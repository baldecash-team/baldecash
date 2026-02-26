'use client';

/**
 * usePreviewListener - Hook para recibir datos de preview desde el admin
 *
 * Solo activo cuando:
 * 1. La URL tiene ?preview=true
 * 2. La página está en un iframe
 *
 * Uso:
 * const { previewData, isPreviewMode } = usePreviewListener();
 *
 * // Sobrescribir datos de API con datos de preview
 * const title = previewData?.hero?.title ?? apiData.title;
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

export interface PreviewPayload {
  hero?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaUrl?: string;
    backgroundUrl?: string;
    minQuota?: number;
    badgeText?: string;
    trustSignals?: Array<{
      icon: string;
      text: string;
      tooltip?: string;
      isVisible?: boolean;
    }>;
  };
  socialProof?: {
    enabled?: boolean;
    headline?: string;
    badgeText?: string;
    subtext?: string;
    studentCount?: number;
    institutions?: Array<{
      name: string;
      logo?: string;
      isVisible?: boolean;
    }>;
    testimonials?: Array<{
      name: string;
      institution?: string;
      career?: string;
      quote: string;
      rating?: number;
      image?: string;
      isVisible?: boolean;
    }>;
    stats?: Array<{
      value: string;
      label: string;
      icon?: string;
      isVisible?: boolean;
    }>;
  };
  howItWorks?: {
    enabled?: boolean;
    headline?: string;
    subtitle?: string;
    steps?: Array<{
      number: number;
      title: string;
      description: string;
      icon?: string;
      isVisible?: boolean;
    }>;
  };
  faq?: {
    enabled?: boolean;
    headline?: string;
    subtitle?: string;
    items?: Array<{
      question: string;
      answer: string;
      isVisible?: boolean;
    }>;
  };
  cta?: {
    enabled?: boolean;
    headline?: string;
    subtitle?: string;
    buttonText?: string;
    buttonUrl?: string;
    backgroundUrl?: string;
  };
  navbar?: {
    logoUrl?: string;
    logoAlt?: string;
    links?: Array<{
      label: string;
      href: string;
      isVisible?: boolean;
    }>;
    ctaText?: string;
    ctaUrl?: string;
  };
  footer?: {
    logoUrl?: string;
    description?: string;
    copyright?: string;
    links?: Array<{
      label: string;
      href: string;
      isVisible?: boolean;
    }>;
    socialLinks?: Array<{
      platform: string;
      url: string;
      isVisible?: boolean;
    }>;
  };
}

interface PreviewMessage {
  type: 'PREVIEW_UPDATE';
  payload: PreviewPayload;
  timestamp: number;
}

// Lista de orígenes permitidos (admin)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',      // Admin dev
  'http://localhost:3002',      // Admin alternate port
  'https://admin.baldecash.com', // Admin prod
];

function isAllowedOrigin(origin: string): boolean {
  // En desarrollo, permitir cualquier localhost
  if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
    return true;
  }
  return ALLOWED_ORIGINS.includes(origin);
}

function isInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    // Si hay error de seguridad, probablemente estamos en un iframe cross-origin
    return true;
  }
}

export function usePreviewListener() {
  const searchParams = useSearchParams();
  const [previewData, setPreviewData] = useState<PreviewPayload | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  // Determinar si estamos en modo preview
  useEffect(() => {
    const previewParam = searchParams.get('preview');
    const inIframe = isInIframe();

    // Activar modo preview si:
    // 1. URL tiene ?preview=true Y estamos en iframe, O
    // 2. URL tiene ?preview=true (para testing sin iframe)
    const shouldEnablePreview = previewParam === 'true';

    setIsPreviewMode(shouldEnablePreview);

    if (shouldEnablePreview) {
      console.log('[PreviewListener] Preview mode enabled', { inIframe });
    }
  }, [searchParams]);

  // Escuchar mensajes solo si estamos en modo preview
  const handleMessage = useCallback((event: MessageEvent) => {
    // Validar origen
    if (!isAllowedOrigin(event.origin)) {
      console.warn('[PreviewListener] Message from unauthorized origin:', event.origin);
      return;
    }

    // Validar tipo de mensaje
    const data = event.data as PreviewMessage;
    if (data?.type !== 'PREVIEW_UPDATE') {
      return;
    }

    // Validar que hay payload
    if (!data.payload) {
      console.warn('[PreviewListener] No payload in message');
      return;
    }

    console.log('[PreviewListener] Received preview update:', data.payload);
    setPreviewData(data.payload);
    setLastUpdate(data.timestamp);
  }, []);

  useEffect(() => {
    if (!isPreviewMode) {
      return;
    }

    console.log('[PreviewListener] Adding message listener');
    window.addEventListener('message', handleMessage);

    return () => {
      console.log('[PreviewListener] Removing message listener');
      window.removeEventListener('message', handleMessage);
    };
  }, [isPreviewMode, handleMessage]);

  return {
    previewData,
    isPreviewMode,
    lastUpdate,
  };
}
