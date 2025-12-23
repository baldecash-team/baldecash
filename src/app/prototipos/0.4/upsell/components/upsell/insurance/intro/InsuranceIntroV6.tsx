'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { AlertTriangle, Shield } from 'lucide-react';

/**
 * InsuranceIntroV6 - Impacto
 * "¡No te arriesgues!" - mensaje de alto impacto
 */
export const InsuranceIntroV6: React.FC = () => {
  return (
    <Card className="mb-6 bg-gradient-to-br from-amber-500 to-orange-500 border-none">
      <CardBody className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-1">
              ¡No te arriesgues!
            </h2>
            <p className="text-white/90">
              Tu laptop es una inversión importante. Protégela desde el día uno.
            </p>
          </div>
          <Shield className="w-12 h-12 text-white/30 flex-shrink-0" />
        </div>
      </CardBody>
    </Card>
  );
};

export default InsuranceIntroV6;
