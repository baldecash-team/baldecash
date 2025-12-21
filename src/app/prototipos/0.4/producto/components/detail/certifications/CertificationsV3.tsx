'use client';

import React, { useState } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Shield, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

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
 * V3: Cards expandibles con detalle - Expandable cards showing full details
 * Cards that expand to show complete certification information
 */
export default function CertificationsV3({ certifications }: CertificationsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (code: string) => {
    setExpandedId(expandedId === code ? null : code);
  };

  return (
    <div className="w-full py-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-[#4654CD]" />
        <h3 className="text-lg font-semibold text-neutral-900">Certificaciones y Estándares</h3>
      </div>

      <div className="space-y-3">
        {certifications.map((cert) => {
          const isExpanded = expandedId === cert.code;

          return (
            <Card
              key={cert.code}
              className="border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardBody className="p-0">
                <button
                  onClick={() => toggleExpand(cert.code)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-[#4654CD]/10 rounded-lg flex-shrink-0">
                    <div className="text-lg font-bold text-[#4654CD]">
                      {cert.code.substring(0, 2).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-neutral-900">{cert.name}</div>
                    <div className="text-xs text-neutral-500">{cert.code}</div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-neutral-100">
                    <p className="text-sm text-neutral-600 mt-3">{cert.description}</p>
                    {cert.learnMoreUrl && (
                      <a
                        href={cert.learnMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[#4654CD] mt-3 hover:underline"
                      >
                        Más información
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
