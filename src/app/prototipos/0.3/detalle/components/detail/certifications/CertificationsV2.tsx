'use client';

/**
 * CertificationsV2 - Logos + Nombre + Tooltip
 *
 * Caracteristicas:
 * - Logos con nombre visible
 * - Tooltip con descripcion
 * - Fila horizontal
 * - Ideal para: balance info/espacio
 */

import React from 'react';
import { Tooltip, Chip } from '@nextui-org/react';
import { Shield, Award, Leaf, Zap, ExternalLink } from 'lucide-react';
import { CertificationsProps } from '../../../types/detail';

const certIconMap: Record<string, React.ElementType> = {
  'energy-star': Zap,
  epeat: Leaf,
  tco: Shield,
  default: Award,
};

const certColorMap: Record<string, { bg: string; text: string; icon: string }> = {
  'energy-star': { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
  epeat: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' },
  tco: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
  default: { bg: 'bg-neutral-50', text: 'text-neutral-700', icon: 'text-neutral-500' },
};

export const CertificationsV2: React.FC<CertificationsProps> = ({ certifications }) => {
  if (certifications.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-neutral-600 flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Certificaciones
      </h4>

      <div className="flex flex-wrap gap-2">
        {certifications.map((cert) => {
          const IconComponent = certIconMap[cert.code] || certIconMap.default;
          const colors = certColorMap[cert.code] || certColorMap.default;

          return (
            <Tooltip
              key={cert.code}
              content={
                <div className="max-w-xs p-2">
                  <p className="font-medium text-white mb-1">{cert.name}</p>
                  <p className="text-sm text-neutral-200">{cert.description}</p>
                  {cert.learnMoreUrl && (
                    <a
                      href={cert.learnMoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 mt-2 text-xs text-[#03DBD0] hover:underline"
                    >
                      Saber mas <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              }
              classNames={{
                content: 'bg-neutral-800 rounded-lg shadow-xl',
              }}
            >
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-help transition-all hover:scale-105 ${colors.bg}`}
              >
                <IconComponent className={`w-4 h-4 ${colors.icon}`} />
                <span className={`text-sm font-medium ${colors.text}`}>{cert.name}</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default CertificationsV2;
