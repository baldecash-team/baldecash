// Import ANTES que `../CamaraPageContent` a propósito: `jest.mock` de abajo
// queda hoisteado por encima de todos los imports (`babel-plugin-jest-hoist`),
// y el factory referencia `mockFakePusher` — pero el `require` real de este
// módulo tiene que haber corrido para cuando `../CamaraPageContent` (que
// importa `usePresenceChannel`, que importa `pusher-js`) dispare el factory.
// Si este import queda después, el factory revienta con
// "Cannot access '_fakePusher' before initialization" (orden de ejecución
// real de los `require()` transpilados, no una regla estética).
import { FakePusher as mockFakePusher } from '../../_test-support/fakePusher';
import { render, screen, waitFor } from '@testing-library/react';
// Se testea `CamaraPageContent` directo, NO `page.tsx`: `page.tsx` es solo
// un wrapper de `next/dynamic(..., { ssr: false })` (ver su doc-comment) —
// probarlo agregaría el mecanismo de carga diferida de Next a la ecuación
// sin aportar cobertura sobre la lógica real de la vista.
import CamaraPageContent from '../CamaraPageContent';
import { getDeviceSession, setDeviceSession } from '../../_lib/deviceSession';

jest.mock('pusher-js', () => ({ __esModule: true, default: mockFakePusher }));

describe('CamaraPageContent', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/inspeccion/camara');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as { fetch?: unknown }).fetch;
  });

  it('C2: con sesion existente y ?p= nuevo en la URL, gana el codigo — limpia el parametro sincronicamente y canjea', async () => {
    setDeviceSession({
      deviceId: 'dev-viejo',
      token: 'tok-viejo',
      stationId: 'est-01',
      kind: 'camara',
      label: 'techo',
    });
    window.history.replaceState({}, '', '/inspeccion/camara?p=NUEVO1');

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        device_id: 'dev-viejo',
        station_id: 'est-02',
        kind: 'camara',
        label: 'pared',
        token: 'tok-nuevo',
      }),
    }) as unknown as typeof fetch;

    render(<CamaraPageContent />);

    // El parametro se limpia YA — sincronicamente, sin esperar la respuesta
    // de red. Antes del fix, la rama "ya hay sesion" ni intentaba limpiar
    // (el replaceState solo vivia en el .then() del canje) y el codigo se
    // quedaba pegado en la URL indefinidamente.
    expect(window.location.search).toBe('');

    await waitFor(() => {
      expect(getDeviceSession()?.token).toBe('tok-nuevo');
    });
    expect(getDeviceSession()?.stationId).toBe('est-02');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/inspections/pair'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('sin sesion y sin ?p=, no queda "Vinculando…" colgado: pasa directo a "no vinculado"', () => {
    render(<CamaraPageContent />);

    // Con el lazy init, no hay nada que esperar: session=null y
    // vinculando=false desde el primer render, sin flash de "Vinculando…".
    expect(screen.getByText('Dispositivo no vinculado')).toBeInTheDocument();
    expect(screen.queryByText('Vinculando…')).not.toBeInTheDocument();
  });
});
