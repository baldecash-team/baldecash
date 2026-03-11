'use client';

/**
 * MotivationalCard - Card lateral con mensajes motivacionales por paso
 *
 * Muestra contenido contextual según el paso actual del wizard.
 * El contenido viene 100% desde la API (base de datos).
 *
 * Solo visible en desktop (lg:). En mobile se oculta.
 */

import React from 'react';
import { WizardStepId } from '../../../types/solicitar';
import { WizardMotivational } from '../../../../../services/wizardApi';

interface MotivationalCardProps {
  currentStep: WizardStepId;
  /** Contenido motivacional desde API (100% desde BD) */
  motivational?: WizardMotivational | null;
}

export const MotivationalCard: React.FC<MotivationalCardProps> = ({ motivational }) => {
  // Si no hay contenido motivacional desde la API, no renderizar
  if (!motivational) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 lg:p-10 sticky top-24">
      {/* Contenido de texto */}
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800 leading-tight">
          {motivational.title}{' '}
          <span className="text-[var(--color-primary)]">{motivational.highlight}</span>
          {motivational.title_end && <> {motivational.title_end}</>}
        </h2>
        <p
          className="text-neutral-500 text-base italic mt-4"
          dangerouslySetInnerHTML={{ __html: motivational.subtitle }}
        />
      </div>

      {/* Ilustración */}
      <div className="flex justify-center mt-8">
        <img
          src={motivational.illustration}
          alt="Ilustración motivacional"
          className="w-full max-w-[260px] h-auto object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default MotivationalCard;
