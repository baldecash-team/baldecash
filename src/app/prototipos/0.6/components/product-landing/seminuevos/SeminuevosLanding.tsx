'use client';

import { useEffect } from 'react';
import { Baloo_2 } from 'next/font/google';
import { Navbar } from '../../hero/Navbar';
import { Footer } from '../../hero/Footer';
import { SeminuevosHero } from './SeminuevosHero';
import { SeminuevosInspector } from './SeminuevosInspector';
import { SeminuevosProceso } from './SeminuevosProceso';
import { SeminuevosAbout } from './SeminuevosAbout';
import { SeminuevosFaq } from './SeminuevosFaq';
import { SeminuevosWhatsapp } from './SeminuevosWhatsapp';
import { routes } from '../../../utils/routes';
import { LANDING_IDS } from '../../../utils/landingIds';
import { navItems } from './data/seminuevosData';
import type { FooterData, PromoBannerData, FaqData } from '../../../types/hero';

const SECTION_IDS = navItems.map((item) => item.sectionId);

/**
 * Intercepta los clics del menú de navegación para hacer scroll suave a las
 * secciones de esta misma página.
 *
 * El Navbar compartido arma el href de cada item como `{heroUrl}#seccion`
 * (heroUrl = /prototipos/0.6/{landing}) y solo intercepta el click con
 * preventDefault si `window.location.pathname` coincide con esa ruta. En
 * `/preview/{id}` el pathname es distinto del heroUrl de la landing, así
 * que esa comparación falla y el click navegaría de verdad fuera del
 * preview en vez de scrollear. No se puede tocar Navbar.tsx (lo comparten
 * todas las landings), así que se agrega acá una segunda capa de
 * intercepción por delegación en document, que solo mira el hash del href
 * (no la ruta completa) y por eso funciona igual en la landing real y en
 * el preview.
 */
function useSectionScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return; // el Navbar ya lo resolvió (misma ruta): no duplicar el scroll
      const anchor = (e.target as HTMLElement).closest('a[href*="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute('href')?.split('#')[1];
      if (!hash || !SECTION_IDS.includes(hash as (typeof SECTION_IDS)[number])) return;
      const el = document.getElementById(hash);
      if (!el) return;
      e.preventDefault();
      const scroll = () =>
        el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      // En mobile el click también cierra el menú hamburguesa (colapso animado
      // por Framer Motion). Si el scroll suave arranca en el mismo tick, ese
      // cambio de layout lo corta a mitad de camino y la página se queda
      // donde estaba. Un frame de margen alcanza para que el layout del menú
      // se asiente antes de empezar el scroll.
      requestAnimationFrame(() => requestAnimationFrame(scroll));
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

/**
 * Suaviza la LLEGADA a la página con un hash (`/reacondicionados#que-es`).
 *
 * `useSectionScroll` solo cubre los clics dentro de esta misma página. Cuando
 * se entra desde otra ruta --el banner del catálogo, por ejemplo-- el que
 * scrollea es el navegador, de golpe y antes de que las secciones tengan su
 * alto final: se aterriza en un salto seco y a veces en el sitio equivocado,
 * porque las imágenes de abajo aún no cargaron y el layout se mueve después.
 *
 * Se anula ese salto nativo y se rehace con scroll suave, ya montado
 * (BAL-3320).
 */
function useHashLanding() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash || !SECTION_IDS.includes(hash as (typeof SECTION_IDS)[number])) return;

    const el = document.getElementById(hash);
    if (!el) return;

    // El navegador ya saltó al montar: se vuelve arriba sin animación para que
    // el movimiento suave se vea entero y no un tirón desde media página.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
    // Dos frames de margen, igual que en el click: da tiempo a que el layout
    // se asiente antes de arrancar, si no el scroll suave se corta a medias.
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    );
    return () => cancelAnimationFrame(id);
  }, []);
}

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-baloo',
});

export interface SeminuevosLandingProps {
  footerData?: FooterData | null;
  landing?: string;
  previewBannerOffset?: number;
  promoBannerData?: PromoBannerData | null;
  faqData?: FaqData | null;
  /**
   * Logo institucional/de marca que muestra el navbar. Viene de BD
   * (heroData.logoUrl) — el resto del menú (items, megamenu, portal de
   * clientes) no aplica a esta landing: no se gestiona desde el admin.
   */
  logoUrl?: string;
  primaryColor?: string;
  /**
   * URL del botón flotante de WhatsApp. Viene de BD (heroData.ctaData.buttons
   * .whatsapp.url, el mismo componente `cta` que usa el resto de landings).
   * Si no llega, SeminuevosWhatsapp cae a su propio valor por defecto.
   */
  whatsappUrl?: string;
}

export default function SeminuevosLanding({
  footerData,
  landing = 'seminuevos',
  previewBannerOffset,
  promoBannerData,
  faqData,
  logoUrl,
  primaryColor,
  whatsappUrl,
}: SeminuevosLandingProps) {
  useSectionScroll();
  useHashLanding();

  return (
    <div className={`${baloo.variable} seminuevos-landing min-h-screen antialiased`}>
      <style>{`
        .seminuevos-landing{
          --azul:#4654CD; --azul2:#5a63e0; --aqua:#03DBD0; --navy:#151744;
          --lavanda:#EEF0FC; --borde:#E8E8EE; --tenue:#8A8A99;
          --sombra:0 8px 24px rgba(21,23,68,.07);
          font-family: var(--font-baloo), system-ui, sans-serif;
          color: var(--navy);
          background: #fff;
        }
        .seminuevos-landing button,
        .seminuevos-landing input { font-family: inherit; }
      `}</style>

      <Navbar
        landing={landing}
        landingId={LANDING_IDS.SEMINUEVOS}
        logoUrl={logoUrl}
        primaryColor={primaryColor}
        promoBannerData={promoBannerData}
        previewBannerOffset={previewBannerOffset}
        hidePortalButton
        navbarItems={navItems.map((item) => ({
          label: item.label,
          href: `#${item.sectionId}`,
          section: null,
        }))}
      />

      <main style={{ paddingTop: 'var(--header-total-height, 6.5rem)' }}>
        <SeminuevosHero catalogUrl={routes.catalogo(landing)} />
        <SeminuevosInspector />
        <SeminuevosProceso catalogUrl={routes.catalogo(landing)} />
        <SeminuevosAbout />
        <SeminuevosFaq data={faqData} />
      </main>

      <div id="footer">
        <Footer data={footerData} landing={landing} />
      </div>

      <SeminuevosWhatsapp href={whatsappUrl} />
    </div>
  );
}
