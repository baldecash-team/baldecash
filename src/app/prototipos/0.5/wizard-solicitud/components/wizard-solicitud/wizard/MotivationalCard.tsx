'use client';

/**
 * MotivationalCard - Card lateral con mensajes motivacionales por paso
 *
 * Muestra contenido contextual según el paso actual del wizard:
 * - datos-personales: Importancia del DNI correcto
 * - datos-academicos: Social proof (estudiantes)
 * - datos-economicos: Transparencia en cuotas
 * - resumen: Último paso, casi listo
 *
 * Solo visible en desktop (lg:). En mobile se oculta.
 */

import React from 'react';
import { WizardStepId } from '../../../types/wizard-solicitud';

interface MotivationalCardProps {
  currentStep: WizardStepId;
}

interface StepContent {
  title: string;
  highlight: string;
  titleEnd?: string;
  subtitle: string;
  illustration: string;
}

// Contenido por paso
const STEP_CONTENT: Record<WizardStepId, StepContent> = {
  'datos-personales': {
    title: 'Recuerda que es importante digitar tu',
    highlight: 'número de DNI',
    titleEnd: 'correctamente',
    subtitle: 'Revisa 2 veces que tus datos estén en orden.',
    illustration: '/images/baldi/BALDI_IDEA.png',
  },
  'datos-academicos': {
    title: 'Más de',
    highlight: '5,000 estudiantes',
    titleEnd: 'ya tienen su laptop',
    subtitle: 'Únete a la comunidad de estudiantes que financiaron con BaldeCash.',
    illustration: '/images/baldi/BALDI_COMPU.png',
  },
  'datos-economicos': {
    title: 'Sin letra pequeña,',
    highlight: 'cuotas fijas',
    titleEnd: 'sin sorpresas',
    subtitle: 'Transparencia total en todas nuestras condiciones.',
    illustration: '/images/baldi/BALDI_EJECUTIVO.png',
  },
  resumen: {
    title: '¡Estás a',
    highlight: 'un paso',
    titleEnd: 'de tu nueva laptop!',
    subtitle: 'Revisa tu información y envía tu solicitud.',
    illustration: '/images/baldi/BALDI_ALEGRE.png',
  },
};

export const MotivationalCard: React.FC<MotivationalCardProps> = ({ currentStep }) => {
  const content = STEP_CONTENT[currentStep];

  if (!content) return null;

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-neutral-100 p-8 lg:p-10 sticky top-24">
      {/* Contenido de texto */}
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800 leading-tight">
          {content.title}{' '}
          <span className="text-[#4654CD]">{content.highlight}</span>
          {content.titleEnd && <> {content.titleEnd}</>}
        </h2>
        <p className="text-neutral-500 text-base italic mt-4">{content.subtitle}</p>
      </div>

      {/* Ilustración */}
      <div className="flex justify-center mt-8">
        <img
          src={content.illustration}
          alt="Ilustración motivacional"
          className="w-full max-w-[260px] h-auto object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default MotivationalCard;
