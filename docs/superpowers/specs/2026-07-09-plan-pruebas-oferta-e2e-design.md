# Plan de pruebas E2E del flujo de oferta condicional — Diseño (spec)

**Fecha:** 2026-07-09 · **Autor:** Emilio + Claude · **Alcance:** Caso 4 (downgrade) + Caso 5 (upsell A/B/C).

## Objetivo

Validar de forma **exhaustiva y repetible** que el flujo de oferta condicional funciona correctamente en todas las combinaciones de producto (combo/no-combo × accesorios/seguros), que la selección se refleja bien en **baldemotor** y en **legacy**, y que el **nodo del workflow se reactiva** donde se quedó (o vence por SLA). Detectar/confirmar bugs conocidos (combo no arrastrado BAL-2194, seguro duplicado BAL-2199) y prevenir regresiones.

## Principio rector

**Una prueba = un caso × 5 niveles de verificación.** Cada caso emite una oferta, selecciona por API (dispara el sync legacy real async) y verifica los 5 niveles. El resultado es un reporte PASS/FAIL por caso y por nivel.

## Contexto verificado del flujo (file:line, ws2 rama principal)

Mapeado con exploración del código (2026-07-09). Resumen operativo:

### Qué escribe `select_equipment` (`conditional_offer_service.py:2246`)
- **baldemotor** (síncrono, dentro del request):
  - `application_offer`: `status=ACCEPTED`, `accepted_at`, `approved_capacity` (JSON: `selected_variant_id`, `selected_term`, `selected_initial`, `selected_combo_id`, `selected_accessory_ids`, `selected_insurance_ids`), y pricing recalculado (`_apply_selected_pricing_to_offer:2704`: `total_price`, `monthly_payment`, `tea`, `tcea`, `term`, `product_id`, `product_name`, etc.).
  - `secure_link`: `status=CONSUMED` (vía `consume()`, **después** de validar — orden correcto post-BAL-2102).
  - `offer_events`: evento `OFFER_EQUIPMENT_SELECTED`.
  - **NO toca** `application`, `application_product`, `application_insurance_policy` (el "pedido real" no se modifica; el cambio vive en el snapshot de la oferta). **Solo se leen** para `_requested_addons`/`_has_combo_accessories`.
- **legacy**: NO en el request. Async vía `BackgroundTasks` → `run_post_select_sync` (`conditional_offer_service.py:2954`), sesión de BD propia, orden obligatorio: **(1) resume workflow → (2) cambio de equipo → (3) accesorios/seguros**. Best-effort por paso (try/except, nunca lanza).

### Sync a legacy (async)
- `_sync_cambio_equipo_to_legacy:2754` → `POST /api/fast-api-sync/cambio-equipo` (timeout 180s): crea préstamo + CPP nuevo con el equipo elegido, pricing de la celda `selected_term`/`selected_initial`. Perfil C: tarifa custom NO aplica al equipo propio (BAL-2102).
- `_sync_combo_accessory:2848`: quita accesorios del combo anterior, quita sueltos no reseleccionados, agrega el accesorio del combo nuevo (monto 0 si `is_included_free`).
- `_sync_selected_addons_to_legacy:2367`: `_remove_dropped_previous_selection_from_legacy` limpia la selección anterior; agrega accesorios (`legacy_peripheral_id`) y seguros (resueltos vía `InsuranceListingService.list_available`, plan.id→legacyPerifericoId; requiere `variant_id`).
- **Gate legacy**: solo si `get_legacy_id(app)` resuelve `legacy_id` (`app.legacy_id` o `extra_data`); si no, skip silencioso. `LegacyApiService._check_enabled()` = flag global.

### Reactivación del nodo (`create_conditional_offer.py`)
- `resume_after_conditional_offer:313`: busca `WorkflowExecution` PAUSED en step con `NodeType.code="create_conditional_offer"` (por `application_id`, NO por el link), llama `WorkflowEngine.continue_workflow(input_data={trigger_type:"offer_selected", selected_variant_id})`.
- `resume():146`: `trigger_type=="offer_selected"` → `output_label="equipo_elegido"` (nodo COMPLETED, avanza a siguiente nodo). `"timeout"` → `output_label="vencido"` (revisión manual). Otro trigger → vuelve a pausar.
- Timeout: el scheduler (`scheduler.py`, tick ~60s) lee `response_data.resume_at` (= SLA del step `sla_hours`/`sla_unit`, fallback 24h) y dispara `trigger_type="timeout"` cuando vence.
- **Dos vencimientos independientes**: link (`secure_link.expires_at` = `expiry_hours`) vs nodo (SLA del step). Deben estar alineados.

### Info mostrada según producto
- `combo_free_addons` (`resolve_combo_addons:62`): accesorios/seguros gratis del combo ELEGIDO (filtro de seguro por plazo). Vacío si el equipo elegido no es combo.
- `_requested_addons:1215`: accesorios/seguros que el estudiante YA tenía (de `application_product`/`application_insurance_policy`, baldemotor). Card "el que pediste".
- `has_combo_accessories:1279`: flag (solo Caso 5) que avisa "perderás los accesorios de combo del pedido". Caso 4 NO lo expone (asimetría a confirmar).

## Matriz de casos (producto principal)

Cada caso se ejecuta en los casos de oferta indicados. ~20 ejecuciones.

| # | Pedido original | Equipo elegido | Casos oferta | Qué valida |
|---|---|---|---|---|
| 1 | simple (no combo) | simple | C4, C5A | baseline: cambio de equipo limpio |
| 2 | simple | + accesorio | C4, C5A | añadir accesorio suelto |
| 3 | simple | + seguro | C4, C5A | añadir seguro |
| 4 | simple | + accesorio + seguro | C4, C5A | añadir ambos |
| 5 | simple | **combo** | C4, C5A | elegir combo → gratis aparece + sync monto 0 |
| 6 | **combo** | simple | C4, C5 | 🐛 pierde el accesorio del combo del pedido (BAL-2194) |
| 7 | **combo** | **combo** | C4, C5A | combo→combo: quita el viejo, pone el nuevo |
| 8 | + seguro | mismo seguro disponible | C4, C5A | 🐛 seguro duplicado (BAL-2199) |
| 9 | combo + seguro | combo | C5A | combo con seguro en el pedido, no duplicar |
| 10 | simple | simple | **C5B** | Perfil B: accesorio de regalo del nodo |
| 11 | simple | simple | **C5C** | Perfil C: tarifa especial (TEA/comisión custom) |
| 12 | cualquiera | elige | C4 | nodo avanza → salida "equipo_elegido" |
| 13 | cualquiera | NO elige (timeout) | C4, C5 | nodo vence → salida "vencido" (SLA) |

## Los 5 niveles de verificación (por caso)

**Nivel 1 — Baldemotor (BD directa):**
- `application_offer`: `status=ACCEPTED`, `accepted_at` no null.
- `approved_capacity` contiene `selected_variant_id` = el elegido, `selected_term`/`selected_initial` = la celda elegida, `selected_accessory_ids`/`selected_insurance_ids` = lo seleccionado, `selected_combo_id` si aplica.
- Pricing recalculado coherente (`monthly_payment`, `tea`, `term`, `product_id`/`product_name` del elegido).
- `secure_link.status=CONSUMED`.
- Evento `OFFER_EQUIPMENT_SELECTED` en `offer_events`/`application_history_event`.

**Nivel 2 — API (HTTP):**
- `GET /public/offer/{token}` → `already_selected=true`, `selected_equipment` = el elegido.
- `GET /addons` (antes de seleccionar): `combo_free_addons` correcto (los gratis del combo elegido, o vacío si no-combo); `insurances` NO incluye un seguro que el pedido ya tenía (caso 8 → esperado FALLA hoy, es el bug BAL-2199).
- **Detalle del application** (endpoint que alimenta la ficha admin): refleja el equipo/accesorios nuevos.

**Nivel 3 — Legacy (payload en logs + BD si commitea):**
- Log `[cambio-equipo] POST` con `product_id` = `legacy_product_id` del elegido, pricing de la celda (`tea`, `cuotas`, `monto_cuota`).
- Logs `[periferico] POST add/remove`: accesorios/seguros correctos; gratis del combo con `monto=0`; el combo viejo se quita; un seguro ya existente NO se re-agrega.
- Si legacy local commitea (no-combo): verificar cadena `solicitud.id_categoria_producto_prestamo → CPP → id_producto`. Para combos (legacy single-thread cuelga): verificar el **payload en logs**, no el estado final (regla aprendida).

**Nivel 4 — Nodo/workflow:**
- Tras selección: `WorkflowExecution` de la app pasó de PAUSED a avanzar; `ApplicationNodeExecution` del nodo oferta = COMPLETED con `output_label="equipo_elegido"`; `current_step_id` = siguiente nodo.
- Tras timeout (caso 13): el nodo avanza por `output_label="vencido"`.
- Resume no duplica (idempotencia básica: el nodo no queda con 2 COMPLETED).

**Nivel 5 — Playwright:**
- Flujo visual: index → complementos → confirmar → éxito, renderiza los datos correctos (gratis del combo, cuota, breakdown).
- **Ficha del application en admin2**: abrir el detalle del application y verificar visualmente que el equipo/accesorios cambiaron.

## Arnés (automatizado, reutilizable)

Basado en el harness que ya funcionó (memoria `offer_e2e_test_harness`). En scratchpad:
- `harness.py`: emite oferta por servicio (`emit_offer`/`emit_upsell_offer`) + selecciona por API HTTP (`POST /public/offer/{tok}/select`, dispara sync async). Mide latencia.
- `verify.py`: dado (offer_id, legacy_id), lee baldemotor + legacy por SQLAlchemy directo y emite PASS/FAIL por criterio (niveles 1, 2, 3-BD, 4).
- `verify_logs.py`: grep del log del backend por el payload legacy (nivel 3-payload).
- `pw_flow.mjs`: Playwright del flujo + ficha admin (nivel 5).
- `runner.py`: itera la matriz, escribe `results.json` con PASS/FAIL por caso × nivel.

Entorno: **local** (baldemotor + legacy local). Combos: verificar payload en logs.

## Datos de prueba

Apps base con `legacy_id` (landing 1, memoria): 25948/25946/25944/25945/25939/25940 (mensual laptop/tablet/combo), 25947/25942/25938 (celular semanal). Para cada caso de la matriz se elige una app con el pedido adecuado (simple/combo/con seguro) o se prepara el estado. Combos conocidos: variant 491 / combo 52 (Victus+Impresora+Mochila), combo 42.

## Criterios de éxito

- **Cada caso PASA los 5 niveles** (salvo los 2 bugs conocidos, que se espera FALLEN en el nivel donde se manifiestan — el reporte lo marca como "bug conocido, esperado").
- El **reporte final** lista cada caso × nivel con PASS/FAIL/N-A y evidencia (valores leídos, payload de log, screenshot).
- Los **bugs nuevos** que surjan se documentan (ticket o anotación) — no se arreglan en este plan (es de pruebas, no de fix).
- **Riesgos documentados** (no ejecutados, quedan como "a monitorear"): split-brain del BackgroundTask (oferta accepted pero workflow no avanza/legacy sin sync); app sin `legacy_id` (skip silencioso); legacy caído/timeout (select responde 200 igual); ambigüedad del resume (2 workflows PAUSED); desalineación link vs SLA del nodo; el query del scheduler puede dejar de reintentar un timeout tras BREACH (`scheduler.py:178-181`).

## Constraints

- **Local only** (no prod salvo OK explícito). No limpiar datos mientras se prueba.
- No arreglar bugs en este plan — solo detectar/documentar.
- Legacy local single-thread: para combos, el payload en logs es la prueba (no el estado final en BD legacy).
- Español peruano. Screenshots Playwright en subcarpeta dedicada.

## Fuera de alcance (esta ronda)

- Edge cases difíciles de reproducir (split-brain forzado, legacy deshabilitado, re-elección multi-oferta) → documentados como riesgos, no ejecutados.
- Fix de los bugs encontrados (van a sus tickets: BAL-2194, BAL-2199, y nuevos).
