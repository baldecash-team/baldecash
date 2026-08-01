import { clearVipData } from '../../../../components/hero/DniModal';

/**
 * Clears every trace of the current client's session on a Family Farm landing.
 *
 * `clearVipData` alone is not enough: it drops the VIP token, name and
 * welcome-pending flag, but leaves two keys behind that carry the previous
 * client's identity across the reset —
 *
 *   - `baldecash-dni-<slug>`                  written at layout.tsx:127 and :1478,
 *     read by DocumentNumberField.tsx:62-66 to PRE-FILL the DNI field of the
 *     application form. Left behind, the next client finds the previous
 *     client's document number already typed in.
 *   - `baldecash-<slug>-wizard-session-uuid`  written at layout.tsx:98. Left
 *     behind, the next client's tracking events are attributed to the previous
 *     client's session.
 *
 * Scoped deliberately to the activator reset flow instead of being folded into
 * `clearVipData`, which is shared with the CADE and locker-truck gates.
 */

/** Identity of the client who was being served. */
const identityKeys = (landing: string) => [
  // Written at layout.tsx:127 and :1478; read by DocumentNumberField.tsx:62-66
  // to PRE-FILL the DNI field of the application form.
  `baldecash-dni-${landing}`,
  // Written at layout.tsx:98. Left behind, the next client's tracking events
  // are attributed to the previous client's session.
  `baldecash-${landing}-wizard-session-uuid`,
];

/**
 * Everything the client did while browsing. Not identifying on its own, but the
 * next client would inherit a catalog that silently remembers someone else's
 * choices — favourites they never marked, an equipment already selected.
 */
const activityKeys = (landing: string) => [
  `baldecash-${landing}-compare`, // CatalogoClient.tsx:1098
  `baldecash-${landing}-wishlist`, // useCatalogSharedState.ts:22
  `baldecash-${landing}-cart`, // useCatalogSharedState.ts:23
  // The equipment the client chose to finance. ProductContext.tsx:24 reads it
  // to preload the application form.
  `baldecash-${landing}-solicitar-selected-product`,
];

/**
 * NOT cleared on purpose: `baldecash-<landing>-onboarding-catalog`
 * (useOnboarding.ts:21). It only records that the welcome tour was dismissed —
 * it holds no client data, and clearing it would make the tour modal reappear
 * for every single client the activator serves.
 */
export function clearActivatorSession(landing: string): void {
  clearVipData(landing);

  if (typeof window === 'undefined') return;
  for (const key of [...identityKeys(landing), ...activityKeys(landing)]) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable (private mode / quota). Keep going and let the
      // navigation happen regardless.
    }
  }
}
