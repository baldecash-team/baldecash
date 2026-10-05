---
name: ux-senior-review
description: Use SIEMPRE antes de decir "listo/funciona/está bien" sobre cualquier cambio de flujo, pantalla o feature de UX. Obliga a mapear TODOS los puntos de entrada/salida, todos los estados, la consistencia entre modos y la verificación E2E real antes de declarar terminado. Invocar al empezar un cambio de UI y de nuevo antes de reportar que quedó.
---

# UX Senior Review — Analizar TODO antes de decir "listo"

Este skill existe por un patrón real: declarar un flujo "terminado" habiendo probado
solo UN camino, cuando había 3. Un senior nunca dice "está bien" sin haber trazado
todos los caminos, todos los estados y verificado E2E.

**Regla de oro:** *"Está bien" es una conclusión, no una impresión. Se gana ejecutando
el checklist, no mirando una pantalla.*

## Cuándo invocar (BLOQUEANTE)

- Al **empezar** cualquier cambio que toque un flujo, pantalla o interacción.
- **Otra vez** justo antes de reportar "listo / funciona / quedó / está bien".
- Si el usuario pregunta "¿esto está bien?" sobre un flujo → correr el checklist ANTES de responder.

## Checklist obligatorio (crear un todo por ítem)

### 1. Mapear TODOS los puntos de entrada y salida
- ¿Desde cuántos lugares se dispara esta acción? (grep del handler/servicio que ejecuta la acción).
- Ejemplo real: un equipo se acepta desde el **index de la oferta**, el **catálogo** Y el **detalle** — los 3 deben comportarse igual.
- Regla: **grep del consumidor** (`selectEquipment`, `onSelect`, el endpoint) y listar CADA sitio. No asumir que solo hay uno.
- Cross-ref memoria: `trace_full_consumer_chain`, `all_modes_same_behavior`, `grep_all_render_sites`.

### 2. Enumerar TODOS los estados de la pantalla
- loading / vacío / error / éxito / sin-datos / permiso-denegado / ya-consumido / expirado.
- Para flujos con datos: estado "0 resultados" (¿qué ve el usuario si NO hay accesorios que quepan?).
- Para tokens/links: consumido, expirado, revocado, ya-aceptado.
- ¿El estado "ya elegiste" vs "elige" se decide bien? (bug real: oferta accepted mostraba confirmación en vez de catálogo).

### 3. Consistencia entre modos/casos
- Si hay variantes (Caso 4 vs Caso 5, Perfil A/B/C, combo vs simple): ¿el cambio aplica coherente a todas?
- ¿Alguna variante NO debe recibir el cambio? (ej: Perfil B ya trae accesorio incluido → cuestionar si debe sumar más). **Cuestionar la decisión de negocio, no asumirla.**

### 4. Datos completos por el camino
- ¿Qué necesita el destino? (variantId, comboId, slug...). ¿Se propaga por TODOS los caminos?
- Bug real: combo_id solo vivía en el detalle; el catálogo/index no lo pasaban → el accesorio gratis del combo no sincronizaba.

### 5. Verificación E2E REAL (no visual)
- Navegar el flujo COMPLETO por cada punto de entrada (Playwright), no solo el fácil.
- Confirmar el efecto en **BD/API real**, no solo que "se ve bien" (memoria: `verify_before_responding`, `complete_test_suites`).
- Un fullPage screenshot NO prueba un elemento `fixed` — verificar en viewport real.
- Probar con datos que reproduzcan cada estado (link fresco vs consumido, con add-ons vs sin).

### 6. Marca y jerarquía (brandbook)
- Aplicar `brandbook` + `frontend`: cuota prominente, "equipos" no "laptops", sin gradientes, lucide no emojis, cursor-pointer, español neutro sin mexicanismos.
- Touch targets ≥44px, focus visible, mobile-first (64% del tráfico es móvil).

## Anti-patrón que este skill previene

> "Probé el detalle → accesorios → confirmar y se ve bien. **El journey está bien.**"

Falso: había 2 caminos más (index, catálogo) que NO pasaban por accesorios. Un senior
grepea el consumidor PRIMERO, encuentra los 3, y recién entonces prueba y concluye.

## Salida esperada

Antes de decir "listo", poder responder por escrito:
1. Los N puntos de entrada (listados) y que TODOS quedaron consistentes.
2. Los estados cubiertos (y cuáles se probaron).
3. La verificación E2E ejecutada por camino + evidencia (BD/API).
4. Las decisiones de negocio que se cuestionaron/confirmaron con el usuario.

Si no puedes responder los 4 → no está listo, sigue trabajando.
