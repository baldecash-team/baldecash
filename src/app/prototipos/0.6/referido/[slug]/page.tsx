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
 * En su lugar, el middleware manda acá SÓLO las URLs que traen `?promotor=` o `?ref=`.
 * El tráfico orgánico nunca toca este archivo y sigue saliendo del CDN; el
 * referido paga un render y a cambio recibe la franja ya en el HTML, sin el
 * salto de layout de resolverla después de pintar.
 *
 * La URL del navegador no cambia: el middleware reescribe, no redirige. Quien
 * abre `/upn?promotor=jperez&...` sigue viendo `/upn?promotor=jperez&...`.
 */

import type { Metadata } from 'next';

import { LandingPageClient } from '../../[[...slug]]/LandingPageClient';
import { getLandingMeta, fetchHeroData } from '../../services/landingApi';
import { fetchLandingConfig } from '../../services/landingConfigApi';
import { fetchReferralBanner, fetchReferralBannerByRef } from '../../services/referralBannerApi';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** `?a=1&a=2` llega como array; para estos parámetros vale el primero. */
function primerValor(valor: string | string[] | undefined): string | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

/**
 * La franja, venga por donde venga el identificador.
 *
 * `promotor` primero: es el `Promoter.code` de ws2 y trae el teléfono, o sea la
 * versión de la franja con el chip de WhatsApp. `ref` es el respaldo —resuelve
 * contra el hub y sólo devuelve el nombre— pero es el ÚNICO que viaja siempre,
 * así que sin él la mayoría de los flyers no pinta nada.
 *
 * Secuencial y no en paralelo a propósito: un link normal trae uno solo de los
 * dos, y cuando trae los dos el de ws2 gana. Pedir el otro igual sería un
 * round-trip contra otro dominio dentro del render de la página que convierte.
 */
async function resolverFranja(
  promotor: string | null,
  utmTerm: string | null,
  ref: string | null,
) {
  const porPromotor = await fetchReferralBanner(promotor, utmTerm);
  if (porPromotor) return porPromotor;
  return fetchReferralBannerByRef(ref);
}

export default async function LandingConReferidoPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const [initialData, landingConfig, referralBanner] = await Promise.all([
    fetchHeroData(slug),
    fetchLandingConfig(slug),
    // Nunca lanza: ante cualquier problema devuelve null y la landing carga
    // sin franja. Ver `referralBannerApi`.
    resolverFranja(primerValor(query.promotor), primerValor(query.utm_term), primerValor(query.ref)),
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
    // La variante con `?promotor=` / `?ref=` no se indexa: es la misma landing
    // con el nombre de una promotora encima, y no tiene por qué terminar en un
    // resultado de búsqueda. La versión limpia (`/upn`) se sigue indexando
    // normal desde `[[...slug]]`.
    robots: { index: false, follow: true },
  };
}
