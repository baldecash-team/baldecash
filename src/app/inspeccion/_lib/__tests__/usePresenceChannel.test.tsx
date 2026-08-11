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
});
