# Preload de Molti más visible + bloqueo de "Comenzar Solicitud" — Design Spec

**Ticket:** [BAL-2486](https://linear.app/baldecash/issue/BAL-2486) (sub-ticket de BAL-2421)
**Repo:** `baldecash` (frontend público), worktree `C:\Users\tecnico\Documents\projects\baldecash\worktrees\baldecash-bal-2421`, rama `feature/bal-2421-molti-live-session`.

## Objetivo

Dos mejoras acotadas de UX en la pantalla `/solicitar` para el flujo `molti_live_session`:
1. Hacer más visible/creíble el preload de accesorios mientras Molti responde (quick wins, sin cambios de layout ni elementos visuales nuevos).
2. Evitar que el usuario avance ("Comenzar Solicitud") antes de que las recomendaciones de accesorios terminen de cargar.

**Fuera de alcance explícito** (descartado por el usuario para este ciclo): ícono/ilustración nueva, barra de progreso, rediseño de layout del loading screen.

## Contexto técnico verificado

- `AccessoriesLoadingScreen.tsx` (`src/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/AccessoriesLoadingScreen.tsx`): 4 mensajes hardcodeados, rotan cada 2500ms vía `setInterval`. Tiene `transition-opacity duration-300` en el `<p>` pero sin lógica que la dispare — el texto cambia de golpe.
- `AccessoriesSection.tsx` (mismo directorio): controla `isLoading`/`showLoadingScreen` (estado local, `useState` líneas 113/116). El timer de 500ms que decide mostrar `AccessoriesLoadingScreen` vs. un spinner simple (líneas 172-220) solo se arma si `isRefresh` es `true` (primera carga, controlado por `hasFetchedOnceRef`) — en re-fetches (cambio de plazo/variant) nunca se muestra el loading screen con mensajes.
- `AccessoriesSection` ya consume `useProduct()` (línea 80) y tiene acceso directo a `selectedProduct.name: string` (campo requerido en `SelectedProduct`, `ProductContext.tsx:50`) — no hace falta pasar props nuevas desde el padre para acceder al nombre del producto.
- `ProductContext.tsx` (`src/app/prototipos/0.6/[landing]/solicitar/context/ProductContext.tsx`) ya expone `isValidatingAvailability: boolean` (línea 156) con un propósito análogo (bloquear/informar mientras algo async corre) — mismo patrón a replicar para el nuevo `isLoadingAccessories`.
- `solicitarClient.tsx` — botón "Comenzar Solicitud" en líneas 806-819, `disabled={isOverQuotaLimit || hasUnavailableProducts}`. Ya destructura `useProduct()` en la línea 130, incluyendo `isValidatingAvailability` — agregar una variable ahí sigue el mismo patrón existente.

## Diseño

### 1a — Arreglar el fade roto

`AccessoriesLoadingScreen.tsx` agrega un segundo `useState<'0' | '1'>('1')` para la opacidad. El `setInterval` existente, en cada tick: baja la opacidad a `'0'`, espera 300ms (duración ya declarada en la clase CSS `duration-300`) vía un `setTimeout` anidado, cambia `messageIndex`, sube la opacidad a `'1'`. La clase `transition-opacity duration-300` ya presente en el `<p>` pasa a reaccionar a un cambio real de `opacity` vía `style` o una clase condicional (`opacity-0`/`opacity-100`).

Cambio acotado a este único archivo — sin nuevas dependencias ni props.

### 1b — Mismo trato para re-fetches

`AccessoriesSection.tsx`: se quita la condición `if (isRefresh)` que hoy envuelve la creación de `loadingScreenTimer` (líneas 176-179). El timer de 500ms + `AccessoriesLoadingScreen` se arma en **todos** los fetches (primera carga y re-fetches por cambio de plazo/variant/etc.), no solo el primero. `isRefresh` se sigue usando exactamente igual para todo lo demás en la función (se pasa tal cual a `getLandingAccessories`) — el único cambio es desacoplarlo del gate del loading screen.

### 1c — Mensaje con el nombre real del producto

`AccessoriesLoadingScreen` recibe una nueva prop opcional `productName?: string`. Si viene con valor, el primer mensaje del array (`LOADING_MESSAGES[0]`) se reemplaza dinámicamente por `` `Revisando tu ${productName}...` `` en vez del string fijo "Estás preparando algo genial para ti...". Los otros 3 mensajes genéricos no cambian. Si `productName` es `undefined` (no debería pasar en la práctica dado que `AccessoriesSection` siempre tiene `selectedProduct` en este punto del flujo, pero se cubre por seguridad), se usa el string genérico original como fallback.

`AccessoriesSection.tsx` pasa `productName={selectedProduct?.name}` al renderizar `<AccessoriesLoadingScreen />` (línea ~338).

### 2 — Bloquear "Comenzar Solicitud" mientras cargan accesorios

**`ProductContext.tsx`:**
- Nuevo campo en `ProductContextValue`: `isLoadingAccessories: boolean` (sin setter expuesto en la interfaz pública — se expone también `setIsLoadingAccessories` internamente para que el provider lo pase al value, siguiendo el mismo patrón que otros booleanos de este contexto que sí tienen setter, ej. `isProductBarExpanded`/`setIsProductBarExpanded`).
- Nuevo `useState<boolean>(false)` en el provider, expuesto en el value del contexto.

**`AccessoriesSection.tsx`:**
- Además de sus `setIsLoading(true/false)` locales ya existentes dentro de `fetchAccessories` (línea 174 y línea 218), llama también a `setIsLoadingAccessories(true/false)` del contexto (`useProduct()`) en los mismos puntos — mismo ciclo de vida, sin estado nuevo local, solo espeja el valor hacia el contexto compartido.

**`solicitarClient.tsx`:**
- Se agrega `isLoadingAccessories` a la destructuración de `useProduct()` en la línea 130.
- El `disabled` del botón (línea 809) pasa a ser: `disabled={isOverQuotaLimit || hasUnavailableProducts || isLoadingAccessories}`.
- Sin cambios de texto ni de `className` condicional — el botón usa exactamente el mismo bloque de estilos `disabled` que ya existe hoy (`bg-neutral-300 text-neutral-500 cursor-not-allowed`), aplicado ahora también cuando `isLoadingAccessories` es `true`. Confirmado con el usuario: mismo texto "Comenzar Solicitud", con el atributo `disabled` real del elemento `<button>` (no clickeable).

## Testing

Este repo (`baldecash`) usa Vitest para tests unitarios de componentes React (confirmado por convención de otros trabajos previos en esta rama, ver `admin2`/`baldecash` `.test.tsx`). El plan de implementación debe incluir:
- Test de `AccessoriesLoadingScreen`: verifica que el mensaje rota, que usa `productName` cuando se pasa, y que usa el fallback genérico cuando no.
- Test de `AccessoriesSection` (o del flujo relevante): verifica que `setIsLoadingAccessories` del contexto se llama en `true`/`false` en los momentos correctos del fetch.
- Test de `solicitarClient`/botón: verifica que el botón queda `disabled` cuando `isLoadingAccessories` es `true`, y habilitado cuando es `false` y las demás condiciones también son `false`.

Validación manual final en local (levantar el frontend + backend, navegar el flujo real) antes de dar el trabajo por terminado — confirmado explícitamente con el usuario.

## Riesgos evaluados y descartados

- **¿El cambio a `ProductContext` rompe otros consumidores del contexto?** No — es un campo nuevo agregado a la interfaz, no se modifica ni se remueve ningún campo existente. Todo el resto del contexto permanece igual.
- **¿Quitar el `if (isRefresh)` en 1b causa un timer huérfano o memory leak?** No — el `loadingScreenTimer` ya se limpia correctamente en el bloque `finally` existente (`if (loadingScreenTimer) clearTimeout(loadingScreenTimer)`), independientemente de por qué se creó. Quitar la condición externa no cambia el ciclo de vida de limpieza ya existente.
- **¿El fade (1a) puede introducir un parpadeo raro si el usuario tiene `prefers-reduced-motion`?** Fuera de alcance de este ciclo — no se agrega manejo de esa media query (el proyecto no la maneja hoy en ningún componente similar revisado); podría considerarse en un ciclo futuro si se decide invertir en más accesibilidad de movimiento.

## Self-Review

- **Placeholder scan:** sin TBD/TODO, todas las secciones tienen el mecanismo exacto descrito.
- **Consistencia interna:** los 3 archivos tocados (`AccessoriesLoadingScreen.tsx`, `AccessoriesSection.tsx`, `ProductContext.tsx`, `solicitarClient.tsx` — 4 en total) se referencian de forma consistente entre secciones; el nombre `isLoadingAccessories` se usa igual en todos los puntos donde aparece.
- **Scope check:** acotado, un solo ciclo de implementación razonable (4 archivos, cambios locales, sin nuevas dependencias).
- **Ambigüedad:** ninguna decisión queda abierta — el texto/comportamiento del botón fue confirmado explícitamente con el usuario (mismo texto, disabled real, sin spinner ni copy nuevo).
