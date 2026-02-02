'use client';

/**
 * Próximamente - BaldeCash v0.6
 * Página genérica para secciones en desarrollo
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { Construction, ArrowLeft, Bell } from 'lucide-react';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { getLandingLayout } from '@/app/prototipos/0.6/services/landingApi';
import type { FooterData, NavbarItemData, MegaMenuItemData } from '@/app/prototipos/0.6/types/hero';

interface NavbarContentConfig {
  items?: NavbarItemData[];
  megamenu_items?: MegaMenuItemData[];
}

interface FooterContentConfig {
  tagline?: string;
  columns?: { title: string; links: { label: string; href: string }[] }[];
  newsletter?: { title: string; description: string; placeholder: string; button_text: string };
  sbs_text?: string;
  copyright_text?: string;
  social_links?: { platform: string; url: string }[];
}

// Mapeo de secciones a títulos descriptivos
const seccionTitulos: Record<string, { titulo: string; descripcion: string }> = {
  accesorios: {
    titulo: 'Accesorios',
    descripcion: 'Próximamente podrás encontrar accesorios para complementar tu equipo.',
  },
  seguros: {
    titulo: 'Seguros',
    descripcion: 'Estamos preparando opciones de seguros para proteger tu inversión.',
  },
  promos: {
    titulo: 'Promociones',
    descripcion: 'Próximamente encontrarás ofertas y promociones exclusivas.',
  },
  nosotros: {
    titulo: 'Sobre nosotros',
    descripcion: 'Estamos preparando información sobre nuestra historia y misión.',
  },
  convenios: {
    titulo: 'Convenios',
    descripcion: 'Próximamente podrás ver todos nuestros convenios con instituciones educativas.',
  },
  empleo: {
    titulo: 'Trabaja con nosotros',
    descripcion: 'Estamos preparando nuestra bolsa de trabajo. ¡Pronto podrás postular!',
  },
  blog: {
    titulo: 'Blog',
    descripcion: 'Próximamente publicaremos artículos sobre tecnología y educación.',
  },
  ayuda: {
    titulo: 'Centro de ayuda',
    descripcion: 'Estamos preparando recursos y guías para ayudarte.',
  },
  faq: {
    titulo: 'Preguntas frecuentes',
    descripcion: 'Próximamente encontrarás respuestas a las preguntas más comunes.',
  },
  estado: {
    titulo: 'Estado de solicitud',
    descripcion: 'Próximamente podrás consultar el estado de tu solicitud aquí.',
  },
  contacto: {
    titulo: 'Contacto',
    descripcion: 'Estamos preparando más formas de contactarnos.',
  },
  sbs: {
    titulo: 'Regulación SBS',
    descripcion: 'Próximamente encontrarás información sobre nuestra regulación.',
  },
};

const defaultContent = {
  titulo: 'Esta sección',
  descripcion: 'Estamos trabajando en este contenido.',
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

function ProximamenteContent() {
  const searchParams = useSearchParams();
  const seccion = searchParams.get('seccion') || '';
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [customerPortalUrl, setCustomerPortalUrl] = useState<string | undefined>();
  const [navbarItems, setNavbarItems] = useState<NavbarItemData[]>([]);
  const [megamenuItems, setMegamenuItems] = useState<MegaMenuItemData[]>([]);
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  const contenido = seccionTitulos[seccion] || defaultContent;

  useScrollToTop();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Usar endpoint /layout que solo trae navbar + footer + company
        const data = await getLandingLayout('home');
        if (data) {
          // Extraer logo y customer portal de company
          setLogoUrl(data.company?.logo_url);
          setCustomerPortalUrl(data.company?.customer_portal_url);

          // Extraer navbar
          if (data.navbar) {
            const navbarConfig = data.navbar.content_config as NavbarContentConfig;
            setNavbarItems(navbarConfig?.items || []);
            setMegamenuItems(navbarConfig?.megamenu_items || []);
          }

          // Extraer footer
          if (data.footer) {
            const footerConfig = data.footer.content_config as FooterContentConfig;
            setFooterData({
              tagline: footerConfig?.tagline,
              columns: footerConfig?.columns,
              newsletter: footerConfig?.newsletter,
              sbs_text: footerConfig?.sbs_text,
              copyright_text: footerConfig?.copyright_text,
              social_links: footerConfig?.social_links,
              company: data.company ? {
                logo_url: data.company.logo_url,
                customer_portal_url: data.company.customer_portal_url,
                social_links: data.company.social_links ? {
                  facebook: data.company.social_links.facebook,
                  instagram: data.company.social_links.instagram,
                  twitter: data.company.social_links.twitter,
                  linkedin: data.company.social_links.linkedin,
                  youtube: data.company.social_links.youtube,
                  tiktok: data.company.social_links.tiktok,
                } : undefined,
              } : undefined,
            });
          }
        }
      } catch (error) {
        console.error('Error loading landing layout:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadData();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <Navbar
        logoUrl={logoUrl}
        customerPortalUrl={customerPortalUrl}
        navbarItems={navbarItems}
        megamenuItems={megamenuItems}
        activeSections={['convenios', 'como-funciona', 'faq']}
      />

      {/* Main Content */}
      <main className="flex-1 pt-40 pb-24 flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-[#4654CD]/10 flex items-center justify-center mx-auto mb-6">
            <Construction className="w-10 h-10 text-[#4654CD]" />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-['Baloo_2'] mb-3">
            Estamos trabajando en esto
          </h1>

          {/* Section name */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4654CD]/10 rounded-full mb-4">
            <span className="text-sm font-medium text-[#4654CD]">{contenido.titulo}</span>
          </div>

          {/* Description */}
          <p className="text-neutral-500 mb-8 max-w-md mx-auto">
            {contenido.descripcion}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              as="a"
              href="/prototipos/0.6/home"
              size="lg"
              radius="lg"
              className="bg-[#4654CD] text-white font-semibold px-6"
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Volver al inicio
            </Button>
          </div>

          {/* Additional info */}
          <div className="mt-12 p-4 bg-white rounded-xl border border-neutral-200">
            <div className="flex items-start gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-800 text-sm">¿Tienes alguna consulta?</p>
                <p className="text-neutral-500 text-sm mt-1">
                  Mientras tanto, puedes escribirnos a{' '}
                  <a href="mailto:prestamos@baldecash.com" className="text-[#4654CD] hover:underline">
                    prestamos@baldecash.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer data={footerData} />
    </div>
  );
}

export default function ProximamentePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProximamenteContent />
    </Suspense>
  );
}
