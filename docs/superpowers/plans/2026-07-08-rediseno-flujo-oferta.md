# Rediseño del flujo de oferta — Plan de implementación (BAL-2183)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Solo frontend (baldecash), rama `feat/rediseno-flujo-oferta`. Verificar tsc + E2E local con oferta real. No builds pesados (tsc, no `npm run build`). Español latino. Spec: `docs/superpowers/specs/2026-07-08-rediseno-flujo-oferta-design.md`.

**Goal:** Rediseñar visualmente las 3 pantallas del flujo de oferta (index, accesorios/seguros, confirmación) según los mocks de Claude Design, SIN cambiar funcionalidad ni backend.

**Architecture:** Reemplazo de componentes React en `oferta/[token]/`. Los datos vienen de los endpoints existentes (`getOffer`, `getOfferAddonsRich`, `select_equipment`), que ya exponen todo lo necesario. Se agrega la fuente Asap y un set de componentes visuales nuevos que consumen la misma lógica actual.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind 4, lucide-react. TypeScript.

## Global Constraints
- Solo `baldecash/src/app/prototipos/0.6/oferta/[token]/`. NO tocar backend, catálogo general, ni detalle de producto.
- Sistema visual EXACTO de los mocks: Baloo 2 + Asap, índigo `#4F46E5`, verde `#22C55E`/`#16A34A`, teal `#12B3A6`, lila `#EEF1FF`, gris `#F7F8FB`, verde suave `#E8F8EF`, ámbar `#FEF3E2`, bordes `#E7E9F0`. Cards radius 16-40px, bottom sheets, cuota sticky, mobile-first 390px, sin tabs.
- Español latino con tildes. Iconos lucide-react o SVG inline. NO emojis.
- `npx tsc --noEmit` verde antes de cerrar cada fase (NO `npm run build`).
- La lógica de negocio (selección, cálculo, sync, combo gratis, recomendado) NO cambia — solo se re-presenta.
- Los datos ya existen: `getOffer` (recommended/exclusiveOffer/requestedProduct/clientName/maxMonthlyQuota/offerCase/previous), `getOfferAddonsRich` (accessories con description/brand/category/image/isRecommended, insurances con coverage, comboFreeAddons, remaining, equipoMonthly), `select_equipment`.

---

## FASE 1 — Fundaciones visuales + Index

### Task 1: Fundaciones — fuente Asap + tokens de color
**Files:**
- Modify: `baldecash/src/app/prototipos/0.6/oferta/[token]/layout.tsx` (cargar Asap)
- Create: `baldecash/src/app/prototipos/0.6/oferta/[token]/components/ofertaTheme.ts` (constantes de color/estilo compartidas)

**Interfaces:**
- Produces: `OFERTA_COLORS` (índigo, verde, teal, fondos...), y la fuente Asap disponible en el flujo de oferta.

- [ ] **Step 1:** Agregar Asap a `layout.tsx` del flujo de oferta (Google Fonts `next/font/google` o `<link>`), junto a Baloo 2 que ya se usa. Verificar cómo se carga Baloo 2 hoy y seguir el mismo patrón.
- [ ] **Step 2:** Crear `ofertaTheme.ts` con las constantes de color del spec (exportar un objeto `OFERTA_COLORS`). Esto centraliza los hex para que los componentes no los hardcodeen sueltos.
- [ ] **Step 3:** `npx tsc --noEmit` — sin errores nuevos.
- [ ] **Step 4:** Commit — `feat(oferta): fuente Asap + tokens de color del rediseño (BAL-2183)`

### Task 2: Componentes base del index (header, monto, badges)
**Files:**
- Create: `.../components/redesign/OfertaHeader.tsx` (logo bicolor), `MontoHero.tsx`, `BadgeAprobada.tsx`, `PruebaSocial.tsx`
- Test: `tsc`

**Interfaces:**
- Produces: `<OfertaHeader/>`, `<MontoHero monto={number} />`, `<BadgeAprobada/>`, `<PruebaSocial/>`. Componentes presentacionales puros (props → UI), sin lógica.

- [ ] **Step 1:** Crear los 4 componentes según el mock (logo `Balde`+`Cash` bicolor, monto héroe lila con Baloo 2, badge verde "Aprobada", chip prueba social). Copiar los estilos exactos del HTML del mock (colores, radios, tamaños).
- [ ] **Step 2:** `npx tsc --noEmit`.
- [ ] **Step 3:** Commit — `feat(oferta): componentes base del index rediseñado (header, monto, badges) (BAL-2183)`

### Task 3: Cards de acción del index (Caso 4 y Caso 5)
**Files:**
- Create: `.../components/redesign/EquipoRecomendadoCard.tsx` (card verde destacada), `OpcionBarra.tsx` (barra de acción), `AvisoDowngrade.tsx` (ámbar Caso 4)
- Test: `tsc`

**Interfaces:**
- Consumes: `OFERTA_COLORS` (Task 1).
- Produces: `<EquipoRecomendadoCard equipo tone="verde|indigo" onElegir />`, `<OpcionBarra icono titulo subtitulo cuota onClick />`, `<AvisoDowngrade equipoPedido />`.

- [ ] **Step 1:** `EquipoRecomendadoCard` — card destacada con badge ("APROBADO PARA TI" verde para Caso 4 / "Aprovecha tu monto" índigo para Caso 5), specs en chips, cuota grande, botón. Props para el color (verde downgrade / índigo upsell).
- [ ] **Step 2:** `OpcionBarra` — barra horizontal (icono + título + subtítulo + cuota + chevron). Para "continuar con mi equipo", "cambiar equipo", etc.
- [ ] **Step 3:** `AvisoDowngrade` — caja ámbar con el mensaje empático (Caso 4).
- [ ] **Step 4:** `npx tsc --noEmit`.
- [ ] **Step 5:** Commit — `feat(oferta): cards de acción del index (recomendado, barras, aviso downgrade) (BAL-2183)`

### Task 4: Ensamblar el nuevo index en MiOfertaClient
**Files:**
- Modify: `.../MiOfertaClient.tsx` (reemplazar el render por el nuevo layout)
- Modify/Remove: `.../components/TuOfertaTab.tsx`, `UpsellPortada.tsx`, `OfertaBannerAprobada.tsx` (según lo que reemplace)
- Modify: `.../components/CatalogoOfertaTab.tsx` (quitar botón ayuda) y `useOfferTour.ts` (quitar tour/modal "eres nuevo")

**Interfaces:**
- Consumes: todos los componentes de Tasks 2-3. Datos de `getOffer(token)` (ya existentes).

- [ ] **Step 1:** En `MiOfertaClient.tsx`, reemplazar el layout de tabs por la pantalla scrolleable: header + saludo + badge + monto héroe + copy cálido + prueba social + acciones según `offerCase`.
- [ ] **Step 2:** Caso 4 (`offerCase === 'downgrade'`): AvisoDowngrade + EquipoRecomendadoCard(verde) + barra "Ver otros equipos". Usa `recommended`/`requestedProduct` del offer.
- [ ] **Step 3:** Caso 5 (`offerCase === 'upsell'`): EquipoRecomendadoCard(índigo, `exclusiveOffer`) + separador + OpcionBarra "Continuar con mi equipo" (`handleContinuarMiEquipo` existente) + "Ver catálogo". Reutiliza los handlers actuales (`handleAceptarExclusiva`, `handleContinuarMiEquipo`, `handleSelect`).
- [ ] **Step 4:** Quitar del catálogo de la oferta: el botón "¿Necesitas ayuda?" (`isHelpOpen`/`onboarding-oferta-help` en `CatalogoOfertaTab.tsx`) y el tour/modal "eres nuevo" (`useOfferTour`). Eliminar el hook y sus usos; limpiar imports.
- [ ] **Step 5:** `npx tsc --noEmit`. Verificar que los handlers de selección siguen conectados (no romper la lógica).
- [ ] **Step 6:** Commit — `feat(oferta): index rediseñado (Caso 4/5) + quita ayuda y tour del catálogo oferta (BAL-2183)`

### Task 5: E2E Fase 1 (index)
- [ ] Levantar ws2 local (con código de main, que tiene BAL-2180) + frontend apuntando ahí.
- [ ] Emitir oferta Caso 4 con `recommended_product_id` → abrir el link → verificar: monto héroe, aviso downgrade, card recomendado (= el del nodo), "ver otros", sin botón ayuda, sin modal "eres nuevo".
- [ ] Emitir oferta Caso 5 → verificar: equipo mejor destacado, "continuar con mi equipo" visible, "ver catálogo".
- [ ] Verificar que elegir equipo desde el index sigue funcionando (consume link, navega a accesorios).
- [ ] Screenshots o verificación manual. tsc verde. Commit si hay ajustes.

---

## FASE 2 — Accesorios y Seguros

### Task 6: Componentes base de accesorios (layout, equipo, cuota sticky, gratis)
**Files:**
- Create: `.../accesorios/redesign/AccesoriosLayout.tsx`, `TuEquipoCard.tsx`, `CuotaStickyBar.tsx`, `IncluidosGratisSection.tsx`
- Test: `tsc`

**Interfaces:**
- Produces: `<CuotaStickyBar total onContinuar label />`, `<IncluidosGratisSection items />` (items del combo, marcados Gratis, no removibles), `<TuEquipoCard equipo cuota />`.

- [ ] **Step 1:** `CuotaStickyBar` — barra inferior fija con "Cuota mensual total S/X/mes" + botón. Estilos del mock.
- [ ] **Step 2:** `IncluidosGratisSection` — sección "Incluidos gratis" (arriba) con los `comboFreeAddons`, ícono regalo, "Gratis", sin botón quitar.
- [ ] **Step 3:** `TuEquipoCard` — card "TU EQUIPO" con nombre + cuota.
- [ ] **Step 4:** `npx tsc --noEmit`. Commit — `feat(oferta): base de accesorios (equipo, cuota sticky, incluidos gratis) (BAL-2183)`

### Task 7: Recomendado + tus extras + card de accesorio/seguro
**Files:**
- Create: `.../accesorios/redesign/AccesorioRecomendadoCard.tsx`, `TusExtras.tsx`, `AccesorioGridCard.tsx`, `SeguroCard.tsx`
- Test: `tsc`

**Interfaces:**
- Consumes: `accessories[]`/`insurances[]` de `getOfferAddonsRich` (ya existentes).
- Produces: `<AccesorioRecomendadoCard accesorio seleccionado onToggle />`, `<TusExtras items onQuitar />`, `<AccesorioGridCard .../>`, `<SeguroCard seguro coverage seleccionado onToggle />`.

- [ ] **Step 1:** `AccesorioRecomendadoCard` — el `accessories[0]` (primer item = recomendado), card grande, radio/check.
- [ ] **Step 2:** `TusExtras` — lista de seleccionados con botón quitar (X).
- [ ] **Step 3:** `AccesorioGridCard` — card de grid (foto, nombre, cuota, +/check, "ver detalle").
- [ ] **Step 4:** `SeguroCard` — card de seguro con coberturas (viñetas verdes desde `coverage`), badge Insurama.
- [ ] **Step 5:** `npx tsc --noEmit`. Commit — `feat(oferta): recomendado, tus extras, cards de accesorio/seguro (BAL-2183)`

### Task 8: Bottom sheet buscador + detalle de accesorio
**Files:**
- Create: `.../accesorios/redesign/BuscadorBottomSheet.tsx`, `AccesorioDetalleSheet.tsx`
- Test: `tsc`

**Interfaces:**
- Consumes: `accessories[]` con `category`/`brand`/`description`.
- Produces: `<BuscadorBottomSheet accesorios seguros onAgregar onVerDetalle />` (chips categoría + búsqueda de texto + grid 2-col), `<AccesorioDetalleSheet accesorio onAgregar onVolver />`.

- [ ] **Step 1:** `BuscadorBottomSheet` — hoja inferior con backdrop, buscador de texto (filtra por nombre), chips de categoría (derivados de `accessory.category`, "Todos" + únicos), grid 2-col de `AccesorioGridCard`, sección Seguros, cuota sticky + "Listo".
- [ ] **Step 2:** `AccesorioDetalleSheet` — hoja con foto grande, marca, nombre, descripción larga, precio, "Agregar al pedido".
- [ ] **Step 3:** `npx tsc --noEmit`. Commit — `feat(oferta): bottom sheet buscador + detalle de accesorio (BAL-2183)`

### Task 9: Ensamblar accesorios en AccesoriosOfertaClient
**Files:**
- Modify: `.../accesorios/AccesoriosOfertaClient.tsx` (reemplazar el render por el nuevo layout)
- Modify/Remove: `.../components/OfertaAddonsSelector.tsx` (según reemplace)

**Interfaces:**
- Consumes: componentes de Tasks 6-8. Lógica actual (`getOfferAddonsRich`, `selectEquipment`, `selectedAcc`/`selectedIns`, `totalMonthly`, `comboFree`) — NO cambia.

- [ ] **Step 1:** Reemplazar el layout de `AccesoriosOfertaClient` por: top bar + título + TuEquipoCard + IncluidosGratisSection (comboFree) + AccesorioRecomendadoCard + TusExtras + "Añadir uno más" (abre BuscadorBottomSheet) + CuotaStickyBar.
- [ ] **Step 2:** Conectar el buscador y el detalle a la lógica existente de agregar/quitar (`selectedAcc`/`selectedIns`, recálculo de `totalMonthly`). NO cambiar la lógica — solo la UI la dispara.
- [ ] **Step 3:** `npx tsc --noEmit`. Verificar que el threshold de cuota y el recálculo siguen funcionando.
- [ ] **Step 4:** Commit — `feat(oferta): pantalla de accesorios rediseñada (BAL-2183)`

### Task 10: E2E Fase 2 (accesorios)
- [ ] Emitir oferta, elegir equipo (combo con gratis), llegar a accesorios.
- [ ] Verificar: TU EQUIPO, sección "Incluidos gratis" (combo), recomendado (primer item), buscador con categorías + grid, detalle de accesorio, cuota sticky recalcula al agregar/quitar.
- [ ] Regresión: el threshold "solo lo que entra en tu cuota" funciona; confirmar sigue navegando a confirmación.
- [ ] tsc verde. Commit si hay ajustes.

---

## FASE 3 — Confirmación

### Task 11: Modales de confirmación (preconfirmación + éxito)
**Files:**
- Modify/Create: `.../components/redesign/ConfirmarModal.tsx`, `ExitoModal.tsx`
- (Reemplazan `ConfirmarEleccionModal.tsx`)
- Test: `tsc`

**Interfaces:**
- Consumes: el equipo elegido + `comboFreeAddons` + cuota total (ya disponibles en el flujo).
- Produces: `<ConfirmarModal equipo cuota regalos onConfirmar onCancelar />`, `<ExitoModal equipo cuota regalos onContinuar />`.

- [ ] **Step 1:** `ConfirmarModal` — bottom sheet: header índigo, equipo, cuota, caja verde "REGALO POR TU COMBO" (regalos), cuota total, aviso verde, botones Cancelar/"Sí, elegir".
- [ ] **Step 2:** `ExitoModal` — bottom sheet: check verde, "¡Listo!", card equipo, caja regalo, cuota total, aviso WhatsApp, botón verde "Continuar".
- [ ] **Step 3:** `npx tsc --noEmit`. Commit — `feat(oferta): modales de confirmación rediseñados (BAL-2183)`

### Task 12: Página de estado (¡Felicidades! + comparación)
**Files:**
- Modify: `.../components/SeleccionConfirmada.tsx` (rediseño)
- Test: `tsc`

**Interfaces:**
- Consumes: `chosen` (equipo, previous, accessories/insurances con includedFree, cuota) — ya existente.

- [ ] **Step 1:** Rediseñar `SeleccionConfirmada` según el mock: "¡Felicidades, [nombre]!" + check, comparación anterior→nuevo (viejo tachado → nuevo verde), "TU PEDIDO INCLUYE" (equipo + gratis del combo marcados + cuota total), aviso WhatsApp.
- [ ] **Step 2:** Reusar el orden "gratis primero" que ya existe (BAL-2162). NO cambiar la lógica de `chosen`.
- [ ] **Step 3:** `npx tsc --noEmit`. Commit — `feat(oferta): página de estado (confirmación) rediseñada (BAL-2183)`

### Task 13: Ensamblar confirmación + E2E Fase 3
**Files:**
- Modify: `.../MiOfertaClient.tsx` / `AccesoriosOfertaClient.tsx` (usar los modales nuevos)

- [ ] **Step 1:** Conectar `ConfirmarModal`/`ExitoModal` en el punto de confirmación (donde hoy se usa `ConfirmarEleccionModal`). Reusar `confirmSelect`/`selectEquipment` existentes.
- [ ] **Step 2:** E2E: flujo completo Caso 4 y Caso 5 — index → elegir → accesorios → confirmar (modal) → éxito → refrescar (página estado con comparación). Verificar regalos del combo en modal y estado.
- [ ] **Step 3:** `npx tsc --noEmit`. Commit — `feat(oferta): confirmación ensamblada + E2E flujo completo (BAL-2183)`

---

## Cierre
- E2E de las 3 fases en verde → verificación visual completa (navegador) del flujo Caso 4 y Caso 5.
- Con OK de Emilio: push rama + merge a main + deploy. Actualizar BAL-2183.

## Criterios de aceptación (global)
1. ✅ Index rediseñado (Caso 4 y Caso 5) con monto héroe, recomendado, sin ayuda/tour.
2. ✅ Accesorios rediseñado: incluidos gratis, recomendado, buscador+grid+detalle, cuota sticky.
3. ✅ Confirmación rediseñada: preconfirmación, éxito, estado con comparación.
4. ✅ Funcionalidad idéntica: selección, cálculo, sync legacy, combo gratis, confirmación WhatsApp.
5. ✅ Backend, catálogo general y detalle NO tocados.
6. ✅ tsc verde en las 3 fases. Sistema visual fiel a los mocks.
