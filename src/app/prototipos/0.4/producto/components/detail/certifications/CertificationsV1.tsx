'use client';

import React from 'react';
import { Shield, CheckCircle2, Award } from 'lucide-react';
import { Tooltip } from '@nextui-org/react';

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
 * V1: Logos pequeños inline - Small inline logos with simple layout
 * Simple, compact display of certification logos in a single row
 */
export default function CertificationsV1({ certifications }: CertificationsProps) {
  return (
    <div className="w-full">
      {/* Header with trust message */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">Producto certificado</h3>
          <p className="text-xs text-neutral-500">Garantias verificadas</p>
        </div>
      </div>

      {/* Certification badges */}
      <div className="flex flex-wrap items-center gap-2">
        {certifications.map((cert) => (
          <Tooltip
            key={cert.code}
            content={
              <div className="max-w-[200px] p-2">
                <p className="font-semibold text-sm">{cert.name}</p>
                <p className="text-xs text-neutral-400 mt-1">{cert.description}</p>
              </div>
            }
            placement="top"
            classNames={{
              content: 'bg-neutral-900 text-white rounded-lg',
            }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full border border-neutral-200 transition-colors cursor-default">
              <Award className="w-3.5 h-3.5 text-[#4654CD]" />
              <span className="text-xs font-medium text-neutral-700">{cert.code}</span>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
