'use client';

/**
 * MotivationalCard - Card lateral con mensajes motivacionales por paso
 *
 * Muestra contenido contextual según el paso actual del wizard.
 * El contenido viene 100% desde la API (base de datos).
 *
 * Estructura:
 * - title: Mensaje principal con HTML (puede incluir <strong>, <em>, <span class="highlight">)
 * - subtitle: Mensaje corto de cierre (texto plano)
 * - illustration: Path a la imagen de Baldi
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

  // Procesar el título para convertir .highlight a color primario
  const processTitle = (html: string) => {
    return html.replace(
      /<span class="highlight">(.*?)<\/span>/g,
      '<span class="text-[var(--color-primary)]">$1</span>'
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 lg:p-10 sticky top-24">
      {/* Contenido de texto */}
      <div className="mb-6">
        {/* Mensaje Principal - con HTML */}
        <h2
          className="text-2xl lg:text-3xl font-bold text-neutral-800 leading-tight"
          dangerouslySetInnerHTML={{ __html: processTitle(motivational.title || '') }}
        />

        {/* Subtítulo - texto simple en cursiva */}
        {motivational.subtitle && (
          <p className="text-neutral-500 text-base italic mt-4">
            {motivational.subtitle}
          </p>
        )}
      </div>

      {/* Ilustración */}
      {motivational.illustration && (
        <div className="flex justify-center mt-8">
          <img
            src={motivational.illustration}
            alt="Ilustración motivacional"
            className="w-full max-w-[260px] h-auto object-contain"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default MotivationalCard;
