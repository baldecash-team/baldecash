/// <reference types="jest" />
/**
 * EntregaConChrome — quién decide el layout de `/entrega/[token]`.
 *
 * Cubre las tres fuentes de la landing, en orden de prioridad:
 * 1. `landing_slug` del canje del token (en producción desde ws2#1764).
 * 2. El primer segmento de `volver`.
 * 3. Ninguna de las dos → `EntregaLayout`, el layout standalone de siempre
 *    (el camino del enlace de WhatsApp, sin `volver`).
 *
 * Y el fix del CRITICAL de la ronda de revisión 1: `volver` sale de
 * `routes.*`, que antepone `BASE_PATH` — sin despojarlo, el primer segmento
 * era literalmente "prototipos" (landing inexistente, 404 para TODO el que
 * llega desde el wizard). El fixture de la primera prueba usa
 * `routes.solicitarConfirmacion` de verdad, no un literal sin prefijo, para
 * que un regreso de ese bug rompa el test.
 *
 * Se mockean `LayoutProvider`, `KycChrome`, `EntregaLayout` y
 * `EntregaTokenClient` a passthroughs marcados con `data-testid`: este
 * archivo solo verifica CUÁL de los tres layouts se monta y con qué landing
 * (y, desde el IMPORTANT 3, cuántas veces se canjea el token), no el
 * comportamiento interno de cada uno (ya cubierto en sus propios tests).
 * Mismo patrón que `ResumeClient.test.tsx`.
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
  EntregaTokenClient: ({ token, volver, initialData }: {
    token: string; volver?: string; initialData?: unknown;
  }) => (
    <div
      data-testid="entrega-token-client"
      data-token={token}
      data-volver={volver}
      data-initial-data={initialData !== undefined ? JSON.stringify(initialData) : undefined}
    />
  ),
}));

jest.mock('@/app/prototipos/_shared', () => ({
  CubeGridSpinner: () => <div data-testid="spinner" />,
}));

import { EntregaConChrome, slugDesdeVolver } from '../../components/EntregaConChrome';
import { getEntrega } from '@/app/prototipos/0.6/services/entregaApi';
import { routes, BASE_PATH } from '@/app/prototipos/0.6/utils/routes';

const mockGetEntrega = getEntrega as jest.MockedFunction<typeof getEntrega>;

afterEach(() => jest.clearAllMocks());

it('con volver de landing válida (armado con routes.*, no un literal): monta el chrome DE UNA, sin canjear', async () => {
  // `routes.solicitarConfirmacion` es EXACTAMENTE lo que arma `ContratoEnWizard`/
  // `kycClient.tsx` para `volver` — con `BASE_PATH` antepuesto (`/prototipos/0.6`
  // por default en este entorno de test, igual que dev sin rewrites).
  const volver = routes.solicitarConfirmacion('renueva-tu-equipo-1-a', 'APP-1');
  expect(volver.startsWith(BASE_PATH)).toBe(true); // sanity: el fixture SÍ trae el prefijo

  render(<EntregaConChrome token="TOK" volver={volver} />);

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
  expect(client.dataset.volver).toBe(volver);
  // Sin canje acá: `EntregaTokenClient` (mockeado) hace el suyo — sin
  // `initialData`, cero cambio de comportamiento en este camino.
  expect(client.dataset.initialData).toBeUndefined();

  // El slug ya vino de `volver`: no hace falta canjear el token para decidir
  // el layout.
  expect(mockGetEntrega).not.toHaveBeenCalled();
});

it('landing_slug del canje: gana cuando no hay volver, con UNA sola llamada a getEntrega', async () => {
  const datos = {
    application_code: 'SOL-1',
    landing_slug: 'convenio-ucv-landing',
    fecha_entrega: null,
    equipo: {},
    direccion: {},
    titular: {},
  };
  mockGetEntrega.mockResolvedValue(datos as never);

  render(<EntregaConChrome token="TOK" />);

  // Mientras se resuelve el canje: fondo neutro, no el panel de marca.
  expect(screen.getByTestId('spinner')).toBeInTheDocument();
  expect(screen.queryByTestId('entrega-layout')).not.toBeInTheDocument();

  await waitFor(() => expect(screen.getByTestId('kyc-chrome')).toBeInTheDocument());

  expect(screen.getByTestId('layout-provider').dataset.landingOverride).toBe('convenio-ucv-landing');
  expect(screen.getByTestId('kyc-chrome').dataset.landing).toBe('convenio-ucv-landing');
  expect(screen.queryByTestId('entrega-layout')).not.toBeInTheDocument();

  // IMPORTANT 3: una sola llamada, y `EntregaTokenClient` recibe ESE mismo
  // resultado como `initialData` — no repite el GET.
  expect(mockGetEntrega).toHaveBeenCalledTimes(1);
  const client = screen.getByTestId('entrega-token-client');
  expect(JSON.parse(client.dataset.initialData!)).toEqual(datos);
});

it('sin volver ni landing_slug: EntregaLayout, como hoy (enlace de WhatsApp), con UNA sola llamada', async () => {
  const datos = {
    application_code: 'SOL-1',
    fecha_entrega: null,
    equipo: {},
    direccion: {},
    titular: {},
  };
  mockGetEntrega.mockResolvedValue(datos as never);

  render(<EntregaConChrome token="TOK" />);

  expect(screen.getByTestId('spinner')).toBeInTheDocument();

  await waitFor(() => expect(screen.getByTestId('entrega-layout')).toBeInTheDocument());

  expect(screen.queryByTestId('kyc-chrome')).not.toBeInTheDocument();
  expect(screen.queryByTestId('layout-provider')).not.toBeInTheDocument();
  const client = screen.getByTestId('entrega-token-client');
  expect(client.dataset.token).toBe('TOK');

  expect(mockGetEntrega).toHaveBeenCalledTimes(1);
  expect(JSON.parse(client.dataset.initialData!)).toEqual(datos);
});

it('el error del único canje también baja como initialData (sin un segundo viaje)', async () => {
  const error = { reason: 'expired', error: 'Este enlace expiró.' };
  mockGetEntrega.mockResolvedValue(error as never);

  render(<EntregaConChrome token="TOK" />);

  await waitFor(() => expect(screen.getByTestId('entrega-layout')).toBeInTheDocument());

  expect(mockGetEntrega).toHaveBeenCalledTimes(1);
  const client = screen.getByTestId('entrega-token-client');
  expect(JSON.parse(client.dataset.initialData!)).toEqual(error);
});

describe('slugDesdeVolver', () => {
  it('despoja BASE_PATH antes de leer el primer segmento (el bug real del CRITICAL)', () => {
    // Antes de este fix, esto devolvía "prototipos".
    expect(slugDesdeVolver(`${BASE_PATH}/renueva-tu-equipo-1-a/solicitar`)).toBe('renueva-tu-equipo-1-a');
  });

  it('con basePath="" (producción detrás del rewrite de middleware): funciona igual', () => {
    // Dato de prod verificado: `?volver=%2Frenueva-tu-equipo-1-a%2Fsolicitar`,
    // SIN `/prototipos/0.6`.
    expect(slugDesdeVolver('/renueva-tu-equipo-1-a/solicitar', '')).toBe('renueva-tu-equipo-1-a');
  });

  it('con basePath="" pero el volver SÍ trae el prefijo (mezcla no esperada): no lo confunde con la landing', () => {
    // `startsWith('')` en la implementación real usa `basePath &&`, así que
    // con basePath vacío no se despoja nada — y "prototipos" cae al filtro
    // de segmentos reservados de todos modos.
    expect(slugDesdeVolver(`${BASE_PATH}/renueva-tu-equipo-1-a/solicitar`, '')).toBeUndefined();
  });

  it('un segmento reservado (estático hermano de [landing]) nunca es la landing', () => {
    expect(slugDesdeVolver(`${BASE_PATH}/kyc/algun-token`)).toBeUndefined();
    expect(slugDesdeVolver(`${BASE_PATH}/entrega/otro-token`)).toBeUndefined();
    expect(slugDesdeVolver('/prototipos/otra-cosa')).toBeUndefined();
  });

  it('sin volver: undefined', () => {
    expect(slugDesdeVolver(undefined)).toBeUndefined();
  });

  it('un slug con mayúsculas o caracteres raros no valida', () => {
    expect(slugDesdeVolver(`${BASE_PATH}/RenuevaTuEquipo/solicitar`)).toBeUndefined();
  });
});
