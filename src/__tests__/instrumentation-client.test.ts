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
