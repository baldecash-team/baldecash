'use client';

/**
 * Landing Layout
 * Provides shared layout data (navbar, footer, company) to all pages under [landing]
 * Also wraps with SessionProvider + EventTrackerProvider so behavioral tracking
 * starts from the first page the user visits (home, catálogo, producto, etc.)
 *
 * VipAccessGuard: redirects to landing home if whitelist is enabled but no VIP token.
 * Protects /catalogo, /producto, /solicitar and all sub-routes.
 */

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { LayoutProvider } from './context/LayoutContext';
import { SessionProvider } from './solicitar/context/SessionContext';
import { EventTrackerProvider } from './solicitar/context/EventTrackerContext';
import { getVipToken, getVipName } from '../components/hero/DniModal';
import { VipCountdownOverlay } from '../components/hero/VipCountdownOverlay';
import { fetchLandingConfig } from '../services/landingConfigApi';
import { routes } from '../utils/routes';

/**
 * Persists ?keepData=true from URL to sessionStorage.
 * Used for testing: prevents form/product cleanup after submit.
 */
function KeepDataFlag() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const value = searchParams.get('keepData');
    if (value === 'true') {
      sessionStorage.setItem('keepData', 'true');
    } else if (value === 'false') {
      sessionStorage.removeItem('keepData');
    }
  }, [searchParams]);
  return null;
}

/**
 * VipGate - Combined access guard + welcome overlay.
 * 1. Fetches landing config once.
 * 2. If whitelist is enabled and no token → redirects to landing home (blocks render).
 * 3. If user just validated (name in localStorage) → shows welcome overlay on top of children.
 * 4. Otherwise → renders children normally.
 */
function VipGate({ landing, children }: { landing: string; children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'redirecting'>('loading');
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState<{ firstName: string } | null>(null);
  const [countdownDate, setCountdownDate] = useState('');

  useEffect(() => {
    fetchLandingConfig(landing).then((cfg) => {
      const hasWhitelist = cfg.features.has_dni_whitelist;
      const vipCountdown = cfg.features.vip_countdown;

      if (hasWhitelist && !getVipToken(landing)) {
        setStatus('redirecting');
        router.replace(routes.landingHome(landing));
        return;
      }

      // Check if welcome overlay should show (user just validated)
      if (hasWhitelist) {
        const name = getVipName(landing);
        if (name) {
          setWelcomeName(name);
          setShowWelcome(true);
          setCountdownDate(vipCountdown);
        }
      }

      setStatus('allowed');
    });
  }, [landing, router]);

  const handleDismiss = () => {
    setShowWelcome(false);
    try {
      localStorage.removeItem(`baldecash-vip-name-${landing}`);
    } catch {}
  };

  // Block render while checking access or redirecting
  if (status !== 'allowed') return null;

  return (
    <>
      {children}
      {showWelcome && countdownDate && (
        <VipCountdownOverlay
          onOpenDniModal={() => {}}
          endDate={countdownDate}
          onExpired={handleDismiss}
          welcomeData={welcomeName}
        />
      )}
    </>
  );
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  return (
    <LayoutProvider>
      <SessionProvider landingSlug={landing}>
        <EventTrackerProvider>
          <Suspense>
            <KeepDataFlag />
          </Suspense>
          <VipGate landing={landing}>
            {children}
          </VipGate>
        </EventTrackerProvider>
      </SessionProvider>
    </LayoutProvider>
  );
}
