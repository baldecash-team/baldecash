/**
 * Owns the persisted consent checkboxes of the application form.
 *
 * These keys had no owner: they were built inline in `solicitarClient.tsx` and
 * `GamerSolicitarClient.tsx`, and nothing ever removed them — not even the
 * post-submit cleanup. On a shared device that means the next person opens the
 * form with the terms already marked as accepted by someone else, which is a
 * consent attributed to a person who never gave it.
 */

const getAcceptTermsKey = (landing: string) => `baldecash-${landing}-wizard-acceptTerms`;
const getAcceptPrivacyKey = (landing: string) => `baldecash-${landing}-wizard-acceptPrivacy`;
const getAcceptPromosKey = (landing: string) => `baldecash-${landing}-wizard-acceptPromos`;

export const consentStorageKeys = (landing: string) => [
  getAcceptTermsKey(landing),
  getAcceptPrivacyKey(landing),
  getAcceptPromosKey(landing),
];

/** Drops the persisted consent checkboxes for a landing. */
export function clearConsentStorage(landing: string): void {
  if (typeof window === 'undefined') return;
  for (const key of consentStorageKeys(landing)) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable (private mode / quota). Keep clearing the rest.
    }
  }
}
