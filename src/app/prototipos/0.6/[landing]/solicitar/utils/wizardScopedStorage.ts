/**
 * Owns the application-flow keys whose name ends in a dynamic segment, so they
 * cannot be enumerated one by one.
 *
 * These lived inline inside `kycClient.tsx` and `StepClient.tsx` with no owner
 * and no cleanup. They get a module of their own rather than being exported
 * from those components so that clearing them does not drag two large client
 * components into the catalog bundle.
 */

/**
 * Removes every key starting with `prefix`.
 *
 * WHY THE PREFIX MUST END WITH A FIXED SEGMENT — this is the whole safety
 * argument, do not shorten it:
 *
 * Sweeping by `baldecash-<slug>-` alone is UNSAFE. Landing slugs nest: in
 * production the same device holds both `family-farms-baldecash` and
 * `family-farms-baldecash-a`, and the first is a prefix of the second. Clearing
 * the shorter landing would take the sibling's data with it.
 *
 * Including the fixed segment (`-kyc-step-`, `-wizard-field-`) removes the
 * ambiguity: `baldecash-family-farms-baldecash-kyc-step-` does not match
 * `baldecash-family-farms-baldecash-a-kyc-step-X`, because what follows the
 * shorter slug there is `-a-`, not the fixed segment.
 */
function removeByScopedPrefix(prefix: string): void {
  if (typeof window === 'undefined') return;
  try {
    const doomed = Object.keys(localStorage).filter((key) => key.startsWith(prefix));
    for (const key of doomed) {
      localStorage.removeItem(key);
    }
  } catch {
    // Storage unavailable (private mode / quota).
  }
}

/** `baldecash-<landing>-kyc-step-<stepCode>` — per-step KYC progress. */
export const getKycStepKey = (landing: string, code: string) =>
  `baldecash-${landing}-kyc-step-${code}`;

/** `baldecash-<landing>-wizard-field-<fieldCode>` — individually saved fields. */
export const getWizardFieldKey = (landing: string, code: string) =>
  `baldecash-${landing}-wizard-field-${code}`;

/** Drops the KYC progress of every step for a landing. */
export function clearKycProgressStorage(landing: string): void {
  removeByScopedPrefix(`baldecash-${landing}-kyc-step-`);
}

/** Drops every individually persisted wizard field for a landing. */
export function clearWizardFieldStorage(landing: string): void {
  removeByScopedPrefix(`baldecash-${landing}-wizard-field-`);
}
