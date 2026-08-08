/**
 * `handleVip403` — el 403 de una landing con gate no puede recargar en vacío.
 *
 * La recarga existe para un caso concreto: había un token guardado, el backend
 * lo rechazó, se borra y se recarga para que el gate vuelva a pedir el DNI.
 *
 * Cuando NO había token, esa recarga no cambia nada: vuelve a pedir la misma
 * URL, sin token, y el backend vuelve a responder 403 → recarga infinita. Pasó
 * en producción en `/kyc/{token}`, que vive fuera de `[landing]/**` y por lo
 * tanto no tiene VipGate que corte el ciclo mostrando el overlay: la pantalla
 * quedaba recargándose sola y el KYC nunca se veía.
 *
 * jsdom 20 marca `reload`/`assign` como `[LegacyUnforgeable]`, así que se
 * reemplaza el objeto `window.location` entero (mismo workaround que
 * `hardNavigate.test.ts`).
 */

import { getSolicitarConfig, DEFAULT_SOLICITAR_FLOW } from '../landingApi';
import { getVipToken, saveVipToken, clearVipData } from '../../components/hero/DniModal';

const SLUG = 'family-farms-baldecash-c';

function stubLocation(search = '') {
  const reload = jest.fn();
  const assign = jest.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { reload, assign, search, pathname: `/prototipos/0.6/kyc/tok`, href: '' },
  });
  return { reload, assign };
}

describe('403 de landing con gate', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ detail: 'VIP access token required' }),
    }) as unknown as typeof fetch;
  });

  it('NO recarga cuando no había token que limpiar (evita el bucle)', async () => {
    const { reload } = stubLocation();

    const cfg = await getSolicitarConfig(SLUG);

    expect(reload).not.toHaveBeenCalled();
    expect(cfg).toEqual(DEFAULT_SOLICITAR_FLOW);
  });

  it('sí recarga cuando el token guardado fue rechazado', async () => {
    saveVipToken(SLUG, 'token-vencido');
    const { reload } = stubLocation();

    await getSolicitarConfig(SLUG);

    // El token rechazado se descarta y se recarga: ahora sí la recarga cambia
    // el estado (el gate vuelve a pedir el DNI en vez de reusar basura).
    expect(getVipToken(SLUG)).toBeFalsy();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('sí recarga cuando el token venía en ?vip_auto= y todavía no se guardó', async () => {
    // Carrera conocida: el fetch sale antes de que VipGate persista el token de
    // la URL. Ahí la recarga sí puede resolver (la URL conserva el param), así
    // que ese camino se mantiene igual que siempre.
    const { reload } = stubLocation('?vip_auto=token-fresco');

    await getSolicitarConfig(SLUG);

    expect(reload).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    clearVipData(SLUG);
    jest.restoreAllMocks();
  });
});
