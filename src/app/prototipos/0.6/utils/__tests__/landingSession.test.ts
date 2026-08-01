import {
  clearLandingSession,
  resetLandingSessionIfIdentityChanged,
} from '../landingSession';

const LANDING = 'family-farms-baldecash';
/** Sibling landing whose slug CONTAINS the one above. See the nesting test. */
const SIBLING = 'family-farms-baldecash-a';

/** Everything a client leaves behind, keyed by landing slug. */
const sessionKeys = (slug: string) => ({
  vipToken: `baldecash-vip-token-${slug}`,
  vipName: `baldecash-vip-name-${slug}`,
  dni: `baldecash-dni-${slug}`,
  wizardForm: `baldecash-wizard-${slug}-data`,
  wizardField: `baldecash-${slug}-wizard-field-document_number`,
  acceptTerms: `baldecash-${slug}-wizard-acceptTerms`,
  acceptPrivacy: `baldecash-${slug}-wizard-acceptPrivacy`,
  acceptPromos: `baldecash-${slug}-wizard-acceptPromos`,
  product: `baldecash-${slug}-solicitar-selected-product`,
  cartProducts: `baldecash-${slug}-solicitar-cart-products`,
  accessories: `baldecash-${slug}-solicitar-selected-accessories`,
  insurance: `baldecash-${slug}-solicitar-selected-insurance`,
  coupon: `baldecash-${slug}-solicitar-applied-coupon`,
  maAvailable: `baldecash-${slug}-solicitar-available-ma`,
  kycStep: `baldecash-${slug}-kyc-step-APP-1`,
  wishlist: `baldecash-${slug}-wishlist`,
  cart: `baldecash-${slug}-cart`,
  compare: `baldecash-${slug}-compare`,
  pendingCoupon: `baldecash-${slug}-pending-coupon`,
  pendingCategoria: `baldecash-${slug}-pending-categoria`,
  sessionUuid: `baldecash-${slug}-wizard-session-uuid`,
});

const onboardingKey = (slug: string) => `baldecash-${slug}-onboarding-catalog`;

/** The OTP handoff deliberately lives in sessionStorage, not localStorage. */
const otpHandoffKey = (slug: string) => `baldecash-${slug}-otp-handoff`;

function seedSession(slug: string) {
  Object.values(sessionKeys(slug)).forEach((key) => localStorage.setItem(key, `value-of-${slug}`));
  sessionStorage.setItem(otpHandoffKey(slug), `value-of-${slug}`);
  localStorage.setItem(onboardingKey(slug), '{"hasSeenWelcome":true}');
}

describe('clearLandingSession', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('clears every piece of the previous client session', () => {
    seedSession(LANDING);

    clearLandingSession(LANDING);

    const survivors = Object.entries(sessionKeys(LANDING))
      .filter(([, key]) => localStorage.getItem(key) !== null)
      .map(([name]) => name);

    expect(survivors).toEqual([]);
    expect(sessionStorage.getItem(otpHandoffKey(LANDING))).toBeNull();
  });

  // Regression for BAL-2657. The first implementation enumerated keys shaped
  // `baldecash-<slug>-*` and missed this one, because its prefix comes BEFORE
  // the slug. It reached production and leaked the previous client's document,
  // names, birth date and gender into the next client's form.
  it('clears the application form, whose key is named the other way round', () => {
    const key = `baldecash-wizard-${LANDING}-data`;
    localStorage.setItem(key, '{"document_number":{"value":"73941627"}}');

    clearLandingSession(LANDING);

    expect(localStorage.getItem(key)).toBeNull();
  });

  // The consent flags had no owner and nothing ever removed them — not even the
  // post-submit cleanup. Leaving them marks the next client as having accepted
  // terms they never saw.
  it('clears the consent checkboxes', () => {
    const keys = sessionKeys(LANDING);
    localStorage.setItem(keys.acceptTerms, 'true');
    localStorage.setItem(keys.acceptPrivacy, 'true');

    clearLandingSession(LANDING);

    expect(localStorage.getItem(keys.acceptTerms)).toBeNull();
    expect(localStorage.getItem(keys.acceptPrivacy)).toBeNull();
  });

  it('clears dynamic per-step and per-field keys', () => {
    localStorage.setItem(`baldecash-${LANDING}-kyc-step-APP-1`, '1');
    localStorage.setItem(`baldecash-${LANDING}-kyc-step-APP-2`, '0');
    localStorage.setItem(`baldecash-${LANDING}-wizard-field-document_number`, '73941627');
    localStorage.setItem(`baldecash-${LANDING}-wizard-field-first_name`, 'Luis');

    clearLandingSession(LANDING);

    expect(localStorage.getItem(`baldecash-${LANDING}-kyc-step-APP-1`)).toBeNull();
    expect(localStorage.getItem(`baldecash-${LANDING}-kyc-step-APP-2`)).toBeNull();
    expect(localStorage.getItem(`baldecash-${LANDING}-wizard-field-document_number`)).toBeNull();
    expect(localStorage.getItem(`baldecash-${LANDING}-wizard-field-first_name`)).toBeNull();
  });

  // THE nesting hazard. Both slugs coexist on the same device in production and
  // `family-farms-baldecash` is a prefix of `family-farms-baldecash-a`, so a
  // naive `key.startsWith('baldecash-' + slug + '-')` sweep would wipe the
  // sibling landing. This test is the guard against that "simplification".
  it('does not touch a sibling landing whose slug contains this one', () => {
    seedSession(LANDING);
    seedSession(SIBLING);

    clearLandingSession(LANDING);

    const wiped = Object.entries(sessionKeys(SIBLING))
      .filter(([, key]) => localStorage.getItem(key) === null)
      .map(([name]) => name);

    expect(wiped).toEqual([]);
    expect(sessionStorage.getItem(otpHandoffKey(SIBLING))).not.toBeNull();
    expect(localStorage.getItem(onboardingKey(SIBLING))).not.toBeNull();
  });

  it('keeps the onboarding tour state so it does not reappear for every client', () => {
    const tourState = '{"hasSeenWelcome":true}';
    localStorage.setItem(onboardingKey(LANDING), tourState);

    clearLandingSession(LANDING);

    expect(localStorage.getItem(onboardingKey(LANDING))).toBe(tourState);
  });

  it('does not throw when storage access fails', () => {
    const original = Storage.prototype.removeItem;
    Storage.prototype.removeItem = () => {
      throw new Error('storage unavailable');
    };

    expect(() => clearLandingSession(LANDING)).not.toThrow();

    Storage.prototype.removeItem = original;
  });
});

describe('resetLandingSessionIfIdentityChanged', () => {
  const PREVIOUS_DNI = '73941627';
  const NEW_DNI = '70020010';

  const dniKey = `baldecash-dni-${LANDING}`;
  const formKey = `baldecash-wizard-${LANDING}-data`;
  const formOf = (dni: string) =>
    `{"document_number":{"value":"${dni}","touched":true},"first_name":{"value":"Luis"}}`;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('keeps everything when the same person validates again', () => {
    seedSession(LANDING);
    localStorage.setItem(dniKey, PREVIOUS_DNI);
    localStorage.setItem(formKey, formOf(PREVIOUS_DNI));

    const cleared = resetLandingSessionIfIdentityChanged(LANDING, PREVIOUS_DNI);

    expect(cleared).toBe(false);
    // This is the case of someone who tapped the logo, landed on the home and
    // came back: they must not have to retype anything.
    expect(localStorage.getItem(formKey)).toBe(formOf(PREVIOUS_DNI));
    expect(localStorage.getItem(`baldecash-${LANDING}-wizard-acceptTerms`)).not.toBeNull();
  });

  it('wipes the previous session when a different person validates', () => {
    seedSession(LANDING);
    localStorage.setItem(dniKey, PREVIOUS_DNI);
    localStorage.setItem(formKey, formOf(PREVIOUS_DNI));

    const cleared = resetLandingSessionIfIdentityChanged(LANDING, NEW_DNI);

    expect(cleared).toBe(true);
    expect(localStorage.getItem(formKey)).toBeNull();
    expect(localStorage.getItem(`baldecash-${LANDING}-wizard-acceptTerms`)).toBeNull();
  });

  // Edge case: the saved DNI can be cleared on its own, but the form still
  // carries the document of whoever filled it. Without this fallback the
  // comparison would have no reference and the data would survive.
  it('falls back to the document stored inside the form when no DNI is saved', () => {
    localStorage.setItem(formKey, formOf(PREVIOUS_DNI));

    const cleared = resetLandingSessionIfIdentityChanged(LANDING, NEW_DNI);

    expect(cleared).toBe(true);
    expect(localStorage.getItem(formKey)).toBeNull();
  });

  it('keeps the form when its stored document matches, with no saved DNI', () => {
    localStorage.setItem(formKey, formOf(PREVIOUS_DNI));

    const cleared = resetLandingSessionIfIdentityChanged(LANDING, PREVIOUS_DNI);

    expect(cleared).toBe(false);
    expect(localStorage.getItem(formKey)).toBe(formOf(PREVIOUS_DNI));
  });

  // No reference means the data cannot be attributed to anyone, and
  // unattributable data on a shared device is what produced BAL-2657/BAL-2661.
  it('clears orphan data when there is no reference to compare against', () => {
    localStorage.setItem(`baldecash-${LANDING}-wizard-acceptTerms`, 'true');
    localStorage.setItem(`baldecash-${LANDING}-solicitar-selected-product`, '{"id":"1"}');

    const cleared = resetLandingSessionIfIdentityChanged(LANDING, NEW_DNI);

    expect(cleared).toBe(true);
    expect(localStorage.getItem(`baldecash-${LANDING}-wizard-acceptTerms`)).toBeNull();
    expect(localStorage.getItem(`baldecash-${LANDING}-solicitar-selected-product`)).toBeNull();
  });

  it('is a harmless no-op on a first visit, with nothing stored', () => {
    expect(() => resetLandingSessionIfIdentityChanged(LANDING, NEW_DNI)).not.toThrow();
    expect(localStorage.length).toBe(0);
  });

  it('does nothing when the incoming DNI is empty', () => {
    localStorage.setItem(dniKey, PREVIOUS_DNI);

    expect(resetLandingSessionIfIdentityChanged(LANDING, '')).toBe(false);
    expect(localStorage.getItem(dniKey)).toBe(PREVIOUS_DNI);
  });

  it('does not touch a sibling landing whose slug contains this one', () => {
    seedSession(SIBLING);
    localStorage.setItem(dniKey, PREVIOUS_DNI);

    resetLandingSessionIfIdentityChanged(LANDING, NEW_DNI);

    const wiped = Object.entries(sessionKeys(SIBLING))
      .filter(([, key]) => localStorage.getItem(key) === null)
      .map(([name]) => name);

    expect(wiped).toEqual([]);
  });
});
