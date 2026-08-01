import { clearVipData, clearSavedDni } from '../../../../components/hero/DniModal';
import { clearPendingParams } from '../../../../utils/landingParams';
import { clearWizardFormStorage } from '../../../solicitar/context/WizardContext';
import { clearSessionStorage } from '../../../solicitar/context/SessionContext';
import { clearProductStorage } from '../../../solicitar/context/ProductContext';
import { clearConsentStorage } from '../../../solicitar/utils/consentStorage';
import {
  clearKycProgressStorage,
  clearWizardFieldStorage,
} from '../../../solicitar/utils/wizardScopedStorage';
import { clearOtpHandoff } from '../../../solicitar/utils/otpHandoff';
import { clearCatalogBrowsingStorage } from '../../hooks/useCatalogSharedState';

/**
 * Clears every trace of the current client on a Family Farm landing, so the
 * activator can hand the device to the next person.
 *
 * WHY THIS COMPOSES INSTEAD OF LISTING KEYS — do not "simplify" it back:
 *
 * The first version of this function enumerated storage keys by hand. It
 * shipped to production and missed the application form, because that key is
 * named `baldecash-wizard-<slug>-data` — prefix BEFORE the slug — while the
 * list only covered `baldecash-<slug>-*` and `baldecash-dni-<slug>`. The next
 * client opened the form pre-filled with the previous client's document,
 * names, birth date and gender, unable to edit it. See BAL-2657.
 *
 * A hand-written list cannot survive: it silently rots the moment anyone adds
 * a field or renames a key. So each owner now exports its own clearing
 * function and this composes them. Renaming a key is a one-line change in the
 * module that owns it, and both this path and the post-submit cleanup follow
 * automatically. That is already how the post-submit cleanup works
 * (`useSubmitApplication.ts`), and `clearVipData`, `clearOtpHandoff` and
 * `resetFormStartTracking` were already plain exported functions.
 *
 * NOT cleared on purpose: `baldecash-<landing>-onboarding-catalog`. It only
 * records that the welcome tour was dismissed — no client data — and clearing
 * it would make the tour reappear for every client the activator serves.
 */
export function clearActivatorSession(landing: string): void {
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
