'use client';

import React from 'react';

/**
 * MessagePersonalizationV5 - En mensaje
 * Nombre en texto pero no en título principal
 * Personalización sutil en el cuerpo
 */

interface MessagePersonalizationProps {
  userName?: string;
}

export const MessagePersonalizationV5: React.FC<MessagePersonalizationProps> = ({ userName }) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">
        En este momento no podemos aprobar tu solicitud
      </h1>
      <p className="text-neutral-600">
        {userName ? (
          <>
            Hola <span className="font-medium text-neutral-700">{userName}</span>, gracias por tu interés en BaldeCash. Aunque no pudimos aprobar esta solicitud, hay otras opciones que podrían funcionarte.
          </>
        ) : (
          'Gracias por tu interés en BaldeCash. Aunque no pudimos aprobar esta solicitud, hay otras opciones que podrían funcionarte.'
        )}
      </p>
    </div>
  );
};
