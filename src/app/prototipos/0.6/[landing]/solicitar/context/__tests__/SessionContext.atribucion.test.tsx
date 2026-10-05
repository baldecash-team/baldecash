/**
 * La sesión nace con la atribución con la que entró la visita, no con la que
 * quede en la URL del momento.
 *
 * El bug: `getUtmParams` leía los 5 UTMs y `promotor` SÓLO de
 * `window.location.search`. La navegación interna arma URLs limpias
 * (`routes.catalogo()`), así que toda sesión creada fuera de la landing nacía
 * con la atribución en null — y la solicitud copia la de la sesión que la
 * envía. Un QR de activación escaneado en el stand terminaba sin promotor.
 *
 * `ref` era el único parámetro con respaldo. Estos tests fijan que los demás
 * también lo tengan.
 */
import { render } from '@testing-library/react';
import { SessionProvider } from '../SessionContext';
import { persistUtmParams } from '@/app/prototipos/0.6/utils/utmParams';

const QR = '?utm_campaign=activacion_ucv_2026_09&utm_source=qr&utm_medium=offline'
  + '&utm_term=punto_los-olivos__promo_1ntiunb__act_pp9lxl&promotor=jperez';

function navegarA(url: string) {
  window.history.replaceState(null, '', url);
}

/** El cuerpo del `POST /public/tracking/session`. */
function payloadDelFetch(): Record<string, unknown> {
  const llamada = (global.fetch as jest.Mock).mock.calls[0];
  return JSON.parse((llamada[1] as RequestInit).body as string);
}

async function montarSesion() {
  render(<SessionProvider landingSlug="ucv">{null}</SessionProvider>);
  // createSession corre en un efecto; esperar a que dispare el fetch.
  const { waitFor } = await import('@testing-library/react');
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ session_uuid: 'u-1', session_id: 1 }),
    })
  ) as unknown as typeof fetch;
});

it('manda la atribución guardada cuando la URL ya no la trae', async () => {
  // La visita entra por el QR en la landing…
  navegarA(`/ucv/${QR}`);
  persistUtmParams();
  // …y toca catálogo, cuyo link se arma sin querystring.
  navegarA('/ucv/catalogo/');

  await montarSesion();

  const payload = payloadDelFetch();
  expect(payload.utm_term).toBe('punto_los-olivos__promo_1ntiunb__act_pp9lxl');
  expect(payload.utm_campaign).toBe('activacion_ucv_2026_09');
  expect(payload.utm_source).toBe('qr');
  // `promotor` es la llave real del promotor en ws2 (`_apply_promoter` no mira
  // el `promo_` del término), así que es el que más importa que sobreviva.
  expect(payload.promotor).toBe('jperez');
});

it('la URL gana sobre lo guardado: una campaña nueva no hereda la anterior', async () => {
  navegarA(`/ucv/${QR}`);
  persistUtmParams();
  navegarA('/ucv/?utm_campaign=meta_septiembre&utm_source=meta');

  await montarSesion();

  const payload = payloadDelFetch();
  expect(payload.utm_campaign).toBe('meta_septiembre');
  expect(payload.utm_term).toBeUndefined();
});

it('sin nada guardado ni en la URL no inventa atribución', async () => {
  navegarA('/ucv/catalogo/');

  await montarSesion();

  const payload = payloadDelFetch();
  expect(payload.utm_term).toBeUndefined();
  expect(payload.promotor).toBeUndefined();
});
