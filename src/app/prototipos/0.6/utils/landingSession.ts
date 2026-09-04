import { clearVipData, clearSavedDni, getSavedDni } from '../components/hero/DniModal';
import { clearPendingParams, clearPromotorAttribution, readPromotorRef } from './landingParams';
import { clearUtmParams, persistUtmParams } from './utmParams';
import { borrarFranja } from '../components/referral/referralBannerCache';
import {
  clearWizardFormStorage,
  readWizardDocumentNumber,
} from '../[landing]/solicitar/context/WizardContext';
import { clearSessionStorage, sesionYaConvertida } from '../[landing]/solicitar/context/SessionContext';
import { clearProductStorage } from '../[landing]/solicitar/context/ProductContext';
import { clearConsentStorage } from '../[landing]/solicitar/utils/consentStorage';
import {
  clearKycProgressStorage,
  clearWizardFieldStorage,
} from '../[landing]/solicitar/utils/wizardScopedStorage';
import { clearOtpHandoff } from '../[landing]/solicitar/utils/otpHandoff';
import { clearCatalogBrowsingStorage } from '../[landing]/catalogo/hooks/useCatalogSharedState';

/**
 * Clears every trace of the current client on a landing: access, personal data,
 * application progress and browsing.
 *
 * WHY THIS COMPOSES INSTEAD OF LISTING KEYS — do not "simplify" it back:
 *
 * The first version enumerated storage keys by hand. It shipped to production
 * and missed the application form, because that key is named
 * `baldecash-wizard-<slug>-data` — prefix BEFORE the slug — while the list only
 * covered `baldecash-<slug>-*` and `baldecash-dni-<slug>`. The next client
 * opened the form pre-filled with the previous client's document, names, birth
 * date and gender, unable to edit it. See BAL-2657.
 *
 * A hand-written list cannot survive: it rots the moment anyone adds a field or
 * renames a key. So each owner exports its own clearing function and this
 * composes them. That is already how the post-submit cleanup works
 * (`useSubmitApplication.ts`).
 *
 * NOT cleared on purpose: `baldecash-<landing>-onboarding-catalog`. It only
 * records that the welcome tour was dismissed — no client data — and clearing
 * it would make the tour reappear for every client an activator serves.
 */
/**
 * Clears the client's data WITHOUT touching access or gate state.
 *
 * Exists for callers that must not disturb how the person got in. The
 * locker-truck gate is the reason: it deliberately does NOT store a VIP token
 * from `?vip_auto=` — it always runs its own `/evaluate` (Equifax
 * qualification) and only stores a token when the outcome is `normal`
 * (`layout.tsx:926`). Wiping its eval cache and gate pass mid-flow, or handing
 * it a token it never issued, would let someone skip that qualification.
 *
 * So when the access was established by someone else's timing, clear the data
 * and leave the door alone.
 */
export function clearLandingClientData(landing: string): void {
  clearWizardFormStorage(landing);
  clearWizardFieldStorage(landing);
  clearConsentStorage(landing);
  clearProductStorage(landing);
  clearKycProgressStorage(landing);
  clearOtpHandoff(landing);
  clearCatalogBrowsingStorage(landing);
  clearPendingParams(landing);
  clearSessionStorage(landing);
}

/**
 * Options for {@link clearLandingSession}.
 *
 * `keepTrackingSession` exists for one caller: the identity reset when there is
 * no previous identity to compare against. See the note there.
 */
interface ClearLandingSessionOptions {
  keepTrackingSession?: boolean;
}

export function clearLandingSession(
  landing: string,
  { keepTrackingSession = false }: ClearLandingSessionOptions = {}
): void {
  // Access: VIP token, name, welcome-pending and the locker-truck gate signals.
  clearVipData(landing);

  // Personal data.
  clearSavedDni(landing);
  clearWizardFormStorage(landing);
  clearWizardFieldStorage(landing);
  clearConsentStorage(landing);

  // Application progress.
  clearProductStorage(landing);
  clearKycProgressStorage(landing);
  clearOtpHandoff(landing);

  // Browsing and campaign context.
  clearCatalogBrowsingStorage(landing);
  clearPendingParams(landing);

  // Tracking session, last: the next client must not inherit it.
  if (!keepTrackingSession) clearSessionStorage(landing);
}

/**
 * Wipes the previous client's session when the DNI being validated belongs to
 * someone else. Returns true when it cleared.
 *
 * CALL THIS BEFORE WRITING THE NEW IDENTITY. `clearLandingSession` also removes
 * the VIP token, name and saved DNI. The caller rewrites those immediately
 * after, but calling this AFTER the write would delete the token just issued
 * and bounce the client back to the overlay in a loop.
 *
 * Why it exists: the home of a landing with a whitelist clears the VIP data on
 * every load, so the overlay reappears and a second person can validate on the
 * same device (`LandingPageClient.tsx:319-337`). That is deliberate — the home
 * is the public door. What was NOT deliberate is that the first person's form
 * survived that re-validation, handing their document, names and consents to
 * the second one. See BAL-2661.
 *
 * The data is kept when the DNI matches: the same person coming back from the
 * home should not have to retype anything. Only a change of person clears.
 */
export function resetLandingSessionIfIdentityChanged(
  landing: string,
  incomingDni: string
): boolean {
  const dni = incomingDni?.trim();
  if (!dni) return false;

  // The saved DNI is the primary reference. The document stored inside the form
  // is the fallback: that key can be cleared on its own, and the form still
  // carries the document of whoever filled it.
  const previousDni = getSavedDni(landing) ?? readWizardDocumentNumber(landing);

  // Same person coming back — keep their data, that is the whole point.
  if (previousDni === dni) return false;

  // No reference at all still clears, deliberately. On a first visit there is
  // nothing to remove and this is a no-op; any other time it means leftover
  // data we cannot attribute to anyone, and unattributable data on a shared
  // device is exactly what produced BAL-2657 and BAL-2661.
  //
  // This does not hurt the legitimate client: `clearVipData` — what the landing
  // home runs on every load — does NOT remove the saved DNI, so someone
  // returning from the home always keeps their reference. Losing it requires an
  // explicit wipe, and the only thing that does that is the activator's reset,
  // which clears everything anyway.
  //
  // EXCEPT the tracking session, and only in this branch. With no previous
  // identity there is no evidence that a different person was here — the usual
  // case is a FIRST visit, where the session being wiped is the one this very
  // visitor created seconds ago on the landing, carrying the UTMs of the QR they
  // scanned. Losing it made the next page open a fresh session on a clean URL
  // (`routes.catalogo()` drops the querystring), the application hung off that
  // one, and the promoter lost the sale. Clearing unattributable form data is
  // right; paying for it with the current visit's attribution is not.
  //
  // When the identity DID change the session still goes, right above: there the
  // wipe protects a real second person, which is the whole point of BAL-2661.
  clearLandingSession(landing, { keepTrackingSession: !previousDni });
  return true;
}

/**
 * Same identity check, but clearing ONLY the data — never access or gate state.
 *
 * Used by the `?vip_auto=` path, where the access is established by a different
 * actor whose timing we do not control: the gate saves the token in its own
 * effect, and the locker-truck variant deliberately withholds it until its
 * `/evaluate` qualification returns `normal`. Clearing access there would
 * either bounce the person or hand locker-truck a token it never issued,
 * skipping the qualification.
 *
 * The overlay path uses `resetLandingSessionIfIdentityChanged` instead: there
 * the identity is known before anything is written, so the full clear is safe
 * and correct.
 */
export function resetLandingClientDataIfIdentityChanged(
  landing: string,
  incomingDni: string
): boolean {
  const dni = incomingDni?.trim();
  if (!dni) return false;

  const previousDni = getSavedDni(landing) ?? readWizardDocumentNumber(landing);
  if (previousDni === dni) return false;

  clearLandingClientData(landing);
  return true;
}

// ── Cambio de link de promotora ──────────────────────────────────────────────

const promotorLinkKey = (landing: string) => `baldecash-${landing}-promotor-link`;

/**
 * Con qué promotora y activación se identifica un link, o null si el link no
 * es de promotora.
 *
 * Toma los TRES identificadores que puede traer un link de activación, porque
 * ninguno viaja siempre: `ref` lo estampa `/r/{codigo}` del hub, `promotor` sólo
 * aparece cuando esa persona tiene su código en ws2, y los tokens `promo_`/`act_`
 * del `utm_term` van en la URL que arma el hub directo. Con uno solo, un link
 * "sin ref" parecería orgánico y no limpiaría.
 *
 * NO entran la pieza (`utm_source`/`utm_content`), el `punto_` ni el `fly_`: el
 * mismo QR compartido después por WhatsApp, o el flyer del mismo paquete, es la
 * misma promotora y no tiene por qué borrarle el formulario al alumno.
 */
export function huellaDelLinkDePromotor(search: string): string | null {
  const params = new URLSearchParams(search);
  const ref = readPromotorRef(search) ?? '';
  const promotor = params.get('promotor')?.trim().toLowerCase() ?? '';
  const term = params.get('utm_term') ?? '';
  const promo = term.match(/(?:^|__)promo_([^_]+)/)?.[1] ?? '';
  const act = term.match(/(?:^|__)act_([^_]+)/)?.[1] ?? '';

  if (!ref && !promotor && !promo && !act) return null;
  return [ref, promotor, promo, act].join('|');
}

/**
 * Cuando se abre el link de OTRA promotora en el mismo equipo, borra toda la
 * visita anterior —datos, progreso, atribución, franja y sesión de tracking— y
 * recuerda el link nuevo. Devuelve true cuando limpió.
 *
 * Por qué existe: un celular en un stand pasa por varias manos. La promotora A
 * abre su link, un alumno deja la solicitud, y al rato la promotora B abre el
 * suyo en el mismo equipo: veía la solicitud recibida de A con su propia franja
 * encima, y el siguiente alumno heredaba el `ref`, los UTMs y el `session_uuid`
 * de A. La venta se le acreditaba a la promotora equivocada.
 *
 * La identidad del link es la de `huellaDelLinkDePromotor`. El MISMO link que
 * se vuelve a abrir —recarga, volver del catálogo— no limpia: el alumno que ya
 * empezó su formulario lo conserva. Un link sin identificador de promotora
 * (orgánico, un anuncio) tampoco limpia: la regla es de los links del hub.
 *
 * EXCEPTO cuando la sesión guardada ya envió una solicitud. Ahí el mismo link
 * también limpia: la promotora volvió a abrir su QR para el siguiente alumno,
 * y ese alumno no es el que acaba de enviar. Sin esto, su recorrido por el
 * catálogo caía sobre la sesión convertida del anterior, y en ws2 esa sesión
 * terminaba con dos, cuatro y hasta nueve solicitudes colgando.
 *
 * Al terminar deja el store de UTMs con los del link que está entrando (no
 * vacío): la sesión nueva nace en el catálogo, sin querystring, y lee de ahí.
 * Así el `utm_term` llega igual aunque nadie más vuelva a persistirlo.
 *
 * Sin link recordado igual limpia. Si el equipo venía de una visita orgánica,
 * hay restos que no son de esta promotora; si es la primera visita, no hay nada
 * y borrar en vacío no cuesta nada.
 *
 * A diferencia de `resetLandingSessionIfIdentityChanged`, acá también se suelta
 * la ATRIBUCIÓN (`ref`, `alk`, UTMs, franja): cambió la promotora, no sólo la
 * persona. Y la sesión de tracking se borra siempre: esto corre en la landing,
 * donde todavía no hay `SessionProvider`, así que no hay sesión recién creada
 * que perder — la próxima nace en el catálogo, ya con los parámetros del link
 * nuevo que `captureLandingParams`/`persistUtmParams` guardan justo después.
 *
 * ORDEN: llamarla ANTES de capturar los parámetros del link nuevo y antes de que
 * la franja se guarde (`ReferralBanner` la guarda en su efecto de montaje). Si
 * corriera después, borraría justo lo que el link nuevo acaba de dejar.
 */
export function resetLandingSessionIfPromoterLinkChanged(
  landing: string,
  search: string
): boolean {
  if (typeof window === 'undefined') return false;

  const huella = huellaDelLinkDePromotor(search);
  if (!huella) return false;

  let anterior: string | null = null;
  try {
    anterior = localStorage.getItem(promotorLinkKey(landing));
  } catch {
    // Sin storage no hay nada guardado ni forma de guardar: no-op.
    return false;
  }
  if (anterior === huella && !sesionYaConvertida(landing)) return false;

  clearLandingSession(landing);
  clearPromotorAttribution(landing);
  clearUtmParams();
  borrarFranja(landing);
  persistUtmParams(search);

  try {
    localStorage.setItem(promotorLinkKey(landing), huella);
  } catch {
    // Si no se pudo recordar, la próxima carga volverá a limpiar. Aceptable.
  }
  return true;
}
