'use client';

import React from 'react';

/**
 * Diseño 1 (BAL-5261): la pista (`hint`) bajo el campo, con el mismo estilo
 * que el `helpText` de Diseño 1 (texto chico gris). Va en la línea que el
 * campo ya reserva para su error: si hay error, el error la reemplaza.
 */
export const PISTA_D1 = 'text-xs text-neutral-500';

export const PistaD1: React.FC<{ id: string; className?: string; children: React.ReactNode }> = ({
  id,
  className,
  children,
}) => (
  <p className={className ? `${PISTA_D1} ${className}` : PISTA_D1} data-pista={id}>
    {children}
  </p>
);

export default PistaD1;
