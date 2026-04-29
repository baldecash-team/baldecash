// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Fixes BALDECASH3-1, BALDECASH3-2: blip-chat-widget keeps a window 'resize'
// listener attached after the React component unmounts on route transitions,
// firing TypeError: Cannot read properties of null (reading 'style') at every
// resize. We don't control the third-party script, so we drop its events.
const THIRD_PARTY_NOISE_PATTERN = /blip-chat-widget|baldecash\.chat\.blip\.ai/i;

Sentry.init({
  dsn: "https://89b76047709a0b3fe7c9bff6c5b221e7@o4504769499561984.ingest.us.sentry.io/4511120032333824",

  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: 1,
  enableLogs: true,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: true,

  beforeSend(event) {
    const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
    for (const frame of frames) {
      const url = frame.filename || frame.abs_path || "";
      if (THIRD_PARTY_NOISE_PATTERN.test(url)) return null;
    }
    return event;
  },

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
    /blip-chat-widget/,
    /baldecash\.chat\.blip\.ai/,
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
