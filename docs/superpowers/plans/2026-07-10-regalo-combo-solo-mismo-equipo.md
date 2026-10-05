# Regalo del combo del pedido solo si es el mismo equipo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El regalo gratis del combo del pedido original solo se hereda si el cliente se queda con su mismo equipo; si cambia de equipo, no se arrastra.

**Architecture:** 2 fixes en `ws2/app/services/conditional_offer_service.py`, un archivo. Fix A ataca la raíz (`select_equipment` no limpiaba `selected_combo_id` al elegir sin combo → snapshot stale → sync legacy arrastraba). Fix B guarda el arrastre pre-confirmación en el endpoint de addons por `variant_id`. No se toca `insurances.py` (Fix A lo corrige por la raíz).

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy 2.0, MySQL. Sin pytest en esta ruta (lógica de servicio verificada con scripts locales que llaman el servicio directo contra BD local + sanity de sintaxis).

## Global Constraints

- Español peruano.
- Local only para pruebas (no prod salvo OK explícito). No limpiar datos mientras se prueba.
- Rama nueva `fix/bal-2194-regalo-combo-solo-mismo-equipo` en **ws2** (backend), separada de la tanda visual BAL-2212.
- No tocar `legacy/insurances.py` (se corrige por Fix A).
- Backend sin `--reload` no toma cambios: para probar por HTTP, reiniciar; para lógica pura, llamar el servicio directo.
- BD local: `127.0.0.1:3306`, user `root`, pass `local`, db `baldecash_baldemotor`.

---

### Task 1: Crear la rama de trabajo

**Files:** (ninguno — operación git)

- [ ] **Step 1: Crear y cambiar a la rama en ws2**

```bash
cd "C:/Users/tecnico/Documents/projects/baldecash/ws2"
git checkout -b fix/bal-2194-regalo-combo-solo-mismo-equipo
```

Expected: `Switched to a new branch 'fix/bal-2194-regalo-combo-solo-mismo-equipo'`.

---

### Task 2: Fix A — `select_equipment` siempre setea `selected_combo_id`

**Files:**
- Modify: `app/services/conditional_offer_service.py:2431-2432` (dentro de `select_equipment`, línea 2355)

**Interfaces:**
- Consume: `combo_id` (parámetro de `select_equipment`, `Optional[int]`), `snap` (dict `approved_capacity`).
- Produce: `snap["selected_combo_id"]` refleja siempre el combo elegido (None si sin combo).

**Contexto — bloque actual (líneas 2427-2437):**
```python
        snap = dict(offer.approved_capacity or {})
        snap["selected_variant_id"] = variant_id
        snap["selected_term"] = sel_term
        snap["selected_initial"] = sel_initial
        if combo_id is not None:
            snap["selected_combo_id"] = combo_id
        if accessory_ids:
            snap["selected_accessory_ids"] = accessory_ids
        if insurance_ids:
            snap["selected_insurance_ids"] = insurance_ids
        offer.approved_capacity = snap
```

- [ ] **Step 1: Reemplazar el `if combo_id is not None` por asignación directa**

Cambiar SOLO las 2 líneas del `if combo_id`:

```python
        if combo_id is not None:
            snap["selected_combo_id"] = combo_id
```

por:

```python
        # selected_combo_id refleja SIEMPRE el combo elegido: None si eligió un
        # equipo sin combo (no dejar el combo viejo del snapshot de emisión —
        # stale). Así resolve_effective_combo_ids devuelve el combo correcto y el
        # sync legacy no arrastra el regalo del combo del pedido cuando el cliente
        # cambió de equipo (BAL-2194 afinado).
        snap["selected_combo_id"] = combo_id
```

(Las asignaciones de `selected_accessory_ids`/`selected_insurance_ids` mantienen su `if` — esas son listas y no aplica la misma regla.)

- [ ] **Step 2: Sanity de sintaxis**

```bash
cd "C:/Users/tecnico/Documents/projects/baldecash/ws2"
python -c "import ast; ast.parse(open('app/services/conditional_offer_service.py',encoding='utf-8').read()); print('SYNTAX OK')"
```
Expected: `SYNTAX OK`.

- [ ] **Step 3: Verificar Fix A con script local (Nivel 1)**

Crear `scripts/verify_fixA.py` en scratchpad (o usar el patrón siguiente) que llame `select_equipment` directo contra BD local con un variant DISTINTO al del pedido y sin combo, y verifique el snapshot:

```python
import io, sys, os, logging
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
logging.disable(logging.WARNING)
os.environ.update({"DB_HOST":"127.0.0.1","DB_PORT":"3306","DB_USER":"root","DB_PASSWORD":"local","DB_NAME":"baldecash_baldemotor"})
sys.path.insert(0, r"C:\Users\tecnico\Documents\projects\baldecash\ws2"); os.chdir(r"C:\Users\tecnico\Documents\projects\baldecash\ws2")
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
S = sessionmaker(bind=create_engine("mysql+pymysql://root:local@127.0.0.1:3306/baldecash_baldemotor", pool_pre_ping=True))
from app.services.conditional_offer_service import ConditionalOfferService, resolve_effective_combo_ids
from app.db.models.application import ApplicationOffer
db = S()
try:
    APP = 25907  # pedido: combo 36 (Mochila), variant 1137
    # Emitir + seleccionar un variant DISTINTO sin combo (1153) por servicio
    svc = ConditionalOfferService(db)
    r = svc.emit_offer(application_id=APP, max_monthly_quota=3000.0, expiry_hours=72, terms=[24], initials=[0.0], ip="127.0.0.1")
    tok = (r.get("url") or "").rsplit("/", 1)[-1]
    svc.select_equipment(tok, variant_id=1153, combo_id=None, term=24, initial=0.0, ip="127.0.0.1")
    off = db.query(ApplicationOffer).filter(ApplicationOffer.application_id==APP, ApplicationOffer.status=='ACCEPTED').order_by(ApplicationOffer.id.desc()).first()
    scid = (off.approved_capacity or {}).get('selected_combo_id')
    eff = resolve_effective_combo_ids(db, APP)
    print("selected_combo_id (debe ser None):", scid)
    print("resolve_effective_combo_ids (debe ser []):", eff)
    assert scid is None, f"FALLA: selected_combo_id={scid}, esperado None"
    assert eff == [], f"FALLA: eff={eff}, esperado []"
    print("FIX_A_OK")
finally:
    db.close()
```
Run: `python <ruta>/verify_fixA.py`
Expected: `selected_combo_id (debe ser None): None`, `resolve_effective_combo_ids (debe ser []): []`, `FIX_A_OK`.

(Verificar la firma real de `emit_offer`/`select_equipment` antes de correr — si `emit_offer` requiere otros params, ajustar. La app 25907 es de la BD local y ya tiene combo 36 en el pedido.)

- [ ] **Step 4: Verificar el caso legítimo (mismo equipo / combo distinto)**

Extender el script (o uno nuevo) para dos casos más:
- Confirmar el MISMO variant del pedido (1137) con su combo (36) → `selected_combo_id == 36`, `eff == [36]`.
- Confirmar un combo DISTINTO (ej. combo 42, variant de ese combo) → `selected_combo_id == 42`.

Expected: en ambos, `selected_combo_id` = el combo elegido (no None, no el viejo).

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/tecnico/Documents/projects/baldecash/ws2"
git add app/services/conditional_offer_service.py
git commit -m "fix(oferta): select_equipment limpia selected_combo_id al elegir sin combo (BAL-2213)

Al elegir un equipo sin combo, el snapshot conservaba el combo viejo del pedido
(stale) porque el set estaba bajo 'if combo_id is not None'. Ahora selected_combo_id
= combo_id siempre (None si sin combo), así resolve_effective_combo_ids devuelve el
combo correcto y el sync legacy no arrastra el regalo del combo del pedido cuando
el cliente cambió de equipo. (BAL-2194 afinado)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

(Sustituir BAL-2213 por el número del ticket nuevo cuando exista.)

---

### Task 3: Fix B — arrastre en `get_available_addons_by_token` solo si mismo equipo

**Files:**
- Modify: `app/services/conditional_offer_service.py:885-911` (dentro de `get_available_addons_by_token`, línea 820)

**Interfaces:**
- Consume: `variant_id` (param del método, `int`), `link.application_id`, `Application` (importado a nivel módulo, línea 26), `resolve_effective_combo_ids`, `combo_id`.
- Produce: el bloque de arrastre corre solo si `variant_id == application.variant_id`.

**Contexto — bloque actual (líneas 885-911):**
```python
        # Arrastrar el(los) accesorio(s)/seguro(s) de regalo del combo del PEDIDO
        # ORIGINAL (BAL-2194): si el cliente pidió un combo con regalo (ej. Mochila)
        # y el upsell le ofrece un equipo individual (o un combo distinto sin ese
        # regalo), no debe perderlo. Dedup por id: si el equipo ELEGIDO ya aporta el
        # mismo id (es el mismo combo, o coincide), no se duplica.
        original_combo_ids = [
            cid for cid in resolve_effective_combo_ids(self.db, link.application_id)
            if cid != combo_id
        ]
        for original_combo_id in original_combo_ids:
            oca = resolve_combo_addons(self.db, original_combo_id, term=default_term)
            existing_acc_ids = {a["id"] for a in combo_free_addons["accessories"]}
            for a in oca["accessories"]:
                if not a["included_free"] or a["id"] in existing_acc_ids:
                    continue
                combo_free_addons["accessories"].append({
                    "id": a["id"],
                    "name": a["name"],
                    "image": self._resolve_image(a.get("image")) if a.get("image") else None,
                })
                existing_acc_ids.add(a["id"])
            existing_ins_ids = {i["id"] for i in combo_free_addons["insurances"]}
            for i in oca["insurances"]:
                if not i["included_free"] or i["id"] in existing_ins_ids:
                    continue
                combo_free_addons["insurances"].append({"id": i["id"], "name": i["name"]})
                existing_ins_ids.add(i["id"])
```

- [ ] **Step 1: Envolver el bloque de arrastre en el guard `mismo_equipo`**

Reemplazar el comentario + el `original_combo_ids = [...]` + el `for original_combo_id in original_combo_ids:` (y su cuerpo) por la versión con guard. El cuerpo del `for` (las 20 líneas internas) queda **idéntico**, solo indentado un nivel más adentro del `if`:

```python
        # Arrastrar el regalo del combo del PEDIDO ORIGINAL (BAL-2194): SOLO si el
        # cliente se queda con su MISMO equipo (variant elegido == variant del
        # pedido). Si cambió de equipo, no hereda el regalo del combo del pedido
        # (BAL-2194 afinado). El combo_free_addons del combo ELEGIDO (arriba) no
        # se toca.
        app = self.db.query(Application).filter(Application.id == link.application_id).first()
        mismo_equipo = (
            app is not None
            and app.variant_id is not None
            and int(app.variant_id) == int(variant_id)
        )
        if mismo_equipo:
            original_combo_ids = [
                cid for cid in resolve_effective_combo_ids(self.db, link.application_id)
                if cid != combo_id
            ]
            for original_combo_id in original_combo_ids:
                oca = resolve_combo_addons(self.db, original_combo_id, term=default_term)
                existing_acc_ids = {a["id"] for a in combo_free_addons["accessories"]}
                for a in oca["accessories"]:
                    if not a["included_free"] or a["id"] in existing_acc_ids:
                        continue
                    combo_free_addons["accessories"].append({
                        "id": a["id"],
                        "name": a["name"],
                        "image": self._resolve_image(a.get("image")) if a.get("image") else None,
                    })
                    existing_acc_ids.add(a["id"])
                existing_ins_ids = {i["id"] for i in combo_free_addons["insurances"]}
                for i in oca["insurances"]:
                    if not i["included_free"] or i["id"] in existing_ins_ids:
                        continue
                    combo_free_addons["insurances"].append({"id": i["id"], "name": i["name"]})
                    existing_ins_ids.add(i["id"])
```

- [ ] **Step 2: Sanity de sintaxis**

```bash
cd "C:/Users/tecnico/Documents/projects/baldecash/ws2"
python -c "import ast; ast.parse(open('app/services/conditional_offer_service.py',encoding='utf-8').read()); print('SYNTAX OK')"
```
Expected: `SYNTAX OK`.

- [ ] **Step 3: Verificar Fix B con script local (Nivel 2)**

Script que llama `get_available_addons_by_token` directo con dos variants:

```python
import io, sys, os, logging
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
logging.disable(logging.WARNING)
os.environ.update({"DB_HOST":"127.0.0.1","DB_PORT":"3306","DB_USER":"root","DB_PASSWORD":"local","DB_NAME":"baldecash_baldemotor"})
sys.path.insert(0, r"C:\Users\tecnico\Documents\projects\baldecash\ws2"); os.chdir(r"C:\Users\tecnico\Documents\projects\baldecash\ws2")
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
S = sessionmaker(bind=create_engine("mysql+pymysql://root:local@127.0.0.1:3306/baldecash_baldemotor", pool_pre_ping=True))
from app.services.conditional_offer_service import ConditionalOfferService
db = S()
try:
    APP = 25907  # variant del pedido = 1137, combo 36 con Mochila
    svc = ConditionalOfferService(db)
    r = svc.emit_offer(application_id=APP, max_monthly_quota=3000.0, expiry_hours=72, terms=[24], initials=[0.0], ip="127.0.0.1")
    tok = (r.get("url") or "").rsplit("/", 1)[-1]
    # variant DISTINTO (1153), sin combo → NO debe traer la mochila
    res_distinto = svc.get_available_addons_by_token(tok, variant_id=1153, combo_id=None, term=24, ip="127.0.0.1")
    acc_distinto = [a["name"] for a in res_distinto["combo_free_addons"]["accessories"]]
    print("variant DISTINTO combo_free acc (debe NO tener Mochila):", acc_distinto)
    assert not any("Mochila" in n for n in acc_distinto), "FALLA: arrastró la mochila a otro equipo"
    # variant del PEDIDO (1137) → SÍ debe traer la mochila
    res_mismo = svc.get_available_addons_by_token(tok, variant_id=1137, combo_id=None, term=24, ip="127.0.0.1")
    acc_mismo = [a["name"] for a in res_mismo["combo_free_addons"]["accessories"]]
    print("variant del PEDIDO combo_free acc (debe tener Mochila):", acc_mismo)
    assert any("Mochila" in n for n in acc_mismo), "FALLA: no trajo la mochila al mismo equipo"
    print("FIX_B_OK")
finally:
    db.close()
```
Run: `python <ruta>/verify_fixB.py`
Expected: variant DISTINTO sin Mochila, variant del PEDIDO con Mochila, `FIX_B_OK`.

(Verificar la firma real de `get_available_addons_by_token` — params `token, variant_id, term, initial, combo_id, ip` — y ajustar el llamado si difiere.)

- [ ] **Step 4: Verificar no-regresión (Nivel 4)**

Script que confirma que una app SIN oferta condicional sigue devolviendo los combos de `ApplicationCombo`:

```python
# ... (mismo boilerplate de conexión) ...
from app.services.conditional_offer_service import resolve_effective_combo_ids
db = S()
try:
    APP_SIN_OFERTA = 25940  # sin combo/oferta
    print("resolve_effective_combo_ids app sin oferta:", resolve_effective_combo_ids(db, APP_SIN_OFERTA))
    # Debe devolver los combo_id de ApplicationCombo (o [] si no tiene) — sin excepción.
    print("NO_REGRESION_OK")
finally:
    db.close()
```
Expected: sin excepción, `NO_REGRESION_OK`.

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/tecnico/Documents/projects/baldecash/ws2"
git add app/services/conditional_offer_service.py
git commit -m "fix(oferta): addons arrastra regalo del combo del pedido solo si es el mismo equipo (BAL-2213)

get_available_addons_by_token arrastraba el regalo del combo del pedido original
(consultado pre-confirmación, sin snapshot) a cualquier variant que el cliente
explorara. Ahora el arrastre corre solo si variant_id == application.variant_id
(el mismo equipo del pedido). El combo_free_addons del combo elegido no cambia.
(BAL-2194 afinado)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

(Sustituir BAL-2213 por el número del ticket nuevo cuando exista.)

---

## Verificación E2E final (tras ambos fixes, local)

1. Reiniciar el backend local (para que tome ambos fixes; sin `--reload` no los toma).
2. Emitir Caso 4/5 local para la app 25907, abrir complementos.
3. Elegir un equipo DISTINTO al del pedido → "Recomendado/Incluidos gratis" NO muestra la Mochila del pedido.
4. Volver y elegir el MISMO equipo del pedido → SÍ muestra la Mochila.
5. Confirmar el equipo distinto → verificar en BD `application_offer.approved_capacity.selected_combo_id` = None; y (si legacy local corre) que el sync no agrega el seguro/mochila del combo viejo.

## Self-Review (hecho por el autor del plan)

- **Spec coverage:** Fix A → Task 2; Fix B → Task 3; pruebas Nivel 1 → Task 2 Steps 3-4; Nivel 2 → Task 3 Step 3; Nivel 4 → Task 3 Step 4; Nivel 3 (legacy, verificación) → cubierto por Fix A + E2E paso 5. No se toca `insurances.py` ✓. Sin gaps.
- **Placeholder scan:** sin TBD/TODO; el único marcador es `BAL-2213` (número de ticket a crear) — intencional, se sustituye al crear el ticket.
- **Type consistency:** `combo_id: Optional[int]`, `variant_id: int`, `application.variant_id` (int/None) — consistentes. `Application` importado a nivel módulo (línea 26). `resolve_effective_combo_ids(db, application_id) -> list`.
