'use client';

/**
 * Certifications - Logos pequenos inline (basado en V1)
 * Simple, compact display of certification logos.
 */

import React from 'react';
import { CheckCircle2, Award, HelpCircle } from 'lucide-react';
import { CertificationsProps } from '../../../types/detail';

// Tooltip component for certifications (estilo 0.5: fondo blanco, borde, sombra)
const CertTooltip: React.FC<{
  content: { title: string; description: string };
  children: React.ReactNode;
}> = ({ content, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const handleToggle = () => setIsVisible(!isVisible);
  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleToggle}
    >
      {children}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-white border border-neutral-200 shadow-lg rounded-lg w-64 z-[9999] transition-all duration-200 ${
          isVisible ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <p className="text-sm font-semibold text-neutral-800">{content.title}</p>
        <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{content.description}</p>
        {/* Arrow with border effect */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-neutral-200" />
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[5px] border-transparent border-t-white" />
      </div>
    </div>
  );
};

export const Certifications: React.FC<CertificationsProps> = ({ certifications }) => {
  return (
    <div className="w-full">
      {/* Header with trust message */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">Producto certificado</h3>
          <p className="text-xs text-neutral-500">Garantías verificadas</p>
        </div>
      </div>

      {/* Certification badges */}
      <div className="flex flex-wrap items-center gap-2">
        {certifications.map((cert, index) => (
          <CertTooltip
            key={`${cert.code}-${index}`}
            content={{
              title: cert.name,
              description: cert.description,
            }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full border border-neutral-200 transition-colors cursor-default">
              <Award className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span className="text-xs font-medium text-neutral-700">{cert.code}</span>
            </div>
          </CertTooltip>
        ))}
      </div>
    </div>
  );
};

export default Certifications;
