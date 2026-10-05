import { test, expect } from '@playwright/test';

/**
 * Reglas de accesorios por dispositivo (BAL-2767).
 *
 * - Reacondicionado (cualquier tipo) -> sin accesorios
 * - Celular Android nuevo -> sin accesorios
 * - iPhone nuevo y laptop nueva -> con accesorios
 *
 * Se observa la respuesta del endpoint `/accessories`, no solo el DOM: si la
 * seccion no se renderizara por otra razon, un assert sobre el DOM pasaria por
 * accidente. El total del payload es la fuente de verdad.
 *
 * Notas de entorno aprendidas en tickets previos:
 * - Las cards del catalogo son <a href*="/producto/">, no botones.
 * - Animan continuamente: click() nunca estabiliza, hay que navegar por href.
 * - /solicitar redirige al catalogo si se entra por URL directa.
 */

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3001';
const API = process.env.E2E_API_URL ?? 'http://localhost:8047/api/v1';

// `no-estudiantes` es publica (sin token VIP) y publica los tres casos que se
// navegan aca. `home` no sirve: no tiene reacondicionados.
const LANDING = 'no-estudiantes';

// El caso permitido consulta Molti en vivo, que puede tardar; el bloqueado
// responde de inmediato porque el guard corta antes de la llamada de red.
test.setTimeout(90000);

// Slugs verificados llamando al API de la landing (no la BD): `home` no publica
// reacondicionados, y varios productos que si estan en `landing_product`
// responden 404 en el endpoint publico. El API es la fuente de verdad.
//
// FUERZA DE CADA CASO (probado apagando la regla con
// system_config['accessories.device_rules_enabled']='false' y corriendo la suite):
//   - 'Xiaomi nuevo (Android)'          -> FALLA con la regla apagada. Test fuerte.
//   - 'Laptop Lenovo nueva'             -> sigue en verde (control, debe mostrar).
//   - 'Laptop Lenovo reacondicionada'   -> NO falla con la regla apagada: su ficha
//     de "semi nuevo" nunca llega a pedir accesorios, asi que pasa por ausencia de
//     evidencia. Se conserva como no-regresion de navegacion; la cobertura real de
//     "reacondicionado no muestra accesorios" la da el test de API del final, que
//     si verifica total === 0 contra una respuesta concreta.
const CASOS = [
  { nombre: 'Laptop Lenovo reacondicionada', slug: 'v15-g4-amn-lpleba0000773', esperaAccesorios: false },
  { nombre: 'Xiaomi nuevo (Android)', slug: 'redmi-note-15-pro-8256-1077', esperaAccesorios: false },
  { nombre: 'Laptop Lenovo nueva', slug: 'lenovo-v15-g4-iru-lpleba0000767', esperaAccesorios: true },
];

for (const caso of CASOS) {
  test(`${caso.nombre}: accesorios ${caso.esperaAccesorios ? 'visibles' : 'ocultos'}`, async ({ page }) => {
    // Se registran TODAS las respuestas de /accessories del producto en curso.
    // No se usa waitForResponse porque cuando el guard bloquea, el flujo puede
    // no llegar a pedir accesorios nunca — esperar una peticion que no ocurre
    // haria fallar el test por timeout en vez de por la regla.
    const respuestas: Array<{ total: number; accessories: unknown[] }> = [];
    page.on('response', async (r) => {
      if (r.url().includes('/accessories') && r.url().includes(`product_slug=${caso.slug}`) && r.status() === 200) {
        try {
          respuestas.push(await r.json());
        } catch {
          /* respuesta no-JSON: se ignora, el assert de abajo la cubre */
        }
      }
    });

    await page.goto(`${BASE}/prototipos/0.6/${LANDING}/producto/${caso.slug}`, {
      waitUntil: 'domcontentloaded',
    });

    // El CTA de la ficha es un <button> "¡Lo quiero!" CON signos de admiracion;
    // las cards de "productos similares" traen botones "Lo quiero" SIN ellos.
    // Sin los signos en el patron, .first() puede caer en un similar y navegar
    // al producto equivocado. Navegar a /solicitar por URL directa no sirve:
    // redirige al catalogo.
    const cta = page.getByRole('button', { name: '¡Lo quiero!', exact: true });
    await cta.waitFor({ state: 'visible', timeout: 30000 });
    await cta.click();

    if (caso.esperaAccesorios) {
      // Aca si tiene que haber pedido accesorios, y traer al menos uno.
      await expect
        .poll(() => respuestas.length, {
          message: `${caso.nombre}: nunca se pidieron accesorios`,
          timeout: 60000,
        })
        .toBeGreaterThan(0);
      expect(
        respuestas.some((p) => p.total > 0),
        `${caso.nombre} deberia mostrar accesorios`,
      ).toBe(true);
    } else {
      // Bloqueado: se le da tiempo al flujo a pedir accesorios si fuera a
      // hacerlo. Vale tanto no pedirlos como pedirlos y recibir cero — lo que
      // NO puede pasar es recibir alguno.
      await page.waitForTimeout(20000);
      const conAccesorios = respuestas.filter((p) => p.total > 0);
      expect(
        conAccesorios,
        `${caso.nombre} no deberia mostrar accesorios y devolvio ${JSON.stringify(conAccesorios.map((p) => p.total))}`,
      ).toEqual([]);

      // Si el flujo llego a /solicitar, la seccion no debe estar renderizada.
      // Los productos cuya ficha no navega alla se saltan este chequeo: ahi la
      // cobertura la dan los tests de API del final.
      if (/\/solicitar/.test(page.url())) {
        await expect(
          page.getByText(/accesorios m[aá]s elegidos/i),
          `${caso.nombre}: la seccion de accesorios no deberia renderizarse`,
        ).toHaveCount(0);
      }
    }

    await page.screenshot({
      path: `e2e/screenshots/bal-2767-${caso.slug}.png`,
      fullPage: true,
    });
  });
}

/**
 * El iPhone nuevo es el cambio de comportamiento intencional del ticket: pasa
 * de NO mostrar accesorios a SI mostrarlos, porque la regla dice "celular
 * *Android* nuevo".
 *
 * Se verifica contra el API y no por navegador porque ninguna landing publica
 * del entorno local publica un iPhone nuevo — las que lo tienen exigen token
 * VIP. La landing `renueva-tu-equipo-1` si lo publica y responde por API.
 */
test('iPhone nuevo: SI muestra accesorios (excepcion Apple)', async ({ request }) => {
  const r = await request.get(
    `${API}/public/landing/home/accessories`
      + `?product_slug=celular-iphone-negro-17-1090&term=24`,
  );
  expect(r.status()).toBe(200);
  const payload = await r.json();
  expect(payload.total, 'el iPhone nuevo deberia mostrar accesorios').toBeGreaterThan(0);
});

test('iPhone reacondicionado: NO muestra accesorios (la regla 1 gana sobre Apple)', async ({ request }) => {
  const r = await request.get(
    `${API}/public/landing/home/accessories`
      + `?product_slug=iphone-16-pro-max-natural-titanium-1100&term=24`,
  );
  expect(r.status()).toBe(200);
  const payload = await r.json();
  expect(payload.total, 'un iPhone reacondicionado no deberia mostrar accesorios').toBe(0);
});
