/**
 * Regresión de ruido de Sentry filtrado en el cliente.
 *
 * Sentry.init() corre como side effect al importar instrumentation-client,
 * asi que mockeamos el SDK: solo queremos ejercitar el filtro de eventos.
 */
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  replayIntegration: jest.fn(() => ({ name: 'Replay' })),
  captureRouterTransitionStart: jest.fn(),
}));

import type { ErrorEvent } from '@sentry/nextjs';
import { filterThirdPartyEvent } from '../instrumentation-client';

const eventWithFrames = (filenames: string[]): ErrorEvent =>
  ({
    exception: {
      values: [
        {
          type: 'Error',
          value: 'boom',
          stacktrace: { frames: filenames.map((filename) => ({ filename })) },
        },
      ],
    },
  }) as unknown as ErrorEvent;

describe('filterThirdPartyEvent', () => {
  it('descarta BALDECASH3-52: postMessage del logger inyectado por el navegador in-app de Facebook', () => {
    // Frames reales del evento 46128c798d9d436495ae0d8f62a5342b (Android 15, Facebook 568.0.0).
    const event = eventWithFrames([
      'node_modules/@sentry/browser/src/helpers.ts',
      'node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.production.js',
      'src/app/prototipos/0.6/[landing]/producto/components/detail/similar/SimilarProducts.tsx',
      'app://navigation_performance_logger_android',
    ]);

    expect(filterThirdPartyEvent(event)).toBeNull();
  });

  it('descarta el ruido del widget de chat de Blip', () => {
    expect(
      filterThirdPartyEvent(eventWithFrames(['https://baldecash.chat.blip.ai/blip-chat-widget.js']))
    ).toBeNull();
  });

  it('conserva los errores propios servidos desde nuestro dominio', () => {
    const event = eventWithFrames([
      'https://www.baldecash.com/_next/static/chunks/main.js',
      'src/app/prototipos/0.6/[landing]/producto/components/detail/similar/SimilarProducts.tsx',
    ]);

    expect(filterThirdPartyEvent(event)).toBe(event);
  });

  it('conserva los eventos sin stacktrace', () => {
    const event = { message: 'algo paso' } as unknown as ErrorEvent;
    expect(filterThirdPartyEvent(event)).toBe(event);
  });
});

/**
 * BAL-4348 — los ReferenceError del JavaScript que inyecta el WebView.
 *
 * Estos NO los puede filtrar `filterThirdPartyEvent`: el script inyectado no
 * tiene filename (el stack es `<anonymous>`), asi que no hay URL que mirar.
 * Van por `ignoreErrors`, que el SDK aplica sobre el MENSAJE. El test lee la
 * config que recibio `Sentry.init` y comprueba que los mensajes reales casan.
 */
describe('ignoreErrors: ruido de WebViews inyectados (BAL-4348)', () => {
  const patronesDe = (): Array<string | RegExp> => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    const config = (Sentry.init as jest.Mock).mock.calls[0]?.[0] ?? {};
    return config.ignoreErrors ?? [];
  };

  const casa = (mensaje: string): boolean =>
    patronesDe().some((p) => (typeof p === 'string' ? mensaje.includes(p) : p.test(mensaje)));

  it.each([
    // Mensajes exactos de BALDECASH3-2R (446 eventos) y 2S (202), ambos con
    // ~99% de los eventos en Chrome Mobile WebView.
    'swbrowser is not defined',
    'xbrowser is not defined',
    // BALDECASH3-5J, el mismo patron con otra variable.
    'onWebLoad is not defined',
  ])('descarta "%s"', (mensaje) => {
    expect(casa(mensaje)).toBe(true);
  });

  it('NO descarta un ReferenceError de nuestro propio codigo', () => {
    // La red de seguridad: los patrones son por nombre de variable, no por
    // "is not defined" a secas. Si alguien los generalizara, este test cae.
    expect(casa('productoSeleccionado is not defined')).toBe(false);
    expect(casa('fetchLandingConfig is not defined')).toBe(false);
  });
});
