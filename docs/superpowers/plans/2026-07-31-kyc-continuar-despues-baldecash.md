# KYC "Continuar en otro momento" — Plan de implementación (baldecash / front postulante)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el cliente pueda pausar el KYC en cualquier sub-paso, reciba el link por WhatsApp, y al abrirlo retome en el sub-paso exacto donde quedó — en otro navegador o dispositivo.

**Architecture:** El avance del KYC deja de vivir solo en `localStorage` y pasa a leerse del API (`GET /public/kyc/progress`), con el valor local como caché de fallback. Se agrega un botón de pausa con modal, y una ruta nueva `/kyc/[token]` que canjea el token y monta el mismo orquestador de sub-pasos que ya existe, sin duplicar su lógica.

**Tech Stack:** Next.js 16 (App Router) · React · TypeScript · Tailwind · Jest

**Backend:** ya está en producción. El contrato vive en la **§6.bis** del spec de ws2 (`docs/superpowers/specs/2026-07-30-kyc-continuar-despues-link-whatsapp-design.md`), que reemplaza a las secciones previas de ese documento.

## Global Constraints

- **`step-complete` y `pause` exigen prueba de titularidad.** Hay exactamente dos puertas y el front usa una u otra según de dónde venga:
  - **En sesión** (flujo normal, sin token): `document_number`, que está en `localStorage` bajo `baldecash-${landing}-wizard-field-document_number`.
  - **Por link** (ruta `/kyc/[token]`): `resume_token`. Ahí NO hay `localStorage` del wizard, por eso el backend acepta el token como prueba.
  Mandar las dos, o ninguna, devuelve 422 `missing_proof`.
- **Todo evento `kyc_*` debe llevar `application_code` dentro de `properties`.** El panel de admin2 filtra por ese campo en SQL. Sin él, el evento se guarda pero el panel nace vacío. Aplica también a los eventos `kyc_*` que YA existen (`kyc_started`, `kyc_step_complete`, `kyc_completed`, …).
- **Los eventos de la página tokenizada usan el token como `session_id`**, no el UUID de sesión. `EventTrackerProvider` se monta en `LandingPageClient.tsx`, así que una ruta nueva de primer nivel queda FUERA de ese provider y `useEventTrackerOptional()` devuelve `null`. El patrón correcto ya existe: `src/app/prototipos/0.6/admision/_lib/events.ts`.
- **Un evento que no esté en el catálogo del backend se descarta en silencio** (responde 201 con `rejected > 0`). Los 7 tipos nuevos ya están catalogados en ws2; en el front hay que sumarlos al union `EventType` de `eventsApi.ts` o TypeScript no deja emitirlos.
- **`localStorage` puede lanzar excepción** en WebKit sandboxeado (Apple Mail). Todo acceso va envuelto, como ya hace `SessionContext`.
- El API base es `process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1'`.
- Todas las funciones de `kycApi.ts` son **fail-safe**: ante error de red devuelven un valor degradado, nunca lanzan.

---

### Task 1: Cliente del API de progreso y reanudación

**Files:**
- Modify: `src/app/prototipos/0.6/services/kycApi.ts`
- Test: `src/app/prototipos/0.6/services/__tests__/kycApi.resume.test.ts`

**Interfaces:**
- Produces:
  - `type KycStepStatus = 'pending' | 'completed'`
  - `interface KycProgressState { application_code: string; landing_slug: string | null; steps: {type: string; status: KycStepStatus; completed_at: string | null}[]; next_step: string | null; next_step_index: number | null; is_complete: boolean; kyc_enabled: boolean; resume: {enabled: boolean; ttl_hours: number}; expires_at?: string }`
  - `getKycProgress(applicationCode: string): Promise<KycProgressState | null>`
  - `completeKycStep(args: {applicationCode: string; stepType: string; documentNumber?: string; resumeToken?: string}): Promise<KycProgressState | null>`
  - `pauseKyc(args: {applicationCode: string; documentNumber: string}): Promise<{masked_phone: string; expires_at: string; ttl_hours: number} | {error: string; reason: string}>`
  - `resumeKyc(token: string): Promise<KycProgressState | {error: string; reason: string}>`

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/prototipos/0.6/services/__tests__/kycApi.resume.test.ts`:

```ts
import {
  getKycProgress,
  completeKycStep,
  pauseKyc,
  resumeKyc,
} from '../kycApi';

const okJson = (body: unknown) =>
  Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response);
const errJson = (status: number, body: unknown) =>
  Promise.resolve({ ok: false, status, json: () => Promise.resolve(body) } as Response);

const STATE = {
  application_code: 'APP-1',
  landing_slug: 'copia-home',
  steps: [{ type: 'dni_selfie', status: 'pending', completed_at: null }],
  next_step: 'dni_selfie',
  next_step_index: 0,
  is_complete: false,
  kyc_enabled: true,
  resume: { enabled: true, ttl_hours: 72 },
};

afterEach(() => jest.restoreAllMocks());

describe('getKycProgress', () => {
  it('devuelve el estado del API', async () => {
    global.fetch = jest.fn().mockReturnValue(okJson(STATE));
    await expect(getKycProgress('APP-1')).resolves.toEqual(STATE);
  });

  it('devuelve null ante error de red en vez de lanzar', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    await expect(getKycProgress('APP-1')).resolves.toBeNull();
  });
});

describe('completeKycStep', () => {
  it('manda document_number cuando se le pasa el DNI', async () => {
    const fetchMock = jest.fn().mockReturnValue(okJson(STATE));
    global.fetch = fetchMock;

    await completeKycStep({ applicationCode: 'APP-1', stepType: 'dni_selfie', documentNumber: '48509924' });

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toEqual({
      application_code: 'APP-1',
      step_type: 'dni_selfie',
      document_number: '48509924',
    });
    expect(body.resume_token).toBeUndefined();
  });

  it('manda resume_token cuando se le pasa el token', async () => {
    const fetchMock = jest.fn().mockReturnValue(okJson(STATE));
    global.fetch = fetchMock;

    await completeKycStep({ applicationCode: 'APP-1', stepType: 'dni_selfie', resumeToken: 'TOK' });

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.resume_token).toBe('TOK');
    expect(body.document_number).toBeUndefined();
  });

  it('nunca manda las dos pruebas juntas (el backend responde 422)', async () => {
    const fetchMock = jest.fn().mockReturnValue(okJson(STATE));
    global.fetch = fetchMock;

    await completeKycStep({
      applicationCode: 'APP-1', stepType: 'dni_selfie',
      documentNumber: '48509924', resumeToken: 'TOK',
    });

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(Number(!!body.document_number) + Number(!!body.resume_token)).toBe(1);
  });
});

describe('pauseKyc', () => {
  it('devuelve el telefono enmascarado', async () => {
    global.fetch = jest.fn().mockReturnValue(
      okJson({ masked_phone: '***-***-777', expires_at: '2026-08-03T00:00:00', ttl_hours: 72 }),
    );
    await expect(pauseKyc({ applicationCode: 'APP-1', documentNumber: '48509924' }))
      .resolves.toMatchObject({ masked_phone: '***-***-777' });
  });

  it('propaga el reason del backend para que la UI distinga los casos', async () => {
    global.fetch = jest.fn().mockReturnValue(
      errJson(403, { detail: { reason: 'ownership_check_failed', message: 'No coincide.' } }),
    );
    await expect(pauseKyc({ applicationCode: 'APP-1', documentNumber: '00000000' }))
      .resolves.toMatchObject({ reason: 'ownership_check_failed' });
  });
});

describe('resumeKyc', () => {
  it('devuelve el estado con expires_at', async () => {
    global.fetch = jest.fn().mockReturnValue(okJson({ ...STATE, expires_at: '2026-08-03T00:00:00' }));
    await expect(resumeKyc('TOK')).resolves.toMatchObject({ next_step: 'dni_selfie' });
  });

  it('distingue un link vencido de uno invalido', async () => {
    global.fetch = jest.fn().mockReturnValue(
      errJson(410, { detail: { reason: 'expired', message: 'Este enlace expiró.' } }),
    );
    await expect(resumeKyc('TOK')).resolves.toMatchObject({ reason: 'expired' });
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npx jest src/app/prototipos/0.6/services/__tests__/kycApi.resume.test.ts`
Expected: FAIL — `getKycProgress is not a function`

- [ ] **Step 3: Implementar**

Agregar al final de `src/app/prototipos/0.6/services/kycApi.ts`:

```ts
// ── "Continuar en otro momento" ──────────────────────────────────────────────
// El backend exige prueba de titularidad porque los application_code son
// secuenciales: en sesión se prueba con el DNI, y desde el link con el token.

export type KycStepStatus = 'pending' | 'completed';

export interface KycProgressStep {
  type: string;
  status: KycStepStatus;
  completed_at: string | null;
}

export interface KycProgressState {
  application_code: string;
  landing_slug: string | null;
  steps: KycProgressStep[];
  next_step: string | null;
  next_step_index: number | null;
  is_complete: boolean;
  /** false cuando la landing no tiene sub-pasos KYC habilitados. */
  kyc_enabled: boolean;
  resume: { enabled: boolean; ttl_hours: number };
  /** Solo lo devuelve /resume/{token}. */
  expires_at?: string;
}

export interface KycApiError {
  error: string;
  reason: string;
}

function isError(x: unknown): x is KycApiError {
  return typeof x === 'object' && x !== null && 'reason' in x;
}

/** Extrae `{reason, message}` del `detail` del backend. */
async function toError(response: Response): Promise<KycApiError> {
  try {
    const data = await response.json();
    const d = data?.detail;
    if (d && typeof d === 'object') {
      return { reason: d.reason ?? 'unknown', error: d.message ?? 'Ocurrió un error.' };
    }
  } catch { /* noop */ }
  return { reason: 'unknown', error: 'Ocurrió un error. Intenta nuevamente.' };
}

/** Estado del KYC. Fail-safe: null ante error, el caller cae al localStorage. */
export async function getKycProgress(applicationCode: string): Promise<KycProgressState | null> {
  try {
    const r = await fetch(
      `${API_BASE_URL}/public/kyc/progress?application_code=${encodeURIComponent(applicationCode)}`,
    );
    if (!r.ok) return null;
    return (await r.json()) as KycProgressState;
  } catch {
    return null;
  }
}

/**
 * Marca un sub-paso completado. Requiere EXACTAMENTE una prueba: el DNI (flujo
 * en sesión) o el token (flujo por link). Si llegan las dos, se prioriza el
 * token y se omite el DNI — mandar ambas devuelve 422 `missing_proof`.
 */
export async function completeKycStep(args: {
  applicationCode: string;
  stepType: string;
  documentNumber?: string;
  resumeToken?: string;
}): Promise<KycProgressState | null> {
  const body: Record<string, string> = {
    application_code: args.applicationCode,
    step_type: args.stepType,
  };
  if (args.resumeToken) body.resume_token = args.resumeToken;
  else if (args.documentNumber) body.document_number = args.documentNumber;

  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/progress/step-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) return null;
    return (await r.json()) as KycProgressState;
  } catch {
    return null;
  }
}

/** Pausa el KYC y dispara el envío del link por WhatsApp. */
export async function pauseKyc(args: {
  applicationCode: string;
  documentNumber: string;
}): Promise<{ masked_phone: string; expires_at: string; ttl_hours: number } | KycApiError> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_code: args.applicationCode,
        document_number: args.documentNumber,
      }),
    });
    if (!r.ok) return await toError(r);
    return await r.json();
  } catch {
    return { reason: 'network', error: 'Error de conexión. Intenta nuevamente.' };
  }
}

/** Canjea el token del link. No lo consume: es reutilizable. */
export async function resumeKyc(token: string): Promise<KycProgressState | KycApiError> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/resume/${encodeURIComponent(token)}`);
    if (!r.ok) return await toError(r);
    return (await r.json()) as KycProgressState;
  } catch {
    return { reason: 'network', error: 'Error de conexión. Intenta nuevamente.' };
  }
}

export { isError as isKycApiError };
```

- [ ] **Step 4: Correr el test para verificar que pasa**

Run: `npx jest src/app/prototipos/0.6/services/__tests__/kycApi.resume.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/prototipos/0.6/services/kycApi.ts src/app/prototipos/0.6/services/__tests__/kycApi.resume.test.ts
git commit -m "feat(kyc): cliente de progreso, pausa y reanudacion"
```

---

### Task 2: Catálogo de eventos del front

**Files:**
- Modify: `src/app/prototipos/0.6/services/eventsApi.ts` (union `EventType`)
- Test: `src/app/prototipos/0.6/services/__tests__/eventsApi.kycResume.test.ts`

**Interfaces:**
- Produces: los 7 tipos nuevos disponibles en el union `EventType`.

**Por qué:** el backend descarta en silencio lo no catalogado. Los 7 ya están del lado de ws2; acá hace falta que TypeScript los permita.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/prototipos/0.6/services/__tests__/eventsApi.kycResume.test.ts`:

```ts
import type { EventType } from '../eventsApi';

/**
 * Guardarraíl de tipos: si alguno de estos strings sale del union, esto no
 * compila. El backend descarta en silencio los eventos no catalogados, así que
 * un typo acá se traduce en métricas vacías sin ningún error visible.
 */
const RESUME_EVENTS: EventType[] = [
  'kyc_pause_click',
  'kyc_pause_requested',
  'kyc_resume_link_sent',
  'kyc_resume_link_send_error',
  'kyc_resume_link_opened',
  'kyc_resume_link_expired',
  'kyc_resumed',
];

it('los 7 eventos de continuar-despues estan en el union EventType', () => {
  expect(new Set(RESUME_EVENTS).size).toBe(7);
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep kycResume`
Expected: errores de tipo — los strings no están en el union

- [ ] **Step 3: Implementar**

En `src/app/prototipos/0.6/services/eventsApi.ts`, dentro del union `EventType`, junto a los demás `kyc_*`:

```ts
  // "Continuar en otro momento" — pausa elegida por el cliente + link por WhatsApp.
  // Los emitidos desde /kyc/[token] usan el token como session_id.
  | 'kyc_pause_click'
  | 'kyc_pause_requested'
  | 'kyc_resume_link_sent'
  | 'kyc_resume_link_send_error'
  | 'kyc_resume_link_opened'
  | 'kyc_resume_link_expired'
  | 'kyc_resumed'
```

- [ ] **Step 4: Correr los tests para verificar que pasan**

Run: `npx jest src/app/prototipos/0.6/services/__tests__/eventsApi.kycResume.test.ts && npx tsc --noEmit`
Expected: PASS y sin errores de tipo

- [ ] **Step 5: Commit**

```bash
git add src/app/prototipos/0.6/services/eventsApi.ts src/app/prototipos/0.6/services/__tests__/eventsApi.kycResume.test.ts
git commit -m "feat(kyc): 7 eventos de continuar-despues en el union EventType"
```

---

### Task 3: El progreso pasa a leerse del API

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/kyc/kycClient.tsx`
- Test: `src/app/prototipos/0.6/[landing]/solicitar/kyc/__tests__/kycClient.progress.test.tsx`

**Interfaces:**
- Consumes: `getKycProgress`, `completeKycStep` (Task 1).
- Produces: `KycContent` acepta props opcionales `{ resumeToken?: string; initialState?: KycProgressState }` para que la ruta tokenizada (Task 5) reuse el mismo orquestador sin duplicar la lógica de sub-pasos.

**Contexto:** hoy `readKycStep`/`writeKycStep` leen y escriben `localStorage` como fuente de verdad. Pasan a ser caché.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/prototipos/0.6/[landing]/solicitar/kyc/__tests__/kycClient.progress.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import KycClient from '../kycClient';
import * as kycApi from '@/app/prototipos/0.6/services/kycApi';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useParams: () => ({ landing: 'copia-home' }),
  useSearchParams: () => new URLSearchParams('code=APP-1'),
}));

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({
    kycEnabled: true,
    kycSteps: [{ type: 'dni_selfie' }, { type: 'contract' }],
    isLoading: false,
  }),
}));

const state = (next: string, idx: number) => ({
  application_code: 'APP-1', landing_slug: 'copia-home',
  steps: [
    { type: 'dni_selfie', status: idx > 0 ? 'completed' : 'pending', completed_at: null },
    { type: 'contract', status: 'pending', completed_at: null },
  ],
  next_step: next, next_step_index: idx, is_complete: false,
  kyc_enabled: true, resume: { enabled: true, ttl_hours: 72 },
});

afterEach(() => jest.restoreAllMocks());

it('arranca en el sub-paso que dice el API, no en el de localStorage', async () => {
  window.localStorage.setItem('baldecash-copia-home-kyc-step-APP-1', '0');
  jest.spyOn(kycApi, 'getKycProgress').mockResolvedValue(state('contract', 1) as never);

  render(<KycClient />);

  await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
});

it('cae al localStorage si el API falla', async () => {
  window.localStorage.setItem('baldecash-copia-home-kyc-step-APP-1', '1');
  jest.spyOn(kycApi, 'getKycProgress').mockResolvedValue(null);

  render(<KycClient />);

  await waitFor(() => expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument());
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npx jest src/app/prototipos/0.6/[landing]/solicitar/kyc/__tests__/kycClient.progress.test.tsx`
Expected: FAIL — el primer test muestra "Paso 1 de 2" porque hoy manda el localStorage

- [ ] **Step 3: Implementar**

En `kycClient.tsx`:

1. Reemplazar el `useEffect` de restauración (el que hoy hace `readKycStep`) por uno que consulte el API primero:

```tsx
  // El avance vive en la BD: el `localStorage` no cruza dispositivos y el link
  // de WhatsApp abre en otro navegador. Solo se cae al valor local si el API
  // no responde, para no dejar al cliente sin flujo.
  useEffect(() => {
    if (restoredRef.current || !code) return;
    restoredRef.current = true;

    if (initialState) {                       // vino de /kyc/[token]
      setIndex(initialState.next_step_index ?? 0);
      return;
    }

    let cancelled = false;
    void (async () => {
      const remote = await getKycProgress(code);
      if (cancelled) return;
      if (remote && remote.next_step_index != null) {
        setIndex(remote.next_step_index);
        writeKycStep(landing, code, remote.next_step_index); // refresca la caché
      } else {
        const stored = readKycStep(landing, code);           // fallback
        if (stored > 0) setIndex(stored);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

2. En `goNext`, persistir en el backend además de la caché local, con la prueba que corresponda:

```tsx
  const goNext = () => {
    tracker?.track('kyc_step_complete', {
      step: currentStep.type, index: safeIndex, application_code: code,
    });

    // Fire-and-forget: la UI no espera al backend. Si falla, el localStorage
    // sostiene el flujo en este dispositivo y el próximo montaje reconcilia.
    if (code) {
      void completeKycStep({
        applicationCode: code,
        stepType: currentStep.type,
        resumeToken,                                  // flujo por link
        documentNumber: resumeToken ? undefined : readWizardDni(landing), // en sesión
      });
    }

    if (safeIndex + 1 < kycSteps.length) {
      const next = safeIndex + 1;
      setIndex(next);
      writeKycStep(landing, code, next);
    } else {
      tracker?.track('kyc_completed', { application_code: code });
      clearKycStep(landing, code);
      goToConfirmacion();
    }
  };
```

3. Agregar el lector del DNI del wizard, con el acceso a `localStorage` protegido:

```tsx
/** DNI que el cliente tipeó en el wizard; es la prueba de titularidad en sesión. */
function readWizardDni(landing: string): string | undefined {
  try {
    return window.localStorage.getItem(`baldecash-${landing}-wizard-field-document_number`) ?? undefined;
  } catch {
    return undefined;
  }
}
```

4. Agregar `application_code: code` a las `properties` de **todos** los `tracker.track('kyc_*')` del archivo, incluido el `kyc_started` que ya existe.

5. Declarar las props nuevas en `KycContent` y `KycClient`:

```tsx
export interface KycClientProps {
  /** Presente solo cuando se entra por /kyc/[token]. */
  resumeToken?: string;
  /** Estado ya resuelto por la ruta tokenizada; evita un fetch redundante. */
  initialState?: KycProgressState;
}
```

- [ ] **Step 4: Correr el test para verificar que pasa**

Run: `npx jest src/app/prototipos/0.6/[landing]/solicitar/kyc/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/prototipos/0.6/[landing]/solicitar/kyc/
git commit -m "feat(kyc): el avance se lee del API con localStorage de fallback"
```

---

### Task 4: Botón de pausa y modal

**Files:**
- Create: `src/app/prototipos/0.6/[landing]/solicitar/kyc/PausarModal.tsx`
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/kyc/kycClient.tsx`
- Test: `src/app/prototipos/0.6/[landing]/solicitar/kyc/__tests__/PausarModal.test.tsx`

**Interfaces:**
- Consumes: `pauseKyc`, `isKycApiError` (Task 1).
- Produces: `<PausarModal open onClose applicationCode documentNumber landing onSent />`

**Regla de visibilidad:** el botón solo se renderiza si `resume.enabled` es `true` en el estado del API **y** hay DNI en `localStorage`. Sin DNI no hay prueba de titularidad posible, y ofrecer un botón que siempre falla es peor que no ofrecerlo.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/app/prototipos/0.6/[landing]/solicitar/kyc/__tests__/PausarModal.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PausarModal } from '../PausarModal';
import * as kycApi from '@/app/prototipos/0.6/services/kycApi';

const props = {
  open: true, onClose: jest.fn(), onSent: jest.fn(),
  applicationCode: 'APP-1', documentNumber: '48509924', landing: 'copia-home',
};

afterEach(() => jest.restoreAllMocks());

it('muestra el telefono enmascarado tras enviar', async () => {
  jest.spyOn(kycApi, 'pauseKyc').mockResolvedValue({
    masked_phone: '***-***-777', expires_at: '2026-08-03T00:00:00', ttl_hours: 72,
  });

  render(<PausarModal {...props} />);
  await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

  await waitFor(() => expect(screen.getByText(/\*\*\*-\*\*\*-777/)).toBeInTheDocument());
});

it('muestra un mensaje accionable si el envio falla', async () => {
  jest.spyOn(kycApi, 'pauseKyc').mockResolvedValue({
    reason: 'send_failed', error: 'No pudimos enviarte el enlace. Intenta nuevamente.',
  });

  render(<PausarModal {...props} />);
  await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

  await waitFor(() => expect(screen.getByText(/no pudimos enviarte el enlace/i)).toBeInTheDocument());
});

it('ante rate limit invita a revisar WhatsApp en vez de reintentar', async () => {
  jest.spyOn(kycApi, 'pauseKyc').mockResolvedValue({
    reason: 'rate_limited', error: 'Demasiados enlaces generados.',
  });

  render(<PausarModal {...props} />);
  await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

  await waitFor(() => expect(screen.getByText(/revisa tu whatsapp/i)).toBeInTheDocument());
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npx jest src/app/prototipos/0.6/[landing]/solicitar/kyc/__tests__/PausarModal.test.tsx`
Expected: FAIL — el módulo no existe

- [ ] **Step 3: Implementar el modal**

Crear `PausarModal.tsx`. Estados: `idle` → `sending` → `sent | error`. En `sent` muestra el enmascarado y el plazo (`ttl_hours`) que devolvió el backend — **nunca** un plazo hardcodeado, porque es configurable por landing. Mapear `reason` a copy:

| `reason` | Copy |
|---|---|
| `rate_limited` | "Ya te enviamos varios enlaces. Revisa tu WhatsApp." |
| `ownership_check_failed` | "No pudimos verificar tus datos. Vuelve a intentarlo desde el inicio." |
| `no_phone` | "Tu solicitud no tiene un celular registrado." |
| `send_failed` / resto | El `error` que vino del backend |

Emitir `kyc_pause_requested` al confirmar y `kyc_resume_link_sent` / `kyc_resume_link_send_error` según el resultado, todos con `application_code`.

- [ ] **Step 4: Enganchar el botón en `kycClient.tsx`**

Debajo del sub-paso actual, botón secundario "Continuar en otro momento" que abre el modal y emite `kyc_pause_click`. Condición de render:

```tsx
const canPause = Boolean(
  progressState?.resume?.enabled && code && readWizardDni(landing) && !resumeToken,
);
```

`!resumeToken` porque quien ya entró por el link no necesita pedir otro.

- [ ] **Step 5: Correr los tests**

Run: `npx jest src/app/prototipos/0.6/[landing]/solicitar/kyc/`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/prototipos/0.6/[landing]/solicitar/kyc/
git commit -m "feat(kyc): boton de pausa con modal de celular enmascarado"
```

---

### Task 5: Ruta `/kyc/[token]`

**Files:**
- Create: `src/app/prototipos/0.6/kyc/[token]/page.tsx`
- Create: `src/app/prototipos/0.6/kyc/[token]/ResumeClient.tsx`
- Create: `src/app/prototipos/0.6/kyc/[token]/resumeEvents.ts`
- Test: `src/app/prototipos/0.6/kyc/[token]/__tests__/ResumeClient.test.tsx`

**Interfaces:**
- Consumes: `resumeKyc`, `isKycApiError` (Task 1); `KycClient` con `resumeToken` + `initialState` (Task 3).
- Produces: la ruta `/{FRONTEND_URL}/kyc/{token}`, que es exactamente la URL que arma `SecureLinkService.build_url` en el backend.

**El punto crítico de esta task:** esta ruta está FUERA de `EventTrackerProvider` (que se monta en `LandingPageClient.tsx`), así que `useEventTrackerOptional()` devuelve `null` y **no se emite ningún evento**. Por eso `resumeEvents.ts` replica el patrón de `admision/_lib/events.ts`: manda a `/public/events/batch` usando el **token como `session_id`**.

- [ ] **Step 1: Escribir el test que falla**

Crear `__tests__/ResumeClient.test.tsx` cubriendo los cuatro estados del link:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { ResumeClient } from '../ResumeClient';
import * as kycApi from '@/app/prototipos/0.6/services/kycApi';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

afterEach(() => jest.restoreAllMocks());

it('link valido: monta el KYC en el sub-paso pendiente', async () => {
  jest.spyOn(kycApi, 'resumeKyc').mockResolvedValue({
    application_code: 'APP-1', landing_slug: 'copia-home',
    steps: [], next_step: 'contract', next_step_index: 1,
    is_complete: false, kyc_enabled: true,
    resume: { enabled: true, ttl_hours: 72 }, expires_at: '2026-08-03T00:00:00',
  } as never);

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(screen.queryByText(/enlace venció/i)).not.toBeInTheDocument());
});

it('link vencido: ofrece pedir uno nuevo', async () => {
  jest.spyOn(kycApi, 'resumeKyc').mockResolvedValue({ reason: 'expired', error: 'Este enlace expiró.' });

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(screen.getByText(/enlace venció/i)).toBeInTheDocument());
});

it('link invalido: no revela si la solicitud existe', async () => {
  jest.spyOn(kycApi, 'resumeKyc').mockResolvedValue({ reason: 'invalid', error: 'Enlace inválido.' });

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(screen.getByText(/enlace no es válido/i)).toBeInTheDocument());
});

it('KYC ya completo: redirige a confirmacion', async () => {
  const replace = jest.fn();
  jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ replace, push: jest.fn() });
  jest.spyOn(kycApi, 'resumeKyc').mockResolvedValue({
    application_code: 'APP-1', landing_slug: 'copia-home', steps: [],
    next_step: null, next_step_index: null, is_complete: true,
    kyc_enabled: true, resume: { enabled: true, ttl_hours: 72 },
  } as never);

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(replace).toHaveBeenCalled());
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npx jest src/app/prototipos/0.6/kyc/`
Expected: FAIL — los módulos no existen

- [ ] **Step 3: Implementar `resumeEvents.ts`**

Copiar la forma de `admision/_lib/events.ts`: emisor ligado al token, fire-and-forget, que nunca propaga errores. Debe emitir `kyc_resume_link_opened`, `kyc_resume_link_expired` y `kyc_resumed`, **siempre con `application_code` en `properties`** cuando esté disponible.

- [ ] **Step 4: Implementar `ResumeClient.tsx`**

Canjea el token con `resumeKyc(token)` y ramifica:

| Resultado | Qué hace |
|---|---|
| Estado válido, `is_complete: false` | Emite `kyc_resume_link_opened` + `kyc_resumed` y monta `<KycClient resumeToken={token} initialState={state} />` |
| `is_complete: true` | Redirige a la confirmación de esa landing |
| `kyc_enabled: false` | Redirige a la confirmación (la landing apagó el KYC) |
| `reason: expired \| revoked \| consumed \| inactive` | Pantalla "Este enlace venció" + botón para pedir uno nuevo; emite `kyc_resume_link_expired` |
| `reason: invalid \| purpose_mismatch` | "Este enlace no es válido" — mismo copy para ambos, para no revelar si la solicitud existe |
| `reason: network` | Pantalla de reintento |

`page.tsx` es un Server Component mínimo que solo extrae el `token` de los params y renderiza `<ResumeClient token={token} />`.

- [ ] **Step 5: Correr los tests**

Run: `npx jest src/app/prototipos/0.6/kyc/`
Expected: PASS (4 tests)

- [ ] **Step 6: Verificar que la URL coincide con la que arma el backend**

La URL del link es `{FRONTEND_URL}/kyc/{token}` y `FRONTEND_URL` en producción es `https://baldecash.com/prototipos/0.6`. La ruta creada en `src/app/prototipos/0.6/kyc/[token]/` resuelve exactamente esa URL. Confirmar con `npm run build` que la ruta aparece en el manifiesto.

- [ ] **Step 7: Commit**

```bash
git add src/app/prototipos/0.6/kyc/
git commit -m "feat(kyc): ruta /kyc/[token] que retoma el KYC desde el link"
```

---

## Verificación final

- [ ] `npx jest src/app/prototipos/0.6/services src/app/prototipos/0.6/[landing]/solicitar/kyc src/app/prototipos/0.6/kyc` en verde
- [ ] `npx tsc --noEmit` sin errores
- [ ] `npm run build` compila y `/prototipos/0.6/kyc/[token]` aparece en el manifiesto de rutas
- [ ] **E2E manual contra producción** (el backend ya está desplegado y `copia-home` tiene `resume` encendido con TTL 72 h):
  1. Llegar al KYC de una solicitud de `copia-home`, avanzar al sub-paso 2.
  2. Pausar y confirmar el envío.
  3. Abrir el link **desde otro navegador** y comprobar que arranca en el sub-paso 2.
  4. Verificar en el panel de admin2 que aparecen los eventos y el link emitido.
- [ ] **Prerrequisito del paso 2 del E2E:** la plantilla HSM `kyc_continuar_despues` tiene que existir y estar aprobada en Blip. Sin ella `/pause` responde **200** y el WhatsApp nunca llega — Blip acepta antes de que Meta valide. Confirmar en `blip_whatsapp_log` filtrando `source = 'kyc_resume'`.

## Fuera de alcance

- El panel de admin2 (`KycResumePanel.tsx` y el bloque "Continuar después" en `SolicitarFlowSection`): plan aparte para ese repo.
- La captura real de los sub-pasos: ya existe en `main`.
- OCR del documento: descartado para esta fase.
