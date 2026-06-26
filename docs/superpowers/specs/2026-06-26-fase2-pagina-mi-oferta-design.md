# Planning Fase 2 — Página pública "Mi Oferta" (Mockup 4)

- **Ticket paraguas:** BAL-1785 — Nodo de aprobación condicionada a capacidad de pago
- **Proyecto:** Automatización del proceso de admisión
- **Fase 1 (backend):** ✅ completa (BAL-1990 a 1994), en `ws2/` rama `feature/BAL-1785`
- **Fecha:** 2026-06-26
- **Estado:** Planning para revisión (NO implementar hasta aprobación)

---

## 1. Resumen en una frase

Construir la **página pública** que ve el estudiante al abrir el link de la oferta (Mockup 4): muestra el equipo que pidió (no disponible), el equipo recomendado, y un catálogo filtrado por su cuota aprobada — todo **clonando el catálogo existente y podándolo**, reutilizando su responsive (mobile + desktop), filtros, `ProductCard` y detalle, alimentado por los endpoints de la Fase 1.

## 2. Decisiones cerradas (con el usuario)

| Tema | Decisión |
|---|---|
| Alcance | Mockup 4 **completo + pulido** (countdown, nombre, animación) |
| Dónde | repo `baldecash/`, prototipo `0.6` (Next.js App Router) |
| Estrategia | **Clonar el catálogo completo y podar** lo que no aplica |
| Responsive | Mobile + desktop (heredado del catálogo) |
| Filtros | **Completos** como el catálogo, con **tope de cuota fijo** debajo de todo |
| Comparador | ❌ Quitar |
| Carrito / Wishlist | ❌ Quitar (elige UNO, no compra varios) |
| Tabs | 2: **"Tu oferta" (default)** + "Catálogo" |
| Ruta | **`/aprobacion/[token]`** (ya alineada con el `PURPOSE_PATHS` del backend) |
| "El que pediste" | De `application.product_id` (ajuste backend aditivo) |
| Ver detalle | ✅ Sí, pero **SIN camino a "solicitar"** (CTA = "elegir este equipo") |
| Botón asesor | Placeholder (destino se define después) |
| Conexión | Backend local real (E2E como Fase 1) |
| Ramas | `feature/BAL-1785` en **ambos** repos (baldecash/ nueva, ws2/ existente) |
| Tickets | 4 sub-tickets bajo BAL-1785 |

## 3. Validación de riesgos (analizada en código)

### Riesgo 1 — ¿`/aprobacion/[token]` rompe el routing de landings por slug? → ✅ SEGURO
- `aprobacion` es un **segmento estático**; en Next.js App Router los estáticos tienen **prioridad sobre los dinámicos** (`[landing]`) y sobre el catch-all (`[[...slug]]`). No hay colisión: `/aprobacion/xyz` resuelve a la página nueva, y `/home`, `/senati`, etc. siguen yendo a sus landings.
- El **middleware** (`src/middleware.ts`) y `next.config.ts` hacen rewrites que **no interfieren** (App Router resuelve después del rewrite).
- **No usan `output: export`** → tokens arbitrarios en `[token]` funcionan on-demand sin `generateStaticParams`.
- ⚠️ **Acción obligatoria:** validar **en ejecución** (no solo en teoría) que ninguna landing existente se ve afectada, antes de cerrar la fase.

### Riesgo 2 — Ver detalle SIN poder ir a "solicitar" → ⚠️ ACOPLAMIENTO REAL, requiere ajustes aditivos
Tres acoplamientos detectados en el detalle de producto (`[landing]/producto/components/detail/ProductDetail.tsx`):
1. **Botón "¡Lo quiero!" hardcodeado** → `router.push(routes.solicitar(landing))` (línea ~599). No es configurable. **Hay que parametrizarlo** con props opcionales (`onClickCTA` / `ctaText` / `hideSolicitar`) que por defecto preserven el comportamiento actual.
2. **`useLeadGuard(landing)`** → si la landing es tipo "lead", **redirige al formulario** automáticamente. En la oferta rompería el flujo (el estudiante ya es conocido por su token). **Hay que bypasearlo** (flag `isOfferFlow` o `useOfferGuard(token)`).
3. **El detalle depende del `landing` de la URL** (navbar, layout, colores/siblings vía `routes.producto(landing, ...)`). La ruta de oferta tiene token, no landing. **Hay que resolver el `landing`** por otra vía (el backend lo expone en la respuesta del token).

### Validación general "clonar y podar"
- `CatalogoClient.tsx` es grande (~2445 líneas) pero el carrito/wishlist viven en `ProductContext` (separables). `useLeadGuard` se llama una vez y se puede omitir. Navbar/footer vienen de `LayoutContext` (necesitan el landing).
- **Es un clon** → podar no afecta el catálogo original (archivos separados).
- **Modificar `ProductDetail` SÍ toca el flujo regular** → debe ser 100% aditivo (props opcionales con defaults), verificando que el detalle normal sigue yendo a "solicitar".

## 4. Arquitectura propuesta

```
baldecash/src/app/prototipos/0.6/aprobacion/[token]/
├── page.tsx                  → server: lee token, metadata
├── MiOfertaClient.tsx        → orquestador: fetch, estados, 2 tabs
├── components/
│   ├── OfertaHeader.tsx      → "Mi oferta" + countdown de vencimiento
│   ├── EquipoPedido.tsx      → "EL QUE PEDISTE" (tachado, de requested_product)
│   ├── EquipoRecomendado.tsx → "APROBADO PARA TI" (ProductCard destacado)
│   ├── CatalogoOferta.tsx    → clon podado de CatalogoClient (filtros + grilla)
│   └── AsesorButton.tsx      → placeholder (destino later)
├── producto/[slug]/
│   └── page.tsx              → detalle clonado, CTA = "elegir este equipo" (NO solicitar)
└── __tests__/

baldecash/src/app/prototipos/0.6/services/
└── offerApi.ts               → cliente de los endpoints de oferta
```

### Reutilización (clonar + podar)
- ✅ `CatalogoClient` (clonado y podado): filtros, búsqueda, orden, grilla, responsive.
- ✅ `ProductCard`, `mapApiProductToCatalogProduct` (mapea el JSON del backend al tipo `CatalogProduct`).
- ✅ `ProductDetail` (parametrizado, aditivo) para el detalle sin "solicitar".
- ✅ Tabs (NextUI), Framer Motion, patrón countdown (`VipCountdownOverlay`), branding (#4654CD, Asap/Baloo 2).

### Poda
- ❌ Carrito, Wishlist, Comparador.
- ❌ `useLeadGuard` (bypass en flujo de oferta).
- ❌ El camino a `/solicitar/` desde el detalle.

## 5. Flujo de datos

```
/aprobacion/{token} → offerApi.getOffer(token)
  → {offer_code, max_monthly_quota, expires_at, requested_product,
     recommended (CatalogProduct), landing_slug, alternatives_count}
  ├─ Tab "Tu oferta" (default): EL QUE PEDISTE (tachado) + APROBADO PARA TI + countdown
  ├─ Tab "Catálogo": offerApi.getCatalog(token, filtros) → grilla filtrada por cuota
  ├─ Ver detalle → /aprobacion/{token}/producto/{slug} (CTA "elegir este equipo")
  └─ Elegir → offerApi.select(token, variant_id) → confirmación
```

## 6. Ajustes backend (repo `ws2/`, FE-3) — aditivos, no rompen nada

1. `GET /public/offer/{token}` → agregar:
   - `requested_product` (de `application.product_id`, lo que pidió el estudiante).
   - `landing_slug` (la landing de la application — para que el detalle resuelva su contexto).
2. `GET /public/offer/{token}/catalog` → aceptar filtros del catálogo (`brand_ids`, `types`, `gama`, `usages`, `q`, `sort_by`, specs), **siempre conservando `max_quota` como tope inamovible**.

## 7. Estados de la página (lo "pulido")

| Estado | Disparador | UI |
|---|---|---|
| Cargando | fetch en curso | Skeletons (reusar patrón del catálogo) |
| Válido | token OK | Header + 2 tabs + countdown vivo |
| Expirado | 410 `expired` | "Esta oferta venció" + asesor |
| Ya usado | 410 `consumed` | "Ya elegiste tu equipo" + lo elegido |
| Inválido | 400 `invalid` | "Enlace no válido" amigable |

## 8. Regla de oro

🔒 **`max_quota` se aplica SIEMPRE**, debajo de cualquier filtro. El estudiante nunca ve algo fuera de su presupuesto aprobado.
🚫 **Desde la oferta NO hay camino al flujo de "solicitar".** El único CTA del detalle es "elegir este equipo" (→ `/select`).

## 9. Los 4 sub-tickets

| # | Ticket | Repo | Qué |
|---|---|---|---|
| **FE-3** | Ajustes backend (aditivos) | `ws2/` | `requested_product` + `landing_slug` en `/offer/{token}` · filtros en `/catalog` con tope fijo. **Primero** (desbloquea datos). |
| **FE-1** | Clonar catálogo + podar + `offerApi.ts` | `baldecash/` | Ruta `/aprobacion/[token]`, fuente de datos al endpoint, quitar carrito/wishlist/comparador, bypass lead-guard, resolver landing |
| **FE-2** | "Tu oferta" + detalle sin solicitar | `baldecash/` | Header, pedido tachado, recomendado, countdown, tabs, animación; `ProductDetail` parametrizado (CTA "elegir"), ruta detalle de oferta |
| **FE-4** | Pruebas | `baldecash/` | Jest unit (estados, mapper, filtros respetan tope, detalle no navega a solicitar) + E2E backend local + validar routing no rompe landings |

## 10. Orden de ejecución

```
1. FE-3 (backend: requested_product + landing_slug + filtros) — desbloquea datos
2. FE-1 (clonar + podar + offerApi + ruta segura)
3. FE-2 (Tu oferta + countdown + tabs + detalle parametrizado)
4. FE-4 (pruebas unit + E2E + validación de routing)
```

## 11. Riesgos / cuidados

1. **Modificar `ProductDetail` toca el flujo regular** → 100% aditivo (props opcionales con defaults), verificar que el detalle normal sigue yendo a "solicitar".
2. **`useLeadGuard`** → bypass solo en oferta, sin alterar el comportamiento del catálogo normal.
3. **Validar routing en ejecución** → confirmar que `/aprobacion/[token]` no afecta ninguna landing existente antes de cerrar.
4. **Respetar `CONVENTIONS.md`** del frontend (lucide-react no emojis, NextUI, español latino, sin gradientes prohibidos).
5. **No builds pesados** (MacBook Air M3 8GB) → desarrollo incremental, dev server en vez de build de producción.

## 12. Fuera de alcance (Fase 2)

- Destino real del botón "Hablar con un asesor" (placeholder).
- Caso 5 / upsell en el front.
- El nodo de workflow (se enchufará al servicio backend en otra fase).
