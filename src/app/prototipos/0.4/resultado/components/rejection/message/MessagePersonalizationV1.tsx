'use client';

import React from 'react';

/**
 * MessagePersonalizationV1 - Nombre prominente
 * "María, en este momento..."
 * Conexión personal directa
 */

interface MessagePersonalizationProps {
  userName?: string;
}

export const MessagePersonalizationV1: React.FC<MessagePersonalizationProps> = ({ userName }) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">
        {userName ? (
          <>
            <span className="text-[#4654CD]">{userName}</span>, en este momento no podemos aprobar tu solicitud
          </>
        ) : (
          'En este momento no podemos aprobar tu solicitud'
        )}
      </h1>
      <p className="text-neutral-600">
        Gracias por tu interés en BaldeCash. Aunque no pudimos aprobar esta solicitud, hay otras opciones que podrían funcionarte.
      </p>
    </div>
  );
};
