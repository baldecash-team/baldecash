/**
 * Mock mínimo de `pusher-js` para tests de `usePresenceChannel` y las
 * páginas que lo consumen.
 *
 * NO vive dentro de un `__tests__/` ni se llama `*.test.ts`/`*.spec.ts` a
 * propósito: el `testMatch` de `jest.config.js` recoge cualquier archivo
 * dentro de `__tests__/`, y un archivo sin ningún `describe`/`it` ahí
 * rompería la corrida ("Your test suite must contain at least one test").
 *
 * No abre sockets reales: `channel.emit(...)` / `pusher.connection.emit(...)`
 * disparan a mano los eventos que el hook real bindea
 * (`pusher:subscription_succeeded`, `pusher:subscription_error`,
 * `pusher:member_added`, `pusher:member_removed`, `state_change`).
 * `FakePusher.instances` guarda cada instancia creada para que el test
 * pueda agarrar la última y emitir eventos sobre ella.
 */
type Handler = (...args: unknown[]) => void;

class FakeEmitter {
  private handlers: Record<string, Handler[]> = {};

  bind(event: string, cb: Handler): void {
    (this.handlers[event] ??= []).push(cb);
  }

  /**
   * Simétrico a `bind`: saca ESE callback de la lista de ESE evento.
   *
   * Sin esto, `channel.unbind?.(...)` (lo que llaman `bindSenales`,
   * `useTransmisionEmisor` y `useComandos` al desmontarse) es un no-op
   * silencioso contra este fake — el optional chaining nunca explota porque
   * el método simplemente no existía, así que ningún test lo notaba. El
   * síntoma real: los listeners de un componente ya desmontado (de un test
   * ANTERIOR) seguían vivos en el objeto de canal para siempre, y un test
   * siguiente que emitía sobre el mismo canal podía disparar el handler
   * viejo — un test podía pasar por estar reaccionando al componente
   * equivocado, no al que acababa de renderizar.
   */
  unbind(event: string, cb: Handler): void {
    this.handlers[event] = (this.handlers[event] ?? []).filter((h) => h !== cb);
  }

  emit(event: string, ...args: unknown[]): void {
    (this.handlers[event] ?? []).forEach((cb) => cb(...args));
  }
}

export class FakeChannel extends FakeEmitter {
  members = { each: jest.fn() };
}

export class FakePusher {
  static instances: FakePusher[] = [];

  connection = new FakeEmitter();
  channel = new FakeChannel();

  constructor(
    public key: string,
    public options: unknown
  ) {
    FakePusher.instances.push(this);
  }

  subscribe(): FakeChannel {
    return this.channel;
  }

  unsubscribe(): void {}

  disconnect(): void {}
}
