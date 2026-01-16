'use client';

/**
 * Próximamente - BaldeCash v0.5
 * Página genérica para secciones en desarrollo
 */

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import { Construction, ArrowLeft, Bell } from 'lucide-react';
import { Navbar, Footer } from '@/app/prototipos/0.5/hero/components/hero';
import { CubeGridSpinner, FeedbackButton, useScrollToTop } from '@/app/prototipos/_shared';

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
  const isCleanMode = searchParams.get('mode') === 'clean';
  const seccion = searchParams.get('seccion') || '';

  const contenido = seccionTitulos[seccion] || defaultContent;
  const heroUrl = isCleanMode ? '/prototipos/0.5/hero/hero-preview?mode=clean' : '/prototipos/0.5/hero/hero-preview';

  useScrollToTop();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <Navbar isCleanMode={isCleanMode} hidePromoBanner />

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
              href={heroUrl}
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
      <Footer isCleanMode={isCleanMode} />

      {/* Feedback Button */}
      {isCleanMode && <FeedbackButton sectionId="proximamente" />}
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
