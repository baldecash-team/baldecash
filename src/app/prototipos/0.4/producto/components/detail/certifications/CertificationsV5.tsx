'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Shield, Award, ExternalLink } from 'lucide-react';

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
 * V5: Panel lateral con certificaciones - Side panel layout
 * Two-column layout with icons on left and details on right
 */
export default function CertificationsV5({ certifications }: CertificationsProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-[#4654CD]" />
        <h3 className="text-lg font-semibold text-neutral-900">Certificaciones y Estándares</h3>
      </div>

      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        {/* Left Panel - Icons */}
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {certifications.map((cert) => (
            <div
              key={cert.code}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 bg-white rounded-lg border-2 border-neutral-200 hover:border-[#4654CD] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-[#4654CD]/10 rounded-lg">
                <Award className="w-8 h-8 text-[#4654CD]" />
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-neutral-900">{cert.code}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Panel - Details */}
        <div className="space-y-4">
          {certifications.map((cert, index) => (
            <Card
              key={cert.code}
              className="border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardBody className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-[#4654CD]/10 rounded-lg flex-shrink-0">
                    <span className="text-lg font-bold text-[#4654CD]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="text-base font-semibold text-neutral-900">{cert.name}</h4>
                        <p className="text-xs text-neutral-500 mt-1">{cert.code}</p>
                      </div>
                      {cert.learnMoreUrl && (
                        <a
                          href={cert.learnMoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-[#4654CD] hover:text-[#4654CD]/80"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600">{cert.description}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
        <Shield className="w-4 h-4" />
        <span>Todas las certificaciones verificadas y vigentes</span>
      </div>
    </div>
  );
}
