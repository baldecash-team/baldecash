# Atar eventos de oferta al token + prefijo offer_ — Diseño (BAL-2236)

**Fecha:** 2026-07-11
**Ramas:** `feature/BAL-2236` (bal-2236-fe y bal-2236-ws2)

## Problema

Los eventos de analytics (Sistema B, tabla `user_event`) del flujo de oferta
condicional (Caso 4/5) **no se pueden atar a la oferta/solicitud específica**:

1. El layout de la oferta monta `<SessionProvider landingSlug="home">`
   (`oferta/[token]/layout.tsx:77`), hardcodeando la landing. Se crea una
   `session` anónima con `landing_id` = home y `application_id` = NULL. Ningún
   evento sabe de qué oferta/solicitud vino.
2. Los eventos de filtro/orden heredados (`filter_toggle`, `sort_change`,
   `catalog_load_more`, `search_*`) no llevan prefijo `offer_`, así que no se
   distinguen por nombre de los mismos eventos en home/gamer.

## Patrón de referencia (Leo — admisión)

En flujos por link (admisión OTP/video), el `session_id` del evento **es el
token del secure-link** (`admision/_lib/events.ts:40-71`: `admissionEvents(token)`
→ `sendEventsBatch(token, ...)`). Como el token está atado a `application_id` en
`secure_link` (`secure_link.py:59`, `token_hash` en `:56`), el reporte resuelve
la solicitud exacta hasheando el token (`SecureLinkService._hash`,
`secure_link_service.py:327-328`).

**La oferta es un flujo por link con token, idéntico a admisión.** Este diseño
replica el *dato* de Leo (`session_id = token`) pero adaptando el *mecanismo* a
la infraestructura que la oferta ya tiene (EventTrackerContext + los ~40 eventos
+ los automáticos de CatalogLayoutV4), en vez de reescribir todos los emisores.

## Decisiones (confirmadas con el usuario)

1. **Mecanismo:** `fixedSessionId` en SessionProvider (NO un emisor
   `offerEvents(token)` dedicado). Un solo punto de cambio; el catálogo
   automático se ata solo; cero reescritura de emisores.
2. **Prefijo `offer_`:** TODOS los eventos de oferta lo llevan, incluidos los de
   filtro/orden heredados. Bifurcación segura en `useAnalytics` (sin tocar el
   comportamiento de home/gamer).
3. **Alcance:** frontend (token binding + prefijo) + backend (reporte resuelve
   `token → application_id`).

## Arquitectura

```
URL /oferta/{token}
      │  token crudo (de useParams)
      ▼
SessionProvider fixedSessionId={token}    ← NO crea session en backend
      │  sessionUuid = token
      ▼
EventTrackerContext                        ← usa sessionUuid para cada batch
      │  session_id = token
      ▼
POST /public/events/batch → user_event.session_id = token (crudo)
      │
      ▼  (reporte)
SecureLinkService._hash(token) → secure_link.token_hash → application_id → landing real
```

**Privacidad:** el token va SOLO en `session_id`. NUNCA en `properties`. (Leo lo
duplica en `properties.token`; nosotros no, para no exponerlo.)

## Componentes — Frontend (repo bal-2236-fe)

### FE-1. `SessionContext.tsx` — prop opcional `fixedSessionId`

`SessionProviderProps` gana `fixedSessionId?: string`.

Comportamiento cuando `fixedSessionId` está presente:
- El provider **NO** llama `initSession` (no hace `POST /public/tracking/session`;
  no crea `session` anónima en backend).
- Expone `sessionUuid = fixedSessionId`, `isInitialized = true`,
  `isCreating = false`, `sessionId = null`.
- `landingSlug` se vuelve opcional (ya no se usa cuando hay `fixedSessionId`).

Cuando `fixedSessionId` es undefined: **comportamiento actual intacto** (uuid
anónimo + POST session + auto-init por `landingSlug`). Cero regresión para
home/catálogo/solicitar.

Implementación: el `useEffect` de auto-init (`SessionContext.tsx:387-390`) hace
early-return si `fixedSessionId`. El estado inicial de `sessionUuid` se siembra
con `fixedSessionId` cuando existe.

### FE-2. `oferta/[token]/layout.tsx` — pasar el token

- Leer el token con `useParams()` (`params.token` — la ruta es
  `oferta/[token]`).
- `<SessionProvider fixedSessionId={token}>` en vez de
  `<SessionProvider landingSlug="home">`.
- Actualizar el comentario del bloque (líneas 13-17) para reflejar el nuevo
  mecanismo (token como session_id, resolución por secure_link).

Con esto, los ~40 eventos actuales de la oferta (incluidos filter_toggle /
sort_change / catalog_load_more / search_* que emite CatalogLayoutV4 vía
useAnalytics) pasan a llevar `session_id = token` **sin tocar ni un emisor**.

### FE-3. `useAnalytics.ts` — prefijo `offer_` en contexto de oferta

Detección de contexto: `useParams()` ya se usa (`useAnalytics.ts:196`). En la
oferta `params.token` existe y `params.landing` no → `const isOffer = !!params?.token`.

Bifurcación en el `track` central (`useAnalytics.ts:199-205`): cuando `isOffer`,
los event_types de catálogo compartido se mapean a su versión `offer_`:

```
filter_toggle        → offer_filter_toggle
filter_clear_single  → offer_filter_clear_single
filter_clear_all     → offer_filter_clear_all
filter_range_change  → offer_filter_range_change
filter_section_toggle→ offer_filter_section_toggle
filter_snapshot      → offer_filter_snapshot
sort_change          → offer_sort_change
catalog_load_more    → offer_catalog_load_more
search_focus         → offer_search_focus
search_submit        → offer_search_submit
search_clear         → offer_search_clear
```

El mapeo vive en un `Record<EventType, EventType>` (`OFFER_EVENT_ALIAS`). El
`track` central aplica el alias solo cuando `isOffer` y el evento está en el
mapa; el resto de eventos pasa sin cambio. Los eventos que YA tienen prefijo
`offer_` (funnel propio) no están en el mapa → no se tocan.

`buildFilterSnapshot`/`diffAndEmitFilterChanges` (`catalogFilterDiff.ts`) NO se
tocan — siguen llamando `analytics.trackFilterToggle(...)`; el alias se aplica
aguas abajo en el `track` central. Esto protege home/gamer (mismo helper, pero
sin `params.token` → `isOffer=false` → sin alias).

## Componentes — Backend (repo bal-2236-ws2)

### BE-1. Catálogo de eventos — agregar los `offer_*` de filtro/orden

`ws2/app/schemas/user_event.py`: nuevo set `OFFER_CATALOG_EVENT_TYPES` con los
11 strings del mapeo (offer_filter_toggle … offer_search_clear), incluido en
`ALL_EVENT_TYPES` vía `| OFFER_CATALOG_EVENT_TYPES`.

`fe/services/eventsApi.ts`: espejar los 11 strings en el union `EventType`.

**Regla de sincronización:** todo string de evento debe estar en AMBOS catálogos
(ALL_EVENT_TYPES backend Y EventType frontend) o el backend lo descarta
silenciosamente (rejected++).

### BE-2. `offer_funnel_report_service.py` — resolver `token → application_id`

Nuevo método que, dado el conjunto de `session_id` del funnel (que ahora son
tokens crudos):
- Hashea cada uno con `SecureLinkService._hash(token)`.
- Busca `secure_link.token_hash → application_id`.
- Permite reportar por oferta/solicitud, y unir `application → landing` para la
  landing real.

El funnel actual (COUNT DISTINCT session_id, `offer_funnel_report_service.py:33`)
sigue funcionando. Esto es una capa adicional de resolución, no un reemplazo.

## Manejo de errores y compatibilidad

- Token que no resuelve en `secure_link` (link viejo/manual): el evento igual se
  guarda con `session_id = token`; el reporte no lo cruza a application (queda
  como sesión sin solicitud). No rompe nada.
- Ofertas emitidas antes de este cambio: siguen con uuid anónimo viejo. No se
  re-atan (sin backfill — estamos en test).
- Buffer/flush/beforeunload de EventTrackerContext: sin cambios (ya usa
  `sessionUuidRef`, que tomará el token).
- Home/gamer/solicitar: `isOffer=false` (no hay `params.token`) → sin alias, sin
  `fixedSessionId`, comportamiento idéntico al actual.

## Testing

**Frontend:**
- `SessionContext` con `fixedSessionId`: NO llama `fetch` de session; expone el
  token como `sessionUuid`; `isInitialized=true`.
- `SessionContext` sin `fixedSessionId`: comportamiento actual (llama fetch,
  genera uuid).
- `useAnalytics` con `params.token` presente: `trackFilterToggle` emite
  `offer_filter_toggle`; sin `params.token`: emite `filter_toggle`.
- Un evento de funnel propio (offer_viewed) NO se re-aliasea.

**Backend:**
- Resolución `token → application_id` vía hash con un `secure_link` sembrado.
- Token inexistente → no resuelve, no crashea.

**E2E (DNI de pruebas 70020010):**
- Emitir oferta de prueba, navegar el flujo.
- Verificar en `user_event` que `session_id` = token de la URL (no un uuid).
- Verificar que los eventos de filtro del catálogo de oferta son
  `offer_filter_toggle` (no `filter_toggle`).
- Verificar que el reporte cruza el token a la application correcta.

## Fuera de alcance (YAGNI)

- Backfill de eventos viejos (estamos en test).
- Tocar el tracking de home/gamer/solicitar.
- Duplicar el token en `properties`.
- Un emisor `offerEvents(token)` dedicado (el `fixedSessionId` cubre todo).
