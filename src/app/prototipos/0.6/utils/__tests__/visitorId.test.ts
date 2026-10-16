/**
 * Código de visitante: une las visitas del mismo navegador y se reinicia
 * cuando el equipo cambia de manos (tablets de los stands).
 */
import { obtenerCodigoDeVisitante, reiniciarCodigoDeVisitante } from '../visitorId';
import {
  clearLandingClientData,
  resetLandingSessionIfIdentityChanged,
  resetLandingSessionIfPromoterLinkChanged,
} from '../landingSession';

const KEY = 'baldecash-visitor-id';
const LANDING = 'ucv';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const linkConRef = (ref: string) =>
  `?utm_source=qr&utm_term=punto_lima-norte__promo_1vlqax8__act_1odsq6r&ref=${ref}`;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('obtenerCodigoDeVisitante', () => {
  it('crea un código al azar la primera vez y lo guarda', () => {
    const codigo = obtenerCodigoDeVisitante();

    expect(codigo).toMatch(UUID);
    expect(localStorage.getItem(KEY)).toBe(codigo);
  });

  it('devuelve el mismo código en las visitas siguientes', () => {
    const lunes = obtenerCodigoDeVisitante();
    const jueves = obtenerCodigoDeVisitante();

    expect(jueves).toBe(lunes);
  });

  it('cabe en session.fingerprint_hash (máx. 64)', () => {
    expect(obtenerCodigoDeVisitante()!.length).toBeLessThanOrEqual(64);
  });

  it('sin storage devuelve null en vez de un código distinto por carga', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(obtenerCodigoDeVisitante()).toBeNull();
    spy.mockRestore();
  });

  it('tras reiniciar, la próxima visita estrena código', () => {
    const anterior = obtenerCodigoDeVisitante();

    reiniciarCodigoDeVisitante();

    expect(obtenerCodigoDeVisitante()).not.toBe(anterior);
  });
});

describe('reinicio cuando el equipo cambia de manos', () => {
  it('el link de otra promotora en el mismo equipo estrena código', () => {
    resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef('aaaaaa'));
    const alumnoDeA = obtenerCodigoDeVisitante();

    resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef('bbbbbb'));

    expect(localStorage.getItem(KEY)).toBeNull();
    expect(obtenerCodigoDeVisitante()).not.toBe(alumnoDeA);
  });

  it('el mismo link abierto de nuevo conserva el código', () => {
    resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef('aaaaaa'));
    const codigo = obtenerCodigoDeVisitante();

    resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef('aaaaaa'));

    expect(localStorage.getItem(KEY)).toBe(codigo);
  });

  it('otra persona que se identifica estrena código', () => {
    localStorage.setItem(`baldecash-dni-${LANDING}`, '73941627');
    obtenerCodigoDeVisitante();

    resetLandingSessionIfIdentityChanged(LANDING, '45678912');

    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('la misma persona que se vuelve a identificar conserva el código', () => {
    localStorage.setItem(`baldecash-dni-${LANDING}`, '73941627');
    const codigo = obtenerCodigoDeVisitante();

    resetLandingSessionIfIdentityChanged(LANDING, '73941627');

    expect(localStorage.getItem(KEY)).toBe(codigo);
  });

  it('la primera identificación (sin DNI previo) conserva el código, igual que la sesión', () => {
    const codigo = obtenerCodigoDeVisitante();

    resetLandingSessionIfIdentityChanged(LANDING, '73941627');

    expect(localStorage.getItem(KEY)).toBe(codigo);
  });

  it('el cambio de identidad del ?vip_auto= estrena código', () => {
    obtenerCodigoDeVisitante();

    clearLandingClientData(LANDING);

    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
