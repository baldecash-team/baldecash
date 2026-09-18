# Formulario embebido en `renueva-*` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En las landings `renueva-*` (un solo paso de formulario), mostrar accesorios plegado y el formulario embebido debajo, en la misma pantalla `/[landing]/solicitar`, sin tocar el flujo del contrato.

**Architecture:** Se extrae el cuerpo del paso regular de `StepClient.tsx` a un hook + componente reutilizable (`usePasoDelWizard` / `PasoDelWizard`), de modo que el submit —y con él el arranque del contrato— siga viviendo en un único lugar. La página intro (`solicitarClient.tsx`) monta ese componente detrás del gate `isSecondFinancingLanding(slug)`. Ninguna otra landing cambia.

**Tech Stack:** Next.js 15 (App Router, client components), React 19, TypeScript, Tailwind v4, framer-motion, Jest 29 + React Testing Library, lucide-react.

**Spec:** `docs/superpowers/specs/2026-09-18-renueva-formulario-embebido-design.md`

---

## Global Constraints

- **Gate único:** todo comportamiento nuevo va detrás de `isSecondFinancingLanding(slug)` — `src/app/prototipos/0.6/utils/theme.ts:48`, implementado como `/renueva-/i.test(slug)`. En cada archivo se deriva una sola vez: `const esRenueva = isSecondFinancingLanding(landing);`.
- **No tocar el flujo del contrato.** El submit debe seguir saliendo de una sola llamada a `submitApplication({ insuranceId: null, otpEnabled, kycEnabled, stayInWizard, conContrato })`. No duplicar esa llamada, no recalcular sus flags fuera de `usePasoDelWizard`.
- **`/[landing]/solicitar/datos-personales` sigue funcionando.** Hay deep links y el "Atrás" del resumen cae ahí. No se borra ni se redirige.
- **Idioma UI:** español latino con tildes correctas (`CLAUDE.md:48`).
- **Sin voseo** en texto de interfaz.
- **Base:** rama `feat/renueva-formulario-embebido`, salida de `origin/main` @ `796a2c13`. **OJO:** el ref local `main` está **944 commits atrás** (`06504d8c`). Todos los números de línea de este plan son contra `origin/main`. Nunca uses `main` local como referencia.
- **Comando de test** (el path lleva `[landing]`, que jest interpreta como regex — un pattern posicional **no matchea nada**):

  ```bash
  npm test -- --runTestsByPath "<ruta>"
  ```

  Si el worktree no tiene `node_modules`, se prestan los del repo padre sin instalar nada:

  ```bash
  NODE_PATH="D:/repos/baldecash/node_modules" \
    node "D:/repos/baldecash/node_modules/jest/bin/jest.js" --runTestsByPath "<ruta>"
  ```

- **La suite está roja en `origin/main`.** No sirve "todo verde" como criterio: se corren por ruta los tests que toca cada tarea.
- **Sin fixtures compartidos:** el repo no tiene `renderWithProviders` ni factories. Cada test declara sus mocks inline, con `let` mutable leído por closure desde la factory de `jest.mock`, y los `jest.mock` van **antes** del `import` del componente bajo test.
- **`jest.setup.js` mockea framer-motion parcialmente**: solo `motion.div/button/span/p/h1/h2/h3` y `AnimatePresence`. Cualquier otro (`motion.section`, `motion.li`, `useAnimation`) explota y hay que mockear framer-motion localmente en ese archivo.

---

## File Structure

| Archivo | Responsabilidad | Tarea |
|---|---|---|
| `.../solicitar/__tests__/solicitarClient.startButton.test.tsx` | Gating del CTA de la intro. Hoy **rojo**. | 1, 3, 7 |
| `.../solicitar/solicitarClient.tsx` (945 líneas) | Página intro. Recibe el gate, pierde las tarjetas, embebe el paso. | 3, 7, 8 |
| `.../sections/AccessoriesSection.tsx` (504 líneas) | Sección de accesorios. Gana modo colapsable. | 4 |
| `.../sections/SectionRenderer.tsx` | Despacha secciones por tipo. Debe propagar `colapsable`. | 4 |
| `.../wizard/usePasoDelWizard.ts` | **NUEVO.** Estado + handlers del paso regular (incluye el submit). | 6 |
| `.../wizard/PasoDelWizard.tsx` | **NUEVO.** Cuerpo del paso + overlays. | 6 |
| `.../[stepSlug]/StepClient.tsx` (1855 líneas) | Página del paso. Conserva chrome, resumen y contrato; delega el paso regular. | 5, 6 |
| `.../product/SelectedProductBar.tsx` | Barra fija de producto. Publica su alto real y acepta offset inferior. | 9 |
| `.../wizard/MobileStickyCta.tsx` | CTA fijo de móvil. Gana modo "debajo de la barra". | 9 |

Prefijo omitido en la tabla: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/`.

---

### Task 1: Reparar el test rojo de la intro

Base obligatoria: este archivo es el que las tareas 3 y 7 extienden, y hoy falla por un mock desactualizado. Verificado: falla **idéntico** en el checkout principal, así que es rojo preexistente de `origin/main`, no de esta rama.

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx:88-90`

**Interfaces:**
- Consumes: nada.
- Produces: un archivo de test verde sobre el que las tareas 3 y 7 agregan casos.

- [ ] **Step 1: Correr el test para ver el rojo actual**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx"
```

Esperado: FAIL, `2 failed, 2 total`, con

```
TypeError: Cannot read properties of undefined (reading 'has_coupon')
  at src/app/prototipos/0.6/[landing]/solicitar/solicitarClient.tsx:140:36
```

- [ ] **Step 2: Completar el mock de `fetchLandingConfig`**

`solicitarClient.tsx:138-142` hace:

```ts
fetchLandingConfig(landing).then(cfg => {
  setHasCatalog(cfg.layout.has_catalog);
  setCampanaRecibe(campanaAbierta(cfg));   // null-safe, no necesita nada
  setMuestraCupon(cfg.features.has_coupon); // <- explota: el mock no trae `features`
});
```

Reemplazar el bloque del mock por:

```tsx
jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: jest.fn().mockResolvedValue({
    layout: { has_catalog: true },
    // `solicitarClient` lee `cfg.features.has_coupon` para decidir si pinta el
    // cupón. Sin `features` el efecto de config tira TypeError y el render
    // nunca llega al botón.
    features: { has_coupon: true },
  }),
}));
```

- [ ] **Step 3: Correr el test para verificar que pasa**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx"
```

Esperado: PASS, `2 passed, 2 total`. Puede quedar ruido en consola (`Not implemented: window.scrollTo`) — es esperado, jsdom no implementa `scrollTo` y `useScrollToTop` lo llama; no falla el test.

- [ ] **Step 4: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx"
git commit -m "test(solicitar): el mock de config trae features y el test vuelve a correr"
```

---

### Task 2: Test del gate `esRenueva` en la intro

Antes de ramificar nada conviene fijar por test qué landings entran. `isSecondFinancingLanding` ya existe y está testeado indirectamente, pero ninguna prueba cubre los slugs reales de prod.

**Files:**
- Create: `src/app/prototipos/0.6/utils/__tests__/isSecondFinancingLanding.test.ts`

**Interfaces:**
- Consumes: `isSecondFinancingLanding(slug: string): boolean` de `src/app/prototipos/0.6/utils/theme.ts:48`.
- Produces: garantía de que los slugs de prod entran y que landings ajenas no.

- [ ] **Step 1: Escribir el test**

```ts
/**
 * Qué landings entran al formulario embebido de segundo financiamiento.
 *
 * Los slugs son los de la tabla `landing` en prod al 2026-09-18. Si mañana se
 * crea otra `renueva-*` entra sola, que es lo buscado; lo que este test impide
 * es que entre una landing que no lo es.
 */
import { isSecondFinancingLanding } from '../theme';

describe('isSecondFinancingLanding', () => {
  it.each([
    'renueva-tu-laptop',
    'renueva-tu-equipo',
    'renueva-tu-equipo-1',
    'renueva-tu-equipo-2',
    'renueva-tu-equipo-3',
    'renueva-tu-equipo-1-a',
    'test-renueva-tu-equipo-1',
  ])('entra: %s', (slug) => {
    expect(isSecondFinancingLanding(slug)).toBe(true);
  });

  it.each([
    'home',
    'copia-home',
    'reacondicionados',
    'convenio-ucv-landing',
    'senati',
    'renuevame',
  ])('no entra: %s', (slug) => {
    expect(isSecondFinancingLanding(slug)).toBe(false);
  });
});
```

- [ ] **Step 2: Correr el test**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/utils/__tests__/isSecondFinancingLanding.test.ts"
```

Esperado: PASS. `renuevame` no lleva guion después de "renueva", así que la regex `/renueva-/i` lo deja afuera — que es lo correcto.

- [ ] **Step 3: Commit**

```bash
git add "src/app/prototipos/0.6/utils/__tests__/isSecondFinancingLanding.test.ts"
git commit -m "test(renueva): fija que landings entran al segundo financiamiento"
```

---

### Task 3: Quitar las tarjetas informativas en `renueva-*`

Cambio independiente de todo lo demás y visible de entrada. Las tarjetas anuncian "2 pasos" — justo lo que este trabajo elimina de la pantalla.

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/solicitarClient.tsx:11` (import), `:118` aprox (derivada `esRenueva`), `:707-760` (los dos bloques)
- Test: `src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx`

**Interfaces:**
- Consumes: `isSecondFinancingLanding` (Task 2).
- Produces: `const esRenueva = isSecondFinancingLanding(landing);` dentro de `WizardPreviewContent`, que las tareas 7 y 8 reutilizan.

- [ ] **Step 1: Escribir los tests que fallan**

Agregar al final de `solicitarClient.startButton.test.tsx`. El mock de `next/navigation` de ese archivo devuelve `landing: 'home'` fijo, así que primero hay que hacerlo mutable. Reemplazar el bloque existente por:

```tsx
let landingActual = 'home';
jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: landingActual }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/prototipos/0.6/home/solicitar',
}));
```

y agregar a los `afterEach` existentes el reset `landingActual = 'home';`. Después, el describe nuevo:

```tsx
describe('tarjetas informativas de la intro', () => {
  it('una landing normal las muestra', async () => {
    render(<SolicitarClientPage />);
    expect(await screen.findByText('Tiempo estimado')).toBeInTheDocument();
    expect(screen.getByText('Proceso simple')).toBeInTheDocument();
    expect(screen.getByText('Datos protegidos')).toBeInTheDocument();
    expect(screen.getByText('Lo que necesitarás')).toBeInTheDocument();
  });

  it('renueva-* no las muestra: anuncian pasos que ya no existen', async () => {
    landingActual = 'renueva-tu-equipo-1';
    render(<SolicitarClientPage />);
    // Se espera a que el Suspense resuelva por algo que SÍ está en ambas.
    // Ancla deliberada: "Términos y Condiciones" está en las dos landings y
    // sobrevive a la Task 7, que en renueva-* cambia el botón "Comenzar
    // Solicitud" por "Continuar". Anclar en el botón dejaría este test rojo
    // más adelante por un cambio esperado, y un test así se termina borrando.
    await screen.findByText('Términos y Condiciones');
    expect(screen.queryByText('Tiempo estimado')).not.toBeInTheDocument();
    expect(screen.queryByText('Proceso simple')).not.toBeInTheDocument();
    expect(screen.queryByText('Datos protegidos')).not.toBeInTheDocument();
    expect(screen.queryByText('Lo que necesitarás')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr y verificar que el segundo falla**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx"
```

Esperado: el primero PASA, el segundo FALLA (`expect(element).not.toBeInTheDocument()` — hoy las tarjetas se pintan en toda landing).

- [ ] **Step 3: Implementar**

En `solicitarClient.tsx:11`, agregar el import al que ya existe de `theme`:

```ts
import { isNvidiaLanding, isGamerLanding, isSecondFinancingLanding } from '@/app/prototipos/0.6/utils/theme';
```

(El import actual de `isNvidiaLanding, isGamerLanding` está en la línea 22; se le suma el tercero, no se crea un import nuevo.)

Dentro de `WizardPreviewContent`, junto a la derivación de `landing` (línea ~113):

```ts
/**
 * Segundo financiamiento: un solo paso de formulario. La pantalla se arma
 * distinta — accesorios plegado y el formulario embebido debajo— así que el
 * gate se deriva una vez acá y lo consume todo el render.
 */
const esRenueva = isSecondFinancingLanding(landing);
```

Envolver los dos bloques. El de `:708` empieza con `{/* Info Cards */}` y termina en el `</div>` de cierre de la grilla; el de `:731` es el IIFE completo `{(() => { const reqData = ... })()}`. Quedan así:

```tsx
        {/* Info Cards.
            En renueva-* no van: la tarjeta del medio anuncia el número de
            pasos, y ese número es justo lo que este flujo dejó de tener. */}
        {!esRenueva && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {/* ...contenido actual sin cambios... */}
          </div>
        )}

        {/* Requirements */}
        {!esRenueva && (() => {
          const reqData = config?.form_extra_data?.requirements;
          /* ...resto del IIFE actual sin cambios... */
        })()}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx"
```

Esperado: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/solicitarClient.tsx" \
        "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx"
git commit -m "feat(renueva): la intro deja de anunciar pasos que ya no existen"
```

---

### Task 4: `AccessoriesSection` colapsable

Cerrado por defecto, con el loader visible en la cabecera mientras carga. Solo la intro de `renueva-*` lo enciende.

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/AccessoriesSection.tsx:58-68` (props), `:117` (estado), `:314-329` (tracking de impresiones), `:336-502` (render)
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/SectionRenderer.tsx:14-32`
- Test: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/__tests__/AccessoriesSection.colapsable.test.tsx` (crear)

**Interfaces:**
- Consumes: nada de tareas anteriores.
- Produces:
  - `interface AccessoriesSectionProps { showIntro?: boolean; className?: string; colapsable?: boolean }` — `colapsable` default `false`.
  - `interface SectionRendererProps { type: SolicitarSectionType; className?: string; colapsable?: boolean }` — la Task 7 le pasa `colapsable={esRenueva}`.

Contexto que no se puede perder al reestructurar el render (verificado en el archivo):

- `:332` — `if (!isLoading && accessories.length === 0) return null;`. Durante la carga **no** retorna null, así que la cabecera sí se pinta mientras carga y desaparece entera si no hay accesorios.
- `:346-353` — el ternario `isLoading ? (showLoadingScreen ? <AccessoriesLoadingScreen/> : spinner chico) : (contenido)`. Hay que **romperlo**: el loader pasa a la cabecera, el contenido al panel plegable.
- `:489-501` — `AccessoryDetailModal` está **fuera** del ternario. Tiene que quedar **fuera del colapso** o se desmonta al plegar y el modal abierto se cierra solo.
- `:117` — `showLoadingScreen` se enciende con un timer de 500 ms; con <500 ms se ve solo el spinner chico.
- El fetch se re-dispara al cambiar producto/plazo/frecuencia (deps de `:238`), así que el loader de cabecera va a reaparecer en cada refetch. Es correcto.
- No existe colapsable reutilizable en el repo. El patrón a imitar (sin importarlo: está acoplado al catálogo) es `src/app/prototipos/0.6/[landing]/catalogo/components/catalog/filters/FilterSection.tsx` — `useState` + header `<button>` + `ChevronUp/ChevronDown` + `animate-in slide-in-from-top-2 duration-200`.

- [ ] **Step 1: Escribir el test que falla**

```tsx
/**
 * Accesorios plegado en el segundo financiamiento.
 *
 * Cerrado por defecto para que el formulario embebido quede a la vista sin
 * scroll, pero el loader tiene que verse IGUAL estando plegado: si la cabecera
 * no dijera nada mientras carga, un bloque cerrado y mudo se lee como que la
 * sección está vacía.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let accesoriosDelApi: unknown[] = [];
let resuelveFetch: () => void = () => {};

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'renueva-tu-equipo-1' }),
}));
jest.mock('@/app/prototipos/0.6/services/landingApi', () => ({
  getLandingAccessories: jest.fn(
    () =>
      new Promise((resolve) => {
        resuelveFetch = () => resolve({ accessories: accesoriosDelApi, categories: [] });
      })
  ),
  resolveEcosistema: () => null,
}));
jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('../../../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({ config: {}, badgeText: '' }),
}));
jest.mock('../../../../context/SessionContext', () => ({
  useSessionOptional: () => null,
}));
jest.mock('@/app/prototipos/0.6/services/sessionApi', () => ({
  patchTrackingSession: jest.fn(),
}));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () =>
    new Proxy({}, { get: () => jest.fn() }),
}));
jest.mock('../../../../context/ProductContext', () => ({
  useProduct: () => ({
    selectedAccessories: [],
    toggleAccessory: jest.fn(),
    setSelectedAccessories: jest.fn(),
    selectedProduct: { id: 1, name: 'Laptop Test', type: 'laptop', term: 24 },
    cartProducts: [],
    getAllProducts: () => [{ id: 1, name: 'Laptop Test', type: 'laptop', term: 24 }],
    setIsLoadingAccessories: jest.fn(),
  }),
}));

import { AccessoriesSection } from '../AccessoriesSection';

const UN_ACCESORIO = {
  id: 10,
  name: 'Mouse inalámbrico',
  category: { slug: 'perifericos', name: 'Periféricos' },
  monthlyQuota: 15,
};

beforeEach(() => {
  accesoriosDelApi = [UN_ACCESORIO];
});

describe('AccessoriesSection colapsable', () => {
  it('cerrado por defecto: no muestra el contenido', async () => {
    render(<AccessoriesSection colapsable />);
    resuelveFetch();
    expect(await screen.findByRole('button', { name: /accesorios/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Buscar accesorio...')).not.toBeInTheDocument();
  });

  it('al abrirlo aparece el contenido', async () => {
    render(<AccessoriesSection colapsable />);
    resuelveFetch();
    const cabecera = await screen.findByRole('button', { name: /accesorios/i });
    await userEvent.click(cabecera);
    expect(await screen.findByPlaceholderText('Buscar accesorio...')).toBeInTheDocument();
  });

  it('cerrado y cargando: el loader se ve igual', () => {
    render(<AccessoriesSection colapsable />);
    // Sin resolver el fetch: sigue en isLoading.
    expect(screen.getByRole('status', { name: /cargando accesorios/i })).toBeInTheDocument();
  });

  it('sin `colapsable` se comporta como siempre: contenido a la vista', async () => {
    render(<AccessoriesSection />);
    resuelveFetch();
    expect(await screen.findByPlaceholderText('Buscar accesorio...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /accesorios/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/__tests__/AccessoriesSection.colapsable.test.tsx"
```

Esperado: FAIL — `colapsable` no existe como prop, no hay cabecera con rol `button` ni `role="status"`.

- [ ] **Step 3: Implementar el colapsable**

En `AccessoriesSection.tsx`, ampliar la interfaz (`:58-68`):

```ts
interface AccessoriesSectionProps {
  /**
   * Optional: Show section title and intro
   * @default true
   */
  showIntro?: boolean;
  /**
   * Optional: Custom class name for the container
   */
  className?: string;
  /**
   * La sección se pliega y arranca CERRADA. Se usa en la intro de las landings
   * de segundo financiamiento, donde el formulario va embebido justo debajo y
   * accesorios no puede empujarlo fuera de la pantalla.
   *
   * El loader NO se pliega: mientras carga se ve en la cabecera, o un bloque
   * cerrado y mudo se leería como una sección vacía.
   * @default false
   */
  colapsable?: boolean;
}
```

Firma (`:70-73`):

```ts
export function AccessoriesSection({
  showIntro = true,
  className = '',
  colapsable = false,
}: AccessoriesSectionProps) {
```

Estado nuevo, junto a `showLoadingScreen` (`:117`):

```ts
// Plegado. Solo aplica con `colapsable`; sin él la sección está siempre
// abierta y este estado no se lee.
const [abierto, setAbierto] = useState(false);
const contenidoVisible = !colapsable || abierto;
```

Importar `ChevronDown, ChevronUp` sumándolos al import de lucide de `:17`:

```ts
import { Search, Package, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
```

Reestructurar el render. El contenedor (`:337`) y `AccessoryDetailModal` (`:489-501`) no se mueven. Entre medio:

```tsx
      {/* Cabecera. Con `colapsable` es el botón que pliega; sin él, la intro
          de siempre. El loader vive acá para que se vea también cerrado. */}
      {colapsable ? (
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
        >
          <span className="text-base font-semibold text-neutral-800">
            {config?.form_extra_data?.accessories?.title ?? 'Accesorios'}
          </span>
          <span className="flex items-center gap-2 flex-shrink-0">
            {isLoading ? (
              <span
                role="status"
                aria-label="Cargando accesorios"
                className="w-5 h-5 border-2 border-[rgba(var(--color-primary-rgb),0.2)] border-t-[var(--color-primary)] rounded-full animate-spin"
              />
            ) : (
              selectedAccessories.length > 0 && (
                <span className="px-2.5 py-1 bg-[#22c55e]/10 text-[#22c55e] text-xs font-semibold rounded-full">
                  {selectedAccessories.length}
                </span>
              )
            )}
            {abierto ? (
              <ChevronUp className="w-5 h-5 text-neutral-400 group-hover:text-[var(--color-primary)]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-400 group-hover:text-[var(--color-primary)]" />
            )}
          </span>
        </button>
      ) : (
        showIntro && (
          <AccessoryIntro
            icon={config?.form_extra_data?.accessories?.icon}
            title={config?.form_extra_data?.accessories?.title}
            description={config?.form_extra_data?.accessories?.description}
          />
        )
      )}

      {/* Cuerpo. Plegado no se monta: los filtros y la paginación guardan
          estado que no tiene sentido mantener vivo detrás de un bloque cerrado. */}
      {contenidoVisible && (
        isLoading ? (
          // Con `colapsable` el loader ya está en la cabecera: no se repite acá.
          colapsable ? null : showLoadingScreen ? (
            <AccessoriesLoadingScreen productName={selectedProduct?.name} />
          ) : (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[rgba(var(--color-primary-rgb),0.2)] border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
          )
        ) : (
          <div className={colapsable ? 'mt-4 animate-in slide-in-from-top-2 duration-200' : undefined}>
            {/* ...todo el contenido actual de :355-486 sin cambios:
                toolbar de chips, buscador + contador + flechas, grid/empty... */}
          </div>
        )
      )}
```

- [ ] **Step 4: Atar el tracking de impresiones al estado abierto**

`:314-329` dispara `accessory_impression` apenas cargan los accesorios. Con la sección cerrada eso reportaría impresiones de accesorios que nadie vio. Agregar la condición al inicio del efecto:

```ts
useEffect(() => {
  // Plegado no hubo impresión: nadie vio las cards. Reportarlas igual
  // ensuciaría la métrica justo en las landings donde arranca cerrado.
  if (!contenidoVisible) return;
  // ...resto del efecto sin cambios...
}, [/* deps actuales */, contenidoVisible]);
```

- [ ] **Step 5: Propagar `colapsable` desde `SectionRenderer`**

`SectionRenderer.tsx`, interfaz y firma:

```tsx
interface SectionRendererProps {
  /**
   * Type of section to render
   */
  type: SolicitarSectionType;
  /**
   * Optional: Custom class name for the section
   */
  className?: string;
  /**
   * Pliega la sección de accesorios (segundo financiamiento). No aplica a
   * `insurance`, que vive en /complementos y sigue expandida.
   */
  colapsable?: boolean;
}

export function SectionRenderer({
  type,
  className = '',
  colapsable = false,
}: SectionRendererProps) {
  switch (type) {
    case 'accessories':
      return <AccessoriesSection className={className} colapsable={colapsable} />;

    case 'insurance':
      return <InsuranceSection className={className} />;
    // ...resto sin cambios...
```

- [ ] **Step 6: Correr los tests y verificar que pasan**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/__tests__/AccessoriesSection.colapsable.test.tsx"
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx"
```

Esperado: PASS los dos. El segundo mockea `SectionRenderer` con `() => null`, así que no debería verse afectado — si falla, la firma nueva rompió algo.

- [ ] **Step 7: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/"
git commit -m "feat(accesorios): la seccion se pliega y el loader se ve cerrado"
```

---

### Task 5: Test de caracterización del paso regular

**Esta es la red de seguridad de la extracción.** `StepClient` tiene 1855 líneas, contiene el envío anticipado y el arranque del contrato, y hoy **ningún test monta el paso regular**. El test se escribe **antes** de mover una sola línea y tiene que pasar igual antes y después.

**Files:**
- Create: `src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/__tests__/StepClient.pasoRegular.test.tsx`

**Interfaces:**
- Consumes: nada.
- Produces: la garantía de que `submitApplication` se llama con `{ insuranceId: null, otpEnabled, kycEnabled, stayInWizard, conContrato }` y que al resolver se navega al `nextStep`. La Task 6 no puede cerrarse sin que este test siga verde.

Datos del flujo real que el test reproduce (verificados contra `/public/landing/renueva-tu-equipo-1/solicitar-config` y `/wizard`):

- pasos: `datos-personales` (regular) → `resumen` (summary);
- `envio_anticipado: { step: 1, enabled: true }` ⇒ en `datos-personales`, `enviaEnEstePaso === true`;
- `kyc.contract` habilitado ⇒ `conContrato: true`;
- hay `nextStep` ⇒ `stayInWizard: true`.

- [ ] **Step 1: Escribir el test**

```tsx
/**
 * Qué hace el paso regular al pulsar Continuar.
 *
 * Es un test de CARACTERIZACIÓN: no describe un comportamiento nuevo, fija el
 * que ya existe, para que la extracción de `usePasoDelWizard` sea un movimiento
 * puro. Lo que protege es el arranque del contrato: en renueva-* la solicitud
 * se crea al cerrar el paso 1 (envío anticipado) y de ahí sale el contrato, así
 * que los flags de `submitApplication` no pueden cambiar sin que esto se ponga
 * rojo.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockSubmit = jest.fn().mockResolvedValue(true);
const mockPush = jest.fn();

const PASO_REGULAR = {
  code: 'datos_personales_pruebav2',
  url_slug: 'datos-personales',
  title: 'Datos personales',
  description: 'Contanos quién sos',
  order: 0,
  is_summary_step: false,
  fields: [],
  motivational: null,
};
const PASO_RESUMEN = {
  code: 'summary_resumen_1a',
  url_slug: 'resumen',
  title: 'Resumen',
  description: '',
  order: 1,
  is_summary_step: true,
  fields: [],
  motivational: null,
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useParams: () => ({ landing: 'renueva-tu-equipo-1', stepSlug: 'datos-personales' }),
  usePathname: () => '/prototipos/0.6/renueva-tu-equipo-1/solicitar/datos-personales',
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('../../hooks/useSubmitApplication', () => ({
  useSubmitApplication: () => ({
    submit: mockSubmit,
    isSubmitting: false,
    submitMessage: '',
    submitStage: 'idle',
    submitSucceeded: false,
  }),
}));

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({
    shouldShowComplementos: true,
    isCouponRequired: false,
    isEnabled: (t: string) => t !== 'otp_verification',
    kycEnabled: true,
    isKycStepEnabled: (t: string) => t === 'contract',
    envioAnticipadoStep: 1,
    firmaPorAceptacion: true,
    isLoading: false,
  }),
}));

jest.mock('../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({
    getStepByUrlSlug: (slug: string) =>
      slug === 'datos-personales' ? PASO_REGULAR : PASO_RESUMEN,
    getNavigation: () => ({
      currentIndex: 0,
      prevStep: null,
      nextStep: PASO_RESUMEN,
      isFirst: true,
      isLast: false,
    }),
    steps: [PASO_REGULAR, PASO_RESUMEN],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../context/WizardContext', () => ({
  useWizard: () => ({
    formData: {},
    setFieldError: jest.fn(),
    markStepCompleted: jest.fn(),
    getFieldValue: () => '',
    getFieldLabel: () => undefined,
    getAllDynamicOptions: () => ({}),
  }),
  FILE_PENDING_REUPLOAD: '__pending__',
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: {},
    footerData: {},
    agreementData: null,
    landingId: 178,
    isLoading: false,
    hasError: false,
    newsletterData: null,
  }),
}));

jest.mock('../../context/ProductContext', () => ({
  useProduct: () => ({
    selectedProduct: { id: 1, name: 'Laptop Test' },
    isHydrated: true,
    appliedCoupon: null,
    hasUnifiedTerms: () => true,
    cartProducts: [],
    isOverQuotaLimit: false,
    unavailableProductIds: [],
    isValidatingAvailability: false,
    isProductBarExpanded: false,
    getAllProducts: () => [{ id: 1, name: 'Laptop Test' }],
  }),
}));

jest.mock('@/app/prototipos/0.6/hooks/useLeadGuard', () => ({
  useLeadGuard: () => true,
}));
jest.mock('../../hooks/useLeadPrefill', () => ({ useLeadPrefill: jest.fn() }));
jest.mock('../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn() }),
}));
jest.mock('../../context/SessionContext', () => ({
  useSessionOptional: () => ({ sessionUuid: null }),
}));
jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: jest.fn().mockResolvedValue({
    layout: { has_catalog: true },
    features: { has_coupon: true, vip_countdown: false },
  }),
}));
// El cuerpo del paso no es lo que se prueba acá: sin campos, `validateStep`
// devuelve null y el foco queda en qué pasa después de validar.
jest.mock('../../components/solicitar/wizard/DynamicWizardStep', () => ({
  DynamicWizardStep: () => <div data-testid="cuerpo-del-paso" />,
}));

import StepClient from '../StepClient';

beforeEach(() => {
  mockSubmit.mockClear();
  mockSubmit.mockResolvedValue(true);
  mockPush.mockClear();
  Element.prototype.scrollIntoView = jest.fn();
});

describe('paso regular de renueva-*: qué pasa al continuar', () => {
  it('crea la solicitud con los flags del contrato y se queda en el wizard', async () => {
    render(<StepClient />);
    const continuar = await screen.findAllByText('Continuar');
    await userEvent.click(continuar[0].closest('button')!);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({
      insuranceId: null,
      otpEnabled: false,
      kycEnabled: true,
      stayInWizard: true,
      conContrato: true,
    });
  });

  it('al resolver el envío navega al paso siguiente, que es el resumen', async () => {
    render(<StepClient />);
    const continuar = await screen.findAllByText('Continuar');
    await userEvent.click(continuar[0].closest('button')!);

    expect(mockPush).toHaveBeenCalledWith(
      '/prototipos/0.6/renueva-tu-equipo-1/solicitar/resumen'
    );
  });

  it('el pestillo impide que un doble click cree dos solicitudes', async () => {
    render(<StepClient />);
    const continuar = await screen.findAllByText('Continuar');
    const boton = continuar[0].closest('button')!;
    await userEvent.click(boton);
    await userEvent.click(boton);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Correr el test contra el código actual**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/__tests__/StepClient.pasoRegular.test.tsx"
```

Esperado: **PASS, 3 tests.** Es caracterización: describe lo que ya hace el código.

Si falla, **no toques `StepClient`**: el test está mal y hay que arreglarlo hasta que refleje el comportamiento real. Pistas:
- La ruta esperada en `mockPush` sale de `routes.solicitarStep`; si no coincide, imprimí `mockPush.mock.calls` y usá el valor real.
- `findAllByText('Continuar')` devuelve dos nodos (la navegación en flujo de `WizardLayout` y el `MobileStickyCta`); por eso es `findAllByText` y se usa el primero.
- Si explota por `motion.section` o similar, mockeá framer-motion localmente en este archivo.

- [ ] **Step 3: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/__tests__/StepClient.pasoRegular.test.tsx"
git commit -m "test(solicitar): caracteriza el envio del paso regular antes de extraerlo"
```

---

### Task 6: Extraer `usePasoDelWizard` + `PasoDelWizard`

**Movimiento puro.** No se cambia comportamiento. El criterio de éxito es que el test de la Task 5 siga verde sin tocarlo.

**Files:**
- Create: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/usePasoDelWizard.ts`
- Create: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/PasoDelWizard.tsx`
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/index.ts` (exports)
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/StepClient.tsx`
- Test: el de la Task 5, sin modificar

**Interfaces:**
- Consumes: el test de caracterización de la Task 5.
- Produces:

```ts
export interface PasoDelWizardControles {
  /** El paso que se está mostrando. `null` mientras la config no resolvió. */
  step: WizardStep | null;
  /** Valida, marca el paso y dispara el envío. Es `onNext`, `onSubmit` y `onPrimary`. */
  handleNext: () => void;
  /** Vuelve al paso anterior, o a la intro si es el primero. */
  handleBack: () => void;
  /** Salta a un paso por su slug. */
  handleStepClick: (stepId: WizardStepId) => void;
  /** Este paso es el que cierra el formulario (envío anticipado o último sin complementos). */
  esElQueEnvia: boolean;
  /** Se está creando la solicitud de verdad. */
  isSubmitting: boolean;
  /** Etapa del envío, para el overlay. */
  submitStage: SubmitStage;
  /** Mensaje de progreso del envío. */
  submitMessage: string;
  /** Falso cuando la whitelist bloqueó el documento. */
  canProceed: boolean;
  /** Mostrar errores de campo (tras el primer intento). */
  showErrors: boolean;
  /** Corriendo la celebración entre pasos: el CTA fijo se esconde. */
  celebrando: boolean;
  /** Contenido motivacional resuelto (saludo por nombre si hay prefill). */
  motivational: WizardMotivational | null;
  /** Nombre para el saludo del layout. */
  firstName: string;
  /** Overlays y modales del paso: celebración, envío y "unidad tomada". */
  overlays: React.ReactNode;
}

export function usePasoDelWizard(opciones: {
  /** Slug del paso a mostrar. */
  stepSlug: string;
  /** Tema gamer: cambia el theme de la celebración. */
  gamer?: boolean;
}): PasoDelWizardControles;
```

```tsx
export function PasoDelWizard({ paso }: { paso: PasoDelWizardControles }): React.ReactElement | null;
```

`PasoDelWizard` renderiza **solo el cuerpo**: `<DynamicWizardStep step={paso.step} showErrors={paso.showErrors} stepOrder={paso.step.order} />`. El chrome (`WizardLayout`, Navbar, Footer) **no entra**: `WizardLayout` es página completa (`min-h-screen` + Navbar + `WizardProgress` + `MotivationalCard`) y por eso no es embebible.

- [ ] **Step 1: Crear `usePasoDelWizard.ts` moviendo el código, sin editarlo**

Mover **verbatim** desde `StepClient.tsx` (líneas contra `origin/main`):

| Qué | Líneas en `StepClient.tsx` |
|---|---|
| `showCelebration` | 105 |
| `submitted` | 106 |
| `unidadTomada` + `modalUnidadTomada` | 169, 176-188 |
| `handoff` + su efecto de lectura | 258, 261-273 |
| `enviandoRef` | 291 |
| `hasVipCountdown` + su efecto | 358, 359-364 |
| `step`, `navigation` | 227, 228-234 |
| `enviaEnEstePaso`, `yaEnviada` | 248-251, 276 |
| `bloqueadoPorWhitelist` | 140 |
| `formValues` | 339-352 |
| `hasVipToken`, `isVipLanding`, `stepMotivational` | 357, 365, 367-388 |
| `validateStep` | 447-450 |
| efecto de `form_abandon` (beforeunload) | 391-415 |
| `handleNext` | 566-608 |
| `handleCelebrationComplete` | 610-612 |
| `enviarYSeguir` | 620-663 |
| `handleBack` | 665-677 |
| `handleStepClick` | 679-681 |
| `isActuallyLastRegularStep` | 1141 |

Hooks que el archivo nuevo necesita re-declarar: `useRouter`, `useParams`, `useWizard`, `useWizardConfig`, `useSolicitarFlow`, `useProduct`, `useToast`, `useSubmitApplication`, `useEventTrackerOptional`, `usePreview`, `useSessionOptional`.

**Tres trampas verificadas que hay que respetar al mover:**

1. `enviarYSeguir` (620) es una **`function` declaration**, no un `const`, y `handleNext` (602) la llama **antes** de su definición gracias al hoisting. Si la convertís a `const`, movela **arriba** de `handleNext` o rompe en runtime.
2. `navigation` (228) es un **objeto nuevo en cada render**. No lo pongas en deps de un `useCallback` o lo invalidás siempre; desestructurá `nextStep`/`prevStep`/`isFirst`/`isLast`/`currentIndex`.
3. `isSubmitting` (108) **nunca se setea en el paso regular** — solo lo escribe `handleSummarySubmit`. En el paso se leía como `isBusy={isSubmitting}`, o sea siempre `false`. **No lo migres**: en el hook, `isBusy` del CTA pasa a ser `isSubmitting` del envío real.

`overlays` agrupa lo que hoy se monta suelto:

```tsx
const overlays = (
  <>
    <AnimatePresence>
      {showCelebration && step && (
        <StepSuccessMessage
          stepName={step.title}
          stepNumber={step.order + 1}
          totalSteps={steps.length}
          onComplete={handleCelebrationComplete}
          theme={gamer ? 'gamer' : undefined}
        />
      )}
    </AnimatePresence>
    <SubmitOverlay isOpen={isAppSubmitting} stage={submitStage} />
    {modalUnidadTomada}
  </>
);
```

- [ ] **Step 2: Crear `PasoDelWizard.tsx`**

```tsx
'use client';

/**
 * El cuerpo de un paso regular del formulario, sin nada de la página.
 *
 * Existe para que el mismo paso se pueda montar en dos lugares: la página
 * `/solicitar/[stepSlug]`, dentro de `WizardLayout`, y —en las landings de
 * segundo financiamiento, que tienen un solo paso— embebido en la intro debajo
 * de accesorios.
 *
 * El chrome NO entra acá a propósito: `WizardLayout` es una página entera
 * (`min-h-screen`, navbar, progreso, columna motivacional) y no se puede
 * embeber. Cada host pone el suyo.
 */

import React from 'react';
import { DynamicWizardStep } from './DynamicWizardStep';
import type { PasoDelWizardControles } from './usePasoDelWizard';

export function PasoDelWizard({ paso }: { paso: PasoDelWizardControles }) {
  if (!paso.step) return null;
  return (
    <DynamicWizardStep
      step={paso.step}
      showErrors={paso.showErrors}
      stepOrder={paso.step.order}
    />
  );
}

export default PasoDelWizard;
```

- [ ] **Step 3: Exportar desde el barrel**

En `components/solicitar/wizard/index.ts`, agregar:

```ts
export { PasoDelWizard } from './PasoDelWizard';
export { usePasoDelWizard } from './usePasoDelWizard';
export type { PasoDelWizardControles } from './usePasoDelWizard';
```

- [ ] **Step 4: Reescribir el render del paso regular en `StepClient.tsx`**

Borrar de `StepContent` todo lo movido en el Step 1 y dejar el tramo `1137-1229` así:

```tsx
  // Render regular form step content
  const pageContent = (
    <>
      {paso.overlays}

      <WizardLayout
        currentStep={step.url_slug || step.code}
        title={step.title}
        description={step.description}
        onBack={paso.handleBack}
        onNext={paso.handleNext}
        // `handleNext` tambien envia: valida, marca el paso y dispara el submit
        // al terminar la celebracion. Es el mismo camino que ya usa el CTA fijo
        // de movil, que nunca distinguio entre continuar y enviar.
        onSubmit={paso.handleNext}
        onStepClick={paso.handleStepClick}
        condicionesFijas={condicionesFijas}
        isFirstStep={navigation.isFirst}
        isLastStep={paso.esElQueEnvia}
        isSubmitting={paso.isSubmitting}
        submitMessage={paso.submitMessage}
        canProceed={paso.canProceed}
        ctaFijoEnMovil
        hideNavbar={isGamer}
        navbarProps={isGamer ? undefined : (navbarProps || undefined)}
        motivational={paso.motivational}
        firstName={paso.firstName}
      >
        <PasoDelWizard paso={paso} />
      </WizardLayout>
    </>
  );

  const stickyCtaPaso = (
    <MobileStickyCta
      onBack={paso.handleBack}
      onPrimary={paso.handleNext}
      isLastStep={paso.esElQueEnvia}
      isSubmitting={paso.isSubmitting}
      submitMessage={paso.submitMessage}
      canProceed={paso.canProceed}
      oculto={paso.celebrando}
    />
  );
```

Las ramas `isGamer` / normal del return (1209-1229) quedan igual, salvo que `SubmitOverlay` y `modalUnidadTomada` ya vienen dentro de `paso.overlays` y se sacan de ahí.

Arriba, junto a los otros hooks:

```ts
const paso = usePasoDelWizard({ stepSlug, gamer: isGamerLanding(landing) });
```

**Importante:** ese `usePasoDelWizard` va **antes de todos los early returns** (819 en adelante), como el resto de los hooks, o se rompe el orden de hooks de React.

- [ ] **Step 5: Correr el test de caracterización SIN tocarlo**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/__tests__/StepClient.pasoRegular.test.tsx"
```

Esperado: **PASS, 3 tests**, exactamente igual que en la Task 5. Si algo cambió, el movimiento no fue puro: revertí y movelo de nuevo, no ajustes el test.

- [ ] **Step 6: Correr los tests vecinos del wizard**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/__tests__/ContratoEnWizard.test.tsx"
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/__tests__/MobileStickyCta.test.tsx"
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/__tests__/WizardNavigation.test.tsx"
```

Esperado: PASS los tres.

- [ ] **Step 7: Verificar que compila**

```bash
npx tsc --noEmit -p tsconfig.json
```

Esperado: sin errores nuevos en los archivos tocados.

- [ ] **Step 8: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/" \
        "src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/StepClient.tsx"
git commit -m "refactor(solicitar): el paso regular sale de StepClient a un hook reutilizable"
```

---

### Task 7: Embeber el paso en la intro

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/solicitarClient.tsx` (`:121` scroll, `:316-377` `handleStart`, `:762-764` secciones, `:865-880` CTA)
- Test: `src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.renueva.test.tsx` (crear)

**Interfaces:**
- Consumes: `esRenueva` (Task 3), `SectionRenderer` con `colapsable` (Task 4), `usePasoDelWizard` / `PasoDelWizard` (Task 6).
- Produces: la pantalla única de `renueva-*`.

- [ ] **Step 1: Partir del archivo de mocks que ya existe**

Este test necesita exactamente los mismos mocks de contexto que
`solicitarClient.startButton.test.tsx` (ProductContext, useLeadGuard,
LayoutContext, WizardConfigContext, useSolicitarFlow, landingConfigApi,
PreviewContext, useAnalytics, SectionRenderer, CouponInput,
SelectedProductBar/Spacer). No los reescribas de memoria:

```bash
# Copiar el archivo entero y después editarlo.
cp "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx" \
   "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.renueva.test.tsx"
```

Sobre la copia: borrar los dos `describe` del final (`boton Comenzar Solicitud
— gating por isLoadingAccessories` y `tarjetas informativas de la intro`),
dejar todo lo de arriba, y aplicar los cambios del Step 2.

- [ ] **Step 2: Escribir el test que falla**

Sobre la copia del Step 1: cambiar el default de `landingActual` a
`'renueva-tu-equipo-1'`, agregar el mock del wizard **antes** del `import` del
componente, y pegar los `describe` nuevos al final.

```tsx
let landingActual = 'renueva-tu-equipo-1';

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: landingActual }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => `/prototipos/0.6/${landingActual}/solicitar`,
}));

// El cuerpo del paso se prueba en StepClient.pasoRegular.test.tsx; acá solo
// importa que la intro lo monte.
jest.mock('../components/solicitar/wizard', () => ({
  ...jest.requireActual('../components/solicitar/wizard'),
  PasoDelWizard: () => <div data-testid="formulario-embebido" />,
  usePasoDelWizard: () => ({
    step: { code: 'p1', url_slug: 'datos-personales', title: 'Datos personales', order: 0, fields: [] },
    handleNext: jest.fn(),
    handleBack: jest.fn(),
    handleStepClick: jest.fn(),
    esElQueEnvia: true,
    isSubmitting: false,
    submitStage: 'idle',
    submitMessage: '',
    canProceed: true,
    showErrors: false,
    celebrando: false,
    motivational: null,
    firstName: '',
    overlays: null,
  }),
}));

import SolicitarClientPage from '../solicitarClient';

afterEach(() => {
  landingActual = 'renueva-tu-equipo-1';
});

describe('intro de renueva-*', () => {
  it('monta el formulario embebido', async () => {
    render(<SolicitarClientPage />);
    expect(await screen.findByTestId('formulario-embebido')).toBeInTheDocument();
  });

  it('ya no ofrece "Comenzar Solicitud": el formulario está en la página', async () => {
    render(<SolicitarClientPage />);
    await screen.findByTestId('formulario-embebido');
    expect(screen.queryByText('Comenzar Solicitud')).not.toBeInTheDocument();
  });

  it('una landing normal no monta el formulario y conserva su botón', async () => {
    landingActual = 'home';
    render(<SolicitarClientPage />);
    expect(await screen.findByText('Comenzar Solicitud')).toBeInTheDocument();
    expect(screen.queryByTestId('formulario-embebido')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Correr y verificar que falla**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.renueva.test.tsx"
```

Esperado: FAIL en los dos primeros (no existe `formulario-embebido`, y "Comenzar Solicitud" sí está). El tercero PASA.

- [ ] **Step 4: Montar el paso y la acción única**

En `solicitarClient.tsx`, imports nuevos:

```ts
import { PasoDelWizard, usePasoDelWizard } from './components/solicitar/wizard';
```

Dentro de `WizardPreviewContent`, junto a los otros hooks (antes de cualquier return):

```ts
/**
 * El paso del formulario, embebido. Se monta siempre —el orden de hooks no
 * admite condicionales— pero solo se RENDERIZA en renueva-*.
 */
const pasoEmbebido = usePasoDelWizard({ stepSlug: firstStep?.url_slug || firstStep?.code || '' });
```

Separar de `handleStart` las validaciones propias de la intro, para poder reusarlas:

```ts
/**
 * Las validaciones de la intro: carrito, plazos, consentimientos, cupón.
 * Devuelve `true` si se puede seguir; si no, ya dejó el error puesto y
 * scrolleó a la sección culpable.
 *
 * Corre ANTES que la validación de campos del formulario: si el formulario
 * validara primero, la persona vería errores en los campos cuando lo que le
 * falta es un checkbox más abajo.
 */
const validacionesDeLaIntro = (): boolean => {
  if (hasUnavailableProducts) { scrollToSection('unavailable-products-banner'); return false; }
  if (isOverQuotaLimit) { scrollToSection('product-section'); return false; }
  if (needsTermUnification) { scrollToSection('term-selector-section'); return false; }

  let hasConsentError = false;
  if (!acceptTerms) { setTermsError('Debes aceptar los términos y condiciones para continuar'); hasConsentError = true; }
  if (!acceptPrivacy) { setPrivacyError('Debes aceptar la política de privacidad para continuar'); hasConsentError = true; }
  if (hasConsentError) { scrollToSection('terms-section'); return false; }

  if (isCouponRequired && !appliedCoupon) {
    setCouponError('Debes ingresar un cupón válido para continuar');
    scrollToSection('coupon-section');
    return false;
  }

  setTermsError(null);
  setPrivacyError(null);
  setCouponError(null);
  return true;
};
```

`handleStart` (que sigue siendo el del resto de las landings) pasa a:

```ts
const handleStart = () => {
  if (!validacionesDeLaIntro()) return;

  if (!firstStep) { console.error('No hay pasos configurados para esta landing'); return; }
  const firstStepSlug = firstStep.url_slug || firstStep.code;
  if (!firstStepSlug) { console.error('El primer paso no tiene url_slug ni code configurado'); return; }

  router.push(routes.solicitarStep(landing, firstStepSlug));
};
```

Y la acción de `renueva-*`:

```ts
/**
 * En renueva-* no se "comienza" nada: el formulario ya está en pantalla. La
 * acción valida la intro y, si pasa, entrega el control al paso, que valida
 * sus campos y crea la solicitud.
 */
const handleContinuarEmbebido = () => {
  if (!validacionesDeLaIntro()) return;
  pasoEmbebido.handleNext();
};
```

- [ ] **Step 5: Insertar el formulario debajo de accesorios**

En el render, reemplazar el bloque de secciones (`:762-765`):

```tsx
        {/* Dynamic Sections Before Wizard - Rendered in configured order */}
        {sectionsBeforeWizard.map((section) => (
          <SectionRenderer
            key={section.type}
            type={section.type}
            className="mb-8"
            colapsable={esRenueva && section.type === 'accessories'}
          />
        ))}

        {/* El formulario, embebido. Va justo debajo de accesorios y encima de
            los términos: es el orden en que se completa la pantalla. */}
        {esRenueva && pasoEmbebido.step && (
          <div id="formulario-embebido" className="bg-white rounded-xl p-4 sm:p-6 border border-neutral-200 mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 leading-tight">
                {pasoEmbebido.step.title}
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 mt-1">
                {pasoEmbebido.step.description}
              </p>
            </div>
            <PasoDelWizard paso={pasoEmbebido} />
          </div>
        )}
        {esRenueva && pasoEmbebido.overlays}
```

Y el CTA en flujo (`:865-880`) se ramifica:

```tsx
        {/* CTA Button */}
        <button
          onClick={esRenueva ? handleContinuarEmbebido : handleStart}
          disabled={isOverQuotaLimit || hasUnavailableProducts || isLoadingAccessories || (esRenueva && !pasoEmbebido.canProceed)}
          className={/* ...sin cambios... */}
        >
          <span>{esRenueva ? 'Continuar' : 'Comenzar Solicitud'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
```

- [ ] **Step 6: Scroll al formulario al abrir**

`solicitarClient.tsx:121` llama `useScrollToTop()`. En `renueva-*` no sirve: la pantalla útil empieza en el formulario.

Agregar, después de la definición de `scrollToSection`:

```ts
/**
 * En renueva-* la pantalla abre sobre el formulario, no sobre el encabezado.
 *
 * Se espera a que el paso esté montado: scrollear antes de que
 * `DynamicWizardStep` pinte los campos deja la posición mal calculada, porque
 * el alto del bloque todavía no existe.
 */
const yaScrolleoRef = useRef(false);
useEffect(() => {
  if (!esRenueva || yaScrolleoRef.current) return;
  if (!pasoEmbebido.step) return;
  const el = document.getElementById('formulario-embebido');
  if (!el) return;
  yaScrolleoRef.current = true;
  const rect = el.getBoundingClientRect();
  window.scrollTo({
    top: Math.max(0, window.pageYOffset + rect.top - getHeaderOffset() - 24),
    behavior: 'smooth',
  });
}, [esRenueva, pasoEmbebido.step, getHeaderOffset]);
```

Importar `useRef` sumándolo al import de React de `:8`.

- [ ] **Step 7: Correr los tests y verificar que pasan**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.renueva.test.tsx"
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx"
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/__tests__/StepClient.pasoRegular.test.tsx"
```

Esperado: PASS los tres. El de `StepClient` importa: confirma que embeber el paso no rompió la página del paso.

- [ ] **Step 8: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/solicitarClient.tsx" \
        "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.renueva.test.tsx"
git commit -m "feat(renueva): el formulario va embebido debajo de accesorios"
```

---

### Task 8: CTA fijo debajo de la barra de producto en móvil

La parte más delicada. Hoy `MobileStickyCta` (`z-[45]`) se apila **encima** de `SelectedProductBar` (`z-40`), usando `bottom: calc(72px + env(safe-area-inset-bottom))`. En `renueva-*` se invierte.

**Problema de fondo verificado:** ese `72px` está **hardcodeado y duplicado** (`SelectedProductBar.tsx:695` y `MobileStickyCta.tsx:118`) y **es una suposición**: la barra mide 72px solo cuando `mostrarImagenProducto` es `true` (48px del thumbnail + 24px de padding). Con la imagen apagada mide menos y ya hoy queda un hueco. Invertir el apilado sobre literales duplicados garantiza desalineación, así que la barra pasa a **publicar su alto real**, con el mismo patrón que `ReferralBanner` usa para `--referral-banner-offset`.

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/SelectedProductBar.tsx:130`, `:685-698`
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/MobileStickyCta.tsx:36-77`, `:112-118`, `:170-177`
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/solicitarClient.tsx` (montar el CTA fijo)
- Test: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/__tests__/MobileStickyCta.test.tsx`

**Interfaces:**
- Consumes: `esRenueva` (Task 3), `pasoEmbebido` (Task 7).
- Produces:
  - `MobileStickyCtaProps` gana `debajoDeLaBarra?: boolean` (default `false`).
  - `SelectedProductBarProps` gana `offsetInferior?: string` (default `'0px'`) — valor CSS que se aplica como `bottom`.
  - Variable CSS `--product-bar-height`, publicada en `document.documentElement` por `SelectedProductBar` mientras la barra fija está montada, y removida al desmontar.

- [ ] **Step 1: Escribir los tests que fallan**

Agregar a `MobileStickyCta.test.tsx`:

```tsx
describe('MobileStickyCta — dónde se pega', () => {
  it('por defecto se apila encima de la barra de producto', () => {
    const { container } = render(<MobileStickyCta onPrimary={jest.fn()} />);
    const caja = container.firstElementChild as HTMLElement;
    expect(caja.style.bottom).toBe('calc(var(--product-bar-height, 72px) + env(safe-area-inset-bottom))');
  });

  it('con `debajoDeLaBarra` se pega al borde inferior', () => {
    const { container } = render(<MobileStickyCta onPrimary={jest.fn()} debajoDeLaBarra />);
    const caja = container.firstElementChild as HTMLElement;
    expect(caja.style.bottom).toBe('0px');
    // El safe-area pasa a ser padding propio: abajo del CTA ya no hay nada.
    expect(caja.style.paddingBottom).toBe('env(safe-area-inset-bottom)');
  });

  it('sin barra de producto, `debajoDeLaBarra` no cambia nada', () => {
    mockProduct.getAllProducts = () => [];
    const { container } = render(<MobileStickyCta onPrimary={jest.fn()} debajoDeLaBarra />);
    const caja = container.firstElementChild as HTMLElement;
    expect(caja.style.bottom).toBe('0px');
  });
});
```

Agregar al `beforeEach` existente el reset `mockProduct.getAllProducts = () => [{ id: 1 }];`.

> **jsdom y `env()`.** El parser CSS de jsdom descarta los valores que no
> entiende, y `env(safe-area-inset-bottom)` es candidato a volver como `''`
> desde `.style.bottom`. Si al correr el Step 2 los asserts fallan con `''` en
> vez de con el valor viejo, **no pelees con el parser**: cambiá esas tres
> assertions a `expect(caja.getAttribute('style')).toContain('...')` con el
> fragmento relevante. Lo que se quiere fijar es qué valor escribe el
> componente, no cómo lo normaliza jsdom. Dejá una línea de comentario diciendo
> por qué es `toContain`.

- [ ] **Step 2: Correr y verificar que falla**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/__tests__/MobileStickyCta.test.tsx"
```

Esperado: los 3 nuevos FALLAN (`debajoDeLaBarra` no existe; el `bottom` actual usa el literal `72px`). Los ~15 existentes PASAN.

- [ ] **Step 3: Publicar el alto real de la barra**

En `SelectedProductBar.tsx`, dentro del componente, antes del return:

```ts
/**
 * El alto real de la barra, publicado como variable CSS.
 *
 * Antes el `72px` estaba hardcodeado en dos archivos, y era una suposición:
 * la barra mide 72px solo con la imagen del producto puesta (48px de thumbnail
 * + 24px de padding). Con `mostrarImagenProducto` apagado mide menos, y lo que
 * se apila encima quedaba desalineado. Mismo patrón que `--referral-banner-offset`.
 */
const barraRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  const nodo = barraRef.current;
  if (!nodo) return;
  const raiz = document.documentElement;
  const medir = () => raiz.style.setProperty('--product-bar-height', `${nodo.offsetHeight}px`);
  medir();
  const ro = new ResizeObserver(medir);
  ro.observe(nodo);
  return () => {
    ro.disconnect();
    raiz.style.removeProperty('--product-bar-height');
  };
}, []);
```

Ampliar props:

```ts
  /**
   * Desplaza la barra fija hacia arriba, para dejar lugar a algo pegado al
   * borde inferior. Valor CSS; lo normal es la variable que publica quien está
   * abajo, con fallback a 0: `'var(--sticky-cta-height, 0px)'`.
   * @default '0px'
   */
  offsetInferior?: string;
```

Y el contenedor fijo (`:130`) pasa a:

```tsx
<div
  className="lg:hidden fixed left-0 right-0 z-40"
  // Con el drawer abierto el offset se anula: el panel crece desde el borde y
  // lo que estaba pegado abajo (el CTA) ya se desmontó solo.
  style={{ bottom: isExpanded ? '0px' : offsetInferior }}
>
```

El botón colapsado que mide el alto lleva el `ref`: agregar `ref={barraRef}` al `<motion.div>` del panel blanco (`:143`).

Y `SelectedProductSpacer` deja de usar el literal:

```tsx
export const SelectedProductSpacer: React.FC = () => {
  const { getAllProducts } = useProduct();
  if (getAllProducts().length === 0) return null;
  return (
    <div
      className="lg:hidden"
      style={{ height: 'calc(var(--product-bar-height, 72px) + env(safe-area-inset-bottom))' }}
    />
  );
};
```

- [ ] **Step 4: Invertir el CTA**

En `MobileStickyCta.tsx`, props:

```ts
  /**
   * El CTA va pegado al borde inferior y la barra de producto queda ENCIMA.
   *
   * Es el orden inverso al del resto del flujo, donde el CTA se apila sobre la
   * barra. Se usa en la intro embebida de segundo financiamiento. Levantar la
   * barra es responsabilidad de quien la monta, vía su prop `offsetInferior`.
   * @default false
   */
  debajoDeLaBarra?: boolean;
```

El contenedor (`:114-119`):

```tsx
    <div
      className="lg:hidden fixed left-0 right-0 z-[45] bg-white border-t border-neutral-200
                 px-4 py-3 shadow-[0_-8px_24px_rgba(16,24,40,0.10)]"
      style={
        debajoDeLaBarra
          ? // Pegado al borde: el safe-area pasa a ser padding propio, porque
            // abajo del CTA ya no hay ninguna barra que lo absorba.
            { bottom: '0px', paddingBottom: 'env(safe-area-inset-bottom)' }
          : {
              bottom: hayBarraProducto
                ? 'calc(var(--product-bar-height, 72px) + env(safe-area-inset-bottom))'
                : 'env(safe-area-inset-bottom)',
            }
      }
    >
```

> **No** cambiar `bottom-0` por la clase Tailwind. Hay CSS gamer con `!important` que selecciona `.fixed.bottom-0` (`StepClient.tsx:1436`, `:1454`, `complementosClient.tsx:560-587`, `:638`); hoy no alcanza al CTA justamente porque el `bottom` es inline. Con la clase, el CTA heredaría fondo oscuro en las landings gamer.

El CTA también publica su alto, por el mismo motivo que la barra: con
`debajoDeLaBarra` hay algo apilado encima, y el `68px` sería otra suposición —
el alto cambia con el safe-area y con el texto del botón. Agregar **antes de
los early returns** (`:103-110`): los hooks van siempre arriba, o se rompe el
orden de hooks cuando el componente retorna `null` por teclado o por drawer.

```ts
const ctaRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  const nodo = ctaRef.current;
  const raiz = document.documentElement;
  if (!nodo) {
    // Desmontado (teclado, drawer, celebración): lo que se apilaba encima
    // tiene que volver a su sitio, no quedarse flotando sobre un hueco.
    raiz.style.removeProperty('--sticky-cta-height');
    return;
  }
  const medir = () => raiz.style.setProperty('--sticky-cta-height', `${nodo.offsetHeight}px`);
  medir();
  const ro = new ResizeObserver(medir);
  ro.observe(nodo);
  return () => {
    ro.disconnect();
    raiz.style.removeProperty('--sticky-cta-height');
  };
}, [oculto, isProductBarExpanded, tecladoAbierto]);
```

y `ref={ctaRef}` en el `<div>` contenedor de arriba. Importar `useRef` y
`useEffect` en el import de React del archivo.

`MobileStickyCtaSpacer` también deja el literal:

```tsx
export const MobileStickyCtaSpacer: React.FC = () => (
  <div className="lg:hidden" style={{ height: 'var(--sticky-cta-height, 68px)' }} />
);
```

- [ ] **Step 5: Montar el CTA fijo en la intro de `renueva-*`**

En `solicitarClient.tsx`, el bloque final del return (`:913-914`):

```tsx
      <SelectedProductBar
        mobileOnly
        // El alto lo publica el propio CTA. Si se desmonta (teclado, drawer),
        // la variable desaparece y el fallback la baja al borde: nunca queda
        // levantada sobre un hueco.
        offsetInferior={esRenueva ? 'var(--sticky-cta-height, 0px)' : '0px'}
      />
      <SelectedProductSpacer />
      {esRenueva && (
        <>
          <MobileStickyCtaSpacer />
          <MobileStickyCta
            onPrimary={handleContinuarEmbebido}
            isLastStep={pasoEmbebido.esElQueEnvia}
            isSubmitting={pasoEmbebido.isSubmitting}
            submitMessage={pasoEmbebido.submitMessage}
            canProceed={pasoEmbebido.canProceed}
            oculto={pasoEmbebido.celebrando}
            debajoDeLaBarra
          />
        </>
      )}
```

Importar los dos desde el barrel del wizard. **No** se pasa `onBack`: en la intro no hay paso anterior, y sin la prop el componente no pinta el botón de atrás.

- [ ] **Step 6: Correr los tests y verificar que pasan**

```bash
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/__tests__/MobileStickyCta.test.tsx"
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/__tests__/SelectedProductBar.congelada.test.tsx"
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/SelectedProductBar.productImage.test.tsx"
npm test -- --runTestsByPath "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.renueva.test.tsx"
```

Esperado: PASS los cuatro.

- [ ] **Step 7: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/SelectedProductBar.tsx" \
        "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/MobileStickyCta.tsx" \
        "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/__tests__/MobileStickyCta.test.tsx" \
        "src/app/prototipos/0.6/[landing]/solicitar/solicitarClient.tsx"
git commit -m "feat(renueva): el boton continuar queda pegado debajo de la barra en movil"
```

---

### Task 9: Verificación final

**Files:** ninguno nuevo.

- [ ] **Step 1: Correr todos los tests tocados**

```bash
npm test -- --runTestsByPath \
  "src/app/prototipos/0.6/utils/__tests__/isSecondFinancingLanding.test.ts" \
  "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx" \
  "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.renueva.test.tsx" \
  "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/__tests__/AccessoriesSection.colapsable.test.tsx" \
  "src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/__tests__/StepClient.pasoRegular.test.tsx" \
  "src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/__tests__/ContratoEnWizard.test.tsx" \
  "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/__tests__/MobileStickyCta.test.tsx" \
  "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/__tests__/WizardNavigation.test.tsx"
```

Esperado: PASS todos. Pegar la salida real en el reporte — no afirmar que pasan sin verla.

- [ ] **Step 2: Typecheck y lint de lo tocado**

```bash
npx tsc --noEmit -p tsconfig.json
npx eslint "src/app/prototipos/0.6/[landing]/solicitar" "src/app/prototipos/0.6/utils/theme.ts"
```

Esperado: sin errores nuevos. (El lint global del repo es inalcanzable; se acota a lo tocado.)

- [ ] **Step 3: Verificación manual en el navegador**

```bash
npm run dev
```

Con `renueva-tu-equipo-1`, recorrer y confirmar:

1. `/prototipos/0.6/renueva-tu-equipo-1/solicitar` abre **scrolleada al formulario**.
2. Accesorios está **plegado**; al recargar con la red lenta, el **spinner se ve en la cabecera**.
3. Al abrir accesorios aparecen chips, buscador y grilla; el modal de detalle abre y cierra sin plegar la sección.
4. **No** están las tarjetas `~1 minuto` / `2 pasos` / `100% Seguro` ni `Lo que necesitarás`.
5. En móvil (DevTools, 390×844): la barra de producto queda **encima** del botón `Continuar`, pegado al borde. Sin hueco entre ambos.
6. Al expandir el drawer del producto, el CTA se esconde y el panel crece **desde el borde inferior**, sin dejar hueco.
7. Al enfocar un campo y abrir el teclado, el CTA se esconde.
8. Completar el formulario y pulsar `Continuar` → se crea la solicitud → cae en `/solicitar/resumen` → `/complementos` → **el contrato aparece como siempre**.
9. Entrar directo a `/prototipos/0.6/renueva-tu-equipo-1/solicitar/datos-personales`: la página del paso sigue funcionando por su cuenta.
10. Con `home` (u otra landing normal): tarjetas presentes, accesorios expandido, botón `Comenzar Solicitud`, CTA móvil encima de la barra. **Nada cambió.**

- [ ] **Step 4: Reportar**

Informe con: la salida literal de los tests, qué puntos de la verificación manual se confirmaron y cuáles no se pudieron probar. Si algo quedó sin verificar, decirlo — no darlo por bueno.

---

## Notas de implementación

**Deuda que este plan NO resuelve** (registrada para no confundirla con algo roto por el cambio):

- `summaryFieldValues` (`StepClient.tsx:113`) es **write-only**: se llena desde localStorage y se persiste, pero nunca se lee para render. Probable código muerto. Fuera de alcance.
- `landingId` y `newsletterData` se desestructuran de `useLayout()` (`:116`) y no se usan en `StepContent`; el import de `MobileStickyCtaSpacer` (`:46`) tampoco. Fuera de alcance.
- `GamerSolicitarClient.tsx:1201` tiene **su propia barra de producto** (`fixed bottom-0 z-50`), que duplica la lógica y se apila por encima del CTA. Las landings gamer no son `renueva-*`, así que no se toca.
- `InsuranceSection` no es colapsable: en `/complementos` las dos secciones van a verse asimétricas si alguna vez se pliega también accesorios ahí. Hoy no pasa, porque `colapsable` solo se enciende en la intro.
