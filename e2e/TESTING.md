# Testing E2E — BaldeCash Web (webpage3.0)

## Stack

- **Playwright** con Chromium headless
- 1 worker (optimizado para MacBook Air M3 8GB)

## Prerequisitos

Antes de correr los tests, tener levantados:

```bash
# Frontend
npm run dev   # → http://localhost:3001

# Backend
uvicorn app.main:app --reload --port 8001
```

## Correr tests

```bash
# Todos los tests E2E
npm run test:e2e

# Solo pricing
npx playwright test e2e/pricing/

# Con UI interactiva (debug)
npm run test:e2e:ui
```

## Estructura

```
e2e/
├── TESTING.md                    ← Este archivo
└── pricing/
    ├── README.md                 ← Detalle del módulo pricing
    └── promotions.spec.ts        ← Tests de promos en el catálogo
```

## Módulo: pricing/

### `promotions.spec.ts`

Valida el flujo de promociones desde el API hasta el DOM del catálogo público.

**Capa 1 — API (7 tests, ~5s)**

Llaman al backend directamente. No abren browser.

| Test | Caso de negocio |
|------|----------------|
| A1 | Samsung Tab en CADE tiene Exclusivo CADE 30% |
| A5 | iPad en Home sin promo → `promotion: null` |
| A6 | Lenovo en Home tiene Cuota Épica 30% |
| A8 | Promo 0% → `original_monthly_price` calculable correctamente |
| B4 | Samsung Tab tiene Exclusivo CADE en CADE, CADE A y CADE B |
| B7 | Tablet TB311FU tiene Precio Exclusivo en UPN y Certus |

**Capa 2 — DOM visual (6 tests, ~25s)**

Playwright abre Chromium y verifica elementos en pantalla.

| Test | Caso de negocio |
|------|----------------|
| DOM - Banner | "PREAPROBADO" visible en card de Samsung Tab en CADE |
| DOM - Badge | "-30%" visible en la card |
| DOM - Tachado | "S/27" tachado visible |
| DOM - Sin template | Lenovo con Cuota Épica (sin banner visual) |
| DOM - Sin promo | Producto sin promo → sin badge ni tachado |
| DOM - UPN | Banner Precio Exclusivo visible en catálogo UPN |

## Estado de BD requerido

Los tests DOM dependen del estado de la BD local. Para restaurar:

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=emilio.gonzales@baldecash.com&password=TU_PASSWORD" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])")

# Samsung Tab A11 (634) en CADE/A/B con Exclusivo CADE (29)
curl -X PUT http://localhost:8001/api/v1/pricing/universe/promotions/assign \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"landing_ids":[152,155,156],"product_ids":[634],"promotion_id":29}'

# Tablet TB311FU (753) en UPN/Certus/UCAL con Precio Exclusivo (24)
curl -X PUT http://localhost:8001/api/v1/pricing/universe/promotions/assign \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"landing_ids":[13,3,5],"product_ids":[753],"promotion_id":24}'

# Lenovo V15 (491) en Home con Cuota Épica (23)
curl -X PUT http://localhost:8001/api/v1/pricing/universe/promotions/assign \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"landing_ids":[1],"product_ids":[491],"promotion_id":23}'
```

## Flujo completo de pruebas

```
BD ──────────────────────────► API ──────────────────► Catálogo web
pytest tests/pricing/          Playwright (API tests)   Playwright (DOM tests)
(17 tests, ~4s)                (7 tests, ~5s)           (6 tests, ~25s)
```

## Limitaciones conocidas

- Tests DOM del admin (`admin2/e2e/pricing/`) pendientes — autenticación compleja
- `pricing_history` no existe en BD local — tests de historial solo en prod
