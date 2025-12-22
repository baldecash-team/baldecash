'use client';

import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';

/**
 * AdvisorCTAV3 - Solo Info de Contacto
 * Sin CTA directo, solo información
 */
export const AdvisorCTAV3: React.FC = () => {
  return (
    <div className="bg-neutral-50 rounded-lg p-4 mt-6">
      <p className="text-sm font-medium text-neutral-700 mb-3">¿Necesitas ayuda?</p>
      <div className="space-y-2 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-neutral-400" />
          <span>(01) 700-1234</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-neutral-400" />
          <span>ayuda@baldecash.com</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-400" />
          <span>Lun-Vie 9:00 - 18:00</span>
        </div>
      </div>
    </div>
  );
};
