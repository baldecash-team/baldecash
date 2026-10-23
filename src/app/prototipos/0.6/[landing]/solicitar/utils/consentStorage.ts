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

/**
 * Las casillas tal como viajan al backend en el submit (BAL-5007). ws2 escribe
 * una fila en `application_consent` por cada una que llegue en `true`; `false`
 * o ausente es "no aceptó".
 */
export interface SubmitConsents {
  terms: boolean;
  privacy: boolean;
  promos: boolean;
}

/** Lo que se sabe de cada casilla: `undefined` = no hay dato, ni sí ni no. */
export type PartialSubmitConsents = Partial<SubmitConsents>;

function leerCasilla(key: string): boolean | undefined {
  try {
    const v = localStorage.getItem(key);
    return v === null ? undefined : v === 'true';
  } catch {
    return undefined;
  }
}

/**
 * Arma el bloque `consents` del submit con lo guardado y, para la casilla que
 * no tenga nada guardado, con lo que la pantalla tiene marcado (`enPantalla`).
 *
 * Devuelve `undefined` si no hay NINGÚN dato: en ese caso el submit omite el
 * bloque y ws2 avisa a Sentry. No se inventa un `true` — una aceptación que la
 * persona no dio es peor que una que falta. Una casilla sin dato, con otras que
 * sí lo tienen, va en `false`.
 *
 * Hay que llamarla ANTES de `clearConsentStorage`: después ya no queda nada.
 */
export function readSubmitConsents(
  landing: string,
  enPantalla?: PartialSubmitConsents,
): SubmitConsents | undefined {
  const guardado: PartialSubmitConsents =
    typeof window === 'undefined'
      ? {}
      : {
          terms: leerCasilla(getAcceptTermsKey(landing)),
          privacy: leerCasilla(getAcceptPrivacyKey(landing)),
          promos: leerCasilla(getAcceptPromosKey(landing)),
        };
  const terms = guardado.terms ?? enPantalla?.terms;
  const privacy = guardado.privacy ?? enPantalla?.privacy;
  const promos = guardado.promos ?? enPantalla?.promos;
  if (terms === undefined && privacy === undefined && promos === undefined) {
    return undefined;
  }
  return { terms: terms === true, privacy: privacy === true, promos: promos === true };
}
