/// <reference types="jest" />
/**
 * EntregaConChrome — quién decide el layout de `/entrega/[token]`.
 *
 * Cubre las tres fuentes de la landing, en orden de prioridad:
 * 1. `landing_slug` del canje del token (todavía no lo manda el backend en
 *    producción, pero el componente ya sabe usarlo).
 * 2. El primer segmento de `volver`.
 * 3. Ninguna de las dos → `EntregaLayout`, el layout standalone de siempre
 *    (el camino del enlace de WhatsApp, sin `volver`).
 *
 * Se mockean `LayoutProvider`, `KycChrome`, `EntregaLayout` y
 * `EntregaTokenClient` a passthroughs marcados con `data-testid`: este
 * archivo solo verifica CUÁL de los tres layouts se monta y con qué landing,
 * no el comportamiento interno de cada uno (ya cubierto en sus propios
 * tests). Mismo patrón que `ResumeClient.test.tsx`.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/services/entregaApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/entregaApi');
  return { ...actual, getEntrega: jest.fn() };
});

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  LayoutProvider: ({ children, landingOverride }: { children: React.ReactNode; landingOverride?: string }) => (
    <div data-testid="layout-provider" data-landing-override={landingOverride}>{children}</div>
  ),
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/kyc/KycChrome', () => ({
  KycChrome: ({ children, landing }: { children: React.ReactNode; landing?: string }) => (
    <div data-testid="kyc-chrome" data-landing={landing}>{children}</div>
  ),
}));

jest.mock('../../components/EntregaLayout', () => ({
  EntregaLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="entrega-layout">{children}</div>
  ),
}));

jest.mock('../../components/EntregaTokenClient', () => ({
  EntregaTokenClient: ({ token, volver }: { token: string; volver?: string }) => (
    <div data-testid="entrega-token-client" data-token={token} data-volver={volver} />
  ),
}));

jest.mock('@/app/prototipos/_shared', () => ({
  CubeGridSpinner: () => <div data-testid="spinner" />,
}));

import { EntregaConChrome } from '../../components/EntregaConChrome';
import { getEntrega } from '@/app/prototipos/0.6/services/entregaApi';

const mockGetEntrega = getEntrega as jest.MockedFunction<typeof getEntrega>;

afterEach(() => jest.clearAllMocks());

it('con volver de landing válida: monta el chrome con esa landing DE UNA, sin esperar al canje', async () => {
  render(<EntregaConChrome token="TOK" volver="/renueva-tu-equipo-1-a/solicitar" />);

  // Nunca se ve el standalone ni el spinner: el slug ya se conoce en el
  // primer render, así que no hay nada que esperar.
  expect(screen.queryByTestId('entrega-layout')).not.toBeInTheDocument();
  expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();

  const provider = screen.getByTestId('layout-provider');
  expect(provider.dataset.landingOverride).toBe('renueva-tu-equipo-1-a');
  const chrome = screen.getByTestId('kyc-chrome');
  expect(chrome.dataset.landing).toBe('renueva-tu-equipo-1-a');

  const client = screen.getByTestId('entrega-token-client');
  expect(client.dataset.token).toBe('TOK');
  expect(client.dataset.volver).toBe('/renueva-tu-equipo-1-a/solicitar');

  // El slug ya vino de `volver`: no hace falta canjear el token para decidir
  // el layout (lo canjea `EntregaTokenClient`, mockeado acá).
  expect(mockGetEntrega).not.toHaveBeenCalled();
});

it('landing_slug del canje: gana cuando no hay volver, tras un spinner neutro', async () => {
  mockGetEntrega.mockResolvedValue({
    application_code: 'SOL-1',
    landing_slug: 'convenio-ucv-landing',
    fecha_entrega: null,
    equipo: {},
    direccion: {},
    titular: {},
  } as never);

  render(<EntregaConChrome token="TOK" />);

  // Mientras se resuelve el canje: fondo neutro, no el panel de marca.
  expect(screen.getByTestId('spinner')).toBeInTheDocument();
  expect(screen.queryByTestId('entrega-layout')).not.toBeInTheDocument();

  await waitFor(() => expect(screen.getByTestId('kyc-chrome')).toBeInTheDocument());

  expect(screen.getByTestId('layout-provider').dataset.landingOverride).toBe('convenio-ucv-landing');
  expect(screen.getByTestId('kyc-chrome').dataset.landing).toBe('convenio-ucv-landing');
  expect(screen.queryByTestId('entrega-layout')).not.toBeInTheDocument();
});

it('sin volver ni landing_slug: EntregaLayout, como hoy (enlace de WhatsApp)', async () => {
  mockGetEntrega.mockResolvedValue({
    application_code: 'SOL-1',
    fecha_entrega: null,
    equipo: {},
    direccion: {},
    titular: {},
  } as never);

  render(<EntregaConChrome token="TOK" />);

  expect(screen.getByTestId('spinner')).toBeInTheDocument();

  await waitFor(() => expect(screen.getByTestId('entrega-layout')).toBeInTheDocument());

  expect(screen.queryByTestId('kyc-chrome')).not.toBeInTheDocument();
  expect(screen.queryByTestId('layout-provider')).not.toBeInTheDocument();
  const client = screen.getByTestId('entrega-token-client');
  expect(client.dataset.token).toBe('TOK');
});
