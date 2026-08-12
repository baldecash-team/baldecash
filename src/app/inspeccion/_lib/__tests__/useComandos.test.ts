/**
 * `useComandos` — despacha `cmd.start`/`cmd.stop`/`cmd.abort` del canal
 * presence de la estación (spec §6, plan F3 Task 4).
 *
 * El test que más importa: un `seq` repetido (Pusher entrega at-least-once,
 * redistribuye al reconectar) NO puede disparar el callback dos veces — eso
 * es lo que evita, río abajo en `CamaraPageContent.tsx`, dos `grabar()` y
 * dos acks para el mismo comando.
 */
import { renderHook } from '@testing-library/react';
import {
  useComandos,
  type ComandoChannel,
  type ComandoStartPayload,
} from '../useComandos';

/** Fake mínimo de canal: solo lo que `useComandos` necesita (`bind`/
 * `unbind`), más `emit` para que el test dispare los eventos a mano — mismo
 * espíritu que `_test-support/fakePusher.ts`, pero sin las partes de
 * `pusher-js` (miembros de presence, etc.) que acá no hacen falta. */
class FakeChannel implements ComandoChannel {
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

describe('useComandos', () => {
  it('cmd.start llama a onStart con el payload recibido', () => {
    const channel = new FakeChannel();
    const onStart = jest.fn();
    renderHook(() => useComandos(channel, { onStart }));

    const payload: ComandoStartPayload = { inspection_id: 1, start_at: 123, seq: 1 };
    channel.emit('cmd.start', payload);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith(payload);
  });

  it('REGLA CRÍTICA: un seq repetido de la MISMA inspección no dispara onStart dos veces', () => {
    const channel = new FakeChannel();
    const onStart = jest.fn();
    renderHook(() => useComandos(channel, { onStart }));

    const payload: ComandoStartPayload = { inspection_id: 7, start_at: 999, seq: 1 };
    // Pusher redistribuye al reconectar: el mismo mensaje puede llegarle al
    // dispositivo más de una vez.
    channel.emit('cmd.start', payload);
    channel.emit('cmd.start', { ...payload });
    channel.emit('cmd.start', { ...payload });

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('el mismo seq (=1) de una inspección DISTINTA sí dispara onStart — seq es por-inspección, no un contador global', () => {
    // Ver docstring del módulo: el backend fija seq=1 para CUALQUIER
    // cmd.start, sin importar la inspección. Sin `inspection_id` en la clave
    // de dedupe, la segunda inspección jamás dispararía onStart.
    const channel = new FakeChannel();
    const onStart = jest.fn();
    renderHook(() => useComandos(channel, { onStart }));

    channel.emit('cmd.start', { inspection_id: 1, start_at: 100, seq: 1 });
    channel.emit('cmd.start', { inspection_id: 2, start_at: 200, seq: 1 });

    expect(onStart).toHaveBeenCalledTimes(2);
  });

  it('cmd.stop y cmd.abort se despachan a sus propios callbacks, sin cruzarse con cmd.start', () => {
    const channel = new FakeChannel();
    const onStart = jest.fn();
    const onStop = jest.fn();
    const onAbort = jest.fn();
    renderHook(() => useComandos(channel, { onStart, onStop, onAbort }));

    channel.emit('cmd.stop', { inspection_id: 1, seq: 2 });
    channel.emit('cmd.abort', { inspection_id: 2, seq: 2 });

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledWith({ inspection_id: 1, seq: 2 });
    expect(onAbort).toHaveBeenCalledTimes(1);
    expect(onAbort).toHaveBeenCalledWith({ inspection_id: 2, seq: 2 });
    expect(onStart).not.toHaveBeenCalled();
  });

  it('un seq repetido tampoco duplica cmd.stop/cmd.abort', () => {
    const channel = new FakeChannel();
    const onStop = jest.fn();
    renderHook(() => useComandos(channel, { onStop }));

    channel.emit('cmd.stop', { inspection_id: 1, seq: 2 });
    channel.emit('cmd.stop', { inspection_id: 1, seq: 2 });

    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('con channel=null, no explota y no bindea nada', () => {
    const onStart = jest.fn();
    expect(() => renderHook(() => useComandos(null, { onStart }))).not.toThrow();
  });

  it('sin callbacks (undefined), un comando no explota', () => {
    const channel = new FakeChannel();
    renderHook(() => useComandos(channel, {}));

    expect(() =>
      channel.emit('cmd.start', { inspection_id: 1, start_at: 1, seq: 1 })
    ).not.toThrow();
  });

  it('al desmontar, desbindea del canal — un evento tardío ya no dispara nada', () => {
    const channel = new FakeChannel();
    const onStart = jest.fn();
    const { unmount } = renderHook(() => useComandos(channel, { onStart }));

    unmount();
    channel.emit('cmd.start', { inspection_id: 1, start_at: 100, seq: 1 });

    expect(onStart).not.toHaveBeenCalled();
  });

  it('al cambiar de canal (reconexión completa), sigue dedupeando el mismo comando aunque cambie el objeto', () => {
    // La reconexión completa de pusher-js puede recrear el objeto `channel`
    // (identidad nueva). El Set de "vistos" vive fuera del efecto a
    // propósito: una redelivery tardía del comando viejo, sobre el canal
    // NUEVO, no debe volver a disparar onStart.
    const channelViejo = new FakeChannel();
    const onStart = jest.fn();
    const { rerender } = renderHook(({ channel }) => useComandos(channel, { onStart }), {
      initialProps: { channel: channelViejo as ComandoChannel | null },
    });

    const payload: ComandoStartPayload = { inspection_id: 5, start_at: 1, seq: 1 };
    channelViejo.emit('cmd.start', payload);
    expect(onStart).toHaveBeenCalledTimes(1);

    const channelNuevo = new FakeChannel();
    rerender({ channel: channelNuevo });

    channelNuevo.emit('cmd.start', { ...payload });
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
