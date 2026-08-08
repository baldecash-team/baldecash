/// <reference types="jest" />
/**
 * ResumeClient — ruta `/kyc/[token]` ("Continuar después").
 *
 * Cubre las 6 ramas de la tabla del brief: link válido (monta KycClient),
 * `is_complete:true` (redirige), `kyc_enabled:false` (redirige),
 * expired/revoked/consumed/inactive (pantalla de vencido + evento), invalid/
 * purpose_mismatch (MISMO copy — no revela si la solicitud existe) y
 * `reason:'network'` (pantalla de reintento).
 *
 * `KycClient` real depende de `useLayout()`/`usePreview()`/`useSolicitarFlow()`,
 * que solo existen como ancestros dentro de `[landing]/**` — esta ruta es un
 * segmento estático hermano de `[landing]`, no un hijo, así que no los hereda
 * (por diseño: ver el comentario grande en ResumeClient.tsx). Se mockea el
 * módulo completo de `kycClient` (su comportamiento interno ya está cubierto
 * en `kycClient.progress.test.tsx`, Tasks 3/4): este archivo solo verifica
 * que `ResumeClient` lo monta con los props correctos. `LayoutProvider`
 * también se mockea a un passthrough por el mismo motivo (evita depender de
 * `PreviewProvider`, que en producción sí es ancestro vía
 * `prototipos/0.6/layout.tsx`, pero no en un render aislado de RTL).
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// jest.spyOn sobre imports de módulo NO funciona en este repo (Next 16/SWC
// compila los exports como propiedades no configurables) — se mockea el
// módulo completo, parcial sobre el real vía requireActual + spread, mismo
// patrón que Tasks 1-4 (ver nota en progress.md).
jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, resumeKyc: jest.fn() };
});

const mockTrack = jest.fn();
const mockTrackKyc = jest.fn();
jest.mock('../resumeEvents', () => ({
  resumeEvents: () => ({ track: mockTrack, trackKyc: mockTrackKyc }),
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/kyc/kycClient', () => ({
  __esModule: true,
  // El botón simula al orquestador avanzando un sub-paso: emite por el `onTrack`
  // que reciba. Si ResumeClient no lo pasa, el evento se pierde (que es
  // exactamente lo que pasaba antes del fix).
  default: (props: {
    resumeToken?: string;
    initialState?: { application_code: string };
    onTrack?: (type: string, p?: Record<string, unknown>) => void;
  }) => (
    <div
      data-testid="kyc-client"
      data-resume-token={props.resumeToken}
      data-application-code={props.initialState?.application_code}
      data-has-on-track={props.onTrack ? '1' : '0'}
    >
      <button
        type="button"
        onClick={() => props.onTrack?.('kyc_step_complete', {
          step: 'contract',
          application_code: props.initialState?.application_code,
        })}
      >
        avanzar
      </button>
    </div>
  ),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  LayoutProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/app/prototipos/_shared', () => ({
  CubeGridSpinner: () => <div data-testid="spinner" />,
}));

import { ResumeClient } from '../ResumeClient';
import { resumeKyc } from '@/app/prototipos/0.6/services/kycApi';

const mockResumeKyc = resumeKyc as jest.MockedFunction<typeof resumeKyc>;

afterEach(() => jest.clearAllMocks());

const validState = {
  application_code: 'APP-1',
  landing_slug: 'copia-home',
  steps: [],
  next_step: 'contract',
  next_step_index: 1,
  is_complete: false,
  kyc_enabled: true,
  resume: { enabled: true, ttl_hours: 72 },
  expires_at: '2026-08-03T00:00:00',
};

it('link valido: monta el KYC en el sub-paso pendiente', async () => {
  mockResumeKyc.mockResolvedValue(validState as never);

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(screen.getByTestId('kyc-client')).toBeInTheDocument());
  expect(screen.queryByText(/enlace venció/i)).not.toBeInTheDocument();

  const el = screen.getByTestId('kyc-client');
  expect(el.dataset.resumeToken).toBe('TOK');
  expect(el.dataset.applicationCode).toBe('APP-1');

  // kyc_resume_link_opened + kyc_resumed, ambos con application_code.
  expect(mockTrack).toHaveBeenCalledWith('kyc_resume_link_opened', { application_code: 'APP-1' });
  expect(mockTrack).toHaveBeenCalledWith('kyc_resumed', { application_code: 'APP-1' });
  expect(mockReplace).not.toHaveBeenCalled();
});

it('KYC ya completo: redirige a confirmacion', async () => {
  mockResumeKyc.mockResolvedValue({
    ...validState,
    next_step: null,
    next_step_index: null,
    is_complete: true,
  } as never);

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(mockReplace).toHaveBeenCalled());
  const url = mockReplace.mock.calls[0][0] as string;
  expect(url).toContain('/copia-home/solicitar/confirmacion');
  expect(url).toContain('code=APP-1');
  // Ya completo: no hay nada que retomar, no se monta KycClient.
  expect(screen.queryByTestId('kyc-client')).not.toBeInTheDocument();
});

it('kyc_enabled:false: redirige a confirmacion (la landing apagó el KYC)', async () => {
  mockResumeKyc.mockResolvedValue({ ...validState, kyc_enabled: false } as never);

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(mockReplace).toHaveBeenCalled());
  const url = mockReplace.mock.calls[0][0] as string;
  expect(url).toContain('/copia-home/solicitar/confirmacion');
});

it('link vencido: pantalla "enlace venció" + evento kyc_resume_link_expired', async () => {
  mockResumeKyc.mockResolvedValue({ reason: 'expired', error: 'Este enlace expiró.' } as never);

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(screen.getByText(/enlace venció/i)).toBeInTheDocument());
  expect(mockTrack).toHaveBeenCalledWith('kyc_resume_link_expired', { reason: 'expired' });
});

it.each(['revoked', 'consumed', 'inactive'])(
  'link con reason=%s: mismo trato que expired',
  async (reason) => {
    mockResumeKyc.mockResolvedValue({ reason, error: 'x' } as never);

    render(<ResumeClient token="TOK" />);

    await waitFor(() => expect(screen.getByText(/enlace venció/i)).toBeInTheDocument());
    expect(mockTrack).toHaveBeenCalledWith('kyc_resume_link_expired', { reason });
  },
);

it('link invalido: no revela si la solicitud existe', async () => {
  mockResumeKyc.mockResolvedValue({ reason: 'invalid', error: 'Enlace inválido.' } as never);

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(screen.getByText(/enlace no es válido/i)).toBeInTheDocument());
  // No se emite kyc_resume_link_expired (no es un enlace "vencido") ni ningún
  // evento con reason: el copy no debe dar pistas de qué pasó.
  expect(mockTrack).not.toHaveBeenCalled();
});

it('link con purpose_mismatch: EXACTAMENTE el mismo copy que invalid', async () => {
  mockResumeKyc.mockResolvedValue({ reason: 'purpose_mismatch', error: 'x' } as never);

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(screen.getByText(/enlace no es válido/i)).toBeInTheDocument());
});

it('error de red: pantalla de reintento (no confunde con "invalido")', async () => {
  mockResumeKyc.mockResolvedValue({
    reason: 'network',
    error: 'Error de conexión. Intenta nuevamente.',
  } as never);

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(screen.getByText(/no pudimos conectar/i)).toBeInTheDocument());
  expect(screen.queryByText(/enlace no es válido/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/enlace venció/i)).not.toBeInTheDocument();
});

// Fix final I-1 — la ruta tokenizada montaba KycClient SIN provider de eventos:
// de los ~18 eventos kyc_* solo salían los 3 de resumeEvents, así que era
// imposible medir si quien retoma por el link termina el KYC. Ahora se le
// inyecta el sink del token.
it('inyecta el sink del token: avanzar un sub-paso emite kyc_step_complete con application_code', async () => {
  mockResumeKyc.mockResolvedValue(validState as never);

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(screen.getByTestId('kyc-client')).toBeInTheDocument());
  expect(screen.getByTestId('kyc-client').dataset.hasOnTrack).toBe('1');

  await userEvent.setup().click(screen.getByRole('button', { name: 'avanzar' }));

  expect(mockTrackKyc).toHaveBeenCalledWith(
    'kyc_step_complete',
    expect.objectContaining({ application_code: 'APP-1', step: 'contract' }),
  );
});

// Fix final I-2 — con `landing_slug: null` el fallback a 'home' aterrizaba al
// cliente en la confirmación de OTRA landing. Sin slug no hay a dónde llevarlo:
// se trata como enlace no válido.
it('landing_slug null: pantalla "no es válido", sin adivinar landing ni redirigir', async () => {
  mockResumeKyc.mockResolvedValue({ ...validState, landing_slug: null } as never);

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(screen.getByText(/enlace no es válido/i)).toBeInTheDocument());
  expect(mockReplace).not.toHaveBeenCalled();
  expect(screen.queryByTestId('kyc-client')).not.toBeInTheDocument();
});

it('landing_slug null + is_complete: tampoco redirige a la confirmación de otra landing', async () => {
  mockResumeKyc.mockResolvedValue({
    ...validState, landing_slug: null, is_complete: true,
  } as never);

  render(<ResumeClient token="TOK" />);

  await waitFor(() => expect(screen.getByText(/enlace no es válido/i)).toBeInTheDocument());
  expect(mockReplace).not.toHaveBeenCalled();
});

it('muestra un spinner mientras canjea el token', () => {
  mockResumeKyc.mockReturnValue(new Promise(() => {})); // nunca resuelve

  render(<ResumeClient token="TOK" />);

  expect(screen.getByTestId('spinner')).toBeInTheDocument();
});

/**
 * El acceso a la landing viaja con el link.
 *
 * El gate del DNI lee `baldecash-vip-token-{slug}` de este navegador, y el link
 * se abre justamente desde otro: sin guardar el token que `resume` devuelve, la
 * persona cae en el gate a probar lo que el token ya probó.
 */
describe('acceso a la landing desde el link', () => {
  beforeEach(() => localStorage.clear());

  it('guarda el token bajo la clave que el gate lee', async () => {
    mockResumeKyc.mockResolvedValue({
      ...validState, landing_access_token: 'vip-abc-123',
    } as never);

    render(<ResumeClient token="TOK" />);

    await waitFor(() => expect(screen.getByTestId('kyc-client')).toBeInTheDocument());
    expect(localStorage.getItem('baldecash-vip-token-copia-home')).toBe('vip-abc-123');
  });

  it('lo guarda tambien cuando redirige a confirmacion: esa vista vive dentro del gate', async () => {
    mockResumeKyc.mockResolvedValue({
      ...validState, is_complete: true, landing_access_token: 'vip-abc-123',
    } as never);

    render(<ResumeClient token="TOK" />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    expect(localStorage.getItem('baldecash-vip-token-copia-home')).toBe('vip-abc-123');
  });

  it('sin token no guarda nada: la landing no tiene gate', async () => {
    mockResumeKyc.mockResolvedValue(validState as never);

    render(<ResumeClient token="TOK" />);

    await waitFor(() => expect(screen.getByTestId('kyc-client')).toBeInTheDocument());
    expect(localStorage.getItem('baldecash-vip-token-copia-home')).toBeNull();
  });
});
