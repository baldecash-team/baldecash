// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://89b76047709a0b3fe7c9bff6c5b221e7@o4504769499561984.ingest.us.sentry.io/4511120032333824",

  // No reportar desde desarrollo: `npm run dev` de cualquier maquina ensuciaba
  // el proyecto de Sentry con errores locales, indistinguibles de los de
  // produccion. El DSN esta hardcodeado (no sale del .env), asi que ninguna
  // variable de entorno lo apagaba: el gate tiene que estar aca.
  enabled: process.env.NODE_ENV === "production",


  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
