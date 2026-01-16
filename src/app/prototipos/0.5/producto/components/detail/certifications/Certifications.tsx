'use client';

/**
 * Certifications - Logos pequenos inline (basado en V1)
 * Simple, compact display of certification logos.
 */

import React from 'react';
import { CheckCircle2, Award } from 'lucide-react';
import { FieldTooltip } from '@/app/prototipos/0.5/wizard-solicitud/components/wizard-solicitud/fields';
import { CertificationsProps } from '../../../types/detail';

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
        {certifications.map((cert) => (
          <FieldTooltip
            key={cert.code}
            content={{
              title: cert.name,
              description: cert.description,
            }}
            icon={
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full border border-neutral-200 transition-colors cursor-default">
                <Award className="w-3.5 h-3.5 text-[#4654CD]" />
                <span className="text-xs font-medium text-neutral-700">{cert.code}</span>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
};

export default Certifications;
