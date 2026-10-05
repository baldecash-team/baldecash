// Import ANTES que `../usePresenceChannel` a propósito — ver el comentario
// largo en `camara/__tests__/page.test.tsx`: si queda después, el factory
// de `jest.mock` de abajo revienta con "Cannot access '_fakePusher' before
// initialization" (orden real de los `require()` transpilados).
import { FakePusher as mockFakePusher } from '../../_test-support/fakePusher';
import { renderHook, act } from '@testing-library/react';
import { usePresenceChannel } from '../usePresenceChannel';

jest.mock('pusher-js', () => ({ __esModule: true, default: mockFakePusher }));

const FakePusher = mockFakePusher;

describe('usePresenceChannel', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    FakePusher.instances.length = 0;
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_PUSHER_KEY: 'test-key',
      NEXT_PUBLIC_PUSHER_CLUSTER: 'test-cluster',
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('C3: no queda "conectado" si la suscripcion falla, aunque el socket conecte', () => {
    const { result } = renderHook(() => usePresenceChannel('est-01', 'tok-01'));
    const pusher = FakePusher.instances[0];

    act(() => {
      // El socket conecta...
      pusher.connection.emit('state_change', { current: 'connected' });
      // ...pero /pusher/auth rechazó la suscripcion (token invalido, estacion
      // ajena, o INSPECTION_ENABLED=false).
      pusher.channel.emit('pusher:subscription_error', { status: 401 });
    });

    // El socket SI esta conectado — si `connected` mirara solo eso, daria
    // true acá y el semaforo del pre-vuelo mentiria en verde.
    expect(result.current.connected).toBe(false);
    expect(result.current.error?.reason).toBe('auth_failed');
  });

  it('conectado de verdad cuando el socket conecta Y la suscripcion se confirma', () => {
    const { result } = renderHook(() => usePresenceChannel('est-01', 'tok-01'));
    const pusher = FakePusher.instances[0];

    act(() => {
      pusher.connection.emit('state_change', { current: 'connected' });
      pusher.channel.emit('pusher:subscription_succeeded');
    });

    expect(result.current.connected).toBe(true);
    expect(result.current.error).toBeNull();
  });

  describe('device.capture_state (F3 Task 5 / review de F2 — emitido por el backend)', () => {
    function conMiembro(deviceId: string, kind: string, label: string | null) {
      const pusher = FakePusher.instances[0];
      pusher.channel.members.each.mockImplementation(
        (cb: (m: { id: string; info?: { kind?: string; label?: string | null } }) => void) => {
          cb({ id: deviceId, info: { kind, label } });
        }
      );
      return pusher;
    }

    it('una camara recien conectada, sin reporte de estado todavia, tiene captureState null', () => {
      const { result } = renderHook(() => usePresenceChannel('est-01', 'tok-01'));
      conMiembro('dev-cam', 'camara', 'techo');

      act(() => {
        FakePusher.instances[0].channel.emit('pusher:subscription_succeeded');
      });

      expect(result.current.members).toEqual([
        { deviceId: 'dev-cam', kind: 'camara', label: 'techo', captureState: null },
      ]);
    });

    it('un device.capture_state actualiza el captureState del miembro que coincide por device_id', () => {
      const { result } = renderHook(() => usePresenceChannel('est-01', 'tok-01'));
      const pusher = conMiembro('dev-cam', 'camara', 'techo');

      act(() => {
        pusher.channel.emit('pusher:subscription_succeeded');
        pusher.channel.emit('device.capture_state', { device_id: 'dev-cam', estado: 'armada' });
      });

      expect(result.current.members[0].captureState).toBe('armada');
    });

    it('una reconexion completa arranca en blanco: no arrastra el ultimo captureState conocido', () => {
      const { result, rerender } = renderHook(
        ({ stationId }) => usePresenceChannel(stationId, 'tok-01'),
        { initialProps: { stationId: 'est-01' } }
      );
      const primerPusher = conMiembro('dev-cam', 'camara', 'techo');
      act(() => {
        primerPusher.channel.emit('pusher:subscription_succeeded');
        primerPusher.channel.emit('device.capture_state', { device_id: 'dev-cam', estado: 'armada' });
      });
      expect(result.current.members[0].captureState).toBe('armada');

      // Cambiar `stationId` fuerza que el efecto limpie y vuelva a correr —
      // mismo camino que una reconexion real que recrea el objeto Pusher.
      rerender({ stationId: 'est-02' });
      const segundoPusher = FakePusher.instances[FakePusher.instances.length - 1];
      segundoPusher.channel.members.each.mockImplementation(
        (cb: (m: { id: string; info?: { kind?: string; label?: string | null } }) => void) => {
          cb({ id: 'dev-cam', info: { kind: 'camara', label: 'techo' } });
        }
      );
      act(() => {
        segundoPusher.channel.emit('pusher:subscription_succeeded');
      });

      // El mismo dispositivo, en la nueva suscripcion, vuelve a "no sabemos
      // todavia" — no "armada" heredado de la conexion anterior.
      expect(result.current.members[0].captureState).toBeNull();
    });
  });
});
