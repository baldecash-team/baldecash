# Regalo del combo del pedido solo si es el mismo equipo — Diseño (spec)

**Fecha:** 2026-07-10 · **Autor:** Emilio + Claude · **Ticket:** BAL-2194 (afinamiento; cierra el punto 5 abierto) · **Alcance:** flujo de oferta condicional Caso 4/5, backend ws2.

## Problema

El regalo gratis del combo del **pedido original** (ej. Mochila Nova) se arrastra como "incluido gratis" a **cualquier** equipo que el cliente elija en la oferta, aunque cambie de equipo. Esto es la regla que dejó BAL-2194 ("sea cual sea ese equipo"), pero su punto 5 quedó abierto: *"¿el accesorio heredado aplica a cualquier equipo o solo del mismo tipo?"*.

**Regla acordada (Emilio, 2026-07-10):** el regalo del combo del pedido original se arrastra **SOLO si el cliente se queda con su MISMO equipo** (el `variant_id` elegido == `application.variant_id` del pedido). Si cambia de equipo (elige otro producto/combo del catálogo), NO se arrastra — solo aplican los regalos del combo que realmente elige.

## Root cause (verificado empíricamente, file:line)

Con la app local 25907 (pedido: combo 36 con Mochila; variant del pedido = 1137):
- El cliente eligió el variant **1153** (equipo distinto, sin combo).
- El snapshot `approved_capacity` quedó con **`selected_combo_id=36`** (¡el combo viejo!) y `selected_variant_id=1153`.

Dos causas encadenadas:

1. **`select_equipment` no limpia `selected_combo_id`** (`conditional_offer_service.py:2431-2432`):
   ```python
   if combo_id is not None:
       snap["selected_combo_id"] = combo_id
   ```
   Al elegir un equipo **sin combo** (`combo_id=None`), el `if` NO sobrescribe → queda el `selected_combo_id` viejo del snapshot de emisión (stale). Por eso `resolve_effective_combo_ids` devuelve el combo original (36) tras confirmar → el sync legacy (seguros vía `insurances.py:88`, y accesorios) arrastra el regalo viejo.

2. **`get_available_addons_by_token` arrastra antes de confirmar** (`conditional_offer_service.py:885-911`): el bloque "Arrastrar el combo del PEDIDO ORIGINAL" usa `resolve_effective_combo_ids`, que **antes de confirmar** (sin oferta ACCEPTED) cae al combo del pedido original. Corre siempre, sin mirar qué `variant_id` está explorando el cliente → muestra la mochila gratis aunque esté viendo otro equipo.

## Solución — 2 fixes con raíz común

### Fix A: `select_equipment` siempre setea `selected_combo_id` (raíz del sync legacy)

`conditional_offer_service.py:2431-2432` — reemplazar el `if` por asignación directa:

```python
# selected_combo_id refleja SIEMPRE el combo elegido: None si eligió un equipo
# sin combo (no dejar el combo viejo del snapshot de emisión — stale). Así
# resolve_effective_combo_ids devuelve el combo correcto y el sync legacy no
# arrastra el regalo del combo del pedido cuando el cliente cambió de equipo
# (BAL-2194 afinado).
snap["selected_combo_id"] = combo_id
```

Con esto, tras confirmar un equipo sin combo, `selected_combo_id=None` → `resolve_effective_combo_ids` devuelve `[]` → `insurances.py` (y el sync de accesorios del combo) NO arrastran el regalo original. **No se toca `insurances.py`** (se corrige por la raíz).

### Fix B: `get_available_addons_by_token` arrastra solo si es el mismo equipo (front, pre-confirmación)

`conditional_offer_service.py:885-911` — envolver el bloque de arrastre en un guard por `variant_id`:

```python
# Arrastre del regalo del combo del PEDIDO ORIGINAL: SOLO si el cliente se
# queda con su MISMO equipo (variant elegido == variant del pedido). Si cambió
# de equipo, no hereda el regalo del combo del pedido (BAL-2194 afinado). El
# combo_free_addons del combo ELEGIDO (arriba) no se toca.
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
        # ... (el cuerpo actual del for, sin cambios) ...
```

El bloque `combo_free_addons` de las líneas 869-883 (regalos del combo **elegido**, vía el `combo_id` que llega como param) **no se toca** — ese es correcto (el regalo del combo que sí eligió).

## Qué NO cambia

- `resolve_effective_combo_ids` (el helper) — no se toca; con Fix A ya recibe el `selected_combo_id` correcto.
- `legacy/insurances.py` — no se toca (Fix A lo corrige por la raíz).
- El `combo_free_addons` del combo elegido (líneas 869-883).
- El flujo regular (apps sin oferta condicional).

## Pruebas / verificación

Todas en **local** (backend directo + BD local), con scripts en scratchpad:

**Nivel 1 — Fix A (snapshot correcto):**
- Confirmar (por servicio) un `variant_id` DISTINTO al del pedido, **sin combo** → `approved_capacity.selected_combo_id` debe ser `None` (no el combo viejo).
- `resolve_effective_combo_ids(app)` debe devolver `[]` tras esa confirmación.
- **Caso legítimo:** confirmar el MISMO variant del pedido (que tenía combo) → `selected_combo_id` conserva ese combo; `resolve_effective_combo_ids` lo devuelve.
- Confirmar un combo DISTINTO (con su propio combo_id) → `selected_combo_id` = ese combo nuevo.

**Nivel 2 — Fix B (front):**
- `get_available_addons_by_token(token, variant_id=<distinto al pedido>, combo_id=None)` → `combo_free_addons.accessories` NO trae la mochila del pedido.
- `get_available_addons_by_token(token, variant_id=<el del pedido>)` → SÍ trae la mochila (mismo equipo).

**Nivel 3 — legacy (verificación, no cambio):**
- Tras confirmar un equipo distinto sin combo, `build_combo_insurance_perifericos` (o el helper de `insurances.py`) NO devuelve el seguro del combo original (porque `resolve_effective_combo_ids` ya da `[]`).

**Nivel 4 — no-regresión:**
- App sin oferta condicional: `resolve_effective_combo_ids` sigue devolviendo los combos de `ApplicationCombo` (comportamiento previo).
- `npx`/`pytest` no aplica (backend Python); correr `python -c "import ast; ast.parse(...)"` para sanity y los scripts de verificación arriba.

## Constraints

- Español peruano.
- Local only (no prod salvo OK explícito). No limpiar datos mientras se prueba.
- Rama: nueva `fix/bal-2194-regalo-combo-solo-mismo-equipo` (backend ws2) — es un fix de negocio separado de la tanda visual BAL-2212.
- Backend sin `--reload` no toma cambios → reiniciar para probar por HTTP; para lógica pura, llamar el servicio directo.

## Fuera de alcance

- Cambiar la UI de complementos (el front ya pinta lo que el backend manda en `combo_free_addons`).
- Tocar `insurances.py` (se corrige por Fix A).
- El accesorio del Perfil B (mecanismo distinto, `_accessory_config`).
