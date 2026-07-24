# Calculadora de Efectivo por Landing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ciertas landings muestran una calculadora de préstamo en efectivo (monto/plazo/inicial → cuota) en lugar del catálogo, y con eso continúan al flujo de solicitud; configurable por landing desde admin2, con la lógica/cálculo en ws2 y la UI en baldecash.

**Architecture:** La config vive en `landing.config["calculadora"]` (JSON, estilo KYC). ws2 normaliza esa config, la expone en el namespace `calculadora` del endpoint público `/config`, calcula la cuota con `LoanCalculatorService` (fuente de verdad) vía `POST /public/landing/{slug}/calculadora/simulate`, y provee endpoints admin GET/PUT. El préstamo se ancla a un `Product` efectivo por-landing (con `legacy_product_id`), pero el monto nace en la calculadora y viaja en `unit_price`/`prestamo.monto` — sin cambiar el contrato de submit. baldecash lee el namespace, redirige catálogo→calculadora cuando está habilitada, y renderiza `CalculadoraClient`.

**Tech Stack:** ws2 (FastAPI, SQLAlchemy, Alembic, pytest); admin2 (Next.js App Router, React 19, TS, Tailwind); baldecash (Next.js App Router, TS, Tailwind, NextUI, Jest/RTL).

## Global Constraints

- Worktrees: ws2 `D:\repos\ws2-wt-calcefec`, admin2 `D:\repos\admin2-wt-calcefec`, baldecash `D:\repos\baldecash-wt-calcefec`. Rama `feat/calculadora-efectivo` (base `origin/main`) en los 3.
- Idioma UI: español latino con tildes. Iconos: lucide-react (no emojis). Framework FE: Next.js App Router.
- Fail-safe: config ausente o `enabled != true` ⇒ calculadora **deshabilitada** (patrón `getDeferredPayment` / `isKycEnabled`, `?? false`).
- La cuota SIEMPRE la calcula ws2 (`LoanCalculatorService`). El FE nunca calcula la cuota; solo la muestra.
- `tea` única fuente: `landing.config["calculadora"].tea`. Inicial default `percents: [0]`.
- Contrato del namespace público `calculadora` (lo consumen admin2 y baldecash — mantener estable):
  ```jsonc
  {
    "enabled": true,
    "efectivo_product_id": 123,
    "monto":   { "min": 500, "max": 8000, "step": 100 },
    "plazos":  [6, 9, 12, 18, 24],
    "inicial": { "percents": [0, 10, 20] },
    "tea": 89.9
  }
  ```
- Contrato `POST /public/landing/{slug}/calculadora/simulate`:
  - Request: `{ "monto": number, "plazo": number, "inicial_percent": number }`
  - Response 200: `{ "monto": number, "plazo": number, "inicial_percent": number, "inicial_amount": number, "financiado": number, "cuota": number, "tea": number, "tcea": number }`
  - `422` si fuera de rango; `404` si la landing no tiene calculadora habilitada.
- Commit tras cada tarea. Mensajes en español, prefijo `feat(calculadora)`/`test(calculadora)`, terminando con:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

## FASE A — ws2 (contrato primero) · worktree `D:\repos\ws2-wt-calcefec`

### Task A1: Helper de normalización de `landing.config["calculadora"]`

**Files:**
- Create: `app/services/calculadora_config.py`
- Test: `tests/services/test_calculadora_config.py`

**Interfaces:**
- Produces:
  - `DEFAULT_CALCULADORA = {"enabled": False, "efectivo_product_id": None, "monto": {"min": 0, "max": 0, "step": 100}, "plazos": [], "inicial": {"percents": [0]}, "tea": 0.0}`
  - `def normalize_calculadora(raw: dict | None) -> dict` — devuelve el dict normalizado (fail-safe a `enabled=False` si ausente/inválido).
  - `def is_calculadora_enabled(landing_config: dict | None) -> bool`
  - `def validate_simulate_input(cfg: dict, monto: float, plazo: int, inicial_percent: float) -> None` — lanza `ValueError` con mensaje si fuera de rango.

- [ ] **Step 1: Write the failing test**

```python
# tests/services/test_calculadora_config.py
import pytest
from app.services.calculadora_config import (
    normalize_calculadora,
    is_calculadora_enabled,
    validate_simulate_input,
    DEFAULT_CALCULADORA,
)


def test_normalize_none_returns_disabled_default():
    out = normalize_calculadora(None)
    assert out["enabled"] is False
    assert out["plazos"] == []
    assert out["inicial"]["percents"] == [0]


def test_normalize_clamps_and_coerces():
    out = normalize_calculadora({
        "enabled": True,
        "efectivo_product_id": "123",
        "monto": {"min": "500", "max": "8000", "step": "100"},
        "plazos": [12, 6, 12, "9"],          # dup + unsorted + str
        "inicial": {"percents": [10, 0, 10]},  # dup
        "tea": "89.9",
    })
    assert out["enabled"] is True
    assert out["efectivo_product_id"] == 123
    assert out["monto"] == {"min": 500, "max": 8000, "step": 100}
    assert out["plazos"] == [6, 9, 12]        # deduped + sorted ints
    assert out["inicial"]["percents"] == [0, 10]
    assert out["tea"] == pytest.approx(89.9)


def test_enabled_requires_true_flag():
    assert is_calculadora_enabled({"calculadora": {"enabled": True}}) is True
    assert is_calculadora_enabled({"calculadora": {"enabled": False}}) is False
    assert is_calculadora_enabled({}) is False
    assert is_calculadora_enabled(None) is False


def test_validate_simulate_input_ranges():
    cfg = normalize_calculadora({
        "enabled": True, "efectivo_product_id": 1,
        "monto": {"min": 500, "max": 8000, "step": 100},
        "plazos": [6, 12], "inicial": {"percents": [0, 10]}, "tea": 80,
    })
    validate_simulate_input(cfg, 3000, 12, 10)  # ok, no raise
    with pytest.raises(ValueError):
        validate_simulate_input(cfg, 100, 12, 10)     # below min
    with pytest.raises(ValueError):
        validate_simulate_input(cfg, 9000, 12, 10)    # above max
    with pytest.raises(ValueError):
        validate_simulate_input(cfg, 3000, 9, 10)     # plazo not allowed
    with pytest.raises(ValueError):
        validate_simulate_input(cfg, 3000, 12, 20)    # inicial not allowed
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /d/repos/ws2-wt-calcefec && python -m pytest tests/services/test_calculadora_config.py -v`
Expected: FAIL (module `app.services.calculadora_config` not found).

- [ ] **Step 3: Write minimal implementation**

```python
# app/services/calculadora_config.py
"""Normalización y validación de la config de calculadora de efectivo por landing.

La config vive en `landing.config["calculadora"]`. Fail-safe: ausencia o
`enabled != True` ⇒ deshabilitada.
"""
from typing import Optional

DEFAULT_CALCULADORA = {
    "enabled": False,
    "efectivo_product_id": None,
    "monto": {"min": 0, "max": 0, "step": 100},
    "plazos": [],
    "inicial": {"percents": [0]},
    "tea": 0.0,
}


def _to_int(value, default=0) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def _to_float(value, default=0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _sorted_unique_ints(values) -> list:
    if not isinstance(values, (list, tuple)):
        return []
    out = set()
    for v in values:
        out.add(_to_int(v))
    return sorted(out)


def normalize_calculadora(raw: Optional[dict]) -> dict:
    if not isinstance(raw, dict):
        return dict(DEFAULT_CALCULADORA, monto=dict(DEFAULT_CALCULADORA["monto"]),
                    inicial=dict(DEFAULT_CALCULADORA["inicial"]), plazos=[])

    monto_raw = raw.get("monto") if isinstance(raw.get("monto"), dict) else {}
    inicial_raw = raw.get("inicial") if isinstance(raw.get("inicial"), dict) else {}
    pid = raw.get("efectivo_product_id")

    return {
        "enabled": raw.get("enabled") is True,
        "efectivo_product_id": _to_int(pid) if pid not in (None, "") else None,
        "monto": {
            "min": _to_int(monto_raw.get("min")),
            "max": _to_int(monto_raw.get("max")),
            "step": _to_int(monto_raw.get("step"), 100) or 100,
        },
        "plazos": _sorted_unique_ints(raw.get("plazos")),
        "inicial": {"percents": _sorted_unique_ints(inicial_raw.get("percents")) or [0]},
        "tea": _to_float(raw.get("tea")),
    }


def is_calculadora_enabled(landing_config: Optional[dict]) -> bool:
    if not isinstance(landing_config, dict):
        return False
    cfg = landing_config.get("calculadora")
    return isinstance(cfg, dict) and cfg.get("enabled") is True


def validate_simulate_input(cfg: dict, monto: float, plazo: int, inicial_percent: float) -> None:
    monto_cfg = cfg.get("monto", {})
    lo, hi = monto_cfg.get("min", 0), monto_cfg.get("max", 0)
    if monto < lo or (hi and monto > hi):
        raise ValueError(f"monto fuera de rango [{lo}, {hi}]")
    if plazo not in cfg.get("plazos", []):
        raise ValueError(f"plazo {plazo} no permitido")
    if _to_int(inicial_percent) not in cfg.get("inicial", {}).get("percents", [0]):
        raise ValueError(f"inicial {inicial_percent} no permitido")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /d/repos/ws2-wt-calcefec && python -m pytest tests/services/test_calculadora_config.py -v`
Expected: PASS (all 4 tests).

- [ ] **Step 5: Commit**

```bash
cd /d/repos/ws2-wt-calcefec
git add app/services/calculadora_config.py tests/services/test_calculadora_config.py
git commit -m "feat(calculadora): normalizador y validador de config de efectivo

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task A2: Endpoints admin GET/PUT `calculadora-config`

**Files:**
- Modify: `app/api/routers/landings.py` (junto a los handlers `*/solicitar-config`, ~línea 3201-3320; usar `flag_modified` como allí)
- Test: `tests/api/routers/test_calculadora_config_admin.py`

**Interfaces:**
- Consumes: `normalize_calculadora` (Task A1).
- Produces:
  - `GET /landings/{landing_id}/calculadora-config` → `{ "landing_id": int, "calculadora": <config normalizada> }`
  - `PUT /landings/{landing_id}/calculadora-config` body `{ "calculadora": {...} }` → persiste en `landing.config["calculadora"]` (normalizado) y devuelve lo guardado.

- [ ] **Step 1: Write the failing test**

```python
# tests/api/routers/test_calculadora_config_admin.py
def test_get_calculadora_config_defaults_when_absent(client, admin_auth, landing_factory):
    landing = landing_factory()  # sin config.calculadora
    r = client.get(f"/landings/{landing.id}/calculadora-config", headers=admin_auth)
    assert r.status_code == 200
    body = r.json()
    assert body["calculadora"]["enabled"] is False


def test_put_then_get_roundtrip(client, admin_auth, landing_factory):
    landing = landing_factory()
    payload = {"calculadora": {
        "enabled": True, "efectivo_product_id": 1,
        "monto": {"min": 500, "max": 8000, "step": 100},
        "plazos": [12, 6], "inicial": {"percents": [0]}, "tea": 89.9,
    }}
    put = client.put(f"/landings/{landing.id}/calculadora-config", json=payload, headers=admin_auth)
    assert put.status_code == 200
    assert put.json()["calculadora"]["plazos"] == [6, 12]  # normalized
    get = client.get(f"/landings/{landing.id}/calculadora-config", headers=admin_auth)
    assert get.json()["calculadora"]["enabled"] is True
    assert get.json()["calculadora"]["tea"] == 89.9
```

> Reusar los fixtures existentes (`client`, `admin_auth`/token admin, `landing_factory`) de `tests/api/routers/test_landing_solicitar_config.py`. Si tienen otro nombre, adaptarlos ahí.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /d/repos/ws2-wt-calcefec && python -m pytest tests/api/routers/test_calculadora_config_admin.py -v`
Expected: FAIL (404 route not found).

- [ ] **Step 3: Write minimal implementation**

Añadir en `app/api/routers/landings.py` (importar arriba: `from app.services.calculadora_config import normalize_calculadora`; `from sqlalchemy.orm.attributes import flag_modified` ya suele estar):

```python
@router.get("/{landing_id}/calculadora-config")
def get_calculadora_config(landing_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    landing = db.query(Landing).filter(Landing.id == landing_id).first()
    if not landing:
        raise HTTPException(status_code=404, detail="Landing not found")
    raw = (landing.config or {}).get("calculadora")
    return {"landing_id": landing.id, "calculadora": normalize_calculadora(raw)}


@router.put("/{landing_id}/calculadora-config")
def update_calculadora_config(
    landing_id: int, body: dict, db: Session = Depends(get_db), _=Depends(require_admin)
):
    landing = db.query(Landing).filter(Landing.id == landing_id).first()
    if not landing:
        raise HTTPException(status_code=404, detail="Landing not found")
    normalized = normalize_calculadora((body or {}).get("calculadora"))
    config = dict(landing.config or {})
    config["calculadora"] = normalized
    landing.config = config
    flag_modified(landing, "config")
    db.commit()
    return {"landing_id": landing.id, "calculadora": normalized}
```

> Usar el mismo dependency de auth admin que `update_solicitar_config` (copiar el `Depends(...)` exacto de ese handler; aquí se muestra como `require_admin`). Importar `Landing`, `HTTPException`, `Session`, `Depends`, `get_db` si no están ya en el archivo.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /d/repos/ws2-wt-calcefec && python -m pytest tests/api/routers/test_calculadora_config_admin.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /d/repos/ws2-wt-calcefec
git add app/api/routers/landings.py tests/api/routers/test_calculadora_config_admin.py
git commit -m "feat(calculadora): endpoints admin GET/PUT calculadora-config

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task A3: Exponer namespace `calculadora` en el config público

**Files:**
- Modify: el builder del endpoint público `GET /public/landing/{slug}/config` que consume `fetchLandingConfig` (baldecash). Localizar por el mismo lugar donde se inyecta el namespace `deferred_payment` desde `landing.extra_data`/`config`. Buscar en `app/api/routers/public/landing.py` / `app/services/landing_service.py` la construcción de `config`/namespaces.
- Test: `tests/api/routers/test_public_landing_config_calculadora.py`

**Interfaces:**
- Consumes: `normalize_calculadora` (A1).
- Produces: la respuesta de `/public/landing/{slug}/config` incluye `config["calculadora"]` = config normalizada **solo cuando `enabled` es True** (si está deshabilitada, se omite el namespace o se emite `{"enabled": false}` — elegir consistente con cómo se maneja `deferred_payment`; por defecto: emitir siempre `{"enabled": bool, ...}` para que el FE no tenga que distinguir ausencia).

- [ ] **Step 1: Write the failing test**

```python
# tests/api/routers/test_public_landing_config_calculadora.py
def test_public_config_includes_calculadora_when_enabled(client, landing_factory):
    landing = landing_factory(config={"calculadora": {
        "enabled": True, "efectivo_product_id": 1,
        "monto": {"min": 500, "max": 8000, "step": 100},
        "plazos": [6, 12], "inicial": {"percents": [0]}, "tea": 89.9,
    }})
    r = client.get(f"/public/landing/{landing.slug}/config")
    assert r.status_code == 200
    calc = r.json()["config"]["calculadora"]
    assert calc["enabled"] is True
    assert calc["monto"]["max"] == 8000
    assert calc["plazos"] == [6, 12]


def test_public_config_calculadora_disabled_by_default(client, landing_factory):
    landing = landing_factory()  # sin calculadora
    r = client.get(f"/public/landing/{landing.slug}/config")
    calc = r.json()["config"].get("calculadora", {"enabled": False})
    assert calc["enabled"] is False
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /d/repos/ws2-wt-calcefec && python -m pytest tests/api/routers/test_public_landing_config_calculadora.py -v`
Expected: FAIL (namespace `calculadora` ausente).

- [ ] **Step 3: Write minimal implementation**

En el builder del config público, tras construir el dict `config` de namespaces, añadir:

```python
from app.services.calculadora_config import normalize_calculadora
# ... donde se arma `config` (junto a deferred_payment):
config["calculadora"] = normalize_calculadora((landing_config or {}).get("calculadora"))
```

Donde `landing_config` es el `landing.config` (columna JSON) del objeto landing. Emitir siempre el namespace (con `enabled: false` por defecto) para simplificar el consumo del FE.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /d/repos/ws2-wt-calcefec && python -m pytest tests/api/routers/test_public_landing_config_calculadora.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /d/repos/ws2-wt-calcefec
git add -A
git commit -m "feat(calculadora): exponer namespace calculadora en /public/landing/{slug}/config

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task A4: Endpoint público `simulate`

**Files:**
- Modify: `app/api/routers/public/simulator.py` (añadir router path bajo `/public`)
- Test: `tests/api/routers/test_calculadora_simulate.py`

**Interfaces:**
- Consumes: `normalize_calculadora`, `validate_simulate_input` (A1); `LoanCalculatorService.calculate_loan(principal, tea_percent, term_months)` → `LoanResult(cuota_base, commission, cuota_total, tea_irr, tcea_irr)`; `LandingService.get_landing_by_slug`.
- Produces: `POST /public/landing/{slug}/calculadora/simulate` con el contrato de Global Constraints. `cuota = LoanResult.cuota_total`. `inicial_amount = round(monto * inicial_percent/100)`. `financiado = monto - inicial_amount`. `principal = financiado`.

- [ ] **Step 1: Write the failing test**

```python
# tests/api/routers/test_calculadora_simulate.py
def test_simulate_happy_path(client, landing_factory):
    landing = landing_factory(config={"calculadora": {
        "enabled": True, "efectivo_product_id": 1,
        "monto": {"min": 500, "max": 8000, "step": 100},
        "plazos": [6, 12], "inicial": {"percents": [0, 10]}, "tea": 89.9,
    }})
    r = client.post(
        f"/public/landing/{landing.slug}/calculadora/simulate",
        json={"monto": 3000, "plazo": 12, "inicial_percent": 10},
    )
    assert r.status_code == 200
    b = r.json()
    assert b["monto"] == 3000
    assert b["inicial_amount"] == 300
    assert b["financiado"] == 2700
    assert b["cuota"] > 0
    assert b["tea"] == 89.9


def test_simulate_out_of_range_422(client, landing_factory):
    landing = landing_factory(config={"calculadora": {
        "enabled": True, "efectivo_product_id": 1,
        "monto": {"min": 500, "max": 8000, "step": 100},
        "plazos": [6, 12], "inicial": {"percents": [0]}, "tea": 89.9,
    }})
    r = client.post(
        f"/public/landing/{landing.slug}/calculadora/simulate",
        json={"monto": 100, "plazo": 12, "inicial_percent": 0},
    )
    assert r.status_code == 422


def test_simulate_disabled_landing_404(client, landing_factory):
    landing = landing_factory()  # sin calculadora
    r = client.post(
        f"/public/landing/{landing.slug}/calculadora/simulate",
        json={"monto": 3000, "plazo": 12, "inicial_percent": 0},
    )
    assert r.status_code == 404
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /d/repos/ws2-wt-calcefec && python -m pytest tests/api/routers/test_calculadora_simulate.py -v`
Expected: FAIL (404 route not found for happy path).

- [ ] **Step 3: Write minimal implementation**

En `app/api/routers/public/simulator.py`:

```python
from app.db.models.landing import Landing  # si no está importado
from app.services.calculadora_config import (
    normalize_calculadora, validate_simulate_input,
)


class CalculadoraSimulateRequest(BaseModel):
    monto: float = Field(..., gt=0)
    plazo: int = Field(..., ge=1, le=60)
    inicial_percent: float = Field(0, ge=0, le=90)


@router.post("/landing/{slug}/calculadora/simulate")
def calculadora_simulate(
    slug: str, request: CalculadoraSimulateRequest, db: Session = Depends(get_db)
):
    landing = db.query(Landing).filter(Landing.slug == slug).first()
    if not landing:
        raise HTTPException(status_code=404, detail="Landing not found")
    cfg = normalize_calculadora((landing.config or {}).get("calculadora"))
    if not cfg["enabled"]:
        raise HTTPException(status_code=404, detail="Calculadora no habilitada")
    try:
        validate_simulate_input(cfg, request.monto, request.plazo, request.inicial_percent)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    inicial_amount = round(request.monto * request.inicial_percent / 100)
    financiado = request.monto - inicial_amount
    result = LoanCalculatorService.calculate_loan(
        principal=financiado, tea_percent=cfg["tea"], term_months=request.plazo,
    )
    return {
        "monto": request.monto,
        "plazo": request.plazo,
        "inicial_percent": request.inicial_percent,
        "inicial_amount": inicial_amount,
        "financiado": financiado,
        "cuota": result.cuota_total,
        "tea": result.tea_irr or cfg["tea"],
        "tcea": result.tcea_irr,
    }
```

> Nota: `HTTPException` con `status_code=422` es intencional (validación de negocio, no de schema). Si el router ya importa `Landing`/`HTTPException`, no duplicar imports.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /d/repos/ws2-wt-calcefec && python -m pytest tests/api/routers/test_calculadora_simulate.py -v`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd /d/repos/ws2-wt-calcefec
git add app/api/routers/public/simulator.py tests/api/routers/test_calculadora_simulate.py
git commit -m "feat(calculadora): endpoint publico simulate (monto/plazo/inicial -> cuota)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task A5: `ProductType.EFECTIVO` + producto efectivo por-landing (legacy unlock)

**Files:**
- Modify: `app/db/models/products.py` (enum `ProductType`, ~línea 27-33)
- Modify: `app/services/legacy/legacy_sync_payload_builder.py` (ramas por tipo, ~línea 235-253: tratar `efectivo` como producto normal → usa `legacy_product_id`, no `legacy_peripheral_id`)
- Create: `alembic/versions/xxxx_add_efectivo_product_type.py` (migración del enum, si el enum es un tipo Postgres; si es string/`Enum` de Python sin tipo DB, no requiere migración)
- Test: `tests/services/test_legacy_efectivo_product.py`

**Interfaces:**
- Produces: `ProductType.EFECTIVO`. Un `Product` de tipo `EFECTIVO` con `legacy_product_id` resuelve correctamente en `_resolve_legacy_product_id` y el payload legacy lo trata como producto (no periférico).

- [ ] **Step 1: Write the failing test**

```python
# tests/services/test_legacy_efectivo_product.py
from app.db.models.products import ProductType


def test_efectivo_product_type_exists():
    assert ProductType.EFECTIVO.value == "efectivo"


def test_legacy_payload_uses_product_id_for_efectivo(db_session, product_factory):
    # producto efectivo con legacy_product_id
    p = product_factory(type=ProductType.EFECTIVO, legacy_product_id=9999)
    from app.services.legacy.solicitud import _resolve_legacy_product_id  # o clase equivalente
    assert _resolve_legacy_product_id(p.id, db_session) == 9999
```

> Adaptar `_resolve_legacy_product_id` al símbolo real (ver `app/services/legacy/solicitud.py:252-262`); si es método de clase, invocarlo como corresponde. `product_factory` de los fixtures existentes de products; añadir kwargs `type`/`legacy_product_id`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /d/repos/ws2-wt-calcefec && python -m pytest tests/services/test_legacy_efectivo_product.py -v`
Expected: FAIL (`ProductType.EFECTIVO` no existe).

- [ ] **Step 3: Write minimal implementation**

En `app/db/models/products.py`:

```python
class ProductType(str, enum.Enum):
    LAPTOP = "laptop"
    CELULAR = "celular"
    TABLET = "tablet"
    MOTO = "moto"
    ACCESORIO = "accesorio"
    SEGURO = "seguro"
    EFECTIVO = "efectivo"   # préstamo en efectivo (riel legacy; monto en runtime)
```

En `legacy_sync_payload_builder.py` (~235-253) asegurar que `efectivo` cae en la rama de `legacy_product_id` (como `laptop`), no en periféricos. Si hay un `if product.type in (LAPTOP, CELULAR, ...)`, agregar `EFECTIVO`.

Si el enum tiene tipo Postgres, crear migración Alembic que haga `ALTER TYPE producttype ADD VALUE 'efectivo'` (o el nombre real del tipo). Verificar con `alembic heads` que quede sobre `origin/main`.

- [ ] **Step 4: Run test + migración**

Run: `cd /d/repos/ws2-wt-calcefec && python -m pytest tests/services/test_legacy_efectivo_product.py -v`
Expected: PASS.
Si hay migración: `alembic upgrade head` corre sin error.

- [ ] **Step 5: Commit**

```bash
cd /d/repos/ws2-wt-calcefec
git add -A
git commit -m "feat(calculadora): ProductType.EFECTIVO y rama legacy de producto efectivo

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

> **Nota de datos (fuera de código):** crear/seed del `Product` efectivo real con `legacy_product_id` válido y su `LandingProduct` por landing se hace por dato/seed en cada ambiente; el `efectivo_product_id` de la config debe apuntar a ese Product. Documentar en el PR de ws2.

---

## FASE B — admin2 · worktree `D:\repos\admin2-wt-calcefec`

### Task B1: Tipos `CalculadoraConfig`

**Files:**
- Modify: `src/types/landing.ts` (añadir tipos + un `EditorTab` `'calculadora'`)

**Interfaces:**
- Produces:
  ```ts
  export interface CalculadoraMonto { min: number; max: number; step: number; }
  export interface CalculadoraInicial { percents: number[]; }
  export interface CalculadoraConfig {
    enabled: boolean;
    efectivo_product_id: number | null;
    monto: CalculadoraMonto;
    plazos: number[];
    inicial: CalculadoraInicial;
    tea: number;
  }
  export const DEFAULT_CALCULADORA_CONFIG: CalculadoraConfig;
  ```

- [ ] **Step 1: Add types**

En `src/types/landing.ts`:

```ts
export interface CalculadoraMonto { min: number; max: number; step: number; }
export interface CalculadoraInicial { percents: number[]; }
export interface CalculadoraConfig {
  enabled: boolean;
  efectivo_product_id: number | null;
  monto: CalculadoraMonto;
  plazos: number[];
  inicial: CalculadoraInicial;
  tea: number;
}
export const DEFAULT_CALCULADORA_CONFIG: CalculadoraConfig = {
  enabled: false,
  efectivo_product_id: null,
  monto: { min: 0, max: 0, step: 100 },
  plazos: [],
  inicial: { percents: [0] },
  tea: 0,
};
```

Y agregar `'calculadora'` al union `EditorTab` (líneas ~546-564).

- [ ] **Step 2: Typecheck**

Run: `cd /d/repos/admin2-wt-calcefec && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
cd /d/repos/admin2-wt-calcefec
git add src/types/landing.ts
git commit -m "feat(calculadora): tipos CalculadoraConfig y EditorTab

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task B2: Servicio `get/updateCalculadoraConfig`

**Files:**
- Modify: `src/services/landings.service.ts` (junto a `getSolicitarConfig`/`updateSolicitarConfig`, ~2893-2913)

**Interfaces:**
- Consumes: contrato admin A2; `apiClient` (transforma camel↔snake).
- Produces:
  - `getCalculadoraConfig(landingId: number): Promise<CalculadoraConfig>`
  - `updateCalculadoraConfig(landingId: number, config: CalculadoraConfig): Promise<CalculadoraConfig>`

- [ ] **Step 1: Add service methods**

```ts
// dentro de landingsService, junto a getSolicitarConfig
async getCalculadoraConfig(landingId: number): Promise<CalculadoraConfig> {
  const res = await apiClient.get(`/landings/${landingId}/calculadora-config`);
  return (res.data?.calculadora ?? DEFAULT_CALCULADORA_CONFIG) as CalculadoraConfig;
},
async updateCalculadoraConfig(landingId: number, config: CalculadoraConfig): Promise<CalculadoraConfig> {
  const res = await apiClient.put(`/landings/${landingId}/calculadora-config`, { calculadora: config });
  return (res.data?.calculadora ?? config) as CalculadoraConfig;
},
```

> Importar `CalculadoraConfig`, `DEFAULT_CALCULADORA_CONFIG` de `@/types/landing`. Cuidar que `apiClient` no snake-case las keys de `calculadora` de forma que rompa el contrato (los sub-objetos `monto`/`inicial` usan keys ya en snake/simple; `efectivo_product_id` ↔ `efectivoProductId` — verificar el auto-transform y, si aplica, enviar el bloque como `value_override`-style raw). Si el transform interfiere, enviar `{ calculadora: config }` como raw sin transformar (ver cómo `floating-cta-on` maneja su JSON en presets).

- [ ] **Step 2: Typecheck**

Run: `cd /d/repos/admin2-wt-calcefec && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
cd /d/repos/admin2-wt-calcefec
git add src/services/landings.service.ts
git commit -m "feat(calculadora): servicio get/updateCalculadoraConfig

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task B3: Sección "Calculadora" en el editor de landing

**Files:**
- Create: `src/components/landings/sections/CalculadoraSection.tsx`
- Modify: `src/components/landings/LandingEditor.tsx` (TABS ~36-55, `isTabVisible` ~78-91, render condicional ~750-900)

**Interfaces:**
- Consumes: `landingsService.getCalculadoraConfig/updateCalculadoraConfig` (B2); tipos (B1).
- Produces: `<CalculadoraSection landingId={number} />`.

- [ ] **Step 1: Create the section component**

```tsx
// src/components/landings/sections/CalculadoraSection.tsx
'use client';
import { useEffect, useState } from 'react';
import { landingsService } from '@/services/landings.service';
import { CalculadoraConfig, DEFAULT_CALCULADORA_CONFIG } from '@/types/landing';

export function CalculadoraSection({ landingId }: { landingId: number }) {
  const [config, setConfig] = useState<CalculadoraConfig>(DEFAULT_CALCULADORA_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plazosText, setPlazosText] = useState('');
  const [inicialText, setInicialText] = useState('');

  useEffect(() => {
    landingsService.getCalculadoraConfig(landingId).then((c) => {
      setConfig(c);
      setPlazosText(c.plazos.join(', '));
      setInicialText(c.inicial.percents.join(', '));
      setLoading(false);
    });
  }, [landingId]);

  const parseNums = (s: string) =>
    s.split(',').map((x) => parseInt(x.trim(), 10)).filter((n) => Number.isFinite(n));

  const save = async () => {
    setSaving(true);
    const payload: CalculadoraConfig = {
      ...config,
      plazos: parseNums(plazosText),
      inicial: { percents: parseNums(inicialText).length ? parseNums(inicialText) : [0] },
    };
    const saved = await landingsService.updateCalculadoraConfig(landingId, payload);
    setConfig(saved);
    setSaving(false);
  };

  if (loading) return <p className="text-sm text-gray-500">Cargando…</p>;

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={config.enabled}
          onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} />
        <span>Habilitar calculadora de efectivo (reemplaza el catálogo)</span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Producto efectivo (ID)
          <input type="number" className="mt-1 w-full border rounded px-2 py-1"
            value={config.efectivo_product_id ?? ''}
            onChange={(e) => setConfig({ ...config, efectivo_product_id: e.target.value ? Number(e.target.value) : null })} />
        </label>
        <label className="text-sm">TEA (%)
          <input type="number" step="0.01" className="mt-1 w-full border rounded px-2 py-1"
            value={config.tea}
            onChange={(e) => setConfig({ ...config, tea: Number(e.target.value) })} />
        </label>
        <label className="text-sm">Monto mín
          <input type="number" className="mt-1 w-full border rounded px-2 py-1"
            value={config.monto.min}
            onChange={(e) => setConfig({ ...config, monto: { ...config.monto, min: Number(e.target.value) } })} />
        </label>
        <label className="text-sm">Monto máx
          <input type="number" className="mt-1 w-full border rounded px-2 py-1"
            value={config.monto.max}
            onChange={(e) => setConfig({ ...config, monto: { ...config.monto, max: Number(e.target.value) } })} />
        </label>
        <label className="text-sm">Paso de monto
          <input type="number" className="mt-1 w-full border rounded px-2 py-1"
            value={config.monto.step}
            onChange={(e) => setConfig({ ...config, monto: { ...config.monto, step: Number(e.target.value) } })} />
        </label>
      </div>

      <label className="block text-sm">Plazos permitidos (meses, separados por coma)
        <input className="mt-1 w-full border rounded px-2 py-1" value={plazosText}
          onChange={(e) => setPlazosText(e.target.value)} placeholder="6, 9, 12, 18, 24" />
      </label>
      <label className="block text-sm">Inicial permitida (%, separados por coma)
        <input className="mt-1 w-full border rounded px-2 py-1" value={inicialText}
          onChange={(e) => setInicialText(e.target.value)} placeholder="0, 10, 20" />
      </label>

      <button onClick={save} disabled={saving}
        className="px-4 py-2 rounded bg-[#4654CD] text-white disabled:opacity-50">
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  );
}
```

> Estilo mínimo funcional; alinear con los componentes de `sections/*` existentes (mismos wrappers/labels que `SolicitarFlowSection.tsx`) al integrarlo. El color de marca es `#4654CD`.

- [ ] **Step 2: Wire into LandingEditor**

En `LandingEditor.tsx`: agregar entrada `{ id: 'calculadora', label: 'Calculadora' }` a `TABS`; en `isTabVisible()` mostrarla (por ahora siempre, o según tipo de landing); y en el render condicional agregar:

```tsx
{activeTab === 'calculadora' && <CalculadoraSection landingId={landingId} />}
```

- [ ] **Step 3: Typecheck + build**

Run: `cd /d/repos/admin2-wt-calcefec && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 4: Commit**

```bash
cd /d/repos/admin2-wt-calcefec
git add src/components/landings/sections/CalculadoraSection.tsx src/components/landings/LandingEditor.tsx
git commit -m "feat(calculadora): seccion de configuracion en el editor de landing

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## FASE C — baldecash · worktree `D:\repos\baldecash-wt-calcefec`

### Task C1: Tipo + accessor `getCalculadora`

**Files:**
- Modify: `src/app/prototipos/0.6/types/landingConfig.ts`
- Test: `src/app/prototipos/0.6/types/__tests__/landingConfig.calculadora.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface CalculadoraConfig {
    enabled: boolean;
    efectivoProductId: number | null;
    monto: { min: number; max: number; step: number };
    plazos: number[];
    inicial: { percents: number[] };
    tea: number;
  }
  export function getCalculadora(config: LandingConfig): CalculadoraConfig | null;
  ```
  (Devuelve `null` si ausente o `enabled != true`, como `getDeferredPayment`.)

- [ ] **Step 1: Write the failing test**

```ts
// landingConfig.calculadora.test.ts
import { getCalculadora, DEFAULT_LANDING_CONFIG } from '../landingConfig';

test('returns null when calculadora namespace absent', () => {
  expect(getCalculadora(DEFAULT_LANDING_CONFIG)).toBeNull();
});

test('returns null when disabled', () => {
  const cfg = { ...DEFAULT_LANDING_CONFIG, calculadora: { enabled: false } } as any;
  expect(getCalculadora(cfg)).toBeNull();
});

test('maps snake_case efectivo_product_id and coerces fields', () => {
  const cfg = {
    ...DEFAULT_LANDING_CONFIG,
    calculadora: {
      enabled: true,
      efectivo_product_id: 123,
      monto: { min: 500, max: 8000, step: 100 },
      plazos: [6, 12],
      inicial: { percents: [0, 10] },
      tea: 89.9,
    },
  } as any;
  const out = getCalculadora(cfg)!;
  expect(out.enabled).toBe(true);
  expect(out.efectivoProductId).toBe(123);
  expect(out.monto.max).toBe(8000);
  expect(out.plazos).toEqual([6, 12]);
  expect(out.inicial.percents).toEqual([0, 10]);
  expect(out.tea).toBeCloseTo(89.9);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /d/repos/baldecash-wt-calcefec && npx jest landingConfig.calculadora --silent`
Expected: FAIL (`getCalculadora` no existe).

- [ ] **Step 3: Write minimal implementation**

Añadir a `landingConfig.ts` (después de `getDeferredPayment`):

```ts
export interface CalculadoraConfig {
  enabled: boolean;
  efectivoProductId: number | null;
  monto: { min: number; max: number; step: number };
  plazos: number[];
  inicial: { percents: number[] };
  tea: number;
}

/**
 * Extrae de forma segura el namespace `calculadora`. Devuelve null cuando está
 * ausente o no está habilitado (fail-safe, como getDeferredPayment).
 */
export function getCalculadora(config: LandingConfig): CalculadoraConfig | null {
  const raw = (config as Record<string, unknown>)['calculadora'] as
    | Record<string, unknown>
    | undefined;
  if (!raw || raw.enabled !== true) return null;
  const monto = (raw.monto ?? {}) as Record<string, unknown>;
  const inicial = (raw.inicial ?? {}) as Record<string, unknown>;
  const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
  const nums = (v: unknown) => (Array.isArray(v) ? v.map((x) => Number(x)).filter(Number.isFinite) : []);
  return {
    enabled: true,
    efectivoProductId:
      typeof raw.efectivo_product_id === 'number' ? raw.efectivo_product_id : null,
    monto: { min: num(monto.min), max: num(monto.max), step: num(monto.step, 100) || 100 },
    plazos: nums(raw.plazos),
    inicial: { percents: nums(inicial.percents).length ? nums(inicial.percents) : [0] },
    tea: num(raw.tea),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /d/repos/baldecash-wt-calcefec && npx jest landingConfig.calculadora --silent`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /d/repos/baldecash-wt-calcefec
git add src/app/prototipos/0.6/types/landingConfig.ts src/app/prototipos/0.6/types/__tests__/landingConfig.calculadora.test.ts
git commit -m "feat(calculadora): tipo CalculadoraConfig y accessor getCalculadora

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task C2: Cliente API `simulateCalculadora`

**Files:**
- Create: `src/app/prototipos/0.6/services/calculadoraApi.ts`
- Test: `src/app/prototipos/0.6/services/__tests__/calculadoraApi.test.ts`

**Interfaces:**
- Consumes: contrato `simulate` (A4).
- Produces:
  ```ts
  export interface CalculadoraSimulation {
    monto: number; plazo: number; inicialPercent: number; inicialAmount: number;
    financiado: number; cuota: number; tea: number; tcea: number;
  }
  export function simulateCalculadora(
    slug: string, input: { monto: number; plazo: number; inicialPercent: number }
  ): Promise<CalculadoraSimulation>;
  ```

- [ ] **Step 1: Write the failing test**

```ts
// calculadoraApi.test.ts
import { simulateCalculadora } from '../calculadoraApi';

global.fetch = jest.fn(async () => ({
  ok: true,
  json: async () => ({
    monto: 3000, plazo: 12, inicial_percent: 10, inicial_amount: 300,
    financiado: 2700, cuota: 320, tea: 89.9, tcea: 95.1,
  }),
})) as unknown as typeof fetch;

test('maps snake_case response to camelCase', async () => {
  const out = await simulateCalculadora('home', { monto: 3000, plazo: 12, inicialPercent: 10 });
  expect(out.inicialAmount).toBe(300);
  expect(out.financiado).toBe(2700);
  expect(out.cuota).toBe(320);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /d/repos/baldecash-wt-calcefec && npx jest calculadoraApi --silent`
Expected: FAIL (módulo no existe).

- [ ] **Step 3: Write minimal implementation**

```ts
// src/app/prototipos/0.6/services/calculadoraApi.ts
import { API_BASE_URL } from './landingConfigApi'; // reutilizar la base ya usada por fetchLandingConfig

export interface CalculadoraSimulation {
  monto: number; plazo: number; inicialPercent: number; inicialAmount: number;
  financiado: number; cuota: number; tea: number; tcea: number;
}

export async function simulateCalculadora(
  slug: string,
  input: { monto: number; plazo: number; inicialPercent: number },
): Promise<CalculadoraSimulation> {
  const res = await fetch(`${API_BASE_URL}/public/landing/${slug}/calculadora/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ monto: input.monto, plazo: input.plazo, inicial_percent: input.inicialPercent }),
  });
  if (!res.ok) throw new Error(`simulate failed: ${res.status}`);
  const d = await res.json();
  return {
    monto: d.monto, plazo: d.plazo, inicialPercent: d.inicial_percent,
    inicialAmount: d.inicial_amount, financiado: d.financiado,
    cuota: d.cuota, tea: d.tea, tcea: d.tcea,
  };
}
```

> Verificar cómo `landingConfigApi.ts` construye su base URL (`API_BASE_URL` o similar) y reutilizar ese símbolo exacto; si no está exportado, replicar la misma construcción.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /d/repos/baldecash-wt-calcefec && npx jest calculadoraApi --silent`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /d/repos/baldecash-wt-calcefec
git add src/app/prototipos/0.6/services/calculadoraApi.ts src/app/prototipos/0.6/services/__tests__/calculadoraApi.test.ts
git commit -m "feat(calculadora): cliente API simulateCalculadora

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task C3: Ruta `routes.calculadora` + gate catálogo→calculadora

**Files:**
- Modify: `src/app/prototipos/0.6/utils/routes.ts` (añadir `calculadora` junto a `catalogo`/`solicitarKyc`, y al namespace `routes`)
- Modify: `src/app/prototipos/0.6/[landing]/catalogo/page.tsx` (redirigir a calculadora cuando esté habilitada)

**Interfaces:**
- Consumes: `getCalculadora` (C1).
- Produces: `routes.calculadora(landing: string): string` → `${BASE_PATH}/${landing}/calculadora`.

- [ ] **Step 1: Add route helper**

En `routes.ts`:

```ts
/** Calculadora de efectivo: /{landing}/calculadora */
export function calculadora(landing: string): string {
  return `${BASE_PATH}/${landing}/calculadora`;
}
```

Y agregar `calculadora,` al objeto `routes` (junto a `catalogo`).

- [ ] **Step 2: Gate the catalog page**

En `catalogo/page.tsx`, tras `fetchLandingConfig`:

```tsx
import { getCalculadora } from '../../types/landingConfig';
// ...
const landingConfig = await fetchLandingConfig(landing);

if (getCalculadora(landingConfig)) {
  redirect(routes.calculadora(landing));
}
if (!landingConfig.layout.has_catalog) {
  redirect(routes.landingHome(landing));
}
```

- [ ] **Step 3: Typecheck**

Run: `cd /d/repos/baldecash-wt-calcefec && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 4: Commit**

```bash
cd /d/repos/baldecash-wt-calcefec
git add src/app/prototipos/0.6/utils/routes.ts src/app/prototipos/0.6/[landing]/catalogo/page.tsx
git commit -m "feat(calculadora): route helper y gate catalogo->calculadora

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task C4: Ruta `[landing]/calculadora` + `CalculadoraClient` (gate + UI + submit)

**Files:**
- Create: `src/app/prototipos/0.6/[landing]/calculadora/page.tsx`
- Create: `src/app/prototipos/0.6/[landing]/calculadora/CalculadoraClient.tsx`
- Test: `src/app/prototipos/0.6/[landing]/calculadora/__tests__/CalculadoraClient.test.tsx`

**Interfaces:**
- Consumes: `fetchLandingConfig`, `getCalculadora` (C1), `simulateCalculadora` (C2), `routes` (C3), `useSubmitApplication` (patrón `product_data` de `useSubmitApplication.ts:314-346`).
- Produces: página server que gatea (redirige a `landingHome` si `getCalculadora` es null) y renderiza `CalculadoraClient` con la config.

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/CalculadoraClient.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalculadoraClient } from '../CalculadoraClient';
import * as api from '@/app/prototipos/0.6/services/calculadoraApi';

jest.mock('@/app/prototipos/0.6/services/calculadoraApi');

const config = {
  enabled: true as const, efectivoProductId: 123,
  monto: { min: 500, max: 8000, step: 100 },
  plazos: [6, 12], inicial: { percents: [0, 10] }, tea: 89.9,
};

test('renders monto range and plazo options from config', () => {
  render(<CalculadoraClient landing="home" config={config} />);
  expect(screen.getByText(/6 meses/i)).toBeInTheDocument();
  expect(screen.getByText(/12 meses/i)).toBeInTheDocument();
});

test('shows cuota after simulate', async () => {
  (api.simulateCalculadora as jest.Mock).mockResolvedValue({
    monto: 3000, plazo: 12, inicialPercent: 0, inicialAmount: 0,
    financiado: 3000, cuota: 350, tea: 89.9, tcea: 95,
  });
  render(<CalculadoraClient landing="home" config={config} />);
  fireEvent.click(screen.getByText(/12 meses/i));
  await waitFor(() => expect(screen.getByText(/350/)).toBeInTheDocument());
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /d/repos/baldecash-wt-calcefec && npx jest CalculadoraClient --silent`
Expected: FAIL (componente no existe).

- [ ] **Step 3: Write the page + client**

`page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { fetchLandingConfig } from '../../services/landingConfigApi';
import { getCalculadora } from '../../types/landingConfig';
import { routes } from '../../utils/routes';
import { CalculadoraClient } from './CalculadoraClient';

export default async function CalculadoraPage({
  params,
}: { params: Promise<{ landing: string }> }) {
  const { landing } = await params;
  const config = await fetchLandingConfig(landing);
  const calc = getCalculadora(config);
  if (!calc) redirect(routes.landingHome(landing));
  return <CalculadoraClient landing={landing} config={calc} />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
```

`CalculadoraClient.tsx` (esqueleto funcional; adaptar chrome/estilos de `PricingCalculator.tsx` y del `KycChrome` de `kycClient.tsx`):

```tsx
'use client';
import { useEffect, useState } from 'react';
import type { CalculadoraConfig } from '../../types/landingConfig';
import { simulateCalculadora, type CalculadoraSimulation } from '../../services/calculadoraApi';
import { useSubmitApplication } from '../solicitar/hooks/useSubmitApplication';

export function CalculadoraClient({ landing, config }: { landing: string; config: CalculadoraConfig }) {
  const [monto, setMonto] = useState(config.monto.min);
  const [plazo, setPlazo] = useState<number | null>(config.plazos[0] ?? null);
  const [inicialPercent, setInicialPercent] = useState(config.inicial.percents[0] ?? 0);
  const [sim, setSim] = useState<CalculadoraSimulation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { submitApplication } = useSubmitApplication();

  // Cuota en vivo (debounced) — ws2 es la fuente de verdad.
  useEffect(() => {
    if (plazo == null) return;
    setError(null);
    const t = setTimeout(() => {
      simulateCalculadora(landing, { monto, plazo, inicialPercent })
        .then(setSim)
        .catch(() => { setSim(null); setError('No se pudo calcular la cuota.'); });
    }, 350);
    return () => clearTimeout(t);
  }, [landing, monto, plazo, inicialPercent]);

  const canContinue = !!sim && !error && plazo != null;

  const onContinue = () => {
    if (!sim || plazo == null) return;
    // product_data efectivo: monto -> unit_price; el resto son hints (ws2 recalcula).
    submitApplication({
      productData: {
        product_id: config.efectivoProductId,
        unit_price: monto,
        term: plazo,
        term_months: plazo,
        initial_percent: inicialPercent,
        initial_amount: sim.inicialAmount,
        monthly_payment: sim.cuota,
        tea: sim.tea,
        payment_frequency: 'mensual',
      },
      // ...resto de campos que requiera submitApplication (lead, etc.)
    } as never);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <h1 className="text-lg font-semibold">Calcula tu préstamo en efectivo</h1>

      <label className="block text-sm">Monto: S/ {monto}
        <input type="range" min={config.monto.min} max={config.monto.max} step={config.monto.step}
          value={monto} onChange={(e) => setMonto(Number(e.target.value))} className="w-full" />
      </label>

      <div className="flex flex-wrap gap-2">
        {config.plazos.map((p) => (
          <button key={p} onClick={() => setPlazo(p)}
            className={`px-3 py-2 rounded border ${plazo === p ? 'border-[#4654CD] bg-[#4654CD]/10' : 'border-neutral-300'}`}>
            {p} meses
          </button>
        ))}
      </div>

      {config.inicial.percents.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {config.inicial.percents.map((pct) => (
            <button key={pct} onClick={() => setInicialPercent(pct)}
              className={`px-3 py-2 rounded border ${inicialPercent === pct ? 'border-[#4654CD] bg-[#4654CD]/10' : 'border-neutral-300'}`}>
              Inicial {pct}%
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-white border p-4">
        {error ? <p className="text-red-600 text-sm">{error}</p>
          : sim ? <p className="text-sm">Tu cuota mensual: <strong>S/ {sim.cuota}</strong></p>
          : <p className="text-sm text-neutral-500">Calculando…</p>}
      </div>

      <button onClick={onContinue} disabled={!canContinue}
        className="w-full px-4 py-3 rounded-xl bg-[#4654CD] text-white disabled:opacity-50">
        Continuar
      </button>
    </div>
  );
}
```

> **Integración a verificar al implementar:** la firma real de `useSubmitApplication().submitApplication` y qué campos (lead/OTP/coupon) exige antes de `product_data`. Ajustar `onContinue` para reunir esos campos (probablemente esta pantalla necesite recolectar datos de lead como el resto del flujo, o encadenar a `routes.solicitar(landing)` pasando el `product_data` por estado/URL). Envolver en el `KycChrome`-equivalente (navbar+footer+fondo neutro) reutilizando `useLayout` como `kycClient.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /d/repos/baldecash-wt-calcefec && npx jest CalculadoraClient --silent`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd /d/repos/baldecash-wt-calcefec
git add "src/app/prototipos/0.6/[landing]/calculadora"
git commit -m "feat(calculadora): ruta y CalculadoraClient (gate, UI, continuar a solicitud)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-review (cobertura del spec)

- §5.1 ws2 config/normalize → A1 ✅ · admin GET/PUT → A2 ✅ · namespace público → A3 ✅ · simulate → A4 ✅ · ProductType.EFECTIVO + legacy → A5 ✅ · seed producto (dato) → nota en A5 ✅
- §5.2 admin2 tipos → B1 ✅ · servicio → B2 ✅ · sección editor → B3 ✅
- §5.3 baldecash accessor → C1 ✅ · api → C2 ✅ · route+gate → C3 ✅ · ruta+client+submit → C4 ✅
- §6 errores: fail-safe (A1/C1), 422/404 (A4), FE deshabilita Continuar en error (C4) ✅

**Punto abierto resuelto:** el config público que lee `fetchLandingConfig` es `GET /public/landing/{slug}/config`; el namespace `calculadora` se inyecta ahí (A3). Se elimina el GET público dedicado (YAGNI).

**Verificaciones deferidas a implementación (documentadas en cada tarea):** símbolos exactos de auth admin (A2), builder concreto del config público (A3), `_resolve_legacy_product_id` (A5), auto-transform de `apiClient` (B2), `API_BASE_URL` (C2), firma de `submitApplication` (C4).
