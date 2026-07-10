# Eliminar el "¡Listo!" intermedio del flujo de confirmación de oferta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tras "Confirmar" en el modal de complementos, redirigir directo a la página de confirmación (`SeleccionConfirmada`, "¡Felicidades!") en vez de mostrar la cara "¡Listo!" intermedia del modal.

**Architecture:** Cambio único y acotado en la función `confirmar()` de `AccesoriosOfertaClient.tsx`. Tras el OK del backend, en la rama de éxito se reemplaza la activación de la cara "¡Listo!" (que dependía de que el usuario tocara "Continuar" en el modal) por una redirección directa a `/oferta/{token}`. El componente `ConfirmarEleccionModal` NO se toca (su cara "¡Listo!" sigue viva porque también la usa el index `MiOfertaClient`).

**Tech Stack:** Next.js 16, React 19, TypeScript. Sin backend. Sin tests unitarios en esta ruta (es un cambio de navegación en un client component; se verifica con tsc + E2E manual local).

## Global Constraints

- Español peruano, sin mexicanismos.
- No builds pesados: usar `npx tsc --noEmit`, NO `npm run build`.
- El cambio va en la rama `feature/bal-2212-oferta-ajustes-visuales-v2`.
- Local only para pruebas E2E (no prod salvo OK explícito).
- No tocar `ConfirmarEleccionModal.tsx` (componente compartido con el index).
- Preservar `setSucceeded(true)` (lo usan el guard del auto-save de add-ons en línea 238 y el analytics `offer_success_view` en línea 284).

---

### Task 1: Redirigir directo tras confirmar (eliminar "¡Listo!" intermedio)

**Files:**
- Modify: `src/app/prototipos/0.6/oferta/[token]/complementos/AccesoriosOfertaClient.tsx:349-353` (rama de éxito de `confirmar()`)

**Interfaces:**
- Consume: `token` (string, ya en scope), `variantId` (number, ya en scope), `process.env.NEXT_PUBLIC_APP_BASE_PATH` (mismo patrón usado en el resto del archivo, ej. línea 766 actual).
- Produce: nada nuevo (no exporta ni cambia firmas).

**Contexto — estado actual de la rama de éxito (líneas 349-353):**

```typescript
      // Ya quedó en BD → limpiar el borrador local para no restaurarlo luego.
      clearStoredAddons(token, variantId);
      clearOfferSelection(token);
      setConfirming(false);
      setSucceeded(true);
```

- [ ] **Step 1: Aplicar el cambio en la rama de éxito de `confirmar()`**

Reemplazar el bloque de las líneas 349-353 (mostrado arriba) por:

```typescript
      // Ya quedó en BD → limpiar el borrador local para no restaurarlo luego.
      clearStoredAddons(token, variantId);
      clearOfferSelection(token);
      // Marca succeeded para el guard del auto-save (l.238) y el analytics
      // (l.284), pero NO se muestra la cara "¡Listo!" del modal: se redirige
      // directo a la página de confirmación (¡Felicidades!). Se mantiene
      // `confirming=true` (no se llama setConfirming(false)) para que el botón
      // siga en "Procesando tu cambio…" hasta que la navegación reemplace la
      // página — evita un flash de la cara "¡Listo!" o del botón "Confirmar".
      setSucceeded(true);
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`;
```

Cambios concretos respecto al original:
1. Se **elimina** la línea `setConfirming(false);` de la rama de éxito (el spinner debe seguir hasta la redirección).
2. Se **mantiene** `setSucceeded(true);`.
3. Se **agrega** `window.location.href = \`${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}\`;` como última línea de la rama de éxito.
4. Se actualiza el comentario para reflejar el nuevo comportamiento.

La rama `catch` (líneas 354-358) NO se toca: sigue con `setError(...)`, `setConfirming(false)`, `setModalOpen(false)`.

- [ ] **Step 2: Actualizar el comentario de cabecera de `confirmar()`**

El comentario de las líneas 331-333 describe el comportamiento viejo ("el modal pasa a ¡Listo!; la navegación ... al presionar Continuar"). Reemplazarlo:

```typescript
  // Confirmación real (desde el modal). Tras el OK del backend, redirige DIRECTO
  // a la página de confirmación (/oferta/{token} → SeleccionConfirmada,
  // "¡Felicidades!"), sin la cara "¡Listo!" intermedia del modal (BAL-2212).
  // Se mantiene confirming=true hasta la navegación para no cortar el spinner.
```

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit 2>&1 | grep -iE "AccesoriosOfertaClient"`
Expected: sin salida (0 errores en ese archivo). El resto de la salida de tsc puede contener errores preexistentes ajenos a este archivo (ej. `landingApi.heroFlags.test.ts`), que se ignoran.

- [ ] **Step 4: Verificar que no quedó `onSuccessContinue` roto ni `succeeded` sin usar**

Run: `grep -n "onSuccessContinue\|setSucceeded\|succeeded" "src/app/prototipos/0.6/oferta/[token]/complementos/AccesoriosOfertaClient.tsx"`
Expected: `setSucceeded(true)` sigue presente (1 uso en `confirmar`); `succeeded` sigue usándose en el guard del auto-save (~l.238) y el analytics (~l.284); `onSuccessContinue` sigue pasándose al modal (queda sin efecto en este flujo pero no rompe la firma del componente compartido — es correcto no eliminarlo).

- [ ] **Step 5: Commit**

```bash
git add "src/app/prototipos/0.6/oferta/[token]/complementos/AccesoriosOfertaClient.tsx"
git commit -m "feat(oferta): redirige directo a confirmación tras confirmar (sin ¡Listo! intermedio) (BAL-2212)

Tras Confirmar en el modal de complementos, en vez de mostrar la cara ¡Listo!
del ConfirmarEleccionModal (que requería un tercer tap Continuar), se redirige
directo a /oferta/{token} (página SeleccionConfirmada, ¡Felicidades!). Se
mantiene setSucceeded(true) (guard auto-save + analytics) y confirming=true
hasta la navegación (spinner no se corta). ConfirmarEleccionModal no se toca
(su cara ¡Listo! sigue viva para el index).

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Verificación E2E (tras implementar, manual, local)

Estos pasos son de validación manual — no bloquean el commit del Task 1, pero deben correrse antes de dar el cambio por listo:

1. **Backend local** levantado (puerto que use `.env.local` del front; hoy 8012) y **front** en 3001.
2. Emitir una oferta Caso 4 local y abrir `/oferta/{token}` → aceptar un equipo → llegar a complementos.
3. Seleccionar accesorios/seguros → tocar "Continuar" → en el modal "¿Confirmas tu elección?" tocar "Confirmar".
4. **Verificar:** el botón queda en "Procesando tu cambio…" y luego la página **redirige directo** a `/oferta/{token}` mostrando "¡Felicidades!" (`SeleccionConfirmada`) — **sin** ver la cara "¡Listo!" intermedia.
5. **Verificar BD:** `application_offer.status=ACCEPTED` con los add-ons/seguros en `approved_capacity` (la persistencia no cambió).
6. **No-regresión:** volver a abrir `/oferta/{token}` (oferta ya consumida) → sigue mostrando "¡Felicidades!" correctamente; el modal del index no se rompió.

## Self-Review (hecho por el autor del plan)

- **Spec coverage:** el spec pide un cambio único en `confirmar()` (redirigir directo, preservar `setSucceeded`, quitar `setConfirming(false)` de la rama éxito, no tocar el modal). Task 1 lo cubre íntegro. Sin gaps.
- **Placeholder scan:** sin TBD/TODO; todo el código a cambiar está mostrado literal.
- **Type consistency:** no se introducen tipos ni firmas nuevas; se reutilizan `token`, `variantId`, y el patrón `process.env.NEXT_PUBLIC_APP_BASE_PATH` ya presente en el archivo.
