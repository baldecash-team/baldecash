'use client';

/**
 * Resultados - Página de selección de resultado
 * Permite elegir entre Aprobación, Rechazo o Recibido
 * Para testing y demostración de flujos
 */

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { FeedbackButton } from '@/app/prototipos/_shared';

const FIXED_CONFIG = {
  section: 'wizard-solicitud',
  step: 'resultados',
  version: '0.5',
};

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

function ResultadosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';

  const handleSelectResult = (path: string) => {
    const url = isCleanMode ? `${path}?mode=clean` : path;
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4654CD]/5 via-white to-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-[#4654CD] rounded-full flex items-center justify-center mx-auto mb-4">
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
                <div className="px-4 py-2 bg-neutral-200 text-neutral-700 hover:bg-[#4654CD] hover:text-white rounded-lg font-medium text-sm transition-colors">
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

      {/* Floating Back Button - hidden in clean mode */}
      {!isCleanMode && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <Button
            isIconOnly
            radius="md"
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            onPress={() => router.push('/prototipos/0.5')}
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Button>
        </div>
      )}

      {/* Feedback Button - only in clean mode */}
      {isCleanMode && (
        <FeedbackButton
          sectionId="wizard-solicitud-resultados"
          config={FIXED_CONFIG as unknown as Record<string, unknown>}
        />
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#4654CD]" />
    </div>
  );
}

export default function ResultadosPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultadosContent />
    </Suspense>
  );
}
