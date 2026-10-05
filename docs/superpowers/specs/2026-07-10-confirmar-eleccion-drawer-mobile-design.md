# `ConfirmarEleccionModal` responsive: drawer en mobile, modal en desktop — Diseño (spec)

**Fecha:** 2026-07-10 · **Autor:** Emilio + Claude · **Ticket:** BAL-2212 · **Alcance:** el paso "¿Confirmas tu elección?" del flujo de oferta (Caso 4/5).

## Objetivo

El paso de confirmación ("¿Confirmas tu elección?") hoy es un `<Modal>` de NextUI centrado, idéntico en mobile y desktop. Se quiere que en **mobile** sea un **bottom sheet (drawer)** — consistente con los otros drawers del flujo de oferta (`BuscadorBottomSheet`, `SeguroDetalleSheet`, `AccesorioDetalleSheet`) — y en **desktop** siga siendo el mismo modal centrado.

## Enfoque

Replicar el **patrón `motion.div` de los drawers existentes** de la oferta (NO el componente `Drawer` de NextUI), para consistencia visual total. El componente `ConfirmarEleccionModal` bifurca por `useIsMobile()` (breakpoint 768px, hook de `_shared`): en mobile renderiza el drawer, en desktop el `<Modal>` actual. El **contenido interno se extrae una sola vez** a un sub-componente compartido para no duplicarlo (DRY).

## Contexto verificado (file:line)

- **`ConfirmarEleccionModal.tsx`** (componente a modificar):
  - Hoy: `<Modal>` NextUI (`placement="center"`, `size="lg"`, `isDismissable={!loading}`), con `<ModalContent><ModalBody>...</ModalBody><ModalFooter>...</ModalFooter></ModalContent>`.
  - Contenido (líneas 104-209): header índigo (`HEADER_INDIGO='#5850EC'`, ShoppingBag + "¿Confirmas tu elección?" + botón X), resumen del equipo, fila de cuota (solo si `!addonsSlot`), `PedidoBox` con `addonsSlot`, `insuranceUpsellSlot`, aviso verde "Al aceptar…", y footer con "Cancelar" + "Confirmar".
  - Props (líneas 57-78): `isOpen, equipo, loading, onConfirm, onClose, addonsSlot, insuranceUpsellSlot`. **La cara "¡Listo!" ya se eliminó** (cambio previo BAL-2212).
  - **Importante:** `<ModalBody>`/`<ModalFooter>` de NextUI solo funcionan dentro de `<Modal>`. En el drawer (motion.div) se deben usar `<div>` neutros equivalentes.
- **Patrón de drawer existente** (`BuscadorBottomSheet.tsx:100-133`, `SeguroDetalleSheet.tsx:32-70`):
  - Backdrop: `motion.div` con `initial/animate/exit` opacity, `className="fixed inset-0 z-[9998]"`, `style={{ backgroundColor: 'rgba(24,26,42,.42)', touchAction: 'none' }}`, `onClick={onCerrar}`.
  - Sheet: `motion.div` con `initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}`, `transition={{ type:'spring', damping:30, stiffness:300 }}`, `className="fixed bottom-0 left-0 right-0 z-[9999] flex max-h-[85dvh] flex-col rounded-t-2xl bg-white"`, `style={{ overscrollBehavior:'contain', paddingBottom:'env(safe-area-inset-bottom)' }}`.
  - Drag: `useDragControls()` + `drag="y" dragControls={dragControls} dragListener={false} dragConstraints={{top:0,bottom:0}} dragElastic={{top:0,bottom:0.5}} onDragEnd={(_,info)=>{ if(info.offset.y>100) onCerrar(); }}`.
  - Drag handle: `<div onPointerDown={(e)=>dragControls.start(e)} className="flex flex-none cursor-grab justify-center pt-3 pb-1 active:cursor-grabbing"><div className="h-1 w-10 rounded-full bg-neutral-300" /></div>`.
  - Los drawers existentes se envuelven en `<AnimatePresence>` **en el caller**. Aquí, para no tocar los 2 callers, el `AnimatePresence` va **dentro** de `ConfirmarEleccionModal` (envolviendo la rama drawer).
- **`useIsMobile`** (`_shared/hooks/useIsMobile.ts`): `window.innerWidth < 768`; devuelve `false` en SSR (primer render), se corrige en cliente vía effect.
- **Callers (no cambian):**
  - `AccesoriosOfertaClient.tsx:761` — pasa todas las props incl. `addonsSlot`/`insuranceUpsellSlot`.
  - `MiOfertaClient.tsx:544` — pasa `isOpen, equipo, loading, onConfirm, onClose` (sin addonsSlot).

## Arquitectura

Un solo archivo modificado: `ConfirmarEleccionModal.tsx`. Estructura resultante:

```
ConfirmarEleccionModal(props)
  ├─ const isMobile = useIsMobile()
  ├─ contenido = <ConfirmarEleccionContenido {...} />   // extraído, DRY
  ├─ if (isMobile):
  │     <AnimatePresence>
  │       {isOpen && (<> backdrop motion.div + sheet motion.div (contenido) </>)}
  │     </AnimatePresence>
  └─ else:
        <Modal isOpen={isOpen} ...> <ModalContent>{contenido}</ModalContent> </Modal>
```

### `ConfirmarEleccionContenido` (sub-componente/función local, mismo archivo)

Recibe: `equipo, loading, onConfirm, onClose, addonsSlot, insuranceUpsellSlot`, y un flag `variant: 'modal' | 'drawer'` (para decidir si envuelve en `ModalBody`/`ModalFooter` o en `<div>` planos).

- **`variant='modal'`**: mantiene `<ModalBody>`/`<ModalFooter>` (comportamiento actual desktop intacto).
- **`variant='drawer'`**: usa `<div className="flex-1 overflow-y-auto">` para el body (scroll dentro del 85dvh) y un `<div>` footer con los mismos botones.

El header índigo, el resumen del equipo, la fila de cuota, `PedidoBox`, `insuranceUpsellSlot`, el aviso verde y los botones "Cancelar"/"Confirmar" son **idénticos** en ambas variantes (se comparten en el JSX; solo cambia el envoltorio body/footer).

## Comportamiento del drawer (mobile)

- Aparece deslizando desde abajo (spring), backdrop oscuro con fade.
- **Drag para cerrar:** arrastrar el sheet hacia abajo >100px cierra (llama `onClose`) — **solo cuando `!loading`**. Con `loading`, `dragListener` queda deshabilitado (no se puede arrastrar) y el tap en backdrop no cierra.
- **Tap en backdrop:** cierra solo si `!loading` (igual que `isDismissable={!loading}` del modal).
- **Botón X del header:** `disabled={loading}` (ya está así).
- Scroll interno del contenido dentro de `max-h-[85dvh]` (el desglose puede ser largo).

## Qué se preserva

- Props del componente **idénticas** → los 2 callers no cambian.
- `loading` bloquea el cierre en ambos (drawer: no drag, no backdrop-tap, X disabled; modal: `isDismissable={!loading}`).
- Anti-doble-clic del caller (`confirmLock` en `AccesoriosOfertaClient`) intacto.
- La eliminación previa de la cara "¡Listo!" se mantiene (solo la cara confirmación).
- El look del contenido (header índigo, colores `OFERTA_COLORS`, textos) es el mismo en drawer y modal.

## Error handling

Sin cambios: el error de `selectEquipment` lo maneja el caller (cierra el modal/drawer y muestra el error en la página). El componente solo presenta.

## SSR / hidratación

`useIsMobile()` devuelve `false` en el primer render (server) y se corrige en cliente. Como el modal/drawer solo tiene contenido visible cuando `isOpen` (que se activa por interacción del usuario, siempre en cliente), no hay flash ni mismatch visible: para cuando `isOpen` pasa a true, `isMobile` ya está resuelto. La rama drawer va dentro de `AnimatePresence` para animar entrada/salida.

## Testing / verificación

- **tsc:** `npx tsc --noEmit` sin errores nuevos en `ConfirmarEleccionModal.tsx` ni en los callers.
- **E2E manual mobile (local, viewport <768px o DevTools device):** en complementos, "Continuar" → aparece un **bottom sheet** deslizando desde abajo con el desglose + "Confirmar"; arrastrar hacia abajo lo cierra; tocar backdrop lo cierra; al tocar "Confirmar" queda en "Procesando…" (no se puede arrastrar ni cerrar) → redirige.
- **E2E manual desktop (≥768px):** mismo paso muestra el **modal centrado** de siempre (sin cambios visuales).
- **No-regresión index:** el `ConfirmarEleccionModal` del index (`MiOfertaClient`, sin addonsSlot) funciona igual en ambos viewports.

## Constraints

- Español peruano, sin mexicanismos.
- No builds pesados: `npx tsc --noEmit`, no `npm run build`.
- Rama `feature/bal-2212-oferta-ajustes-visuales-v2`.
- Local only para pruebas.
- Seguir el patrón de drawer YA existente en la oferta (motion.div + dragControls + 85dvh + safe-area), no inventar uno nuevo ni usar el `Drawer` de NextUI.

## Fuera de alcance

- Cambiar el contenido/copy del paso de confirmación.
- Tocar los otros drawers existentes.
- Cualquier cambio en los callers (complementos, index) más allá de que sigan pasando las mismas props.
