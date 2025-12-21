'use client';

import React, { useState } from 'react';
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
 * V4: Logos flotantes con hover info - Floating logos with hover information
 * Floating badge-style logos that reveal information on hover
 */
export default function CertificationsV4({ certifications }: CertificationsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full py-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-[#4654CD]" />
        <h3 className="text-lg font-semibold text-neutral-900">Certificaciones</h3>
      </div>

      <div className="relative">
        <div className="flex flex-wrap gap-3">
          {certifications.map((cert) => (
            <div
              key={cert.code}
              className="relative"
              onMouseEnter={() => setHoveredId(cert.code)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-[#4654CD]/20 hover:border-[#4654CD] hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center justify-center w-8 h-8 bg-[#4654CD]/10 rounded-full">
                  <span className="text-sm font-bold text-[#4654CD]">
                    {cert.code.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-neutral-900">{cert.code}</span>
              </div>

              {hoveredId === cert.code && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-neutral-200 p-4 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-[#4654CD]/10 rounded-lg flex-shrink-0">
                      <span className="text-lg font-bold text-[#4654CD]">
                        {cert.code.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-neutral-900 mb-1">{cert.name}</h4>
                      <p className="text-xs text-neutral-600 mb-2">{cert.description}</p>
                      {cert.learnMoreUrl && (
                        <a
                          href={cert.learnMoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#4654CD] hover:underline"
                        >
                          Más información
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#4654CD]/5 rounded-lg border border-[#4654CD]/20">
        <p className="text-sm text-neutral-700">
          <span className="font-semibold">Pasa el cursor</span> sobre cada certificación para ver más detalles
        </p>
      </div>
    </div>
  );
}
