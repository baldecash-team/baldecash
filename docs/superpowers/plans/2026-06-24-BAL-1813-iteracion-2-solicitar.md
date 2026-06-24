# BAL-1813 Iteración 2 — Unificación Solicitar (Zona Gamer)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar el clon `GamerSolicitarClient.tsx` aplicando el mismo patrón del catálogo — `SolicitarClient` detecta `isGamerLanding()` y delega a `GamerSolicitarContent`, compartiendo el punto de entrada sin mezclar la lógica interna compleja.

**Architecture:** Mismo patrón que Iteración 1 (catálogo). `SolicitarClient` usa `useParams()` para detectar `isGamerLanding(landing)` y renderiza `GamerSolicitarContent` (extraído del clon) o el contenido Home. `page.tsx` deja de importar `GamerSolicitarClient` y solo renderiza `<SolicitarClient />`. Las 3 zonas complejas (mobile bar, cupón, accesorios) permanecen sin modificar dentro de `GamerSolicitarContent`.

**Tech Stack:** Next.js 14+ App Router, TypeScript, React hooks (`useParams`), `isGamerLanding()` de `utils/theme.ts`.

## Global Constraints

- `isGamerLanding(slug)` ya existe en `src/app/prototipos/0.6/utils/theme.ts` — usar siempre esta función, nunca `slug === 'zona-gamer'` directo
- localStorage key `baldecash-zona-gamer-theme` — no cambiar verbatim
- `LANDING_IDS.ZONA_GAMER = 136` en `utils/landingIds.ts` — no tocar
- `GamerStepSuccess` y `GamerWizardWrapper` en `StepClient.tsx` — se mantienen, solo migrar el check a `isGamerLanding()`
- NO mezclar lógica interna de `GamerSolicitarContent` con `SolicitarClient` — solo el punto de entrada
- NO tocar `GamerProductDetailClient.tsx` — decisión arquitectónica tomada, fuera de scope
- Rama de trabajo: `feature/BAL-1813`
- TypeScript debe pasar `npx tsc --noEmit` sin errores al final

---

### Task 1: Exportar `GamerSolicitarContent` desde `GamerSolicitarClient.tsx`

El mismo cambio que hicimos en Iteración 1 con `GamerCatalogoContent`: la función interna `SolicitarContent` (o equivalente) dentro de `GamerSolicitarClient.tsx` debe ser exportable para que `SolicitarClient` la pueda importar.

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/GamerSolicitarClient.tsx`

**Interfaces:**
- Produces: `export function GamerSolicitarContent()` — componente React sin props (usa `useParams()` internamente igual que ahora)

- [ ] **Step 1: Leer el archivo para identificar la función interna**

```bash
# Buscar el nombre exacto de la función/componente interno que renderiza el contenido
grep -n "^function \|^export function \|^const.*=.*(" src/app/prototipos/0.6/\[landing\]/solicitar/GamerSolicitarClient.tsx | head -20
```

- [ ] **Step 2: Verificar que la función existe y su nombre exacto**

La función interna puede llamarse `SolicitarContent`, `GamerSolicitarContent`, o similar. Identificar cuál es el componente de contenido (no el wrapper con `<Suspense>`).

- [ ] **Step 3: Agregar `export` a la función interna de contenido**

En `GamerSolicitarClient.tsx`, cambiar (el nombre exacto puede variar — usar el encontrado en Step 1):

```tsx
// ANTES
function SolicitarContent() {
// DESPUÉS
export function GamerSolicitarContent() {
```

Si ya se llama `GamerSolicitarContent`, solo agregar `export`. Si se llama diferente, renombrar Y exportar.

- [ ] **Step 4: Verificar que TypeScript compila**

```bash
npx tsc --noEmit
```

Expected: exit 0, sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/app/prototipos/0.6/\[landing\]/solicitar/GamerSolicitarClient.tsx
git commit -m "feat(BAL-1813): exportar GamerSolicitarContent desde GamerSolicitarClient"
```

---

### Task 2: Unificar `SolicitarClient` para detectar y delegar a Gamer

Modificar `solicitarClient.tsx` para que cuando `landing === 'zona-gamer'` delegue a `GamerSolicitarContent`, igual que `CatalogoClient` delega a `GamerCatalogoContent`.

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/solicitarClient.tsx`

**Interfaces:**
- Consumes: `GamerSolicitarContent` exportada en Task 1
- Consumes: `isGamerLanding` de `src/app/prototipos/0.6/utils/theme.ts`
- Produces: `SolicitarClient` unificado que maneja Home y Gamer

- [ ] **Step 1: Leer el archivo actual para entender su estructura**

Leer `src/app/prototipos/0.6/[landing]/solicitar/solicitarClient.tsx` completo para identificar:
- Cómo está estructurado el export principal
- Si ya tiene `useParams()` o lo necesita agregar
- El patrón de `<ProductProvider>` y `<Suspense>` si existe

- [ ] **Step 2: Agregar imports en `solicitarClient.tsx`**

```tsx
import { isGamerLanding } from '@/app/prototipos/0.6/utils/theme';
import { GamerSolicitarContent } from './GamerSolicitarClient';
```

- [ ] **Step 3: Modificar el export principal para bifurcar**

Dentro del export default de `SolicitarClient`, agregar la detección. El patrón exacto depende de la estructura encontrada en Step 1, pero sigue este modelo:

```tsx
export default function SolicitarClient() {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  if (isGamerLanding(landing)) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <GamerSolicitarContent />
      </Suspense>
    );
  }

  // ... resto del código Home existente sin cambios
}
```

Si `SolicitarClient` ya usa `useParams()` internamente, no agregar un segundo call — reutilizar el existente.

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/prototipos/0.6/\[landing\]/solicitar/solicitarClient.tsx
git commit -m "feat(BAL-1813): SolicitarClient delega a GamerSolicitarContent cuando isGamerLanding"
```

---

### Task 3: Limpiar `page.tsx` del solicitar

`page.tsx` ya no necesita importar `GamerSolicitarClient` ni tener el `if (landing === 'zona-gamer')` — `SolicitarClient` lo maneja internamente.

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/page.tsx`

**Interfaces:**
- Consumes: `SolicitarClient` unificado de Task 2

- [ ] **Step 1: Eliminar import de `GamerSolicitarClient`**

```tsx
// ELIMINAR esta línea:
import { GamerSolicitarClient } from './GamerSolicitarClient';
```

- [ ] **Step 2: Eliminar el guard `if (landing === 'zona-gamer')`**

```tsx
// ANTES
if (landing === 'zona-gamer') {
  return <GamerSolicitarClient />;
}
return <SolicitarClient />;

// DESPUÉS
return <SolicitarClient />;
```

- [ ] **Step 3: Verificar que el archivo quedó limpio**

El archivo final debe verse así:

```tsx
import SolicitarClient from './solicitarClient';

export default async function SolicitarPage({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  const resolvedParams = await params;
  const landing = resolvedParams.landing || 'home';

  return <SolicitarClient />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/prototipos/0.6/\[landing\]/solicitar/page.tsx
git commit -m "feat(BAL-1813): page.tsx solicitar limpio — SolicitarClient maneja ambas landings"
```

---

### Task 4: Migrar checks `isGamer` en StepClient, complementosClient, confirmacionClient

`StepClient.tsx`, `complementosClient.tsx` y `confirmacionClient.tsx` ya tienen bifurcaciones gamer pero usan `slug === 'zona-gamer'` o `landingId === LANDING_IDS.ZONA_GAMER` directamente. Migrar a `isGamerLanding()`.

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/StepClient.tsx`
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/complementos/complementosClient.tsx`
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/confirmacion/confirmacionClient.tsx`

**Interfaces:**
- Consumes: `isGamerLanding` de `src/app/prototipos/0.6/utils/theme.ts`

- [ ] **Step 1: Buscar todos los checks gamer actuales en los 3 archivos**

```bash
grep -n "zona-gamer\|isGamer\|ZONA_GAMER" \
  "src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/StepClient.tsx" \
  "src/app/prototipos/0.6/[landing]/solicitar/complementos/complementosClient.tsx" \
  "src/app/prototipos/0.6/[landing]/solicitar/confirmacion/confirmacionClient.tsx"
```

- [ ] **Step 2: Agregar import de `isGamerLanding` en cada archivo que lo necesite**

En cada archivo donde se use el check gamer, agregar:

```tsx
import { isGamerLanding } from '@/app/prototipos/0.6/utils/theme';
```

- [ ] **Step 3: Reemplazar checks directos por `isGamerLanding()`**

Patrón de reemplazo:

```tsx
// ANTES (variantes posibles)
const isGamer = (params?.landing as string) === 'zona-gamer';
const isGamer = landing === 'zona-gamer';
const isGamer = landingId === LANDING_IDS.ZONA_GAMER;

// DESPUÉS
const isGamer = isGamerLanding(landing);
```

**IMPORTANTE:** `GamerWizardWrapper` y `GamerStepSuccess` NO se tocan — solo el check que los activa. Si el check usa `landingId === LANDING_IDS.ZONA_GAMER` (número), verificar que `landing` es el slug string antes de reemplazar. Si usa ID numérico, mantener como está y solo agregar un comentario.

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add \
  "src/app/prototipos/0.6/[landing]/solicitar/[stepSlug]/StepClient.tsx" \
  "src/app/prototipos/0.6/[landing]/solicitar/complementos/complementosClient.tsx" \
  "src/app/prototipos/0.6/[landing]/solicitar/confirmacion/confirmacionClient.tsx"
git commit -m "feat(BAL-1813): migrar checks isGamer a isGamerLanding() en flujo solicitar"
```

---

### Task 5: Push y verificación final

- [ ] **Step 1: Verificar estado del branch**

```bash
git status
git log --oneline -6
```

- [ ] **Step 2: TypeScript final completo**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Push a origin**

```bash
git push origin feature/BAL-1813
```

- [ ] **Step 4: Smoke test manual**

Iniciar dev server y verificar:
- `http://localhost:3000/prototipos/0.6/zona-gamer/solicitar` — debe mostrar UI gamer (GamerNavbar, fondo oscuro, colores neon)
- `http://localhost:3000/prototipos/0.6/home/solicitar` — debe mostrar UI Home sin cambios
- Flujo de pasos (`/solicitar/datos-personales`, etc.) en zona-gamer debe mostrar `GamerWizardWrapper` con colores gamer

---

## Fuera de scope en este plan

- `GamerProductDetailClient.tsx` — decisión tomada: NO unificar (arquitectura distinta, 3,098 líneas, 34 bifurcaciones JSX)
- Renombrar `GamerCatalogoClient.tsx` → `GamerCatalogoContent.tsx` — limpieza cosmética, ticket separado
- Lógica interna de `GamerSolicitarContent` (mobile bar, cupón, accesorios) — permanece sin modificar
