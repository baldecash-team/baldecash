import { test, expect } from '@playwright/test';

/**
 * E2E: Family Farm activator session reset (BAL-2637)
 *
 * Walks the real activator journey: a client passes the Family Farm DNI
 * overlay, the activator uses "Cerrar sesión", and the next client must find
 * the overlay again with none of the previous client's data left behind.
 *
 * Why the DNI flow is driven for real instead of seeding a VIP token:
 * seeding a fake token gets past VipGate's mount check, but the catalog API
 * rejects it with a 403, handleVip403 clears storage and reloads, and the
 * activator control never renders — the test then skips and reports a green
 * run that proved nothing. Only a token minted by the real validate-dni call
 * survives the catalog request.
 */

const BASE = '/prototipos/0.6';
const CANDIDATE_SLUG = 'family-farm-cosechador';
const WHITELISTED_DNI = '70020010';

const VIP_TOKEN_KEY = `baldecash-vip-token-${CANDIDATE_SLUG}`;
const DNI_KEY = `baldecash-dni-${CANDIDATE_SLUG}`;
const SESSION_UUID_KEY = `baldecash-${CANDIDATE_SLUG}-wizard-session-uuid`;

/** Browsing activity the next client must not inherit. */
const ACTIVITY_KEYS = {
  [`baldecash-${CANDIDATE_SLUG}-compare`]: '["101","102"]',
  [`baldecash-${CANDIDATE_SLUG}-wishlist`]: '["103"]',
  [`baldecash-${CANDIDATE_SLUG}-cart`]: '["104"]',
  [`baldecash-${CANDIDATE_SLUG}-solicitar-selected-product`]: '{"id":"105"}',
};

/** Kept on purpose: it holds no client data, only that the tour was dismissed. */
const ONBOARDING_KEY = `baldecash-${CANDIDATE_SLUG}-onboarding-catalog`;

// The full journey crosses the overlay, the catalog and a forced reload. Under
// `next dev` the first hit on each route also pays a Turbopack compile, which
// alone can outlast the 30s default in playwright.config.ts.
test.setTimeout(180_000);

test('activator resets the session: overlay returns and no client data survives', async ({ page }) => {
  await page.goto(`${BASE}/${CANDIDATE_SLUG}/catalogo/`);

  // Reachability probe. This slug must be configured as `familyfarm` with the
  // demo whitelist seeded on this environment. If the overlay never shows, skip
  // explicitly rather than assert against an environment that cannot serve it.
  //
  // `waitFor`, NOT `isVisible`: locator.isVisible() resolves immediately and
  // ignores the timeout option, so on a page that has not hydrated yet it
  // returns false and the test skips — reporting a green run that proved
  // nothing. That false skip is exactly what this probe must not produce.
  const dniInput = page.getByRole('textbox', { name: 'Número de documento' });
  const overlayReady = await dniInput
    .waitFor({ state: 'visible', timeout: 60000 })
    .then(() => true)
    .catch(() => false);
  test.skip(
    !overlayReady,
    `No reachable "familyfarm" slug (tried "${CANDIDATE_SLUG}") — is ws2 up with the family_farm_demo seeder applied?`
  );

  // --- Client #1 enters through the overlay -------------------------------
  await dniInput.fill(WHITELISTED_DNI);
  await page.getByRole('button', { name: 'Ver equipos' }).click();
  await page.getByRole('button', { name: 'Comenzar' }).click();

  // The catalog onboarding modal covers the page on a fresh profile.
  const dismissOnboarding = page.getByText('No, ya conozco la plataforma');
  const onboardingShown = await dismissOnboarding
    .waitFor({ state: 'visible', timeout: 10000 })
    .then(() => true)
    .catch(() => false);
  if (onboardingShown) {
    await dismissOnboarding.click();
  }

  const trigger = page.getByRole('button', { name: 'Cerrar sesión' });
  await expect(trigger).toBeVisible({ timeout: 15000 });

  // Simulate what client #1 leaves behind after browsing: compared equipment,
  // favourites, a cart and a selected product. Seeded rather than clicked
  // through so the test stays about the reset, not about the catalog UI.
  await page.evaluate((entries: Record<string, string>) => {
    Object.entries(entries).forEach(([key, value]) => localStorage.setItem(key, value));
  }, ACTIVITY_KEYS);

  // Capture what client #1 leaves behind, so the assertions compare against
  // real values rather than assuming which keys the app wrote.
  const before = await page.evaluate(
    (keys) => ({
      token: localStorage.getItem(keys.token),
      dni: localStorage.getItem(keys.dni),
      uuid: localStorage.getItem(keys.uuid),
    }),
    { token: VIP_TOKEN_KEY, dni: DNI_KEY, uuid: SESSION_UUID_KEY }
  );
  expect(before.token, 'client #1 should hold a VIP token before the reset').toBeTruthy();

  // --- The activator resets for client #2 ---------------------------------
  await trigger.click();
  await expect(page.getByText('¿Cerrar la sesión actual?')).toBeVisible();

  // Cancelling must not clear anything.
  await page.getByRole('button', { name: 'Cancelar' }).click();
  const afterCancel = await page.evaluate((key) => localStorage.getItem(key), VIP_TOKEN_KEY);
  expect(afterCancel, 'cancelling must leave the session untouched').toBe(before.token);

  await trigger.click();
  await page.getByRole('button', { name: 'Sí, cerrar' }).click();

  // --- Client #2 must be prompted from scratch ----------------------------
  await expect(page.getByRole('textbox', { name: 'Número de documento' })).toBeVisible({
    timeout: 15000,
  });

  const after = await page.evaluate(
    (keys) => ({
      token: localStorage.getItem(keys.token),
      dni: localStorage.getItem(keys.dni),
      uuid: localStorage.getItem(keys.uuid),
    }),
    { token: VIP_TOKEN_KEY, dni: DNI_KEY, uuid: SESSION_UUID_KEY }
  );

  expect(after.token, 'the VIP token must be gone').toBeNull();

  // DocumentNumberField reads this key to pre-fill the application form, so a
  // leftover hands client #2 client #1's document number already typed in.
  expect(after.dni, "client #1's DNI must not survive").toBeNull();

  // The app mints a fresh uuid on mount, so assert it CHANGED rather than that
  // the key is absent — otherwise client #2's events keep client #1's session.
  if (before.uuid) {
    expect(after.uuid, "client #1's tracking session must not carry over").not.toBe(before.uuid);
  }

  // None of client #1's browsing may survive: no inherited favourites, no cart,
  // and above all no equipment already selected in the application form.
  const leftoverActivity = await page.evaluate(
    (keys: string[]) => keys.filter((key) => localStorage.getItem(key) !== null),
    Object.keys(ACTIVITY_KEYS)
  );
  expect(leftoverActivity, "client #1's browsing activity must not survive").toEqual([]);

  // The tour state is deliberately preserved — clearing it would make the
  // welcome modal reappear for every client the activator serves.
  const onboarding = await page.evaluate((key) => localStorage.getItem(key), ONBOARDING_KEY);
  expect(onboarding, 'the onboarding tour state must be preserved').not.toBeNull();
});
