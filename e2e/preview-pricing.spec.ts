/**
 * E2E — preview de pricing sobre una landing PUBLICADA (BAL-3008)
 *
 * Prueba lo que se pidió: el mismo catálogo, dos precios. El link con token
 * muestra el pricing propuesto de un import todavía NO aplicado; sin token, el
 * precio real que ve el cliente. Nada de esto escribe en la BD: el batch queda
 * en estado staged y el front solo lee.
 *
 * PREREQUISITOS
 *   - backend con el endpoint de staging (BAL-3006) corriendo
 *   - la web corriendo
 *   - la landing "home" (id 1) publicada, con el iPad en el catálogo
 *
 * Los puertos se leen de env porque en las máquinas de desarrollo cambian
 * seguido (sockets zombis de Windows obligan a levantar en otro puerto); los
 * valores por defecto son los que se usaron para verificar esta batería.
 */

import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

const WEB = process.env.E2E_WEB_URL ?? 'http://localhost:3003';
const API = process.env.E2E_API_URL ?? 'http://localhost:8062';

// La barra final es obligatoria: sin ella Next redirige de /catalogo a
// /catalogo/ y descarta el query string, o sea que el token nunca llegaría.
const CATALOGO = `${WEB}/prototipos/0.6/home/catalogo/`;

/**
 * El iPad es la primera card del catálogo. Importa que sea de las primeras: el
 * catálogo monta solo 15 cards y no pagina, así que un producto que el API
 * devuelve pero queda fuera de esas 15 no se puede leer en pantalla.
 */
const PRODUCTO = 'iPad 11 pulgadas Wi-Fi';
const SKU = 'TBAPME0000835-DEF';
const PRECIO_LISTA = 2099;

/** Cuota real que ve el cliente hoy: 24 meses, sin inicial, TEA 13%. */
const CUOTA_REAL = '119';
/** Cuota del pricing propuesto que carga el batch staged: TEA 5%, comisión 0. */
const CUOTA_PREVIEW = '91';

const TEXTO_BANNER = /precios propuestos/i;

/** JWT de admin. El login es form-urlencoded, no JSON. */
async function loginAdmin(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API}/api/v1/auth/login`, {
    form: {
      username: process.env.E2E_ADMIN_USER ?? 'emilio.gonzales@baldecash.com',
      password: process.env.E2E_ADMIN_PASS ?? 'password',
    },
  });
  expect(res.ok(), `el login falló con ${res.status()}`).toBeTruthy();
  const body = await res.json();
  expect(body.access_token, 'el login no devolvió access_token').toBeTruthy();
  return body.access_token;
}

/**
 * Crea un batch STAGED con una TEA distinta a la vigente y devuelve su token.
 *
 * El analyze no aplica nada: deja el lote en staged y entrega un staging_token
 * que el catálogo público acepta como preview_key. Por eso mirar el preview no
 * puede alterar lo que ve el cliente.
 */
async function crearBatchStaged(request: APIRequestContext): Promise<string> {
  const jwt = await loginAdmin(request);
  const res = await request.post(`${API}/api/v1/pricing/universe/import-cells/analyze`, {
    headers: { Authorization: `Bearer ${jwt}` },
    data: {
      landing_ids: [1],
      mode: 'upsert',
      file_name: 'e2e-preview.xlsx',
      // Los encabezados van textuales, con tildes y paréntesis: el backend
      // mapea las columnas por nombre y cualquier cambio las deja sin detectar.
      sheet: [
        ['Landing', 'Nombre', 'SKU', 'Precio lista (S/)', 'Frecuencia', 'Plazo',
          '% cuota inicial', 'Cuota inicial (S/)', 'Comisión (S/)', 'Cuota', 'TEA (%)'],
        // Cuota vacía: se deriva de la TEA. Con TEA 5% y comisión 0 da S/91,
        // bien lejos de los S/119 reales, así que la diferencia no puede ser
        // un redondeo.
        ['Home', PRODUCTO, SKU, PRECIO_LISTA, 'Mensual', 24, '0.00%', 0, 0, '', '5%'],
      ],
    },
  });
  expect(res.ok(), `el analyze falló con ${res.status()}`).toBeTruthy();
  const body = await res.json();
  expect(body.staging_token, 'el analyze no devolvió staging_token').toBeTruthy();
  return body.staging_token;
}

/**
 * Cuota mensual que muestra la card del iPad, tal como se ve en pantalla.
 *
 * Se ancla en el nodo cuyo texto es exactamente "S/<número>": la card también
 * muestra el precio original tachado, pero ese se renderiza como "S/170/mes" en
 * un solo nodo. Un regex sobre el texto completo de la card devolvería el
 * tachado y el test compararía el precio equivocado.
 */
async function cuotaEnPantalla(page: Page): Promise<string> {
  const titulo = page.locator(`a[href*="/producto/"]`, { hasText: PRODUCTO }).first();
  await titulo.waitFor({ timeout: 20000 });

  const card = titulo.locator('xpath=ancestor::div[contains(@class,"p-5")][1]');
  const cuota = card.locator('span').filter({ hasText: /^S\/\d+$/ }).first();
  await expect(cuota).toBeVisible({ timeout: 20000 });

  const texto = (await cuota.innerText()).trim();
  const m = texto.match(/^S\/(\d+)$/);
  expect(m, `no se pudo leer la cuota del iPad, se leyó "${texto}"`).toBeTruthy();
  return m![1];
}

/**
 * El preview se persiste en sessionStorage por diseño, para que sobreviva a
 * navegar dentro de la landing. En un test que compara "con token" contra "sin
 * token" en el mismo contexto, el caso sin token seguiría viendo el preview y
 * el test pasaría sin probar nada. Hay que limpiarlo explícitamente.
 */
async function irAlCatalogoSinPreview(page: Page): Promise<void> {
  await page.goto(CATALOGO);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
}

test('el link con token muestra otro precio que el catálogo real', async ({ page, request }) => {
  const token = await crearBatchStaged(request);

  await irAlCatalogoSinPreview(page);
  const real = await cuotaEnPantalla(page);

  await page.goto(`${CATALOGO}?preview_key=${token}`);
  const simulado = await cuotaEnPantalla(page);

  expect(real, 'la cuota real del iPad cambió respecto de lo verificado').toBe(CUOTA_REAL);
  expect(simulado, 'el preview no muestra la cuota del pricing propuesto').toBe(CUOTA_PREVIEW);
  expect(simulado, 'el preview muestra el mismo precio que el real').not.toBe(real);
});

test('el preview avisa que son precios propuestos', async ({ page, request }) => {
  const token = await crearBatchStaged(request);

  await page.goto(`${CATALOGO}?preview_key=${token}`);
  await expect(page.getByText(TEXTO_BANNER)).toBeVisible({ timeout: 20000 });

  // Sin token no puede avisar nada, porque no hay nada de qué avisar: es el
  // catálogo de siempre.
  await irAlCatalogoSinPreview(page);
  await cuotaEnPantalla(page);
  await expect(page.getByText(TEXTO_BANNER)).toHaveCount(0);
});

test('un token inválido cae al catálogo real, no a un error', async ({ page }) => {
  // El link se comparte por WhatsApp y vence en 1 hora: vencido tiene que verse
  // el catálogo normal, nunca una pantalla de error.
  await page.goto(`${CATALOGO}?preview_key=token-que-no-existe`);

  const cuota = await cuotaEnPantalla(page);
  expect(cuota, 'con un token inválido no se ve el precio real').toBe(CUOTA_REAL);
  await expect(page.getByText(TEXTO_BANNER)).toHaveCount(0);
});

test('el preview no escribe: el catálogo real no cambia después de mirarlo', async ({ page, request }) => {
  const token = await crearBatchStaged(request);

  await irAlCatalogoSinPreview(page);
  const antes = await cuotaEnPantalla(page);

  await page.goto(`${CATALOGO}?preview_key=${token}`);
  const durante = await cuotaEnPantalla(page);
  expect(durante, 'el preview no llegó a mostrarse, la prueba no valdría').toBe(CUOTA_PREVIEW);

  await irAlCatalogoSinPreview(page);
  const despues = await cuotaEnPantalla(page);

  expect(despues, 'mirar el preview alteró el catálogo real').toBe(antes);
  expect(despues, 'el catálogo real dejó de mostrar la cuota vigente').toBe(CUOTA_REAL);
});
