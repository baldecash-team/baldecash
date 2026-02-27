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
  Search,
  Mail,
  Scale,
  LucideIcon
} from 'lucide-react';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
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
  const { navbarProps, footerData, isLoading, hasError, landing } = useLayout();

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
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <Navbar
        promoBannerData={navbarProps.promoBannerData}
        logoUrl={navbarProps.logoUrl}
        customerPortalUrl={navbarProps.customerPortalUrl}
        navbarItems={navbarProps.navbarItems}
        megamenuItems={navbarProps.megamenuItems}
        activeSections={navbarProps.activeSections}
        landing={landing}
      />

      {/* Main Content */}
      <main className="flex-1 pt-40 pb-24 flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
          >
            <IconComponent className="w-10 h-10" style={{ color: 'var(--color-primary, #4654CD)' }} />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-['Baloo_2'] mb-3">
            Estamos trabajando en esto
          </h1>

          {/* Section name */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--color-primary, #4654CD)' }}>{contenido.titulo}</span>
          </div>

          {/* Description */}
          <p className="text-neutral-500 mb-8 max-w-md mx-auto">
            {contenido.descripcion}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              as="a"
              href={`/prototipos/0.6/${landing}`}
              size="lg"
              radius="lg"
              className="text-white font-semibold px-6"
              style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
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
                <p className="font-medium text-neutral-800 text-sm">Tienes alguna consulta?</p>
                <p className="text-neutral-500 text-sm mt-1">
                  Mientras tanto, puedes escribirnos a{' '}
                  <a href="mailto:prestamos@baldecash.com" className="hover:underline" style={{ color: 'var(--color-primary, #4654CD)' }}>
                    prestamos@baldecash.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer data={footerData} landing={landing} />
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
