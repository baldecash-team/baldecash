'use client';

/**
 * ProfileIdentificationV2 - Cards integradas en hero
 *
 * Caracteristicas:
 * - Cards visibles dentro del hero
 * - Mantiene flujo visual sin interrumpir
 * - Menos friccion que modal
 * - Estado seleccionado con color primario
 */

import React, { useState } from 'react';
import { GraduationCap, Briefcase, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProfileIdentificationProps } from '../../../types/hero';

export const ProfileIdentificationV2: React.FC<ProfileIdentificationProps> = ({
  onSelectProfile,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const profiles = [
    {
      id: 'student' as const,
      icon: GraduationCap,
      title: 'Soy estudiante',
      description: 'Accede a financiamiento exclusivo',
      recommended: true,
    },
    {
      id: 'other' as const,
      icon: Briefcase,
      title: 'Soy profesional',
      description: 'Ver opciones de credito',
      recommended: false,
    },
  ];

  const handleSelect = (profileId: string) => {
    setSelectedProfile(profileId);
    onSelectProfile?.(profileId as 'student' | 'other');
  };

  const getButtonStyles = (profile: typeof profiles[0]) => {
    const isSelected = selectedProfile === profile.id;

    if (isSelected) {
      // Estado seleccionado: siempre color primario
      return 'border-[#4654CD] bg-[#4654CD] text-white';
    }

    if (profile.recommended) {
      // Recomendado pero no seleccionado
      return 'border-[#4654CD] bg-[#4654CD]/5 hover:bg-[#4654CD]/10';
    }

    // Default no seleccionado
    return 'border-neutral-200 bg-white hover:border-[#4654CD] hover:bg-[#4654CD]/5';
  };

  return (
    <div className="py-8">
      <p className="text-sm text-neutral-500 text-center mb-4">
        Selecciona tu perfil para ver ofertas personalizadas
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {profiles.map((profile, index) => {
          const isSelected = selectedProfile === profile.id;

          return (
            <motion.button
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(profile.id)}
              className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all cursor-pointer ${getButtonStyles(profile)}`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-white/20'
                    : profile.recommended
                    ? 'bg-[#4654CD]/10'
                    : 'bg-neutral-100'
                }`}
              >
                {isSelected ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <profile.icon
                    className={`w-6 h-6 ${
                      profile.recommended ? 'text-[#4654CD]' : 'text-neutral-500'
                    }`}
                  />
                )}
              </div>
              <div className="text-left">
                <p
                  className={`font-semibold transition-colors ${
                    isSelected
                      ? 'text-white'
                      : profile.recommended
                      ? 'text-[#4654CD]'
                      : 'text-neutral-800'
                  }`}
                >
                  {profile.title}
                </p>
                <p className={`text-sm transition-colors ${
                  isSelected ? 'text-white/80' : 'text-neutral-500'
                }`}>
                  {profile.description}
                </p>
              </div>
              <ArrowRight
                className={`w-5 h-5 transition-colors ${
                  isSelected
                    ? 'text-white'
                    : profile.recommended
                    ? 'text-[#4654CD]'
                    : 'text-neutral-400'
                }`}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileIdentificationV2;
