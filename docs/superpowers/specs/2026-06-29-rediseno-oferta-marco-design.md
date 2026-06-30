# Rediseño "Mi Oferta" — Feedback de Marco (BAL-1785)

- **Fecha:** 2026-06-29 (actualizado 2026-06-30)
- **Estado:** EN IMPLEMENTACIÓN — grupos 1-5 (Grupo 6 diferido a Fase 2)
- **Origen:** Reunión 26-jun-2026 + texto literal de Marco
- **Repos:** `baldecash/` (frontend) + `ws2/` (backend), rama `feature/BAL-1785`
- **Ruta:** `/oferta/[token]` (antes `/aprobacion`)

---

## 1. Resumen en una frase

Rediseñar la página pública de oferta según el feedback de Marco: quitar tabs y
countdown, banner de felicitaciones con el nombre del estudiante, cards custom con
tag "Aprobado" y CTAs, catálogo con tag "Aprobado" y **cuotas unificadas a 24
meses / inicial 0**, y página de confirmación "equipo viejo → equipo nuevo".

---

## 2. Alcance

**EN ESTE SPEC (Grupos 1-5, solo rediseño visual + cuotas 24m/0%):**
- Layout, cards custom, catálogo, wording, confirmación.

**DIFERIDO A FASE 2 (Grupo 6, funcionalidades nuevas con backend pesado):**
- Equipo original sí entra en cuota (wording condicional).
- Bundle (equipo + accesorio).
- Tasa especial por oferta.
- Multiselect de categorías en el nodo.

---

## 3. Decisiones cerradas (con el usuario)

| Tema | Decisión |
|---|---|
| Navegación | Una sola página con scroll: banner → cards destacadas → catálogo (sin tabs) |
| Banner | Color de marca (morado), con nombre del estudiante |
| Asterisco Lima | Texto chico debajo del banner ("*Entrega disponible en Lima") |
| Countdown | Quitar del UI |
| Cuota máxima | Invisible total (quitarla de todos lados) |
| Card "pediste" (no entra) | Solo "Ver detalle" (atenuada/tachada, sin "Aceptar") |
| Card "aprobado" | 3 CTAs: Ver detalle / Aceptar equipo / Ver otros equipos |
| Tag "Aprobado" | Verde, en card recomendada y en cada card del catálogo |
| Cuotas del catálogo | Recalcular TODAS a 24 meses / inicial 0 (con la TEA real de cada producto) |
| Productos sin 24m o sin inicial 0 | Quedan FUERA del catálogo de oferta |
| Wording modal | "Al aceptar, cambiaremos tu equipo y tu solicitud quedará aprobada" |
| Mensaje "se aprobará" | En 4 lugares: banner, modal, card aprobado, confirmación |
| Confirmación | Equipo viejo (gris, sin cuota) → nuevo (verde, con cuota); contrato por WhatsApp; quitar lo demás |

---

## 4. Las 5 cosas a implementar

### Cambio 1 — Layout ✅ HECHO
- Quitar tabs y countdown; scroll único.
- Banner `OfertaBannerAprobada` con nombre (de `client_name`, ya expuesto en backend).
- Ocultar cuota máxima (botón "Ver otros equipos" sin monto).

### Cambio 2 — Cards custom ✅ HECHO
- Componente `OfertaEquipoCard` (no reusa `ProductCard`).
- Variante "aprobado": tag verde + 3 CTAs. Variante "pedido": atenuada + solo "Ver detalle".

### Cambio 3 — Catálogo: tag "Aprobado" + cuotas 24m/0% ⏳ EN CURSO
Ver sección 5 (es el más complejo).

### Cambio 4 — Wording ⏳ PENDIENTE
- Modal: "Al aceptar, cambiaremos tu equipo y tu solicitud quedará aprobada".
- Refuerzo "tu solicitud se aprobará" en banner/card/confirmación.

### Cambio 5 — Confirmación ⏳ PENDIENTE
- Rehacer `SeleccionConfirmada`: viejo (gris, sin cuota) → nuevo (verde, con cuota), flecha, contrato por WhatsApp. Quitar el ReceivedScreen.

---

## 5. Cambio 3 en detalle — Cuotas a 24 meses / inicial 0

### El problema (verificado con datos reales del API)
El catálogo de oferta muestra el **hook** de cada producto, cuyo plazo/inicial varía:
- De 40 productos: 24 a 24m, **5 a 36m, 11 a 48m**; 29 a 0%, **11 a 25%**.
- El item del API **NO trae la TEA** → el frontend no puede recalcular.
- Algunos productos tienen TEA especial (MacBook 130%, etc.) → usar una TEA genérica daría números errados.

### La solución (backend, SOLO en el servicio de oferta, SIN tocar BD)
En `conditional_offer_service.py`, al armar el catálogo de oferta (`_filtered_catalog` /
`get_catalog_by_token` y el recomendado), para CADA producto:

1. **Verificar** que su `available_terms` incluya 24 y `available_initials` incluya 0.
   - Si NO → **excluir el producto** del catálogo de oferta.
2. **Recalcular la cuota a (term=24, initial=0)** con `PricingService.calculate_installment(landing_id, product, variant, term_months=24, initial_percent=0)` — usa la **TEA real** de cada producto (respeta LVPs especiales).
3. **Sobrescribir el hook** del item: `monthly_price = result.monthly_price`, `term_months = 24`, `initial_percent = 0`.
4. **Re-aplicar el filtro de cuota** (`<= max_monthly_quota`) sobre la cuota recalculada (porque al subir a 24m algunas cuotas crecen y podrían pasar el tope).

### Por qué es seguro
- Catálogo general **intacto** (usa otro método, `get_landing_products` normal).
- BD **intacta** (solo recálculo en memoria con función existente y autoritativa).
- Cards + catálogo + detalle **consistentes** (todos consumen el hook recalculado del backend).

### Consistencia con el detalle del producto
El detalle de oferta (`OfertaDetalleClient`) hoy abre con los defaults del LVP (no 24/0).
Para que coincida con el catálogo:
- Forzar `defaultTerm={24}` y `defaultInitialPercent={0}` en `OfertaDetalleClient`.
- En el resumen del equipo elegido (`chosen.monthly`), tomar la opción `term===24 && initial===0`
  (no el `Math.min` de todos los plazos).

### Tag "Aprobado" en cada card del catálogo
- Prop aditiva en `ProductCard` (`approvedTag?: boolean`) que pinta el badge verde.
- Solo se activa desde el catálogo de oferta; el catálogo normal no lo pasa → intacto.

### Quitar el `termMonths` hardcodeado
- `TuOfertaTab` pasa `termMonths={24}` hardcodeado a la card. Tras el cambio 3, el backend
  garantiza 24m, así que el valor es correcto, pero conviene leer el `term_months` real del
  hook recalculado para evitar etiquetas engañosas.

---

## 6. Componentes afectados

| Archivo | Acción | Estado |
|---|---|---|
| `MiOfertaClient.tsx` | Quitar tabs, scroll único, banner | ✅ |
| `OfertaBannerAprobada.tsx` | NUEVO — banner felicitaciones | ✅ |
| `OfertaEquipoCard.tsx` | NUEVO — card custom | ✅ |
| `TuOfertaTab.tsx` | Usar card custom | ✅ |
| `CatalogoOfertaTab.tsx` | Quitar countdown; tag "Aprobado" en cards | parcial |
| `ProductCard.tsx` | Prop aditiva `approvedTag` | ⏳ |
| `ConfirmarEleccionModal.tsx` | Wording | ⏳ |
| `SeleccionConfirmada.tsx` | Rehacer viejo→nuevo | ⏳ |
| `OfertaDetalleClient.tsx` | Forzar 24m/0% | ⏳ |
| **`conditional_offer_service.py`** (ws2) | Recalcular cuotas 24m/0%, excluir no-aptos | ⏳ |
| `offer.py` / `conditional_offer.py` (ws2) | (sin cambios de contrato; el hook ya existe) | — |

---

## 7. Orden de implementación

1. ✅ Cambio 1 (layout) — hecho.
2. ✅ Cambio 2 (cards) — hecho.
3. ⏳ Cambio 3 backend (recalcular 24m/0% + excluir) → luego frontend (tag "Aprobado").
4. ⏳ Cambio 3 detalle (forzar 24m/0% en OfertaDetalleClient).
5. ⏳ Cambio 4 (wording).
6. ⏳ Cambio 5 (confirmación viejo→nuevo).
7. Pruebas E2E de cada cambio + typecheck.

---

## 8. Pruebas

- **Backend:** verificar que el catálogo de oferta devuelve todas las cuotas a 24m/0%
  (term_months=24, initial_percent=0 en cada hook); que un producto sin 24m queda fuera;
  que el filtro de cuota se re-aplica sobre la cuota recalculada.
- **Frontend:** consola 0 errores, typecheck 0 errores, screenshots de cada pantalla.
- **Consistencia:** la cuota de la card destacada = la del catálogo = la del detalle, para
  el mismo producto.
- **No-regresión:** el catálogo NORMAL (`/[landing]/catalogo`) sigue idéntico.

---

## 9. Fuera de alcance (recordatorio)

- Grupo 6 (bundle, tasa especial, categorías, equipo-sí-entra) → Fase 2.
- Conexión real con workflow / WhatsApp (BoxSimple) → otra parte.
- Conexión con Legacy (endpoint cambio de equipo) → otra fase.

---

## 10. FASE 2 — Plazos/iniciales parametrizables por oferta (diseño listo, NO implementar aún)

**Estado:** diferido a después del demo. Por ahora la oferta usa 24 meses / inicial 0
FIJO (`OFFER_TERM_MONTHS=24`, `OFFER_INITIAL_PERCENT=0` en `conditional_offer_service.py`).

### Objetivo
Que el nodo configure como PARÁMETRO qué plazos e iniciales se ofrecen, en vez de
hardcodear 24/0. Ej: la oferta dice "permite 24 y 36 meses, inicial 0 y 10".

### El parámetro (en el snapshot de la oferta, `approved_capacity`)
```
allowed_terms:    [24, 36]   # plazos que el cliente puede elegir en el detalle
allowed_initials: [0, 10]    # iniciales permitidos
hook_term:        <int>      # plazo de la cuota que muestra la card (opcional)
hook_initial:     <float>    # inicial de la cuota que muestra la card (opcional)
```
- Si el nodo no manda nada → default `[24]` / `[0]` (comportamiento actual).
- **Default de la card cuando no se especifica `hook_term`:** el GANCHO = mayor plazo
  permitido + inicial 0 (cuota más baja). Igual que el catálogo normal.

### Mecanismo (confirmado por análisis — el sistema YA lo soporta)
El sistema ya restringe plazos/iniciales vía `landing_variant_pricing.allowed_terms/initials`
y `landing_pricing_rule`. El detalle ya devuelve TODAS las combinaciones plazo×inicial
precalculadas en `payment_plans`. El frontend NUNCA calcula — solo muestra lo que recibe.

**Cirugía mínima (3 puntos, todos reutilizan código existente):**
1. **Catálogo de oferta:** `_normalize_to_24m_0i` → leer `allowed_terms/hook_*` de la oferta
   en vez de las constantes 24/0. Mostrar el hook al `hook_term/hook_initial`.
2. **Detalle de oferta:** pasar `allowed_terms/allowed_initials` de la oferta a
   `build_payment_plans` (que YA sabe filtrar — su loop omite plazos sin opciones).
   Añadir params opcionales al endpoint del detalle público y resolverlos por token.
   El FE `PricingCalculator` se autoadapta (solo muestra lo que recibe).
3. **Default:** la card y el detalle abren en el mismo `hook_term/hook_initial`.

**Garantías:** cero recálculo (solo filtra lo precalculado); no toca BD; no toca el
catálogo/detalle normal; FE sin cambios estructurales.

### Inconsistencia conocida a resolver en esta fase
Hoy el DETALLE de oferta (`OfertaDetalleClient`) NO respeta el límite de la oferta —
muestra todos los plazos del producto en la landing. Al parametrizar, el detalle debe
recortar `payment_plans` a los `allowed_terms/initials` de la oferta.
