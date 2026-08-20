// Import ANTES que `../EscanerPageContent` a propósito — ver el comentario
// largo en `camara/__tests__/CamaraPageContent.test.tsx`: si queda después,
// el factory de `jest.mock` de abajo revienta con "Cannot access
// '_fakePusher' before initialization" (orden real de los `require()`
// transpilados).
import { FakePusher as mockFakePusher } from '../../_test-support/fakePusher';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
// Se testea `EscanerPageContent` directo, NO `page.tsx`: `page.tsx` es solo
// un wrapper de `next/dynamic(..., { ssr: false })` (ver su doc-comment).
import EscanerPageContent from '../EscanerPageContent';
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

describe('EscanerPageContent', () => {
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

    render(<EscanerPageContent />);

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

    render(<EscanerPageContent />);

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

  it('con sesion guardada de kind "camara" (sin ?p= en la URL), no monta el pre-vuelo: avisa el rol actual y como cambiarlo', () => {
    setDeviceSession({
      deviceId: 'dev-01',
      token: 'tok-01',
      stationId: 'est-01',
      kind: 'camara',
      label: 'techo',
    });

    render(<EscanerPageContent />);

    // Ni el pre-vuelo ("Pre-vuelo") ni la pantalla generica de "no
    // vinculado" — este dispositivo SI esta vinculado, con el otro rol.
    expect(screen.queryByText('Pre-vuelo')).not.toBeInTheDocument();
    expect(screen.queryByText('Escáner no vinculado')).not.toBeInTheDocument();

    expect(screen.getByText(/vinculado como cámara/i)).toBeInTheDocument();
    expect(screen.getByText(/est-01/)).toBeInTheDocument();
    expect(screen.getByText(/volver a vincularlo/i)).toBeInTheDocument();
  });

  it('el boton de re-vinculacion limpia la sesion existente y vuelve al estado "no vinculado"', () => {
    setDeviceSession({
      deviceId: 'dev-01',
      token: 'tok-01',
      stationId: 'est-01',
      kind: 'camara',
      label: 'techo',
    });

    render(<EscanerPageContent />);

    fireEvent.click(screen.getByRole('button', { name: /re-vincular/i }));

    expect(getDeviceSession()).toBeNull();
    expect(screen.getByText('Escáner no vinculado')).toBeInTheDocument();
  });

  describe('control de grabación (F3 Task 5)', () => {
    function setDeviceSessionEscaner() {
      setDeviceSession({
        deviceId: 'dev-esc',
        token: 'tok-esc',
        stationId: 'est-01',
        kind: 'escaner',
        label: null,
      });
    }

    /**
     * Carga el serial y lo confirma contra el catálogo.
     *
     * Desde el spec §5.1, escribir el serial NO habilita INICIAR: lo que
     * habilita es el equipo confirmado contra Airtable. Un serial mal leído o
     * mal tipeado grabaría evidencia contra el equipo equivocado, y ese riesgo
     * se cierra con esta confirmación, no con un OCR más preciso.
     */
    async function cargarYConfirmarSerial(valor = 'SN-001') {
      fireEvent.change(screen.getByLabelText(/serial del equipo/i), {
        target: { value: valor },
      });
      fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }));
      await waitFor(() => {
        expect(screen.getByText(/IdeaPad Slim 3/)).toBeInTheDocument();
      });
    }

    /** Router mínimo de `fetch` para los endpoints que esta vista llama:
     * `GET /stations/{id}/state`, `POST /inspections` (crear),
     * `POST /inspections/{id}/abort`, `POST /inspections/{id}/stop` (F3
     * Task 5) y `POST /inspections/{id}/takes` / `POST /inspections/{id}/close`
     * (F4 Task 5). `stateResponse` es override-able — para el resync de
     * captura Y para simular la cola de subida de una cámara (`devices[].cola`,
     * F4 Task 5): por defecto no trae `devices`, así que ni el snapshot de
     * captura ni el de cola aportan nada y los tests existentes siguen
     * dependiendo solo del evento en vivo (`conectarYListo`). */
    function instalarFetchEscaner(
      stateResponse: unknown = { camera_labels: ['techo'] },
      modoCreacion: 'video' | 'foto' = 'video'
    ) {
      global.fetch = jest.fn((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes('/stations/') && u.endsWith('/state')) {
          return Promise.resolve({ ok: true, json: async () => stateResponse });
        }
        if (u.endsWith('/abort')) {
          return Promise.resolve({ ok: true, json: async () => ({ inspection_id: 1, status: 'failed' }) });
        }
        if (u.endsWith('/stop')) {
          return Promise.resolve({ ok: true, json: async () => ({ inspection_id: 1, status: 'uploading' }) });
        }
        if (u.endsWith('/takes')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              inspection_id: 1, take_number: 2, start_at: Date.now() + 1500, seq: 3, status: 'recording',
            }),
          });
        }
        if (u.endsWith('/close')) {
          return Promise.resolve({ ok: true, json: async () => ({ inspection_id: 1, status: 'uploading' }) });
        }
        if (u.endsWith('/photos')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              inspection_id: 1, take_number: 1, photo_number: 1,
              capture_at: Date.now() + 600,
            }),
          });
        }
        if (u.includes('/photos/') && u.endsWith('/redo')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              inspection_id: 1, take_number: 1, photo_number: 1,
              capture_at: Date.now() + 600, fotos_descartadas: 1,
            }),
          });
        }
        if (u.includes('/photos/') && u.endsWith('/favorite')) {
          return Promise.resolve({ ok: true, json: async () => ({ favorita: true }) });
        }
        if (u.endsWith('/inspections')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              inspection_id: 1, start_at: Date.now() + 1500, seq: 1, modo: modoCreacion,
            }),
          });
        }
        // Catálogo de Airtable: desde el spec §5.1, INICIAR no se habilita con
        // el serial escrito sino con el equipo CONFIRMADO contra el catálogo.
        if (u.includes('/inspections/catalog/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              encontrado: true,
              equipo: {
                record_id: 'rec123',
                serial: 'SN-001',
                marca: 'Lenovo',
                modelo: 'IdeaPad Slim 3',
                procesador: 'Intel Core i7',
                ram_gb: 16,
                almacenamiento: '1TB SSD',
                pantalla: 15.6,
                grado: 'A',
                tipo: 'Laptop',
                sku: 'LPLEAL0000606',
              },
              candidato: 'SN-001',
              confianza: null,
              error: null,
            }),
          });
        }
        return Promise.reject(new Error(`fetch inesperado en la prueba: ${u}`));
      }) as unknown as typeof fetch;
    }

    /** Deja el canal conectado, suscripto, y a la única cámara esperada
     * (`techo`) reportando `armada` — la condición de "pre-vuelo listo" tras
     * la review de F2 (ver `PreVuelo.tsx`, `estaListo`). */
    function conectarYListo() {
      const pusher = FakePusher.instances[0];
      pusher.channel.members.each.mockImplementation(
        (cb: (m: { id: string; info?: { kind?: string; label?: string | null } }) => void) => {
          cb({ id: 'dev-cam', info: { kind: 'camara', label: 'techo' } });
        }
      );
      act(() => {
        pusher.connection.emit('state_change', { current: 'connected' });
        pusher.channel.emit('pusher:subscription_succeeded');
        // Emitido por el BACKEND en producción (`station.py`, reemisión de
        // `POST /inspections/devices/estado`) — acá se simula tal cual
        // llega por el canal, sin importar quién lo disparó del otro lado.
        pusher.channel.emit('device.capture_state', { device_id: 'dev-cam', estado: 'armada' });
      });
      return pusher;
    }

    it('el boton de INICIAR esta deshabilitado si el pre-vuelo no esta listo', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);

      // Sin cámaras reportando "armada" (mock de `members.each` sin
      // configurar, default vacío): el banner sigue en "Faltan cámaras" y
      // INICIAR debe estar deshabilitado aunque haya un serial cargado.
      await waitFor(() => {
        expect(screen.getByText('Faltan cámaras — no se puede escanear')).toBeInTheDocument();
      });
      await cargarYConfirmarSerial();

      expect(screen.getByRole('button', { name: /^iniciar$/i })).toBeDisabled();
    });

    it('RESYNC (rediseño post-revisión): el snapshot de GET /state deja el pre-vuelo listo SIN esperar ningun evento en vivo del canal', async () => {
      setDeviceSessionEscaner();
      // `/state` ya trae `devices[].capture_state` — lo que reporta el
      // backend tras `POST /inspections/devices/estado`. El escáner que
      // recién carga (o se reconecta) lo recupera por REST, sin depender de
      // haber estado conectado al canal en el momento del reporte.
      instalarFetchEscaner({
        camera_labels: ['techo'],
        devices: [
          { device_id: 'dev-cam', kind: 'camara', label: 'techo', capture_state: 'armada' },
        ],
      });

      render(<EscanerPageContent />);
      const pusher = FakePusher.instances[0];
      // El canal SÍ tiene que estar conectado (member presente) — el
      // snapshot de `/state` cubre el `captureState`, no la presencia en sí.
      pusher.channel.members.each.mockImplementation(
        (cb: (m: { id: string; info?: { kind?: string; label?: string | null } }) => void) => {
          cb({ id: 'dev-cam', info: { kind: 'camara', label: 'techo' } });
        }
      );
      act(() => {
        pusher.connection.emit('state_change', { current: 'connected' });
        pusher.channel.emit('pusher:subscription_succeeded');
        // Deliberadamente SIN emitir `device.capture_state` — es justo lo
        // que el resync tiene que cubrir.
      });

      await waitFor(() => {
        expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
      });
    });

    it('con el pre-vuelo listo pero sin serial cargado, INICIAR sigue deshabilitado', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);
      conectarYListo();

      await waitFor(() => {
        expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /^iniciar$/i })).toBeDisabled();
    });

    it('REGLA CRÍTICA: si no llegan los acks de todas las cámaras a tiempo, la inspección se aborta y se muestra un error visible', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);
      conectarYListo();

      await waitFor(() => {
        expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
      });
      await cargarYConfirmarSerial();

      fireEvent.click(screen.getByRole('button', { name: /^iniciar$/i }));

      // Deliberadamente sin emitir `recording.started`: ninguna cámara
      // ackeó. El escáner NUNCA debe decir que grabó — pasada la ventana de
      // ack debe abortar por su cuenta y mostrarlo, no quedarse esperando
      // para siempre ni asumir que arrancó.
      //
      // La ventana es `ACK_TIMEOUT_MS` = 5s (antes 1,5s). Se subió porque
      // valía IGUAL que el delay de arranque del backend, y en hardware real
      // eso era una carrera: el abort caía justo cuando la cámara arrancaba,
      // se veía el 3·2·1 junto al mensaje de aborto, y el segundo intento
      // andaba. El waitFor tiene que darle margen a esa ventana o este test
      // falla por el reloj, no por la regla que verifica.
      await waitFor(
        () => {
          expect(
            (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/1/abort'))
          ).toBe(true);
        },
        { timeout: 8000 }
      );
      await waitFor(() => {
        expect(screen.getByText(/no llegó confirmación/i)).toBeInTheDocument();
      });

      // Vuelve a un estado operable: el botón se reactiva para reintentar
      // (no queda "iniciando" colgado para siempre).
      expect(screen.getByRole('button', { name: /^iniciar$/i })).not.toBeDisabled();
      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
    }, 6000);

    it('con los acks completos (recording.started), pasa a estado GRABANDO y aparece el boton de FINALIZAR', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);
      const pusher = conectarYListo();

      await waitFor(() => {
        expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
      });
      await cargarYConfirmarSerial();

      fireEvent.click(screen.getByRole('button', { name: /^iniciar$/i }));

      await waitFor(() => {
        expect(
          (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/inspections'))
        ).toBe(true);
      });

      // La señal que hace avanzar al escáner es la de la API (Pusher), no
      // un timer propio — spec §6.1 regla 4.
      act(() => {
        pusher.channel.emit('recording.started', { inspection_id: 1 });
      });

      await waitFor(() => {
        expect(screen.getByText('GRABANDO')).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /^finalizar$/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^iniciar$/i })).not.toBeInTheDocument();

      // No debe haber abortado: los acks llegaron a tiempo.
      expect(
        (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/abort'))
      ).toBe(false);
    });

    /** Lleva la vista hasta GRABANDO (toma 1) y hace click en FINALIZAR —
     * el punto de partida común de todos los tests de F4 Task 5, de acá
     * abajo, sobre "toma 2" vs "subir". */
    async function grabarYFinalizar() {
      const pusher = conectarYListo();

      await waitFor(() => {
        expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
      });
      await cargarYConfirmarSerial();
      fireEvent.click(screen.getByRole('button', { name: /^iniciar$/i }));

      await waitFor(() => {
        expect(
          (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/inspections'))
        ).toBe(true);
      });
      act(() => {
        pusher.channel.emit('recording.started', { inspection_id: 1 });
      });
      await waitFor(() => {
        expect(screen.getByText('GRABANDO')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /^finalizar$/i }));

      await waitFor(() => {
        expect(
          (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/1/stop'))
        ).toBe(true);
      });

      return pusher;
    }

    it('FINALIZAR llama al endpoint de stop y libera el escáner al `stopped`, no a la verificación', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);
      await grabarYFinalizar();

      // F4 Task 5, plan Step 4: el escáner se libera al `stopped` — la
      // respuesta de `/stop` ya volvió — sin esperar ninguna verificación
      // de S3 (que acá ni siquiera está mockeada). "GRABANDO" desaparece
      // de inmediato.
      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
    });

    it('tras finalizar aparecen las dos opciones: otra toma o subir', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);
      await grabarYFinalizar();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^toma 2$/i })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /^subir$/i })).toBeInTheDocument();
      // Todavía NO vuelve a ofrecer un serial nuevo — la inspección sigue
      // viva, el operador no terminó de decidir.
      expect(screen.queryByRole('button', { name: /^iniciar$/i })).not.toBeInTheDocument();
    });

    it('el contador de tomas se ve en pantalla', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);
      await grabarYFinalizar();

      await waitFor(() => {
        expect(screen.getByText(/toma 1 lista/i)).toBeInTheDocument();
      });
    });

    it('«toma 2» arranca una grabación nueva con el take_number incrementado, SIN crear otra inspección', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);
      await grabarYFinalizar();
      (global.fetch as jest.Mock).mockClear();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^toma 2$/i })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /^toma 2$/i }));

      await waitFor(() => {
        expect(
          (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/1/takes'))
        ).toBe(true);
      });

      // Vuelve a GRABANDO sin pasar por "iniciando" — `/takes` transiciona
      // de inmediato en el servidor, sin quórum de acks (a diferencia de la
      // toma 1).
      await waitFor(() => {
        expect(screen.getByText('GRABANDO')).toBeInTheDocument();
      });
      // En GRABANDO no existe el botón "Regrabar la toma N" (es del estado
      // "decidiendo"), así que este texto sigue siendo único.
      expect(screen.getByText(/toma 2/i)).toBeInTheDocument();

      // Nunca se creó una segunda inspección: ningún nuevo POST a
      // `/inspections` (el único ya había salido en `grabarYFinalizar`,
      // y se limpió el mock antes de este click).
      expect(
        (global.fetch as jest.Mock).mock.calls.some(
          ([u]: [string]) => String(u).endsWith('/inspections') && !String(u).includes('/1/')
        )
      ).toBe(false);
    });

    it('«subir» cierra la inspección y vuelve a ofrecer INICIAR para la siguiente', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);
      await grabarYFinalizar();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^subir$/i })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /^subir$/i }));

      await waitFor(() => {
        expect(
          (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/1/close'))
        ).toBe(true);
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^iniciar$/i })).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: /^toma 2$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^subir$/i })).not.toBeInTheDocument();
    });

    it('con la cola de una cámara llena, no deja pedir "toma 2" y explica por qué', async () => {
      setDeviceSessionEscaner();
      // La MISMA respuesta de `/state` sirve para el fetch de labels del
      // montaje y para la verificación de cola que dispara `finalizarInspeccion`
      // (y de nuevo `pedirTomaSiguiente`, que revalida antes de comandar) —
      // ver el doc-comment de `stateResponse` en `instalarFetchEscaner`.
      instalarFetchEscaner({
        camera_labels: ['techo'],
        devices: [
          {
            device_id: 'dev-cam', kind: 'camara', label: 'techo', capture_state: 'armada',
            cola: { en_vuelo: 2, pendientes: 0, fallidos: 0, llena: true, motivo_llena: 'subiendo' },
          },
        ],
      });

      render(<EscanerPageContent />);
      await grabarYFinalizar();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^toma 2$/i })).toBeDisabled();
      });
      expect(screen.getByText(/no se puede grabar otra toma/i)).toBeInTheDocument();
      expect(screen.getByText(/la cola de subida de la cámara/i).textContent).toMatch(/techo/);

      (global.fetch as jest.Mock).mockClear();
      fireEvent.click(screen.getByRole('button', { name: /^toma 2$/i }));

      // El click en un botón deshabilitado no dispara nada — pero además,
      // aunque se forzara el handler, `pedirTomaSiguiente` revalida la cola
      // ANTES de comandar: nunca debe salir un POST a `/takes` mientras la
      // cola siga llena.
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(
        (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/1/takes'))
      ).toBe(false);
    });

    it('C4 (fix de review post-F4-Task-5): un 409 estacion_ocupada recupera el inspection_id en vez de descartarlo — pasa a "decidiendo"', async () => {
      // El backend manda el `inspection_id` de la inspección YA en curso
      // justo para esto (guarda C3, ws2: `InspectionStateError`
      // `estacion_ocupada`) — típicamente porque este mismo escáner
      // recargó la pestaña en "decidiendo" y perdió el estado en memoria.
      // Antes, esto se mostraba como error mudo y el id se descartaba: sin
      // él no había forma de retomarla.
      setDeviceSessionEscaner();
      global.fetch = jest.fn((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes('/stations/') && u.endsWith('/state')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              camera_labels: ['techo'],
              devices: [
                { device_id: 'dev-cam', kind: 'camara', label: 'techo', capture_state: 'armada' },
              ],
              active_inspection: {
                id: 77, status: 'uploading', start_at: Date.now() - 5000, seq: 2, take_number: 1,
              },
            }),
          });
        }
        if (u.endsWith('/inspections')) {
          return Promise.resolve({
            ok: false,
            status: 409,
            json: async () => ({ detail: { reason: 'estacion_ocupada', inspection_id: 77 } }),
          });
        }
        if (u.includes('/inspections/catalog/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              encontrado: true,
              equipo: {
                record_id: 'rec999',
                serial: 'SN-999',
                marca: 'Lenovo',
                modelo: 'IdeaPad Slim 3',
                procesador: null,
                ram_gb: null,
                almacenamiento: null,
                pantalla: null,
                grado: null,
                tipo: null,
                sku: null,
              },
              candidato: 'SN-999',
              confianza: null,
              error: null,
            }),
          });
        }
        return Promise.reject(new Error(`fetch inesperado en la prueba: ${u}`));
      }) as unknown as typeof fetch;

      render(<EscanerPageContent />);
      conectarYListo();

      await waitFor(() => {
        expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
      });
      await cargarYConfirmarSerial('SN-999');
      fireEvent.click(screen.getByRole('button', { name: /^iniciar$/i }));

      // Recupera la inspección 77 — pasa directo a "decidiendo" (las
      // mismas dos opciones del ciclo normal), no a un error muerto.
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^toma 2$/i })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /^subir$/i })).toBeInTheDocument();
      expect(screen.getByText(/se recuperó/i)).toBeInTheDocument();
      // El contador refleja la toma real de la inspección recuperada (1),
      // recuperado de `/state`, no un valor inventado.
      expect(screen.getByText(/toma 1 lista/i)).toBeInTheDocument();

      // Y "toma 2" comanda sobre LA MISMA inspección recuperada (77), no
      // sobre una nueva. El mock no tiene ruta para `/takes` (rechaza) —
      // alcanza con que el INTENTO apunte al id correcto para probar que
      // se recuperó, no se descartó.
      fireEvent.click(screen.getByRole('button', { name: /^toma 2$/i }));
      await waitFor(() => {
        expect(
          (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/77/takes'))
        ).toBe(true);
      });
    });
  

    describe('fotos desde el controlador', () => {
      /** Simula que TODAS las camaras confirmaron la foto contra S3. Es la
       * senal que destraba la pantalla: el escaner no deja decidir hasta
       * tenerla, porque decidir sobre una foto que no subio no significa
       * nada. */
      function verificarFoto(pusher: ReturnType<typeof conectarYListo>, photoNumber = 1) {
        act(() => {
          pusher.channel.emit('media.verified', {
            inspection_id: 1,
            take_number: 1,
            photo_number: photoNumber,
            camera_label: 'techo',
            thumb_url: 'https://s3.fake/t1-techo-f1-thumb.jpeg',
          });
        });
      }

      async function iniciarEnModoFoto() {
        setDeviceSessionEscaner();
        instalarFetchEscaner({ camera_labels: ['techo'] }, 'foto');
        render(<EscanerPageContent />);
        const pusher = conectarYListo();
        await waitFor(() => {
          expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
        });
        await cargarYConfirmarSerial();
        fireEvent.click(screen.getByRole('button', { name: /^foto$/i }));
        fireEvent.click(screen.getByRole('button', { name: /^iniciar$/i }));
        return pusher;
      }

      it('en modo foto, INICIAR no espera acks ni pasa a GRABANDO', async () => {
        // El modo foto no comanda ningun video, asi que no hay acks que
        // esperar: si la vista los esperara, abortaria sola a los 5s.
        const pusher = await iniciarEnModoFoto();

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /capturar foto/i })).toBeInTheDocument();
        });
        expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
        expect(pusher).toBeTruthy();
      });

      it('tras disparar, no deja decidir hasta que la foto verifico en S3', async () => {
        const pusher = await iniciarEnModoFoto();
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /capturar foto/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /capturar foto/i }));

        // Mientras sube: nada que decidir todavia.
        await waitFor(() => {
          expect(screen.getByText(/subiendo la foto/i)).toBeInTheDocument();
        });
        expect(screen.queryByRole('button', { name: /repetir/i })).not.toBeInTheDocument();

        // El `photo_number` lo trae la respuesta del POST. Se espera a que
        // llegue antes de simular la confirmacion: en produccion no hay
        // carrera posible (el disparo se programa 600 ms en el futuro y la
        // subida tarda mucho mas), pero en el test las dos cosas pasan en el
        // mismo tick.
        await act(async () => {
          await Promise.resolve();
        });

        verificarFoto(pusher);

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /repetir/i })).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: /otra foto/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /destacar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cambiar a video/i })).toBeInTheDocument();
        // La miniatura es lo que hace util al menu: sin verla, "repetir" es
        // una apuesta.
        expect(screen.getByAltText(/foto 1 — techo/i)).toBeInTheDocument();
      });

      it('durante la grabacion se puede disparar una foto sin cortar el video', async () => {
        setDeviceSessionEscaner();
        instalarFetchEscaner();
        render(<EscanerPageContent />);
        const pusher = conectarYListo();
        await waitFor(() => {
          expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
        });
        await cargarYConfirmarSerial();
        fireEvent.click(screen.getByRole('button', { name: /^iniciar$/i }));
        // La vista solo avanza a GRABANDO si el evento matchea la inspeccion
        // que ya registro — hay que dejar resolver el POST antes de emitirlo.
        await waitFor(() => {
          expect(
            (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) =>
              String(u).endsWith('/inspections')
            )
          ).toBe(true);
        });
        act(() => {
          pusher.channel.emit('recording.started', { inspection_id: 1 });
        });
        await waitFor(() => {
          expect(screen.getByText('GRABANDO')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /capturar foto/i }));

        await waitFor(() => {
          expect(
            (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) =>
              String(u).endsWith('/takes/1/photos')
            )
          ).toBe(true);
        });
        // La toma sigue viva: la foto no la detiene.
        expect(screen.getByText('GRABANDO')).toBeInTheDocument();
        expect(
          (global.fetch as jest.Mock).mock.calls.every(
            ([u]: [string]) => !String(u).endsWith('/stop')
          )
        ).toBe(true);
      });
    });
  });
});
