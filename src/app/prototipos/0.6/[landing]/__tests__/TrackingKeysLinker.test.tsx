/**
 * TrackingKeysLinker: lee las llaves del URL (`rid`, `vip_auto`, `alk`) antes
 * de que nada las limpie, borra el `rid` del URL (R9) y ata la visita en un
 * solo pedido a `link-token-session` cuando la sesión existe.
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';

const mockFetchLandingConfig = jest.fn();
jest.mock('../../services/landingConfigApi', () => ({
  fetchLandingConfig: (...a: unknown[]) => mockFetchLandingConfig(...a),
}));

let mockSession: { sessionUuid: string | null } | null = { sessionUuid: 'uuid-1' };
jest.mock('../solicitar/context/SessionContext', () => ({
  useSessionOptional: () => mockSession,
}));

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }));

import * as Sentry from '@sentry/nextjs';
import { TrackingKeysLinker } from '../TrackingKeysLinker';

const LLAVES = { layout: {}, features: {}, tracking: { query_keys: ['rid', 'vip_auto', 'alk'] } };

beforeEach(() => {
  sessionStorage.clear();
  mockSession = { sessionUuid: 'uuid-1' };
  mockFetchLandingConfig.mockReset();
  mockFetchLandingConfig.mockResolvedValue(LLAVES);
  (Sentry.captureException as jest.Mock).mockReset();
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ linked: true, via: 'rid' }),
  }) as unknown as typeof fetch;
});

it('lee el rid, lo borra del URL y ata la visita en un solo pedido', async () => {
  window.history.replaceState({}, '', '/ze/catalogo/?utm_campaign=x&rid=Abc12345');

  render(<TrackingKeysLinker landing="ze" />);

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  expect(window.location.search).toBe('?utm_campaign=x');
  const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
  expect(url).toContain('/public/landing/ze/link-token-session');
  expect(JSON.parse(init.body)).toEqual({ keys: { rid: 'Abc12345' }, session_uuid: 'uuid-1' });
  await waitFor(() => expect(sessionStorage.getItem('baldecash-llaves-pendientes-ze')).toBeNull());
});

it('sin sesión todavía espera, y el rid igual ya no está en el URL', async () => {
  mockSession = { sessionUuid: null };
  window.history.replaceState({}, '', '/ze/?rid=Abc12345');

  render(<TrackingKeysLinker landing="ze" />);

  expect(window.location.search).toBe('');
  await new Promise((r) => setTimeout(r, 0));
  expect(global.fetch).not.toHaveBeenCalled();
  expect(sessionStorage.getItem('baldecash-llaves-pendientes-ze')).toContain('Abc12345');
});

it('un link viejo con solo vip_auto lo deja en el URL', async () => {
  window.history.replaceState({}, '', '/ze/?vip_auto=tok');

  render(<TrackingKeysLinker landing="ze" />);

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  expect(window.location.search).toBe('?vip_auto=tok');
  expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body).keys).toEqual({ vip_auto: 'tok' });
});

it('sin llaves activas no llama a nadie', async () => {
  window.history.replaceState({}, '', '/ze/?utm_campaign=x');

  render(<TrackingKeysLinker landing="ze" />);

  await waitFor(() => expect(mockFetchLandingConfig).toHaveBeenCalled());
  await new Promise((r) => setTimeout(r, 0));
  expect(global.fetch).not.toHaveBeenCalled();
});

it('una llave nueva del config se manda sin cambiar la web', async () => {
  mockFetchLandingConfig.mockResolvedValue({ tracking: { query_keys: ['rid', 'nueva'] } });
  window.history.replaceState({}, '', '/ze/?nueva=x1');

  render(<TrackingKeysLinker landing="ze" />);

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body).keys).toEqual({ nueva: 'x1' });
});

it('si falla la red avisa a Sentry y deja las llaves para el próximo intento', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('sin red')) as unknown as typeof fetch;
  window.history.replaceState({}, '', '/ze/?rid=Abc12345');

  render(<TrackingKeysLinker landing="ze" />);

  await waitFor(() => expect(Sentry.captureException).toHaveBeenCalled());
  expect(sessionStorage.getItem('baldecash-llaves-pendientes-ze')).toContain('Abc12345');
});
