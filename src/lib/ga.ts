/**
 * Identificador de medición de GA4.
 *
 * Vive acá y no en `app/layout.tsx` porque lo necesitan dos lugares: el
 * snippet que carga `gtag.js` y el puente que fija el id de sesión como
 * `user_id` de la propiedad. Duplicar la variable de entorno en ambos hace que
 * un cambio se aplique en uno solo y el puente apunte a otra propiedad.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
