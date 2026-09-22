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
    instalarFakeRTC();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
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
    const { vista } = montar(true);
    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(1));

    act(() => {
      vista.result.current.reintentar('dev-cam-01');
    });

    await waitFor(() => expect(FakeRTCPeerConnection.instances).toHaveLength(2));
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
