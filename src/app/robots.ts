import type { MetadataRoute } from 'next';

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://baldecash.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // `/*/solicitar/`: BAL-4188 (Task 10). Es el link del flujo de
        // solicitud (formulario, KYC, confirmación) — llega por WhatsApp o
        // correo, no por buscador (8 entradas con referrer de Google en 30
        // días, medido el 27-sep). El `*` cubre cualquier slug de landing.
        disallow: [
          '/api/', '/sentry-example-page/', '/monitoring/', '/_next/', '/*/solicitar/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
