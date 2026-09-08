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

  // 2026-09-08 — control de cuota. Medicion del periodo Ago 20 - Sep 19 sobre
  // la org entera: spans 723% del plan, replays 16 532%, logs 304%. Este
  // archivo era el mayor aportante de dos de esos tres numeros.
  //
  // tracesSampleRate: 1 trazaba el 100% de las sesiones de www.baldecash.com,
  // y cada sesion emite un span por script, imagen, navegacion y
  // long-animation-frame: 12,2M de spans en 30 dias (7% del consumo de la org)
  // para medir la red del visitante. Con este volumen de trafico, 2% deja
  // muestra de sobra para p75/p95 de Web Vitals.
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES ?? 0.02),
  enableLogs: true,

  // replaysSessionSampleRate: 0.1 grababa entera 1 de cada 10 sesiones sanas:
  // 8 266 replays contra un plan de 50/mes (16 532%). El valor de un replay
  // esta en la sesion que reventó, no en las nueve que anduvieron bien — esas
  // ya se miden con analytics. Con 0 + onError 1.0 se sigue teniendo el replay
  // COMPLETO de toda sesion con error: el SDK mantiene el buffer en memoria y
  // recien lo sube cuando algo falla. Mismo criterio que ya usa el portal de
  // promotores (activaciones-hub).
  replaysSessionSampleRate: 0,
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
