/**
 * Una sola sesión de tracking por solicitud, de la entrada a la confirmación.
 *
 * El bug: al enviar la solicitud, `useSubmitApplication` llamaba `clearSession()`
 * junto con el resto de la limpieza del wizard. Eso borraba el uuid de
 * localStorage ANTES de navegar a `/solicitar/confirmacion`, así que el
 * `SessionProvider` del layout de la landing no encontraba nada y abría una fila
 * de `session` nueva. Resultado, en TODA solicitud —no sólo las de activación—:
 *
 *   - la sesión que convierte lleva `application_id` y nunca ve el submit;
 *   - la sesión que emite `application_submitted` nace después y queda con
 *     `application_id` en NULL.
 *
 * Los dos conjuntos son disjuntos y nadie los une. Ahora la sesión se MARCA como
 * convertida en vez de borrarse, y sólo se suelta cuando alguien arranca otra
 * solicitud (al entrar de nuevo al subárbol de `/solicitar`).
 */
import { render, waitFor, act } from '@testing-library/react';
import { SessionProvider, useSession, clearSessionStorage } from '../SessionContext';

const SESSION_KEY = 'baldecash-ucv-wizard-session-uuid';
const CONVERTED_KEY = 'baldecash-ucv-wizard-session-converted';

let api: ReturnType<typeof useSession>;

function Sonda() {
  api = useSession();
  return null;
}

async function montarSesion() {
  render(
    <SessionProvider landingSlug="ucv">
      <Sonda />
    </SessionProvider>
  );
  await waitFor(() => expect(api?.sessionUuid).toBeTruthy());
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  let n = 0;
  global.fetch = jest.fn(() => {
    n += 1;
    return Promise.resolve({
      ok: true,
      // El backend devuelve el uuid que le mandan (es idempotente por uuid),
      // así que acá basta con distinguir la primera sesión de la segunda.
      json: () => Promise.resolve({ session_uuid: `u-${n}`, session_id: n }),
    });
  }) as unknown as typeof fetch;
});

it('marcar la sesión como convertida NO la suelta: confirmación sigue en la misma', async () => {
  await montarSesion();
  const uuid = api.sessionUuid;

  act(() => api.marcarSesionConvertida());

  // El evento `application_submitted` de la confirmación lee este mismo valor.
  expect(localStorage.getItem(SESSION_KEY)).toBe(uuid);
  expect(api.sessionUuid).toBe(uuid);
  expect(localStorage.getItem(CONVERTED_KEY)).toBe(uuid);
});

it('arrancar otra solicitud sobre una sesión ya convertida abre una nueva', async () => {
  await montarSesion();
  const primera = api.sessionUuid;
  act(() => api.marcarSesionConvertida());

  let roto = false;
  act(() => {
    roto = api.renovarSesionSiConvertida();
  });

  expect(roto).toBe(true);
  // La marca se suelta con la sesión: no puede volver a disparar.
  expect(localStorage.getItem(CONVERTED_KEY)).toBeNull();
  await waitFor(() => expect(api.sessionUuid).toBeTruthy());
  expect(api.sessionUuid).not.toBe(primera);
});

it('sin solicitud enviada no renueva nada', async () => {
  await montarSesion();
  const uuid = api.sessionUuid;

  let roto = true;
  act(() => {
    roto = api.renovarSesionSiConvertida();
  });

  expect(roto).toBe(false);
  expect(api.sessionUuid).toBe(uuid);
});

it('si la sesión ya se renovó por otra vía, la marca vieja sólo se descarta', async () => {
  await montarSesion();
  act(() => api.marcarSesionConvertida());

  // El reset del activador / el cambio de link de promotora ya soltaron la
  // sesión y nació otra. La marca de la anterior no debe tirar ésta.
  localStorage.setItem(SESSION_KEY, 'otra-sesion');

  let roto = true;
  act(() => {
    roto = api.renovarSesionSiConvertida();
  });

  expect(roto).toBe(false);
  expect(localStorage.getItem(SESSION_KEY)).toBe('otra-sesion');
  expect(localStorage.getItem(CONVERTED_KEY)).toBeNull();
});

it('clearSessionStorage también borra la marca de convertida', async () => {
  localStorage.setItem(SESSION_KEY, 'u-1');
  localStorage.setItem(CONVERTED_KEY, 'u-1');

  clearSessionStorage('ucv');

  // Sin esto, la sesión que nace después del reset heredaría la marca de la
  // anterior y se renovaría de nuevo en la primera solicitud.
  expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  expect(localStorage.getItem(CONVERTED_KEY)).toBeNull();
});
