'use client';

/**
 * FamilyFarmOverlayGate (BAL-2521/BAL-2522)
 *
 * Extracted out of layout.tsx (BAL-2522 Commit B) so the component is
 * importable/testable in isolation — see design D2. Commit C added the visual
 * redesign in this file plus the colocated `familyFarmOverlay.module.css`.
 *
 * BAL-2867 colapsó el flujo a un solo clic: validar el DNI navega directo al
 * catálogo. Antes había dos pantallas de confirmación —"tu acceso está en
 * {landing}" para el match hermano, y "¡Hola, {nombre}!" para el propio— que
 * solo pedían un segundo clic hacia el mismo destino. Con eso desapareció la
 * máquina de estados `form`/`welcome`: el único desenlace que se queda en el
 * overlay es el de acceso denegado.
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
import { hardNavigate } from '../catalogo/components/activator/hardNavigate';
import styles from './familyFarmOverlay.module.css';

const DOC_MIN_LENGTH = 8;
const DOC_MAX_LENGTH = 12;

/*
 * Absolute S3 URLs, matching how every other image under prototipos/0.6 is
 * served. Do NOT move these back to `/assets/...` in `public/`: that directory
 * is not served in production, so relative paths 404 there — and the failure is
 * invisible locally, where `next dev` serves `public/` just fine.
 * Kept in sync with the `background-image` in familyFarmOverlay.module.css.
 */
const FAMILY_FARM_BG_URL = 'https://baldecash.s3.amazonaws.com/illustrations/fondo-campo.webp';
const FAMILY_FARM_LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo-family-farms.webp';

/**
 * Construye la URL de destino hacia la landing hermana, adjuntando el token de
 * acceso como `?vip_auto=<token>` cuando está presente. Cuando no hay token
 * (backend no lo envía) degrada a la URL sin query.
 *
 * Ese token pertenece a la landing DESTINO: viaja solo en la URL y nunca debe
 * pasar por `saveVipToken`, que persiste bajo la clave de la landing ACTUAL —
 * la landing-puerta no debe ganar acceso a su propio catálogo.
 */
function buildSiblingHref(slug: string, accessToken?: string): string {
  return routes.catalogo(slug, accessToken ? `vip_auto=${encodeURIComponent(accessToken)}` : undefined);
}

export function FamilyFarmOverlayGate({ landing }: { landing: string; onValidated: () => void; deadline?: string }) {
  const session = useSessionOptional();
  const [dni, setDni] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noAccess, setNoAccess] = useState(false);

  const isValidDni = dni.length >= DOC_MIN_LENGTH && /^\d{8,12}$/.test(dni);

  const handleChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, DOC_MAX_LENGTH);
    setDni(cleaned);
    if (errorMsg) setErrorMsg(null);
    if (noAccess) setNoAccess(false);
  }, [errorMsg, noAccess]);

  /*
   * Un solo clic hasta el catálogo (BAL-2867). Antes había dos pantallas de
   * confirmación intermedias — "tu acceso está en {landing}" para el match
   * hermano y "¡Hola, {nombre}!" para el propio — que solo pedían un segundo
   * clic para navegar al mismo destino. Ahora se navega en cuanto el backend
   * responde.
   *
   * `submitting` NO se apaga en los caminos que navegan: la navegación dura de
   * `hardNavigate` no desmonta el componente al instante, y soltar el botón
   * mientras la página se va permitiría un segundo submit.
   */
  const handleSubmit = useCallback(async () => {
    if (!isValidDni || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    setNoAccess(false);
    try {
      const data = await evaluateFamilyFarmAccess(landing, {
        dni,
        sessionUuid: session?.sessionUuid ?? undefined,
      });
      if (!data.valid) {
        if (data.found_in_sibling && data.sibling_landing_slug) {
          hardNavigate(buildSiblingHref(data.sibling_landing_slug, data.sibling_access_token));
          return;
        }
        setNoAccess(true);
        setSubmitting(false);
        return;
      }
      if (data.access_token) saveVipToken(landing, data.access_token);
      if (data.first_name) saveVipName(landing, data.first_name);
      hardNavigate(routes.catalogo(landing));
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

            {/* Único desenlace que se queda en el overlay: los dos caminos con
                acceso navegan directo al catálogo (BAL-2867). */}
            {noAccess && (
              <div className={`${styles.notice} ${styles.noaccess}`}>
                <p>Tu documento no tiene acceso a esta promoción.</p>
              </div>
            )}

            <p className={styles.foot}>Tus datos están protegidos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
