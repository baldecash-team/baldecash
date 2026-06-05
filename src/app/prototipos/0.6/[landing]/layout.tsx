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

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import { LayoutProvider } from './context/LayoutContext';
import { SessionProvider } from './solicitar/context/SessionContext';
import { EventTrackerProvider } from './solicitar/context/EventTrackerContext';
import { DniModal, getVipToken, getVipName, consumeVipWelcomePending, saveVipToken, saveVipName } from '../components/hero/DniModal';
import { useSessionOptional } from './solicitar/context/SessionContext';
import { VipCountdownOverlay } from '../components/hero/VipCountdownOverlay';
import { fetchLandingConfig } from '../services/landingConfigApi';
import { routes, normalizeCatalogUrl } from '../utils/routes';
import { evaluateLandingAccess } from '../services/landingApi';
import type { EvaluatePayload } from '../services/landingApi';
import { usePreview } from '../context/PreviewContext';

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

interface SiblingMatch {
  slug: string;
  name: string;
  firstName: string;
}

function useDniValidation(landing: string, onValidated: () => void) {
  const session = useSessionOptional();
  const [dni, setDni] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [siblingMatch, setSiblingMatch] = useState<SiblingMatch | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  const isValidDni = dni.length >= DOC_MIN_LENGTH && /^\d{8,12}$/.test(dni);

  const handleChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, DOC_MAX_LENGTH);
    setDni(cleaned);
    if (errorMsg) setErrorMsg(null);
    if (siblingMatch) setSiblingMatch(null);
    if (showRegister) setShowRegister(false);
  }, [errorMsg, siblingMatch, showRegister]);

  const handleSubmit = useCallback(async () => {
    if (!isValidDni || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    setSiblingMatch(null);
    setShowRegister(false);
    try {
      const validateUrl = `${API_BASE_URL}/public/landing/${encodeURIComponent(landing)}/validate-dni/${dni}${session?.sessionUuid ? `?session_uuid=${session.sessionUuid}` : ''}`;
      const res = await fetch(validateUrl);
      const data = await res.json();
      if (!data.valid) {
        if (data.found_in_sibling && data.sibling_landing_slug) {
          setSiblingMatch({
            slug: data.sibling_landing_slug,
            name: data.sibling_landing_name || data.sibling_landing_slug,
            firstName: data.first_name || '',
          });
        } else if (data.found_in_sibling === false && data.register_url !== undefined) {
          setShowRegister(true);
        } else {
          setErrorMsg('No encontramos un registro con este número de documento.');
        }
        setSubmitting(false);
        return;
      }
      if (data.access_token) saveVipToken(landing, data.access_token);
      if (data.first_name) saveVipName(landing, data.first_name);
      try { localStorage.setItem(`baldecash-dni-${landing}`, dni); } catch {}
      onValidated();
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.');
      setSubmitting(false);
    }
  }, [isValidDni, submitting, landing, dni, onValidated]);

  return { dni, isValidDni, submitting, errorMsg, handleChange, handleSubmit, siblingMatch, showRegister };
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

// ── Floating particles ───────────────────────────────────────────────────

function FloatingParticles({ color = '#00BFB3' }: { color?: string }) {
  const particles = useMemo(() => {
    const subtle = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: 4 + Math.random() * 8,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 12 + Math.random() * 18,
      delay: Math.random() * -20,
      opacity: 0.12 + Math.random() * 0.18,
    }));
    const solid = Array.from({ length: 12 }, (_, i) => ({
      id: 100 + i,
      size: 3 + Math.random() * 5,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 14 + Math.random() * 16,
      delay: Math.random() * -20,
      opacity: 1,
    }));
    return [...subtle, ...solid];
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: color,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// ── Baldi illustration with load-triggered animation ─────────────────────

function BaldiIllustration({ currentBaldiSrc }: { currentBaldiSrc: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      className="hidden md:flex items-center justify-center flex-shrink-0 mr-6 z-10 relative"
      style={{ width: 410, height: 544 }}
      initial={{ opacity: 0, x: -60 }}
      animate={loaded ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentBaldiSrc}
          src={currentBaldiSrc}
          alt="Baldi CADE"
          width={410}
          height={544}
          fetchPriority="high"
          className="h-[28rem] lg:h-[34rem] w-auto object-contain drop-shadow-xl"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.3 }}
          onLoad={() => setLoaded(true)}
        />
      </AnimatePresence>
    </motion.div>
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

  const { dni, isValidDni, submitting, errorMsg, handleChange, handleSubmit, siblingMatch, showRegister } = useDniValidation(landing, handleDniValidated);

  const CADE_TEAL = '#00BFB3';
  const BALDI_CADE_VALIDATE = 'https://baldecash.s3.amazonaws.com/illustrations/baldi-cade-validate.webp';
  const BALDI_CADE_WELCOME = 'https://baldecash.s3.amazonaws.com/illustrations/baldi-cade-welcome.webp';
  const BALDI_CADE_EXPIRED = 'https://baldecash.s3.amazonaws.com/illustrations/baldi-cade-expired.webp';
  const CADE_OVERLAY_BG = 'https://baldecash.s3.amazonaws.com/illustrations/cade-overlay-bg.webp';
  const CADE_LOGO = 'https://baldecash.s3.amazonaws.com/company/logo-cade-2026.webp';

  const currentBaldiSrc = view === 'form' ? BALDI_CADE_VALIDATE : view === 'expired' ? BALDI_CADE_EXPIRED : BALDI_CADE_WELCOME;

  // Preload critical images: current mascot, next mascot, background, logo
  const preloadedRef = useRef(false);
  useEffect(() => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;
    const nextBaldiSrc = view === 'form' ? BALDI_CADE_WELCOME : null;
    const urls = [currentBaldiSrc, CADE_OVERLAY_BG, CADE_LOGO, nextBaldiSrc].filter(Boolean) as string[];
    for (const href of urls) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      document.head.appendChild(link);
    }
  }, [currentBaldiSrc]);

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center px-4 py-6 overflow-y-auto"
      style={{ backgroundColor: '#F0F2F5', backgroundImage: `url(${CADE_OVERLAY_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <FloatingParticles color={CADE_TEAL} />
      <div className="flex flex-col md:flex-row items-center max-w-5xl w-full justify-center my-auto">
        {/* Illustration — hidden on mobile/tablet, visible on md+ */}
        <BaldiIllustration currentBaldiSrc={currentBaldiSrc} />

        {/* Card */}
        <motion.div
          className="max-w-sm w-full md:w-[400px] md:max-w-none md:flex-shrink-0 bg-white rounded-3xl shadow-md p-5 sm:p-8 relative"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <img
            src={CADE_LOGO}
            alt="CADE Universitario 2026"
            width={224}
            height={80}
            fetchPriority="high"
            className="w-40 sm:w-56 h-auto mx-auto mb-4"
          />

          <AnimatePresence mode="wait">
          {view === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mobile illustration */}
              <div className="flex md:hidden justify-center mb-3" style={{ height: 144 }}>
                <img
                  src={BALDI_CADE_VALIDATE}
                  alt="Baldi CADE"
                  width={112}
                  height={144}
                  className="h-28 sm:h-36 w-auto object-contain"
                />
              </div>

              <div className="text-center mb-4 sm:mb-5">
                <p className="text-gray-500 text-base sm:text-xl mb-1">Acceso</p>
                <h2 className="text-xl sm:text-3xl font-bold" style={{ color: '#1B2A4A' }}>
                  <span style={{ color: CADE_TEAL }}>CADE</span> Universitario 2026
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Valida tu identidad para continuar
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Número de documento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={dni}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                    placeholder="Ingresa tu número de documento"
                    maxLength={12}
                    disabled={submitting}
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-base text-gray-800 font-medium outline-none focus:ring-2 placeholder:text-gray-400 disabled:opacity-70"
                    style={{ '--tw-ring-color': CADE_TEAL } as React.CSSProperties}
                  />
                </div>
                {errorMsg && (
                  <p className="mt-1.5 text-sm font-medium text-red-500">{errorMsg}</p>
                )}
              </div>

              {/* Found in sibling landing */}
              {siblingMatch && (
                <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: 'rgba(0,191,179,0.08)', border: '1px solid rgba(0,191,179,0.2)' }}>
                  <p className="text-sm text-gray-700 mb-1">
                    Hola <span className="font-semibold">{siblingMatch.firstName}</span>, tu acceso está en:
                  </p>
                  <p className="text-base font-bold" style={{ color: CADE_TEAL }}>{siblingMatch.name}</p>
                  <a
                    href={routes.catalogo(siblingMatch.slug)}
                    className="mt-3 w-full py-3 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                    style={{ backgroundColor: CADE_TEAL }}
                  >
                    Empezar
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Not found anywhere — show closed message */}
              {showRegister && (
                <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-sm text-gray-700">
                    Tu documento no tiene acceso a esta promoción.
                  </p>
                </div>
              )}

              {/* Validate button — hide when sibling or register is shown */}
              {!siblingMatch && !showRegister && (
                <button
                  onClick={handleSubmit}
                  disabled={!isValidDni || submitting}
                  className="w-full py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
                  style={{ backgroundColor: CADE_TEAL }}
                >
                  {submitting ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" role="status">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <>
                      Validar acceso
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              )}

              <p className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Tus datos están protegidos.
              </p>
            </motion.div>
          )}

          {view === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="flex md:hidden justify-center mb-3">
                <img src={BALDI_CADE_WELCOME} alt="Baldi CADE" width={112} height={144} className="h-28 sm:h-36 w-auto object-contain" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1B2A4A' }}>
                {firstName ? `¡Hola, ${firstName}!` : '¡Bienvenido!'}
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-5">
                Nos alegra verte de nuevo.<br />
                Estás listo para vivir la experiencia CADE.
              </p>

              <div className="flex items-center rounded-xl py-2.5 px-4 mb-5 border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={CADE_TEAL} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: CADE_TEAL }}>Documento</span>
                </div>
                <span className="pl-3 text-base font-semibold text-gray-800">{dni}</span>
              </div>

              <button
                onClick={onValidated}
                className="w-full py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: 'transparent', color: CADE_TEAL, border: `2px solid ${CADE_TEAL}` }}
              >
                Comenzar
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>

              <p className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Tus datos están protegidos.
              </p>
            </motion.div>
          )}

          {view === 'expired' && (
            <motion.div
              key="expired"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="flex md:hidden justify-center mb-3">
                <img src={BALDI_CADE_EXPIRED} alt="Baldi CADE" width={112} height={144} className="h-28 sm:h-36 w-auto object-contain" />
              </div>

              <div className="flex justify-center mb-3">
                <img
                  src="https://baldecash.s3.amazonaws.com/illustrations/cade-calendar-check.webp"
                  alt=""
                  className="h-24 sm:h-28 w-auto"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1B2A4A' }}>
                ¡Evento finalizado!
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Gracias por ser parte de esta experiencia.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm font-bold mb-3">
                Te esperamos en futuros eventos.
              </p>

              <div className="flex items-center gap-2 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <svg className="h-4 w-4 flex-shrink-0" fill={CADE_TEAL} viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="flex items-center gap-3 rounded-xl p-3.5 mb-5 text-left border border-gray-200 bg-gray-50">
                <img
                  src="https://baldecash.s3.amazonaws.com/illustrations/cade-calendar-check.webp"
                  alt=""
                  className="h-12 w-12 flex-shrink-0"
                />
                <p className="text-xs sm:text-sm text-gray-500 leading-snug">
                  Mantente atento a nuestras redes para conocer las próximas fechas.
                </p>
              </div>

              <a
                href={routes.catalogo('home')}
                className="block w-full py-3.5 rounded-xl text-base font-semibold text-white text-center transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                style={{ backgroundColor: CADE_TEAL }}
              >
                Ver catálogo completo
              </a>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      </div>
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
          aria-label="Número de documento"
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

// ── Locker Truck: helpers anti-loop de sessionStorage (B-1) ──────────────────
// Key por-slug para evitar afectar otras landings.
// hasLockertruckPass: guarda contra SSR con typeof window check.

function hasLockertruckPass(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(`baldecash-lockertruck-pass-${slug}`) === '1';
}

function setLockertruckPass(slug: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(`baldecash-lockertruck-pass-${slug}`, '1');
}

// ── Locker Truck: tipos de la máquina de estados (D-1) ───────────────────────

/**
 * Estados internos del gate locker-truck.
 *
 * d1          → formulario de captura de DNI (sin token)
 * d2-loading  → evaluando acceso (spinner, /evaluate en vuelo)
 * d2-result   → acceso permitido, botón "Ver catálogo" visible
 * waiting     → no_normal sin catalog_url ("pronto te contactamos")
 * d3          → no_access (sin acceso al catálogo)
 * error       → error de red en /evaluate (con botón Reintentar)
 */
type LockertruckState = 'd1' | 'd2-loading' | 'd2-result' | 'waiting' | 'd3' | 'error';

interface LockertruckGateCtx {
  state: LockertruckState;
  firstName: string | null;
  catalogUrl: string | null;
  errorMsg: string | null;
  /** Valor del input DNI en D1 */
  dni: string;
  /** Token leído de ?vip_auto= al montar el componente */
  accessToken: string | null;
}

// ── Locker Truck overlay gate (D-2 + E-1..E-4) ───────────────────────────────

function LockertruckOverlayGate({ landing, onValidated: _onValidated }: { landing: string; onValidated: () => void }) {
  // Leer vip_auto de la URL al montar — determina el estado inicial.
  // Se lee solo una vez (valor inicial del estado) para evitar re-lectura en renders.
  const [ctx, setCtx] = useState<LockertruckGateCtx>(() => {
    const token =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('vip_auto')
        : null;
    return {
      state: token ? 'd2-loading' : 'd1',
      firstName: null,
      catalogUrl: null,
      errorMsg: null,
      dni: '',
      accessToken: token,
    };
  });

  // Validación local del DNI en D1: 8-12 dígitos numéricos
  const isDniValid = /^\d{8,12}$/.test(ctx.dni);

  // Ref-guard para evitar doble disparo en StrictMode (D-2)
  // Se resetea cuando el estado sale de 'd2-loading' (permite reintentar)
  const evaluateCalledRef = useRef(false);

  // Preload de assets — a nivel de componente para cumplir Rules of Hooks
  const imagePreloadRef = useRef(false);

  // Constantes de assets — src vacíos hasta EXT-2
  // WHY: las URLs de S3 para fondo geométrico e ilustración Baldi+food-truck
  // aún no existen. Se cablea la estructura ahora; cuando se suban los assets
  // en EXT-2, se reemplazan las cadenas vacías por las URLs reales.
  const LOCKER_OVERLAY_BG = '';  // TODO EXT-2: 'https://baldecash.s3.amazonaws.com/illustrations/locker-truck-bg.webp'
  const BALDI_TRUCK = '';         // TODO EXT-2: 'https://baldecash.s3.amazonaws.com/illustrations/baldi-locker-truck.webp'
  const BALDECASH_LOGO = 'https://baldecash.s3.amazonaws.com/company/logo-vip-v2.png';
  const LOCKER_TEAL = '#00BFB3';

  // Preload de imágenes disponibles (E-1)
  useEffect(() => {
    if (imagePreloadRef.current) return;
    imagePreloadRef.current = true;
    const urls = [LOCKER_OVERLAY_BG, BALDI_TRUCK, BALDECASH_LOGO].filter(Boolean);
    for (const href of urls) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      document.head.appendChild(link);
    }
  }, []);

  // Disparar /evaluate al entrar en d2-loading (D-2)
  useEffect(() => {
    if (ctx.state !== 'd2-loading') {
      // Resetear el guard al salir de 'd2-loading' para que retry funcione
      evaluateCalledRef.current = false;
      return;
    }
    if (evaluateCalledRef.current) return;
    evaluateCalledRef.current = true;

    const payload: EvaluatePayload = ctx.accessToken
      ? { accessToken: ctx.accessToken }
      : { dni: ctx.dni };

    evaluateLandingAccess(landing, payload)
      .then((resp) => {
        if (
          (resp.status === 'normal' || resp.status === 'no_normal') &&
          resp.catalog_url
        ) {
          // Acceso normal o no_normal con catálogo → mostrar botón "Ver catálogo"
          setCtx((prev) => ({
            ...prev,
            state: 'd2-result',
            firstName: resp.first_name ?? null,
            catalogUrl: resp.catalog_url,
          }));
        } else if (resp.status === 'no_normal' && !resp.catalog_url) {
          // No_normal sin catálogo → mensaje de espera
          // Flag anti-loop: no re-evaluar en refresh (Decisión 2)
          setLockertruckPass(landing);
          setCtx((prev) => ({ ...prev, state: 'waiting' }));
        } else {
          // no_access → D3
          // Flag anti-loop: no re-evaluar en refresh (Decisión 2)
          setLockertruckPass(landing);
          setCtx((prev) => ({ ...prev, state: 'd3' }));
        }
      })
      .catch(() => {
        setCtx((prev) => ({
          ...prev,
          state: 'error',
          errorMsg: 'No pudimos verificar tu acceso. Por favor, intentá de nuevo.',
        }));
      });
  }, [ctx.state, ctx.accessToken, ctx.dni, landing]);

  // Transición D1 → d2-loading: valida el DNI antes de disparar
  const handleD1Submit = useCallback(() => {
    if (!isDniValid) return;
    setCtx((prev) => ({ ...prev, state: 'd2-loading' }));
  }, [isDniValid]);

  // Transición error → reintentar: vuelve a d2-loading
  const handleRetry = useCallback(() => {
    setCtx((prev) => ({ ...prev, state: 'd2-loading', errorMsg: null }));
  }, []);

  // Navegación al catálogo desde d2-result: set flag anti-loop antes de navegar
  const handleViewCatalog = useCallback(() => {
    if (!ctx.catalogUrl) return;
    setLockertruckPass(landing);
    window.location.assign(normalizeCatalogUrl(ctx.catalogUrl));
  }, [ctx.catalogUrl, landing]);

  // ── Render por estado ─────────────────────────────────────────────────────

  // D1: captura de DNI (placeholder funcional sin estilos decorativos)
  // Estilos definitivos: pendiente de diseño (EXT-2 / diseñadora)
  if (ctx.state === 'd1') {
    return (
      <div className="fixed inset-0 z-[10001] flex flex-col items-center justify-center p-6">
        {/* D1: placeholder funcional. Estilos definitivos: pendiente de diseño. */}
        <div className="max-w-sm w-full space-y-4">
          <p className="text-sm text-gray-600">
            Ingresa tu número de documento para acceder al catálogo.
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={ctx.dni}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, '').slice(0, 12);
              setCtx((prev) => ({ ...prev, dni: cleaned }));
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleD1Submit(); }}
            placeholder="Número de documento"
            maxLength={12}
            aria-label="Número de documento"
          />
          {/* Error inline de validación — no expone el valor del DNI (REQ-11) */}
          {ctx.dni.length > 0 && !isDniValid && (
            <p className="text-sm text-red-500">
              Ingresa un documento válido (8 a 12 dígitos numéricos).
            </p>
          )}
          <button
            onClick={handleD1Submit}
            disabled={!isDniValid}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // D2-loading / D2-result: pantalla de revisión con stepper (E-1)
  if (ctx.state === 'd2-loading' || ctx.state === 'd2-result') {
    const isLoading = ctx.state === 'd2-loading';

    return (
      <div
        className="fixed inset-0 z-[10001] flex items-center justify-center px-4 py-6 overflow-y-auto"
        style={{
          backgroundColor: '#F0F2F5',
          // WHY: LOCKER_OVERLAY_BG está vacío hasta EXT-2; cuando se suba el asset
          // la imagen de fondo se aplicará automáticamente.
          backgroundImage: LOCKER_OVERLAY_BG ? `url(${LOCKER_OVERLAY_BG})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex flex-col md:flex-row items-center max-w-5xl w-full justify-center my-auto">
          {/* Ilustración Baldi + food truck — oculta en móvil, visible md+ */}
          {/* WHY: BALDI_TRUCK vacío hasta EXT-2; el bloque no se renderiza. */}
          {BALDI_TRUCK && (
            <div className="hidden md:flex items-center justify-center flex-shrink-0 mr-6 z-10 relative">
              <img
                src={BALDI_TRUCK}
                alt="Baldi Locker Truck"
                width={380}
                height={500}
                className="h-[28rem] lg:h-[34rem] w-auto object-contain drop-shadow-xl"
              />
            </div>
          )}

          {/* Card principal */}
          <motion.div
            className="max-w-sm w-full md:w-[400px] md:max-w-none md:flex-shrink-0 bg-white rounded-3xl shadow-md p-5 sm:p-8 relative"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            {/* Logo BaldeCash */}
            <img
              src={BALDECASH_LOGO}
              alt="BaldeCash"
              width={160}
              height={56}
              className="w-32 sm:w-40 h-auto mx-auto mb-5"
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={ctx.state}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Título y saludo */}
                <div className="text-center mb-5">
                  <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1B2A4A' }}>
                    {isLoading
                      ? (ctx.firstName ? `Hola, ${ctx.firstName}` : 'Estamos revisando tu solicitud')
                      : (ctx.firstName ? `¡Listo, ${ctx.firstName}!` : '¡Listo!')}
                  </h2>
                  {isLoading && (
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
                      Validando tu acceso al catálogo exclusivo.
                    </p>
                  )}
                </div>

                {/* Chip "puede tardar unos segundos" — solo en d2-loading */}
                {isLoading && (
                  <div className="flex justify-center mb-4">
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(0,191,179,0.1)', color: LOCKER_TEAL }}
                    >
                      Puede tardar unos segundos
                    </span>
                  </div>
                )}

                {/* Stepper de 3 pasos */}
                <div className="space-y-3 mb-5">
                  {/* Paso 1: Solicitud enviada — siempre completado (teal ✓) */}
                  <div className="flex items-center gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: LOCKER_TEAL }}
                    >
                      ✓
                    </span>
                    <span className="text-sm text-gray-700 font-medium">Solicitud enviada</span>
                  </div>

                  {/* Paso 2: En revisión — spinner animado en loading, ✓ en result */}
                  <div className="flex items-center gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: LOCKER_TEAL }}
                    >
                      {isLoading ? (
                        <svg
                          className="animate-spin h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          role="status"
                          aria-label="En revisión"
                        >
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      ) : '✓'}
                    </span>
                    <span className="text-sm text-gray-700 font-medium">En revisión</span>
                  </div>

                  {/* Paso 3: Resultado — gris punteado en loading, teal ✓ en result */}
                  <div className="flex items-center gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-dashed"
                      style={
                        isLoading
                          ? { borderColor: '#D1D5DB', color: '#9CA3AF' }
                          : { backgroundColor: LOCKER_TEAL, borderColor: LOCKER_TEAL, color: 'white' }
                      }
                    >
                      {isLoading ? '3' : '✓'}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: isLoading ? '#9CA3AF' : '#1B2A4A' }}
                    >
                      Resultado
                    </span>
                  </div>
                </div>

                {/* Botón "Ver catálogo" — visible solo en d2-result */}
                {!isLoading && ctx.catalogUrl && (
                  <button
                    onClick={handleViewCatalog}
                    className="w-full py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    style={{ backgroundColor: LOCKER_TEAL }}
                  >
                    Ver catálogo
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                )}

                {/* Pie de privacidad */}
                <p className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Tus datos están protegidos.
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  // Waiting: no_normal sin catalog_url (E-2)
  // Placeholder funcional sin estilos decorativos — diseño pendiente
  if (ctx.state === 'waiting') {
    return (
      <div className="fixed inset-0 z-[10001] flex flex-col items-center justify-center p-6">
        {/* Waiting: placeholder funcional. Estilos definitivos: pendiente de diseño. */}
        <p className="text-base text-gray-700">
          Pronto nos comunicaremos con vos.
        </p>
      </div>
    );
  }

  // D3: no_access (E-3)
  // Placeholder funcional sin estilos decorativos — diseño pendiente
  if (ctx.state === 'd3') {
    return (
      <div className="fixed inset-0 z-[10001] flex flex-col items-center justify-center p-6">
        {/* D3: placeholder funcional. Estilos definitivos: pendiente de diseño. */}
        <p className="text-base text-gray-700">
          No tenés acceso a este catálogo en este momento.
        </p>
      </div>
    );
  }

  // Error: error de red en /evaluate (E-4)
  return (
    <div className="fixed inset-0 z-[10001] flex flex-col items-center justify-center p-6">
      <p className="text-base text-gray-700 mb-4">
        {ctx.errorMsg ?? 'No pudimos verificar tu acceso.'}
      </p>
      <button onClick={handleRetry}>
        Reintentar
      </button>
    </div>
  );
}

// ── Overlay variant registry ──────────────────────────────────────────────

const OVERLAY_VARIANTS: Record<string, React.FC<{ landing: string; onValidated: () => void; deadline?: string }>> = {
  cade: CadeOverlayGate,
  lockertruck: LockertruckOverlayGate,
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
  const pathname = usePathname();
  const session = useSessionOptional();
  const preview = usePreview();
  const isPublicPage = pathname.includes('/legal/') || pathname.includes('/proximamente');
  const [status, setStatus] = useState<'loading' | 'allowed' | 'blocked' | 'redirecting'>('loading');
  const [captureMode, setCaptureMode] = useState<'modal' | 'inline'>('modal');
  const [overlayVariant, setOverlayVariant] = useState('');
  const [overlayDeadline, setOverlayDeadline] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState<{ firstName: string } | null>(null);
  const [countdownDate, setCountdownDate] = useState('');
  const [vipExpired, setVipExpired] = useState(false);
  const infoFetchedRef = useRef(false);
  const sessionLinkedRef = useRef(false);

  // Fetch lead info (name, dni) as soon as we have a token — no session needed
  useEffect(() => {
    if (infoFetchedRef.current) return;
    const token = getVipToken(landing);
    if (!token) return;
    infoFetchedRef.current = true;
    fetch(`${API_BASE_URL}/public/landing/${encodeURIComponent(landing)}/link-token-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, session_uuid: null }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.linked) return;
        if (data.first_name) saveVipName(landing, data.first_name);
        if (data.dni) {
          try { localStorage.setItem(`baldecash-dni-${landing}`, data.dni); } catch {}
        }
      })
      .catch(() => {});
  }, [landing]);

  // Link token ↔ tracking session once session is ready
  useEffect(() => {
    if (sessionLinkedRef.current) return;
    const token = getVipToken(landing);
    const uuid = session?.sessionUuid;
    if (!token || !uuid) return;
    sessionLinkedRef.current = true;
    fetch(`${API_BASE_URL}/public/landing/${encodeURIComponent(landing)}/link-token-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, session_uuid: uuid }),
    }).catch(() => {});
  }, [landing, session?.sessionUuid]);

  useEffect(() => {
    // Wait for sessionStorage hydration before evaluating access.
    // Without this guard, fetchLandingConfig may resolve before PreviewContext
    // reads sessionStorage, making isPreviewingLanding() return false and
    // triggering a redirect even when preview mode is active.
    if (!preview.isHydrated) return;

    fetchLandingConfig(landing).then((cfg) => {
      // Admin preview bypasses all access checks — no redirect, no block
      if (preview.isPreviewingLanding(landing)) {
        setStatus('allowed');
        return;
      }

      const hasWhitelist = cfg.features.has_dni_whitelist;
      const vipCountdown = cfg.features.vip_countdown;

      const overlayDl = cfg.features.overlay_deadline || '';
      const variant = cfg.features.overlay_variant || '';

      // Overlay deadline expired — block access regardless of whitelist
      if (variant && overlayDl && new Date().getTime() >= new Date(overlayDl).getTime()) {
        setOverlayVariant(variant);
        setOverlayDeadline(overlayDl);
        setStatus('blocked');
        return;
      }

      // C-1: bypass del auto-allow keyed off overlay_variant === 'lockertruck'
      // Se ejecuta ANTES del bloque de auto-allow para que locker-truck
      // siempre corra /evaluate, incluso cuando llega con ?vip_auto=.
      // El token vip_auto queda disponible en la URL para que
      // LockertruckOverlayGate lo lea directamente.
      // Decisión 1 del diseño locker-truck-gate.
      if (variant === 'lockertruck') {
        if (hasLockertruckPass(landing)) {
          // El usuario ya fue evaluado en esta sesión → acceso directo
          setStatus('allowed');
          return;
        }
        setOverlayVariant('lockertruck');
        setOverlayDeadline(overlayDl);
        setStatus('blocked');
        return;
      }

      if (hasWhitelist && typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const vipAuto = params.get('vip_auto');
        if (vipAuto && !getVipToken(landing)) {
          saveVipToken(landing, vipAuto);
        }
      }

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
  }, [landing, router, preview, preview.isHydrated]);

  const handleDismiss = () => {
    setShowWelcome(false);
  };

  const handleValidated = useCallback(() => {
    window.location.reload();
  }, []);

  // Public pages (legal, próximamente) and admin preview are always accessible — skip the gate
  if (isPublicPage || preview.isPreviewingLanding(landing)) return <>{children}</>;

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
