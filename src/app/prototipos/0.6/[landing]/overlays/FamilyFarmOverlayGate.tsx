'use client';

/**
 * FamilyFarmOverlayGate (BAL-2521/BAL-2522)
 *
 * Extracted out of layout.tsx (BAL-2522 Commit B) so the component is
 * importable/testable in isolation — see design D2. State machine,
 * evaluateFamilyFarmAccess call, redirects, saveVipToken/saveVipName,
 * digit sanitization and submit gating remain byte-identical to the
 * extraction; Commit C adds the visual redesign in this file plus the
 * colocated `familyFarmOverlay.module.css`.
 *
 * Deliberately does NOT import the shared `DniInputRow` or `FloatingParticles`
 * (design D2 point 4 / spec "No decorative particles in this variant"): the
 * field/button are authored inline instead of forking a single-use shared
 * component, and no decorative particles render here. This keeps CADE
 * isolation structural (the import boundary is the guarantee), not just a
 * promise in a code comment.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { saveVipToken, saveVipName } from '../../components/hero/DniModal';
import { useSessionOptional } from '../solicitar/context/SessionContext';
import { routes } from '../../utils/routes';
import { evaluateFamilyFarmAccess } from '../../services/landingApi';
import styles from './familyFarmOverlay.module.css';

const DOC_MIN_LENGTH = 8;
const DOC_MAX_LENGTH = 12;

const FAMILY_FARM_BG_URL = '/assets/family-farm/fondo-campo.webp';
const FAMILY_FARM_LOGO_URL = '/assets/family-farm/logo-family-farms.webp';

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

  // Preload both critical images: the background photo gates first paint,
  // and CSS background-image is discovered late by the browser (D3).
  const preloadedRef = useRef(false);
  useEffect(() => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;
    for (const href of [FAMILY_FARM_BG_URL, FAMILY_FARM_LOGO_URL]) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className={styles.overlay}>
      <img
        className={styles.logo}
        src={FAMILY_FARM_LOGO_URL}
        alt="BaldeCash x Family Farms"
        width={375}
        height={120}
        fetchPriority="high"
      />

      <div className={styles.stage}>
        <div className={styles.card}>
          {view === 'form' && (
            <div className={styles.fade}>
              <div className={styles.head}>
                <p className={styles.kicker}>Acceso</p>
                <h2 className={styles.title}>
                  <span>Family Farms</span>
                </h2>
                <p className={styles.sub}>Descubre tus equipos disponibles</p>
                <p className={styles.subNote}>
                  Ingresa tu DNI y conoce los equipos que puedes financiar con BaldeCash.
                </p>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="familyfarm-dni">
                  Número de documento
                </label>
                <input
                  id="familyfarm-dni"
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={dni}
                  onChange={(e) => handleChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                  placeholder="Ingresa tu DNI"
                  maxLength={DOC_MAX_LENGTH}
                  disabled={submitting}
                  aria-invalid={!!errorMsg}
                />
                {errorMsg && <p className={styles.err}>{errorMsg}</p>}
              </div>

              <button
                className={`${styles.btnSubmit} ${submitting ? styles.isLoading : ''}`}
                onClick={handleSubmit}
                disabled={!isValidDni || submitting}
              >
                {submitting ? (
                  <span className={styles.spin} role="status" />
                ) : (
                  <span className={styles.btnLabel}>Ver equipos</span>
                )}
              </button>

              {/* Found in sibling landing — CADE-exact: link only, no re-validation */}
              {siblingMatch && (
                <div className={`${styles.notice} ${styles.sibling}`}>
                  <p>
                    Hola <span style={{ fontWeight: 600 }}>{siblingMatch.firstName}</span>, tu acceso está en:
                  </p>
                  <p className={styles.land}>{siblingMatch.name}</p>
                  <a href={routes.catalogo(siblingMatch.slug)} className={styles.btnPrimary}>
                    Empezar
                  </a>
                </div>
              )}

              {/* Not found anywhere — closed message, CADE parity */}
              {noAccess && (
                <div className={`${styles.notice} ${styles.noaccess}`}>
                  <p>Tu documento no tiene acceso a esta promoción.</p>
                </div>
              )}

              <p className={styles.foot}>Tus datos están protegidos.</p>
            </div>
          )}

          {view === 'welcome' && (
            <div className={`${styles.welcome} ${styles.fade}`}>
              <h2 className={styles.welcomeTitle}>
                {firstName ? `¡Hola, ${firstName}!` : '¡Bienvenido!'}
              </h2>
              <p className={styles.welcomeMsg}>
                Nos alegra verte.<br />
                Estás listo para vivir la experiencia Family Farm.
              </p>

              <div className={styles.docChip}>
                <div className={styles.tag}>
                  <span>Documento</span>
                </div>
                <span className={styles.docVal}>{dni}</span>
              </div>

              <button
                className={styles.btnOutline}
                onClick={() => {
                  // On pass, go to THIS landing's own catalog. Not hardcoded:
                  // the destination is always the current landing slug.
                  window.location.assign(routes.catalogo(landing));
                }}
              >
                Comenzar
              </button>

              <p className={styles.foot}>Tus datos están protegidos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
