# Complementos: recomendados horizontales + buscador solo-accesorios — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En complementos: "Recomendado para ti" muestra 4 accesorios en scroll horizontal con "Ver detalle" y badge; el botón pasa a "Ver más accesorios"; el buscador queda solo-accesorios (los seguros ya viven en el modal de confirmación).

**Architecture:** 3 archivos tocados. Task 1 agrega prop `badge?` a `AccesorioGridCard` (base para Task 2). Task 2 reescribe la sección de recomendados en `AccesoriosOfertaClient` (horizontal, reutiliza `AccesorioGridCard`), renombra el botón y quita props de seguros de la llamada al buscador. Task 3 limpia `BuscadorBottomSheet` (fuera pestañas + seguros).

**Tech Stack:** Next.js 16, React 19, TypeScript, framer-motion, lucide-react. Sin backend, sin tests unitarios (client components; se valida con tsc + E2E manual local).

## Global Constraints

- Español peruano, sin mexicanismos.
- No builds pesados: `npx tsc --noEmit`, NO `npm run build`.
- Rama `feature/bal-2212-oferta-ajustes-visuales-v2`.
- Local only para pruebas.
- Reutilizar componentes existentes; NO borrar `SeguroCard`, `SeguroDetalleSheet`, `AccesorioRecomendadoCard`.
- Los seguros permanecen en el modal de confirmación (`insuranceUpsellSlot`) — no se tocan.

---

### Task 1: Prop `badge` en `AccesorioGridCard`

**Files:**
- Modify: `src/app/prototipos/0.6/oferta/[token]/complementos/redesign/AccesorioGridCard.tsx`

**Interfaces:**
- Produce: `AccesorioGridCardProps` gana `badge?: string`. Cuando se pasa, la card pinta un pill (fondo `OFERTA_COLORS.primary`, texto blanco) sobre la esquina sup-izq de la foto.

- [ ] **Step 1: Agregar `badge?` a las props y pintarlo**

Reemplazar el bloque de la interfaz + firma + el `<div className="relative">` de la foto. La interfaz actual (líneas 18-23):

```typescript
export interface AccesorioGridCardProps {
  accesorio: Accessory;
  agregado: boolean;
  onToggle: () => void;
  onVerDetalle: () => void;
}

export function AccesorioGridCard({ accesorio, agregado, onToggle, onVerDetalle }: AccesorioGridCardProps) {
```

pasa a:

```typescript
export interface AccesorioGridCardProps {
  accesorio: Accessory;
  agregado: boolean;
  onToggle: () => void;
  onVerDetalle: () => void;
  /** Etiqueta destacada (pill) sobre la foto, ej. "Recomendado". Opcional. */
  badge?: string;
}

export function AccesorioGridCard({ accesorio, agregado, onToggle, onVerDetalle, badge }: AccesorioGridCardProps) {
```

Y dentro del `<div className="relative">` (justo después de que abre, antes del `<div className="flex h-[74px] ...">`), agregar el pill del badge:

```typescript
      <div className="relative">
        {badge ? (
          <span
            className="absolute left-1.5 top-1.5 z-10 rounded-full px-2 py-0.5 text-[9.5px] font-bold text-white"
            style={{ backgroundColor: OFERTA_COLORS.primary }}
          >
            {badge}
          </span>
        ) : null}
        <div
          className="flex h-[74px] w-full items-center justify-center rounded-xl border"
```

(El resto del componente no cambia.)

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit 2>&1 | grep -iE "AccesorioGridCard"`
Expected: sin salida.

- [ ] **Step 3: Commit**

```bash
git add "src/app/prototipos/0.6/oferta/[token]/complementos/redesign/AccesorioGridCard.tsx"
git commit -m "feat(oferta): AccesorioGridCard admite badge opcional (BAL-2212)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Recomendados horizontales + texto botón + buscador sin seguros (caller)

**Files:**
- Modify: `src/app/prototipos/0.6/oferta/[token]/complementos/AccesoriosOfertaClient.tsx`

**Interfaces:**
- Consume: `AccesorioGridCard` (con `badge` de Task 1); `setDetailAccessory`, `toggleAcc`, `selectedAcc`, `accessories`, `setShowBuscador` (ya en scope).
- Produce: nada nuevo.

- [ ] **Step 1: Importar `AccesorioGridCard`**

En el bloque de imports (después de la línea 40 `import { AccesorioRecomendadoCard } ...`), agregar:

```typescript
import { AccesorioGridCard } from './redesign/AccesorioGridCard';
```

(Se deja el import de `AccesorioRecomendadoCard` por ahora — se elimina en el Step 4 si queda sin uso.)

- [ ] **Step 2: Agregar la lista de recomendados (4 primeros)**

Junto a `const recomendado = accessories.length > 0 ? accessories[0] : null;` (línea 462), agregar debajo:

```typescript
  // Los 4 primeros accesorios como shortcut horizontal "Recomendado para ti".
  const recomendados = accessories.slice(0, 4);
```

(Se conserva `recomendado = accessories[0]` porque la exclusión de "Tus extras" — línea 468 — lo sigue usando sin cambios.)

- [ ] **Step 3: Reescribir la sección "Recomendado para ti" a horizontal**

Reemplazar el bloque actual (líneas 670-682):

```typescript
        {/* Recomendado para ti */}
        {recomendado ? (
          <div>
            <h2 className="mb-2.5 font-['Baloo_2',_sans-serif] text-[15px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
              Recomendado para ti
            </h2>
            <AccesorioRecomendadoCard
              accesorio={recomendado}
              seleccionado={selectedAcc.includes(recomendado.id)}
              onToggle={() => toggleAcc(recomendado)}
            />
          </div>
        ) : null}
```

por:

```typescript
        {/* Recomendado para ti: 4 primeros en scroll horizontal, cada uno con
            "Ver detalle" (abre el drawer). Badge "Recomendado" en el primero. */}
        {recomendados.length > 0 ? (
          <div>
            <h2 className="mb-2.5 font-['Baloo_2',_sans-serif] text-[15px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
              Recomendado para ti
            </h2>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
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
          </div>
        ) : null}
```

- [ ] **Step 4: Quitar el import de `AccesorioRecomendadoCard` si quedó sin uso**

Run: `grep -n "AccesorioRecomendadoCard" "src/app/prototipos/0.6/oferta/[token]/complementos/AccesoriosOfertaClient.tsx"`
Si solo aparece en la línea del import (y el comentario de cabecera), eliminar la línea `import { AccesorioRecomendadoCard } from './redesign/AccesorioRecomendadoCard';`. Si aparece en más sitios de JSX, dejarlo. (El componente `AccesorioRecomendadoCard.tsx` NO se borra — puede usarse en otro lado.)

- [ ] **Step 5: Renombrar el botón "Añadir uno más" → "Ver más accesorios"**

En el bloque del botón (líneas 687-696), cambiar solo el texto:

```typescript
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          Ver más accesorios
```

(El `onClick={() => setShowBuscador(true)}` y el estilo se mantienen.)

- [ ] **Step 6: Quitar los props de seguros de la llamada a `<BuscadorBottomSheet>`**

Reemplazar la llamada actual (líneas 723-737):

```typescript
          <BuscadorBottomSheet
            accesorios={accessories}
            seguros={insurances}
            seleccionadosAcc={selectedAcc}
            seleccionadosIns={selectedIns}
            onToggleAcc={toggleAcc}
            onToggleIns={toggleIns}
            onVerDetalle={(a) => setDetailAccessory(a)}
            onVerDetalleSeguro={(s) => setDetailInsurance(s)}
            total={totalMonthly}
            onCerrar={() => setShowBuscador(false)}
            onListo={() => setShowBuscador(false)}
            accFits={accFits}
            insFits={insFits}
          />
```

por (sin las 5 props de seguros):

```typescript
          <BuscadorBottomSheet
            accesorios={accessories}
            seleccionadosAcc={selectedAcc}
            onToggleAcc={toggleAcc}
            onVerDetalle={(a) => setDetailAccessory(a)}
            total={totalMonthly}
            onCerrar={() => setShowBuscador(false)}
            onListo={() => setShowBuscador(false)}
            accFits={accFits}
          />
```

- [ ] **Step 7: Verificar que compila**

Run: `npx tsc --noEmit 2>&1 | grep -iE "AccesoriosOfertaClient"`
Expected: puede aparecer un error TEMPORAL de que `BuscadorBottomSheet` aún exige props de seguros (se corrige en Task 3). Si el único error es ese (props faltantes en `BuscadorBottomSheet`), continuar; los demás errores (símbolos no usados, etc.) sí deben corregirse aquí. Nota: `setDetailInsurance`/`toggleIns`/`insFits`/`selectedIns`/`insurances` pueden seguir usándose en el resto del archivo (el modal de confirmación usa seguros) — NO eliminarlos.

- [ ] **Step 8: Commit**

```bash
git add "src/app/prototipos/0.6/oferta/[token]/complementos/AccesoriosOfertaClient.tsx"
git commit -m "feat(oferta): complementos — recomendados horizontales + botón/buscador solo accesorios (BAL-2212)

- 'Recomendado para ti': 4 primeros accesorios en scroll horizontal con
  AccesorioGridCard (Ver detalle → drawer), badge 'Recomendado' en el primero.
- Botón 'Añadir uno más' → 'Ver más accesorios'.
- Llamada a BuscadorBottomSheet sin props de seguros (el buscador queda
  solo-accesorios en Task 3). Los seguros siguen en el modal de confirmación.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

(Nota: si tsc marca solo el error de props de `BuscadorBottomSheet`, el commit se puede hacer igual porque Task 3 lo cierra; si se prefiere árbol siempre verde, hacer Task 2 y Task 3 y commitear juntos. El plan asume commits separados pero tsc totalmente verde recién tras Task 3.)

---

### Task 3: `BuscadorBottomSheet` solo-accesorios

**Files:**
- Modify: `src/app/prototipos/0.6/oferta/[token]/complementos/redesign/BuscadorBottomSheet.tsx`

**Interfaces:**
- Produce: `BuscadorBottomSheetProps` sin las props de seguros. Firma final: `accesorios, seleccionadosAcc, onToggleAcc, onVerDetalle, total, onCerrar, onListo, accFits`.

- [ ] **Step 1: Quitar props de seguros de la interfaz y la firma**

Interfaz actual (líneas 32-46) — quitar `seguros`, `seleccionadosIns`, `onToggleIns`, `onVerDetalleSeguro`, `insFits`. Queda:

```typescript
export interface BuscadorBottomSheetProps {
  accesorios: Accessory[];
  seleccionadosAcc: string[];
  onToggleAcc: (a: Accessory) => void;
  onVerDetalle: (a: Accessory) => void;
  total: number;
  onCerrar: () => void;
  onListo: () => void;
  accFits?: (a: Accessory) => boolean;
}
```

Y el destructuring de la función — quitar los mismos 5 nombres, dejando:

```typescript
export function BuscadorBottomSheet({
  accesorios,
  seleccionadosAcc,
  onToggleAcc,
  onVerDetalle,
  total,
  onCerrar,
  onListo,
  accFits,
}: BuscadorBottomSheetProps) {
```

- [ ] **Step 2: Quitar el estado `activeTab` y el useMemo `filteredSeguros`**

- Eliminar la línea `const [activeTab, setActiveTab] = useState<'acc' | 'ins'>('acc');` (línea 68).
- Eliminar el useMemo `filteredSeguros` completo (líneas 89-93):

```typescript
  const filteredSeguros = useMemo(() => {
    if (!query.trim()) return seguros;
    const q = query.toLowerCase().trim();
    return seguros.filter((p) => p.name.toLowerCase().includes(q));
  }, [seguros, query]);
```

- [ ] **Step 3: Quitar el filtro segmentado y la sección de seguros del JSX**

Eliminar el bloque del **filtro segmentado** (líneas 165-194, el `<div>` "Filtro segmentado Accesorios | Seguros" con los 2 botones).

Reemplazar el ternario `{activeTab === 'acc' ? (<>...</>) : (<div>...seguros...</div>)}` (líneas 196-294) por **solo la rama de accesorios sin el ternario**: dejar directamente el contenido que hoy está dentro de `activeTab === 'acc' ? (<> ... </>)`, es decir los chips de categoría + grid de accesorios. Concretamente, el bloque desde `{/* Chips de categoría */}` hasta el cierre del grid de accesorios (`No se encontraron accesorios.` + `</>`), sin el `activeTab === 'acc' ? (` de apertura ni el `) : ( <div>...seguros...</div> )` de cierre.

Resultado del cuerpo del scroll (`<div ref={sheetScrollRef} ...>`): buscador de texto → chips de categoría → grid de accesorios. Sin pestañas, sin sección de seguros.

- [ ] **Step 4: Ajustar el placeholder del input y limpiar imports**

- Cambiar el placeholder del input (línea 159) de `"Busca accesorios o seguros"` a `"Busca accesorios"`.
- Quitar imports que quedan sin uso: `ShieldCheck` de lucide (línea 23), `SeguroCard` (línea 29), y `InsurancePlan` del import de tipos (línea 27, dejar `Accessory, AccessoryCategory`).

- [ ] **Step 5: Verificar que compila (todo verde ahora)**

Run: `npx tsc --noEmit 2>&1 | grep -iE "BuscadorBottomSheet|AccesoriosOfertaClient|AccesorioGridCard"`
Expected: sin salida (0 errores en los 3 archivos).

- [ ] **Step 6: Verificar que no quedaron símbolos de seguros huérfanos en el buscador**

Run: `grep -nE "activeTab|filteredSeguros|SeguroCard|seleccionadosIns|onToggleIns|onVerDetalleSeguro|insFits|ShieldCheck" "src/app/prototipos/0.6/oferta/[token]/complementos/redesign/BuscadorBottomSheet.tsx"`
Expected: sin salida.

- [ ] **Step 7: Commit**

```bash
git add "src/app/prototipos/0.6/oferta/[token]/complementos/redesign/BuscadorBottomSheet.tsx"
git commit -m "feat(oferta): BuscadorBottomSheet solo-accesorios (sin seguros) (BAL-2212)

Quita el filtro segmentado Accesorios|Seguros, la sección de seguros
(SeguroCard/Insurama) y las props de seguros. El buscador queda solo con
accesorios (buscador de texto + chips de categoría + grid). Los seguros ya
viven en el modal de confirmación (insuranceUpsellSlot). SeguroCard y
SeguroDetalleSheet no se borran.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Verificación E2E (tras implementar, manual, local)

1. **Front (3001)** refrescado.
2. Complementos → "Recomendado para ti" muestra hasta 4 accesorios en **scroll horizontal**; el primero con badge "Recomendado".
3. "Ver detalle" en una card → abre el **drawer de detalle** del accesorio.
4. Toggle (+/check) agrega/quita; el agregado aparece en "Tus extras".
5. El botón dice **"Ver más accesorios"** → abre el buscador.
6. El buscador muestra **solo accesorios** (sin pestaña ni sección de seguros; placeholder "Busca accesorios").
7. "Continuar" → el modal de confirmación **sigue mostrando los seguros** ("Asegura tu inversión").

## Self-Review (hecho por el autor del plan)

- **Spec coverage:** (1) recomendados horizontales 4 + ver detalle + badge → Task 1 (badge) + Task 2 (Steps 2-3); (2) renombrar botón → Task 2 Step 5; (3) buscador solo-accesorios → Task 2 Step 6 (llamada) + Task 3 (componente). Los seguros en confirmación no se tocan ✓. Sin gaps.
- **Placeholder scan:** sin TBD/TODO; todo el código a cambiar está literal (copiado del código verificado).
- **Type consistency:** `badge?: string` en `AccesorioGridCardProps` (Task 1) se consume igual en Task 2. La firma final de `BuscadorBottomSheetProps` (Task 3) coincide con las props que Task 2 pasa (`accesorios, seleccionadosAcc, onToggleAcc, onVerDetalle, total, onCerrar, onListo, accFits`). `recomendados = accessories.slice(0,4)` y `recomendado = accessories[0]` coexisten sin colisión.
