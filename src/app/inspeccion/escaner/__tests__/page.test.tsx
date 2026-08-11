// Import ANTES que `../page` a propósito — ver el comentario largo en
// `camara/__tests__/page.test.tsx`: si queda después, el factory de
// `jest.mock` de abajo revienta con "Cannot access '_fakePusher' before
// initialization" (orden real de los `require()` transpilados).
import { FakePusher as mockFakePusher } from '../../_test-support/fakePusher';
import { act, render, screen, waitFor } from '@testing-library/react';
import EscanerPage from '../page';
import { getDeviceSession, setDeviceSession } from '../../_lib/deviceSession';

jest.mock('pusher-js', () => ({ __esModule: true, default: mockFakePusher }));

const FakePusher = mockFakePusher;

function mockFetchSequence(responses: Array<{ ok: boolean; json: () => Promise<unknown> }>) {
  let call = 0;
  global.fetch = jest.fn(() => {
    const r = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return Promise.resolve(r);
  }) as unknown as typeof fetch;
}

describe('EscanerPage', () => {
  beforeEach(() => {
    localStorage.clear();
    FakePusher.instances.length = 0;
    window.history.replaceState({}, '', '/inspeccion/escaner');
    process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER = 'test-cluster';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as { fetch?: unknown }).fetch;
    delete process.env.NEXT_PUBLIC_PUSHER_KEY;
    delete process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  });

  it('C2: con sesion existente y ?p= nuevo, gana el codigo — limpia el parametro sincronicamente y canjea', async () => {
    setDeviceSession({
      deviceId: 'dev-viejo',
      token: 'tok-viejo',
      stationId: 'est-01',
      kind: 'escaner',
      label: null,
    });
    window.history.replaceState({}, '', '/inspeccion/escaner?p=NUEVO1');

    mockFetchSequence([
      {
        ok: true,
        json: async () => ({
          device_id: 'dev-viejo',
          station_id: 'est-02',
          kind: 'escaner',
          label: null,
          token: 'tok-nuevo',
        }),
      },
      { ok: true, json: async () => ({ camera_labels: ['techo'] }) },
    ]);

    render(<EscanerPage />);

    // Igual que en camara/page.tsx: se limpia YA, sin esperar la red. Antes
    // del fix, la rama "ya hay sesion" de este archivo directamente no
    // tenia ningun replaceState — el ?p= quedaba pegado para siempre.
    expect(window.location.search).toBe('');

    await waitFor(() => {
      expect(getDeviceSession()?.token).toBe('tok-nuevo');
    });
    expect(getDeviceSession()?.stationId).toBe('est-02');
  });

  it('I1/I2: un error de canal tiene precedencia sobre "Faltan camaras" y "listo" exige estar conectado', async () => {
    setDeviceSession({
      deviceId: 'dev-01',
      token: 'tok-01',
      stationId: 'est-01',
      kind: 'escaner',
      label: null,
    });

    mockFetchSequence([{ ok: true, json: async () => ({ camera_labels: ['techo'] }) }]);

    render(<EscanerPage />);

    // Todavia sin channelError: banner "Faltan camaras" (no hay conexion
    // confirmada al canal, asi que `listo` tampoco puede ser true — I2).
    await waitFor(() => {
      expect(screen.getByText('Faltan cámaras — no se puede escanear')).toBeInTheDocument();
    });

    const pusher = FakePusher.instances[0];
    act(() => {
      pusher.channel.emit('pusher:subscription_error', { status: 401 });
    });

    // El banner grande pasa a explicar el error de canal — no puede seguir
    // afirmando "Faltan camaras" (I1): antes ambos mensajes convivian, uno
    // grande y falso, otro chico y verdadero.
    await waitFor(() => {
      expect(screen.queryByText('Faltan cámaras — no se puede escanear')).not.toBeInTheDocument();
      expect(screen.getByText(/No se pudo autorizar el canal/)).toBeInTheDocument();
    });
  });
});
