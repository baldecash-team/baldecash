'use client';

import React from 'react';
import { Tooltip } from '@nextui-org/react';
import { Shield, ExternalLink } from 'lucide-react';

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
 * V2: Logos + nombre + tooltip - Logos with name and tooltip on hover
 * Enhanced display with tooltips showing certification details
 */
export default function CertificationsV2({ certifications }: CertificationsProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-[#4654CD]" />
        <h3 className="text-lg font-semibold text-neutral-900">Certificaciones y Estándares</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {certifications.map((cert) => (
          <Tooltip
            key={cert.code}
            content={
              <div className="px-2 py-2 max-w-xs">
                <p className="text-sm font-semibold text-neutral-900 mb-1">{cert.name}</p>
                <p className="text-xs text-neutral-600">{cert.description}</p>
                {cert.learnMoreUrl && (
                  <a
                    href={cert.learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#4654CD] mt-2 hover:underline"
                  >
                    Más información
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            }
            classNames={{
              content: 'bg-white shadow-lg border border-neutral-200'
            }}
          >
            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-neutral-200 hover:border-[#4654CD] hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 bg-[#4654CD]/10 rounded-lg">
                <div className="text-2xl font-bold text-[#4654CD]">
                  {cert.code.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-neutral-900 truncate max-w-full">
                  {cert.code}
                </div>
                <div className="text-[10px] text-neutral-500 truncate max-w-full">
                  {cert.name.substring(0, 20)}...
                </div>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
