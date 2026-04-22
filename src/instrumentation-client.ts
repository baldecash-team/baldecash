// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://89b76047709a0b3fe7c9bff6c5b221e7@o4504769499561984.ingest.us.sentry.io/4511120032333824",

  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: 1,
  enableLogs: true,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: true,

  ignoreErrors: [
    // Instagram / Facebook / TikTok in-app browsers inject scripts that probe
    // window.webkit.messageHandlers to talk to the native WebView bridge.
    // Not actionable from our side.
    /window\.webkit\.messageHandlers/i,
    /undefined is not an object \(evaluating 'window\.webkit/i,
    // Common third-party / noise
    "Non-Error promise rejection captured",
    "Non-Error exception captured",
    "ResizeObserver loop",
    "Loading chunk",
    "ChunkLoadError",
    /Failed to load chunk/,
    /^Script error\.?$/,
    /can't redefine non-configurable property/i,
  ],

  denyUrls: [
    // Chatbots / widgets
    /cdn\.botpress\./,
    /widget\.intercom\./,
    /js\.driftt\./,
    /embed\.tawk\./,
    /crisp\.chat/,
    /livechatinc\.com/,
    /tidio\.co/,
    /cliengo\./,
    // Analytics & ads
    /google-analytics\.com/,
    /googletagmanager\.com/,
    /facebook\.net/,
    /hotjar\.com/,
    // Browser extensions
    /extensions\//,
    /^chrome:\/\//,
    /^moz-extension:\/\//,
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
