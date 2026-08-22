/**
 * Landing con franja de referido — gemela dinámica de `[[...slug]]/page.tsx`.
 *
 * Por qué existe una ruta aparte en vez de leer `searchParams` en la landing
 * normal: la landing es la página de más tráfico del negocio y hoy se sirve
 * estática (ISR de 60 s, `generateStaticParams` la pre-genera). Leer
 * `searchParams` en ese archivo la convertiría, para TODO el tráfico, en un
 * render por request — cambiar el TTFB de la página que convierte para pintarle
 * una franja al 1% de las visitas es exactamente lo que el diseño quería evitar.
 *
 * En su lugar, el middleware manda acá SÓLO las URLs cuyo `utm_term` trae un
 * `__promo_`, que son las que vienen de un link de activación.
 * El tráfico orgánico nunca toca este archivo y sigue saliendo del CDN; el
 * referido paga un render y a cambio recibe la franja ya en el HTML, sin el
 * salto de layout de resolverla después de pintar.
 *
 * La URL del navegador no cambia: el middleware reescribe, no redirige. Quien
 * abre `/wiener?utm_term=punto_x__promo_cmtgbr__act_y` sigue viendo eso mismo.
 */

import type { Metadata } from 'next';

import { LandingPageClient } from '../../[[...slug]]/LandingPageClient';
import { getLandingMeta, fetchHeroData } from '../../services/landingApi';
import { fetchLandingConfig } from '../../services/landingConfigApi';
import { fetchReferralBanner } from '../../services/referralBannerApi';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** `?a=1&a=2` llega como array; para estos parámetros vale el primero. */
function primerValor(valor: string | string[] | undefined): string | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

export default async function LandingConReferidoPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const [initialData, landingConfig, referralBanner] = await Promise.all([
    fetchHeroData(slug),
    fetchLandingConfig(slug),
    // Nunca lanza: ante cualquier problema devuelve null y la landing carga
    // sin franja. Ver `referralBannerApi`.
    fetchReferralBanner(primerValor(query.utm_term)),
  ]);

  return (
    <LandingPageClient
      slug={slug}
      initialData={initialData}
      landingConfig={landingConfig}
      referralBanner={referralBanner}
    />
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getLandingMeta(slug);

  return {
    title: meta?.meta_title || `BaldeCash - ${slug === 'home' ? 'Tu laptop para estudiar' : slug}`,
    description:
      meta?.meta_description ||
      'Financiamiento de laptops para estudiantes. Sin historial crediticio.',
    // La variante con referido no se indexa: es la misma landing con el
    // teléfono de una promotora encima, y no tiene por qué terminar en un
    // resultado de búsqueda. La versión limpia (`/wiener`) se sigue indexando
    // normal desde `[[...slug]]`.
    robots: { index: false, follow: true },
  };
}
