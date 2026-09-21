/**
 * Fake de `RTCPeerConnection` para los tests de la transmisión en vivo.
 *
 * NO vive dentro de un `__tests__/` ni se llama `*.test.ts` por el mismo
 * motivo que `fakePusher.ts`: el `testMatch` de `jest.config.js` recoge
 * cualquier archivo dentro de `__tests__/`, y uno sin `describe`/`it`
 * rompería la corrida.
 *
 * No abre nada: el test dispara a mano los eventos que el código real
 * bindea (`icegatheringstatechange`, `iceconnectionstatechange`, `track`)
 * con `completarIce()`, `cambiarIce(...)` y `emit(...)`.
 */
type Listener = (...args: unknown[]) => void;

export class FakeRTCRtpSender {
  parametros: RTCRtpSendParameters = {
    encodings: [{}],
    transactionId: 'fake',
    codecs: [],
    headerExtensions: [],
    rtcp: {},
  } as unknown as RTCRtpSendParameters;

  constructor(public track: MediaStreamTrack) {}

  getParameters(): RTCRtpSendParameters {
    return this.parametros;
  }

  async setParameters(p: RTCRtpSendParameters): Promise<void> {
    this.parametros = p;
  }
}

export class FakeRTCPeerConnection {
  /** Cada instancia creada, para que el test agarre la última. */
  static instances: FakeRTCPeerConnection[] = [];

  iceGatheringState: RTCIceGatheringState = 'new';
  iceConnectionState: RTCIceConnectionState = 'new';
  localDescription: { type: string; sdp: string } | null = null;
  remoteDescription: { type: string; sdp: string } | null = null;
  cerrada = false;
  transceivers: Array<{ kind: string; direction: string }> = [];
  senders: FakeRTCRtpSender[] = [];

  private listeners: Record<string, Listener[]> = {};

  constructor(public config?: RTCConfiguration) {
    FakeRTCPeerConnection.instances.push(this);
  }

  addEventListener(evento: string, cb: Listener): void {
    (this.listeners[evento] ??= []).push(cb);
  }

  removeEventListener(evento: string, cb: Listener): void {
    this.listeners[evento] = (this.listeners[evento] ?? []).filter((l) => l !== cb);
  }

  /** Dispara un evento del peer a mano, desde el test. */
  emit(evento: string, ...args: unknown[]): void {
    (this.listeners[evento] ?? []).forEach((cb) => cb(...args));
  }

  addTransceiver(kind: string, init?: { direction?: string }) {
    const t = { kind, direction: init?.direction ?? 'sendrecv' };
    this.transceivers.push(t);
    return t;
  }

  addTrack(track: MediaStreamTrack): FakeRTCRtpSender {
    const sender = new FakeRTCRtpSender(track);
    this.senders.push(sender);
    return sender;
  }

  getSenders(): FakeRTCRtpSender[] {
    return this.senders;
  }

  async createOffer() {
    return { type: 'offer', sdp: 'SDP-OFFER' };
  }

  async createAnswer() {
    return { type: 'answer', sdp: 'SDP-ANSWER' };
  }

  async setLocalDescription(d: { type: string; sdp: string }): Promise<void> {
    this.localDescription = d;
  }

  async setRemoteDescription(d: { type: string; sdp: string }): Promise<void> {
    this.remoteDescription = d;
  }

  close(): void {
    this.cerrada = true;
  }

  /** Pasa el gathering a 'complete' y avisa, como haría el navegador. */
  completarIce(): void {
    this.iceGatheringState = 'complete';
    this.emit('icegatheringstatechange');
  }

  /** Cambia el estado de la conexión ICE y avisa. */
  cambiarIce(estado: RTCIceConnectionState): void {
    this.iceConnectionState = estado;
    this.emit('iceconnectionstatechange');
  }
}

/** Reemplaza el `RTCPeerConnection` global y limpia las instancias previas.
 * Llamalo en un `beforeEach`. */
export function instalarFakeRTC(): void {
  FakeRTCPeerConnection.instances = [];
  (globalThis as unknown as { RTCPeerConnection: unknown }).RTCPeerConnection =
    FakeRTCPeerConnection;
}

/** La última instancia creada. Lanza si no hay ninguna, para que el test
 * falle con un mensaje claro en vez de un `undefined` río abajo. */
export function ultimoPeer(): FakeRTCPeerConnection {
  const pc = FakeRTCPeerConnection.instances.at(-1);
  if (!pc) throw new Error('No se creó ningún RTCPeerConnection');
  return pc;
}
