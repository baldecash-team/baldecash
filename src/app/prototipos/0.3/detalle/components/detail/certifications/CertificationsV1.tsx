'use client';

/**
 * CertificationsV1 - Solo Logos Pequenos
 *
 * Caracteristicas:
 * - Logos minimalistas
 * - Hover para nombre
 * - Compacto
 * - Ideal para: footer, espacio reducido
 */

import React from 'react';
import { Tooltip } from '@nextui-org/react';
import { Shield, Award, Leaf, Zap } from 'lucide-react';
import { CertificationsProps } from '../../../types/detail';

// Map de iconos para certificaciones
const certIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'energy-star': Zap,
  epeat: Leaf,
  tco: Shield,
  default: Award,
};

export const CertificationsV1: React.FC<CertificationsProps> = ({ certifications }) => {
  if (certifications.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-500">Certificaciones:</span>

      <div className="flex items-center gap-2">
        {certifications.map((cert) => {
          const IconComponent = certIconMap[cert.code] || certIconMap.default;

          return (
            <Tooltip
              key={cert.code}
              content={cert.name}
              classNames={{
                content: 'bg-neutral-800 text-white text-xs py-1 px-2 rounded',
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors cursor-help">
                <IconComponent className="w-4 h-4 text-neutral-500" />
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default CertificationsV1;
