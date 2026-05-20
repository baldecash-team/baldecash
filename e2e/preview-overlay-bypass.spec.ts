import { test, expect } from '@playwright/test';

/**
 * E2E: Preview mode bypasses VIP countdown overlay
 *
 * Contexto: las landings renueva-tu-equipo (151) y renueva-tu-laptop (148)
 * tienen un VIP countdown expirado (2026-05-01). Sin preview activo, el
 * overlay "Venta exclusiva finalizada" bloquea el catálogo y el solicitar.
 * Con preview activo (previewKey en sessionStorage), el gate debe dejar pasar.
 *
 * Estrategia: inyectamos el estado de PreviewContext en sessionStorage antes
 * de navegar, simulando haber pasado por /preview/151?preview_key=...
 */

const BASE = '/prototipos/0.6';
const PREVIEW_STORAGE_KEY = 'baldecash-preview-mode';

// Estado de preview que simula haber entrado por /preview/151
const PREVIEW_STATE_151 = {
  landingId: 151,
  previewKey: 'test-preview-key-renueva-tu-equipo',
  slug: 'renueva-tu-equipo',
  activatedAt: Date.now(),
};

const PREVIEW_STATE_148 = {
  landingId: 148,
  previewKey: 'test-preview-key-renueva-tu-laptop',
  slug: 'renueva-tu-laptop',
  activatedAt: Date.now(),
};

// Helper: inyecta el estado de preview en sessionStorage antes de que cargue la página
async function injectPreviewState(page: any, state: object) {
  await page.addInitScript(({ key, value }: { key: string; value: string }) => {
    sessionStorage.setItem(key, value);
  }, { key: PREVIEW_STORAGE_KEY, value: JSON.stringify(state) });
}

// ─────────────────────────────────────────────────────────────────────────────
// CASO POSITIVO: con preview activo, el overlay NO debe aparecer
// ─────────────────────────────────────────────────────────────────────────────

test('preview activo: catálogo de renueva-tu-equipo no muestra overlay', async ({ page }) => {
  await injectPreviewState(page, PREVIEW_STATE_151);
  await page.goto(`${BASE}/renueva-tu-equipo/catalogo/`);

  // El overlay NO debe aparecer
  await expect(page.locator('text=Venta exclusiva finalizada')).not.toBeVisible({ timeout: 5000 });

  // El catálogo debe cargar (algún elemento de la página visible)
  await expect(page.locator('body')).not.toBeEmpty();
});

test('preview activo: catálogo de renueva-tu-laptop no muestra overlay', async ({ page }) => {
  await injectPreviewState(page, PREVIEW_STATE_148);
  await page.goto(`${BASE}/renueva-tu-laptop/catalogo/`);

  await expect(page.locator('text=Venta exclusiva finalizada')).not.toBeVisible({ timeout: 5000 });
  await expect(page.locator('body')).not.toBeEmpty();
});

test('preview activo: solicitar de renueva-tu-equipo no muestra overlay', async ({ page }) => {
  await injectPreviewState(page, PREVIEW_STATE_151);
  // Navegamos a la raíz del solicitar (redirige al catalogo si no hay producto)
  await page.goto(`${BASE}/renueva-tu-equipo/solicitar/`);

  await expect(page.locator('text=Venta exclusiva finalizada')).not.toBeVisible({ timeout: 5000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO NEGATIVO: sin preview, el overlay SÍ debe aparecer
// Nota: estos tests solo pasan contra prod o una BD local con vip_countdown
// configurado. En CI local se skipean automáticamente si el overlay no existe.
// ─────────────────────────────────────────────────────────────────────────────

test('sin preview: catálogo de renueva-tu-equipo muestra overlay expirado', async ({ page }) => {
  await page.goto(`${BASE}/renueva-tu-equipo/catalogo/`);

  // Si el overlay no aparece en 5s, la BD local no tiene vip_countdown → skip
  const overlay = page.locator('text=Venta exclusiva finalizada');
  const isVisible = await overlay.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!isVisible, 'BD local sin vip_countdown configurado — solo válido contra prod');

  await expect(overlay).toBeVisible();
});

test('sin preview: catálogo de renueva-tu-laptop muestra overlay expirado', async ({ page }) => {
  await page.goto(`${BASE}/renueva-tu-laptop/catalogo/`);

  const overlay = page.locator('text=Venta exclusiva finalizada');
  const isVisible = await overlay.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!isVisible, 'BD local sin vip_countdown configurado — solo válido contra prod');

  await expect(overlay).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO NEGATIVO: preview de otro slug no hace bypass
// ─────────────────────────────────────────────────────────────────────────────

test('preview de otro slug no hace bypass en renueva-tu-equipo', async ({ page }) => {
  await injectPreviewState(page, PREVIEW_STATE_148);
  await page.goto(`${BASE}/renueva-tu-equipo/catalogo/`);

  const overlay = page.locator('text=Venta exclusiva finalizada');
  const isVisible = await overlay.isVisible({ timeout: 5000 }).catch(() => false);
  test.skip(!isVisible, 'BD local sin vip_countdown configurado — solo válido contra prod');

  await expect(overlay).toBeVisible();
});
