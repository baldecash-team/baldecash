'use client';

/**
 * ConfettiV3 - Sin confetti
 * Solo animación de ilustración flat (no hay confetti)
 */

import React from 'react';

interface ConfettiProps {
  active?: boolean;
  onComplete?: () => void;
}

export const ConfettiV3: React.FC<ConfettiProps> = ({ active = true, onComplete }) => {
  // V3 no tiene confetti, solo retorna null
  // La animación se maneja en el componente de celebración
  React.useEffect(() => {
    if (active) {
      onComplete?.();
    }
  }, [active, onComplete]);

  return null;
};

export default ConfettiV3;
