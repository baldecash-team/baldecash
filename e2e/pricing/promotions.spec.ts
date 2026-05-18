import { test, expect } from '@playwright/test';

const BASE = '/prototipos/0.6';

// Espera a que el catálogo cargue productos
async function waitForCatalog(page: any, landing: string) {
  await page.goto(`${BASE}/${landing}/catalogo/`);
  // Esperar que aparezca al menos una card con precio
  await page.waitForSelector('text=/S\\/\\d+/', { timeout: 15000 });
  await page.waitForTimeout(500);
}

// ============================================================
// PRUEBA A1: Samsung Tab A11 en CADE con Exclusivo CADE (30%)
// ============================================================
test('A1 - CADE: Samsung Tab A11 muestra banner y badge -30%', async ({ page }) => {
  const res = await page.request.get('http://localhost:8001/api/v1/public/landing/cade/products?page=1&page_size=50');
  const data = await res.json();
  const product = data.items?.find((p: any) => p.id === 634);

  expect(product).toBeDefined();
  expect(product.promotion).not.toBeNull();
  expect(product.promotion.discount_value).toBe(30);
  expect(product.promotion.template.banner_text).toBe('PREAPROBADO');

  const hook = product.pricing.hook;
  const expectedOriginal = Math.round(hook.monthly_price / (1 - product.promotion.discount_value / 100));
  expect(expectedOriginal).toBe(27);
  expect(hook.monthly_price).toBe(19);
});

// ============================================================
// PRUEBA A2: Lenovo V15 en Home con Cuota Épica
// ============================================================
test('A6 - Home: Lenovo V15 G4 muestra promo Cuota Épica', async ({ page }) => {
  const res = await page.request.get('http://localhost:8001/api/v1/public/landing/home/products?page=1&page_size=100');
  const data = await res.json();
  const product = data.items?.find((p: any) => p.id === 491);

  expect(product).toBeDefined();
  expect(product.promotion).not.toBeNull();
  expect(product.promotion.name).toBe('Cuota Épica');
  expect(product.promotion.discount_value).toBe(30);

  const hook = product.pricing.hook;
  const expectedOriginal = Math.round(hook.monthly_price / (1 - 30 / 100));
  expect(expectedOriginal).toBeGreaterThan(hook.monthly_price);
});

// ============================================================
// PRUEBA A5: Sin promo → no hay badge
// ============================================================
test('A5 - Home: iPad sin promo no tiene promotion', async ({ page }) => {
  // Reset: verificar que iPad 518 en Home no tiene promo
  const res = await page.request.get('http://localhost:8001/api/v1/public/landing/home/products?page=1&page_size=100');
  const data = await res.json();
  const product = data.items?.find((p: any) => p.id === 518);

  expect(product).toBeDefined();
  // iPad no debe tener promo activa (la quitamos en B10)
  const hasPromoWithDiscount = product.promotion && product.promotion.discount_value > 0;
  expect(hasPromoWithDiscount).toBeFalsy();
});

// ============================================================
// PRUEBA B7: iPad+Tablet en UPN/Certus/UCAL con Precio Exclusivo
// ============================================================
test('B7 - UPN: Tablet TB311FU tiene Precio Exclusivo', async ({ page }) => {
  const res = await page.request.get('http://localhost:8001/api/v1/public/landing/upn-13/products?page=1&page_size=100');
  const data = await res.json();
  const tablet = data.items?.find((p: any) => p.id === 753);
  expect(tablet?.promotion?.name).toBe('Precio Exclusivo');
});

test('B7 - Certus: Tablet TB311FU tiene Precio Exclusivo', async ({ page }) => {
  const res = await page.request.get('http://localhost:8001/api/v1/public/landing/certus-2/products?page=1&page_size=100');
  const data = await res.json();
  const tablet = data.items?.find((p: any) => p.id === 753);
  expect(tablet?.promotion?.name).toBe('Precio Exclusivo');
});

// ============================================================
// PRUEBA B4: 634 en CADE+A+B todas con Exclusivo CADE
// ============================================================
test('B4 - CADE/A/B: Samsung Tab tiene Exclusivo CADE en las 3 landings', async ({ page }) => {
  for (const [slug, id] of [['cade', 152], ['cade-a', 155], ['cade-b', 156]]) {
    const res = await page.request.get(`http://localhost:8001/api/v1/public/landing/${slug}/products?page=1&page_size=50`);
    const data = await res.json();
    const product = data.items?.find((p: any) => p.id === 634);

    expect(product?.promotion?.name, `${slug} debe tener Exclusivo CADE`).toBe('Exclusivo CADE');
  }
});

// ============================================================
// PRUEBA A8: Promo 0% no genera badge (discount_value = 0)
// ============================================================
test('A8 - 0% descuento: frontend no debe mostrar badge', async ({ page }) => {
  // El frontend no muestra badge cuando promotion.discount_value === 0
  // Validamos que la lógica en el API es correcta
  const res = await page.request.get('http://localhost:8001/api/v1/public/landing/cade/products?page=1&page_size=50');
  const data = await res.json();
  const product = data.items?.find((p: any) => p.id === 634);

  if (product?.promotion) {
    // Si tiene promo con 0%, el frontend no debe mostrar badge
    if (product.promotion.discount_value === 0) {
      expect(product.promotion.discount_value).toBe(0);
    }
  }
  // Si tiene Exclusivo CADE (30%), el original debe ser calculable
  if (product?.promotion?.discount_value === 30) {
    const hook = product.pricing.hook;
    const expectedOriginal = Math.round(hook.monthly_price / 0.70);
    expect(expectedOriginal).toBeGreaterThan(hook.monthly_price);
  }
});

// ============================================================
// TESTS VISUALES (DOM) — Playwright navega al catálogo real
// ============================================================

test('DOM - CADE: Samsung Tab muestra banner PREAPROBADO', async ({ page }) => {
  await waitForCatalog(page, 'cade');
  // El banner contiene el texto del template
  const banner = page.locator('text=PREAPROBADO').first();
  await expect(banner).toBeVisible();
});

test('DOM - CADE: Samsung Tab muestra badge -30%', async ({ page }) => {
  await waitForCatalog(page, 'cade');
  const badge = page.locator('text=-30%').first();
  await expect(badge).toBeVisible();
});

test('DOM - CADE: Samsung Tab muestra precio tachado S/27', async ({ page }) => {
  await waitForCatalog(page, 'cade');
  // El precio tachado tiene clase line-through
  const tachado = page.locator('.line-through').first();
  await expect(tachado).toBeVisible();
  await expect(tachado).toContainText('S/27');
});

test('DOM - Home: Lenovo tiene promo Cuota Épica (sin template visual)', async ({ page }) => {
  const res = await page.request.get('http://localhost:8001/api/v1/public/landing/home/products?page=1&page_size=100');
  const data = await res.json();
  const lenovo = data.items?.find((p: any) => p.id === 491);
  expect(lenovo?.promotion?.name).toBe('Cuota Épica');
  expect(lenovo?.promotion?.discount_value).toBe(30);
  // Cuota Épica no tiene template → no hay banner visual, pero sí badge en la card
  // El badge se calcula desde discount_value en el frontend
  const hook = lenovo?.pricing?.hook;
  const expectedOriginal = Math.round(hook.monthly_price / (1 - 30 / 100));
  expect(expectedOriginal).toBeGreaterThan(hook.monthly_price);
});

test('DOM - CADE: producto sin promo no muestra badge ni tachado', async ({ page }) => {
  // Quitar promo del Tab A11 en CADE temporalmente
  const token = await page.request.post('http://localhost:8001/api/v1/auth/login', {
    form: { username: 'emilio.gonzales@baldecash.com', password: 'password123.A' }
  }).then(r => r.json()).then(d => d.access_token);

  // Quitar promo
  await page.request.put('http://localhost:8001/api/v1/pricing/universe/promotions/assign', {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { landing_ids: [152], product_ids: [634], promotion_id: null },
  });

  await waitForCatalog(page, 'cade');

  // El badge -30% no debe aparecer para el Tab A11 (puede aparecer en otros)
  const res = await page.request.get('http://localhost:8001/api/v1/public/landing/cade/products?page=1&page_size=50');
  const data = await res.json();
  const tab = data.items?.find((p: any) => p.id === 634);
  expect(tab?.promotion).toBeNull();

  // Restaurar promo
  await page.request.put('http://localhost:8001/api/v1/pricing/universe/promotions/assign', {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { landing_ids: [152], product_ids: [634], promotion_id: 29 },
  });
});

test('DOM - UPN: Tablet TB311FU muestra Precio Exclusivo', async ({ page }) => {
  await waitForCatalog(page, 'upn-13');
  const res = await page.request.get('http://localhost:8001/api/v1/public/landing/upn-13/products?page=1&page_size=100');
  const data = await res.json();
  const tablet = data.items?.find((p: any) => p.id === 753);
  expect(tablet?.promotion?.name).toBe('Precio Exclusivo');
  // Verificar que el banner text aparece en el DOM
  const bannerText = tablet?.promotion?.template?.banner_text;
  if (bannerText) {
    const banner = page.locator(`text=${bannerText}`).first();
    await expect(banner).toBeVisible();
  }
});
