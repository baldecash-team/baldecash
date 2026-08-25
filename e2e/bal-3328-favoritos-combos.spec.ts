import { test, expect, Page, Locator } from '@playwright/test';

/**
 * BAL-3328 — favoritos y comparar distinguen la card del combo de la suelta.
 *
 * Contexto del bug: en el catalogo un mismo producto aparece como varias cards
 * (el equipo solo y cada uno de sus combos). Todas comparten el MISMO
 * `productId` y solo se diferencian por el `slug`. Favoritos y comparar
 * identificaban la card por id, asi que las tres colapsaban en una: marcar el
 * combo pintaba tambien la suelta y el comparador resolvia la card equivocada.
 * El fix introduce `cardKey` (= slug) como identidad de la card.
 *
 * Notas de entorno medidas en el navegador (no adivinadas):
 * - Las dos cards renderizan el MISMO titulo visible, asi que identificarlas
 *   por texto es imposible. La unica sena estable es el href de su enlace
 *   `a[href*="/producto/"]` — que es justamente el slug bajo prueba.
 * - Cada card vive dentro de un wrapper `div.h-full.w-full[class*="min-w-"]`
 *   que contiene exactamente un corazon, un boton de comparar y enlaces de un
 *   solo slug. Filtrando ese wrapper por href se llega a la card correcta sin
 *   depender del orden en que el catalogo las pinte.
 * - El header tiene sus propios corazones (`onboarding-wishlist-mobile` y el de
 *   escritorio). Por eso NUNCA se cuentan corazones sobre `document` entero:
 *   se cuentan dentro del wrapper de cada card.
 * - Corazon marcado: en la card la clase trae `fill-[var(--color-primary)]`;
 *   en el detalle trae `fill-current`. Sin marcar no trae ninguna de las dos.
 * - El detalle tiene un unico corazon dentro de `#section-pricing`.
 */

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3022';
const PREFIX = '/prototipos/0.6/home';

const SUELTO = 'ipad-11-pulgadas-wi-fi-tbapme0000835';
const COMBO = 'ipad-11-pulgadas-wi-fi-tbapme0000835-combo-166';

const CATALOGO = `${BASE}${PREFIX}/catalogo/?device=tablet&brand=apple`;
const detalle = (slug: string) => `${BASE}${PREFIX}/producto/${slug}/`;

const WISHLIST_KEY = 'baldecash-home-wishlist';
const COMPARE_KEY = 'baldecash-home-compare';
const ONBOARDING_KEY = 'baldecash-home-onboarding-catalog';

/** Wrapper de la card cuyo enlace apunta al slug pedido. */
function card(page: Page, slug: string): Locator {
  return page
    .locator('div.h-full.w-full[class*="min-w-"]')
    .filter({ has: page.locator(`a[href$="/producto/${slug}/"]`) });
}

function corazonDe(page: Page, slug: string): Locator {
  return card(page, slug).locator('button:has(svg.lucide-heart)');
}

function compararDe(page: Page, slug: string): Locator {
  return card(page, slug).locator('button:has(svg.lucide-git-compare)');
}

/** ¿El corazon de esa card quedo pintado? */
async function corazonPintado(page: Page, slug: string): Promise<boolean> {
  const clase = await card(page, slug).locator('svg.lucide-heart').getAttribute('class');
  return (clase ?? '').includes('fill-[var(--color-primary)]');
}

async function leerWishlist(page: Page) {
  return page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k) || '[]'),
    WISHLIST_KEY,
  ) as Promise<Array<{ slug?: string; productId?: string }>>;
}

async function leerCompare(page: Page) {
  return page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k) || '[]'),
    COMPARE_KEY,
  ) as Promise<string[]>;
}

/**
 * El modal de bienvenida del onboarding se monta en la primera visita y tapa
 * las cards, interceptando los clicks. Se marca como "ya visto" ANTES de que
 * cargue la pagina — esperar a que aparezca para cerrarlo es una carrera:
 * el modal monta despues del primer render y el click se cuela justo antes.
 */
async function saltarOnboarding(page: Page) {
  await page.addInitScript(
    ([key, valor]) => localStorage.setItem(key, valor),
    [
      ONBOARDING_KEY,
      JSON.stringify({
        hasSeenWelcome: true,
        hasCompletedTour: true,
        currentStep: 0,
        dismissedAt: new Date().toISOString(),
      }),
    ],
  );
}

/** Red de seguridad: si aun asi el modal aparece, se cierra. */
async function cerrarOnboarding(page: Page) {
  const boton = page.getByRole('button', { name: /ya conozco la plataforma/i });
  if (await boton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await boton.click();
    await expect(boton).toBeHidden();
  }
}

/** Deja el navegador sin favoritos ni comparaciones previas. */
async function irAlCatalogoLimpio(page: Page) {
  await page.goto(CATALOGO);
  await page.evaluate(
    ([w, c]) => {
      localStorage.removeItem(w);
      localStorage.removeItem(c);
    },
    [WISHLIST_KEY, COMPARE_KEY],
  );
  await page.reload();
  await cerrarOnboarding(page);
  // Las dos cards deben estar pintadas antes de tocar nada.
  await expect(card(page, COMBO)).toHaveCount(1);
  await expect(card(page, SUELTO)).toHaveCount(1);
}

test.describe('BAL-3328 — favoritos y comparar distinguen combos', () => {
  test.beforeEach(async ({ page }) => {
    await saltarOnboarding(page);
  });

  test('1. marcar el combo no marca la card suelta', async ({ page }) => {
    await irAlCatalogoLimpio(page);

    await corazonDe(page, COMBO).click();

    const guardado = await leerWishlist(page);
    expect(guardado).toHaveLength(1);
    expect(guardado[0].slug).toBe(COMBO);

    // El corazon del combo queda pintado y el de la suelta NO.
    expect(await corazonPintado(page, COMBO)).toBe(true);
    expect(await corazonPintado(page, SUELTO)).toBe(false);
  });

  test('2. comparar la card suelta guarda la suelta, no el combo', async ({ page }) => {
    await irAlCatalogoLimpio(page);

    await compararDe(page, SUELTO).click();

    const lista = await leerCompare(page);
    expect(lista).toEqual([SUELTO]);
  });

  test('3. el favorito del detalle respeta la card de la pagina', async ({ page }) => {
    await irAlCatalogoLimpio(page);

    await page.goto(detalle(COMBO));
    await cerrarOnboarding(page);
    await page.locator('#section-pricing button:has(svg.lucide-heart)').click();

    const guardado = await leerWishlist(page);
    expect(guardado).toHaveLength(1);
    expect(guardado[0].slug).toBe(COMBO);

    // El detalle de la card SUELTA no debe aparecer marcado.
    // Se mira solo el corazon de #section-pricing: los del header son otros.
    await page.goto(detalle(SUELTO));
    const clase = await page
      .locator('#section-pricing svg.lucide-heart')
      .getAttribute('class');
    expect(clase ?? '').not.toContain('fill-current');
  });

  test('4. un favorito previo con slug sobrevive a la recarga', async ({ page }) => {
    await irAlCatalogoLimpio(page);

    await page.evaluate(
      ([key, combo]) => {
        localStorage.setItem(
          key,
          JSON.stringify([
            {
              productId: '518',
              slug: combo,
              name: 'iPad 11 pulgadas Wi-Fi A16 Bionic 128GB',
              shortName: 'iPad 11',
              brand: 'apple',
              price: 0,
              image: '',
              lowestQuota: 0,
              months: 24,
              initialPercent: 0,
              initialAmount: 0,
              monthlyPayment: 0,
              addedAt: Date.now(),
            },
          ]),
        );
      },
      [WISHLIST_KEY, COMBO],
    );
    await page.reload();
    await cerrarOnboarding(page);

    const guardado = await leerWishlist(page);
    expect(guardado).toHaveLength(1);
    expect(guardado[0].slug).toBe(COMBO);

    // Y sigue apuntando a su card: el combo pintado, la suelta no.
    expect(await corazonPintado(page, COMBO)).toBe(true);
    expect(await corazonPintado(page, SUELTO)).toBe(false);
  });

  test('5. sin regresion: las dos cards conviven marcadas', async ({ page }) => {
    await irAlCatalogoLimpio(page);

    await corazonDe(page, COMBO).click();
    await corazonDe(page, SUELTO).click();

    const guardado = await leerWishlist(page);
    expect(guardado).toHaveLength(2);
    expect(new Set(guardado.map((i) => i.slug))).toEqual(new Set([COMBO, SUELTO]));

    await compararDe(page, COMBO).click();
    await compararDe(page, SUELTO).click();

    const lista = await leerCompare(page);
    expect(lista).toHaveLength(2);
    expect(new Set(lista)).toEqual(new Set([COMBO, SUELTO]));
  });
});
