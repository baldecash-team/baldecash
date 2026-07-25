'use client';

/**
 * FamilyFarmOverlayGate (BAL-2521/BAL-2522)
 *
 * Extracted out of layout.tsx (BAL-2522 Commit B) so the component is
 * importable/testable in isolation — see design D2. State machine,
 * evaluateFamilyFarmAccess call, redirects, saveVipToken/saveVipName,
 * digit sanitization and submit gating move verbatim.
 *
 * Deliberately does NOT import the shared `DniInputRow` or `FloatingParticles`
 * (design D2 point 4 / spec "No decorative particles in this variant"): the
 * field/button are authored inline instead of forking a single-use shared
 * component, and no decorative particles render here. This keeps CADE
 * isolation structural (the import boundary is the guarantee), not just a
 * promise in a code comment.
 */

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveVipToken, saveVipName } from '../../components/hero/DniModal';
import { useSessionOptional } from '../solicitar/context/SessionContext';
import { routes } from '../../utils/routes';
import { evaluateFamilyFarmAccess } from '../../services/landingApi';

const DOC_MIN_LENGTH = 8;
const DOC_MAX_LENGTH = 12;

interface SiblingMatch {
  slug: string;
  name: string;
  firstName: string;
}

export function FamilyFarmOverlayGate({ landing }: { landing: string; onValidated: () => void; deadline?: string }) {
  const session = useSessionOptional();
  const [view, setView] = useState<'form' | 'welcome'>('form');
  const [dni, setDni] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [siblingMatch, setSiblingMatch] = useState<SiblingMatch | null>(null);
  const [noAccess, setNoAccess] = useState(false);
  const [firstName, setFirstName] = useState('');

  const isValidDni = dni.length >= DOC_MIN_LENGTH && /^\d{8,12}$/.test(dni);

  const handleChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, DOC_MAX_LENGTH);
    setDni(cleaned);
    if (errorMsg) setErrorMsg(null);
    if (siblingMatch) setSiblingMatch(null);
    if (noAccess) setNoAccess(false);
  }, [errorMsg, siblingMatch, noAccess]);

  const handleSubmit = useCallback(async () => {
    if (!isValidDni || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    setSiblingMatch(null);
    setNoAccess(false);
    try {
      const data = await evaluateFamilyFarmAccess(landing, {
        dni,
        sessionUuid: session?.sessionUuid ?? undefined,
      });
      if (!data.valid) {
        if (data.found_in_sibling && data.sibling_landing_slug) {
          setSiblingMatch({
            slug: data.sibling_landing_slug,
            name: data.sibling_landing_name || data.sibling_landing_slug,
            firstName: data.first_name || '',
          });
        } else {
          setNoAccess(true);
        }
        setSubmitting(false);
        return;
      }
      if (data.access_token) saveVipToken(landing, data.access_token);
      if (data.first_name) saveVipName(landing, data.first_name);
      setFirstName(data.first_name || '');
      setView('welcome');
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.');
      setSubmitting(false);
    }
  }, [isValidDni, submitting, landing, dni, session?.sessionUuid]);

  const FAMILY_FARM_TEAL = '#00BFB3';
  const FAMILY_FARM_OVERLAY_BG = 'https://baldecash.s3.amazonaws.com/illustrations/cade-overlay-bg.webp';

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center px-4 py-6 overflow-y-auto"
      style={{ backgroundColor: '#F0F2F5', backgroundImage: `url(${FAMILY_FARM_OVERLAY_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="flex flex-col md:flex-row items-center max-w-5xl w-full justify-center my-auto">
        <motion.div
          className="max-w-sm w-full md:w-[400px] md:max-w-none md:flex-shrink-0 bg-white rounded-3xl shadow-md p-5 sm:p-8 relative"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {view === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-4 sm:mb-5">
                  <p className="text-gray-500 text-base sm:text-xl mb-1">Acceso</p>
                  <h2 className="text-xl sm:text-3xl font-bold" style={{ color: '#1B2A4A' }}>
                    <span style={{ color: FAMILY_FARM_TEAL }}>Family Farm</span>
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    Valida tu identidad para continuar
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Número de documento
                  </label>
                  <div className="flex items-stretch gap-2 w-full">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={dni}
                      onChange={(e) => handleChange(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                      placeholder="Número de documento"
                      maxLength={DOC_MAX_LENGTH}
                      disabled={submitting}
                      aria-label="Número de documento"
                      aria-invalid={!!errorMsg}
                      className="flex-1 min-w-0 py-3.5 px-4 bg-white rounded-xl text-base font-medium outline-none focus:ring-2 placeholder:text-gray-400 disabled:opacity-70"
                      style={{ color: '#1B2A4A', '--tw-ring-color': FAMILY_FARM_TEAL } as React.CSSProperties}
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!isValidDni || submitting}
                      className="px-5 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 inline-flex items-center justify-center min-w-[92px]"
                      style={{ backgroundColor: FAMILY_FARM_TEAL, color: '#1B2A4A' }}
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
                </div>

                {/* Found in sibling landing — CADE-exact: link only, no re-validation */}
                {siblingMatch && (
                  <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: 'rgba(0,191,179,0.08)', border: '1px solid rgba(0,191,179,0.2)' }}>
                    <p className="text-sm text-gray-700 mb-1">
                      Hola <span className="font-semibold">{siblingMatch.firstName}</span>, tu acceso está en:
                    </p>
                    <p className="text-base font-bold" style={{ color: FAMILY_FARM_TEAL }}>{siblingMatch.name}</p>
                    <a
                      href={routes.catalogo(siblingMatch.slug)}
                      className="mt-3 w-full py-3 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{ backgroundColor: FAMILY_FARM_TEAL }}
                    >
                      Empezar
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </a>
                  </div>
                )}

                {/* Not found anywhere — closed message, CADE parity */}
                {noAccess && (
                  <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p className="text-sm text-gray-700">
                      Tu documento no tiene acceso a esta promoción.
                    </p>
                  </div>
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
                <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1B2A4A' }}>
                  {firstName ? `¡Hola, ${firstName}!` : '¡Bienvenido!'}
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-5">
                  Nos alegra verte.<br />
                  Estás listo para vivir la experiencia Family Farm.
                </p>

                <div className="flex items-center rounded-xl py-2.5 px-4 mb-5 border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={FAMILY_FARM_TEAL} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                    </svg>
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: FAMILY_FARM_TEAL }}>Documento</span>
                  </div>
                  <span className="pl-3 text-base font-semibold text-gray-800">{dni}</span>
                </div>

                <button
                  onClick={() => {
                    // On pass, go to THIS landing's own catalog. Not hardcoded:
                    // the destination is always the current landing slug.
                    window.location.assign(routes.catalogo(landing));
                  }}
                  className="w-full py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'transparent', color: FAMILY_FARM_TEAL, border: `2px solid ${FAMILY_FARM_TEAL}` }}
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
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
