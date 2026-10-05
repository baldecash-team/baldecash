# Eliminar el "¡Listo!" intermedio del flujo de confirmación de oferta — Diseño (spec)

**Fecha:** 2026-07-10 · **Autor:** Emilio + Claude · **Ticket:** BAL-2212 (feedback reunión Marco) · **Alcance:** flujo de complementos del Caso 4/5.

## Objetivo

Reducir fricción en el cierre del flujo de oferta: hoy, tras confirmar la elección en el modal "¿Confirmas tu elección?", aparece una cara intermedia "¡Listo!" dentro del mismo modal con un botón "Continuar" que recién ahí redirige a la página de confirmación (`SeleccionConfirmada`, "¡Felicidades!"). Se elimina ese paso "¡Listo!": tras confirmar, el flujo **redirige directo** a la página de confirmación.

## Contexto verificado (file:line)

- **`AccesoriosOfertaClient.tsx`** (página de complementos):
  - Barra sticky (`CuotaStickyBar`, ~línea 691): botón "Continuar" → `setModalOpen(true)` (abre el modal). **No cambia.**
  - `confirmar()` (línea 334): persiste vía `selectEquipment`, limpia el borrador local, y hace `setSucceeded(true)` (línea 353) → activa la cara "¡Listo!" del modal.
  - `ConfirmarEleccionModal` (línea 754): recibe `succeeded={succeeded}` y `onSuccessContinue` (línea 765) que hace `window.location.href = /oferta/{token}`.
  - Estado `succeeded` (línea 126) tiene **otros usos que se deben preservar**: guard del auto-save de add-ons (línea 238: `if (loading || succeeded ...) return`) y el analytics `offer_success_view` (línea 284).
- **`ConfirmarEleccionModal.tsx`** (modal, 3 caras internas por props `succeeded`/`loading`):
  - `succeeded=false` → cara "¿Confirmas tu elección?" (desglose + seguros seleccionables + botón "Confirmar" que llama `onConfirm`).
  - `loading=true` → botón muestra "Procesando tu cambio…".
  - `succeeded=true` → cara "¡Listo!" (check + botón "Continuar" → `onSuccessContinue`).
  - **También lo usa `MiOfertaClient.tsx` (línea 544, el index).** La cara "¡Listo!" NO se elimina del componente — se sigue usando en el index.
- **`SeleccionConfirmada.tsx`** (línea 133): página de confirmación "¡Felicidades, {nombre}!" con el equipo elegido + desglose. Se muestra en `/oferta/{token}` cuando la oferta ya está consumida (`alreadySelected`). **No se toca.**

## Flujo

```
ANTES:
  [Continuar] (página) → modal "¿Confirmas?" (con seguros) → [Confirmar]
    → "Procesando…" → cara "¡Listo!" → [Continuar] → página confirmación

DESPUÉS:
  [Continuar] (página) → modal "¿Confirmas?" (con seguros) → [Confirmar]
    → "Procesando…" → (backend OK) → redirige directo a /oferta/{token}
```

De 3 taps de cierre (Continuar → Confirmar → Continuar) a 2 (Continuar → Confirmar).

## Cambio

Único, acotado a **`AccesoriosOfertaClient.tsx`**. En `confirmar()`, tras el OK del backend, en vez de `setSucceeded(true)` (que activa la cara "¡Listo!"), **redirigir directo** a la página de confirmación:

```typescript
// ANTES (línea ~349-353):
      clearStoredAddons(token, variantId);
      clearOfferSelection(token);
      setConfirming(false);
      setSucceeded(true);

// DESPUÉS:
      clearStoredAddons(token, variantId);
      clearOfferSelection(token);
      // Marca succeeded para el analytics/guard, pero NO muestra la cara "¡Listo!"
      // del modal: redirige directo a la página de confirmación (¡Felicidades!).
      // El modal queda en "Procesando…" hasta que ocurre la navegación (el
      // spinner no se corta, no hay flash de "¡Listo!").
      setSucceeded(true);
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`;
```

Notas del cambio:
- **`setConfirming(false)` se elimina** de la rama de éxito: mantener `confirming=true` deja el botón en "Procesando tu cambio…" hasta que la navegación reemplaza la página, evitando un flash del botón "Confirmar" o de la cara "¡Listo!".
- **`setSucceeded(true)` se mantiene**: preserva el guard del auto-save (línea 238) y el analytics `offer_success_view` (línea 284) que dependen de `succeeded`. Como la navegación es inmediata, la cara "¡Listo!" no llega a renderizarse de forma visible (y aunque lo hiciera un instante, la redirección ya está en curso).
- El `onSuccessContinue` que hoy pasa el modal (línea 765) queda **sin efecto** en este flujo (ya no se llega a la cara "¡Listo!"), pero se deja como está para no romper la firma del componente compartido.

## Qué NO cambia

- El modal "¿Confirmas tu elección?" queda **idéntico**: desglose, seguros seleccionables, botón "Confirmar".
- `ConfirmarEleccionModal.tsx` **no se modifica** (la cara "¡Listo!" sigue viva para el uso del index `MiOfertaClient`).
- `SeleccionConfirmada.tsx` (página de confirmación destino) no se toca.
- Persistencia (`selectEquipment`), limpieza de borrador, analytics de submit, y error handling: sin cambios.

## Error handling

Sin cambios respecto a hoy: si `selectEquipment` falla (catch en `confirmar()`), se muestra el error, `setConfirming(false)` y `setModalOpen(false)` — el cliente vuelve a la página de complementos y puede reintentar. La redirección solo ocurre en la rama de éxito.

## Testing / verificación

- **E2E manual (local):** emitir una oferta Caso 4, ir a complementos, seleccionar add-ons/seguros, tocar "Continuar" → "Confirmar" → verificar que redirige **directo** a `/oferta/{token}` mostrando "¡Felicidades!" (sin ver la cara "¡Listo!" intermedia).
- **Verificar BD:** tras confirmar, `application_offer.status=ACCEPTED` y `approved_capacity` con los add-ons/seguros elegidos (la persistencia no cambió).
- **No-regresión del index:** abrir una oferta ya consumida (`/oferta/{token}`) y verificar que la pantalla "¡Felicidades!" (`SeleccionConfirmada`) sigue mostrándose bien — y que el `ConfirmarEleccionModal` del index (su cara "¡Listo!") no se rompió.
- **tsc:** `npx tsc --noEmit` sin errores nuevos.

## Constraints

- Local only para pruebas (no prod salvo OK explícito).
- No builds pesados (tsc, no `npm run build`).
- Español peruano.
- El cambio va en la rama `feature/bal-2212-oferta-ajustes-visuales-v2` (misma tanda de ajustes visuales de la oferta).

## Fuera de alcance

- Rediseñar la página de confirmación (`SeleccionConfirmada`).
- Los seguros como 2 cards cuadrados 300×300 en el paso final (punto separado de la reunión, otro ticket).
- Cualquier cambio en el modal `ConfirmarEleccionModal` o en el flujo del index.
