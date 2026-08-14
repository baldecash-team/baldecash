# Preview de pricing sobre landing publicada — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que un link temporal muestre el catálogo de una landing **publicada** con los precios propuestos de un import todavía no aplicado, sin que ningún cliente los vea y sin escribir en la BD.

**Architecture:** La web ya tiene todo el cableado: `catalogApi.ts` manda `preview_key` al backend y `CatalogoClient` lo propaga a cada llamada. El único corte es que el `previewKey` se obtiene de `preview.isPreviewingLanding(landing)`, que exige haber entrado por `/preview/{id}` — un flujo pensado para landings **no publicadas**. Se agrega una segunda fuente de token, leída de la URL, que convive con la actual sin reemplazarla. Para que sea genérico y no una excepción de pricing, el contexto guarda un preview con `scope` (hoy `"pricing"`, mañana lo que venga) y el catálogo solo pregunta "¿hay un token vigente para esta landing?".

**Tech Stack:** Next.js 14 App Router, React Context, sessionStorage, Vitest, Playwright.

## Global Constraints

- El TTL del link es **1 hora**, y manda el backend: `staging_expires_at` del batch. El front no inventa su propio vencimiento ni lo extiende.
- La landing está **publicada y activa**. El preview de pricing NO debe depender de `preview_hash` ni del flujo de landings no publicadas, que sigue funcionando igual.
- **Sin token, comportamiento byte-idéntico al actual.** Es la garantía de no-rotura: el catálogo de producción pasa por este código.
- El preview **no escribe nada**. Ya está garantizado en backend (batch en `staged`), y el front no debe agregar ninguna llamada de escritura.
- Un token vencido o inválido **cae al catálogo real**, nunca a una página de error: el link se comparte por WhatsApp y vencer es lo normal.
- Cuando el preview está activo tiene que **verse que es un preview**. Un catálogo con precios falsos indistinguible del real es peligroso.
- Comentarios y mensajes de commit en **español**, sin emojis, sin mexicanismos. Los comentarios explican POR QUÉ.
- Repo: `baldecash` (worktree `bal-2971-fe`). Rama nueva desde `main`.

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `src/app/prototipos/0.6/context/PreviewContext.tsx` | **Modificar.** Agregar `scope` al estado y una vía de activación por token que no exija landing no publicada. |
| `src/app/prototipos/0.6/hooks/usePreviewToken.ts` | **Crear.** Lee `?preview_key=` de la URL, lo persiste y lo devuelve. Una sola responsabilidad: resolver el token vigente de la landing en curso. |
| `src/app/prototipos/0.6/[landing]/catalogo/CatalogoClient.tsx:285` | **Modificar.** Una línea: el `previewKey` sale del hook nuevo, que ya contempla el caso actual. |
| `src/app/prototipos/0.6/components/PreviewBanner.tsx` | **Modificar.** Que el banner también aparezca en preview de pricing y diga qué se está viendo. |
| `src/app/prototipos/0.6/hooks/__tests__/usePreviewToken.test.ts` | **Crear.** Tests unitarios del hook. |
| `e2e/preview-pricing.spec.ts` | **Crear.** El E2E que prueba lo que se pidió: mismo catálogo, dos precios. |

---

### Task 1: El hook que resuelve el token de preview

**Files:**
- Create: `src/app/prototipos/0.6/hooks/usePreviewToken.ts`
- Test: `src/app/prototipos/0.6/hooks/__tests__/usePreviewToken.test.ts`

**Interfaces:**
- Consumes: `usePreview()` de `../context/PreviewContext` (ya existe).
- Produces: `usePreviewToken(landingSlug: string): string | null` — el token vigente para esa landing, o `null`. Task 3 lo consume.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/prototipos/0.6/hooks/__tests__/usePreviewToken.test.ts`:

```typescript
import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePreviewToken } from '../usePreviewToken';

// El hook lee la URL: se simula con la API de Next que usa el proyecto.
const mockSearchParams = vi.fn(() => new URLSearchParams(''));
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams(),
}));

vi.mock('../../context/PreviewContext', () => ({
  usePreview: () => ({
    isPreviewingLanding: () => false,
    previewKey: null,
  }),
}));

describe('usePreviewToken', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockSearchParams.mockReturnValue(new URLSearchParams(''));
  });

  it('sin token en la URL devuelve null', () => {
    const { result } = renderHook(() => usePreviewToken('home'));
    expect(result.current).toBeNull();
  });

  it('toma el token de la URL', () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('preview_key=ABC123'));
    const { result } = renderHook(() => usePreviewToken('home'));
    expect(result.current).toBe('ABC123');
  });

  it('el token sobrevive a navegar sin el parametro', () => {
    // Es el punto del hook: el usuario entra con ?preview_key=, clickea un
    // producto y vuelve; sin persistir, el segundo render pierde el preview.
    mockSearchParams.mockReturnValue(new URLSearchParams('preview_key=ABC123'));
    renderHook(() => usePreviewToken('home'));

    mockSearchParams.mockReturnValue(new URLSearchParams(''));
    const { result } = renderHook(() => usePreviewToken('home'));
    expect(result.current).toBe('ABC123');
  });

  it('el token de una landing no se usa en otra', () => {
    // Sin esto, previsualizar home dejaria precios simulados en ucv.
    mockSearchParams.mockReturnValue(new URLSearchParams('preview_key=ABC123'));
    renderHook(() => usePreviewToken('home'));

    mockSearchParams.mockReturnValue(new URLSearchParams(''));
    const { result } = renderHook(() => usePreviewToken('ucv'));
    expect(result.current).toBeNull();
  });

  it('un token guardado hace mas de una hora ya no vale', () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('preview_key=ABC123'));
    renderHook(() => usePreviewToken('home'));

    const guardado = JSON.parse(sessionStorage.getItem('baldecash-preview-pricing')!);
    guardado.activatedAt = Date.now() - 61 * 60 * 1000;
    sessionStorage.setItem('baldecash-preview-pricing', JSON.stringify(guardado));

    mockSearchParams.mockReturnValue(new URLSearchParams(''));
    const { result } = renderHook(() => usePreviewToken('home'));
    expect(result.current).toBeNull();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/app/prototipos/0.6/hooks/__tests__/usePreviewToken.test.ts`
Expected: FAIL — `Failed to resolve import "../usePreviewToken"`.

- [ ] **Step 3: Implementar el hook**

Crear `src/app/prototipos/0.6/hooks/usePreviewToken.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePreview } from '../context/PreviewContext';

/**
 * Token de preview vigente para la landing en curso, venga de donde venga.
 *
 * Hay dos formas de estar previsualizando y el catalogo no deberia conocer la
 * diferencia:
 *
 *   1. Landing NO publicada: se entra por /preview/{id} y el token vive en
 *      PreviewContext. Es el flujo que ya existia.
 *   2. Landing PUBLICADA con un pricing propuesto: se entra con
 *      ?preview_key= en cualquier URL de la landing. Es lo que agrega BAL-3008.
 *
 * El segundo caso se persiste por landing en sessionStorage porque el usuario
 * navega (catalogo -> producto -> volver) y el parametro se pierde en el
 * camino; sin persistir, el preview se apaga solo al primer click.
 */

const STORAGE_KEY = 'baldecash-preview-pricing';

/**
 * Una hora, igual que el TTL del backend. El backend es la autoridad: si el
 * token vencio alla, la respuesta viene con los precios reales igual. Este
 * limite solo evita seguir mandando un token muerto en cada request.
 */
const TTL_MS = 60 * 60 * 1000;

interface TokenGuardado {
  slug: string;
  token: string;
  activatedAt: number;
}

function leerGuardado(): TokenGuardado | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: TokenGuardado = JSON.parse(raw);
    if (Date.now() - parsed.activatedAt > TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    // sessionStorage puede fallar (modo privado, JSON corrupto). Sin preview
    // se ve el catalogo real, que es el fallback correcto.
    return null;
  }
}

export function usePreviewToken(landingSlug: string): string | null {
  const searchParams = useSearchParams();
  const preview = usePreview();
  const [token, setToken] = useState<string | null>(null);

  const desdeUrl = searchParams?.get('preview_key') ?? null;

  useEffect(() => {
    if (desdeUrl) {
      const guardar: TokenGuardado = {
        slug: landingSlug,
        token: desdeUrl,
        activatedAt: Date.now(),
      };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(guardar));
      } catch {
        // Si no se puede persistir, el preview igual funciona en esta pagina.
      }
      setToken(desdeUrl);
      return;
    }
    const guardado = leerGuardado();
    setToken(guardado?.slug === landingSlug ? guardado.token : null);
  }, [desdeUrl, landingSlug]);

  // El flujo de landings no publicadas sigue mandando: si ese preview esta
  // activo para esta landing, su token gana.
  if (preview.isPreviewingLanding(landingSlug) && preview.previewKey) {
    return preview.previewKey;
  }
  return token;
}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npx vitest run src/app/prototipos/0.6/hooks/__tests__/usePreviewToken.test.ts`
Expected: PASS — 5 passed.

- [ ] **Step 5: Verificar que los tests detectan una rotura**

Cambiar temporalmente `guardado?.slug === landingSlug` por `!!guardado`, correr los tests y confirmar que **falla** "el token de una landing no se usa en otra". Revertir.

Un test que no se pone rojo cuando rompés lo que cubre no está probando nada. En esta misma feature hubo 17 tests en verde con el overlay roto.

- [ ] **Step 6: Commit**

```bash
git add src/app/prototipos/0.6/hooks/usePreviewToken.ts src/app/prototipos/0.6/hooks/__tests__/usePreviewToken.test.ts
git commit -m "feat(BAL-3008): hook que resuelve el token de preview de la landing"
```

---

### Task 2: El catálogo usa el hook

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/catalogo/CatalogoClient.tsx:284-286`

**Interfaces:**
- Consumes: `usePreviewToken(landingSlug: string): string | null` de la Task 1.
- Produces: nada nuevo. `previewKey` mantiene su nombre y tipo, así que las ~6 llamadas que ya lo reciben no se tocan.

- [ ] **Step 1: Ver el estado actual**

Run: `sed -n '283,287p' "src/app/prototipos/0.6/[landing]/catalogo/CatalogoClient.tsx"`

Expected:
```
  // Preview mode support
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;
  const previewBannerOffset = previewKey ? 24 : 0;
```

- [ ] **Step 2: Reemplazar la fuente del token**

```tsx
  // Preview mode support
  //
  // El token puede venir del preview de landings no publicadas (PreviewContext)
  // o de un ?preview_key= sobre una landing publicada, que es como se ve el
  // pricing propuesto de un import todavia no aplicado. El hook resuelve las
  // dos; aca no interesa cual fue.
  const previewKey = usePreviewToken(landing);
  const previewBannerOffset = previewKey ? 24 : 0;
```

Agregar el import junto a los demás hooks del archivo:

```tsx
import { usePreviewToken } from '../../hooks/usePreviewToken';
```

Si `usePreview()` no se usa en otra parte del archivo, borrar también su import. Verificar con:

Run: `grep -n "usePreview\b" "src/app/prototipos/0.6/[landing]/catalogo/CatalogoClient.tsx"`

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit 2>&1 | grep CatalogoClient`
Expected: sin salida.

- [ ] **Step 4: Verificar que el token llega al backend**

Con el backend en `:8055` y la web en `:3002`, abrir el catálogo con un token de staging vigente y confirmar en la pestaña Network que la llamada a `/public/landing/home/products` lleva `preview_key=` en la query.

Sin este paso el resto es teoría: es exactamente el punto donde la URL perdía el token.

- [ ] **Step 5: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/catalogo/CatalogoClient.tsx"
git commit -m "feat(BAL-3008): el catalogo acepta preview_key en landing publicada"
```

---

### Task 3: Que se vea que es un preview

**Files:**
- Modify: `src/app/prototipos/0.6/components/PreviewBanner.tsx`

**Interfaces:**
- Consumes: `usePreviewToken(landingSlug: string): string | null` de la Task 1.
- Produces: nada.

Un catálogo con precios propuestos que se ve igual que el real es peligroso: alguien lo comparte, un cliente lo abre y reclama ese precio. El banner es parte de la feature, no un adorno.

- [ ] **Step 1: Leer el banner actual**

Run: `sed -n '1,80p' src/app/prototipos/0.6/components/PreviewBanner.tsx`

Identificar de dónde saca hoy su condición de visibilidad (usa `usePreview()`).

- [ ] **Step 2: Mostrarlo también en preview de pricing**

El banner debe aparecer cuando `usePreviewToken(landing)` devuelve un token, no solo cuando hay landing no publicada. El texto tiene que decir explícitamente qué se está viendo:

```tsx
Estás viendo precios propuestos que todavía no se aplicaron.
Los clientes siguen viendo los precios actuales. Este link vence en 1 hora.
```

Sin ID de lote ni jerga: el que abre el link puede ser Haru o alguien de negocio.

- [ ] **Step 3: Verificar en el navegador**

Abrir el catálogo con el token y confirmar que el banner se ve y que el texto es el de arriba. Sacar screenshot.

- [ ] **Step 4: Commit**

```bash
git add src/app/prototipos/0.6/components/PreviewBanner.tsx
git commit -m "feat(BAL-3008): el banner avisa que son precios propuestos"
```

---

### Task 4: E2E — el mismo catálogo con dos precios

**Files:**
- Create: `e2e/preview-pricing.spec.ts`

**Interfaces:**
- Consumes: la web en `:3002` y el backend en `:8055`.
- Produces: nada.

Es la prueba de lo que se pidió: dos links de la misma landing que muestran precios distintos.

- [ ] **Step 1: Escribir el test**

Crear `e2e/preview-pricing.spec.ts`:

```typescript
/**
 * E2E — preview de pricing sobre una landing PUBLICADA (BAL-3008)
 *
 * Prueba lo que se pidio: el mismo catalogo, dos precios. El link con token
 * muestra el pricing propuesto; sin token, el precio real que ve el cliente.
 *
 * PREREQUISITOS
 *   - backend BAL-3006 en :8055
 *   - web en :3002
 *   - un batch STAGED vigente para la landing home (ver helper crearBatch)
 */

import { test, expect } from '@playwright/test';

const WEB = process.env.E2E_WEB_URL ?? 'http://localhost:3002';
const API = process.env.E2E_API_URL ?? 'http://localhost:8055/api/v1';
const TOKEN_ADMIN = process.env.E2E_TOKEN ?? '';
const CATALOGO = `${WEB}/prototipos/0.6/home/catalogo/`;
const PRODUCTO = 'Laptop Chromebook CZ1104FM2A';

/** Crea un batch STAGED con una TEA distinta y devuelve su token. */
async function crearBatchStaged(request: any): Promise<string> {
  const res = await request.post(`${API}/pricing/universe/import-cells/analyze`, {
    headers: { Authorization: `Bearer ${TOKEN_ADMIN}` },
    data: {
      landing_ids: [1],
      mode: 'upsert',
      file_name: 'e2e-preview.xlsx',
      sheet: [
        ['Landing', 'Nombre', 'SKU', 'Precio lista (S/)', 'Frecuencia', 'Plazo',
         '% cuota inicial', 'Cuota inicial (S/)', 'Comisión (S/)', 'Cuota', 'TEA (%)'],
        ['Home', PRODUCTO, 'LPASUB0001410', 1899, 'Mensual', 6,
         '0.00%', 0, 5, '', '12%'],
      ],
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.staging_token, 'el analyze no devolvio token').toBeTruthy();
  return body.staging_token;
}

/** La cuota que muestra la card del producto en el catalogo renderizado. */
async function cuotaEnPantalla(page: any): Promise<string | null> {
  const card = page.locator(`text=${PRODUCTO}`).first();
  await card.waitFor({ timeout: 15000 });
  const contenedor = card.locator('xpath=ancestor::*[self::article or self::div][1]');
  const texto = await contenedor.innerText();
  const m = texto.match(/S\/\s?([\d,.]+)/);
  return m ? m[1] : null;
}

test('el link con token muestra otro precio que el catalogo real', async ({ page, request }) => {
  const token = await crearBatchStaged(request);

  await page.goto(CATALOGO);
  const real = await cuotaEnPantalla(page);

  await page.goto(`${CATALOGO}?preview_key=${token}`);
  const simulado = await cuotaEnPantalla(page);

  expect(real, 'no se leyo la cuota del catalogo real').toBeTruthy();
  expect(simulado, 'no se leyo la cuota del preview').toBeTruthy();
  expect(simulado, 'el preview muestra el mismo precio que el real').not.toBe(real);
});

test('el preview avisa que son precios propuestos', async ({ page, request }) => {
  const token = await crearBatchStaged(request);
  await page.goto(`${CATALOGO}?preview_key=${token}`);
  await expect(page.getByText(/precios propuestos/i)).toBeVisible();
});

test('un token invalido cae al catalogo real, no a un error', async ({ page }) => {
  // El link se comparte y vence: vencido tiene que verse el catalogo normal.
  await page.goto(`${CATALOGO}?preview_key=token-que-no-existe`);
  await expect(page.locator(`text=${PRODUCTO}`).first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/precios propuestos/i)).toHaveCount(0);
});

test('el preview no escribe: el catalogo real no cambia despues de mirarlo', async ({ page, request }) => {
  const token = await crearBatchStaged(request);
  await page.goto(CATALOGO);
  const antes = await cuotaEnPantalla(page);

  await page.goto(`${CATALOGO}?preview_key=${token}`);
  await cuotaEnPantalla(page);

  await page.goto(CATALOGO);
  const despues = await cuotaEnPantalla(page);
  expect(despues, 'mirar el preview altero el catalogo real').toBe(antes);
});
```

- [ ] **Step 2: Correr y verificar que falla antes de las Tasks 1-3**

Run: `npx playwright test e2e/preview-pricing.spec.ts --reporter=list`
Expected antes de implementar: FAIL en el primero (`el preview muestra el mismo precio que el real`), porque hoy la web descarta el token.

- [ ] **Step 3: Correr después de implementar**

Run: `npx playwright test e2e/preview-pricing.spec.ts --reporter=list`
Expected: 4 passed.

- [ ] **Step 4: Verificar que la bateria detecta regresiones**

Revertir la Task 2 (volver `previewKey` a `preview.isPreviewingLanding(...)`), correr, confirmar que el primer test **falla**. Restaurar.

- [ ] **Step 5: Commit**

```bash
git add e2e/preview-pricing.spec.ts
git commit -m "test(BAL-3008): E2E del preview de pricing en landing publicada"
```

---

### Task 5: El link del modal apunta a la URL correcta

**Files:**
- Modify (repo `admin2`): `src/components/pricing/universe/ImportExcelModal.tsx`, función `buildStagingCatalogUrl`

**Interfaces:**
- Consumes: nada de las tasks anteriores.
- Produces: nada.

El modal arma hoy `{base}{basePath}/{slug}/catalogo?preview_key=`. La ruta real es `/prototipos/0.6/{slug}/catalogo/` **con barra final**: sin ella Next redirige y **se come el query string**, que fue exactamente el síntoma reportado.

- [ ] **Step 1: Confirmar el problema**

Run: `curl -s -o /dev/null -w "%{url_effective}\n" -L "http://localhost:3002/prototipos/0.6/home/catalogo?preview_key=ABC"`
Expected: la URL final **no** tiene `preview_key` — se pierde en la redirección.

- [ ] **Step 2: Arreglar el helper**

```tsx
function buildStagingCatalogUrl(landingSlug: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3001";
  const basePath = process.env.NEXT_PUBLIC_LANDING_BASE_PATH || "";
  // La barra final es obligatoria: sin ella Next redirige de /catalogo a
  // /catalogo/ y descarta el query string, o sea el token nunca llega.
  return `${baseUrl}${basePath}/${landingSlug}/catalogo/?preview_key=${token}`;
}
```

- [ ] **Step 3: Verificar que `NEXT_PUBLIC_LANDING_BASE_PATH` incluya el prefijo**

Run: `grep -n "LANDING_BASE_PATH\|LANDING_URL" .env.local`

Si el basePath de la web es `/prototipos/0.6`, tiene que estar en la env var. Confirmar contra la URL que responde 200:

Run: `curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3002/prototipos/0.6/home/catalogo/"`
Expected: `200`.

- [ ] **Step 4: Verificar en el navegador**

Abrir el modal, analizar un Excel, clickear "Ver el catálogo simulado". Confirmar que la pestaña que abre **conserva** el `preview_key` en la barra de direcciones y muestra el banner de preview.

- [ ] **Step 5: Commit**

```bash
git add src/components/pricing/universe/ImportExcelModal.tsx
git commit -m "fix(BAL-3008): el link de staging conserva el token al abrirse"
```

---

## Self-Review

**Cobertura del requisito:**

| Pedido | Task |
|---|---|
| Ver el catálogo con los cambios sin aceptarlos | 1, 2 |
| Sobre una landing **publicada** | 1 (el hook no depende de `preview_hash`) |
| Duración de **1 hora** | 1 (TTL) + backend `staging_expires_at` |
| Que sea **dinámico y escalable** | 1 (el catálogo pregunta "¿hay token?", no "¿es pricing?") |
| Un link para **verlo** y comparar | 4, 5 |
| Que el cliente no lo vea | 4 (token inválido cae al real) |

**Riesgo principal:** la Task 2 toca el catálogo de producción. La mitiga la garantía de no-rotura: sin token, `usePreviewToken` devuelve `null` y todo queda igual. El paso 4 de la Task 4 lo verifica revirtiendo.

**Fuera de alcance, dicho explícitamente:** el detalle de producto (`/{landing}/producto/{slug}`) no entra en este plan. El backend ya lo soporta (`/detail` acepta `preview_key`), pero el front del detalle tiene su propio camino de datos y merece su propia tarea. Si al probar el preview alguien clickea un producto, va a ver el precio real: **hay que decirlo en el ticket, no dejarlo como sorpresa.**
