'use client';

/**
 * SoundConfigV2 - Silencioso
 * Sin sonido por defecto, experiencia silenciosa
 */

import React from 'react';

interface SoundConfigProps {
  autoPlay?: boolean;
  onSoundToggle?: (isMuted: boolean) => void;
}

export const SoundConfigV2: React.FC<SoundConfigProps> = () => {
  // Esta versión no reproduce sonido ni muestra controles
  // Experiencia completamente silenciosa por respeto al contexto
  return null;
};

export default SoundConfigV2;
