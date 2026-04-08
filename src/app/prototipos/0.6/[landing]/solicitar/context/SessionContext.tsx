'use client';

/**
 * SessionContext - Tracking session management for the wizard
 *
 * Creates and persists a tracking session UUID that links:
 * - Page views and navigation events
 * - Form step progress
 * - Final application submission
 *
 * The session is created on first wizard visit and persists across
 * page reloads until the application is submitted or abandoned.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

// Dynamic storage key based on landing slug
const getSessionKey = (landing: string) => `baldecash-${landing}-wizard-session-uuid`;

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

interface SessionContextValue {
  /** The tracking session UUID */
  sessionUuid: string | null;
  /** Whether the session has been initialized */
  isInitialized: boolean;
  /** Whether the session creation is in progress */
  isCreating: boolean;
  /** Initialize or retrieve existing session */
  initSession: (landingSlug: string) => Promise<string | null>;
  /** Clear the session (on successful submission or manual reset) */
  clearSession: () => void;
  /** Get the session ID (backend ID, not UUID) */
  sessionId: number | null;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

/**
 * Optional version that returns null if no Provider is present.
 * Useful for components that may be rendered outside the provider.
 */
export const useSessionOptional = () => {
  return useContext(SessionContext);
};

interface SessionProviderProps {
  children: ReactNode;
  landingSlug: string;
}

/**
 * Generates a UUID v4
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get device type from user agent
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile';
  if (/tablet|ipad/.test(ua)) return 'tablet';
  return 'desktop';
}

/**
 * Get browser info
 */
function getBrowserInfo(): { browser: string; browserVersion: string } {
  if (typeof window === 'undefined') {
    return { browser: 'unknown', browserVersion: '' };
  }

  const ua = navigator.userAgent;
  let browser = 'unknown';
  let browserVersion = '';

  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    browserVersion = match?.[1] || '';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    browserVersion = match?.[1] || '';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    browserVersion = match?.[1] || '';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
    const match = ua.match(/Edg\/(\d+)/);
    browserVersion = match?.[1] || '';
  }

  return { browser, browserVersion };
}

/**
 * Extract UTM params from URL
 */
function getUtmParams(): Record<string, string | undefined> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
}

/**
 * Get referrer info
 */
function getReferrerInfo(): { referrer_url?: string; referrer_domain?: string } {
  if (typeof document === 'undefined' || !document.referrer) {
    return {};
  }

  try {
    const url = new URL(document.referrer);
    return {
      referrer_url: document.referrer,
      referrer_domain: url.hostname,
    };
  } catch {
    return { referrer_url: document.referrer };
  }
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  landingSlug,
}) => {
  const [sessionUuid, setSessionUuid] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Memoize storage key based on landing
  const sessionKey = useMemo(() => getSessionKey(landingSlug), [landingSlug]);

  /**
   * Create a new tracking session via API with retry logic
   */
  const createSession = useCallback(
    async (uuid: string, slug: string): Promise<{ uuid: string; id: number } | null> => {
      // Ensure we're in the browser
      if (typeof window === 'undefined') {
        return null;
      }

      const { browser, browserVersion } = getBrowserInfo();
      const utmParams = getUtmParams();
      const referrer = getReferrerInfo();

      const payload = {
        landing_slug: slug,
        uuid,
        device_type: getDeviceType(),
        browser,
        browser_version: browserVersion,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        ...utmParams,
        ...referrer,
      };

      // Retry logic: 3 attempts with increasing delay
      const maxRetries = 3;
      const delays = [0, 500, 1500]; // ms: immediate, 0.5s, 1.5s

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Wait before retry (skip delay on first attempt)
          if (delays[attempt] > 0) {
            await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
          }

          const response = await fetch(`${API_BASE_URL}/public/tracking/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            // Only log on final attempt
            if (attempt === maxRetries - 1) {
              console.error('Failed to create tracking session:', response.status);
            }
            continue;
          }

          const data = await response.json();
          return {
            uuid: data.session_uuid,
            id: data.session_id,
          };
        } catch (error) {
          // Only log error on final attempt to avoid noise
          if (attempt === maxRetries - 1) {
            console.error('Error creating tracking session after retries:', error);
          }
          // Continue to next retry
        }
      }

      return null;
    },
    []
  );

  /**
   * Initialize or retrieve existing session.
   *
   * Always calls the API to ensure session exists in backend.
   * The backend endpoint is idempotent: creates new or recovers existing.
   */
  const initSession = useCallback(
    async (slug: string): Promise<string | null> => {
      // Already initialized in this instance
      if (sessionUuid && isInitialized) {
        return sessionUuid;
      }

      setIsCreating(true);

      try {
        // Get UUID from localStorage or generate new one
        const existingUuid =
          typeof window !== 'undefined'
            ? localStorage.getItem(sessionKey)
            : null;

        const uuid = existingUuid || generateUUID();

        // ALWAYS call API (creates new or recovers existing session)
        const result = await createSession(uuid, slug);

        if (result) {
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(sessionKey, result.uuid);
          }
          setSessionUuid(result.uuid);
          setSessionId(result.id);
          setIsInitialized(true);
          return result.uuid;
        }

        // API failed — use local UUID as fallback so event tracking still works.
        // Events will be sent with this UUID; the backend batch endpoint may
        // accept them or they'll simply be lost, but the client-side tracking
        // (scroll, page_enter, etc.) will still fire.
        console.warn('[Session] API unavailable — using local UUID for tracking');
        if (typeof window !== 'undefined') {
          localStorage.setItem(sessionKey, uuid);
        }
        setSessionUuid(uuid);
        setIsInitialized(true);
        return uuid;
      } finally {
        setIsCreating(false);
      }
    },
    [sessionUuid, isInitialized, createSession, sessionKey]
  );

  /**
   * Clear the session
   */
  const clearSession = useCallback(() => {
    setSessionUuid(null);
    setSessionId(null);
    setIsInitialized(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(sessionKey);
    }
  }, [sessionKey]);

  // Lazy session: do NOT auto-initialize on mount.
  // Session is created on-demand when initSession() is called
  // (e.g., when user navigates to the application form).
  // EventTracker guards all hooks with `if (!sessionUuid) return`
  // so it works safely without a session on landing pages.

  return (
    <SessionContext.Provider
      value={{
        sessionUuid,
        isInitialized,
        isCreating,
        initSession,
        clearSession,
        sessionId,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
