'use client';

import React from 'react';

/**
 * MessagePersonalizationV3 - Nombre sutil
 * Solo en saludo inicial, no en el mensaje principal
 * Balance entre personal y profesional
 */

interface MessagePersonalizationProps {
  userName?: string;
}

export const MessagePersonalizationV3: React.FC<MessagePersonalizationProps> = ({ userName }) => {
  return (
    <div className="text-center mb-6">
      {userName && (
        <p className="text-sm text-neutral-500 mb-2">Hola, {userName}</p>
      )}
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">
        En este momento no podemos aprobar tu solicitud
      </h1>
      <p className="text-neutral-600">
        Gracias por tu interés en BaldeCash. Aunque no pudimos aprobar esta solicitud, hay otras opciones que podrían funcionarte.
      </p>
    </div>
  );
};
