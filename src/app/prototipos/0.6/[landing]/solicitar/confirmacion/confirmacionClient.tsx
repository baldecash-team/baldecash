'use client';

/**
 * Confirmacion - Página de selección de resultado
 * Permite elegir entre Aprobación, Rechazo o Recibido
 * Para testing y demostración de flujos
 */

import React, { Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';


const RESULT_OPTIONS = [
  {
    id: 'aprobacion',
    title: 'Aprobación',
    description: 'Solicitud aprobada exitosamente',
    icon: CheckCircle2,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    path: '/prototipos/0.5/aprobacion/aprobado-preview',
  },
  {
    id: 'rechazo',
    title: 'Rechazo',
    description: 'Solicitud rechazada con alternativas',
    icon: XCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    path: '/prototipos/0.5/rechazo/rechazado-preview',
  },
  {
    id: 'recibido',
    title: 'Recibido',
    description: 'Solicitud en revisión (24-48h)',
    icon: Clock,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    path: '/prototipos/0.5/recibido/recibido-preview',
  },
];

function ConfirmacionContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Scroll to top on page load
  useScrollToTop();

  // Get layout data from context (fetched once at [landing] level)
  const { navbarProps, footerData, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

  const handleSelectResult = (path: string) => {
    router.push(path);
  };

  const pageContent = (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Navbar del Hero */}
      <Navbar {...navbarProps} />

      {/* Spacer for fixed navbar + promo banner */}
      <div className="h-[104px]" />

      <div className="max-w-2xl mx-auto px-4 pt-14 pb-32 lg:pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
            Solicitud Enviada
          </h1>
          <p className="text-neutral-600">
            Selecciona un resultado para ver la pantalla correspondiente
          </p>
        </motion.div>

        {/* Result Options */}
        <div className="space-y-4">
          {RESULT_OPTIONS.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => handleSelectResult(option.path)}
                className="w-full bg-white rounded-xl shadow-sm border border-neutral-200 p-5
                           hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer
                           flex items-center gap-4 text-left"
              >
                <div className={`w-14 h-14 ${option.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-7 h-7 ${option.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-800">{option.title}</h3>
                  <p className="text-sm text-neutral-500">{option.description}</p>
                </div>
                <div className="px-4 py-2 bg-neutral-200 text-neutral-700 hover:bg-[var(--color-primary)] hover:text-white rounded-lg font-medium text-sm transition-colors">
                  Ver
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Info Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 p-4 bg-neutral-100 rounded-xl"
        >
          <p className="text-sm text-neutral-600 text-center">
            Esta página es solo para demostración. En producción, el sistema determinará automáticamente el resultado.
          </p>
        </motion.div>
      </div>
    </div>
  );

  // Show loading while layout data is loading
  if (isLayoutLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  return (
    <>
      {pageContent}
      <Footer data={footerData} />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmacionContent />
    </Suspense>
  );
}
