# Calculadora de Efectivo por Landing — Diseño (multi-repo)

- **Fecha:** 2026-07-24
- **Rama:** `feat/calculadora-efectivo` (worktrees `*-wt-calcefec` en baldecash, ws2, admin2)
- **Base:** `origin/main` en los 3 repos
- **Autor:** Leonardo Medina

## 1. Objetivo

Ciertas landings, en lugar de mostrar el **catálogo de productos**, deben mostrar una
**calculadora de préstamo en efectivo**: el usuario define **monto**, **plazo** e **inicial**,
ve la **cuota** resultante, y con eso **continúa al flujo de solicitud** normal.

- Es un **módulo independiente de KYC** (solo se reutiliza el *patrón* multi-repo per-landing, no su código).
- **Configurable por landing desde admin2.**
- **Lógica (cálculo + config + validación) en ws2.**
- **UI en baldecash.**
- Al continuar, se genera un **préstamo efectivo vinculado a la landing**, cuyo **monto nace en la calculadora**.

## 2. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Almacenamiento de config | `landing.config["calculadora"]` (JSON, estilo KYC/`solicitar_flow`). No preset, no columnas nuevas. |
| Continuar → solicitud | Producto **efectivo por-landing** cableado vía `LandingProduct`, con `legacy_product_id` real. El monto viaja en `unit_price`/`product_price`/`prestamo.monto`. Sin cambios al contrato de submit. |
| Fuente de verdad de la cuota | ws2 `LoanCalculatorService` (amortización francesa). El FE nunca calcula la cuota; solo la muestra. |
| Fuente de la `tea` | `landing.config["calculadora"].tea` (editable en admin). Se pasa como *hint* en el submit; `resolve_tea_tcea` la respeta. |
| Inicial en efectivo | Configurable (`inicial.percents`); default `[0]` (efectivo suele ser sin inicial, pero el admin puede habilitar %). |
| Tipo de producto efectivo | Nuevo `ProductType.EFECTIVO` (más limpio para reportería/filtros). Requiere actualizar las ramas por tipo en `legacy_sync_payload_builder`. |
| Fail-safe | Ausencia de config o `enabled != true` ⇒ calculadora **deshabilitada** (patrón `isKycEnabled`, `?? false`). |

## 3. Modelo de datos: producto efectivo vinculado a landing

El **producto** es el *riel* que satisface el requisito legacy de `legacy_product_id`; **no** guarda el monto.
El **monto** nace en runtime en la calculadora y viaja en la solicitud/préstamo.

```
Legacy (PHP)                 ws2                                     Landing
producto.id  <--legacy_product_id--  Product(type=EFECTIVO,
                                     list_price=nominal)
                                        |
                                     LandingProduct(tea, term_months,
                                     initial_payment overrides)  ------ Landing
                                                                          |
                              landing.config["calculadora"] = {  --------/
                                enabled, efectivo_product_id,
                                monto{min,max,step}, plazos[],
                                inicial{percents[]}, tea }
```

### Config JSON (`landing.config["calculadora"]`)

```jsonc
{
  "enabled": true,
  "efectivo_product_id": 123,        // Product efectivo con legacy_product_id
  "monto":   { "min": 500, "max": 8000, "step": 100 },
  "plazos":  [6, 9, 12, 18, 24],     // term_months permitidos
  "inicial": { "percents": [0, 10, 20] },
  "tea": 89.9
}
```

## 4. Flujo runtime

```
Usuario -> baldecash: entra a la landing (gate detecta calculadora.enabled)
baldecash -> ws2: GET /public/landing/{slug}/calculadora-config
ws2 -> baldecash: { enabled, monto{min,max,step}, plazos, inicial, tea }
Usuario -> baldecash: elige monto=3000, plazo=12, inicial=10%
baldecash -> ws2: POST /public/landing/{slug}/calculadora/simulate { monto, plazo, inicial }
ws2: LoanCalculatorService.calculate_loan(principal=3000, tea, term=12)  [fuente de verdad]
ws2 -> baldecash: { cuota, tea, tcea, financiado }
Usuario -> baldecash: Continuar
baldecash: arma product_data efectivo { product_id: efectivo_product_id, unit_price: 3000,
           term:12, initial_percent:10, monthly_payment, tea }
baldecash -> ws2: POST /public/form (submit solicitud)
ws2: crea Application (product_price=3000, financed_amount, term_months, monthly_payment)
ws2 -> Legacy: create_solicitud (legacy_product_id <- Product; prestamo.monto=3000 <- runtime)
```

## 5. Cambios por repo

### 5.1 ws2 (`ws2-wt-calcefec`)

**Config / persistencia**
- Normalización de `landing.config["calculadora"]` (fail-safe a deshabilitado si ausente/`enabled=false`),
  con clamp/validación de `monto`, `plazos`, `inicial`, `tea`. Espejo del manejo de `solicitar_flow`.
- Admin endpoints (mirror de `PUT /{landing_id}/solicitar-config`, `landings.py:3264`, usando `flag_modified`):
  - `GET  /landings/{landing_id}/calculadora-config`
  - `PUT  /landings/{landing_id}/calculadora-config`
- Público (mirror de `get_solicitar_config`, `public/landing.py:1893`):
  - `GET  /public/landing/{slug}/calculadora-config`
  - Además exponer el bloque `calculadora` en el config público que consume `fetchLandingConfig`
    (verificar en implementación cuál endpoint alimenta ese fetch: `/public/landing/{slug}` vs `/layout`).

**Cálculo**
- `POST /public/landing/{slug}/calculadora/simulate` con body `{ monto, plazo, inicial }`:
  - Valida contra la config de la landing (rango de monto, plazo permitido, inicial permitido).
  - Usa `LoanCalculatorService.calculate_loan(principal=monto, tea, term_months=plazo, ...)`.
  - Devuelve `{ monto, plazo, inicial, cuota, tea, tcea, financiado }`.
  - Errores: `422` si fuera de rango; `404` si la landing no tiene calculadora habilitada.

**Producto efectivo (legacy unlock)**
- Nuevo `ProductType.EFECTIVO` en `products.py` (+ ramas por tipo en `legacy_sync_payload_builder.py:235-253`).
- Seed/config de un `Product` efectivo (list_price nominal) con `legacy_product_id` válido,
  asociado por landing vía `LandingProduct` (overrides `tea`/`term_months`/`initial_payment`).
- Submit: **sin cambios de contrato**; la calculadora pasa `product_id` (efectivo) + `unit_price` = monto.
  `product_price` y `prestamo.monto` cargan el importe; `_resolve_legacy_product_id` resuelve OK.

**Tests (pytest)**
- Normalización de `calculadora-config` (defaults, fail-safe, clamps) — mirror `test_landing_solicitar_config.py`.
- Endpoint `simulate`: happy path + fuera de rango + landing sin calculadora.
- Resolución de `legacy_product_id` para el producto efectivo.

### 5.2 admin2 (`admin2-wt-calcefec`)

- Tipos `CalculadoraConfig` en `types/landing.ts`.
- Nueva sección/tab "Calculadora" (mirror de `SolicitarFlowSection.tsx`): registrar `EditorTab`,
  entrada en `TABS`, regla en `isTabVisible()`, y render condicional en `LandingEditor.tsx`.
- Formulario: toggle `enabled`, `monto` (min/max/step), `plazos` (chips multi-select),
  `inicial.percents`, `tea`, y selector de `efectivo_product_id`.
- Servicio en `landings.service.ts`:
  - `getCalculadoraConfig(landingId)` → `GET /landings/{id}/calculadora-config`
  - `updateCalculadoraConfig(landingId, config)` → `PUT /landings/{id}/calculadora-config`
- Interacción con catálogo: al habilitar calculadora, la landing no muestra catálogo
  (coordinar con `catalog-off`/`has_catalog` según cómo lo consuma el FE).

### 5.3 baldecash (`baldecash-wt-calcefec`)

- Tipos + accessor: `CalculadoraConfig` y `getCalculadoraConfig(config)` en
  `types/landingConfig.ts` (mirror de `getDeferredPayment`, defaults seguros).
  El merge pass-through ya soporta el namespace `calculadora` sin tocar el fetch.
- Cliente API `calculadoraApi.ts`: `fetchCalculadoraConfig(slug)` + `simulateCalculadora(slug, {monto,plazo,inicial})`.
- Ruta `[landing]/calculadora/` (page.tsx server + `CalculadoraClient`) con auto-gate
  (`useEffect` que redirige si no está habilitada — mirror de `kyc/kycClient.tsx:38-44`).
- `routes.calculadora(landing)` en `utils/routes.ts` (mirror de `solicitarKyc`).
- Gate de catálogo: cuando la calculadora está habilitada, la landing/catálogo redirige a la calculadora
  (mirror del gate `catalogo/page.tsx` sobre `has_catalog`).
- `CalculadoraClient`: adapta `PricingCalculator.tsx`:
  - Input/slider de **monto** (min/max/step de la config).
  - Cards de **plazo** (plazos permitidos).
  - Selector de **inicial** (percents permitidos).
  - **Cuota en vivo** con llamada *debounced* a `simulate` de ws2 (fuente de verdad).
  - "Continuar": arma `product_data` efectivo e invoca `useSubmitApplication` → flujo de solicitud.
- **Tests (jest)**: accessor `getCalculadoraConfig` (defaults/fail-safe), gate/redirección, y
  `CalculadoraClient` (render de rangos, submit arma `product_data` correcto).

## 6. Manejo de errores

- **Config ausente / `enabled=false`** ⇒ la landing se comporta como antes (catálogo); la ruta
  `/calculadora` auto-redirige. Nunca crashea (fail-safe `?? false`).
- **Monto/plazo/inicial fuera de rango** ⇒ ws2 `422`; el FE muestra mensaje y no permite continuar.
- **`simulate` cae** ⇒ el FE deshabilita "Continuar" y muestra estado de error; no inventa cuota.
- **`efectivo_product_id` sin `legacy_product_id`** ⇒ el submit fallaría en legacy; validar en admin
  (no permitir habilitar calculadora sin producto efectivo válido) y en el seed.

## 7. Fuera de alcance (YAGNI)

- Múltiples productos efectivo por landing (por ahora uno).
- Tasas dinámicas por segmento/score (se usa la `tea` de la config).
- Cronograma completo de pagos en la calculadora (solo cuota; el detalle vive en solicitud/simulate existente).

## 8. Orden de implementación sugerido

1. **ws2**: enum + producto efectivo + config normalize + endpoints (config, simulate) + tests.
2. **admin2**: tipos + sección + servicio.
3. **baldecash**: accessor + api + ruta/gate + `CalculadoraClient` + tests.

(Contrato API primero en ws2 para que admin2 y baldecash consuman shapes estables.)
