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

export interface ConsentValues {
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptPromos: boolean;
}

/**
 * Lee las casillas guardadas. Una clave ausente se lee como `false`, igual que
 * la intro de /solicitar, que arranca desmarcada si no hay nada guardado.
 */
export function readConsentStorage(landing: string): ConsentValues {
  const leer = (key: string) => {
    try {
      return localStorage.getItem(key) === 'true';
    } catch {
      return false;
    }
  };
  return {
    acceptTerms: leer(getAcceptTermsKey(landing)),
    acceptPrivacy: leer(getAcceptPrivacyKey(landing)),
    acceptPromos: leer(getAcceptPromosKey(landing)),
  };
}

/**
 * Guarda las casillas con las mismas claves que la intro de /solicitar, que
 * son las que lee el envío de la solicitud. La usa el modal de "Lo quiero"
 * (BAL-4852): su casilla única deja aceptados términos Y privacidad.
 */
export function saveConsentStorage(landing: string, values: ConsentValues): void {
  if (typeof window === 'undefined') return;
  const pares: [string, boolean][] = [
    [getAcceptTermsKey(landing), values.acceptTerms],
    [getAcceptPrivacyKey(landing), values.acceptPrivacy],
    [getAcceptPromosKey(landing), values.acceptPromos],
  ];
  for (const [key, value] of pares) {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // Storage unavailable (private mode / quota). Keep writing the rest.
    }
  }
}
