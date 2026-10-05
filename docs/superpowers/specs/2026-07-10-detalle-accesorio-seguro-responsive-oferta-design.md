# Detalle de accesorio/seguro responsive en la oferta (modal desktop / drawer mobile) — Diseño (spec)

**Fecha:** 2026-07-10 · **Autor:** Emilio + Claude · **Ticket:** BAL-2212 · **Alcance:** los bottom sheets de detalle de accesorio y seguro del flujo de oferta (complementos).

## Objetivo

Hoy `AccesorioDetalleSheet` y `SeguroDetalleSheet` (el "Ver detalle" de un accesorio/seguro en complementos) son **solo bottom sheet** — se ven igual en mobile y desktop (una hoja pegada abajo). Se quiere que en **desktop** sean un **modal centrado** (como el flujo regular y como el `ConfirmarEleccionModal` que ya hicimos), manteniendo el **drawer en mobile**.

## Enfoque

Cada componente bifurca por `useIsMobile()` (768px, hook de `_shared`): mobile → el bottom sheet actual (motion.div); desktop → `<Modal>` NextUI centrado. El **contenido interno** (header, body, footer) se extrae a un sub-componente local para no duplicarlo. **NO** se reutilizan los modales del flujo regular (`AccessoryDetailModal`/`InsuranceDetailModal`) — están acoplados al tema de la landing (`var(--color-primary)`, `useGamerTheme`, `useParams().landing` que la oferta no tiene) y tienen otra API (solo `onClose`, sin `onVolver`).

## Contexto verificado (file:line)

- **`AccesorioDetalleSheet.tsx`** (37 → ~146 líneas): backdrop `motion.div` (z-[9998]) + sheet `motion.div` (z-[9999], `max-h-[85dvh]`, `rounded-t-2xl`, safe-area). Estructura interna: header (botón "Volver a la lista" con `onVolver` + botón X con `onCerrar`), body scrollable (`flex-1 overflow-y-auto px-5 pb-28`: foto 200px, marca, nombre, descripción, precio grande "+S/X/mes · en N meses"), footer (`flex-none border-t px-5 py-4`: botón "Agregar al pedido"/"Quitar" con `onAgregar`). Props: `accesorio, agregado, onAgregar, onVolver, onCerrar`.
- **`SeguroDetalleSheet.tsx`**: **misma estructura** (backdrop z-[9998] + sheet z-[9999] + header Volver/X + body scrollable + footer botón). Contenido interno distinto (escudo lila en vez de foto, proveedor, coberturas). Props: `seguro, agregado, onAgregar, onVolver, onCerrar`.
- **`useIsMobile`** (`_shared/hooks/useIsMobile.ts`): `window.innerWidth < 768`; `false` en SSR, se corrige en cliente.
- **Callers (no cambian):** `AccesoriosOfertaClient.tsx` monta `<AccesorioDetalleSheet ... />` (dentro de `<AnimatePresence>`) y `<SeguroDetalleSheet ... />` con las mismas props. El detalle se abre desde el buscador (`setDetailAccessory`/`setDetailInsurance`) y desde el modal de confirmación (los seguros).
- **z-index de los contextos que abren el detalle:** buscador z-[9999], modal de confirmación z-[101]. El detalle mobile usa z-[9998]/9999. Para desktop, el Modal NextUI debe quedar **por encima** de ambos.

## Arquitectura (idéntica en los 2 componentes)

Cada archivo (`AccesorioDetalleSheet.tsx`, `SeguroDetalleSheet.tsx`) queda así:

```
<Componente>(props)
  ├─ const isMobile = useIsMobile()
  ├─ const contenido = <ContenidoDetalle {...} />   // extraído, DRY
  ├─ if (isMobile):
  │     <>  backdrop motion.div (onClick=onCerrar) + sheet motion.div (contenido)  </>
  │     // (el caller ya lo envuelve en <AnimatePresence>)
  └─ else:
        <Modal isOpen onClose={onCerrar} placement="center" ...> <ModalContent>{contenido}</ModalContent> </Modal>
```

### Sub-componente de contenido (local a cada archivo)

Recibe las props + un flag `variant: 'modal' | 'drawer'` para el envoltorio del body:
- **Header:** botón "← Volver a la lista" (`onVolver`) + botón X (`onCerrar`). Igual en ambos.
- **Body:** foto/escudo + marca/proveedor + nombre + descripción/coberturas + precio. En drawer va dentro del `flex-1 overflow-y-auto`; en modal, dentro del scroll del `<Modal scrollBehavior="inside">`.
- **Footer:** botón "Agregar al pedido"/"Quitar" (`onAgregar`). Igual en ambos.

El look usa `OFERTA_COLORS` en ambas variantes — no cambia.

### Presentación desktop (Modal)

```tsx
<Modal
  isOpen
  onClose={onCerrar}
  placement="center"
  size="md"
  scrollBehavior="inside"
  hideCloseButton
  backdrop="opaque"
  classNames={{
    wrapper: 'z-[10001]',
    backdrop: 'z-[10000] bg-black/50',
    base: 'bg-white rounded-2xl overflow-hidden',
    body: 'bg-white p-0',
  }}
>
  <ModalContent>{contenido}</ModalContent>
</Modal>
```

z-[10000]/10001 → por encima del buscador (9999) y del modal de confirmación (101), para que el detalle desktop se vea sobre cualquier contexto que lo abrió.

## Se preserva

- **Props API idénticas** (`accesorio/seguro, agregado, onAgregar, onVolver, onCerrar`) → los callers NO cambian.
- **Navegación:** `onVolver` (volver a la lista) y `onCerrar` (cerrar todo) en ambas presentaciones. En desktop, "Volver a la lista" sigue teniendo sentido (regresa al buscador/modal que sigue detrás).
- **Drawer mobile idéntico:** mismo look, animación spring, 85dvh, safe-area.
- **Tema `OFERTA_COLORS`** (morado de la oferta).

## Qué NO cambia

- Los callers (`AccesoriosOfertaClient`).
- El contenido/copy del detalle.
- Los modales del flujo regular (no se tocan ni se reutilizan).
- El `AnimatePresence` del caller (envuelve solo la rama mobile; la rama modal no lo necesita).

## SSR / hidratación

`useIsMobile()` devuelve `false` en SSR y se corrige en cliente. El detalle solo tiene contenido cuando `detailAccessory`/`detailInsurance` está seteado (interacción del usuario, siempre en cliente), así que para cuando se abre, `isMobile` ya está resuelto — sin flash ni mismatch.

## Testing / verificación

- **tsc:** `npx tsc --noEmit` sin errores nuevos en los 2 componentes ni en el caller.
- **E2E manual mobile (<768px):** en complementos, "Ver detalle" de un accesorio → bottom sheet (como hoy); "Volver a la lista" regresa; X cierra.
- **E2E manual desktop (≥768px):** "Ver detalle" → **modal centrado** con el mismo contenido; "Volver a la lista" regresa al buscador/modal; X cierra.
- **Desde el modal de confirmación (seguros):** "Ver detalle" de un seguro → en desktop, modal centrado por encima del modal de confirmación; en mobile, drawer.
- **No-regresión:** el flujo de agregar/quitar desde el detalle sigue igual (mismo `onAgregar`).

## Constraints

- Español peruano.
- No builds pesados: `npx tsc --noEmit`, no `npm run build`.
- Rama `feature/bal-2212-oferta-ajustes-visuales-v2`.
- Local only para pruebas.
- Mantener el patrón de drawer existente en mobile (motion.div + 85dvh + safe-area), no inventar uno nuevo.

## Fuera de alcance

- Reutilizar/compartir código con los modales del flujo regular.
- Cambiar el contenido del detalle.
- Tocar los callers.
