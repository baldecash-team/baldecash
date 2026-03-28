import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://89b76047709a0b3fe7c9bff6c5b221e7@o4504769499561984.ingest.us.sentry.io/4511120032333824",
  tracesSampleRate: 1,
  debug: false,
});
