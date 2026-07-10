# ConfirmarEleccionModal responsive (drawer mobile / modal desktop) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el paso "¿Confirmas tu elección?" sea un bottom sheet (drawer) en mobile y el mismo modal centrado en desktop, sin cambiar los callers.

**Architecture:** Un solo archivo tocado (`ConfirmarEleccionModal.tsx`). Se extrae el contenido a un sub-componente local `ConfirmarEleccionContenido` con flag `variant: 'modal' | 'drawer'` (DRY). `ConfirmarEleccionModal` bifurca por `useIsMobile()` (768px): mobile → drawer `motion.div` (patrón calcado de `BuscadorBottomSheet`/`SeguroDetalleSheet`, envuelto en `AnimatePresence`); desktop → `<Modal>` NextUI actual.

**Tech Stack:** Next.js 16, React 19, TypeScript, NextUI 2.6, framer-motion. Sin backend, sin tests unitarios (client component; se valida con tsc + E2E manual local).

## Global Constraints

- Español peruano, sin mexicanismos.
- No builds pesados: `npx tsc --noEmit`, NO `npm run build`.
- Rama `feature/bal-2212-oferta-ajustes-visuales-v2`.
- Local only para pruebas.
- Seguir el patrón de drawer YA existente en la oferta (motion.div + dragControls + `max-h-[85dvh]` + `env(safe-area-inset-bottom)`), NO el `Drawer` de NextUI.
- Props del componente **idénticas** (los 2 callers no cambian): `isOpen, equipo, loading, onConfirm, onClose, addonsSlot, insuranceUpsellSlot`.
- `loading` bloquea el cierre en ambas presentaciones.
- La cara "¡Listo!" ya fue eliminada en un cambio previo — el componente solo tiene la cara de confirmación.

---

### Task 1: Extraer el contenido a `ConfirmarEleccionContenido` y bifurcar drawer/modal

**Files:**
- Modify: `src/app/prototipos/0.6/oferta/[token]/components/ConfirmarEleccionModal.tsx` (archivo completo — imports, nuevo sub-componente, y el cuerpo de `ConfirmarEleccionModal`).

**Interfaces:**
- Consume: `useIsMobile` de `@/app/prototipos/_shared`; `motion, AnimatePresence, useDragControls` de `framer-motion`; props actuales del componente.
- Produce: nada nuevo hacia afuera (la firma pública de `ConfirmarEleccionModal` no cambia).

**Contexto — imports actuales (líneas 18-22):**
```typescript
import type { ReactNode } from 'react';
import { Modal, ModalContent, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';
import { cuotaSuffix, plazoUnit, inicialText } from './equipoCardFormat';
import { OFERTA_COLORS } from './redesign/ofertaTheme';
```

- [ ] **Step 1: Actualizar imports**

Reemplazar el bloque de imports (líneas 18-22) por:

```typescript
import type { ReactNode } from 'react';
import { Modal, ModalContent, Button } from '@nextui-org/react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';
import { useIsMobile } from '@/app/prototipos/_shared';
import { cuotaSuffix, plazoUnit, inicialText } from './equipoCardFormat';
import { OFERTA_COLORS } from './redesign/ofertaTheme';
```

Nota: se quitan `ModalBody`/`ModalFooter` del import de NextUI (el contenido pasa a usar `<div>` neutros para servir a ambas variantes) y se agregan `motion, AnimatePresence, useDragControls` y `useIsMobile`.

- [ ] **Step 2: Añadir el sub-componente `ConfirmarEleccionContenido`**

Insertar esta función **justo antes** de `export function ConfirmarEleccionModal(` (después del helper `PedidoBox`). Contiene el header + body + footer que hoy están inline, con `<div>` neutros en vez de `ModalBody`/`ModalFooter`:

```typescript
/** Contenido del paso "¿Confirmas tu elección?" — compartido entre la
 *  presentación modal (desktop) y drawer (mobile). Header índigo + resumen del
 *  equipo + desglose (addonsSlot) + upsell seguros + aviso + footer con
 *  "Cancelar"/"Confirmar". Sin envoltorio propio: el caller (Modal o sheet) lo
 *  monta. `scrollClassName` permite al drawer poner el scroll en el body. */
function ConfirmarEleccionContenido({
  equipo,
  loading,
  onConfirm,
  onClose,
  addonsSlot,
  insuranceUpsellSlot,
  scrollClassName,
}: {
  equipo: EquipoAConfirmar | null;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  addonsSlot?: ReactNode;
  insuranceUpsellSlot?: ReactNode;
  /** Clase del contenedor del body (el drawer necesita flex-1 + overflow). */
  scrollClassName: string;
}) {
  return (
    <>
      {/* Header índigo */}
      <div className="flex flex-none items-center gap-3 px-5 py-[22px]" style={{ backgroundColor: HEADER_INDIGO }}>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.16]">
          <ShoppingBag className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-['Baloo_2',_sans-serif] text-[20px] font-bold text-white">¿Confirmas tu elección?</h2>
          <p className="text-[12.5px] text-white/85">Estás a un paso de elegir tu equipo</p>
        </div>
        <button
          onClick={onClose}
          disabled={loading}
          className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/[0.18] transition-colors hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Body (scroll dentro del contenedor) */}
      <div className={scrollClassName}>
        <div className="px-4 py-4">
          {/* Resumen del equipo */}
          {equipo ? (
            <div className="flex items-center gap-4">
              {equipo.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={equipo.imageUrl} alt={equipo.name} className="h-[50px] w-[50px] shrink-0 object-contain" />
              ) : (
                <div className="h-[50px] w-[50px] shrink-0 rounded-lg bg-gray-200" />
              )}
              <div className="min-w-0">
                {equipo.brand ? (
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: OFERTA_COLORS.textSoft }}>
                    {equipo.brand}
                  </p>
                ) : null}
                <p className="font-['Baloo_2',_sans-serif] text-[13.5px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
                  {equipo.name}
                </p>
              </div>
            </div>
          ) : null}

          {/* Fila de cuota del equipo: solo cuando NO hay desglose de pedido. */}
          {equipo?.monthly && !addonsSlot ? (
            <div className="mt-3.5 flex items-center justify-between border-t pt-3" style={{ borderColor: '#F1F2F7' }}>
              <div>
                <span className="text-sm font-semibold" style={{ color: OFERTA_COLORS.textStrong }}>
                  Cuota {equipo.paymentFrequency === 'semanal' ? 'semanal' : equipo.paymentFrequency === 'quincenal' ? 'quincenal' : 'mensual'}
                </span>
                {equipo.term ? (
                  <p className="text-xs" style={{ color: OFERTA_COLORS.textSoft }}>
                    en {equipo.term} {plazoUnit(equipo.term, equipo.paymentFrequency)}
                    {inicialText(equipo.initialAmount, equipo.initial)}
                  </p>
                ) : null}
              </div>
              <span className="font-['Baloo_2',_sans-serif] text-[25px] font-extrabold" style={{ color: OFERTA_COLORS.primary }}>
                S/{Math.round(equipo.monthly)}
                <span className="text-sm font-normal" style={{ color: OFERTA_COLORS.textMid }}>{cuotaSuffix(equipo.paymentFrequency)}</span>
              </span>
            </div>
          ) : null}

          {/* Desglose "Tu pedido incluye" */}
          {addonsSlot ? <PedidoBox>{addonsSlot}</PedidoBox> : null}

          {/* Upsell de seguros (si el caller lo pasa) */}
          {insuranceUpsellSlot}

          {/* Aviso verde */}
          <div
            className="mt-4 flex items-start gap-2 rounded-xl p-3 text-sm font-medium"
            style={{ backgroundColor: OFERTA_COLORS.greenSoft, color: OFERTA_COLORS.greenDark }}
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Al aceptar, cambiaremos tu equipo y tu solicitud quedará aprobada.</span>
          </div>
        </div>
      </div>

      {/* Footer con botones */}
      <div className="flex flex-none items-center justify-end gap-2 px-4 py-3">
        <Button
          variant="light"
          onPress={onClose}
          isDisabled={loading}
          className="cursor-pointer font-['Baloo_2',_sans-serif] font-bold"
          style={{ color: OFERTA_COLORS.textMid }}
        >
          Cancelar
        </Button>
        <Button
          onPress={onConfirm}
          isLoading={loading}
          isDisabled={loading}
          radius="lg"
          className="cursor-pointer font-['Baloo_2',_sans-serif] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          style={{ backgroundColor: OFERTA_COLORS.primary }}
        >
          {loading ? 'Procesando tu cambio…' : 'Confirmar'}
        </Button>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Reescribir el cuerpo de `ConfirmarEleccionModal`**

Reemplazar todo el cuerpo de la función `ConfirmarEleccionModal` (desde `const dismiss = ...` hasta el `);` final, o sea el `return (...)` completo) por la bifurcación mobile/desktop. El bloque de destructuring de props (líneas 57-78) NO cambia. Nuevo cuerpo:

```typescript
  const isMobile = useIsMobile();
  const dragControls = useDragControls();
  const dismiss = () => (loading ? undefined : onClose());

  // --- MOBILE: bottom sheet (mismo patrón que BuscadorBottomSheet/SeguroDetalleSheet) ---
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen ? (
          <>
            {/* Backdrop: cierra solo si !loading */}
            <motion.div
              key="confirmar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={dismiss}
              className="fixed inset-0 z-[100]"
              style={{ backgroundColor: 'rgba(24,26,42,.42)', touchAction: 'none' }}
            />
            {/* Sheet */}
            <motion.div
              key="confirmar-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag={loading ? false : 'y'}
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (!loading && info.offset.y > 100) onClose();
              }}
              className="fixed bottom-0 left-0 right-0 z-[101] flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl bg-white"
              style={{ overscrollBehavior: 'contain', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Drag handle (deshabilitado mientras carga) */}
              <div
                onPointerDown={(e) => { if (!loading) dragControls.start(e); }}
                className="flex flex-none justify-center pt-3 pb-1"
                style={{ cursor: loading ? 'default' : 'grab' }}
              >
                <div className="h-1 w-10 rounded-full bg-neutral-300" />
              </div>
              <ConfirmarEleccionContenido
                equipo={equipo}
                loading={loading}
                onConfirm={onConfirm}
                onClose={onClose}
                addonsSlot={addonsSlot}
                insuranceUpsellSlot={insuranceUpsellSlot}
                scrollClassName="flex-1 overflow-y-auto"
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    );
  }

  // --- DESKTOP: modal centrado (como hoy) ---
  return (
    <Modal
      isOpen={isOpen}
      onClose={dismiss}
      placement="center"
      size={addonsSlot ? 'lg' : 'md'}
      scrollBehavior="inside"
      hideCloseButton
      backdrop="opaque"
      isDismissable={!loading}
      classNames={{
        wrapper: 'z-[101]',
        backdrop: 'z-[100] bg-black/50',
        base: 'bg-white rounded-2xl overflow-hidden',
        body: 'bg-white p-0',
        footer: 'bg-white',
      }}
    >
      <ModalContent>
        <ConfirmarEleccionContenido
          equipo={equipo}
          loading={loading}
          onConfirm={onConfirm}
          onClose={onClose}
          addonsSlot={addonsSlot}
          insuranceUpsellSlot={insuranceUpsellSlot}
          scrollClassName=""
        />
      </ModalContent>
    </Modal>
  );
```

Notas:
- El drawer usa `z-[100]` (backdrop) / `z-[101]` (sheet) — coherente con el `z-[101]` que el modal ya usa para su wrapper. (Los otros sheets usan `z-[9998]/9999`; aquí se alinea con el z del modal existente para no romper stacking con otros overlays de la oferta, y como el drawer y el modal son mutuamente excluyentes por viewport, no compiten.)
- `drag={loading ? false : 'y'}` y el guard en `onDragEnd`/`onPointerDown` implementan "no se puede arrastrar para cerrar mientras carga".
- En desktop `scrollClassName=""` (el `<Modal scrollBehavior="inside">` ya maneja el scroll); en mobile `flex-1 overflow-y-auto` (scroll dentro del 85dvh).

- [ ] **Step 4: Verificar que compila**

Run: `npx tsc --noEmit 2>&1 | grep -iE "ConfirmarEleccionModal|AccesoriosOfertaClient|MiOfertaClient"`
Expected: sin salida (0 errores en esos archivos). Errores preexistentes ajenos (ej. `landingApi.heroFlags.test.ts`) se ignoran.

- [ ] **Step 5: Verificar que no quedaron imports/símbolos huérfanos**

Run: `grep -nE "ModalBody|ModalFooter" "src/app/prototipos/0.6/oferta/[token]/components/ConfirmarEleccionModal.tsx"`
Expected: sin salida (ya no se usan `ModalBody`/`ModalFooter`).

- [ ] **Step 6: Commit**

```bash
git add "src/app/prototipos/0.6/oferta/[token]/components/ConfirmarEleccionModal.tsx"
git commit -m "feat(oferta): ConfirmarEleccionModal como drawer en mobile, modal en desktop (BAL-2212)

Extrae el contenido a ConfirmarEleccionContenido (variant modal/drawer, DRY) y
bifurca por useIsMobile (768px): mobile → bottom sheet motion.div con el patrón
de los otros drawers de la oferta (backdrop + spring + dragControls + drag
handle + 85dvh + safe-area; drag/backdrop no cierran si loading); desktop → el
Modal NextUI de siempre. Props y callers sin cambios; loading bloquea el cierre.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Verificación E2E (tras implementar, manual, local)

1. **Front (3001)** con `.env.local` apuntando al backend local; refrescar para tomar el cambio.
2. **Mobile** (DevTools device toolbar <768px o ventana angosta): en complementos, "Continuar" → aparece un **bottom sheet** deslizando desde abajo con el desglose + "Confirmar". Arrastrar el handle hacia abajo lo cierra; tap en backdrop lo cierra. Tocar "Confirmar" → "Procesando…" (no se puede arrastrar ni cerrar) → redirige a "¡Felicidades!".
3. **Desktop** (≥768px): "Continuar" → **modal centrado** de siempre (sin cambios visuales); "Confirmar" → "Procesando…" → redirige.
4. **No-regresión index:** abrir el modal de confirmación del index (`MiOfertaClient`, sin addonsSlot) en mobile → drawer; en desktop → modal.

## Self-Review (hecho por el autor del plan)

- **Spec coverage:** el spec pide (1) drawer en mobile con el patrón existente ✓ Step 3; (2) modal en desktop ✓ Step 3; (3) contenido extraído DRY ✓ Step 2; (4) props/callers sin cambios ✓ (destructuring intacto, `ConfirmarEleccionContenido` es interno); (5) loading bloquea cierre ✓ (drag=false, backdrop dismiss guard, X disabled, isDismissable); (6) cara "¡Listo!" ya eliminada — el contenido solo tiene confirmación ✓. Sin gaps.
- **Placeholder scan:** sin TBD/TODO; todo el JSX está literal (copiado del componente actual verificado).
- **Type consistency:** `ConfirmarEleccionContenido` recibe los mismos tipos que las props del modal (`EquipoAConfirmar | null`, `ReactNode`, callbacks) + `scrollClassName: string`. `useIsMobile` retorna `boolean`. `useDragControls`/`motion`/`AnimatePresence` de framer-motion (ya usados en otros sheets de la oferta con la misma firma).
