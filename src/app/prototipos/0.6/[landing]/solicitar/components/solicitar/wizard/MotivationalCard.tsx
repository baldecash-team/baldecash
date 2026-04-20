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
import { useParams } from 'next/navigation';
import { WizardStepId } from '../../../types/solicitar';
import { WizardMotivational } from '../../../../../services/wizardApi';
import { getVipToken } from '../../../../../components/hero/DniModal';

interface MotivationalCardProps {
  currentStep: WizardStepId;
  /** Contenido motivacional desde API (100% desde BD) */
  motivational?: WizardMotivational | null;
  /** Nombre del usuario (from form data) para personalización VIP */
  firstName?: string;
}

export const MotivationalCard: React.FC<MotivationalCardProps> = ({ motivational, firstName }) => {
  const params = useParams();
  const landing = (params.landing as string) || 'home';
  const isVip = !!getVipToken(landing);

  // Si no hay contenido motivacional desde la API, no renderizar
  if (!motivational) return null;

  // Procesar el título para convertir .highlight a color primario (or white for VIP)
  const processTitle = (html: string) => {
    const highlightColor = isVip ? '#E5A823' : 'var(--color-primary)';
    return html.replace(
      /<span class="highlight">(.*?)<\/span>/g,
      `<span style="color: ${highlightColor}">$1</span>`
    );
  };

  // Build VIP greeting prefix
  const vipName = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
    : null;

  if (isVip) {
    return (
      <div
        className="rounded-xl overflow-hidden shadow-sm"
        style={{
          borderTop: '8px solid #3ECDC6',
        }}
      >
        <div
          className="p-8 lg:p-10"
          style={{
            background: `
              radial-gradient(circle at 50% 30%, rgba(255,255,255,0.12) 0%, transparent 60%),
              radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)
            `,
            backgroundSize: '100% 100%, 18px 18px',
            backgroundColor: '#4654CD',
          }}
        >
          {/* Contenido de texto */}
          <div className={motivational.illustration ? 'mb-6' : ''}>
            {vipName && (
              <p className="text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight font-['Baloo_2',_sans-serif]" style={{ color: '#E5A823' }}>
                Hola, {vipName}
              </p>
            )}
            <h2
              className="text-2xl lg:text-3xl font-bold text-white leading-tight font-['Baloo_2',_sans-serif]"
              dangerouslySetInnerHTML={{ __html: processTitle(motivational.title || '') }}
            />
            {motivational.subtitle && (
              <p className="text-white/70 text-base italic mt-4">
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
      </div>
    );
  }

  return (
    // sticky positioning is handled by the parent WizardLayout wrapper so
    // the offset tracks the CSS variable centrally. No sticky here.
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 lg:p-10">
      {/* Contenido de texto */}
      <div className="mb-6">
        {/* Mensaje Principal - con HTML */}
        <h2
          className="text-2xl lg:text-3xl font-bold text-neutral-800 leading-tight font-['Baloo_2',_sans-serif]"
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
