'use client';

import React from 'react';

/**
 * MessagePersonalizationV2 - Genérico
 * Sin nombre, menos personal en momento negativo
 * Profesional y neutro
 */

export const MessagePersonalizationV2: React.FC = () => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">
        En este momento no podemos aprobar tu solicitud
      </h1>
      <p className="text-neutral-600">
        Gracias por tu interés en BaldeCash. Aunque no pudimos aprobar esta solicitud, hay otras opciones disponibles para ti.
      </p>
    </div>
  );
};
