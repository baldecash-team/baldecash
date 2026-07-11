# Atar eventos de oferta al token + prefijo offer_ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que todos los eventos de analytics del flujo de oferta condicional lleven `session_id = token` (atable a la solicitud vía secure_link) y prefijo `offer_`.

**Architecture:** El token crudo de la URL `/oferta/{token}` viaja como `session_id` (patrón admisión de Leo, adaptado a la infra existente vía `fixedSessionId` en SessionProvider). En `useAnalytics`, los eventos de catálogo compartido se aliasean a `offer_*` solo en contexto de oferta. El reporte backend resuelve `token → application_id` hasheando el token contra `secure_link.token_hash`.

**Tech Stack:** Next.js 14 (App Router), React, TypeScript, Jest (frontend); FastAPI, SQLAlchemy, pytest (backend).

## Global Constraints

- Privacidad: el token va SOLO en `session_id`, NUNCA en `properties`. Los eventos NUNCA envían value/precio/nombre/document_number (BLOCKED_PROPERTIES).
- Todo string de evento nuevo debe estar en AMBOS catálogos: `ALL_EVENT_TYPES` (ws2 `app/schemas/user_event.py`) Y el union `EventType` (fe `services/eventsApi.ts`), o el backend lo descarta silenciosamente (rejected++).
- Cero regresión para home/gamer/solicitar: sin `fixedSessionId` → session anónima como hoy; sin `params.token` → sin alias `offer_`.
- FE repo: `C:/Users/tecnico/Documents/projects/baldecash/bal-2236-fe`. BE repo: `C:/Users/tecnico/Documents/projects/baldecash/bal-2236-ws2`. Ambos en rama `feature/BAL-2236`.
- Tests FE: `npm test -- <ruta>`. Tests BE: `pytest <ruta> -v`.
- No tocar CLAUDE.md ni .claude. Commits locales OK; push/merge requieren OK explícito de Emilio.
- Los 11 eventos aliaseados (exactos): `filter_toggle→offer_filter_toggle`, `filter_clear_single→offer_filter_clear_single`, `filter_clear_all→offer_filter_clear_all`, `filter_range_change→offer_filter_range_change`, `filter_section_toggle→offer_filter_section_toggle`, `filter_snapshot→offer_filter_snapshot`, `sort_change→offer_sort_change`, `catalog_load_more→offer_catalog_load_more`, `search_focus→offer_search_focus`, `search_submit→offer_search_submit`, `search_clear→offer_search_clear`.

---

## File Structure

**Frontend (bal-2236-fe):**
- Modify `src/app/prototipos/0.6/[landing]/solicitar/context/SessionContext.tsx` — prop `fixedSessionId`.
- Modify `src/app/prototipos/0.6/oferta/[token]/layout.tsx` — pasar el token.
- Modify `src/app/prototipos/0.6/analytics/useAnalytics.ts` — alias `offer_*` en contexto oferta.
- Modify `src/app/prototipos/0.6/services/eventsApi.ts` — 11 strings nuevos en `EventType`.
- Test: `src/app/prototipos/0.6/[landing]/solicitar/context/__tests__/SessionContext.test.tsx` (nuevo).
- Test: `src/app/prototipos/0.6/analytics/__tests__/useAnalytics.offer-alias.test.ts` (nuevo).

**Backend (bal-2236-ws2):**
- Modify `app/schemas/user_event.py` — set `OFFER_CATALOG_EVENT_TYPES`.
- Modify `app/services/offer_funnel_report_service.py` — método `resolve_applications`.
- Test: `tests/schemas/test_user_event_catalog.py` (o el existente de schemas) — presencia de los 11 strings.
- Test: `tests/services/test_offer_funnel_report.py` (existente) — resolución token→application.

---

### Task 1: SessionContext acepta `fixedSessionId`

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/context/SessionContext.tsx`
- Test: `src/app/prototipos/0.6/[landing]/solicitar/context/__tests__/SessionContext.test.tsx` (Create)

**Interfaces:**
- Produces: `SessionProviderProps` con `fixedSessionId?: string` y `landingSlug?: string` (ahora opcional). Cuando `fixedSessionId` está presente, `useSession().sessionUuid === fixedSessionId` y NO se llama `fetch`.

- [ ] **Step 1: Write the failing test**

Crear `src/app/prototipos/0.6/[landing]/solicitar/context/__tests__/SessionContext.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { SessionProvider, useSession } from '../SessionContext';

function Probe() {
  const { sessionUuid, isInitialized } = useSession();
  return <div data-testid="uuid">{sessionUuid ?? 'null'}:{String(isInitialized)}</div>;
}

describe('SessionProvider fixedSessionId', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ session_uuid: 'x', session_id: 1 }) })
    ) as unknown as typeof fetch;
  });

  it('usa el fixedSessionId como sessionUuid y NO llama fetch de session', async () => {
    render(
      <SessionProvider fixedSessionId="tok_abc123">
        <Probe />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('uuid').textContent).toBe('tok_abc123:true');
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('sin fixedSessionId conserva el comportamiento actual (llama fetch)', async () => {
    render(
      <SessionProvider landingSlug="home">
        <Probe />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- SessionContext.test`
Expected: FAIL — primer test falla (hoy `fixedSessionId` no existe, se llama fetch y sessionUuid no es el token).

- [ ] **Step 3: Implement**

En `SessionContext.tsx`:

Cambiar la interfaz de props (`:99-102`):

```tsx
interface SessionProviderProps {
  children: ReactNode;
  landingSlug?: string;
  /** Cuando se pasa, se usa como session_id fijo (p.ej. el token de una oferta):
   *  NO se crea session anónima en backend; el tracking usa este id tal cual. */
  fixedSessionId?: string;
}
```

Cambiar la firma del componente y el estado inicial (`:234-241`):

```tsx
export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  landingSlug,
  fixedSessionId,
}) => {
  const [sessionUuid, setSessionUuid] = useState<string | null>(fixedSessionId ?? null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(!!fixedSessionId);
  const [isCreating, setIsCreating] = useState(false);
```

Cambiar el `sessionKey` para tolerar `landingSlug` undefined (`:244`):

```tsx
  const sessionKey = useMemo(() => getSessionKey(landingSlug ?? 'default'), [landingSlug]);
```

Cambiar el `useEffect` de auto-init (`:387-390`) para saltar cuando hay fixedSessionId:

```tsx
  useEffect(() => {
    if (fixedSessionId) return; // session_id fijo → no crear session anónima
    if (!landingSlug || isInitialized || isCreating) return;
    initSession(landingSlug);
  }, [fixedSessionId, landingSlug, isInitialized, isCreating, initSession]);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- SessionContext.test`
Expected: PASS (ambos tests).

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/tecnico/Documents/projects/baldecash/bal-2236-fe"
git add "src/app/prototipos/0.6/[landing]/solicitar/context/SessionContext.tsx" "src/app/prototipos/0.6/[landing]/solicitar/context/__tests__/SessionContext.test.tsx"
git commit -m "feat(BAL-2236): SessionProvider acepta fixedSessionId (token como session_id)"
```

---

### Task 2: Layout de oferta pasa el token a SessionProvider

**Files:**
- Modify: `src/app/prototipos/0.6/oferta/[token]/layout.tsx`

**Interfaces:**
- Consumes: `SessionProvider` con `fixedSessionId` (Task 1).
- Produces: todos los eventos emitidos bajo `/oferta/{token}/...` llevan `session_id = token`.

- [ ] **Step 1: Implementar (cambio de wiring, sin test unitario — se valida E2E en Task 6)**

En `layout.tsx`, importar `useParams` y normalizar el token (Next puede dar `string | string[]`):

```tsx
import { useEffect, type ReactNode } from 'react';
import { useParams } from 'next/navigation';

import { SessionProvider } from '../../[landing]/solicitar/context/SessionContext';
import { EventTrackerProvider } from '../../[landing]/solicitar/context/EventTrackerContext';
```

Reemplazar el bloque de comentario de tracking (`:13-17`) por:

```tsx
 * El token del link seguro (segmento [token] de la ruta) viaja como session_id
 * de cada evento (patrón admisión). Así el reporte puede resolver la solicitud
 * exacta hasheando el token contra secure_link.token_hash — sin session anónima
 * ni landing hardcodeada. El token va SOLO en session_id, nunca en properties.
```

Dentro del componente, leer el token y pasarlo:

```tsx
export default function OfertaLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const token = Array.isArray(params?.token) ? params.token[0] : (params?.token ?? '');

  useEffect(() => {
    // ... (bloque BRAND_VARS existente, sin cambios) ...
  }, []);

  return (
    <SessionProvider fixedSessionId={token}>
      <EventTrackerProvider>{children}</EventTrackerProvider>
    </SessionProvider>
  );
}
```

(El bloque `useEffect` de `BRAND_VARS` y la constante `BRAND_VARS` NO cambian.)

- [ ] **Step 2: Verify tipos y build de tipos**

Run: `cd "C:/Users/tecnico/Documents/projects/baldecash/bal-2236-fe" && npx tsc --noEmit`
Expected: sin errores nuevos en `layout.tsx`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/prototipos/0.6/oferta/[token]/layout.tsx"
git commit -m "feat(BAL-2236): layout de oferta pasa el token como session_id (fixedSessionId)"
```

---

### Task 3: eventsApi.ts declara los 11 eventos offer_ de catálogo

**Files:**
- Modify: `src/app/prototipos/0.6/services/eventsApi.ts`

**Interfaces:**
- Produces: el union `EventType` incluye los 11 strings `offer_filter_*` / `offer_sort_change` / `offer_catalog_load_more` / `offer_search_*`. Task 4 los usa en el mapa de alias.

- [ ] **Step 1: Implementar**

En `eventsApi.ts`, al final del union `EventType` (después de `offer_time_to_convert`, `:235`), antes del `;`, agregar:

```ts
  | 'offer_time_to_convert'
  // BAL-2236 — eventos de catálogo de oferta con prefijo (alias de los compartidos):
  | 'offer_filter_toggle'
  | 'offer_filter_clear_single'
  | 'offer_filter_clear_all'
  | 'offer_filter_range_change'
  | 'offer_filter_section_toggle'
  | 'offer_filter_snapshot'
  | 'offer_sort_change'
  | 'offer_catalog_load_more'
  | 'offer_search_focus'
  | 'offer_search_submit'
  | 'offer_search_clear';
```

(Mover el `;` que hoy cierra en `offer_time_to_convert` al final del bloque nuevo.)

- [ ] **Step 2: Verify tipos**

Run: `cd "C:/Users/tecnico/Documents/projects/baldecash/bal-2236-fe" && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add "src/app/prototipos/0.6/services/eventsApi.ts"
git commit -m "feat(BAL-2236): declara 11 eventos offer_ de catálogo en EventType"
```

---

### Task 4: useAnalytics aliasea a offer_ en contexto de oferta

**Files:**
- Modify: `src/app/prototipos/0.6/analytics/useAnalytics.ts`
- Test: `src/app/prototipos/0.6/analytics/__tests__/useAnalytics.offer-alias.test.ts` (Create)

**Interfaces:**
- Consumes: los 11 strings `offer_*` de `EventType` (Task 3).
- Produces: cuando la ruta tiene `params.token` (contexto oferta), `track('filter_toggle', …)` emite `offer_filter_toggle`; fuera de oferta emite `filter_toggle`.

- [ ] **Step 1: Write the failing test**

Crear `src/app/prototipos/0.6/analytics/__tests__/useAnalytics.offer-alias.test.ts`:

```tsx
import { renderHook } from '@testing-library/react';
import { useAnalytics } from '../useAnalytics';

const mockTrack = jest.fn();
jest.mock(
  '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext',
  () => ({ useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }) })
);

let mockParams: Record<string, unknown> = {};
jest.mock('next/navigation', () => ({ useParams: () => mockParams }));

describe('useAnalytics alias offer_', () => {
  beforeEach(() => { mockTrack.mockClear(); });

  it('en contexto de oferta (params.token) aliasea filter_toggle → offer_filter_toggle', () => {
    mockParams = { token: 'tok_abc' };
    const { result } = renderHook(() => useAnalytics());
    result.current.trackFilterToggle({ filter_code: 'brand', filter_value: 'hp', active: true });
    expect(mockTrack).toHaveBeenCalledWith('offer_filter_toggle', expect.any(Object), undefined);
  });

  it('fuera de oferta (sin token) conserva filter_toggle', () => {
    mockParams = { landing: 'home' };
    const { result } = renderHook(() => useAnalytics());
    result.current.trackFilterToggle({ filter_code: 'brand', filter_value: 'hp', active: true });
    expect(mockTrack).toHaveBeenCalledWith('filter_toggle', expect.any(Object), undefined);
  });

  it('un evento de funnel propio (offer_viewed) NO se re-aliasea en oferta', () => {
    mockParams = { token: 'tok_abc' };
    const { result } = renderHook(() => useAnalytics());
    result.current.track('offer_viewed', { offer_case: 'downgrade' });
    expect(mockTrack).toHaveBeenCalledWith('offer_viewed', expect.any(Object), undefined);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useAnalytics.offer-alias`
Expected: FAIL — hoy `trackFilterToggle` en oferta emite `filter_toggle`, no `offer_filter_toggle`.

- [ ] **Step 3: Implement**

En `useAnalytics.ts`, tras los imports (`:18`), agregar el mapa de alias:

```ts
/** Eventos de catálogo compartido → su versión con prefijo offer_ (BAL-2236).
 *  Solo se aplica en contexto de oferta (ruta con params.token). El resto de
 *  eventos (incluidos los que ya empiezan con offer_) pasan sin cambio. */
const OFFER_EVENT_ALIAS: Partial<Record<EventType, EventType>> = {
  filter_toggle: 'offer_filter_toggle',
  filter_clear_single: 'offer_filter_clear_single',
  filter_clear_all: 'offer_filter_clear_all',
  filter_range_change: 'offer_filter_range_change',
  filter_section_toggle: 'offer_filter_section_toggle',
  filter_snapshot: 'offer_filter_snapshot',
  sort_change: 'offer_sort_change',
  catalog_load_more: 'offer_catalog_load_more',
  search_focus: 'offer_search_focus',
  search_submit: 'offer_search_submit',
  search_clear: 'offer_search_clear',
};
```

Dentro de `useAnalytics()` (`:194-205`), derivar `isOffer` y aplicar el alias en el `track` central:

```ts
export function useAnalytics(): UseAnalyticsReturn {
  const tracker = useEventTrackerOptional();
  const params = useParams();
  const isOffer = !!params?.token;
  const landing = (params?.landing as string) || 'home';

  const track = useCallback(
    (eventType: EventType, properties?: Props, elementId?: string) => {
      if (!tracker) return;
      const finalType = isOffer ? (OFFER_EVENT_ALIAS[eventType] ?? eventType) : eventType;
      tracker.track(finalType, { landing, ...(properties || {}) }, elementId);
    },
    [tracker, landing, isOffer]
  );
```

Nota: `trackFilterSnapshot` (`:249-255`) llama `tracker.track` directo, salteando el `track` central. Aplicar el alias ahí también:

```ts
  const trackFilterSnapshot = useCallback<UseAnalyticsReturn['trackFilterSnapshot']>(
    (args) => {
      if (!tracker) return;
      const type = isOffer ? 'offer_filter_snapshot' : 'filter_snapshot';
      tracker.track(type, { landing, ...args });
    },
    [tracker, landing, isOffer]
  );
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- useAnalytics.offer-alias`
Expected: PASS (3 tests).

- [ ] **Step 5: Regression — el resto de la suite de analytics sigue verde**

Run: `npm test -- src/app/prototipos/0.6/analytics`
Expected: PASS (incluye `catalogFilterDiff.test.ts` sin cambios).

- [ ] **Step 6: Commit**

```bash
git add "src/app/prototipos/0.6/analytics/useAnalytics.ts" "src/app/prototipos/0.6/analytics/__tests__/useAnalytics.offer-alias.test.ts"
git commit -m "feat(BAL-2236): useAnalytics aliasea eventos de catálogo a offer_ en contexto de oferta"
```

---

### Task 5: Backend declara los 11 eventos offer_ en el catálogo

**Files:**
- Modify: `C:/Users/tecnico/Documents/projects/baldecash/bal-2236-ws2/app/schemas/user_event.py`
- Test: `C:/Users/tecnico/Documents/projects/baldecash/bal-2236-ws2/tests/schemas/test_offer_catalog_events.py` (Create)

**Interfaces:**
- Consumes: los 11 strings exactos de las Global Constraints.
- Produces: `ALL_EVENT_TYPES` (en `user_event.py`) contiene los 11 strings `offer_*` de catálogo → el backend los acepta en `/public/events/batch`.

- [ ] **Step 1: Write the failing test**

Crear `tests/schemas/test_offer_catalog_events.py`:

```python
from app.schemas.user_event import ALL_EVENT_TYPES

OFFER_CATALOG = {
    "offer_filter_toggle", "offer_filter_clear_single", "offer_filter_clear_all",
    "offer_filter_range_change", "offer_filter_section_toggle", "offer_filter_snapshot",
    "offer_sort_change", "offer_catalog_load_more",
    "offer_search_focus", "offer_search_submit", "offer_search_clear",
}

def test_offer_catalog_events_in_all_event_types():
    missing = OFFER_CATALOG - ALL_EVENT_TYPES
    assert not missing, f"faltan en ALL_EVENT_TYPES: {missing}"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:/Users/tecnico/Documents/projects/baldecash/bal-2236-ws2" && pytest tests/schemas/test_offer_catalog_events.py -v`
Expected: FAIL — los 11 strings aún no están en `ALL_EVENT_TYPES`.

- [ ] **Step 3: Implement**

En `app/schemas/user_event.py`, agregar el set (junto a los otros sets de oferta, p.ej. tras `OFFER_FUNNEL_EVENT_TYPES`):

```python
# BAL-2236 — eventos de catálogo de la oferta con prefijo (alias de los
# compartidos filter_*/sort_*/catalog_*/search_*). Se emiten solo bajo /oferta.
OFFER_CATALOG_EVENT_TYPES = {
    "offer_filter_toggle",
    "offer_filter_clear_single",
    "offer_filter_clear_all",
    "offer_filter_range_change",
    "offer_filter_section_toggle",
    "offer_filter_snapshot",
    "offer_sort_change",
    "offer_catalog_load_more",
    "offer_search_focus",
    "offer_search_submit",
    "offer_search_clear",
}
```

Y en la definición de `ALL_EVENT_TYPES`, sumar el set con `| OFFER_CATALOG_EVENT_TYPES` (siguiendo el patrón existente de los demás sets `| OFFER_*`).

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/schemas/test_offer_catalog_events.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/tecnico/Documents/projects/baldecash/bal-2236-ws2"
git add app/schemas/user_event.py tests/schemas/test_offer_catalog_events.py
git commit -m "feat(BAL-2236): declara 11 eventos offer_ de catálogo en ALL_EVENT_TYPES"
```

---

### Task 6: Reporte resuelve token → application_id

**Files:**
- Modify: `C:/Users/tecnico/Documents/projects/baldecash/bal-2236-ws2/app/services/offer_funnel_report_service.py`
- Test: `C:/Users/tecnico/Documents/projects/baldecash/bal-2236-ws2/tests/services/test_offer_funnel_report.py` (existente — agregar test)

**Interfaces:**
- Consumes: `SecureLink.token_hash` (SHA-256 hexdigest del token crudo), `SecureLink.application_id`. El hash se calcula con `hashlib.sha256(token.encode("utf-8")).hexdigest()` (misma fórmula que `SecureLinkService._hash`).
- Produces: `OfferFunnelReportService.resolve_applications(session_ids: list[str]) -> dict[str, int]` — mapea cada token (session_id) a su `application_id`; omite los que no resuelven.

- [ ] **Step 1: Write the failing test**

En `tests/services/test_offer_funnel_report.py`, agregar (usar los helpers/fixtures existentes del archivo para crear un `SecureLink`; si no hay factory, insertar el modelo directo):

```python
import hashlib
from app.db.models.secure_link import SecureLink, SecureLinkPurpose
from app.services.offer_funnel_report_service import OfferFunnelReportService


def test_resolve_applications_maps_token_to_application(db_session):
    raw_token = "tok_e2e_123"
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    db_session.add(SecureLink(
        token_hash=token_hash,
        application_id=4242,
        purpose=SecureLinkPurpose.CONDITIONAL_OFFER,
    ))
    db_session.commit()

    svc = OfferFunnelReportService(db_session)
    result = svc.resolve_applications([raw_token, "token_inexistente"])

    assert result == {raw_token: 4242}
```

Nota para el implementador: usar el nombre real del purpose de oferta (revisar `SecureLinkPurpose` en `app/db/models/secure_link.py`; si no es `CONDITIONAL_OFFER`, usar el que exista — el purpose no afecta la resolución, solo satisface el NOT NULL). Usar la fixture de sesión de BD que ya usen los otros tests del archivo (revisar los imports/params existentes).

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:/Users/tecnico/Documents/projects/baldecash/bal-2236-ws2" && pytest tests/services/test_offer_funnel_report.py::test_resolve_applications_maps_token_to_application -v`
Expected: FAIL — `resolve_applications` no existe.

- [ ] **Step 3: Implement**

En `offer_funnel_report_service.py`, agregar imports y el método:

```python
import hashlib
from app.db.models.secure_link import SecureLink
```

Dentro de la clase `OfferFunnelReportService`:

```python
    def resolve_applications(self, session_ids: list[str]) -> dict[str, int]:
        """Mapea session_id (token crudo de la oferta) → application_id vía
        secure_link.token_hash. Omite los tokens que no resuelven (links viejos
        o session_ids que no son tokens de oferta)."""
        if not session_ids:
            return {}
        hash_to_token = {
            hashlib.sha256(t.encode("utf-8")).hexdigest(): t for t in session_ids
        }
        rows = (
            self.db.query(SecureLink.token_hash, SecureLink.application_id)
            .filter(SecureLink.token_hash.in_(list(hash_to_token.keys())))
            .all()
        )
        return {
            hash_to_token[h]: app_id
            for h, app_id in rows
            if h in hash_to_token
        }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/services/test_offer_funnel_report.py::test_resolve_applications_maps_token_to_application -v`
Expected: PASS.

- [ ] **Step 5: Regression — la suite del reporte sigue verde**

Run: `pytest tests/services/test_offer_funnel_report.py -v`
Expected: PASS (todos).

- [ ] **Step 6: Commit**

```bash
git add app/services/offer_funnel_report_service.py tests/services/test_offer_funnel_report.py
git commit -m "feat(BAL-2236): reporte resuelve token de oferta → application_id vía secure_link"
```

---

## Self-Review

**Spec coverage:**
- FE-1 (SessionContext fixedSessionId) → Task 1 ✅
- FE-2 (layout pasa token) → Task 2 ✅
- FE-3 (useAnalytics alias offer_) → Task 4 ✅ (declaración de tipos en Task 3)
- BE-1 (catálogo backend 11 strings) → Task 5 ✅ (frontend EventType en Task 3)
- BE-2 (reporte resuelve token→application) → Task 6 ✅
- Privacidad (token solo en session_id) → constraint global + Task 2 (nunca en properties) ✅
- E2E con DNI 70020010 → se ejecuta manualmente tras Task 6 (no es una tarea de código; documentado en el spec §Testing).

**Placeholder scan:** sin TBD/TODO. Todos los pasos tienen código real. Las dos notas al implementador (purpose real en Task 6, mover `;` en Task 3) son instrucciones concretas verificables, no placeholders.

**Type consistency:** los 11 strings `offer_*` son idénticos en Task 3 (EventType), Task 4 (OFFER_EVENT_ALIAS valores), Task 5 (OFFER_CATALOG_EVENT_TYPES) y las Global Constraints. `fixedSessionId?: string` consistente entre Task 1 (define) y Task 2 (consume). `resolve_applications(list[str]) -> dict[str,int]` consistente entre Interfaces y test.

**Orden:** FE 1→2→3→4, luego BE 5→6. Task 3 (tipos) va antes de Task 4 (uso) para que `tsc` pase. Task 5 (catálogo) puede ir en cualquier momento pero se agrupa con backend.
