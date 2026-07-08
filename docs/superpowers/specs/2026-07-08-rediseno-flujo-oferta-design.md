# Rediseño del flujo de oferta — Diseño (spec)

**Fecha:** 2026-07-08 · **Fuente de diseño:** Claude Design, proyecto `d8552890` (3 archivos: Pantalla Principal, Accesorios y Seguros, Confirmación).

## Objetivo
Rediseñar visualmente las 3 pantallas del flujo de oferta condicional (Caso 4 downgrade / Caso 5 upsell) que ve el estudiante tras recibir su link por WhatsApp: **index**, **accesorios/seguros**, **confirmación**. **La funcionalidad NO cambia** — solo el aspecto visual y la disposición. El backend NO se toca (todos los endpoints ya exponen los datos necesarios).

## Principio rector
**Mismo comportamiento, nueva cara.** Reemplazamos componentes visuales de React; la lógica (selección, cálculo de cuota, sync a legacy, combo gratis, recomendado del nodo, confirmación por WhatsApp) permanece idéntica.

## Alcance
- **SÍ se toca:** `baldecash/src/app/prototipos/0.6/oferta/[token]/` (index, accesorios, confirmación, y el catálogo DE LA OFERTA).
- **NO se toca:** catálogo general (`[landing]/catalogo/`), detalle de producto, backend (ws2).
- **Fases:** una sola rama `feat/rediseno-flujo-oferta`, implementado en 3 fases (index → accesorios → confirmación). Cada fase testeable de forma independiente.

## Sistema visual (design tokens de los mocks)
- **Tipografía:** `Baloo 2` (títulos/montos, weights 500-800) + `Asap` (texto, weights 400-700). Asap es NUEVA — hay que agregarla (Google Fonts o self-host).
- **Colores:**
  - Primario índigo `#4F46E5` (montos, CTAs, seleccionado)
  - Verde aprobación `#22C55E` / `#16A34A` (badge Aprobada, card destacada, éxito, "incluido gratis")
  - Marca bicolor: `Balde` `#312E81` + `Cash` teal `#12B3A6` (logo)
  - Fondos: lila `#EEF1FF`, gris `#F7F8FB`, verde suave `#E8F8EF`, ámbar aviso `#FEF3E2`/`#FADFB5`
  - Texto: `#1F2333` (fuerte), `#6B7280` (medio), `#9CA3AF` (suave)
- **Formas:** cards radius 16-40px, sombras suaves, bordes `#E7E9F0`, chips redondeados (999px).
- **Layout:** mobile-first 390px. Bottom bar sticky con cuota total. Bottom sheets para modales/buscador. Sin tabs.

## Pantalla 1 — Index de oferta

Reemplaza el layout actual de `MiOfertaClient.tsx` + `TuOfertaTab.tsx`/`UpsellPortada.tsx`/`OfertaBannerAprobada.tsx`. **Sin tabs** — una pantalla scrolleable.

**Estructura común:**
- Header: logo BaldeCash bicolor centrado.
- Saludo: "Hola, [nombre]" + badge verde "Aprobada".
- **Monto héroe:** bloque lila "TU MONTO APROBADO / S/500/mes" (Baloo 2, ~46px, índigo).
- Título de acciones + copy cálido ("¡Estás aprobado! Elige cómo continuar").
- Chip discreto de **prueba social** ("+5,000 estudiantes ya recibieron su equipo") — valor por definir (fijo o métrica).

**Caso 4 (downgrade):**
- Aviso ámbar empático: "El equipo que pediste ([X]) no está disponible por ahora. Te preparamos esta opción que sí entra en tu monto — para que lo lleves hoy."
- **Card verde destacada "APROBADO PARA TI":** el equipo recomendado (del nodo, BAL-2180) con specs (chips), cuota grande verde, botón "Aceptar equipo". "Tu solicitud queda aprobada al elegirlo."
- Separador "¿no te convence?" → card "Ver otros equipos ([N] equipos)".
- (NO hay "continuar con mi equipo" — su equipo no calificó.)

**Caso 5 (upsell):**
- **Card destacada del equipo MEJOR** ("Aprovecha tu monto") con specs + cuota.
- Separador "¿prefieres otra cosa?" → abajo: "Continuar con mi equipo" (el que pidió) + "Ver catálogo".
- El upsell se destaca pero "continuar con mi equipo" SIEMPRE visible y a un tap.

**Se ELIMINA (del catálogo de la oferta):**
- Botón sticky "¿Necesitas ayuda?" (`onboarding-oferta-help` en `CatalogoOfertaTab.tsx`).
- Modal de bienvenida "eres nuevo" + tour guiado (`useOfferTour.ts`).

**Datos (ya existen en el API):** `getOffer(token)` devuelve `recommended`/`exclusiveOffer`, `requestedProduct`, `clientName`, `maxMonthlyQuota`, `offerCase`.

## Pantalla 2 — Accesorios y Seguros

Reemplaza `AccesoriosOfertaClient.tsx` + `OfertaAddonsSelector.tsx`. 4 estados (mock frames 1-4).

**Layout principal:**
- Top bar: "← Volver al equipo" + logo.
- Título "Accesorios y seguros" + "Solo mostramos lo que entra en tu cuota."
- Card "TU EQUIPO" (nombre + cuota).
- **Sección "Incluidos gratis"** (arriba, separada): los accesorios/seguro de regalo del combo (BAL-2159/2162), marcados "Gratis", monto S/0, NO removibles.
- **"Recomendado para ti":** el PRIMER accesorio que devuelve el API (`accessories[0]`) — destacado con card grande, seleccionable (radio/check).
- **"Tus extras":** los que el cliente ya sumó, con botón quitar (X).
- Botón dashed "Añadir uno más" → abre el buscador (bottom sheet).
- **Bottom bar sticky:** "Cuota mensual total S/X/mes" + botón "Continuar".

**Bottom sheet buscador (frame 3):**
- Backdrop + hoja inferior. Header "Añadir al pedido" + buscador de texto.
- **Chips de categoría** scrollables (Todos, Auriculares, Teclados, Mouse, Cargadores, Protector, Seguros) — de `accessory.category`.
- **Grid 2 columnas** de accesorios: foto, nombre, cuota (+S/X/mes), botón +/check, link "Ver detalle".
- **Sección "Seguros" (badge Insurama):** cards expandidas con coberturas (viñetas verdes desde `insurance.coverage`), nombres reales ("Seguro Contra Robo Laptop 24M", "Garantía Extendida Laptop 24M").
- Bottom sticky con total + "Listo".

**Bottom sheet detalle de accesorio (frame 4):**
- Foto grande, marca (`brand`), nombre, descripción larga (`description`), precio grande (+S/X/mes · en N meses).
- Botón "Agregar al pedido".

**Datos (ya existen):** `getOfferAddonsRich(token, variantId, selected, comboId)` devuelve `accessories[]` (con `id, name, description, price, monthlyQuota, image, category, isRecommended, brand`), `insurances[]` (con `coverage`), `comboFreeAddons`, `remaining`, `equipoMonthly`. NO requiere backend nuevo.

## Pantalla 3 — Confirmación

Reemplaza `ConfirmarEleccionModal.tsx` + `SeleccionConfirmada.tsx`. 3 estados.

**Modal preconfirmación "¿Confirmas tu elección?"** (bottom sheet):
- Header índigo con ícono + "Estás a un paso de elegir tu equipo".
- Equipo elegido + cuota (24m sin inicial).
- **Caja verde "REGALO POR TU COMBO"** con items gratis marcados "Incluido gratis" (BAL-2159/2162).
- Cuota total + aviso verde "Al aceptar, cambiaremos tu equipo y tu solicitud quedará aprobada."
- Botones: "Cancelar" (ghost) + "Sí, elegir este equipo" (índigo).

**Modal éxito "¡Listo!"** (bottom sheet):
- Check verde grande + "Cambiamos tu equipo y tu solicitud quedó aprobada."
- Card equipo + caja "REGALO POR TU COMBO" + cuota total.
- Aviso "Recibirás el contrato por WhatsApp."
- Botón verde "Continuar →".

**Página de estado (al refrescar, ya elegido — `already_selected`):**
- "¡Felicidades, [nombre]!" + check verde.
- **Comparación anterior→nuevo:** equipo viejo (cuota tachada) → equipo nuevo (verde). Ya existe hoy (`previous` en `getOffer`).
- **"TU PEDIDO INCLUYE":** equipo + accesorios/seguros (con gratis del combo marcados) + cuota total.
- Aviso WhatsApp.

**Datos (ya existen):** el flujo actual ya arma `chosen` (equipo, accesorios, insurances con `includedFree`, previous). `select_equipment` no cambia.

## Componentes nuevos / reutilizables (frontend)
- `OfertaHeader` (logo bicolor), `MontoHero`, `BadgeAprobada`, `PruebaSocial`.
- `EquipoRecomendadoCard` (verde destacada, Caso 4/5), `OpcionBarra` (barras de acción).
- `AccesoriosLayout`, `IncluidosGratisSection`, `AccesorioRecomendadoCard`, `TusExtras`, `CuotaStickyBar`.
- `BuscadorBottomSheet` (chips categoría + grid + búsqueda), `AccesorioGridCard`, `SeguroCard` (con coberturas), `AccesorioDetalleSheet`.
- `ConfirmarModal` (rediseño), `ExitoModal`, `EstadoPage` (comparación + pedido incluye).

## Testing
- **tsc verde** en cada fase (no `npm run build` — restricción de memoria).
- **E2E local** por pantalla: emitir oferta Caso 4 y Caso 5 → verificar que cada pantalla renderiza los datos reales del API (recomendado del nodo, addons, combo gratis, cuota).
- **Regresión:** el flujo funciona igual que antes (elegir equipo consume link, cuota recalcula, sync legacy, confirmación).
- Verificación visual en navegador local (Playwright si disponible, o revisión manual con links de prueba).

## Constraints
- Español latino con tildes. Iconos lucide-react o SVG inline (NO emojis).
- Mobile-first; performance (LCP < 2.5s en 3G, imágenes livianas).
- Respetar el sistema visual de los mocks (colores/fuentes/formas exactos).
- NO tocar backend, catálogo general, ni detalle de producto.
- El backend expone TODOS los datos necesarios (verificado): recomendado (BAL-2180), addons con description/brand/category/coverage, combo gratis (BAL-2159/2162), comparación anterior→nuevo.

## Puntos menores por definir (no bloquean)
- Valor del chip de prueba social ("+X estudiantes"): fijo o métrica real.
- Fuente Asap: Google Fonts (más simple) vs self-host (mejor performance offline).
