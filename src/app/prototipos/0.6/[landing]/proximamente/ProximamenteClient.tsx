'use client';

/**
 * Proximamente - BaldeCash v0.6
 * Pagina generica para secciones en desarrollo
 * Usa useLayout() para obtener navbar y footer del landing
 * Contenido de secciones viene de la API (coming_soon_sections)
 */

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import {
  Construction,
  ArrowLeft,
  Bell,
  Package,
  Shield,
  Percent,
  Users,
  Handshake,
  Briefcase,
  Newspaper,
  HelpCircle,
  MessageCircleQuestion,
  MessageCircle,
  Search,
  Mail,
  Scale,
  LucideIcon
} from 'lucide-react';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { ConvenioFooter } from '@/app/prototipos/0.6/components/hero/convenio';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useLayout } from '../context/LayoutContext';
import { getComingSoonContent, ComingSoonSection } from '@/app/prototipos/0.6/services/landingApi';

// Mapeo de iconos string a componentes
const iconMap: Record<string, LucideIcon> = {
  Construction,
  Package,
  Shield,
  Percent,
  Users,
  Handshake,
  Briefcase,
  Newspaper,
  HelpCircle,
  MessageCircleQuestion,
  Search,
  Mail,
  Scale,
};

function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] || Construction;
}

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
  const { navbarProps, footerData, agreementData, isLoading, hasError, landing } = useLayout();

  const [sections, setSections] = useState<ComingSoonSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  useScrollToTop();

  // Fetch coming soon content from API
  useEffect(() => {
    async function fetchSections() {
      setSectionsLoading(true);
      try {
        const data = await getComingSoonContent(landing);
        setSections(data);
      } catch (error) {
        console.error('Error fetching coming soon sections:', error);
      } finally {
        setSectionsLoading(false);
      }
    }

    if (landing) {
      fetchSections();
    }
  }, [landing]);

  // Find the current section content from API data
  const contenido = useMemo(() => {
    // First try to find the exact section
    const found = sections.find(s => s.section_key === seccion);
    if (found) {
      return {
        titulo: found.title,
        descripcion: found.description,
        icon: found.icon,
      };
    }

    // Try to find the default section
    const defaultSection = sections.find(s => s.section_key === 'default');
    if (defaultSection) {
      return {
        titulo: defaultSection.title,
        descripcion: defaultSection.description,
        icon: defaultSection.icon,
      };
    }

    // Ultimate fallback (only if API fails completely)
    return {
      titulo: 'Esta seccion',
      descripcion: 'Estamos trabajando en este contenido.',
      icon: 'Construction',
    };
  }, [sections, seccion]);

  const IconComponent = getIconComponent(contenido.icon);

  // Show loading spinner while fetching
  if (isLoading || sectionsLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <Navbar
        promoBannerData={navbarProps.promoBannerData}
        logoUrl={navbarProps.logoUrl}
        customerPortalUrl={navbarProps.customerPortalUrl}
        portalButtonText={navbarProps.portalButtonText}
        navbarItems={navbarProps.navbarItems}
        megamenuItems={navbarProps.megamenuItems}
        activeSections={navbarProps.activeSections}
        landing={landing}
        institutionLogo={navbarProps.institutionLogo}
        institutionName={navbarProps.institutionName}
      />

      {/* Main Content — padding-top driven by --header-total-height so it
          adapts to preview banner + promo banner + navbar dynamically. */}
      <main
        className="flex-1 pb-12 sm:pb-16 md:pb-24 flex items-center justify-center"
        style={{ paddingTop: 'calc(var(--header-total-height, 6.5rem) + 2rem)' }}
      >
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          {/* Icon */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
          >
            <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--color-primary, #4654CD)' }} />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 font-['Baloo_2',_sans-serif] leading-tight mb-3">
            Estamos trabajando en esto
          </h1>

          {/* Section name — chip degrades gracefully with long titles */}
          <div
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 max-w-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
          >
            <span
              className="text-xs sm:text-sm font-medium break-words"
              style={{ color: 'var(--color-primary, #4654CD)' }}
            >
              {contenido.titulo}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-neutral-500 leading-relaxed mb-6 sm:mb-8 max-w-md mx-auto px-2">
            {contenido.descripcion}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              as="a"
              href={routes.landingHome(landing)}
              size="lg"
              radius="lg"
              className="w-full sm:w-auto text-white font-semibold px-6"
              style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Volver al inicio
            </Button>
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-8 sm:mt-12 p-3 sm:p-4 bg-white rounded-xl border border-neutral-200">
            <div className="flex items-start gap-3 text-left">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-800 text-sm">¿Tienes alguna consulta?</p>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 mb-3 break-words">
                  Nuestro equipo está disponible para ayudarte.
                </p>
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-[#25D366] text-white font-semibold cursor-pointer"
                  startContent={<MessageCircle className="w-4 h-4 flex-shrink-0" />}
                  onPress={() => window.open('https://wa.link/osgxjf', '_blank', 'noopener,noreferrer')}
                >
                  Escríbenos por WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Email info */}
          <div className="mt-4 p-3 sm:p-4 bg-white rounded-xl border border-neutral-200">
            <div className="flex items-start gap-3 text-left">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-800 text-sm">También puedes escribirnos</p>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  <a
                    href="mailto:prestamos@baldecash.com"
                    className="underline decoration-dotted underline-offset-2 hover:decoration-solid break-all"
                    style={{ color: 'var(--color-primary, #4654CD)' }}
                  >
                    prestamos@baldecash.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      {agreementData ? <ConvenioFooter data={footerData} agreementData={agreementData} landing={landing} /> : <Footer data={footerData} landing={landing} />}
    </div>
  );
}

export function ProximamenteClient() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProximamenteContent />
    </Suspense>
  );
}
