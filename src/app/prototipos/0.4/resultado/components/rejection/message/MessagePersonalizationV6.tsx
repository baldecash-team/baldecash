'use client';

import React from 'react';

/**
 * MessagePersonalizationV6 - Nombre grande
 * Prominente para conexión personal máxima
 * Enfoque empático y cercano
 */

interface MessagePersonalizationProps {
  userName?: string;
}

export const MessagePersonalizationV6: React.FC<MessagePersonalizationProps> = ({ userName }) => {
  return (
    <div className="text-center mb-8">
      {userName && (
        <div className="mb-4">
          <span className="text-4xl md:text-5xl font-bold text-[#4654CD]">{userName}</span>
        </div>
      )}
      <h1 className="text-xl md:text-2xl font-semibold text-neutral-800 mb-3">
        En este momento no podemos aprobar tu solicitud
      </h1>
      <p className="text-neutral-600 max-w-md mx-auto">
        Gracias por tu interés en BaldeCash. Sabemos que esto no es lo que esperabas, pero hay opciones que queremos mostrarte.
      </p>
    </div>
  );
};
