'use client';

import React from 'react';

/**
 * MessagePersonalizationV4 - Contextual
 * Nombre solo si mejora el tono, decisión por contexto
 * Adaptativo según disponibilidad
 */

interface MessagePersonalizationProps {
  userName?: string;
}

export const MessagePersonalizationV4: React.FC<MessagePersonalizationProps> = ({ userName }) => {
  // Decisión contextual: usar nombre solo en mensaje de cierre
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">
        En este momento no podemos aprobar tu solicitud
      </h1>
      <p className="text-neutral-600">
        {userName
          ? `${userName}, gracias por tu interés en BaldeCash. Tenemos algunas alternativas que podrían funcionarte.`
          : 'Gracias por tu interés en BaldeCash. Tenemos algunas alternativas que podrían funcionarte.'
        }
      </p>
    </div>
  );
};
