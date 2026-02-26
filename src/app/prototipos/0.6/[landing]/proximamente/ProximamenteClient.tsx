'use client';

/**
 * Próximamente - BaldeCash v0.6
 * Página genérica para secciones en desarrollo
 * Usa useLayout() para obtener navbar y footer del landing
 */

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { Construction, ArrowLeft, Bell } from 'lucide-react';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { useLayout } from '../context/LayoutContext';

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
  const { navbarProps, footerData, isLoading, hasError, landing } = useLayout();

  const contenido = seccionTitulos[seccion] || defaultContent;

  useScrollToTop();

  // Show loading spinner while fetching
  if (isLoading) {
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
            <Construction className="w-10 h-10" style={{ color: 'var(--color-primary, #4654CD)' }} />
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
                <p className="font-medium text-neutral-800 text-sm">¿Tienes alguna consulta?</p>
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
