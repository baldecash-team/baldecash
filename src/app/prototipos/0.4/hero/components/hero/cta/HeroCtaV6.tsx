'use client';

/**
 * HeroCtaV6 - Con Urgencia
 *
 * Concepto: Botón con contador de tiempo u oferta limitada
 * Estilo: FOMO moderado, incentiva acción inmediata
 * Uso: Para campañas con ofertas por tiempo limitado
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { Clock, Laptop } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeroCtaV6Props {
  onCtaClick?: () => void;
}

export const HeroCtaV6: React.FC<HeroCtaV6Props> = ({ onCtaClick }) => {
  const router = useRouter();
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

  const handleClick = () => {
    onCtaClick?.();
    router.push('/prototipos/0.4/catalogo');
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Contador */}
      <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
        <Clock className="w-4 h-4 text-amber-600" />
        <span className="text-sm text-amber-700">
          Oferta termina en{' '}
          <span className="font-mono font-bold">
            {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
          </span>
        </span>
      </div>

      {/* Botón */}
      <Button
        size="lg"
        radius="lg"
        className="bg-[#4654CD] text-white font-semibold px-10 h-14 text-base cursor-pointer hover:bg-[#3a47b3] transition-colors shadow-lg shadow-[#4654CD]/25"
        startContent={<Laptop className="w-5 h-5" />}
        onPress={handleClick}
      >
        Ver productos
      </Button>

      {/* Beneficio */}
      <p className="text-sm text-[#03DBD0] font-medium">
        0% interés en tu primera cuota
      </p>
    </div>
  );
};

export default HeroCtaV6;
