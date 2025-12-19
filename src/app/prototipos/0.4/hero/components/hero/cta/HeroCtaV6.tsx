'use client';

/**
 * HeroCtaV6 - Boton con Urgencia
 *
 * Concepto: "Solo hoy" o contador sutil
 * Estilo: FOMO moderado, sin agresividad
 */

import React, { useState, useEffect } from 'react';
import { Button, Chip } from '@nextui-org/react';
import { Clock, Zap } from 'lucide-react';

interface HeroCtaV6Props {
  onCtaClick?: () => void;
}

export const HeroCtaV6: React.FC<HeroCtaV6Props> = ({ onCtaClick }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 32, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Urgency Badge */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
        <Clock className="w-4 h-4 text-amber-600" />
        <span className="text-sm text-amber-700">
          Oferta termina en{' '}
          <span className="font-mono font-bold">
            {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
          </span>
        </span>
      </div>

      <Button
        size="lg"
        className="bg-[#4654CD] text-white font-semibold px-12 py-6 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
        startContent={<Zap className="w-5 h-5" />}
        onPress={onCtaClick}
      >
        Solicitar ahora
      </Button>

      <div className="flex items-center gap-2">
        <Chip
          size="sm"
          radius="sm"
          classNames={{
            base: 'bg-[#03DBD0]/20 px-2 py-0.5 h-auto',
            content: 'text-xs font-semibold text-[#02C3BA]',
          }}
        >
          0% interés primera cuota
        </Chip>
      </div>
    </div>
  );
};

export default HeroCtaV6;
