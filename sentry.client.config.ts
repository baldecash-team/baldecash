import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://89b76047709a0b3fe7c9bff6c5b221e7@o4504769499561984.ingest.us.sentry.io/4511120032333824",
  integrations: [
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  debug: false,

  // Ignore errors from third-party scripts (chatbots, widgets, etc.)
  ignoreErrors: [
    // Common third-party chatbot/widget errors
    "Non-Error promise rejection captured",
    "Non-Error exception captured",
    "ResizeObserver loop",
    "Loading chunk",
    "ChunkLoadError",
    // Generic third-party patterns
    /^Script error\.?$/,
    /can't redefine non-configurable property/i,
  ],

  // Only capture errors from our own code
  allowUrls: [
    /baldecash\.com/,
    /demo\.baldecash\.com/,
    /vercel\.app/,
    /localhost/,
  ],

  // Ignore errors from third-party domains
  denyUrls: [
    // Chatbot providers
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

  beforeSend(event) {
    // Drop events without a stacktrace from our code
    const frames = event.exception?.values?.[0]?.stacktrace?.frames;
    if (frames && frames.length > 0) {
      const hasOurCode = frames.some(
        (f) => f.filename && (
          f.filename.includes('baldecash') ||
          f.filename.includes('localhost') ||
          f.filename.includes('vercel')
        )
      );
      if (!hasOurCode) return null;
    }
    return event;
  },
});
