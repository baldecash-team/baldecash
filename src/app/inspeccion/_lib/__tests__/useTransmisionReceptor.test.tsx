/**
 * `useTransmisionReceptor` — el lado escáner de la transmisión en vivo.
 *
 * Los tests que más importan: que no abra nada mientras la inspección está
 * cerrada (batería), que el backoff pare a los tres intentos, y que al
 * cerrar mande `bye` para que el teléfono deje de codificar.
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  useTransmisionReceptor,
  BACKOFF_MS,
  ESPERA_ANSWER_MS,
  type CamaraConectable,
} from '../useTransmisionReceptor';
import { SENAL_EVENT, type SenalChannel } from '../senalizacion';
import { FakeRTCPeerConnection, instalarFakeRTC, ultimoPeer } from '../../_test-support/fakeRTC';

class FakeChannel implements SenalChannel {
  private handlers: Record<string, Array<(data: unknown) => void>> = {};

  bind(event: string, cb: (data: unknown) => void): void {
    (this.handlers[event] ??= []).push(cb);
  }

  unbind(event: string, cb: (data: unknown) => void): void {
    this.handlers[event] = (this.handlers[event] ?? []).filter((h) => h !== cb);
  }

  emit(event: string, data: unknown): void {
    (this.handlers[event] ?? []).forEach((cb) => cb(data));
  }
}

const CAMARAS: CamaraConectable[] = [{ deviceId: 'dev-cam-01', label: 'techo' }];

function montar(activo = true, camaras = CAMARAS) {
  const channel = new FakeChannel();
  const vista = renderHook(
    (props: { activo: boolean }) =>
      useTransmisionReceptor({
        channel,
        deviceId: 'dev-esc-01',
        token: 'tok',
        activo: props.activo,
        camaras,
      }),
    { initialProps: { activo } }
  );
  return { channel, vista };
}

function cuerposEnviados(): Array<Record<string, string>> {
  return (global.fetch as jest.Mock).mock.calls.map((c) => JSON.parse(c[1].body));
}

describe('useTransmisionReceptor', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_TRANSMISION_EN_VIVO = '1';
    instalarFakeRTC();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_TRANSMISION_EN_VIVO;
  });

  it('APAGADA (el default): con la inspección abierta no ofrece ni muestra nada', async () => {
    delete process.env.NEXT_PUBLIC_TRANSMISION_EN_VIVO;
    const { vista } = montar(true);
    await new Promise((r) => setTimeout(r, 0));

    expect(FakeRTCPeerConnection.instances).toHaveLength(0);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(vista.result.current.transmisiones).toEqual([]);
  });

  it('con la inspección cerrada no abre ningún peer', () => {
    montar(false);

    expect(FakeRTCPeerConnection.instances).toHaveLength(0);
  });

  it('con la inspección abierta ofrece a cada cámara, en recvonly', async () => {
    montar(true);

    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const pc = ultimoPeer();
    expect(pc.transceivers).toEqual([{ kind: 'video', direction: 'recvonly' }]);

    pc.completarIce();
    await waitFor(() =>
      expect(cuerposEnviados()).toContainEqual({
        destino_device_id: 'dev-cam-01',
        tipo: 'offer',
        sdp: 'SDP-OFFER',
      })
    );
  });

  it('aplica la answer que contesta la cámara', async () => {
    const { channel } = montar(true);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const pc = ultimoPeer();

    channel.emit(SENAL_EVENT, {
      origen_device_id: 'dev-cam-01',
      destino_device_id: 'dev-esc-01',
      tipo: 'answer',
      sdp: 'SDP-RESPUESTA',
    });

    await waitFor(() =>
      expect(pc.remoteDescription).toEqual({ type: 'answer', sdp: 'SDP-RESPUESTA' })
    );
  });

  it('cuando llega el track pasa a "viendo" y expone el stream', async () => {
    const { vista } = montar(true);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const stream = { id: 'st-1' } as unknown as MediaStream;

    act(() => {
      ultimoPeer().emit('track', { streams: [stream] });
    });

    await waitFor(() => {
      expect(vista.result.current.transmisiones[0].estado).toBe('viendo');
      expect(vista.result.current.transmisiones[0].stream).toBe(stream);
    });
  });

  it('empieza en "conectando"', async () => {
    const { vista } = montar(true);

    await waitFor(() => expect(vista.result.current.transmisiones[0].estado).toBe('conectando'));
  });

  it('REGLA CRÍTICA: la cámara que nunca contesta termina en "sin-transmision", no en "conectando" eterno', async () => {
    jest.useFakeTimers();
    try {
      const { vista } = montar(true);
      await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));

      // El caso MÁS COMÚN de todos: la cámara no está armada, así que hace
      // early return sin contestar nada. No llega ninguna answer, el peer
      // nunca recibe remote description y su `iceConnectionState` se queda
      // en 'new' — o sea que el handler de `iceconnectionstatechange`, el
      // único disparador del reintento, no corre JAMÁS. Lo único que puede
      // rescatar al tile es el plazo de la answer; sin él, el operador se
      // queda con el spinner para siempre y ni le aparece el botón
      // "Reintentar", que solo se renderiza en 'sin-transmision'.
      for (let intento = 0; intento < BACKOFF_MS.length; intento += 1) {
        act(() => {
          ultimoPeer().completarIce();
        });
        await waitFor(() => expect(cuerposEnviados()).toHaveLength(intento + 1));

        await act(async () => {
          jest.advanceTimersByTime(ESPERA_ANSWER_MS);
        });
        await waitFor(() =>
          expect(vista.result.current.transmisiones[0].estado).toBe('sin-transmision')
        );

        await act(async () => {
          jest.advanceTimersByTime(BACKOFF_MS[intento]);
        });
        await waitFor(() =>
          expect(FakeRTCPeerConnection.instances).toHaveLength(intento + 2)
        );
      }

      // El cuarto y último intento tampoco recibe answer. Ahí se queda: en
      // "sin-transmision" con su botón, y sin un quinto peer.
      act(() => {
        ultimoPeer().completarIce();
      });
      await waitFor(() => expect(cuerposEnviados()).toHaveLength(4));
      await act(async () => {
        jest.advanceTimersByTime(ESPERA_ANSWER_MS + 60_000);
      });

      expect(FakeRTCPeerConnection.instances).toHaveLength(4);
      await waitFor(() =>
        expect(vista.result.current.transmisiones[0].estado).toBe('sin-transmision')
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('REGLA CRÍTICA: una oferta que el endpoint rechaza cuenta como intento fallido', async () => {
    jest.useFakeTimers();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      // ws2 contesta 413 al SDP de más de 8KB (y 403 a la estación ajena, y
      // 503 si está caído). Esa oferta no llegó a ninguna cámara, así que no
      // hay ninguna answer que esperar: el intento se da por perdido YA, sin
      // gastar el plazo entero, y el backoff arranca.
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 413 });
      const { vista } = montar(true);
      await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));

      act(() => {
        ultimoPeer().completarIce();
      });

      await waitFor(() =>
        expect(vista.result.current.transmisiones[0].estado).toBe('sin-transmision')
      );

      // Y el reintento cae en el primer tramo del backoff, MUY antes de que
      // venciera el plazo de la answer: si el rechazo se tragara, acá
      // todavía no habría pasado nada.
      await act(async () => {
        jest.advanceTimersByTime(BACKOFF_MS[0]);
      });
      expect(FakeRTCPeerConnection.instances).toHaveLength(2);
    } finally {
      warnSpy.mockRestore();
      jest.useRealTimers();
    }
  });

  it('REGLA CRÍTICA: el backoff para a los tres intentos y queda en "sin-transmision"', async () => {
    jest.useFakeTimers();
    try {
      const { vista } = montar(true);
      await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));

      for (const espera of BACKOFF_MS) {
        act(() => {
          ultimoPeer().cambiarIce('failed');
        });
        await act(async () => {
          jest.advanceTimersByTime(espera);
        });
      }
      act(() => {
        ultimoPeer().cambiarIce('failed');
      });

      // 1 inicial + 3 reintentos, y ninguno más: avanzamos el reloj bien
      // lejos para que, si quedó un cuarto reintento agendado por error, su
      // timer alcance a dispararse y el test lo agarre.
      await act(async () => {
        jest.advanceTimersByTime(60_000);
      });
      expect(FakeRTCPeerConnection.instances).toHaveLength(4);
      await waitFor(() =>
        expect(vista.result.current.transmisiones[0].estado).toBe('sin-transmision')
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('reintentar() vuelve a empezar de cero', async () => {
    jest.useFakeTimers();
    try {
      const { vista } = montar(true);
      await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));

      // Agotamos los tres reintentos automáticos, igual que en el test de
      // backoff: es justo el escenario en el que el botón "Reintentar"
      // tiene que servir — la cámara ya se quedó en "sin-transmision".
      for (const espera of BACKOFF_MS) {
        act(() => {
          ultimoPeer().cambiarIce('failed');
        });
        await act(async () => {
          jest.advanceTimersByTime(espera);
        });
      }
      act(() => {
        ultimoPeer().cambiarIce('failed');
      });
      await act(async () => {
        jest.advanceTimersByTime(60_000);
      });
      expect(FakeRTCPeerConnection.instances).toHaveLength(4);
      await waitFor(() =>
        expect(vista.result.current.transmisiones[0].estado).toBe('sin-transmision')
      );

      // El operador aprieta "Reintentar": no alcanza con que abra UN peer
      // más — tiene que volver a tener sus tres intentos de backoff, no
      // solo el último resto que le quedaba (o ninguno) antes de tocar el
      // botón. Si `reintentar()` no resetea el contador, el siguiente fallo
      // manda derecho a "sin-transmision" sin agendar nada.
      act(() => {
        vista.result.current.reintentar('dev-cam-01');
      });
      await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(5));

      for (const espera of BACKOFF_MS) {
        act(() => {
          ultimoPeer().cambiarIce('failed');
        });
        await act(async () => {
          jest.advanceTimersByTime(espera);
        });
      }
      // 5 (el de post-reintentar) + 3 reintentos nuevos = 8.
      expect(FakeRTCPeerConnection.instances).toHaveLength(8);

      // Y el backoff vuelve a parar a los tres, como la primera vez:
      // avanzamos el reloj bien lejos después del último fallo para que,
      // si quedó un cuarto reintento agendado de más, su timer alcance a
      // dispararse y el test lo agarre.
      act(() => {
        ultimoPeer().cambiarIce('failed');
      });
      await act(async () => {
        jest.advanceTimersByTime(60_000);
      });
      expect(FakeRTCPeerConnection.instances).toHaveLength(8);
      await waitFor(() =>
        expect(vista.result.current.transmisiones[0].estado).toBe('sin-transmision')
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('REGLA CRÍTICA: al cerrar la inspección manda bye y cierra el peer', async () => {
    const { vista } = montar(true);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const pc = ultimoPeer();

    vista.rerender({ activo: false });

    await waitFor(() =>
      expect(cuerposEnviados()).toContainEqual({
        destino_device_id: 'dev-cam-01',
        tipo: 'bye',
        sdp: '',
      })
    );
    expect(pc.cerrada).toBe(true);
    expect(vista.result.current.transmisiones).toEqual([]);
  });

  it('al desmontar cierra todo', async () => {
    const { vista } = montar(true);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));
    const pc = ultimoPeer();

    vista.unmount();

    expect(pc.cerrada).toBe(true);
  });

  it('abre un peer por cámara declarada', async () => {
    montar(true, [
      { deviceId: 'dev-cam-01', label: 'techo' },
      { deviceId: 'dev-cam-02', label: 'pared' },
    ]);

    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(2));
  });
});
