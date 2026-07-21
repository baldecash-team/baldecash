# Preload de Molti más visible + bloqueo de "Comenzar Solicitud" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer visible/creíble el preload de accesorios de Molti (fade real, mismo trato en re-fetches, mensaje con nombre del producto) y bloquear el botón "Comenzar Solicitud" hasta que las recomendaciones de accesorios terminen de cargar.

**Architecture:** Cambios acotados en 4 archivos existentes del repo `baldecash` (frontend público, Next.js 16 + React 19): `AccessoriesLoadingScreen.tsx` (fade + mensaje dinámico), `AccessoriesSection.tsx` (quitar gate de `isRefresh` + espejar loading al contexto), `ProductContext.tsx` (nuevo campo `isLoadingAccessories`), `solicitarClient.tsx` (sumar la condición al `disabled` del botón). Sin nuevas dependencias, sin cambios de layout/CSS más allá de lo estrictamente necesario para el fade.

**Tech Stack:** Next.js 16, React 19, TypeScript, Jest + Testing Library (`jest.config.js` en la raíz del repo, `testEnvironment: jsdom`).

## Global Constraints

- Repo: `baldecash`, worktree `C:\Users\tecnico\Documents\projects\baldecash\worktrees\baldecash-bal-2421`, rama `feature/bal-2421-molti-live-session` — NO crear rama nueva.
- Spec de referencia (ya aprobada por el usuario): `docs/superpowers/specs/2026-07-21-preload-molti-y-boton-comenzar-solicitud-design.md`.
- Ticket: [BAL-2486](https://linear.app/baldecash/issue/BAL-2486).
- Fuera de alcance (NO implementar): ícono/ilustración nueva, barra de progreso, rediseño de layout, manejo de `prefers-reduced-motion`.
- Texto del botón "Comenzar Solicitud" NO cambia — mismo texto, solo se agrega una condición más al `disabled` existente, reusando el mismo bloque de estilos `disabled` ya presente (`bg-neutral-300 text-neutral-500 cursor-not-allowed`). Confirmado explícitamente con el usuario.
- Framework de test: **Jest** (no Vitest) — `test()`/`describe()` globales, `@testing-library/react`, `jest.fn()`. Confirmado leyendo `package.json` (`"test": "jest"`) y `jest.config.js` real del repo.
- Alias de imports: `@/` mapea a `<rootDir>/src/` (`jest.config.js` `moduleNameMapper`).
- Al final: solo `git commit` + `git push` a la rama existente. NO abrir PR nueva automáticamente — preguntar al usuario si quiere uno nuevo.
- El usuario pidió explícitamente validar en local (levantar el frontend, navegar el flujo real) antes de dar el trabajo por terminado — el plan reserva esto como paso final, fuera de las tasks automatizadas (requiere que el usuario lo revise interactivamente).

---

### Task 1: Fade real + mensaje dinámico en `AccessoriesLoadingScreen`

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/AccessoriesLoadingScreen.tsx`
- Test: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/__tests__/AccessoriesLoadingScreen.test.tsx` (crear carpeta `__tests__` si no existe)

**Interfaces:**
- Produces: `AccessoriesLoadingScreen` gana una nueva prop opcional `productName?: string`. Firma final: `export function AccessoriesLoadingScreen({ productName }: { productName?: string })`. Task 2 depende de esta firma para pasarle `productName={selectedProduct?.name}`.

- [ ] **Step 1: Leer el archivo actual completo para confirmar que no cambió desde el diseño**

```bash
cat "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/AccessoriesLoadingScreen.tsx"
```
Debe coincidir con el contenido documentado en el spec (32 líneas, `LOADING_MESSAGES` con 4 strings, `MESSAGE_INTERVAL_MS = 2500`). Si difiere, detente y avisa al controller antes de continuar — el resto de los steps asume este contenido exacto como punto de partida.

- [ ] **Step 2: Escribir los tests que fallan**

Crear `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/__tests__/AccessoriesLoadingScreen.test.tsx`:

```tsx
import { render, screen, act } from '@testing-library/react';
import { AccessoriesLoadingScreen } from '../AccessoriesLoadingScreen';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('muestra el mensaje generico por defecto cuando no se pasa productName', () => {
  render(<AccessoriesLoadingScreen />);
  expect(screen.getByText('Estás preparando algo genial para ti...')).toBeInTheDocument();
});

test('usa el nombre del producto en el primer mensaje cuando se pasa productName', () => {
  render(<AccessoriesLoadingScreen productName="MacBook Air M2" />);
  expect(screen.getByText('Revisando tu MacBook Air M2...')).toBeInTheDocument();
});

test('rota al siguiente mensaje despues de MESSAGE_INTERVAL_MS', () => {
  render(<AccessoriesLoadingScreen />);
  expect(screen.getByText('Estás preparando algo genial para ti...')).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(2500);
  });

  expect(screen.getByText('Analizando tu perfil...')).toBeInTheDocument();
});

test('aplica opacity-0 justo antes de cambiar el mensaje y opacity-100 despues', () => {
  render(<AccessoriesLoadingScreen />);
  const paragraph = screen.getByText('Estás preparando algo genial para ti...');
  expect(paragraph).toHaveClass('opacity-100');

  act(() => {
    jest.advanceTimersByTime(2500);
  });
  // En el instante justo del cambio de indice, el parrafo (ya con el nuevo texto)
  // debe volver a quedar en opacity-100 tras el ciclo de fade-out/fade-in.
  expect(screen.getByText('Analizando tu perfil...')).toHaveClass('opacity-100');
});
```

- [ ] **Step 3: Correr los tests — deben fallar**

```bash
npx jest AccessoriesLoadingScreen.test.tsx
```
Expected: FAIL — el test de `productName` falla porque la prop no existe todavía (sigue mostrando el mensaje genérico fijo); el test de clases `opacity-0`/`opacity-100` falla porque esas clases no existen en el componente actual (usa `transition-opacity duration-300` sin controlar `opacity` en sí).

- [ ] **Step 4: Implementar el fix**

Reemplazar el contenido completo de `AccessoriesLoadingScreen.tsx`:

```tsx
"use client";

import React, { useEffect, useState } from "react";

const GENERIC_FIRST_MESSAGE = "Estás preparando algo genial para ti...";

const OTHER_MESSAGES = [
  "Analizando tu perfil...",
  "Buscando los mejores accesorios...",
  "Ya casi...",
];

const MESSAGE_INTERVAL_MS = 2500;
const FADE_DURATION_MS = 300;

interface AccessoriesLoadingScreenProps {
  productName?: string;
}

export function AccessoriesLoadingScreen({ productName }: AccessoriesLoadingScreenProps) {
  const firstMessage = productName ? `Revisando tu ${productName}...` : GENERIC_FIRST_MESSAGE;
  const messages = [firstMessage, ...OTHER_MESSAGES];

  const [messageIndex, setMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, FADE_DURATION_MS);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-10 h-10 border-4 border-[rgba(var(--color-primary-rgb),0.2)] border-t-[var(--color-primary)] rounded-full animate-spin" />
      <p
        className={`text-sm text-gray-600 text-center transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {messages[messageIndex]}
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Correr los tests — deben pasar**

```bash
npx jest AccessoriesLoadingScreen.test.tsx
```
Expected: 4/4 PASS.

- [ ] **Step 6: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/AccessoriesLoadingScreen.tsx" "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/__tests__/AccessoriesLoadingScreen.test.tsx"
git commit -m "feat(solicitar): fade real + mensaje con nombre de producto en preload de Molti (BAL-2486)"
```

---

### Task 2: Mismo trato del loading screen en todos los fetches + pasar `productName`

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/AccessoriesSection.tsx`

**Interfaces:**
- Consumes: `AccessoriesLoadingScreen({ productName?: string })` de Task 1.
- Produces: ningún símbolo nuevo exportado — cambio de comportamiento interno del componente ya existente. Task 3 no depende de esta task (son cambios independientes al mismo archivo, pero en bloques distintos: Task 2 toca el efecto `fetchAccessories` y el render; Task 3 toca únicamente las llamadas a `setIsLoading`/`setShowLoadingScreen` agregando el espejo al contexto).

- [ ] **Step 1: Ubicar las líneas exactas a modificar**

```bash
grep -n "isRefresh\|loadingScreenTimer\|AccessoriesLoadingScreen" "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/AccessoriesSection.tsx"
```
Confirmar que las líneas siguen siendo las documentadas en el spec (bloque `if (isRefresh) { loadingScreenTimer = setTimeout(...) }` alrededor de la línea 176-179, y el uso de `<AccessoriesLoadingScreen />` alrededor de la línea 338). Si las líneas exactas difieren, ajustar los siguientes steps a la ubicación real — el contenido lógico a cambiar es el mismo.

- [ ] **Step 2: Modificar el gate del timer (quitar el `if (isRefresh)`)**

Buscar este bloque (dentro de la función `fetchAccessories`, efecto de la línea ~168):

```tsx
      const isRefresh = !hasFetchedOnceRef.current;
      setIsLoading(true);
      let loadingScreenTimer: ReturnType<typeof setTimeout> | null = null;
      if (isRefresh) {
        loadingScreenTimer = setTimeout(() => {
          if (!cancelled) setShowLoadingScreen(true);
        }, 500);
      }
```

Reemplazar por (se quita el `if (isRefresh)` que envolvía la creación del timer; `isRefresh` se sigue calculando y usando exactamente igual en el resto de la función, ej. al llamar a `getLandingAccessories`):

```tsx
      const isRefresh = !hasFetchedOnceRef.current;
      setIsLoading(true);
      const loadingScreenTimer: ReturnType<typeof setTimeout> = setTimeout(() => {
        if (!cancelled) setShowLoadingScreen(true);
      }, 500);
```

Nota: el tipo cambia de `ReturnType<typeof setTimeout> | null` a `ReturnType<typeof setTimeout>` (ya no puede ser `null`, siempre se crea) — ajustar también su uso más abajo en el `finally` existente:

```tsx
      } finally {
        clearTimeout(loadingScreenTimer);
        setShowLoadingScreen(false);
        if (!cancelled) setIsLoading(false);
      }
```

(antes tenía `if (loadingScreenTimer) clearTimeout(loadingScreenTimer);` — ahora `loadingScreenTimer` siempre existe, así que el `if` ya no hace falta, se llama `clearTimeout` directo).

- [ ] **Step 3: Pasar `productName` al render de `AccessoriesLoadingScreen`**

Buscar:
```tsx
        showLoadingScreen ? (
          <AccessoriesLoadingScreen />
        ) : (
```

Reemplazar por:
```tsx
        showLoadingScreen ? (
          <AccessoriesLoadingScreen productName={selectedProduct?.name} />
        ) : (
```

(`selectedProduct` ya está disponible en el componente vía `useProduct()`, línea 80 — no requiere ningún import ni destructuración nueva.)

- [ ] **Step 4: Verificar manualmente con `tsc`**

```bash
npx tsc --noEmit
```
Expected: 0 errores relacionados a este archivo (puede haber errores preexistentes en otros archivos del repo no relacionados a este cambio — solo verificar que no se introdujeron NUEVOS errores en `AccessoriesSection.tsx`).

- [ ] **Step 5: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/AccessoriesSection.tsx"
git commit -m "feat(solicitar): mostrar loading screen con mensajes en todos los fetches, no solo el primero (BAL-2486)"
```

---

### Task 3: `isLoadingAccessories` en `ProductContext` + espejo desde `AccessoriesSection`

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/context/ProductContext.tsx`
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/AccessoriesSection.tsx`
- Test: `src/app/prototipos/0.6/[landing]/solicitar/context/__tests__/ProductContext.isLoadingAccessories.test.tsx` (crear carpeta `__tests__` si no existe)

**Interfaces:**
- Produces: `ProductContextValue` gana `isLoadingAccessories: boolean` y `setIsLoadingAccessories: (loading: boolean) => void`. Task 4 depende de `isLoadingAccessories` estando disponible en el value que devuelve `useProduct()`.

- [ ] **Step 1: Ubicar la interfaz y el provider**

```bash
grep -n "isValidatingAvailability\|interface ProductContextValue\|const \[isProductBarExpanded" "src/app/prototipos/0.6/[landing]/solicitar/context/ProductContext.tsx"
```
Usar `isProductBarExpanded`/`setIsProductBarExpanded` (que sí tiene setter público en la interfaz, a diferencia de `isValidatingAvailability` que no lo expone) como plantilla exacta de patrón para el nuevo campo.

- [ ] **Step 2: Escribir el test que falla**

Crear `src/app/prototipos/0.6/[landing]/solicitar/context/__tests__/ProductContext.isLoadingAccessories.test.tsx`:

```tsx
import { render, screen, act } from '@testing-library/react';
import { ProductProvider, useProduct } from '../ProductContext';

jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('../SessionContext', () => ({
  useSessionOptional: () => null,
}));
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ layoutData: null }),
}));
jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'home' }),
}));

function Probe() {
  const { isLoadingAccessories, setIsLoadingAccessories } = useProduct();
  return (
    <div>
      <span data-testid="loading-state">{String(isLoadingAccessories)}</span>
      <button onClick={() => setIsLoadingAccessories(true)}>set-true</button>
    </div>
  );
}

test('isLoadingAccessories arranca en false y se puede setear a true', () => {
  render(
    <ProductProvider landingSlug="home">
      <Probe />
    </ProductProvider>
  );

  expect(screen.getByTestId('loading-state')).toHaveTextContent('false');

  act(() => {
    screen.getByText('set-true').click();
  });

  expect(screen.getByTestId('loading-state')).toHaveTextContent('true');
});
```

Nota: si al correr este test aparecen errores de módulos adicionales sin mockear (el `ProductProvider` real importa varios servicios de API — `fetchProductPaymentPlans`, `fetchProductsByIds`, `getLandingAccessories`, `getLandingInsurances`, `validateCoupon`, `getMaxMonthlyQuota`, `getPendingCoupon`/`clearPendingCoupon`), agregar los mocks faltantes siguiendo el mismo patrón (`jest.mock(<path del import>, () => ({ <función>: jest.fn() }))`) hasta que el componente monte sin errores — el objetivo del test es aislar `isLoadingAccessories`, no ejercitar el resto del contexto.

- [ ] **Step 3: Correr el test — debe fallar**

```bash
npx jest ProductContext.isLoadingAccessories.test.tsx
```
Expected: FAIL con un error de tipo (`isLoadingAccessories`/`setIsLoadingAccessories` no existen en el objeto devuelto por `useProduct()`) o `undefined` en el texto.

- [ ] **Step 4: Agregar el campo a la interfaz**

En `ProductContext.tsx`, en `interface ProductContextValue` (ver línea ~103), agregar junto al bloque de `isProductBarExpanded`:

```tsx
  // Estado de la barra de producto (mobile)
  isProductBarExpanded: boolean;
  setIsProductBarExpanded: (expanded: boolean) => void;
  // Loading state de AccessoriesSection, expuesto para poder bloquear
  // "Comenzar Solicitud" mientras las recomendaciones de Molti cargan (BAL-2486)
  isLoadingAccessories: boolean;
  setIsLoadingAccessories: (loading: boolean) => void;
```

- [ ] **Step 5: Agregar el estado y exponerlo en el provider**

Buscar dónde se declara `const [isProductBarExpanded, setIsProductBarExpanded] = useState(false);` dentro de `ProductProvider` y agregar justo después:

```tsx
  const [isLoadingAccessories, setIsLoadingAccessories] = useState(false);
```

Buscar el objeto `value` que retorna el provider (contiene `isProductBarExpanded,` y `setIsProductBarExpanded,` como propiedades shorthand) y agregar ahí también:

```tsx
        isProductBarExpanded,
        setIsProductBarExpanded,
        isLoadingAccessories,
        setIsLoadingAccessories,
```

- [ ] **Step 6: Correr el test — debe pasar**

```bash
npx jest ProductContext.isLoadingAccessories.test.tsx
```
Expected: PASS.

- [ ] **Step 7: Espejar el loading local de `AccessoriesSection` hacia el contexto**

En `AccessoriesSection.tsx`, agregar `setIsLoadingAccessories` a la destructuración existente de `useProduct()` (línea ~80):

```tsx
  const { selectedAccessories, toggleAccessory, setSelectedAccessories, selectedProduct, cartProducts, getAllProducts, setIsLoadingAccessories } = useProduct();
```

Dentro de `fetchAccessories` (mismo efecto tocado en Task 2), justo después de `setIsLoading(true);`, agregar:

```tsx
      setIsLoading(true);
      setIsLoadingAccessories(true);
```

Y en el bloque `finally` (el mismo tocado en Task 2 Step 2), agregar antes o después de `setIsLoading(false)`:

```tsx
      } finally {
        clearTimeout(loadingScreenTimer);
        setShowLoadingScreen(false);
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingAccessories(false);
        }
      }
```

- [ ] **Step 8: Verificar manualmente con `tsc`**

```bash
npx tsc --noEmit
```
Expected: 0 errores nuevos.

- [ ] **Step 9: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/context/ProductContext.tsx" "src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/AccessoriesSection.tsx" "src/app/prototipos/0.6/[landing]/solicitar/context/__tests__/ProductContext.isLoadingAccessories.test.tsx"
git commit -m "feat(solicitar): exponer isLoadingAccessories en ProductContext desde AccessoriesSection (BAL-2486)"
```

---

### Task 4: Bloquear el botón "Comenzar Solicitud" mientras cargan accesorios

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/solicitarClient.tsx`
- Test: `src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx` (crear carpeta `__tests__` si no existe)

**Interfaces:**
- Consumes: `isLoadingAccessories` de `useProduct()` (Task 3).

- [ ] **Step 1: Ubicar el botón y la destructuración de `useProduct()`**

```bash
grep -n "useProduct()\|disabled={isOverQuotaLimit" "src/app/prototipos/0.6/[landing]/solicitar/solicitarClient.tsx"
```

Confirmado por lectura directa del archivo (no asumir, ya verificado): el botón vive dentro de `function WizardPreviewContent()` (línea 110), una función **no exportada** del módulo. El único export es `export default function WizardPreviewPage()` (línea 863), que internamente decide entre `GamerSolicitarContent` (si `isGamerLanding(landing)`) o `<Suspense fallback={<LoadingFallback />}><WizardPreviewContent /></Suspense>`. El test de Step 2 importa el default export (`WizardPreviewPage`) y usa `findByText` (no `getByText`) para esperar a que el `Suspense` resuelva y el contenido real (`WizardPreviewContent`) se monte — NO se agrega ningún `export` nuevo al archivo fuente solo para facilitar el test.

- [ ] **Step 2: Escribir el test que falla**

El componente `solicitarClient.tsx` completo tiene demasiadas dependencias externas para montarlo íntegro en un test unitario (fetch de config de landing, múltiples contextos anidados, hooks de analytics, etc.). En vez de montar el árbol completo, este test mockea TODOS los hooks/contextos que el componente usa a nivel de módulo, siguiendo el mismo patrón que `useSubmitApplication.test.ts` (que ya mockea `ProductContext` completo) — el objetivo es aislar únicamente el comportamiento del atributo `disabled` del botón bajo distintos valores de `isLoadingAccessories`, no ejercitar el resto del componente. El test importa `WizardPreviewPage` (el único export real, default) y usa `findByText` para esperar a que el `Suspense` resuelva.

Crear `src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

const baseProductContextValue: any = {
  selectedProduct: { id: '1', name: 'Laptop Test', slug: 'laptop-test' },
  setSelectedProduct: jest.fn(),
  cartProducts: [],
  setCartProducts: jest.fn(),
  clearCartProducts: jest.fn(),
  selectedAccessories: [],
  setSelectedAccessories: jest.fn(),
  toggleAccessory: jest.fn(),
  clearAccessories: jest.fn(),
  appliedCoupon: null,
  setAppliedCoupon: jest.fn(),
  clearCoupon: jest.fn(),
  selectedInsurance: null,
  selectedInsurances: [],
  setSelectedInsurance: jest.fn(),
  toggleInsurance: jest.fn(),
  clearInsurance: jest.fn(),
  availableMultiasistencia: null,
  setAvailableMultiasistencia: jest.fn(),
  getTotalPrice: () => 1000,
  getTotalMonthlyPayment: () => 100,
  getDiscountAmount: () => 0,
  getDiscountedMonthlyPayment: () => 100,
  isHydrated: true,
  isProductBarExpanded: false,
  setIsProductBarExpanded: jest.fn(),
  isOverQuotaLimit: false,
  maxMonthlyQuota: 5000,
  getAllProducts: () => [{ id: '1', name: 'Laptop Test', slug: 'laptop-test' }],
  hasUnifiedTerms: () => true,
  getAvailableTerms: () => [24],
  updateAllProductsToTerm: jest.fn(),
  updateProductInitial: jest.fn(),
  getInitialOptionsForProduct: () => [],
  syncMissingPaymentPlans: jest.fn(),
  isSyncingPaymentPlans: false,
  unavailableProductIds: [],
  removeUnavailableProducts: jest.fn(),
  isValidatingAvailability: false,
  isLoadingAccessories: false,
  setIsLoadingAccessories: jest.fn(),
};

let mockProductContextValue = baseProductContextValue;

jest.mock('../context/ProductContext', () => ({
  useProduct: () => mockProductContextValue,
}));
jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'home' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));
jest.mock('@/app/prototipos/0.6/hooks/useLeadGuard', () => ({
  useLeadGuard: () => ({ hasLeadAccess: true }),
}));
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ layoutData: {}, isLayoutLoading: false }),
}));
jest.mock('../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({ config: {}, badgeText: null, isConfigLoading: false }),
}));
jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({ isFlowConfigLoading: false, firstStepSlug: 'datos-personales', shouldShowComplementos: false }),
}));
jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: jest.fn().mockResolvedValue({ layout: { has_catalog: true } }),
}));
jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ track: jest.fn(), trackAccessoryAdd: jest.fn(), trackAccessoryRemove: jest.fn() }),
}));
jest.mock('../components/solicitar/sections', () => ({
  SectionRenderer: () => null,
}));
jest.mock('../components/solicitar/coupon', () => ({
  CouponInput: () => null,
}));
jest.mock('../components/solicitar/product', () => ({
  SelectedProductBar: () => null,
  SelectedProductSpacer: () => null,
}));

// El único export real del módulo es `WizardPreviewPage` (default,
// solicitarClient.tsx:863) — el componente que renderiza el botón
// (`WizardPreviewContent`, línea 110) NO está exportado, se monta vía
// <Suspense> dentro de WizardPreviewPage. Por eso se importa el default y se
// usa `findByText` (no `getByText`) para esperar a que el Suspense resuelva.
import SolicitarClientPage from '../solicitarClient';

describe('boton Comenzar Solicitud — gating por isLoadingAccessories', () => {
  afterEach(() => {
    mockProductContextValue = baseProductContextValue;
  });

  test('esta habilitado cuando isLoadingAccessories es false y no hay otras restricciones', async () => {
    render(<SolicitarClientPage />);
    const button = await screen.findByText('Comenzar Solicitud');
    expect(button.closest('button')).not.toBeDisabled();
  });

  test('esta deshabilitado cuando isLoadingAccessories es true', async () => {
    mockProductContextValue = { ...baseProductContextValue, isLoadingAccessories: true };
    render(<SolicitarClientPage />);
    const button = await screen.findByText('Comenzar Solicitud');
    expect(button.closest('button')).toBeDisabled();
  });
});
```

- [ ] **Step 3: Correr el test — confirmar el punto de partida**

```bash
npx jest solicitarClient.startButton.test.tsx
```
Expected: el primer test (`isLoadingAccessories=false` → habilitado) puede pasar tal cual ya está hoy (el botón hoy no depende de esa variable, así que no está disabled por ella). El segundo test (`isLoadingAccessories=true` → debe estar disabled) debe FALLAR — es el comportamiento nuevo que este task implementa. Si el test no compila por mocks faltantes (dependencias adicionales no listadas arriba), completar los mocks necesarios hasta que compile y el segundo test falle específicamente por la aserción de `disabled`, no por un error de render.

- [ ] **Step 4: Implementar el fix**

En `solicitarClient.tsx`, agregar `isLoadingAccessories` a la destructuración existente de `useProduct()` (línea ~130):

```tsx
  const { selectedProduct, setSelectedProduct, cartProducts, setCartProducts, selectedAccessories, selectedInsurances, clearAccessories, isHydrated, isOverQuotaLimit, maxMonthlyQuota, getTotalMonthlyPayment, appliedCoupon, hasUnifiedTerms, getAvailableTerms, updateAllProductsToTerm, updateProductInitial, getInitialOptionsForProduct, unavailableProductIds, removeUnavailableProducts, isValidatingAvailability, setIsProductBarExpanded, isLoadingAccessories } = useProduct();
```

Modificar el botón (línea ~806-819):

```tsx
        {/* CTA Button */}
        <button
          onClick={handleStart}
          disabled={isOverQuotaLimit || hasUnavailableProducts || isLoadingAccessories}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                     font-semibold text-lg transition-colors shadow-lg
                     ${isOverQuotaLimit || hasUnavailableProducts || isLoadingAccessories
                       ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                       : 'bg-[var(--color-primary)] text-white hover:brightness-90 cursor-pointer shadow-[rgba(var(--color-primary-rgb),0.25)]'
                     }`}
        >
          <span>Comenzar Solicitud</span>
          <ArrowRight className="w-5 h-5" />
        </button>
```

- [ ] **Step 5: Correr el test — debe pasar**

```bash
npx jest solicitarClient.startButton.test.tsx
```
Expected: 2/2 PASS.

- [ ] **Step 6: Verificar manualmente con `tsc`**

```bash
npx tsc --noEmit
```
Expected: 0 errores nuevos.

- [ ] **Step 7: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/solicitarClient.tsx" "src/app/prototipos/0.6/[landing]/solicitar/__tests__/solicitarClient.startButton.test.tsx"
git commit -m "feat(solicitar): bloquear boton Comenzar Solicitud mientras cargan accesorios (BAL-2486)"
```

---

### Task 5: Regresión targeted final + push

**Files:** ninguno (solo verificación + git).

- [ ] **Step 1: Regresión targeted de los 4 archivos tocados (NO correr el suite completo de Jest del repo)**

```bash
npx jest AccessoriesLoadingScreen.test.tsx ProductContext.isLoadingAccessories.test.tsx solicitarClient.startButton.test.tsx
```
Expected: todos los tests de las Tasks 1, 3, 4 pasan. (Task 2 no agregó tests propios — su comportamiento queda cubierto indirectamente por el test de Task 1 sobre `AccessoriesLoadingScreen` y por la validación manual final.)

- [ ] **Step 2: `tsc --noEmit` sobre el proyecto completo**

```bash
npx tsc --noEmit
```
Expected: cero errores NUEVOS respecto al baseline del repo (si ya existían errores preexistentes no relacionados a estos 4 archivos, no es responsabilidad de este plan resolverlos — solo confirmar que no se sumaron errores nuevos en los archivos tocados).

- [ ] **Step 3: Commit final (si algún archivo quedó sin commitear) y push**

```bash
git status --short
git push origin feature/bal-2421-molti-live-session
```

- [ ] **Step 4: Nota para el controller — validación manual en local**

El usuario pidió explícitamente revisar el resultado en local antes de dar el trabajo por terminado. Después de este push, el controller debe:
1. Levantar el backend `ws2` local (con el mock de Molti si aplica, o apuntando a `molti_live_session` real de una landing de prueba como `copia-home`).
2. Levantar el frontend `baldecash` local apuntando a ese backend.
3. Navegar el flujo real: catálogo → producto → "¡Lo quiero!" → `/solicitar`, confirmar visualmente:
   - El mensaje del preload cambia con fade real (no de golpe).
   - El primer mensaje menciona el nombre real del producto elegido.
   - Si se cambia de plazo/inicial (forzando un re-fetch), el loading screen con mensajes también aparece (no solo un spinner simple) si la respuesta tarda más de 500ms.
   - El botón "Comenzar Solicitud" está deshabilitado (gris, no clickeable) mientras los accesorios cargan, y se habilita en cuanto terminan.
4. Avisar al usuario cuando esté listo para su revisión — **no cerrar el ticket ni dar el trabajo por terminado sin esa confirmación manual explícita**, según lo pedido.

**No abrir un PR automáticamente** — confirmar con el usuario si quiere uno nuevo para este trabajo (los PRs anteriores de esta rama en `ws2` ya se resolvieron; este es el primer cambio en el repo `baldecash` de esta rama en este ciclo — confirmar también si hace falta abrir PR en `baldecash` específicamente, dado que puede no tener PRs previos abiertos en esta rama).

---

## Self-Review Notes

**Spec coverage:** los 4 puntos del spec (1a fade, 1b re-fetches, 1c nombre de producto, 2 botón disabled) están cubiertos: Task 1 = 1a + 1c, Task 2 = 1b, Task 3 = infraestructura de contexto para el Punto 2, Task 4 = aplicación del Punto 2 en el botón. Task 5 = regresión + validación manual explícitamente pedida por el usuario.

**Placeholder scan:** sin TBD/TODO. Se confirmó por lectura directa (no asunción) que `WizardPreviewPage` (línea 863) es el único export real del archivo y `WizardPreviewContent` (línea 110, dueña del botón) no está exportada — el test usa el default export + `findByText` para esperar el `Suspense`. Se identificaron y agregaron al mock 4 dependencias adicionales de `WizardPreviewContent` que no estaban en el primer borrador (`useAnalytics`, `SectionRenderer`, `CouponInput`, `SelectedProductBar`/`SelectedProductSpacer`) tras revisar los imports reales del archivo.

**Type consistency:** `isLoadingAccessories`/`setIsLoadingAccessories` se nombran igual en las 3 tasks que los tocan (Task 3 los crea, Task 4 los consume). `productName?: string` se nombra igual en Task 1 (donde se define la prop) y Task 2 (donde se pasa).

**Riesgo evaluado, no descartado — aceptado explícitamente:** el test de Task 4 es frágil por depender de mockear ~11 dependencias distintas de un archivo grande (`WizardPreviewContent`, ~750 líneas). Es el mayor riesgo de este plan. Se documentó explícitamente en el Step 2 de Task 4 que el implementador puede necesitar agregar mocks adicionales no listados aquí (el archivo puede importar algo más que no se detectó en esta revisión), y que el criterio de éxito es que el segundo test falle específicamente por la aserción de `disabled`, no por un error de compilación/render. Fallback explícito si Task 4 se atasca reintentando mocks: limitar el test a verificar solo la expresión booleana del `disabled` extraída a una función pura reutilizable (ej. exportar un helper `getStartButtonDisabled({isOverQuotaLimit, hasUnavailableProducts, isLoadingAccessories})` desde el mismo archivo o uno de utils, y testear esa función sola) — no es el enfoque por defecto porque introduce una abstracción nueva no pedida por el spec, pero es la salida de emergencia documentada si el mockeo del árbol completo resulta inviable en la práctica.

**Decisión de diseño explícita:** Task 2 no tiene test propio porque el comportamiento que cambia (mostrar el loading screen también en re-fetches) es difícil de aislar sin re-implementar buena parte del mock de Task 4 — se decidió cubrirlo con la validación manual final (Task 5 Step 4) en vez de forzar un test de integración frágil, consistente con que el usuario ya pidió explícitamente una revisión manual en local antes de cerrar el trabajo.
