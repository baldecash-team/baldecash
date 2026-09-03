# KYC: contrato antes de aprobar y firma por aceptación — plan FRONT (baldecash)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el paso `contract` del KYC muestre el PDF real antes de cerrar el flujo, espere mientras se genera, exija aceptarlo para continuar, mande el hash de lo aceptado, y sepa volver a pedirlo cuando el contrato cambió — sin romper las landings que siguen firmando por Keynua.

**Architecture:** Un hook `useContratoKyc` concentra el polling y los estados del contrato; `ContratoStep` queda en render. El campo `modo` que devuelve `/public/kyc/contrato` decide qué se exige: `aceptacion` (camino nuevo: documento obligatorio + hash) o `emitido` (camino de hoy, sin tocar). `kycClient` deja de avanzar a ciegas en el paso `contract`: espera la respuesta para poder frenar ante un 409.

**Tech Stack:** Next.js 15 + React 19 (App Router), TypeScript, Jest + Testing Library (`npm test`), Tailwind.

**Spec:** ws2 `docs/superpowers/specs/2026-09-03-kyc-contrato-antes-de-aprobar-firma-por-aceptacion-design.md` (sección 3), worktree `D:\repos\ws2-kyc-contrato`.

## Global Constraints

- Worktree `D:\repos\baldecash-wt-kyc-contrato`, rama `feat/kyc-contrato-antes-de-aprobar` desde `origin/main` (ya creado). PRs van a `main`.
- Base del KYC: `src/app/prototipos/0.6/`. El paso vive en `[landing]/solicitar/kyc/steps/ContratoStep.tsx` y lo orquesta `[landing]/solicitar/kyc/kycClient.tsx`, que además se monta desde la ruta tokenizada `0.6/kyc/[token]`.
- Tests: `npx jest <ruta>` desde el worktree. Los mocks del módulo `kycApi` siguen el patrón de `ContratoStep.contratoReal.test.tsx` (`jest.requireActual` + sobrescribir la función).
- **`modo` desconocido se trata como `emitido`.** Es el comportamiento que nunca traba a nadie.
- Todos los `fetch` de `kycApi` son fail-safe: devuelven `null`/objeto vacío ante error de red y no lanzan. Eso no cambia.
- Nada de `contract_hash` cuando `modo === 'emitido'`: ese camino no tiene hash y mandarlo sería ruido.
- Commits en español, prefijo `feat(kyc):` / `test(kyc):`, con `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

---

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/app/prototipos/0.6/services/kycApi.ts` (modificar) | `ContratoKyc`, `getContrato(reintentar)`, `completeKycStep(contractHash)` con el 409, `motivo` en el veredicto. |
| `src/app/prototipos/0.6/services/eventsApi.ts` (modificar) | Los cinco `EventType` nuevos. |
| `…/solicitar/kyc/useContratoKyc.ts` (crear) | Polling, estados, reintento y el evento de cada transición. |
| `…/solicitar/kyc/steps/ContratoStep.tsx` (modificar) | Render por estado y `modo`; el botón; el hash al continuar. |
| `…/solicitar/kyc/kycClient.tsx` (modificar) | `goNext` del paso `contract` espera; `cerrarKyc` con `contrato_vencido`. |
| `…/solicitar/kyc/__tests__/useContratoKyc.test.ts` (crear) | El hook. |
| `…/solicitar/kyc/steps/__tests__/ContratoStep.aceptacion.test.tsx` (crear) | El camino nuevo. |
| `…/solicitar/kyc/steps/__tests__/ContratoStep.contratoReal.test.tsx` (modificar) | El camino `emitido`, que no cambia. |
| `…/solicitar/kyc/__tests__/kycClient.contrato.test.tsx` (crear) | El 409 en el avance y en el cierre. |

---

### Task 1: El contrato de datos en `kycApi.ts`

**Files:**
- Modify: `src/app/prototipos/0.6/services/kycApi.ts` (`ContratoEmitido`/`getContrato` ~L451-494, `completeKycStep` ~L501-525, `KycVeredicto` ~L286)
- Test: `src/app/prototipos/0.6/services/__tests__/kycApi.contrato.test.ts`

**Interfaces:**
- Produces:
  - `export type ContratoModo = 'aceptacion' | 'emitido';`
  - `export type ContratoEstado = 'generando' | 'listo' | 'error';`
  - `export interface ContratoKyc { modo: ContratoModo; estado: ContratoEstado; disponible: boolean; url?: string; html?: string; hash?: string; external_id?: string; emitido_at?: string; }`
  - `getContrato(args: {applicationCode, documentNumber?, resumeToken?, reintentar?}): Promise<ContratoKyc | null>` — `null` ante error de red o HTTP no-OK. Una respuesta sin `modo`/`estado` (backend viejo) se adapta desde `disponible`.
  - `completeKycStep(args & {contractHash?: string}): Promise<{state: KycProgressState | null; outdated: boolean}>`.
  - `KycVeredicto` gana `motivo?: 'contrato_vencido'` y `firmado?: boolean`.

- [ ] **Step 1: Escribir el test que falla**

```ts
/// <reference types="jest" />
/**
 * El contrato de datos del paso de firma.
 *
 * Lo que se protege: que una respuesta de un backend viejo (sin `modo`) no
 * rompa el paso, y que el 409 de `step-complete` se distinga de un fallo de
 * red — uno significa "recargá el contrato" y el otro "reintentá".
 */
import { getContrato, completeKycStep } from '../kycApi';

const okJson = (body: unknown, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) } as Response);

describe('getContrato', () => {
  beforeEach(() => { global.fetch = jest.fn(); });

  it('devuelve el contrato listo tal cual', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({
      modo: 'aceptacion', estado: 'listo', disponible: true,
      url: 'https://s3/c.pdf', hash: 'a'.repeat(64), external_id: 'kyc-1',
    }));

    const r = await getContrato({ applicationCode: 'APP-1', documentNumber: '70020010' });

    expect(r).toMatchObject({ modo: 'aceptacion', estado: 'listo', hash: 'a'.repeat(64) });
  });

  it('manda el DNI o el token, nunca los dos', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ modo: 'emitido', estado: 'generando', disponible: false }));

    await getContrato({ applicationCode: 'APP-1', documentNumber: '70020010', resumeToken: 'TOK' });

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('resume_token=TOK');
    expect(url).not.toContain('document_number');
  });

  it('pide el reintento cuando se lo piden', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ modo: 'aceptacion', estado: 'generando', disponible: false }));

    await getContrato({ applicationCode: 'APP-1', documentNumber: '7', reintentar: true });

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('reintentar=1');
  });

  it('adapta una respuesta vieja sin modo ni estado', async () => {
    // Backend anterior a este cambio: solo `disponible` + `html`.
    (global.fetch as jest.Mock).mockReturnValue(okJson({ disponible: true, html: '<p>Contrato</p>' }));

    const r = await getContrato({ applicationCode: 'APP-1', documentNumber: '7' });

    expect(r).toMatchObject({ modo: 'emitido', estado: 'listo', html: '<p>Contrato</p>' });
  });

  it('un disponible false sin estado es generando', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ disponible: false }));
    expect(await getContrato({ applicationCode: 'A', documentNumber: '7' })).toMatchObject({
      modo: 'emitido', estado: 'generando',
    });
  });

  it('ante error de red devuelve null', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('offline'));
    expect(await getContrato({ applicationCode: 'A', documentNumber: '7' })).toBeNull();
  });
});

describe('completeKycStep', () => {
  beforeEach(() => { global.fetch = jest.fn(); });

  it('manda el hash del contrato aceptado', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ is_complete: false }));

    await completeKycStep({
      applicationCode: 'APP-1', stepType: 'contract',
      documentNumber: '70020010', contractHash: 'b'.repeat(64),
    });

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.contract_hash).toBe('b'.repeat(64));
  });

  it('sin hash no manda el campo', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ is_complete: false }));

    await completeKycStep({ applicationCode: 'APP-1', stepType: 'dni_selfie', documentNumber: '7' });

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect('contract_hash' in body).toBe(false);
  });

  it('el 409 se distingue de un fallo', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      okJson({ detail: { reason: 'contract_outdated' } }, 409));

    const r = await completeKycStep({
      applicationCode: 'APP-1', stepType: 'contract', documentNumber: '7', contractHash: 'x',
    });

    expect(r).toEqual({ state: null, outdated: true });
  });

  it('un 500 no es outdated', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({}, 500));
    expect(await completeKycStep({ applicationCode: 'A', stepType: 'contract', documentNumber: '7' }))
      .toEqual({ state: null, outdated: false });
  });

  it('el estado vuelve envuelto', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ is_complete: true, steps: [] }));
    const r = await completeKycStep({ applicationCode: 'A', stepType: 'contract', documentNumber: '7' });
    expect(r.outdated).toBe(false);
    expect(r.state).toMatchObject({ is_complete: true });
  });
});
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npx jest src/app/prototipos/0.6/services/__tests__/kycApi.contrato.test.ts`
Expected: FAIL — `modo` no existe; `completeKycStep` devuelve el estado pelado.

- [ ] **Step 3: Implementar**

Reemplazar `ContratoEmitido` y `getContrato`:

```ts
/** De dónde sale el contrato y, por lo tanto, qué se le puede exigir al cliente. */
export type ContratoModo =
  /** La landing tiene la firma por aceptación: el contrato existe ANTES de
   *  aprobar y aceptarlo ES firmarlo. Sin documento no se puede continuar. */
  | 'aceptacion'
  /** El camino de siempre: el contrato lo emite la aprobación, que en el KYC
   *  corre al final. Su ausencia es normal y NO puede trabar el flujo. */
  | 'emitido';

export type ContratoEstado = 'generando' | 'listo' | 'error';

export interface ContratoKyc {
  modo: ContratoModo;
  estado: ContratoEstado;
  /** `estado === 'listo'`. Se mantiene por compatibilidad de lectura. */
  disponible: boolean;
  /** PDF (presignado en el camino `aceptacion`). */
  url?: string;
  /** Snapshot congelado; solo lo trae el camino `emitido`. */
  html?: string;
  /** sha256 del PDF. Es lo que viaja al aceptar, y solo existe en `aceptacion`. */
  hash?: string;
  external_id?: string;
  emitido_at?: string;
}

/**
 * Trae el contrato de la solicitud. Misma prueba de titularidad que el resto de
 * las lecturas sensibles: el DNI (flujo en sesión) o el token (flujo por link),
 * nunca las dos.
 *
 * `reintentar` fuerza a pedirle otro a legacy cuando el anterior falló.
 *
 * Fail-safe: `null` ante error de red o de permisos. El paso lo trata igual que
 * «todavía no hay contrato» — nunca cae a un documento genérico.
 */
export async function getContrato(args: {
  applicationCode: string;
  documentNumber?: string;
  resumeToken?: string;
  reintentar?: boolean;
}): Promise<ContratoKyc | null> {
  const params = new URLSearchParams({ application_code: args.applicationCode });
  if (args.resumeToken) params.set('resume_token', args.resumeToken);
  else if (args.documentNumber) params.set('document_number', args.documentNumber);
  if (args.reintentar) params.set('reintentar', '1');

  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/contrato?${params.toString()}`);
    if (!r.ok) return null;
    return adaptarContrato(await r.json());
  } catch {
    return null;
  }
}

/**
 * Tolera la respuesta del backend anterior a la firma por aceptación, que solo
 * traía `disponible` + `html`/`url`. Sin esto, un front nuevo contra un ws2 sin
 * desplegar dejaría el paso en un estado indefinido.
 */
function adaptarContrato(raw: Record<string, unknown>): ContratoKyc {
  const modo = raw.modo === 'aceptacion' ? 'aceptacion' : 'emitido';
  const estado: ContratoEstado =
    raw.estado === 'listo' || raw.estado === 'error' || raw.estado === 'generando'
      ? raw.estado
      : raw.disponible ? 'listo' : 'generando';

  return {
    modo,
    estado,
    disponible: estado === 'listo',
    url: (raw.url as string) || undefined,
    html: (raw.html as string) || undefined,
    hash: (raw.hash as string) || undefined,
    external_id: (raw.external_id as string) || undefined,
    emitido_at: (raw.emitido_at as string) || undefined,
  };
}
```

`completeKycStep`:

```ts
/** El resultado del avance: el estado nuevo, o que el contrato quedó viejo. */
export interface CompleteStepResult {
  state: KycProgressState | null;
  /** 409 `contract_outdated`: hay que recargar el contrato y aceptarlo de nuevo. */
  outdated: boolean;
}

/**
 * Marca un sub-paso completado. Requiere EXACTAMENTE una prueba: el DNI (flujo
 * en sesión) o el token (flujo por link). Si llegan las dos, se prioriza el
 * token y se omite el DNI — mandar ambas devuelve 422 `missing_proof`.
 *
 * `contractHash` solo aplica al sub-paso `contract` con firma por aceptación:
 * es lo que ata la aceptación al PDF que se mostró. Un 409 significa que el
 * contrato cambió mientras la persona lo leía.
 */
export async function completeKycStep(args: {
  applicationCode: string;
  stepType: string;
  documentNumber?: string;
  resumeToken?: string;
  contractHash?: string;
}): Promise<CompleteStepResult> {
  const body: Record<string, string> = {
    application_code: args.applicationCode,
    step_type: args.stepType,
  };
  if (args.resumeToken) body.resume_token = args.resumeToken;
  else if (args.documentNumber) body.document_number = args.documentNumber;
  if (args.contractHash) body.contract_hash = args.contractHash;

  try {
    const r = await fetch(`${API_BASE_URL}/public/kyc/progress/step-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (r.status === 409) return { state: null, outdated: true };
    if (!r.ok) return { state: null, outdated: false };
    return { state: (await r.json()) as KycProgressState, outdated: false };
  } catch {
    return { state: null, outdated: false };
  }
}
```

Y en `KycVeredicto`:

```ts
  /** Legacy además aplicó la firma (Airtable, firmado, hito). */
  firmado?: boolean;
  /** `contrato_vencido`: no se aprobó porque el contrato aceptado quedó viejo. */
  motivo?: 'contrato_vencido';
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `npx jest src/app/prototipos/0.6/services/__tests__/kycApi.contrato.test.ts src/app/prototipos/0.6/services/__tests__/kycApi.test.ts`
Expected: PASS los nuevos. Los viejos que llamen `completeKycStep` esperando el estado pelado van a fallar: **no** tocarlos todavía — se ajustan en la Task 5, junto con `kycClient`. Anotar cuáles.

- [ ] **Step 5: Commit**

```bash
git add src/app/prototipos/0.6/services/kycApi.ts src/app/prototipos/0.6/services/__tests__/kycApi.contrato.test.ts
git commit -m "feat(kyc): contrato de datos del paso de firma (modo, estado y hash)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Los eventos nuevos

**Files:**
- Modify: `src/app/prototipos/0.6/services/eventsApi.ts` (el union `EventType`, después de `'kyc_contract_signed'` ~L293)
- Test: `src/app/prototipos/0.6/services/__tests__/eventsApi.kycContrato.test.ts`

**Interfaces:**
- Produces: `'kyc_contract_generation_requested' | 'kyc_contract_ready' | 'kyc_contract_generation_failed' | 'kyc_contract_outdated' | 'kyc_contract_opened_external'` en `EventType`.

- [ ] **Step 1: Escribir el test que falla**

```ts
/// <reference types="jest" />
/**
 * Los tipos son un union de TypeScript, así que un tipo que no está no
 * compila. El test fija que estos cinco existan: el backend los descarta en
 * silencio si no están en su catálogo, y este es el lado que los emite.
 */
import type { EventType } from '../eventsApi';

it('los eventos del contrato del KYC son tipos válidos', () => {
  const tipos: EventType[] = [
    'kyc_contract_generation_requested',
    'kyc_contract_ready',
    'kyc_contract_generation_failed',
    'kyc_contract_outdated',
    'kyc_contract_opened_external',
  ];
  expect(tipos).toHaveLength(5);
});
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npx tsc --noEmit -p tsconfig.json` (o `npx jest src/app/prototipos/0.6/services/__tests__/eventsApi.kycContrato.test.ts`)
Expected: FAIL — los cinco no son asignables a `EventType`.

- [ ] **Step 3: Agregarlos al union**, después de `| 'kyc_contract_signed'`:

```ts
  // El contrato se emite en legacy al arrancar el KYC y el paso lo espera.
  // `reason`: missing (no se habia pedido) | outdated (era de otro dia) |
  // retry (el solicitante toco Reintentar).
  | 'kyc_contract_generation_requested'
  // Ya se puede leer. `wait_ms` es lo que espero, `external_id` cual es.
  | 'kyc_contract_ready'
  // Se agoto la espera o legacy no pudo emitirlo. `reason`: timeout | legacy_error.
  | 'kyc_contract_generation_failed'
  // Acepto (o cerro el KYC) sobre un PDF que ya no era el vigente: se regenera
  // y vuelve a aceptarlo. Distinto de `generation_requested` con
  // reason=outdated, que es la deteccion temprana al entrar al paso.
  | 'kyc_contract_outdated'
  // "Abrir en pestana nueva": en movil el visor embebido no siempre carga, y
  // este evento es lo unico que dice si esa salida se usa.
  | 'kyc_contract_opened_external'
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `npx jest src/app/prototipos/0.6/services/__tests__/eventsApi.kycContrato.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/prototipos/0.6/services/eventsApi.ts src/app/prototipos/0.6/services/__tests__/eventsApi.kycContrato.test.ts
git commit -m "feat(kyc): eventos de la generacion y la espera del contrato

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `useContratoKyc` — la espera, en un hook

**Files:**
- Create: `src/app/prototipos/0.6/[landing]/solicitar/kyc/useContratoKyc.ts`
- Test: `src/app/prototipos/0.6/[landing]/solicitar/kyc/__tests__/useContratoKyc.test.ts`

**Interfaces:**
- Consumes: `getContrato`, `ContratoKyc` (Task 1); `KycTrack` de `./useKycTracker`.
- Produces:

```ts
export const POLL_MS = 3000;
export const TOPE_MS = 90000;

export interface EstadoContratoKyc {
  contrato: ContratoKyc | null;
  /** `generando` incluye la primera carga. */
  estado: ContratoEstado | 'outdated';
  /** El documento se puede leer: hay html o url. */
  hayDocumento: boolean;
  /** `modo === 'aceptacion'`: sin documento no se puede continuar. */
  exigeAceptar: boolean;
  reintentar: () => void;
  /** Lo llama el paso cuando el backend dice 409: vuelve a pedir y marca `outdated`. */
  marcarVencido: () => void;
}

export function useContratoKyc(args: {
  applicationCode?: string;
  documentNumber?: string;
  resumeToken?: string;
  track: KycTrack;
}): EstadoContratoKyc;
```

- [ ] **Step 1: Escribir el test que falla**

```ts
/// <reference types="jest" />
/**
 * La espera del contrato: el PDF se emite en legacy y tarda unos segundos.
 *
 * Lo que se protege: que la espera termine (tope), que el reintento vuelva a
 * pedir, y que cada transición deje su evento — sin eso no hay forma de saber
 * cuánto espera la gente ni cuántas veces falla.
 */
import { renderHook, act, waitFor } from '@testing-library/react';

jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, getContrato: jest.fn() };
});

import { getContrato } from '@/app/prototipos/0.6/services/kycApi';
import { useContratoKyc, TOPE_MS } from '../useContratoKyc';

const mockGet = getContrato as jest.MockedFunction<typeof getContrato>;

const listo = {
  modo: 'aceptacion' as const, estado: 'listo' as const, disponible: true,
  url: 'https://s3/c.pdf', hash: 'a'.repeat(64), external_id: 'kyc-1',
};
const generando = { modo: 'aceptacion' as const, estado: 'generando' as const, disponible: false };

function montar(track = jest.fn()) {
  return renderHook(() =>
    useContratoKyc({ applicationCode: 'APP-1', documentNumber: '70020010', track }),
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});
afterEach(() => jest.useRealTimers());

it('cuando ya está listo lo entrega y avisa', async () => {
  const track = jest.fn();
  mockGet.mockResolvedValue(listo);

  const { result } = montar(track);

  await waitFor(() => expect(result.current.estado).toBe('listo'));
  expect(result.current.hayDocumento).toBe(true);
  expect(result.current.exigeAceptar).toBe(true);
  expect(track).toHaveBeenCalledWith('kyc_contract_ready', expect.objectContaining({ external_id: 'kyc-1' }));
});

it('reintenta mientras se está generando y entrega cuando llega', async () => {
  mockGet.mockResolvedValueOnce(generando).mockResolvedValue(listo);

  const { result } = montar();

  await waitFor(() => expect(result.current.estado).toBe('generando'));
  await act(async () => { jest.advanceTimersByTime(3000); });
  await waitFor(() => expect(result.current.estado).toBe('listo'));
  expect(mockGet).toHaveBeenCalledTimes(2);
});

it('se rinde en el tope y deja el evento', async () => {
  const track = jest.fn();
  mockGet.mockResolvedValue(generando);

  const { result } = montar(track);

  await act(async () => { jest.advanceTimersByTime(TOPE_MS + 3000); });

  await waitFor(() => expect(result.current.estado).toBe('error'));
  expect(track).toHaveBeenCalledWith('kyc_contract_generation_failed',
    expect.objectContaining({ reason: 'timeout' }));
});

it('un error del backend corta la espera', async () => {
  const track = jest.fn();
  mockGet.mockResolvedValue({ modo: 'aceptacion', estado: 'error', disponible: false });

  const { result } = montar(track);

  await waitFor(() => expect(result.current.estado).toBe('error'));
  expect(track).toHaveBeenCalledWith('kyc_contract_generation_failed',
    expect.objectContaining({ reason: 'legacy_error' }));
});

it('reintentar vuelve a pedir, forzando', async () => {
  const track = jest.fn();
  mockGet.mockResolvedValue({ modo: 'aceptacion', estado: 'error', disponible: false });
  const { result } = montar(track);
  await waitFor(() => expect(result.current.estado).toBe('error'));

  mockGet.mockResolvedValue(listo);
  await act(async () => { result.current.reintentar(); });

  await waitFor(() => expect(result.current.estado).toBe('listo'));
  expect(mockGet).toHaveBeenLastCalledWith(expect.objectContaining({ reintentar: true }));
  expect(track).toHaveBeenCalledWith('kyc_contract_generation_requested',
    expect.objectContaining({ reason: 'retry' }));
});

it('marcarVencido avisa y vuelve a pedir', async () => {
  const track = jest.fn();
  mockGet.mockResolvedValue(listo);
  const { result } = montar(track);
  await waitFor(() => expect(result.current.estado).toBe('listo'));

  mockGet.mockResolvedValue(generando);
  await act(async () => { result.current.marcarVencido(); });

  expect(track).toHaveBeenCalledWith('kyc_contract_outdated', expect.anything());
  await waitFor(() => expect(result.current.estado).toBe('outdated'));
});

it('con modo emitido no exige aceptar', async () => {
  mockGet.mockResolvedValue({ modo: 'emitido', estado: 'generando', disponible: false });

  const { result } = montar();

  await waitFor(() => expect(result.current.exigeAceptar).toBe(false));
});

it('sin applicationCode no pide nada', async () => {
  montar();
  expect(mockGet).not.toHaveBeenCalled();
});
```

> El último test necesita montar sin código: cambiar `montar` para aceptar overrides, o escribir un `renderHook` propio con `applicationCode: undefined`. Elegir uno y dejarlo consistente.

- [ ] **Step 2: Correr y ver que falla**

Run: `npx jest "src/app/prototipos/0.6/\[landing\]/solicitar/kyc/__tests__/useContratoKyc.test.ts"`
Expected: FAIL — el módulo no existe.

- [ ] **Step 3: Implementar el hook**

```ts
'use client';

/**
 * La espera del contrato del KYC.
 *
 * El PDF lo emite legacy —cronograma, plantilla, mPDF— y tarda unos segundos.
 * ws2 lo pide al arrancar el KYC, así que cuando la persona llega al paso casi
 * siempre está; cuando no, este hook espera, reintenta y sabe rendirse.
 *
 * Por qué un tope y no un polling infinito: si legacy no puede emitirlo (un
 * producto sin contrato vigente, la solicitud ya aprobada, mPDF caído) esperar
 * para siempre deja al solicitante mirando un skeleton. A los 90 s se muestra
 * el error con «Reintentar», que es una acción que sí puede tomar.
 *
 * `modo` viene del backend y decide qué puede exigir el paso: `aceptacion` es
 * el flujo nuevo (documento obligatorio), `emitido` es el de siempre (el
 * contrato nace con la aprobación y su ausencia no puede trabar nada).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getContrato,
  type ContratoEstado,
  type ContratoKyc,
} from '@/app/prototipos/0.6/services/kycApi';
import type { KycTrack } from './useKycTracker';

export const POLL_MS = 3000;
export const TOPE_MS = 90000;

export interface EstadoContratoKyc {
  contrato: ContratoKyc | null;
  estado: ContratoEstado | 'outdated';
  hayDocumento: boolean;
  exigeAceptar: boolean;
  reintentar: () => void;
  marcarVencido: () => void;
}

export function useContratoKyc({
  applicationCode, documentNumber, resumeToken, track,
}: {
  applicationCode?: string;
  documentNumber?: string;
  resumeToken?: string;
  track: KycTrack;
}): EstadoContratoKyc {
  const [contrato, setContrato] = useState<ContratoKyc | null>(null);
  const [estado, setEstado] = useState<ContratoEstado | 'outdated'>('generando');
  // Sube en cada reintento/vencimiento: es lo que relanza el efecto.
  const [intento, setIntento] = useState(0);
  const forzarRef = useRef(false);
  const desdeRef = useRef(0);

  useEffect(() => {
    if (!applicationCode) return;

    let cancelado = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const forzar = forzarRef.current;
    forzarRef.current = false;
    desdeRef.current = Date.now();

    const pedir = async () => {
      const r = await getContrato({
        applicationCode, documentNumber, resumeToken,
        // Solo el PRIMER pedido de esta tanda fuerza: los del polling no
        // tienen que volver a dispararle una generación a legacy.
        reintentar: forzar,
      });
      if (cancelado) return;

      setContrato(r);

      // `null` es error de red o de permisos: se trata como el error del
      // backend — esperar sin fin sería peor, y el documento nunca se
      // reemplaza por uno genérico.
      const actual: ContratoEstado = r?.estado ?? 'error';

      if (actual === 'listo') {
        setEstado('listo');
        track('kyc_contract_ready', {
          application_code: applicationCode,
          external_id: r?.external_id,
          wait_ms: Date.now() - desdeRef.current,
        });
        return;
      }

      if (actual === 'error') {
        setEstado('error');
        track('kyc_contract_generation_failed', {
          application_code: applicationCode, reason: 'legacy_error',
        });
        return;
      }

      if (Date.now() - desdeRef.current >= TOPE_MS) {
        setEstado('error');
        track('kyc_contract_generation_failed', {
          application_code: applicationCode, reason: 'timeout',
        });
        return;
      }

      setEstado((previo) => (previo === 'outdated' ? 'outdated' : 'generando'));
      timer = setTimeout(() => { void pedir(); }, POLL_MS);
    };

    void pedir();

    return () => {
      cancelado = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationCode, documentNumber, resumeToken, intento]);

  const reintentar = useCallback(() => {
    track('kyc_contract_generation_requested', {
      application_code: applicationCode, reason: 'retry',
    });
    forzarRef.current = true;
    setEstado('generando');
    setIntento((n) => n + 1);
  }, [applicationCode, track]);

  const marcarVencido = useCallback(() => {
    track('kyc_contract_outdated', { application_code: applicationCode });
    forzarRef.current = true;
    setContrato(null);
    setEstado('outdated');
    setIntento((n) => n + 1);
  }, [applicationCode, track]);

  const hayDocumento = !!(contrato?.html || contrato?.url) && contrato?.estado === 'listo';

  return {
    contrato,
    estado,
    hayDocumento,
    // Un `modo` que este cliente no conozca cae en "no exige": es el
    // comportamiento que nunca deja a nadie trabado.
    exigeAceptar: contrato?.modo === 'aceptacion',
    reintentar,
    marcarVencido,
  };
}
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `npx jest "src/app/prototipos/0.6/\[landing\]/solicitar/kyc/__tests__/useContratoKyc.test.ts"`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/kyc/useContratoKyc.ts" "src/app/prototipos/0.6/[landing]/solicitar/kyc/__tests__/useContratoKyc.test.ts"
git commit -m "feat(kyc): hook de espera del contrato con polling, tope y reintento

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: `ContratoStep` con los dos modos

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/kyc/steps/ContratoStep.tsx`
- Test: `…/steps/__tests__/ContratoStep.aceptacion.test.tsx` (crear)
- Test: `…/steps/__tests__/ContratoStep.contratoReal.test.tsx` (ajustar los mocks al tipo nuevo)

**Interfaces:**
- Consumes: `useContratoKyc` (Task 3).
- Produces: `ContratoStepProps.onDone` pasa a `(datos?: { contractHash?: string; externalId?: string }) => void`; el resto de props no cambia. `data-testid`: `contrato-documento`, `contrato-esperando`, `contrato-error`, `contrato-outdated`.

- [ ] **Step 1: Escribir el test que falla**

```tsx
/// <reference types="jest" />
/**
 * El paso de firma con la firma por aceptación prendida.
 *
 * La regla que fija este archivo: con `modo: aceptacion` NO se puede continuar
 * sin haber visto y aceptado el documento. Antes se podía —el contrato no
 * existía hasta después de aprobar—, y así se terminaba el KYC sin haber leído
 * el contrato.
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn(), flush: jest.fn() }),
}));

jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, getContrato: jest.fn() };
});

import { ContratoStep } from '../ContratoStep';
import { getContrato } from '@/app/prototipos/0.6/services/kycApi';

const mockGet = getContrato as jest.MockedFunction<typeof getContrato>;

const LISTO = {
  modo: 'aceptacion' as const, estado: 'listo' as const, disponible: true,
  url: 'https://s3/contrato.pdf', hash: 'a'.repeat(64), external_id: 'kyc-1',
};

const pintar = (props = {}) =>
  render(<ContratoStep onDone={jest.fn()} applicationCode="APP-77" documentNumber="70020010" {...props} />);

beforeEach(() => jest.clearAllMocks());

it('mientras se genera no ofrece aceptar ni deja continuar', async () => {
  mockGet.mockResolvedValue({ modo: 'aceptacion', estado: 'generando', disponible: false });

  pintar();

  await waitFor(() => expect(screen.getByTestId('contrato-esperando')).toBeInTheDocument());
  expect(screen.queryByText('He leído y acepto el contrato')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
});

it('con el documento listo pide aceptarlo antes de continuar', async () => {
  mockGet.mockResolvedValue(LISTO);
  const onDone = jest.fn();

  pintar({ onDone });

  await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
  const continuar = screen.getByRole('button', { name: 'Continuar' });
  expect(continuar).toBeDisabled();

  await userEvent.click(screen.getByLabelText('He leído y acepto el contrato'));

  expect(continuar).toBeEnabled();
  await userEvent.click(continuar);
  expect(onDone).toHaveBeenCalledWith({ contractHash: 'a'.repeat(64), externalId: 'kyc-1' });
});

it('el error ofrece reintentar', async () => {
  mockGet.mockResolvedValue({ modo: 'aceptacion', estado: 'error', disponible: false });

  pintar();

  await waitFor(() => expect(screen.getByTestId('contrato-error')).toBeInTheDocument());
  mockGet.mockResolvedValue(LISTO);
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

  await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
});

it('el link a pestaña nueva emite su evento', async () => {
  mockGet.mockResolvedValue(LISTO);
  const onTrack = jest.fn();

  pintar({ onTrack });

  await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
  await userEvent.click(screen.getByText('Abrir en pestaña nueva'));

  expect(onTrack).toHaveBeenCalledWith('kyc_contract_opened_external', expect.anything());
});

it('cuando el contrato queda viejo, avisa y desmarca la aceptación', async () => {
  mockGet.mockResolvedValue(LISTO);
  const ref = React.createRef<{ marcarVencido: () => void }>();

  render(
    <ContratoStep
      ref={ref}
      onDone={jest.fn()}
      applicationCode="APP-77"
      documentNumber="70020010"
    />,
  );

  await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
  await userEvent.click(screen.getByLabelText('He leído y acepto el contrato'));

  mockGet.mockResolvedValue({ modo: 'aceptacion', estado: 'generando', disponible: false });
  await act(async () => { ref.current!.marcarVencido(); });

  await waitFor(() => expect(screen.getByTestId('contrato-outdated')).toBeInTheDocument());
  expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
});
```

> El último test exige exponer `marcarVencido` con `useImperativeHandle`. Es la forma más simple de que `kycClient` reabra el paso ante un 409 sin subir todo el estado del contrato al orquestador. Si al implementarlo resulta más limpio pasar una prop `vencido: boolean` desde `kycClient`, cambiar el test a esa forma — lo que no se negocia es que el 409 desmarque el checkbox.

- [ ] **Step 2: Correr y ver que falla**

Run: `npx jest ContratoStep.aceptacion`
Expected: FAIL — el paso todavía usa el tipo viejo y no tiene esos testids.

- [ ] **Step 3: Implementar**

Cambios sobre el componente actual, conservando **intacta** la lógica de autorizaciones Family Farms (`AUTORIZACIONES_FAMILY_FARMS`, `autorizacionesAplicables`, `faltaAlgunaAutorizacion`, `handleAutorizacionChange`) y el evento `kyc_contract_signed`:

1. Borrar el `useEffect` de polling propio y los estados `contrato`/`cargando`; usar `useContratoKyc`.
2. `const { contrato, estado, hayDocumento, exigeAceptar, reintentar, marcarVencido } = useContratoKyc({ applicationCode, documentNumber, resumeToken, track });`
3. `useImperativeHandle(ref, () => ({ marcarVencido: () => { setAccepted('false'); marcarVencido(); } }))`, con el componente envuelto en `forwardRef`.
4. `const html = contrato?.html; const pdf = !html ? contrato?.url : undefined;` — igual que hoy, el snapshot gana sobre el PDF.
5. Render por estado:
   - `estado === 'generando' || estado === 'outdated'` sin documento → el bloque de espera. Con `outdated`, además, el banner:

```tsx
        <div
          data-testid="contrato-outdated"
          className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4 text-sm text-[#92400e]"
        >
          Tu contrato se actualizó. Revisalo de nuevo y volvé a aceptarlo.
        </div>
```

   - `estado === 'error'` →

```tsx
        <div
          data-testid="contrato-error"
          className="w-full rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-6 text-center"
        >
          <p className="text-sm font-semibold text-[#374151]">
            No pudimos preparar tu contrato
          </p>
          <p className="mt-1 text-xs text-[#6b7280]">
            Puede ser algo momentáneo. Intentalo de nuevo.
          </p>
          <button
            type="button"
            onClick={reintentar}
            className="mt-3 rounded-xl border border-[#4654CD] px-4 py-2 text-sm font-semibold text-[#4654CD] hover:bg-[#ECECFB] transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>
```

   - `listo` → el `div` del html o el `iframe` del pdf, como hoy, con `data-testid="contrato-documento"`. Al link «Abrir en pestaña nueva» agregarle
     `onClick={() => track('kyc_contract_opened_external', { application_code: applicationCode })}`.
6. El botón:

```tsx
        <button
          type="button"
          // Con firma por aceptación el documento es obligatorio: aceptarlo ES
          // firmarlo, así que sin leerlo no hay nada que firmar. En el camino
          // `emitido` el contrato nace con la aprobación —después de esta
          // pantalla— y bloquear el botón dejaría el KYC trabado.
          disabled={
            exigeAceptar
              ? !hayDocumento || accepted !== 'true' || faltaAlgunaAutorizacion
              : hayDocumento && (accepted !== 'true' || faltaAlgunaAutorizacion)
          }
          onClick={handleContinuar}
          className="flex-1 bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          Continuar
        </button>
```

7. `handleContinuar` pasa el hash:

```tsx
  const handleContinuar = () => {
    track('kyc_contract_signed', {
      application_code: applicationCode,
      contract_hash: contrato?.hash,
      external_id: contrato?.external_id,
      autorizaciones: autorizacionesAplicables
        .filter((a) => autorizaciones[a.id])
        .map((a) => a.id),
    });
    // El hash solo viaja en el camino de firma por aceptación: es lo que ata
    // esta aceptación al PDF que se mostró.
    onDone(exigeAceptar ? { contractHash: contrato?.hash, externalId: contrato?.external_id } : undefined);
  };
```

- [ ] **Step 4: Ajustar `ContratoStep.contratoReal.test.tsx`**

Los mocks `{ disponible: true, html: '…' }` pasan a `{ modo: 'emitido', estado: 'listo', disponible: true, html: '…' }` y `{ disponible: false }` a `{ modo: 'emitido', estado: 'generando', disponible: false }`. **Las aserciones no cambian**: ese archivo fija el camino de hoy y tiene que seguir pasando tal cual, incluido que sin documento el botón quede habilitado. Agregarle un caso explícito:

```tsx
  it('en modo emitido, sin documento, deja continuar', async () => {
    mockGetContrato.mockResolvedValue({ modo: 'emitido', estado: 'generando', disponible: false });

    render(<ContratoStep onDone={jest.fn()} applicationCode="APP-77" documentNumber="70020010" />);

    await waitFor(() => expect(screen.getByTestId('contrato-esperando')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  });
```

- [ ] **Step 5: Correr los tres archivos del paso**

Run: `npx jest ContratoStep`
Expected: PASS (`aceptacion`, `contratoReal`, `autorizaciones`, `tracking`).

- [ ] **Step 6: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/kyc/steps/ContratoStep.tsx" "src/app/prototipos/0.6/[landing]/solicitar/kyc/steps/__tests__/"
git commit -m "feat(kyc): el paso de firma exige el contrato cuando la landing firma por aceptacion

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: `kycClient` — el avance espera, y el cierre sabe volver

**Files:**
- Modify: `src/app/prototipos/0.6/[landing]/solicitar/kyc/kycClient.tsx` (`renderStep`, `goNext`, `cerrarKyc`)
- Test: `…/kyc/__tests__/kycClient.contrato.test.tsx` (crear)
- Test: `…/kyc/__tests__/kycClient.cierre.test.tsx`, `kycClient.progress.test.tsx` (ajustar al tipo nuevo de `completeKycStep`)

**Interfaces:**
- Consumes: `completeKycStep` → `{state, outdated}` (Task 1); `ContratoStep` con `onDone(datos)` y el ref con `marcarVencido` (Task 4); `completarKyc` con `motivo` (Task 1).

- [ ] **Step 1: Escribir el test que falla**

```tsx
/// <reference types="jest" />
/**
 * El orquestador frente a un contrato que quedó viejo.
 *
 * Dos caminos llevan al mismo lugar —volver al paso del contrato—: el 409 al
 * marcar el sub-paso, y el `contrato_vencido` al cerrar el KYC. Sin esto, el
 * primero avanzaría igual (el avance era fire-and-forget) y el segundo mandaría
 * a confirmación una solicitud que no se aprobó.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return {
    ...actual,
    getKycProgress: jest.fn(),
    completeKycStep: jest.fn(),
    completarKyc: jest.fn(),
    getContrato: jest.fn(),
  };
});

// … los mismos mocks de navegación, layout y chrome que kycClient.cierre.test.tsx …

import KycClient from '../kycClient';
import { completeKycStep, completarKyc, getContrato, getKycProgress } from '@/app/prototipos/0.6/services/kycApi';

const mockComplete = completeKycStep as jest.MockedFunction<typeof completeKycStep>;
const mockCompletar = completarKyc as jest.MockedFunction<typeof completarKyc>;
const mockContrato = getContrato as jest.MockedFunction<typeof getContrato>;
const mockProgress = getKycProgress as jest.MockedFunction<typeof getKycProgress>;

const LISTO = {
  modo: 'aceptacion' as const, estado: 'listo' as const, disponible: true,
  url: 'https://s3/c.pdf', hash: 'a'.repeat(64), external_id: 'kyc-1',
};

const ESTADO = {
  application_code: 'APP-1', landing_slug: 'copia-home',
  steps: [{ type: 'contract', status: 'pending', completed_at: null }],
  next_step: 'contract', next_step_index: 0, is_complete: false,
  kyc_enabled: true, resume: { enabled: false, ttl_hours: 72 },
};

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
  mockProgress.mockResolvedValue(ESTADO as never);
  mockContrato.mockResolvedValue(LISTO);
});

async function aceptarYContinuar() {
  render(<KycClient />);
  await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
  await userEvent.click(screen.getByLabelText('He leído y acepto el contrato'));
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
}

it('manda el hash del contrato aceptado', async () => {
  mockComplete.mockResolvedValue({ state: { ...ESTADO, is_complete: true } as never, outdated: false });
  mockCompletar.mockResolvedValue({ aprobado: true, tiene_cuota_inicial: false, link_pago: null });

  await aceptarYContinuar();

  await waitFor(() => expect(mockComplete).toHaveBeenCalledWith(
    expect.objectContaining({ stepType: 'contract', contractHash: 'a'.repeat(64) })));
});

it('un 409 no avanza: vuelve a mostrar el contrato', async () => {
  mockComplete.mockResolvedValue({ state: null, outdated: true });

  await aceptarYContinuar();

  await waitFor(() => expect(screen.getByTestId('contrato-outdated')).toBeInTheDocument());
  expect(mockCompletar).not.toHaveBeenCalled();
});

it('contrato_vencido al cerrar vuelve al paso del contrato', async () => {
  mockComplete.mockResolvedValue({ state: { ...ESTADO, is_complete: true } as never, outdated: false });
  mockCompletar.mockResolvedValue({
    aprobado: false, tiene_cuota_inicial: false, link_pago: null, motivo: 'contrato_vencido',
  });

  await aceptarYContinuar();

  await waitFor(() => expect(screen.getByTestId('contrato-outdated')).toBeInTheDocument());
});
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npx jest kycClient.contrato`
Expected: FAIL — `completeKycStep` se llama sin hash y el avance no espera.

- [ ] **Step 3: Implementar en `kycClient.tsx`**

3a. Un ref al paso del contrato y el estado del vencimiento:

```tsx
  // El paso del contrato expone `marcarVencido`: es lo que se llama cuando el
  // backend dice que lo aceptado ya no es el contrato vigente (409 al avanzar,
  // o `contrato_vencido` al cerrar). Vive acá porque las dos noticias llegan
  // al orquestador, no al paso.
  const contratoRef = useRef<{ marcarVencido: () => void } | null>(null);
```

y en `renderStep`, `case 'contract':` agregar `ref={contratoRef}` (por eso `ContratoStep` es `forwardRef`).

3b. `goNext` con dos caminos. El de siempre para los demás pasos —fire-and-forget, sin tocar— y uno que espera para `contract`:

```tsx
  const goNext = (datos?: { contractHash?: string; externalId?: string }) => {
    track('kyc_step_complete', {
      step: currentStep.type, index: safeIndex, application_code: code,
    });

    // El paso del contrato es el único que espera la respuesta: un 409
    // (`contract_outdated`) NO puede avanzar, porque lo que la persona aceptó
    // ya no es el contrato vigente. El resto sigue siendo fire-and-forget: ahí
    // un fallo se reconcilia en el próximo montaje y no hay nada que invalidar.
    if (code && currentStep.type === 'contract' && datos?.contractHash) {
      const proofDni = resumeToken ? undefined : effectiveDni;
      void completeKycStep({
        applicationCode: code, stepType: 'contract',
        resumeToken, documentNumber: proofDni,
        contractHash: datos.contractHash,
      }).then(({ state, outdated }) => {
        if (outdated) {
          contratoRef.current?.marcarVencido();
          return;
        }
        if (state?.link_pago) setLinkPago(state.link_pago);
        avanzar();
      });
      return;
    }

    // … el bloque actual de persistencia fire-and-forget, adaptado a
    //    `.then(({ state }) => …)` porque `completeKycStep` ahora envuelve …

    avanzar();
  };
```

3c. Extraer el final actual de `goNext` (el `if (safeIndex + 1 < pasos.length) {…}` más el cierre) a `avanzar()`, sin cambiarle nada:

```tsx
  /** Lo que pasa cuando el sub-paso quedó cerrado: siguiente, o cierre del KYC. */
  const avanzar = () => {
    if (safeIndex + 1 < pasos.length) {
      const next = safeIndex + 1;
      setIndex(next);
      writeKycStep(landing, code, next);
      return;
    }

    if (pasoPagoConfigurado && !linkPago) {
      void cerrarKyc();
      return;
    }

    track('kyc_completed', { application_code: code });
    clearKycStep(landing, code);
    goToConfirmacion(true);
  };
```

3d. En `cerrarKyc`, antes de degradar a confirmación:

```tsx
    // El contrato aceptado quedó viejo: legacy NO aprobó. Se vuelve al paso
    // para que la persona lea el nuevo y lo acepte; ws2 ya lo regeneró y
    // reabrió el sub-paso.
    if (veredicto?.motivo === 'contrato_vencido') {
      const indiceContrato = pasos.findIndex((s) => s.type === 'contract');
      if (indiceContrato >= 0) {
        setIndex(indiceContrato);
        writeKycStep(landing, code, indiceContrato);
      }
      contratoRef.current?.marcarVencido();
      cerrandoRef.current = false;
      setCerrando(false);
      return;
    }
```

3e. En `renderStep`, `case 'contract':` pasar `onDone={onDone}` tal cual: la firma de `onDone` ahora acepta el objeto y los otros pasos la siguen llamando sin argumentos.

- [ ] **Step 4: Ajustar los tests existentes de `kycClient`**

En `kycClient.cierre.test.tsx` y `kycClient.progress.test.tsx`, los `mockCompleteKycStep.mockResolvedValue(<estado>)` pasan a `mockResolvedValue({ state: <estado>, outdated: false })`, y los `getContrato` mockeados a `{ modo: 'emitido', estado: 'generando', disponible: false }` (que es lo que esos tests asumen: sin documento, el botón habilitado). Ninguna aserción cambia.

- [ ] **Step 5: Correr toda la carpeta del KYC**

Run: `npx jest src/app/prototipos/0.6`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add "src/app/prototipos/0.6/[landing]/solicitar/kyc/kycClient.tsx" "src/app/prototipos/0.6/[landing]/solicitar/kyc/__tests__/"
git commit -m "feat(kyc): el avance del contrato espera al backend y vuelve al paso si quedo viejo

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Build, suite y PR

- [ ] **Step 1: Suite y build**

Run: `npm test && npm run build`
Expected: PASS (o los mismos fallos preexistentes que `origin/main`; comparar si hay dudas).

- [ ] **Step 2: Push y PR**

```bash
git push -u origin feat/kyc-contrato-antes-de-aprobar
gh pr create --base main --title "feat(kyc): el contrato se lee y se acepta antes de cerrar el KYC" --body "Spec: ws2 docs/superpowers/specs/2026-09-03-kyc-contrato-antes-de-aprobar-firma-por-aceptacion-design.md (§3)

Requiere ws2 desplegado (devuelve \`modo\` en /public/kyc/contrato). Con \`modo: emitido\` —o sea con el toggle de la landing apagado, que es el estado de todas hoy— el paso se comporta exactamente como antes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

---

## Self-review

**Cobertura del spec §3:** 3.1 (`ContratoStep`) → T3+T4; 3.2 (`kycApi`) → T1; 3.3 (`kycClient`) → T5; 3.4 (`eventsApi`) → T2. Los cinco eventos del spec se emiten: `generation_requested` (T3, en `reintentar`), `ready` y `generation_failed` (T3), `outdated` (T3, `marcarVencido`), `opened_external` (T4).

**Tipos consistentes:** `ContratoKyc`/`ContratoModo`/`ContratoEstado` (T1) usados en T3 y T4; `CompleteStepResult` (T1) en T5; `onDone(datos)` (T4) consumido por `goNext` (T5); `marcarVencido` expuesto en T4 y llamado en T5 por los dos caminos.

**Deuda anotada, no escondida:** el `useImperativeHandle` de T4 es la parte menos bonita del plan; el test dice explícitamente qué es negociable (la forma) y qué no (que el 409 desmarque la aceptación).
