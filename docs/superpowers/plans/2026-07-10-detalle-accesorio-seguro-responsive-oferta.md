# Detalle accesorio/seguro responsive en la oferta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El detalle de accesorio y de seguro en la oferta se ve como modal centrado en desktop y bottom sheet en mobile (hoy solo bottom sheet).

**Architecture:** 2 componentes (`AccesorioDetalleSheet`, `SeguroDetalleSheet`), patrón idéntico. En cada uno se extrae el contenido (header + body + footer) a un sub-componente local `*Contenido` con flag `variant`, y el componente principal bifurca por `useIsMobile()`: mobile → el bottom sheet actual (motion.div), desktop → `<Modal>` NextUI centrado. Callers no cambian (misma API de props).

**Tech Stack:** Next.js 16, React 19, TypeScript, NextUI 2.6, framer-motion, lucide-react. Sin tests unitarios (client components; tsc + E2E manual local).

## Global Constraints

- Español peruano.
- No builds pesados: `npx tsc --noEmit`, NO `npm run build`.
- Rama `feature/bal-2212-oferta-ajustes-visuales-v2`.
- Local only para pruebas.
- Props API idénticas (callers no cambian): `accesorio/seguro, agregado, onAgregar, onVolver, onCerrar`.
- Tema `OFERTA_COLORS` en ambas presentaciones.
- Mantener el drawer mobile actual (motion.div + 85dvh + safe-area).
- Modal desktop z-[10000]/10001 (sobre buscador z-9999 y modal de confirmación z-101).

---

### Task 1: `AccesorioDetalleSheet` responsive

**Files:**
- Modify: `src/app/prototipos/0.6/oferta/[token]/complementos/redesign/AccesorioDetalleSheet.tsx` (archivo completo).

**Interfaces:**
- Consume: `useIsMobile` de `@/app/prototipos/_shared`; `Modal, ModalContent` de `@nextui-org/react`; props actuales.
- Produce: firma pública sin cambios (`AccesorioDetalleSheetProps`).

- [ ] **Step 1: Actualizar imports**

Reemplazar los imports (líneas 15-19) por:

```typescript
import { ArrowLeft, Package, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal, ModalContent } from '@nextui-org/react';

import { useIsMobile } from '@/app/prototipos/_shared';
import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';
import type { Accessory } from '../../../../[landing]/solicitar/types/upsell';
```

- [ ] **Step 2: Reescribir el cuerpo del componente (extraer contenido + bifurcar)**

Reemplazar toda la función `AccesorioDetalleSheet` (desde `export function AccesorioDetalleSheet(...)` hasta su cierre) por:

```typescript
/** Contenido del detalle (header Volver/X + body foto/nombre/desc/precio +
 *  footer botón). Compartido entre drawer (mobile) y modal (desktop). */
function AccesorioDetalleContenido({
  accesorio,
  agregado,
  onAgregar,
  onVolver,
  onCerrar,
  bodyClassName,
}: AccesorioDetalleSheetProps & { bodyClassName: string }) {
  const cuotaFormateada = Math.round(accesorio.monthlyQuota).toLocaleString('es-PE');
  const plazo = accesorio.term ?? 24;
  return (
    <>
      {/* Header */}
      <div className="flex flex-none items-center justify-between px-5 pb-3 pt-4">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium"
          style={{ color: OFERTA_COLORS.textMid }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la lista
        </button>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
          style={{ backgroundColor: '#F1F2F7' }}
        >
          <X className="h-4 w-4" style={{ color: OFERTA_COLORS.textMid }} />
        </button>
      </div>

      <div className={bodyClassName}>
        {/* Foto grande */}
        <div
          className="flex h-[200px] w-full items-center justify-center rounded-xl border"
          style={{
            borderColor: OFERTA_COLORS.border,
            background: accesorio.image
              ? undefined
              : 'repeating-linear-gradient(135deg, #F1F2F7 0 10px, #E9EBF2 10px 20px)',
          }}
        >
          {accesorio.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={accesorio.image} alt={accesorio.name} className="h-full w-full rounded-xl object-contain" />
          ) : (
            <Package className="h-10 w-10" style={{ color: OFERTA_COLORS.textSoft }} />
          )}
        </div>

        {/* Marca + nombre */}
        {accesorio.brand?.name ? (
          <p className="mt-4 text-[10px] font-bold tracking-[.08em]" style={{ color: OFERTA_COLORS.textSoft }}>
            {accesorio.brand.name.toUpperCase()}
          </p>
        ) : null}
        <h3 className="mt-1 font-['Baloo_2',_sans-serif] text-[23px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
          {accesorio.name}
        </h3>

        {/* Descripción */}
        {accesorio.description ? (
          <p className="mt-2 text-[13.5px] leading-[1.5]" style={{ color: OFERTA_COLORS.textMid }}>
            {accesorio.description}
          </p>
        ) : null}

        {/* Precio grande */}
        <div className="mt-5 border-t pt-4" style={{ borderColor: OFERTA_COLORS.border }}>
          <div className="font-['Baloo_2',_sans-serif] text-[30px] font-extrabold" style={{ color: OFERTA_COLORS.primary }}>
            +S/{cuotaFormateada}/mes
          </div>
          <p className="mt-0.5 text-sm" style={{ color: OFERTA_COLORS.textSoft }}>
            en {plazo} meses
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none border-t bg-white px-5 py-4" style={{ borderColor: OFERTA_COLORS.border }}>
        <button
          type="button"
          onClick={onAgregar}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-4 font-['Baloo_2',_sans-serif] text-[16px] font-bold text-white transition-transform hover:brightness-95"
          style={{ backgroundColor: OFERTA_COLORS.primary }}
        >
          {agregado ? (
            'Quitar'
          ) : (
            <>
              <Plus className="h-4 w-4" strokeWidth={2.6} />
              Agregar al pedido
            </>
          )}
        </button>
      </div>
    </>
  );
}

export function AccesorioDetalleSheet(props: AccesorioDetalleSheetProps) {
  const { onCerrar } = props;
  const isMobile = useIsMobile();

  // DESKTOP: modal centrado (por encima del buscador/modal de confirmación).
  if (!isMobile) {
    return (
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
        <ModalContent>
          <AccesorioDetalleContenido {...props} bodyClassName="px-5 pb-5" />
        </ModalContent>
      </Modal>
    );
  }

  // MOBILE: bottom sheet (el caller ya lo envuelve en <AnimatePresence>).
  return (
    <>
      <motion.div
        key="detalle-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCerrar}
        className="fixed inset-0 z-[9998]"
        style={{ backgroundColor: 'rgba(24,26,42,.42)', touchAction: 'none' }}
      />
      <motion.div
        key="detalle-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] flex max-h-[85dvh] flex-col rounded-t-2xl bg-white"
        style={{ overscrollBehavior: 'contain', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <AccesorioDetalleContenido {...props} bodyClassName="flex-1 overflow-y-auto px-5 pb-28" />
      </motion.div>
    </>
  );
}
```

Notas:
- El `bodyClassName` diferencia el scroll: drawer usa `flex-1 overflow-y-auto px-5 pb-28`; modal usa `px-5 pb-5` (el `<Modal scrollBehavior="inside">` maneja el scroll).
- El header y footer son idénticos en ambas variantes (dentro de `*Contenido`).

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit 2>&1 | grep -iE "AccesorioDetalleSheet"`
Expected: sin salida.

- [ ] **Step 4: Commit**

```bash
git add "src/app/prototipos/0.6/oferta/[token]/complementos/redesign/AccesorioDetalleSheet.tsx"
git commit -m "feat(oferta): AccesorioDetalleSheet responsive — modal desktop / drawer mobile (BAL-2212)

Extrae el contenido a AccesorioDetalleContenido (variant vía bodyClassName) y
bifurca por useIsMobile: desktop → Modal NextUI centrado (z-10000/10001, sobre
buscador y modal de confirmación); mobile → el bottom sheet actual. Props,
navegación (onVolver/onCerrar) y tema OFERTA_COLORS intactos; callers sin cambios.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `SeguroDetalleSheet` responsive

**Files:**
- Modify: `src/app/prototipos/0.6/oferta/[token]/complementos/redesign/SeguroDetalleSheet.tsx` (archivo completo).

**Interfaces:**
- Consume: `useIsMobile`, `Modal, ModalContent`, props actuales, `CoverageItem`/`InsurancePlan`.
- Produce: firma pública sin cambios (`SeguroDetalleSheetProps`).

- [ ] **Step 1: Actualizar imports**

Reemplazar los imports (líneas 14-18) por:

```typescript
import { ArrowLeft, ShieldCheck, Plus, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal, ModalContent } from '@nextui-org/react';

import { useIsMobile } from '@/app/prototipos/_shared';
import { OFERTA_COLORS } from '../../components/redesign/ofertaTheme';
import type { InsurancePlan, CoverageItem } from '../../../../[landing]/solicitar/types/upsell';
```

- [ ] **Step 2: Reescribir el cuerpo del componente (extraer contenido + bifurcar)**

Reemplazar toda la función `SeguroDetalleSheet` por:

```typescript
/** Contenido del detalle del seguro (header + escudo/proveedor/nombre/desc/
 *  coberturas/exclusiones/precio + footer botón). Compartido drawer/modal. */
function SeguroDetalleContenido({
  seguro,
  agregado,
  onAgregar,
  onVolver,
  onCerrar,
  bodyClassName,
}: SeguroDetalleSheetProps & { bodyClassName: string }) {
  const cuotaFormateada = Math.round(seguro.monthlyPrice).toLocaleString('es-PE');
  const plazo = seguro.durationMonths ?? 24;
  return (
    <>
      {/* Header */}
      <div className="flex flex-none items-center justify-between px-5 pb-3 pt-4">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium"
          style={{ color: OFERTA_COLORS.textMid }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la lista
        </button>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
          style={{ backgroundColor: '#F1F2F7' }}
        >
          <X className="h-4 w-4" style={{ color: OFERTA_COLORS.textMid }} />
        </button>
      </div>

      <div className={bodyClassName}>
        {/* Ícono de escudo grande */}
        <div
          className="flex h-[120px] w-full items-center justify-center rounded-xl"
          style={{ backgroundColor: OFERTA_COLORS.lilac }}
        >
          <ShieldCheck className="h-14 w-14" strokeWidth={1.8} style={{ color: OFERTA_COLORS.primary }} />
        </div>

        {/* Proveedor + nombre */}
        {seguro.provider?.name ? (
          <p className="mt-4 text-[10px] font-bold tracking-[.08em]" style={{ color: OFERTA_COLORS.tealBrand }}>
            {seguro.provider.name.toUpperCase()}
          </p>
        ) : null}
        <h3 className="mt-1 font-['Baloo_2',_sans-serif] text-[23px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
          {seguro.name}
        </h3>

        {/* Descripción */}
        {seguro.description ? (
          <p className="mt-2 text-[13.5px] leading-[1.5]" style={{ color: OFERTA_COLORS.textMid }}>
            {seguro.description}
          </p>
        ) : null}

        {/* Coberturas */}
        {seguro.coverage && seguro.coverage.length > 0 ? (
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: OFERTA_COLORS.greenDark }}>
              Qué cubre
            </p>
            <ul className="mt-2 space-y-2">
              {seguro.coverage.map((item: CoverageItem, index: number) => (
                <li key={`${seguro.id}-detcov-${index}`} className="flex items-start gap-2 text-[13px]" style={{ color: '#4B5563' }}>
                  <Check className="mt-[2px] h-4 w-4 flex-none" strokeWidth={2.6} style={{ color: OFERTA_COLORS.greenDark }} />
                  <span>
                    <span className="font-semibold" style={{ color: OFERTA_COLORS.textStrong }}>{item.name}</span>
                    {item.description ? <span> — {item.description}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Exclusiones */}
        {seguro.exclusions && seguro.exclusions.length > 0 ? (
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: OFERTA_COLORS.textSoft }}>
              No incluye
            </p>
            <ul className="mt-2 space-y-1.5">
              {seguro.exclusions.map((ex, index) => (
                <li key={`${seguro.id}-exc-${index}`} className="flex items-start gap-2 text-[12.5px]" style={{ color: OFERTA_COLORS.textMid }}>
                  <X className="mt-[2px] h-3.5 w-3.5 flex-none" strokeWidth={2.6} style={{ color: OFERTA_COLORS.textSoft }} />
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Precio grande */}
        <div className="mt-5 border-t pt-4" style={{ borderColor: OFERTA_COLORS.border }}>
          <div className="font-['Baloo_2',_sans-serif] text-[30px] font-extrabold" style={{ color: OFERTA_COLORS.primary }}>
            +S/{cuotaFormateada}/mes
          </div>
          <p className="mt-0.5 text-sm" style={{ color: OFERTA_COLORS.textSoft }}>
            en {plazo} meses
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none border-t bg-white px-5 py-4" style={{ borderColor: OFERTA_COLORS.border }}>
        <button
          type="button"
          onClick={onAgregar}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-4 font-['Baloo_2',_sans-serif] text-[16px] font-bold text-white transition-transform hover:brightness-95"
          style={{ backgroundColor: OFERTA_COLORS.primary }}
        >
          {agregado ? (
            'Quitar'
          ) : (
            <>
              <Plus className="h-4 w-4" strokeWidth={2.6} />
              Agregar al pedido
            </>
          )}
        </button>
      </div>
    </>
  );
}

export function SeguroDetalleSheet(props: SeguroDetalleSheetProps) {
  const { onCerrar } = props;
  const isMobile = useIsMobile();

  // DESKTOP: modal centrado.
  if (!isMobile) {
    return (
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
        <ModalContent>
          <SeguroDetalleContenido {...props} bodyClassName="px-5 pb-5" />
        </ModalContent>
      </Modal>
    );
  }

  // MOBILE: bottom sheet.
  return (
    <>
      <motion.div
        key="seguro-detalle-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCerrar}
        className="fixed inset-0 z-[9998]"
        style={{ backgroundColor: 'rgba(24,26,42,.42)', touchAction: 'none' }}
      />
      <motion.div
        key="seguro-detalle-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] flex max-h-[85dvh] flex-col rounded-t-2xl bg-white"
        style={{ overscrollBehavior: 'contain', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <SeguroDetalleContenido {...props} bodyClassName="flex-1 overflow-y-auto px-5 pb-28" />
      </motion.div>
    </>
  );
}
```

(La interfaz `SeguroDetalleSheetProps` de arriba del archivo — líneas ~20-27 — no cambia.)

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit 2>&1 | grep -iE "SeguroDetalleSheet"`
Expected: sin salida.

- [ ] **Step 4: Commit**

```bash
git add "src/app/prototipos/0.6/oferta/[token]/complementos/redesign/SeguroDetalleSheet.tsx"
git commit -m "feat(oferta): SeguroDetalleSheet responsive — modal desktop / drawer mobile (BAL-2212)

Mismo patrón que AccesorioDetalleSheet: contenido extraído a SeguroDetalleContenido
(variant vía bodyClassName), bifurca por useIsMobile → Modal NextUI centrado en
desktop (z-10000/10001) / bottom sheet en mobile. Props, navegación y tema intactos.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Verificación E2E (tras ambos, manual, local)

1. Front (3001) refrescado.
2. **Desktop (≥768px):** complementos → "Ver detalle" de un accesorio → **modal centrado**; "Volver a la lista" regresa; X cierra. Ídem un seguro (desde el buscador y desde el modal de confirmación).
3. **Mobile (<768px):** "Ver detalle" → bottom sheet (como hoy); drag/backdrop/X funcionan.
4. **Agregar/quitar desde el detalle** funciona igual en ambas presentaciones (`onAgregar`).
5. **z-index:** el detalle desktop se ve por encima del buscador y del modal de confirmación.

## Self-Review (hecho por el autor del plan)

- **Spec coverage:** responsive accesorio → Task 1; responsive seguro → Task 2; extracción de contenido DRY → ambos Step 2; props/callers intactos → ambos (firma pública sin cambios); z-index → classNames del Modal; tema/navegación preservados → contenido usa OFERTA_COLORS + onVolver/onCerrar. Sin gaps.
- **Placeholder scan:** sin TBD/TODO; todo el JSX es literal (copiado del código verificado).
- **Type consistency:** `AccesorioDetalleSheetProps`/`SeguroDetalleSheetProps` sin cambios; `*Contenido` extiende con `bodyClassName: string`. `useIsMobile(): boolean`. `CoverageItem`/`InsurancePlan`/`Accessory` de `types/upsell` (ya importados). Modal/ModalContent de NextUI.
