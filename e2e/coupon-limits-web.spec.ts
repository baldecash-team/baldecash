/**
 * El cliente ingresando un cupón con el tope agotado, en la web pública.
 *
 * Recorre el flujo real: catálogo → detalle del producto → solicitud.
 * A `/solicitar` no se puede entrar por URL directa (redirige al catálogo si
 * no hay producto en el carrito), así que hay que navegar como el usuario.
 *
 * Escenario previo:
 *   WEBTOPE — tope por equipo = 1, ya agotado sobre el iPad (id 518)
 */
import { test, expect, type Page } from '@playwright/test';

const WEB = 'http://localhost:3010/prototipos/0.6/home';

/** Navega hasta el formulario de solicitud y devuelve el campo de cupón. */
async function llegarAlCupon(page: Page) {
  await page.goto(`${WEB}/catalogo`);

  // Las tarjetas son enlaces al detalle, no botones.
  // El catálogo anima las tarjetas de forma continua, así que nunca llegan a
  // "estables" para Playwright. Se navega por el href en vez de clickear.
  const tarjeta = page.locator('a[href*="/producto/"]').first();
  await tarjeta.waitFor({ state: 'attached', timeout: 60_000 });
  const href = await tarjeta.getAttribute('href');
  await page.goto(`http://localhost:3010${href}`);

  // Desde el detalle, el CTA lleva a la solicitud.
  const cta = page
    .getByRole('button', { name: /lo quiero|solicitar|continuar/i })
    .or(page.getByRole('link', { name: /lo quiero|solicitar|continuar/i }))
    .first();
  await cta.waitFor({ state: 'visible', timeout: 30_000 });
  await cta.click({ force: true });

  const campo = page.getByPlaceholder(/código/i);
  await campo.waitFor({ state: 'visible', timeout: 60_000 });
  return campo;
}

test('el cupón con el tope agotado se rechaza en pantalla', async ({ page }) => {
  const campo = await llegarAlCupon(page);

  await campo.fill('WEBTOPE');
  await page.getByRole('button', { name: /^Aplicar$/i }).click();

  // El mensaje viene del backend y dura 7s (BAL-2630).
  await expect(
    page.getByText(/límite de usos|no aplica/i).first(),
    'el cliente debe ver por qué se rechazó'
  ).toBeVisible({ timeout: 20_000 });

  // El mensaje queda al pie del formulario: hay que traerlo a la vista.
  await page.getByText(/límite de usos|no aplica/i).first().scrollIntoViewIfNeeded();
  await page.screenshot({
    path: 'e2e/screenshots/2629-web-rechazo.png',
    fullPage: false,
  });
});

test('un cupón inexistente muestra su propio mensaje', async ({ page }) => {
  // Control: confirma que el mensaje del tope es específico y no el genérico.
  const campo = await llegarAlCupon(page);

  await campo.fill('NOEXISTE9999');
  await page.getByRole('button', { name: /^Aplicar$/i }).click();

  await expect(
    page.getByText(/no válido|no existe/i).first()
  ).toBeVisible({ timeout: 20_000 });
});
