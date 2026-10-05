import { redeemPairingCode } from '../pairing';
import { getDeviceSession } from '../deviceSession';

describe('redeemPairingCode', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as { fetch?: unknown }).fetch;
  });

  it('canjea el código y guarda la sesión', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        device_id: 'dev-01', station_id: 'est-01',
        kind: 'camara', label: 'techo', token: 'tok-123',
      }),
    }) as unknown as typeof fetch;

    const session = await redeemPairingCode('A7K2M9');

    expect(session.token).toBe('tok-123');
    expect(getDeviceSession()?.token).toBe('tok-123');
  });

  it('lanza con el motivo cuando el código ya se usó', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ detail: { reason: 'already_used' } }),
    }) as unknown as typeof fetch;

    // El motivo se traduce a algo accionable: el operador tiene que saber que
    // un código sirve UNA vez y que la salida es emitir otro. Ver
    // `mensajeDeVinculacion` — mostrar "already_used" no le dice nada a quien
    // está parado frente a la estación.
    await expect(redeemPairingCode('A7K2M9')).rejects.toThrow(/ya se usó/);
    // Una sesión fallida no debe quedar a medias.
    expect(getDeviceSession()).toBeNull();
  });
});
