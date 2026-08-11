import {
  getDeviceSession, setDeviceSession, clearDeviceSession, getOrCreateDeviceId,
} from '../deviceSession';

describe('deviceSession', () => {
  beforeEach(() => localStorage.clear());

  it('devuelve null cuando el dispositivo no está vinculado', () => {
    expect(getDeviceSession()).toBeNull();
  });

  it('persiste y recupera la sesión', () => {
    setDeviceSession({
      deviceId: 'dev-01', token: 'tok', stationId: 'est-01',
      kind: 'camara', label: 'techo',
    });
    expect(getDeviceSession()?.label).toBe('techo');
  });

  it('devuelve null si lo guardado está corrupto, sin lanzar', () => {
    localStorage.setItem('inspeccion.device', '{no es json');
    expect(getDeviceSession()).toBeNull();
  });

  it('clear borra la sesión', () => {
    setDeviceSession({
      deviceId: 'dev-01', token: 'tok', stationId: 'est-01',
      kind: 'camara', label: 'techo',
    });
    clearDeviceSession();
    expect(getDeviceSession()).toBeNull();
  });

  it('getOrCreateDeviceId es estable entre llamadas', () => {
    const a = getOrCreateDeviceId();
    expect(getOrCreateDeviceId()).toBe(a);
    expect(a.length).toBeGreaterThan(8);
  });
});
