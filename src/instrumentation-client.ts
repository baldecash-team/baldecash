// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Fixes BALDECASH3-1, BALDECASH3-2: blip-chat-widget keeps a window 'resize'
// listener attached after the React component unmounts on route transitions,
// firing TypeError: Cannot read properties of null (reading 'style') at every
// resize. We don't control the third-party script, so we drop its events.
const THIRD_PARTY_NOISE_PATTERN = /blip-chat-widget|baldecash\.chat\.blip\.ai/i;

// Fixes BALDECASH3-52: los navegadores in-app (Facebook, Instagram) inyectan
// scripts en el WebView bajo el esquema app://, p.ej.
// app://navigation_performance_logger_android, que engancha beforeunload y
// habla con el codigo nativo por postMessage. Cuando ese puente falla lanza
// desde SU stack, no del nuestro. denyUrls solo mira el ultimo frame, asi que
// escaneamos todos los frames. Nuestro bundle siempre se sirve por https.
const INJECTED_WEBVIEW_SCRIPT_PATTERN = /^app:\/\//i;

/** Drops events whose stacktrace touches a third-party or WebView-injected script. */
export function filterThirdPartyEvent<T extends Sentry.ErrorEvent>(event: T): T | null {
  const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
  for (const frame of frames) {
    const url = frame.filename || frame.abs_path || "";
    if (THIRD_PARTY_NOISE_PATTERN.test(url)) return null;
    if (INJECTED_WEBVIEW_SCRIPT_PATTERN.test(url)) return null;
  }
  return event;
}

Sentry.init({
  dsn: "https://89b76047709a0b3fe7c9bff6c5b221e7@o4504769499561984.ingest.us.sentry.io/4511120032333824",

  // No reportar desde desarrollo: `npm run dev` de cualquier maquina ensuciaba
  // el proyecto de Sentry con errores locales, indistinguibles de los de
  // produccion. El DSN esta hardcodeado (no sale del .env), asi que ninguna
  // variable de entorno lo apagaba: el gate tiene que estar aca.
  enabled: process.env.NODE_ENV === "production",


  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: 1,
  enableLogs: true,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: true,

  beforeSend: filterThirdPartyEvent,

  ignoreErrors: [
    // Instagram / Facebook / TikTok in-app browsers inject scripts that probe
    // window.webkit.messageHandlers to talk to the native WebView bridge.
    // Not actionable from our side.
    /window\.webkit\.messageHandlers/i,
    /undefined is not an object \(evaluating 'window\.webkit/i,
    // Fixes BALDECASH3-4Z, BALDECASH3-38, BALDECASH3-3A, BALDECASH3-4G:
    // navegadores in-app de Android inyectan scripts en el WebView (autofill,
    // logging de teclado, puente postMessage nativo) via addJavascriptInterface.
    // Cuando el objeto Java detras del puente ya fue recolectado o el WebView se
    // destruyo, la llamada inyectada lanza. Ningun frame es de nuestro bundle:
    // Sentry solo los ve porque browserApiErrors envuelve addEventListener.
    // denyUrls no aplica, el script inyectado no tiene filename (<anonymous>).
    /Java object is gone/i,
    /Java exception was raised during method invocation/i,
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
