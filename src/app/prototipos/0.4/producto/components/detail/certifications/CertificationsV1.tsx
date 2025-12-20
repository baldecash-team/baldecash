'use client';

import React from 'react';
import { Shield } from 'lucide-react';

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
    <div className="w-full py-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-[#4654CD]" />
        <h3 className="text-lg font-semibold text-neutral-900">Certificaciones</h3>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {certifications.map((cert) => (
          <div
            key={cert.code}
            className="flex items-center justify-center w-20 h-20 bg-neutral-50 rounded-lg border border-neutral-200"
            title={cert.name}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-[#4654CD]">
                {cert.code.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-[10px] text-neutral-600 mt-1">
                {cert.code}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-neutral-500 mt-4">
        Todas las certificaciones verificadas y vigentes
      </p>
    </div>
  );
}
