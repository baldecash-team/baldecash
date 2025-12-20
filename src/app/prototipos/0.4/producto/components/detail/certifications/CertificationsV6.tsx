'use client';

import React from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Shield, Award, Leaf, ExternalLink } from 'lucide-react';

export interface Certification {
  code: string;
  name: string;
  logo: string;
  description: string;
  learnMoreUrl?: string;
}

export interface CertificationsProps {
  certifications: Certification[];
}

/**
 * V6: Certificaciones interactivas expandibles - Interactive expandable certifications
 * Accordion-based interactive component with rich details
 */
export default function CertificationsV6({ certifications }: CertificationsProps) {
  const getIconForCert = (code: string) => {
    const lowerCode = code.toLowerCase();
    if (lowerCode.includes('eco') || lowerCode.includes('green') || lowerCode.includes('organic')) {
      return <Leaf className="w-5 h-5 text-green-600" />;
    }
    if (lowerCode.includes('iso') || lowerCode.includes('quality')) {
      return <Award className="w-5 h-5 text-[#4654CD]" />;
    }
    return <Shield className="w-5 h-5 text-[#4654CD]" />;
  };

  return (
    <div className="w-full py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-[#4654CD]" />
          <h3 className="text-xl font-bold text-neutral-900">Certificaciones y Estándares</h3>
        </div>
        <p className="text-sm text-neutral-600">
          Nuestros productos cumplen con los más altos estándares de calidad y seguridad
        </p>
      </div>

      <Accordion
        variant="splitted"
        selectionMode="multiple"
        className="px-0"
      >
        {certifications.map((cert, index) => (
          <AccordionItem
            key={cert.code}
            aria-label={cert.name}
            title={
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-[#4654CD]/10 rounded-lg">
                  {getIconForCert(cert.code)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-neutral-900">{cert.name}</div>
                  <div className="text-xs text-neutral-500">{cert.code}</div>
                </div>
              </div>
            }
            className="border border-neutral-200 rounded-lg mb-2 shadow-sm hover:shadow-md transition-shadow"
            classNames={{
              content: 'px-4 pb-4',
              trigger: 'py-4 px-4'
            }}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-[#4654CD]/10 rounded-lg flex-shrink-0">
                  <span className="text-2xl font-bold text-[#4654CD]">
                    {cert.code.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-700 leading-relaxed">{cert.description}</p>
                </div>
              </div>

              {cert.learnMoreUrl && (
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-xs text-neutral-500">¿Quieres saber más?</span>
                  <a
                    href={cert.learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4654CD] rounded-lg hover:bg-[#4654CD]/90 transition-colors"
                  >
                    Más información
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 h-px bg-neutral-200"></div>
                <span className="text-xs text-neutral-400">Certificación {index + 1} de {certifications.length}</span>
                <div className="flex-1 h-px bg-neutral-200"></div>
              </div>
            </div>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-6 p-4 bg-gradient-to-r from-[#4654CD]/5 to-[#4654CD]/10 rounded-lg border border-[#4654CD]/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#4654CD] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-neutral-900 mb-1">Garantía de Calidad</p>
            <p className="text-xs text-neutral-600">
              Todas nuestras certificaciones son verificadas regularmente para asegurar el cumplimiento continuo de los estándares más exigentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
