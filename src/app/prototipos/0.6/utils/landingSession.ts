import { clearVipData, clearSavedDni, getSavedDni } from '../components/hero/DniModal';
import { clearPendingParams } from './landingParams';
import {
  clearWizardFormStorage,
  readWizardDocumentNumber,
} from '../[landing]/solicitar/context/WizardContext';
import { clearSessionStorage } from '../[landing]/solicitar/context/SessionContext';
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

export function clearLandingSession(landing: string): void {
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
  clearSessionStorage(landing);
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
  clearLandingSession(landing);
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
