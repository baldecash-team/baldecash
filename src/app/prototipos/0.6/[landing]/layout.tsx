'use client';

/**
 * Landing Layout
 * Provides shared layout data (navbar, footer, company) to all pages under [landing]
 * Also wraps with SessionProvider + EventTrackerProvider so behavioral tracking
 * starts from the first page the user visits (home, catálogo, producto, etc.)
 *
 * VipAccessGuard: blocks content if whitelist is enabled but no VIP token.
 * Protects /catalogo, /producto, /solicitar and all sub-routes.
 */

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { LayoutProvider } from './context/LayoutContext';
import { SessionProvider } from './solicitar/context/SessionContext';
import { EventTrackerProvider } from './solicitar/context/EventTrackerContext';
import { DniModal, getVipToken, getVipName, consumeVipWelcomePending, saveVipToken, saveVipName } from '../components/hero/DniModal';
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

// ── Shared DNI validation logic ───────────────────────────────────────────

const DOC_MIN_LENGTH = 8;
const DOC_MAX_LENGTH = 12;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

function useDniValidation(landing: string, onValidated: () => void) {
  const [dni, setDni] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValidDni = dni.length >= DOC_MIN_LENGTH && /^\d{8,12}$/.test(dni);

  const handleChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, DOC_MAX_LENGTH);
    setDni(cleaned);
    if (errorMsg) setErrorMsg(null);
  }, [errorMsg]);

  const handleSubmit = useCallback(async () => {
    if (!isValidDni || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/public/landing/${encodeURIComponent(landing)}/validate-dni/${dni}`,
      );
      const data = await res.json();
      if (!data.valid) {
        setErrorMsg('No encontramos un registro con este DNI.');
        setSubmitting(false);
        return;
      }
      if (data.access_token) saveVipToken(landing, data.access_token);
      if (data.first_name) saveVipName(landing, data.first_name);
      onValidated();
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.');
      setSubmitting(false);
    }
  }, [isValidDni, submitting, landing, dni, onValidated]);

  return { dni, isValidDni, submitting, errorMsg, handleChange, handleSubmit };
}

// ── Default inline DNI gate ───────────────────────────────────────────────

function InlineDniGate({ landing, onValidated }: { landing: string; onValidated: () => void }) {
  const { dni, isValidDni, submitting, errorMsg, handleChange, handleSubmit } = useDniValidation(landing, onValidated);

  return (
    <div
      className="fixed inset-0 z-[10001] flex flex-col items-center justify-center"
      style={{
        background: `
          radial-gradient(circle at 50% 30%, rgba(255,255,255,0.12) 0%, transparent 60%),
          radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)
        `,
        backgroundSize: '100% 100%, 18px 18px',
        backgroundColor: '#4654CD',
      }}
    >
      <img
        src="https://baldecash.s3.amazonaws.com/company/logo-vip-v2.png"
        alt="BaldeCash"
        className="h-24 sm:h-32 md:h-40 w-auto mb-8 sm:mb-12"
      />

      <div
        className="max-w-md w-full mx-4 rounded-3xl p-6 sm:p-8 text-center"
        style={{
          background: 'rgba(55, 65, 160, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <p className="text-white text-sm sm:text-base leading-relaxed mb-5">
          Ingresa tu número de documento para acceder al contenido exclusivo.
        </p>

        <DniInputRow
          dni={dni}
          isValidDni={isValidDni}
          submitting={submitting}
          errorMsg={errorMsg}
          onChange={handleChange}
          onSubmit={handleSubmit}
          accentColor="#E5A823"
          textColor="#4654CD"
        />
      </div>
    </div>
  );
}

// ── CADE overlay gate ─────────────────────────────────────────────────────

function CadeOverlayGate({ landing, onValidated, deadline }: { landing: string; onValidated: () => void; deadline?: string }) {
  const [view, setView] = useState<'form' | 'welcome' | 'expired'>(() => {
    if (deadline && new Date().getTime() >= new Date(deadline).getTime()) return 'expired';
    return 'form';
  });
  const [firstName, setFirstName] = useState('');

  const handleDniValidated = useCallback(() => {
    const name = getVipName(landing);
    if (name) {
      setFirstName(name.firstName);
    }
    setView('welcome');
  }, [landing]);

  const { dni, isValidDni, submitting, errorMsg, handleChange, handleSubmit } = useDniValidation(landing, handleDniValidated);

  const cadeBackground = {
    background: `
      radial-gradient(circle at 30% 20%, rgba(3,219,208,0.15) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(70,84,205,0.2) 0%, transparent 50%),
      linear-gradient(135deg, #0a1628 0%, #122044 40%, #1a3060 100%)
    `,
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(3, 219, 208, 0.25)',
  };

  return (
    <div
      className="fixed inset-0 z-[10001] flex flex-col items-center justify-center px-4"
      style={cadeBackground}
    >
      <img
        src="https://baldecash.s3.amazonaws.com/company/logo-cade-2026.png"
        alt="BaldeCash CADE Universitario 2026"
        className="h-24 sm:h-32 md:h-40 w-auto mb-8 sm:mb-12"
      />

      {view === 'form' && (
        <div className="max-w-md w-full rounded-3xl p-6 sm:p-8 text-center" style={cardStyle}>
          <h2 className="text-lg sm:text-xl font-bold mb-1" style={{ color: '#03DBD0' }}>
            Acceso exclusivo CADE
          </h2>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-5">
            Ingresa tu documento para ver las ofertas exclusivas del evento.
          </p>
          <DniInputRow
            dni={dni}
            isValidDni={isValidDni}
            submitting={submitting}
            errorMsg={errorMsg}
            onChange={handleChange}
            onSubmit={handleSubmit}
            accentColor="#03DBD0"
            textColor="#0a1628"
          />
        </div>
      )}

      {view === 'welcome' && (
        <div className="max-w-md w-full rounded-3xl p-6 sm:p-8 text-center" style={cardStyle}>
          <p className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#03DBD0' }}>
            {firstName ? `¡Hola ${firstName}!` : '¡Bienvenido!'}
          </p>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6">
            Tienes acceso a ofertas exclusivas del CADE Universitario 2026.
          </p>
          <button
            onClick={onValidated}
            className="w-full py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer"
            style={{ backgroundColor: '#03DBD0', color: '#0a1628' }}
          >
            Comenzar
          </button>
        </div>
      )}

      {view === 'expired' && (
        <div className="max-w-md w-full rounded-3xl p-6 sm:p-8 text-center" style={cardStyle}>
          <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#03DBD0' }}>
            Este evento ha finalizado
          </h2>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6">
            El periodo de acceso exclusivo CADE Universitario 2026 ha terminado.
            Explora nuestro catálogo general para encontrar tu equipo ideal.
          </p>
          <a
            href={routes.catalogo('home')}
            className="block w-full py-3.5 rounded-xl text-base font-semibold text-center transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer"
            style={{ backgroundColor: '#03DBD0', color: '#0a1628' }}
          >
            Ver catálogo general
          </a>
        </div>
      )}
    </div>
  );
}

// ── Shared DNI input + button row ─────────────────────────────────────────

function DniInputRow({
  dni,
  isValidDni,
  submitting,
  errorMsg,
  onChange,
  onSubmit,
  accentColor,
  textColor,
}: {
  dni: string;
  isValidDni: boolean;
  submitting: boolean;
  errorMsg: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
  accentColor: string;
  textColor: string;
}) {
  return (
    <>
      <div className="flex items-stretch gap-2 w-full">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={dni}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
          placeholder="Número de documento"
          maxLength={DOC_MAX_LENGTH}
          disabled={submitting}
          aria-label="DNI"
          aria-invalid={!!errorMsg}
          className="flex-1 min-w-0 py-3.5 px-4 bg-white rounded-xl text-base font-medium outline-none focus:ring-2 placeholder:text-gray-400 disabled:opacity-70"
          style={{ color: textColor, '--tw-ring-color': accentColor } as React.CSSProperties}
        />
        <button
          onClick={onSubmit}
          disabled={!isValidDni || submitting}
          className="px-5 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 inline-flex items-center justify-center min-w-[92px]"
          style={{ backgroundColor: accentColor, color: textColor }}
        >
          {submitting ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" role="status">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            'Validar'
          )}
        </button>
      </div>
      {errorMsg && (
        <p className="mt-2 text-sm font-medium text-left" style={{ color: '#FCA5A5' }}>
          {errorMsg}
        </p>
      )}
    </>
  );
}

// ── Overlay variant registry ──────────────────────────────────────────────

const OVERLAY_VARIANTS: Record<string, React.FC<{ landing: string; onValidated: () => void; deadline?: string }>> = {
  cade: CadeOverlayGate,
};

// ── VipGate ───────────────────────────────────────────────────────────────

/**
 * VipGate - Combined access guard + welcome overlay.
 *
 * When whitelist is enabled and no token:
 *   - With countdown → redirects to landing home (VipCountdownOverlay lives there).
 *   - Without countdown → blocks here. Config decides the UI:
 *       overlay_variant → custom overlay component (e.g. 'cade')
 *       dni_capture_mode 'inline' → InlineDniGate (default fullscreen)
 *       dni_capture_mode 'modal'  → DniModal (popup)
 */
function VipGate({ landing, children }: { landing: string; children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'blocked' | 'redirecting'>('loading');
  const [captureMode, setCaptureMode] = useState<'modal' | 'inline'>('modal');
  const [overlayVariant, setOverlayVariant] = useState('');
  const [overlayDeadline, setOverlayDeadline] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState<{ firstName: string } | null>(null);
  const [countdownDate, setCountdownDate] = useState('');
  const [vipExpired, setVipExpired] = useState(false);

  useEffect(() => {
    fetchLandingConfig(landing).then((cfg) => {
      const hasWhitelist = cfg.features.has_dni_whitelist;
      const vipCountdown = cfg.features.vip_countdown;

      const overlayDl = cfg.features.overlay_deadline || '';
      const variant = cfg.features.overlay_variant || '';

      if (hasWhitelist && !getVipToken(landing)) {
        if (vipCountdown) {
          setStatus('redirecting');
          router.replace(routes.landingHome(landing));
        } else {
          setCaptureMode(cfg.features.dni_capture_mode || 'modal');
          setOverlayVariant(variant);
          setOverlayDeadline(overlayDl);
          setStatus('blocked');
        }
        return;
      }

      // Overlay deadline expired even with valid token — block access
      if (variant && overlayDl && new Date().getTime() >= new Date(overlayDl).getTime()) {
        setOverlayVariant(variant);
        setOverlayDeadline(overlayDl);
        setStatus('blocked');
        return;
      }

      // Check if VIP countdown already expired — block content entirely
      if (hasWhitelist && vipCountdown) {
        const endDate = new Date(vipCountdown);
        if (new Date().getTime() >= endDate.getTime()) {
          setVipExpired(true);
          setCountdownDate(vipCountdown);
          setStatus('allowed');
          return;
        }
      }

      // Check if welcome overlay should show (one-shot: only right after DNI validation)
      if (hasWhitelist && consumeVipWelcomePending(landing)) {
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
  };

  const handleValidated = useCallback(() => {
    window.location.reload();
  }, []);

  // Block render while checking access or redirecting
  if (status === 'loading' || status === 'redirecting') return null;

  // Whitelist without countdown: pick the gate UI
  if (status === 'blocked') {
    // Custom overlay variant takes priority
    const VariantComponent = overlayVariant ? OVERLAY_VARIANTS[overlayVariant] : null;
    if (VariantComponent) {
      return <VariantComponent landing={landing} onValidated={handleValidated} deadline={overlayDeadline || undefined} />;
    }

    // Fallback to capture mode
    if (captureMode === 'inline') {
      return <InlineDniGate landing={landing} onValidated={handleValidated} />;
    }
    return (
      <DniModal
        landingSlug={landing}
        isOpen
        onClose={() => {}}
        allowSkip={false}
        validateWhitelist
        onWhitelistValidated={handleValidated}
      />
    );
  }

  // VIP expired: only show overlay, NO children (catalog/product not rendered)
  if (vipExpired && countdownDate) {
    return (
      <VipCountdownOverlay
        endDate={countdownDate}
        catalogSlug={landing}
      />
    );
  }

  return (
    <>
      {children}
      {showWelcome && countdownDate && (
        <VipCountdownOverlay
          endDate={countdownDate}
          onExpired={handleDismiss}
          welcomeData={welcomeName}
          catalogSlug={landing}
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
