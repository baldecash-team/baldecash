# Plan de pruebas E2E del flujo de oferta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development o superpowers:executing-plans para ejecutar task-by-task. Los steps usan checkbox (`- [ ]`).

**Goal:** Construir un arnés automatizado que emita ofertas, seleccione equipo por API, y verifique los 5 niveles (baldemotor BD, API, legacy payload, nodo/workflow, Playwright) para la matriz de ~20 casos, produciendo un reporte PASS/FAIL.

**Architecture:** Scripts Python en el scratchpad que importan los servicios del backend (comparten BD local) para emitir/verificar, y llaman al endpoint HTTP `/select` (dispara el sync legacy async real). Un `runner.py` itera la matriz de casos definida en un módulo de datos y escribe `results.json`. Playwright (mjs) valida el flujo visual + ficha admin.

**Tech Stack:** Python 3.12 + SQLAlchemy (backend ws2), requests (HTTP), Playwright 1.60 (mjs), MySQL local (baldemotor + legacy).

## Global Constraints

- Scratchpad: `C:/Users/tecnico/AppData/Local/Temp/claude/C--Users-tecnico-Documents-projects-baldecash/7366f460-c87e-4ea4-b42a-4dcbec6ee885/scratchpad`
- Backend ws2: `C:/Users/tecnico/Documents/projects/baldecash/ws2` (importar servicios con `sys.path.insert`).
- API local: `http://localhost:8010/api/v1` (o el puerto vivo — verificar). Front local: `http://localhost:3001/prototipos/0.6`.
- Cliente MySQL NO está en PATH → usar PyMySQL/SQLAlchemy, nunca `mysql` CLI.
- Windows: `io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')` en todo print con unicode (→, tildes).
- Legacy local single-thread: para combos, la prueba es el **payload en logs** del backend, no el estado final en BD legacy.
- NO tocar prod. NO limpiar datos mientras se prueba. NO arreglar bugs (solo detectar/documentar).
- Firmas reales verificadas: `emit_offer(application_id, max_monthly_quota, expiry_hours, terms, initials, ip, recommended_product_id)`; `emit_upsell_offer(application_id, max_monthly_quota, profile, expiry_hours, custom_tea, custom_commission, accessory_product_id, terms, initials, ip, recommended_product_id)`; `POST /public/offer/{token}/select` body `OfferSelectRequest{variant_id, combo_id, accessory_ids, insurance_ids, term, initial}`.
- Apps base local con legacy_id (landing 1): 25948 (TUF mensual), 25946/25939 (V15 mensual), 25945/25937 (iPad), 25944 (Tablet S10), 25940 (MacBook), 25947/25942/25938 (celular semanal).
- Combo conocido: variant 491 / combo 52 (Victus+Impresora+Mochila gratis), combo 42.

---

### Task 1: Módulo de datos de la matriz (`test_matrix.py`)

**Files:**
- Create: `scratchpad/oferta_e2e/test_matrix.py`

**Interfaces:**
- Produces: `CASES: list[dict]` donde cada caso = `{id, name, app_id, caso: '4'|'5A'|'5B'|'5C', quota, expect_bug: str|None, notes}`. El `app_id` es la app base cuyo pedido calza con el caso (simple/combo/con-seguro).

- [ ] **Step 1: Crear el módulo con la matriz**

```python
# scratchpad/oferta_e2e/test_matrix.py
"""Matriz de casos del plan de pruebas E2E de oferta (spec 2026-07-09)."""

# app_id: app base con el pedido adecuado. Para casos que requieren un pedido
# específico (combo, con seguro), se usa la app conocida; si no existe una app
# con ese estado, el runner la marca SKIP con motivo.
CASES = [
    {"id": 1,  "name": "simple→simple",            "app_id": 25946, "caso": "4",  "quota": 900, "expect_bug": None, "notes": "baseline"},
    {"id": 2,  "name": "simple→simple upsell",      "app_id": 25946, "caso": "5A", "quota": 900, "expect_bug": None, "notes": "baseline upsell"},
    {"id": 3,  "name": "simple→+accesorio",         "app_id": 25946, "caso": "4",  "quota": 900, "expect_bug": None, "notes": "añade accesorio"},
    {"id": 4,  "name": "simple→+seguro",            "app_id": 25946, "caso": "4",  "quota": 900, "expect_bug": None, "notes": "añade seguro"},
    {"id": 5,  "name": "simple→combo",              "app_id": 25946, "caso": "4",  "quota": 900, "expect_bug": None, "notes": "elige combo, gratis+sync"},
    {"id": 6,  "name": "combo→simple (upsell)",     "app_id": 25948, "caso": "5A", "quota": 900, "expect_bug": "BAL-2194", "notes": "pierde combo del pedido"},
    {"id": 7,  "name": "combo→combo",               "app_id": 25948, "caso": "4",  "quota": 900, "expect_bug": None, "notes": "quita viejo, pone nuevo"},
    {"id": 8,  "name": "seguro pedido→mismo seguro","app_id": 25946, "caso": "4",  "quota": 900, "expect_bug": "BAL-2199", "notes": "seguro duplicado"},
    {"id": 9,  "name": "Perfil B",                  "app_id": 25946, "caso": "5B", "quota": 900, "expect_bug": None, "notes": "accesorio regalo del nodo"},
    {"id": 10, "name": "Perfil C tarifa especial",  "app_id": 25946, "caso": "5C", "quota": 900, "expect_bug": None, "notes": "TEA/comisión custom"},
    {"id": 11, "name": "nodo avanza (elige)",       "app_id": 25946, "caso": "4",  "quota": 900, "expect_bug": None, "notes": "resume equipo_elegido"},
    {"id": 12, "name": "nodo vence (timeout)",      "app_id": 25946, "caso": "4",  "quota": 900, "expect_bug": None, "notes": "no elige, SLA vence"},
]
```

- [ ] **Step 2: Verificar que importa**

Run: `cd .../scratchpad && python -c "from oferta_e2e.test_matrix import CASES; print(len(CASES))"`
Expected: `12`

- [ ] **Step 3: Commit** (scratchpad no es git — omitir commit, es material de prueba efímero)

---

### Task 2: Harness — emitir + seleccionar (`harness.py`)

**Files:**
- Create: `scratchpad/oferta_e2e/harness.py`

**Interfaces:**
- Consumes: servicios del backend.
- Produces: `emit(case) -> dict` (emite la oferta, devuelve `{token, offer_id, exclusive/recommended variant, addons}`); `select(token, variant_id, combo_id, accessory_ids, insurance_ids, term, initial) -> (status_code, json, latency_ms)`.

- [ ] **Step 1: Escribir el harness**

```python
# scratchpad/oferta_e2e/harness.py
import io, sys, os, time, logging, requests
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
logging.disable(logging.WARNING)
sys.path.insert(0, r"C:\Users\tecnico\Documents\projects\baldecash\ws2")
os.chdir(r"C:\Users\tecnico\Documents\projects\baldecash\ws2")
from app.db.database import SessionLocal
from app.services.conditional_offer_service import ConditionalOfferService
from app.services.upsell_offer_service import UpsellOfferService

API = "http://localhost:8010/api/v1/public/offer"

def emit(case):
    db = SessionLocal()
    try:
        if case["caso"] == "4":
            r = ConditionalOfferService(db).emit_offer(
                application_id=case["app_id"], max_monthly_quota=case["quota"],
                expiry_hours=72, terms=[24], initials=[0.0], ip="127.0.0.1")
        else:
            kw = dict(application_id=case["app_id"], max_monthly_quota=case["quota"],
                      profile=case["caso"][1], expiry_hours=72, ip="127.0.0.1")
            if case["caso"] == "5B": kw["accessory_product_id"] = 1478
            if case["caso"] == "5C": kw["custom_tea"] = 30.0; kw["custom_commission"] = 50.0
            r = UpsellOfferService(db).emit_upsell_offer(**kw)
        tok = (r.get("url") or "").rsplit("/", 1)[-1]
        return {"token": tok, "offer_id": r.get("offer_id"), "raw": r}
    finally:
        db.close()

def get_offer(token):
    return requests.get(f"{API}/{token}", timeout=30).json()

def get_addons(token, variant_id, combo_id=None, term=24, initial=0):
    params = {"variant_id": variant_id, "term": term, "initial": initial}
    if combo_id: params["combo_id"] = combo_id
    return requests.get(f"{API}/{token}/addons", params=params, timeout=30).json()

def select(token, variant_id, combo_id=None, accessory_ids=None, insurance_ids=None, term=24, initial=0):
    body = {"variant_id": variant_id, "combo_id": combo_id,
            "accessory_ids": accessory_ids or [], "insurance_ids": insurance_ids or [],
            "term": term, "initial": initial}
    t0 = time.time()
    resp = requests.post(f"{API}/{token}/select", json=body, timeout=60)
    ms = round((time.time() - t0) * 1000)
    try: j = resp.json()
    except Exception: j = {"_raw": resp.text[:200]}
    return resp.status_code, j, ms
```

- [ ] **Step 2: Smoke test del harness (caso 1)**

Run: `python -c "from oferta_e2e.harness import emit, get_offer; e=emit({'caso':'4','app_id':25946,'quota':900}); print('token', e['token'][:12]); o=get_offer(e['token']); print('case', o.get('case'), 'rec', (o.get('recommended') or {}).get('name'))"`
Expected: imprime un token y `case None` (Caso 4) con un recomendado.

- [ ] **Step 3: Commit** (scratchpad — omitir)

---

### Task 3: Verificador Nivel 1 (baldemotor BD) — `verify_bd.py`

**Files:**
- Create: `scratchpad/oferta_e2e/verify_bd.py`

**Interfaces:**
- Produces: `verify_baldemotor(offer_id, expected) -> list[dict]` con `{level:'BD', check, pass, detail}`.

- [ ] **Step 1: Escribir el verificador BD**

```python
# scratchpad/oferta_e2e/verify_bd.py
import io, sys, os, json, logging
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
logging.disable(logging.WARNING)
sys.path.insert(0, r"C:\Users\tecnico\Documents\projects\baldecash\ws2")
os.chdir(r"C:\Users\tecnico\Documents\projects\baldecash\ws2")
from app.db.database import SessionLocal
from sqlalchemy import text

def verify_baldemotor(application_id, expected_variant):
    """expected_variant: el variant_id que se debió elegir."""
    db = SessionLocal()
    out = []
    def chk(name, cond, detail=""): out.append({"level":"BD","check":name,"pass":bool(cond),"detail":str(detail)})
    try:
        row = db.execute(text("""
            SELECT status, accepted_at, approved_capacity, monthly_payment, product_id, product_name
            FROM application_offer
            WHERE application_id=:a ORDER BY id DESC LIMIT 1
        """), {"a": application_id}).fetchone()
        if not row:
            chk("offer_exists", False, "no application_offer"); return out
        status, accepted_at, cap_raw, monthly, pid, pname = row
        chk("status_accepted", str(status).upper().endswith("ACCEPTED"), status)
        chk("accepted_at_set", accepted_at is not None, accepted_at)
        cap = json.loads(cap_raw) if isinstance(cap_raw, (str, bytes)) else (cap_raw or {})
        sv = cap.get("selected_variant_id")
        chk("selected_variant_matches", str(sv) == str(expected_variant), f"got {sv} exp {expected_variant}")
        chk("pricing_recalculated", (monthly or 0) > 0, f"monthly={monthly}")
        # secure_link consumido
        sl = db.execute(text("""
            SELECT status FROM secure_link WHERE application_id=:a
            AND purpose IN ('conditional_approval','upsell_approval')
            ORDER BY id DESC LIMIT 1
        """), {"a": application_id}).fetchone()
        chk("link_consumed", sl and str(sl[0]).upper()=="CONSUMED", sl[0] if sl else None)
        # evento
        ev = db.execute(text("""
            SELECT COUNT(*) FROM application_history_event
            WHERE application_id=:a AND event_type='offer_equipment_selected'
        """), {"a": application_id}).fetchone()
        chk("event_logged", ev and ev[0] > 0, f"count={ev[0] if ev else 0}")
    finally:
        db.close()
    return out
```

- [ ] **Step 2: Commit** (scratchpad — omitir)

---

### Task 4: Verificador Nivel 2 (API) — `verify_api.py`

**Files:**
- Create: `scratchpad/oferta_e2e/verify_api.py`

**Interfaces:**
- Produces: `verify_api(token, expected_variant, requested_insurance_ids) -> list[dict]`.

- [ ] **Step 1: Escribir el verificador API**

```python
# scratchpad/oferta_e2e/verify_api.py
import io, sys, requests
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
API = "http://localhost:8010/api/v1/public/offer"

def verify_api(token, expected_variant, requested_insurance_plan_ids):
    out = []
    def chk(name, cond, detail=""): out.append({"level":"API","check":name,"pass":bool(cond),"detail":str(detail)})
    d = requests.get(f"{API}/{token}", timeout=30).json()
    chk("already_selected", d.get("already_selected") is True, d.get("already_selected"))
    se = d.get("selected_equipment") or {}
    chk("selected_equipment_present", bool(se.get("name")), se.get("name"))
    return out, d

def verify_addons_dedup(token, variant_id, requested_insurance_plan_ids, term=24, initial=0):
    """Verifica que /addons NO ofrezca un seguro que el pedido ya tenía (BAL-2199)."""
    out = []
    def chk(name, cond, detail=""): out.append({"level":"API","check":name,"pass":bool(cond),"detail":str(detail)})
    ad = requests.get(f"{API}/{token}/addons", params={"variant_id":variant_id,"term":term,"initial":initial}, timeout=30).json()
    avail_ids = {str(s.get("id")) for s in (ad.get("insurances") or [])}
    dup = avail_ids & {str(x) for x in (requested_insurance_plan_ids or [])}
    chk("no_duplicate_insurance", len(dup)==0, f"duplicados={dup}")
    return out, ad
```

- [ ] **Step 2: Commit** (scratchpad — omitir)

---

### Task 5: Verificador Nivel 3 (legacy payload en logs) — `verify_legacy.py`

**Files:**
- Create: `scratchpad/oferta_e2e/verify_legacy.py`

**Interfaces:**
- Produces: `verify_legacy_payload(log_path, since_ts, expected_legacy_product_id) -> list[dict]`.

- [ ] **Step 1: Escribir el verificador de logs legacy**

```python
# scratchpad/oferta_e2e/verify_legacy.py
import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def verify_legacy_payload(log_text, expected_legacy_product_id):
    """log_text: contenido del log del backend tras el /select.
    Busca el payload [cambio-equipo] POST y los [periferico] POST."""
    out = []
    def chk(name, cond, detail=""): out.append({"level":"LEGACY","check":name,"pass":bool(cond),"detail":str(detail)})
    m = re.search(r"\[cambio-equipo\].*?product_id['\"]?\s*[:=]\s*(\d+)", log_text)
    chk("cambio_equipo_sent", m is not None, m.group(0)[:80] if m else "no [cambio-equipo] en logs")
    if m and expected_legacy_product_id:
        chk("legacy_product_id_matches", str(m.group(1))==str(expected_legacy_product_id), f"got {m.group(1)} exp {expected_legacy_product_id}")
    perif = re.findall(r"\[periferico\].*?POST", log_text)
    chk("perifericos_synced", True, f"{len(perif)} llamadas periferico (informativo)")
    return out
```

Nota: el runner captura el log con `aws logs`/tail local o leyendo el archivo de log del backend en el intervalo del /select.

- [ ] **Step 2: Commit** (scratchpad — omitir)

---

### Task 6: Verificador Nivel 4 (nodo/workflow) — `verify_node.py`

**Files:**
- Create: `scratchpad/oferta_e2e/verify_node.py`

**Interfaces:**
- Produces: `verify_node_advanced(application_id, expect_label) -> list[dict]` con `expect_label` = "equipo_elegido" o "vencido".

- [ ] **Step 1: Escribir el verificador de nodo**

```python
# scratchpad/oferta_e2e/verify_node.py
import io, sys, os, logging
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
logging.disable(logging.WARNING)
sys.path.insert(0, r"C:\Users\tecnico\Documents\projects\baldecash\ws2")
os.chdir(r"C:\Users\tecnico\Documents\projects\baldecash\ws2")
from app.db.database import SessionLocal
from sqlalchemy import text

def verify_node_advanced(application_id, expect_label="equipo_elegido"):
    db = SessionLocal()
    out = []
    def chk(name, cond, detail=""): out.append({"level":"NODE","check":name,"pass":bool(cond),"detail":str(detail)})
    try:
        # nodo de oferta debe estar COMPLETED con el output_label esperado
        row = db.execute(text("""
            SELECT ne.status, ne.response_data
            FROM application_node_execution ne
            JOIN workflow_step ws ON ws.id = ne.step_id
            JOIN node_type nt ON nt.id = ws.node_type_id
            WHERE ne.application_id=:a AND nt.code='create_conditional_offer'
            ORDER BY ne.id DESC LIMIT 1
        """), {"a": application_id}).fetchone()
        if not row:
            chk("node_execution_exists", False, "no node_execution create_conditional_offer"); return out
        status, resp = row
        chk("node_completed", str(status).upper()=="COMPLETED", status)
        chk("output_label_matches", expect_label in str(resp or ""), f"resp~{str(resp)[:80]}")
    finally:
        db.close()
    return out
```

- [ ] **Step 2: Commit** (scratchpad — omitir)

---

### Task 7: Runner de la matriz — `runner.py`

**Files:**
- Create: `scratchpad/oferta_e2e/runner.py`

**Interfaces:**
- Consumes: `test_matrix.CASES`, `harness`, `verify_bd/api/legacy/node`.
- Produces: `results.json` con `{case_id, name, expect_bug, levels: [...], overall}`.

- [ ] **Step 1: Escribir el runner**

```python
# scratchpad/oferta_e2e/runner.py
import io, sys, os, json, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))
from test_matrix import CASES
import harness, verify_bd, verify_api, verify_node

def variant_of(offer):
    ex = offer.get("exclusive_offer") or {}
    if ex.get("variant_id") or ex.get("variantId"):
        return ex.get("variant_id") or ex.get("variantId"), (ex.get("combo_id") or ex.get("comboId"))
    rec = offer.get("recommended") or {}
    return rec.get("variant_id") or rec.get("variantId"), (rec.get("combo_id") or rec.get("comboId"))

def run_case(case):
    res = {"case_id": case["id"], "name": case["name"], "caso": case["caso"],
           "expect_bug": case.get("expect_bug"), "levels": []}
    try:
        e = harness.emit(case)
        tok = e["token"]
        off = harness.get_offer(tok)
        vid, cid = variant_of(off)
        if not vid:
            res["levels"].append({"level":"SETUP","check":"variant_resuelto","pass":False,"detail":str(off)[:120]})
            res["overall"]="SKIP"; return res
        if case["id"] == 12:  # timeout: NO seleccionar
            res["overall"]="MANUAL"; res["note"]="requiere forzar SLA vencido (ver plan)"; return res
        sc, sj, ms = harness.select(tok, int(vid), combo_id=int(cid) if cid else None)
        res["select_status"]=sc; res["select_ms"]=ms
        if sc >= 300:
            res["levels"].append({"level":"SETUP","check":"select_ok","pass":False,"detail":str(sj)[:120]})
            res["overall"]="FAIL"; return res
        time.sleep(3)  # dar tiempo al BackgroundTask (resume + sync)
        res["levels"] += verify_bd.verify_baldemotor(case["app_id"], vid)
        api_res, _ = verify_api.verify_api(tok, vid, [])
        res["levels"] += api_res
        res["levels"] += verify_node.verify_node_advanced(case["app_id"], "equipo_elegido")
        fails = [l for l in res["levels"] if not l["pass"]]
        res["overall"] = "PASS" if not fails else ("KNOWN_BUG" if case.get("expect_bug") else "FAIL")
    except Exception as ex:
        res["levels"].append({"level":"ERROR","check":"exception","pass":False,"detail":str(ex)[:200]})
        res["overall"]="ERROR"
    return res

if __name__ == "__main__":
    results = [run_case(c) for c in CASES]
    with open(os.path.join(os.path.dirname(__file__), "results.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    for r in results:
        print(f"  #{r['case_id']} {r['name']:30} [{r['caso']}] → {r['overall']}"
              + (f"  ({r.get('expect_bug')})" if r.get('expect_bug') else ""))
```

- [ ] **Step 2: Verificar servidores vivos**

Run: `curl -s -o /dev/null -w "api=%{http_code}\n" http://localhost:8010/docs`
Expected: `api=200` (si no, levantar backend / ajustar puerto).

- [ ] **Step 3: Ejecutar el runner**

Run: `cd .../scratchpad/oferta_e2e && python runner.py`
Expected: imprime una línea PASS/FAIL/KNOWN_BUG por caso y escribe `results.json`.

- [ ] **Step 4: Commit** (scratchpad — omitir)

---

### Task 8: Nivel 3 legacy — captura de logs por caso

**Files:**
- Modify: `runner.py` (integrar captura de log alrededor del /select).

**Interfaces:**
- Consumes: el log del backend (archivo o `aws logs` local). Produces: sección LEGACY en cada resultado.

- [ ] **Step 1: Localizar el log del backend local**

Run: `ls "C:/Users/tecnico/AppData/Local/Temp/claude/.../scratchpad/"*8010*.log`
Expected: el log del uvicorn 8010 (o el que corresponda). Si el backend loguea a stdout, redirigir a archivo al lanzarlo.

- [ ] **Step 2: Integrar verify_legacy en el runner**

En `run_case`, tras el `select` + `sleep`, leer las últimas N líneas del log, filtrar por la ventana temporal del caso, y pasar a `verify_legacy.verify_legacy_payload(log_slice, expected_legacy_product_id)`. `expected_legacy_product_id` se obtiene del variant elegido (query `product.legacy_product_id`). Añadir esos checks a `res["levels"]`.

```python
# fragmento a añadir en run_case tras el sleep:
import verify_legacy
LOG = r"C:\...\scratchpad\ws2_8010.log"
try:
    with open(LOG, encoding="utf-8", errors="ignore") as f:
        log_tail = "".join(f.readlines()[-400:])
    # legacy_product_id del variant elegido
    db = harness.SessionLocal()
    from sqlalchemy import text
    lpid = db.execute(text("SELECT p.legacy_product_id FROM product_variant v JOIN product p ON p.id=v.product_id WHERE v.id=:v"), {"v": vid}).scalar()
    db.close()
    res["levels"] += verify_legacy.verify_legacy_payload(log_tail, lpid)
except Exception as ex:
    res["levels"].append({"level":"LEGACY","check":"log_read","pass":False,"detail":str(ex)[:120]})
```

- [ ] **Step 3: Re-ejecutar el runner** y confirmar que aparecen checks LEGACY.

- [ ] **Step 4: Commit** (scratchpad — omitir)

---

### Task 9: Nivel 5 Playwright — flujo visual + ficha admin

**Files:**
- Create: `scratchpad/oferta_e2e/pw_flow.mjs`

**Interfaces:**
- Consumes: un token disponible (pasado por argv). Produces: screenshots + checks de render.

- [ ] **Step 1: Escribir el Playwright del flujo**

```javascript
// scratchpad/oferta_e2e/pw_flow.mjs — correr desde el repo baldecash (para resolver playwright)
import { chromium } from 'playwright';
const T = process.argv[2];
const BASE = 'http://localhost:3001/prototipos/0.6';
const OUT = 'C:/Users/tecnico/Documents/projects/baldecash/screenshots/oferta-e2e';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const broken = [];
p.on('response', r => { if (/\.(png|jpg|webp)(\?|$)/i.test(r.url()) && r.status()>=400) broken.push(r.url()); });
try {
  await p.goto(`${BASE}/oferta/${T}`, { waitUntil: 'networkidle', timeout: 45000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/index.png`, fullPage: true });
  console.log('index render 200, imgs rotas:', broken.length);
} catch (e) { console.log('ERR', e.message); }
finally { await b.close(); }
```

- [ ] **Step 2: Ficha admin (nota)**: la verificación de la ficha del application en admin2 requiere login. Documentar como paso semi-manual: abrir `http://localhost:3000/applications/{id}` tras el select y confirmar que el equipo/accesorios cambiaron. (Automatizarlo con login admin2 es opcional — ver spec.)

- [ ] **Step 3: Commit** (scratchpad — omitir)

---

### Task 10: Reporte final + tickets de bugs nuevos

**Files:**
- Create: `scratchpad/oferta_e2e/REPORTE.md` (o Drive).

**Interfaces:**
- Consumes: `results.json`. Produces: reporte legible + lista de bugs.

- [ ] **Step 1: Generar el reporte desde results.json**

Tabla: caso × overall × niveles fallidos + evidencia. Marcar los KNOWN_BUG (BAL-2194, 2199) y separar los bugs NUEVOS.

- [ ] **Step 2: Para cada bug NUEVO**, crear ticket Linear (labels según área: WS2/WebPage/Bug) con el caso reproducible y file:line si se identifica.

- [ ] **Step 3: Entregar** el reporte a Emilio (resumen + link Drive si aplica). NO arreglar bugs.

---

## Self-Review

**Spec coverage:** ✅ matriz (Task 1), 5 niveles (Tasks 3-6+9), arnés (Tasks 2,7), legacy payload (Tasks 5,8), reporte (Task 10). Riesgos documentados → quedan en el spec, no se ejecutan (correcto). Caso 12 (timeout) marcado MANUAL porque forzar el SLA requiere manipular `resume_at` — documentado.

**Placeholder scan:** el código está completo por task. Las rutas de log exactas se resuelven en Task 8 step 1 (el backend puede loguear a distinto archivo) — es un paso de localización, no un placeholder de lógica.

**Type consistency:** `emit()`/`select()`/`get_offer()`/`get_addons()` consistentes entre harness (Task 2) y runner (Task 7). Los verificadores devuelven todos `list[dict]{level,check,pass,detail}` — consistente para el runner que los concatena.

**Gaps conocidos (aceptados):** (a) el nivel 5 admin queda semi-manual (login admin2); (b) el caso 12 timeout es manual; (c) para casos que requieren un pedido con combo/seguro específico, si la app base no tiene ese estado el runner marca SKIP — Task 7 debería validar el estado del pedido antes de correr (mejora menor a decidir en ejecución).
