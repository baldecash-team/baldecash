# E2E Tests — BaldeCash Web

Tests end-to-end para validar el flujo de promociones en el catálogo público.

## Stack

- **Playwright** con Chromium headless
- **1 worker** (optimizado para MacBook Air M3 8GB)
- ~30 segundos en total

## Requisitos

Antes de correr los tests, asegúrate de tener levantados:

- Frontend: `npm run dev` → `http://localhost:3001`
- Backend: `uvicorn app.main:app --reload --port 8001`

## Correr tests

```bash
# Todos los tests
npm run test:e2e

# Con UI interactiva (para debug)
npm run test:e2e:ui
```

## Estructura de tests

### Capa 1 — API (7 tests)
Llaman al backend directamente y validan que los datos son correctos.
No abren browser.

| Test | Qué valida |
|------|-----------|
| A1 | Samsung Tab en CADE tiene promo Exclusivo CADE con 30% |
| A5 | iPad en Home no tiene promo activa |
| A6 | Lenovo en Home tiene promo Cuota Épica |
| A8 | Promo 0% — cálculo correcto de original_monthly_price |
| B4 | Samsung Tab tiene Exclusivo CADE en CADE, CADE A y CADE B |
| B7 | Tablet TB311FU tiene Precio Exclusivo en UPN y Certus |

### Capa 2 — DOM visual (6 tests)
Playwright abre Chromium, navega al catálogo y verifica elementos en pantalla.

| Test | Qué valida |
|------|-----------|
| DOM - CADE banner | Texto "PREAPROBADO" visible en el catálogo |
| DOM - CADE badge | Badge "-30%" visible en la card |
| DOM - CADE tachado | Precio tachado "S/27" visible |
| DOM - Home Lenovo | Promo Cuota Épica asignada correctamente |
| DOM - CADE sin promo | Producto sin promo no tiene promo en API |
| DOM - UPN Tablet | Banner de Precio Exclusivo visible |

## Flujo completo de pruebas

```
Admin (modal) → API → BD → Catálogo web
     ↓            ↓     ↓        ↓
  Manual      Playwright pytest  Playwright
              (API tests) (BD) (DOM tests)
```

1. **pytest** (backend) — valida BD: `pytest tests/test_assign_promotion.py`
2. **Playwright** (este repo) — valida API + DOM: `npm run test:e2e`
3. **Manual** — validar modal de admin visualmente

## Estado de BD esperado para los tests

Los tests DOM dependen del estado actual de la BD local. Si corres las pruebas
manuales del backend y cambias el estado, algunos tests pueden fallar.

Para restaurar el estado esperado:

```bash
# Asignar Exclusivo CADE (id=29) al Samsung Tab (id=634) en CADE/A/B (152,155,156)
curl -X PUT http://localhost:8001/api/v1/pricing/universe/promotions/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"landing_ids":[152,155,156],"product_ids":[634],"promotion_id":29}'

# Asignar Precio Exclusivo (id=24) a Tablet TB311FU (id=753) en UPN/Certus/UCAL (13,3,5)
curl -X PUT http://localhost:8001/api/v1/pricing/universe/promotions/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"landing_ids":[13,3,5],"product_ids":[753],"promotion_id":24}'

# Asignar Cuota Épica (id=23) a Lenovo V15 (id=491) en Home (1)
curl -X PUT http://localhost:8001/api/v1/pricing/universe/promotions/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"landing_ids":[1],"product_ids":[491],"promotion_id":23}'
```
