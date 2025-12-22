'use client';

import React from 'react';

interface RetryTimelineV3Props {
  daysUntilRetry?: number;
}

/**
 * RetryTimelineV3 - No Mencionar
 * Puede frustrar al usuario - mejor no mostrar tiempo de espera
 */
export const RetryTimelineV3: React.FC<RetryTimelineV3Props> = () => {
  // No renderiza nada - decisión de UX para no frustrar
  return null;
};
