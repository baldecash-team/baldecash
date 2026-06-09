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
import { Check, Search, ShieldCheck, Clock, ArrowRight, X, AlertTriangle } from 'lucide-react';
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

// Mensaje del caso "DNI validado pero sin registro" (fuera de whitelist, sin
// sibling ni register_url). Se extrae a constante para que el gate de
// locker-truck pueda distinguir este caso del de error de conexión y mostrar
// el botón "Ver catálogo" solo aquí.
const DNI_NOT_FOUND_MSG = 'No encontramos un registro con este número de documento.';

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
          setErrorMsg(DNI_NOT_FOUND_MSG);
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

// ── Locker Truck: helpers anti-loop de sessionStorage ──────────────────
// Key por-slug para evitar afectar otras landings.
//
// VARIANTS_WITHOUT_TOKEN_AUTO_ALLOW — "candado" para overlay_variants que NO
// deben dejar pasar de una cuando la URL trae ?vip_auto=<token>.
//
// Por defecto, si una landing con whitelist recibe ?vip_auto=, VipGate guarda el
// token y concede acceso directo (auto-allow) sin mostrar el overlay. Eso alcanza
// para gates que solo validan pertenencia a la whitelist.
//
// Si tu overlay necesita correr su PROPIA validación antes de dejar entrar
// (p.ej. locker-truck consulta Equifax vía /evaluate), agregá su overlay_variant
// a este array: VipGate saltea el auto-allow y SIEMPRE muestra el overlay. A
// partir de ahí, tu componente custom sigue con su lógica propia — puede leer el
// vip_auto de la URL, validarlo como quiera y recién entonces decidir si deja pasar.
//
// En resumen, para un overlay nuevo con esta necesidad: registralo en
// OVERLAY_VARIANTS y sumá su overlay_variant a este array.
const VARIANTS_WITHOUT_TOKEN_AUTO_ALLOW = ['lockertruck'];

// hasGatePass/setGatePass: flag por-slug que marca que el usuario ya pasó el gate
// en esta sesión (lo setea el overlay tras conceder acceso). Evita el re-bloqueo
// al navegar dentro de la landing. Guarda contra SSR con typeof window check.

function hasGatePass(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(`baldecash-gate-pass-${slug}`) === '1';
}

function setGatePass(slug: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(`baldecash-gate-pass-${slug}`, '1');
}

// Caché del resultado de /evaluate por-slug (localStorage, ventana de 7 días).
// A diferencia de gatePass (sessionStorage, por pestaña, y solo para acceso
// normal), esto persiste el OUTCOME de la evaluación (status + destino) para que
// un cliente que ya validó su DNI en este navegador no tenga que reingresarlo ni
// re-evaluar Equifax al volver. Cubre todos los destinos (catálogo propio y
// convenio), no solo el normal. Vencido el TTL, se vuelve a pedir DNI y evaluar.
const LOCKERTRUCK_EVAL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface LockertruckEvalCache {
  status: string;
  catalogUrl: string | null;
  firstName: string | null;
  ts: number;
}

function getEvalCacheKey(slug: string): string {
  return `baldecash-lockertruck-eval-${slug}`;
}

function getEvalCache(slug: string): LockertruckEvalCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getEvalCacheKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LockertruckEvalCache;
    if (!parsed || typeof parsed.ts !== 'number') return null;
    if (Date.now() - parsed.ts >= LOCKERTRUCK_EVAL_TTL_MS) {
      localStorage.removeItem(getEvalCacheKey(slug));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setEvalCache(slug: string, value: Omit<LockertruckEvalCache, 'ts'>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getEvalCacheKey(slug), JSON.stringify({ ...value, ts: Date.now() }));
  } catch {
    // Silently fail
  }
}

// ── Locker Truck: tipos de la máquina de estados ───────────────────────

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
  /**
   * DNI a enviar en /evaluate (camino D1: viene del hook useDniValidation;
   * camino vip_auto: queda vacío porque /evaluate usa accessToken).
   */
  dni: string;
  /** Token leído de ?vip_auto= al montar el componente */
  accessToken: string | null;
}

// ── Locker Truck overlay gate ───────────────────────────────

function LockertruckOverlayGate({ landing, onValidated: _onValidated }: { landing: string; onValidated: () => void }) {
  // Leer vip_auto de la URL al montar — determina el estado inicial.
  // Se lee solo una vez (valor inicial del estado) para evitar re-lectura en renders.
  const [ctx, setCtx] = useState<LockertruckGateCtx>(() => {
    const token =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('vip_auto')
        : null;
    // Camino vip_auto: guardar el token antes de correr /evaluate para que
    // appendVipToken lo encuentre disponible en las rutas protegidas posteriores.
    // El guard del backend acepta este token vía fallback landing_dni_whitelist.access_token.
    // El ?vip_auto= tiene prioridad sobre el caché: un link fresco re-evalúa.
    if (token) {
      saveVipToken(landing, token);
      return { state: 'd2-loading', firstName: null, catalogUrl: null, errorMsg: null, dni: '', accessToken: token };
    }
    // Reingreso sin ?vip_auto=: si hay un resultado de evaluación cacheado y
    // vigente (7 días), se salta el DNI y el /evaluate y se arranca directo en el
    // estado de resultado. El cliente ya validó su DNI en este navegador y
    // Equifax sigue cacheado en backend, así que re-pedirlo es justo lo que se
    // quiere evitar. Solo aplica a outcomes con acceso (normal/no_normal).
    const cached = getEvalCache(landing);
    if (cached && (cached.status === 'normal' || cached.status === 'no_normal')) {
      return {
        state: cached.catalogUrl ? 'd2-result' : 'waiting',
        firstName: cached.firstName,
        catalogUrl: cached.catalogUrl,
        errorMsg: null,
        dni: '',
        accessToken: null,
      };
    }
    return { state: 'd1', firstName: null, catalogUrl: null, errorMsg: null, dni: '', accessToken: null };
  });

  // Ref-guard para evitar doble disparo en StrictMode
  // Se resetea cuando el estado sale de 'd2-loading' (permite reintentar)
  const evaluateCalledRef = useRef(false);

  // Preload de assets — a nivel de componente para cumplir Rules of Hooks
  const imagePreloadRef = useRef(false);

  // Sesión de tracking — para atar el token vip_auto al DNI en la sesión.
  const session = useSessionOptional();
  const linkedRef = useRef(false);

  // Callback que dispara useDniValidation cuando el DNI queda validado.
  // En este punto el hook ya guardó access_token con saveVipToken y first_name
  // con saveVipName. Solo hay que capturar el DNI del hook y avanzar a d2-loading.
  const handleDniValidated = useCallback(() => {
    // El hook ya llamó saveVipToken/saveVipName. Leer el DNI desde localStorage
    // no es necesario: el hook lo expone directamente vía el valor `dni`.
    // La transición se hace en el setter de ctx después de que el hook actualice
    // su propio estado — la forma más limpia es que el callback sólo cambie el state.
    setCtx((prev) => ({ ...prev, state: 'd2-loading' }));
  }, []);

  // Hook de validación DNI reutilizado de InlineDniGate / CadeOverlayGate.
  // Al validar: guarda access_token con saveVipToken, first_name con saveVipName,
  // y llama handleDniValidated → transición a d2-loading.
  const {
    dni: hookDni,
    isValidDni,
    submitting,
    errorMsg: dniErrorMsg,
    handleChange: handleDniChange,
    handleSubmit: handleDniSubmit,
    siblingMatch,
    showRegister,
  } = useDniValidation(landing, handleDniValidated);

  // Sincronizar el DNI del hook en ctx.dni para que /evaluate lo use si llega
  // el momento de construir el payload (camino D1 sin accessToken).
  // Solo en estado d1 para evitar actualizaciones innecesarias.
  useEffect(() => {
    if (ctx.state !== 'd1') return;
    setCtx((prev) => ({ ...prev, dni: hookDni }));
  }, [hookDni, ctx.state]);

  // Asset constants.
  // BALDI_TRUCK: ilustración de Baldi del gate, servida desde S3.
  const BALDI_TRUCK = 'https://baldecash.s3.amazonaws.com/illustrations/baldi-lockertruck-laptop.webp';
  // LOCKER_BG: fondo geométrico estático, servido desde S3.
  const LOCKER_BG = 'https://baldecash.s3.amazonaws.com/illustrations/locker-truck-bg.webp';
  // BALDECASH_LOGO: logo isotipo + wordmark, servido desde S3.
  const BALDECASH_LOGO = 'https://baldecash.s3.amazonaws.com/company/logo-lockertruck.webp';
  const LOCKER_TEAL = '#00BFB3';
  const LOCKER_BLUE = '#4654CD';
  const LOCKER_NAVY = '#1B2A4A';

  // Preload the logo (the only available image asset at this stage)
  useEffect(() => {
    if (imagePreloadRef.current) return;
    imagePreloadRef.current = true;
    const urls = [BALDECASH_LOGO, BALDI_TRUCK, LOCKER_BG].filter(Boolean);
    for (const href of urls) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      document.head.appendChild(link);
    }
  }, []);

  // Atar el token vip_auto a la sesión de tracking (guarda el DNI en la sesión).
  // En locker-truck NO se hace saveVipToken (se saltea el auto-allow), así que el
  // link-token-session del VipGate genérico no se dispara: lo hacemos aquí con el
  // vip_auto leído de la URL. Sin esto la sesión queda sin DNI y se pierde la
  // atribución campaña→conversión.
  useEffect(() => {
    if (linkedRef.current) return;
    const uuid = session?.sessionUuid;
    if (!ctx.accessToken || !uuid) return;
    linkedRef.current = true;
    fetch(`${API_BASE_URL}/public/landing/${encodeURIComponent(landing)}/link-token-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: ctx.accessToken, session_uuid: uuid }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.linked && data.first_name) {
          setCtx((prev) => (prev.firstName ? prev : { ...prev, firstName: data.first_name }));
        }
      })
      .catch(() => {});
  }, [ctx.accessToken, session?.sessionUuid, landing]);

  // Disparar /evaluate al entrar en d2-loading
  useEffect(() => {
    if (ctx.state !== 'd2-loading') {
      // Resetear el guard al salir de 'd2-loading' para que retry funcione
      evaluateCalledRef.current = false;
      return;
    }
    if (evaluateCalledRef.current) return;
    evaluateCalledRef.current = true;

    const payload: EvaluatePayload = ctx.accessToken
      ? { accessToken: ctx.accessToken, sessionUuid: session?.sessionUuid ?? undefined }
      : { dni: ctx.dni, sessionUuid: session?.sessionUuid ?? undefined };

    evaluateLandingAccess(landing, payload)
      .then((resp) => {
        if (
          (resp.status === 'normal' || resp.status === 'no_normal') &&
          resp.catalog_url
        ) {
          // Acceso normal o no_normal con catálogo → mostrar botón "Ver catálogo".
          // Cacheamos el outcome (7 días) para no re-pedir DNI ni re-evaluar al
          // reingresar a este navegador.
          setEvalCache(landing, {
            status: resp.status,
            catalogUrl: resp.catalog_url,
            firstName: resp.first_name ?? null,
          });
          setCtx((prev) => ({
            ...prev,
            state: 'd2-result',
            firstName: resp.first_name ?? null,
            catalogUrl: resp.catalog_url,
          }));
        } else if (resp.status === 'no_normal' && !resp.catalog_url) {
          // No_normal sin catálogo → mensaje de espera.
          // NO se setea el flag anti-loop: ese flag concede acceso al catálogo y
          // este usuario NO debe entrar. Al recargar se re-evalúa (Equifax queda
          // cacheado en el backend) y se mantiene en espera.
          setCtx((prev) => ({ ...prev, state: 'waiting' }));
        } else {
          // no_access → D3.
          // NO se setea el flag anti-loop: el flag concede acceso al catálogo, así
          // que un usuario sin acceso NO debe entrar. Al recargar vuelve a quedar
          // bloqueado en el gate (no en el catálogo).
          setCtx((prev) => ({ ...prev, state: 'd3' }));
        }
      })
      .catch(() => {
        setCtx((prev) => ({
          ...prev,
          state: 'error',
          errorMsg: 'No pudimos verificar tu acceso. Por favor, intenta de nuevo.',
        }));
      });
  }, [ctx.state, ctx.accessToken, ctx.dni, landing, session?.sessionUuid]);

  // Transición error → reintentar: vuelve a d2-loading
  const handleRetry = useCallback(() => {
    setCtx((prev) => ({ ...prev, state: 'd2-loading', errorMsg: null }));
  }, []);

  // Transición d3 → d1: por si el alumno tecleó mal su DNI.
  // Limpia el DNI y el accessToken (vip_auto) para que la próxima evaluación
  // use el documento reingresado en vez del token original.
  const handleBackToD1 = useCallback(() => {
    setCtx((prev) => ({ ...prev, state: 'd1', dni: '', accessToken: null, errorMsg: null }));
  }, []);

  // Navegación al catálogo desde d2-result: set flag anti-loop antes de navegar
  const handleViewCatalog = useCallback(() => {
    if (!ctx.catalogUrl) return;
    let target = normalizeCatalogUrl(ctx.catalogUrl);
    // El flag anti-loop solo aplica cuando el destino es el catálogo de ESTA
    // landing (caso normal/preaprobados). Si redirige a un convenio, el usuario
    // sale de locker-truck y no debe quedar habilitado para reingresar.
    if (target.includes(`/${landing}/catalogo`)) {
      setGatePass(landing);
    }
    // Reenviar el cupón de campaña (?coupon=) SOLO en el redirect del gate: el
    // cupón acompaña al cliente a la URL que le corresponde según su clasificación
    // Equifax (misma landing o convenio). normalizeCatalogUrl descarta el
    // querystring, así que sin esto el cupón se perdería al salir del overlay.
    // No altera la regla general: la navegación orgánica a otra landing sigue sin
    // arrastrar cupón, porque únicamente este link del overlay lo reenvía. El
    // catálogo destino lo captura de su propia URL y lo valida con su landing_id;
    // si no aplica a esa landing, el backend responde valid:false y no se muestra.
    const coupon =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('coupon')
        : null;
    if (coupon) {
      const sep = target.includes('?') ? '&' : '?';
      target = `${target}${sep}coupon=${encodeURIComponent(coupon)}`;
    }
    window.location.assign(target);
  }, [ctx.catalogUrl, landing]);

  // ── Stepper helpers ───────────────────────────────────────────────────────

  // Map state to which stepper step is "active" (0-indexed).
  // d1 → step 0 active; d2-loading → step 1 active; d2-result/waiting/d3/error → step 2 active.
  const activeStep: 0 | 1 | 2 =
    ctx.state === 'd1' ? 0
    : ctx.state === 'd2-loading' ? 1
    : 2;

  // Resultado del paso 3 del stepper. Solo aplica cuando activeStep === 2; antes
  // de eso el paso 3 está "pendiente" (no alcanzado). Hace que el ícono/color del
  // último paso diga la verdad por estado y no marque "logrado" siempre.
  //   success → entró (d2-result)   fail → sin acceso (d3)
  //   pending → en espera (waiting) unknown → error de sistema
  const step3Outcome: 'none' | 'success' | 'fail' | 'pending' | 'unknown' =
    activeStep < 2 ? 'none'
    : ctx.state === 'd2-result' ? 'success'
    : ctx.state === 'd3' ? 'fail'
    : ctx.state === 'waiting' ? 'pending'
    : 'unknown';

  // El paso 3 mantiene SIEMPRE el color de marca (teal); lo único que cambia
  // entre estados es el ícono (check / X / reloj / alerta). Así no se introducen
  // colores fuera de la paleta (rojo/ámbar) en el resultado.
  const step3Color = LOCKER_TEAL;

  // ── Per-state title / subtitle copy ───────────────────────────────────────

  function stateTitle(): string {
    switch (ctx.state) {
      case 'd1':         return 'Tu laptop te espera en el Locker Truck';
      case 'd2-loading': return 'Estamos revisando tu solicitud';
      case 'd2-result':  return ctx.firstName ? `¡Todo listo, ${ctx.firstName}!` : '¡Todo listo!';
      case 'waiting':    return 'Tu solicitud está en proceso';
      case 'd3':         return 'Lo sentimos, no tienes acceso en este momento';
      case 'error':      return 'Ocurrió un error';
    }
  }

  function stateSubtitle(): string | null {
    switch (ctx.state) {
      case 'd1':
        return 'Ingresa tu DNI y accede a tu catálogo exclusivo.';
      case 'd2-loading':
        return 'Tu información fue enviada correctamente.\nEstamos validando tus datos para mostrarte las mejores opciones disponibles para ti.';
      case 'd2-result':
        return 'Tu acceso fue verificado. Ya puedes explorar el catálogo.';
      case 'waiting':
        return 'Pronto nos comunicaremos contigo.';
      case 'd3':
        return 'Tu documento no tiene acceso a este catálogo exclusivo.';
      case 'error':
        return ctx.errorMsg ?? 'No pudimos verificar tu acceso. Por favor, intenta de nuevo.';
    }
  }

  // ── Single persistent shell ────────────────────────────────────────────────
  //
  // The shell (background + Baldi slot + card) is ALWAYS rendered across every
  // state. Only the card body changes per step via AnimatePresence.

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center px-4 py-6 overflow-y-auto"
      style={{
        backgroundColor: '#F0F2F5',
        backgroundImage: `url(${LOCKER_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Animated particle background — reuses FloatingParticles from CadeOverlayGate */}
      <FloatingParticles color={LOCKER_TEAL} />
      {/* Secondary color layer for brand depth */}
      <FloatingParticles color={LOCKER_BLUE} />

      <div className="flex flex-col md:flex-row items-center max-w-7xl w-full justify-center my-auto relative z-10">

        {/* ── Baldi + food truck illustration slot ──────────────────────────
            Oculto en mobile (visible solo en md+). */}
        {BALDI_TRUCK && (
          <motion.div
            className="hidden md:flex items-center justify-center min-w-0 mr-4 lg:mr-8 relative"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <img
              src={BALDI_TRUCK}
              alt="Baldi"
              width={799}
              height={1086}
              className="h-[26rem] lg:h-[32rem] w-auto max-h-[80vh] object-contain drop-shadow-xl"
            />
          </motion.div>
        )}

        {/* ── White card ────────────────────────────────────────────────── */}
        <motion.div
          className="max-w-sm w-full md:w-[400px] md:max-w-none md:flex-shrink-0 bg-white rounded-3xl shadow-md p-5 sm:p-8 relative"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          {/* 1. Standard BaldeCash logo */}
          <img
            src={BALDECASH_LOGO}
            alt="BaldeCash"
            width={160}
            height={56}
            fetchPriority="high"
            className="w-32 sm:w-40 h-auto mx-auto mb-5"
          />

          {/* 2. Title + subtitle */}
          <div className="text-center mb-5">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: LOCKER_NAVY }}>
              {stateTitle()}
            </h2>
            {stateSubtitle() && (
              <p className="text-gray-400 text-xs sm:text-sm mt-1 whitespace-pre-line">
                {stateSubtitle()}
              </p>
            )}
          </div>

          {/* 3. Horizontal 3-step stepper */}
          <div className="flex items-start justify-between mb-6 px-1" aria-label="Progreso de verificación">

            {/* Step 1: Ingresa DNI */}
            <div className="flex flex-col items-center flex-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: LOCKER_TEAL }}
                aria-label="Ingresa DNI"
              >
                {activeStep > 0 ? (
                  // Completado (ya envió el DNI): check
                  <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                ) : (
                  // Activo en D1 (aún no envía): número de paso, no check
                  <span className="text-xs font-bold text-white leading-none">1</span>
                )}
              </div>
              <span
                className="text-[11px] sm:text-xs font-semibold mt-2 text-center leading-tight"
                style={{ color: LOCKER_TEAL }}
              >
                Ingresa<br />DNI
              </span>
            </div>

            {/* Connector line 1→2 — bicolor teal→azul al alcanzar revisión */}
            <div
              className="h-[2px] flex-1 mt-[18px] mx-1"
              style={
                activeStep >= 1
                  ? { backgroundImage: `linear-gradient(to right, ${LOCKER_TEAL} 0%, ${LOCKER_TEAL} 50%, ${LOCKER_BLUE} 50%, ${LOCKER_BLUE} 100%)` }
                  : { backgroundColor: '#D1D5DB' }
              }
              aria-hidden
            />

            {/* Step 2: En revisión */}
            <div className="flex flex-col items-center flex-1">
              <motion.div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={
                  activeStep > 1
                    ? { backgroundColor: LOCKER_BLUE }            // completed
                    : activeStep === 1
                      ? { backgroundColor: LOCKER_BLUE }           // active
                      : { backgroundColor: '#E5E7EB' }             // pending
                }
                animate={activeStep === 1 ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 1.4, repeat: activeStep === 1 ? Infinity : 0, ease: 'easeInOut' }}
                aria-label="Validando"
              >
                {activeStep > 1 ? (
                  <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                ) : (
                  <Search
                    className="w-4 h-4"
                    style={{ color: activeStep === 1 ? 'white' : '#9CA3AF' }}
                    strokeWidth={2}
                  />
                )}
              </motion.div>
              <span
                className="text-[11px] sm:text-xs font-semibold mt-2 text-center leading-tight"
                style={{ color: activeStep >= 1 ? LOCKER_BLUE : '#9CA3AF' }}
              >
                Validando
              </span>
            </div>

            {/* Connector line 2→3 (dotted while step 3 is pending; color by outcome once reached) */}
            <div
              className="h-[2px] flex-1 mt-[18px] mx-1"
              style={{
                backgroundColor: activeStep >= 2 ? step3Color : 'transparent',
                backgroundImage: activeStep < 2
                  ? 'repeating-linear-gradient(to right, #D1D5DB 0px, #D1D5DB 6px, transparent 6px, transparent 12px)'
                  : undefined,
              }}
              aria-hidden
            />

            {/* Step 3: Resultado — ícono/color según outcome (success/fail/pending/unknown) */}
            <div className="flex flex-col items-center flex-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                style={
                  activeStep === 2
                    ? { backgroundColor: step3Color, borderColor: step3Color }   // alcanzado: color por resultado
                    : { backgroundColor: 'transparent', borderColor: '#D1D5DB', borderStyle: 'dotted' }  // pendiente
                }
                aria-label="Resultado"
              >
                {step3Outcome === 'success' && <Check className="w-4 h-4 text-white" strokeWidth={2.5} />}
                {step3Outcome === 'fail' && <X className="w-4 h-4 text-white" strokeWidth={2.5} />}
                {step3Outcome === 'pending' && <Clock className="w-4 h-4 text-white" strokeWidth={2} />}
                {step3Outcome === 'unknown' && <AlertTriangle className="w-4 h-4 text-white" strokeWidth={2} />}
              </div>
              <span
                className="text-[11px] sm:text-xs font-semibold mt-2 text-center leading-tight"
                style={{ color: activeStep >= 2 ? step3Color : '#9CA3AF' }}
              >
                Resultado
              </span>
            </div>
          </div>

          {/* 4. Card body — changes per state */}
          <AnimatePresence mode="wait">
            <motion.div
              key={ctx.state}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* D1: DNI input + Validar button (vía useDniValidation).
                  Al validar: el hook guarda access_token con saveVipToken y
                  first_name con saveVipName; luego llama handleDniValidated
                  que transiciona a d2-loading con el token ya persistido. */}
              {ctx.state === 'd1' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Número de documento
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={hookDni}
                      onChange={(e) => handleDniChange(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleDniSubmit(); }}
                      placeholder="Ingresa tu número de documento"
                      maxLength={12}
                      disabled={submitting}
                      aria-label="Número de documento"
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl text-base text-gray-800 font-medium outline-none focus:ring-2 placeholder:text-gray-400 disabled:opacity-70"
                      style={{ '--tw-ring-color': LOCKER_TEAL } as React.CSSProperties}
                    />
                    {/* Error de validación inline — no se expone el valor ingresado */}
                    {hookDni.length > 0 && !isValidDni && !submitting && (
                      <p className="mt-1.5 text-sm text-red-500">
                        Ingresa un documento válido (8 a 12 dígitos numéricos).
                      </p>
                    )}
                    {dniErrorMsg && (
                      <p className="mt-1.5 text-sm text-red-500">{dniErrorMsg}</p>
                    )}
                  </div>

                  {/* Tu acceso está en otra landing (sibling match) */}
                  {siblingMatch && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(0,191,179,0.08)', border: '1px solid rgba(0,191,179,0.2)' }}>
                      <p className="text-sm text-gray-700 mb-1">
                        Hola <span className="font-semibold">{siblingMatch.firstName}</span>, tu acceso está en:
                      </p>
                      <p className="text-base font-bold mb-3" style={{ color: LOCKER_TEAL }}>{siblingMatch.name}</p>
                      <a
                        href={routes.catalogo(siblingMatch.slug)}
                        className="w-full py-3 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                        style={{ backgroundColor: LOCKER_TEAL }}
                      >
                        Ir a mi acceso
                        <ArrowRight className="w-5 h-5" strokeWidth={2} />
                      </a>
                    </div>
                  )}

                  {/* Documento sin acceso */}
                  {showRegister && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <p className="text-sm text-gray-700">
                        Tu documento no tiene acceso a esta promoción.
                      </p>
                    </div>
                  )}

                  {/* Botón de validación — se oculta cuando se muestra sibling o showRegister */}
                  {!siblingMatch && !showRegister && (
                    <button
                      onClick={handleDniSubmit}
                      disabled={!isValidDni || submitting}
                      className="w-full py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: LOCKER_TEAL }}
                    >
                      {submitting ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" role="status">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <>
                          Validar acceso
                          <ArrowRight className="w-5 h-5" strokeWidth={2} />
                        </>
                      )}
                    </button>
                  )}

                  {/* Ver catálogo — solo cuando el DNI no está en la whitelist
                      (mensaje "no encontrado"). Lleva al catálogo público /home;
                      no se reenvía el cupón de campaña (eso es exclusivo del
                      redirect del gate en handleViewCatalog). */}
                  {dniErrorMsg === DNI_NOT_FOUND_MSG && (
                    <a
                      href={routes.catalogo('home')}
                      className="w-full py-3.5 rounded-xl text-base font-semibold border-2 bg-white transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      style={{ borderColor: LOCKER_TEAL, color: LOCKER_TEAL }}
                    >
                      Ver catálogo
                      <ArrowRight className="w-5 h-5" strokeWidth={2} />
                    </a>
                  )}
                </div>
              )}

              {/* D2-loading: chip "Este proceso puede tardar unos segundos" */}
              {ctx.state === 'd2-loading' && (
                <div className="flex justify-center py-2">
                  <span
                    className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full"
                    style={{ backgroundColor: 'rgba(0,191,179,0.1)', color: LOCKER_TEAL }}
                  >
                    <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                    Este proceso puede tardar unos segundos
                  </span>
                </div>
              )}

              {/* D2-result: "Ver catálogo" button */}
              {ctx.state === 'd2-result' && (
                <button
                  onClick={handleViewCatalog}
                  className="w-full py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  style={{ backgroundColor: LOCKER_TEAL }}
                >
                  Ver catálogo
                  <ArrowRight className="w-5 h-5" strokeWidth={2} />
                </button>
              )}

              {/* Waiting: no_normal sin catalog_url */}
              {ctx.state === 'waiting' && (
                <p className="text-center text-sm text-gray-500 py-2">
                  Pronto nos comunicaremos contigo.
                </p>
              )}

              {/* D3: no_access — mensaje en título + subtítulo; pregunta + botón para reingresar DNI */}
              {ctx.state === 'd3' && (
                <div className="space-y-2.5 text-center">
                  <p className="text-xs sm:text-sm text-gray-500">
                    ¿Digitaste mal tu DNI? Vuelve a ingresarlo aquí.
                  </p>
                  <button
                    onClick={handleBackToD1}
                    className="w-full py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    style={{ borderColor: LOCKER_TEAL, color: LOCKER_TEAL, backgroundColor: 'transparent' }}
                  >
                    Volver a intentar
                  </button>
                </div>
              )}

              {/* Error: red de /evaluate con botón Reintentar */}
              {ctx.state === 'error' && (
                <div className="space-y-3 text-center">
                  <p className="text-sm text-red-500">
                    {ctx.errorMsg ?? 'No pudimos verificar tu acceso.'}
                  </p>
                  <button
                    onClick={handleRetry}
                    className="w-full py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                    style={{ borderColor: LOCKER_TEAL, color: LOCKER_TEAL, backgroundColor: 'transparent' }}
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* 5. Footer: privacy note */}
          <p className="mt-5 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
            Tus datos están protegidos.
          </p>
        </motion.div>
      </div>
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

      // Bypass del auto-allow para variants que NO deben pasar directo con
      // ?vip_auto= (ver VARIANTS_WITHOUT_TOKEN_AUTO_ALLOW). Se ejecuta ANTES del
      // bloque de auto-allow para que estos gates siempre se muestren y corran su
      // propia validación (p.ej. locker-truck → /evaluate/Equifax), incluso si
      // llega con ?vip_auto=. El token queda en la URL para que el overlay lo lea.
      if (VARIANTS_WITHOUT_TOKEN_AUTO_ALLOW.includes(variant)) {
        if (hasGatePass(landing)) {
          // El usuario ya pasó el gate en esta sesión → acceso directo
          setStatus('allowed');
          return;
        }
        // Reingreso dentro de la ventana de caché (7 días): si el outcome
        // cacheado fue acceso normal a ESTA landing, se concede acceso directo
        // al catálogo sin reabrir el overlay ni re-evaluar (equivalente
        // persistente del gatePass). Los demás outcomes (convenio/espera) caen
        // al overlay, que los rutea desde el caché sin re-pedir DNI.
        // Se omite si llega ?vip_auto= en la URL: ese link fresco re-evalúa.
        const hasVipAuto =
          typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).has('vip_auto');
        if (!hasVipAuto) {
          const cachedEval = getEvalCache(landing);
          if (
            cachedEval?.status === 'normal' &&
            cachedEval.catalogUrl &&
            cachedEval.catalogUrl.includes(`/${landing}/catalogo`)
          ) {
            setStatus('allowed');
            return;
          }
        }
        setOverlayVariant(variant);
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
