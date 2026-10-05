# Complementos: recomendados horizontales + buscador solo-accesorios — Diseño (spec)

**Fecha:** 2026-07-10 · **Autor:** Emilio + Claude · **Ticket:** BAL-2212 (feedback reunión Marco) · **Alcance:** página de complementos del flujo de oferta (Caso 4/5).

## Objetivo

Tres ajustes en la página de complementos (`AccesoriosOfertaClient`):
1. **"Recomendado para ti":** pasar de 1 card grande a los **4 primeros accesorios** en **scroll horizontal**, cada uno con "Ver detalle" (abre el drawer existente) y un badge "Recomendado" en el primero.
2. **Botón "Añadir uno más":** renombrar a **"Ver más accesorios"** (dejar claro que es solo accesorios).
3. **Buscador (`BuscadorBottomSheet`):** quitar los seguros (hoy filtro segmentado Accesorios|Seguros) → **solo accesorios**.

**Contexto que cierra el diseño:** los seguros YA están en el modal de confirmación (`insuranceUpsellSlot` "Asegura tu inversión", `AccesoriosOfertaClient.tsx:499-513`). Por eso quitarlos del buscador no los deja huérfanos — evita duplicarlos.

## Contexto verificado (file:line)

- **`AccesoriosOfertaClient.tsx`:**
  - `recomendado = accessories[0]` (línea 462); se muestra con `<AccesorioRecomendadoCard>` (líneas 670-682).
  - "Tus extras" (`extrasItems`, línea 466) **excluye** el `recomendado` (línea 468: `a.id !== recomendado?.id`).
  - Botón "Añadir uno más" (líneas 687-696) → `setShowBuscador(true)`.
  - `<BuscadorBottomSheet>` (línea 723) recibe props de accesorios **y de seguros** (`seguros`, `seleccionadosIns`, `onToggleIns`, `onVerDetalleSeguro`, `insFits`).
  - `setDetailAccessory(a)` abre el `<AccesorioDetalleSheet>` (drawer de detalle existente, líneas ~727-736).
  - Imports ya presentes: `AccesorioRecomendadoCard`, `BuscadorBottomSheet`, `AccesorioDetalleSheet`. Falta importar `AccesorioGridCard`.
- **`AccesorioGridCard.tsx`** (reutilizable): card con foto + botón toggle (+/check, top-right) + nombre + `+S/X/mes` + link "Ver detalle". Props: `accesorio, agregado, onToggle, onVerDetalle`. **No tiene badge.**
- **`BuscadorBottomSheet.tsx`:** tiene filtro segmentado `activeTab: 'acc'|'ins'` (línea 68), grid de accesorios (`AccesorioGridCard`) y sección de seguros (`SeguroCard` + badge Insurama). Props incluyen las de seguros.
- **`AccesorioDetalleSheet.tsx`, `SeguroCard.tsx`, `SeguroDetalleSheet.tsx`:** NO se borran (se usan en otros lados / siguen para el detalle de seguro). Solo se dejan de usar en el buscador.

## Cambio 1: "Recomendado para ti" horizontal (4 accesorios)

- `recomendados = accessories.slice(0, 4)` (nueva variable; se conserva `recomendado = accessories[0]` para la exclusión de "Tus extras" y la lógica actual).
- Render: reemplazar el `<AccesorioRecomendadoCard>` por un **carrusel horizontal**:
  ```
  <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
    {recomendados.map((a, i) => (
      <div key={a.id} className="w-[150px] flex-none">
        <AccesorioGridCard
          accesorio={a}
          agregado={selectedAcc.includes(a.id)}
          onToggle={() => toggleAcc(a)}
          onVerDetalle={() => setDetailAccessory(a)}
          badge={i === 0 ? 'Recomendado' : undefined}
        />
      </div>
    ))}
  </div>
  ```
- **Badge "Recomendado":** se agrega prop opcional `badge?: string` a `AccesorioGridCard`; si viene, pinta un pill pequeño (fondo primary, texto blanco) en la esquina sup-izq de la foto. Solo el primero (`i===0`) lo recibe.
- **"Ver detalle"** ya está en `AccesorioGridCard` → cableado a `setDetailAccessory(a)` (abre el `AccesorioDetalleSheet` que ya existe).
- **"Tus extras" y exclusión:** se mantiene la exclusión SOLO del `recomendado` (`accessories[0]`), como hoy — los otros 3 recomendados, si se agregan, aparecen normal en "Tus extras". (Decisión: los recomendados son un shortcut visual; no se excluyen los 4 de "Tus extras", solo el primero como ya era, para no cambiar la lógica actual de conteo.)
- Se **elimina** el uso de `<AccesorioRecomendadoCard>` (y su import) del caller; el componente en sí no se borra (por si se usa en otro lado — verificar en el plan; si no, se puede borrar).

## Cambio 2: Botón "Añadir uno más" → "Ver más accesorios"

- Cambiar el texto del botón (líneas 687-696) de `Añadir uno más` a `Ver más accesorios`. El ícono `Plus` y el `onClick={() => setShowBuscador(true)}` se mantienen.

## Cambio 3: Buscador solo-accesorios

En **`BuscadorBottomSheet.tsx`:**
- Quitar el estado `activeTab` y el **filtro segmentado "Accesorios | Seguros"**.
- Quitar la **sección de seguros** (grid de `SeguroCard`, badge Insurama, título "Seguros").
- Quitar del `props` de seguros: `seguros`, `seleccionadosIns`, `onToggleIns`, `onVerDetalleSeguro`, `insFits`. Quitar imports de `SeguroCard` y del tipo `InsurancePlan` si quedan sin uso.
- Ajustar el título/copy del sheet a solo-accesorios (ej. "Añadir accesorios").
- Dejar: buscador de texto + chips de categoría + grid de `AccesorioGridCard`.

En **`AccesoriosOfertaClient.tsx`** (llamada a `<BuscadorBottomSheet>`, línea 723):
- Quitar los props de seguros de la llamada (`seguros`, `seleccionadosIns`, `onToggleIns`, `onVerDetalleSeguro`, `insFits`).

**Los seguros permanecen** en el modal de confirmación (`insuranceUpsellSlot`) — sin cambios ahí.

## Archivos tocados

- `AccesoriosOfertaClient.tsx` — sección recomendados (horizontal), texto botón, llamada al buscador sin props de seguros, import de `AccesorioGridCard`.
- `BuscadorBottomSheet.tsx` — quitar pestañas + sección seguros + props de seguros.
- `AccesorioGridCard.tsx` — agregar prop opcional `badge?: string`.

## Qué NO cambia

- El modal de confirmación y su `insuranceUpsellSlot` (los seguros siguen ahí).
- `AccesorioDetalleSheet`, `SeguroCard`, `SeguroDetalleSheet` (no se borran).
- La lógica de selección/fetch/pricing (`toggleAcc`, `accFits`, `selectEquipment`, plazo/inicial).
- El drawer de detalle de accesorio (ya se abre con `setDetailAccessory`).

## Error handling

Sin cambios: la selección y el fetch los maneja el caller; los componentes son presentacionales.

## Testing / verificación

- **tsc:** `npx tsc --noEmit` sin errores nuevos en los 3 archivos ni en imports afectados.
- **E2E manual (local, mobile):**
  - Complementos → sección "Recomendado para ti" muestra hasta 4 accesorios en scroll horizontal; el primero con badge "Recomendado".
  - "Ver detalle" en una card → abre el drawer de detalle del accesorio.
  - Toggle (+/check) agrega/quita; el agregado aparece en "Tus extras".
  - Botón dice "Ver más accesorios" → abre el buscador.
  - El buscador muestra **solo accesorios** (sin pestaña ni sección de seguros).
  - El modal de confirmación sigue mostrando los seguros ("Asegura tu inversión").

## Constraints

- Español peruano, sin mexicanismos.
- No builds pesados: `npx tsc --noEmit`, no `npm run build`.
- Rama `feature/bal-2212-oferta-ajustes-visuales-v2`.
- Local only para pruebas.
- Reutilizar componentes existentes (`AccesorioGridCard`, `AccesorioDetalleSheet`), no crear nuevos salvo el badge.

## Fuera de alcance

- El paso de seguros como 2 cards 300×300 en confirmación (otro punto de la reunión; los seguros ya están en el modal como `insuranceUpsellSlot`).
- Cambiar el diseño del detalle de accesorio.
- Borrar `AccesorioRecomendadoCard`/`SeguroCard`/`SeguroDetalleSheet` (solo se dejan de usar donde aplique).
