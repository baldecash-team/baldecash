'use client';

/**
 * CountdownTimer - Componente de cuenta regresiva
 * Muestra días, horas, minutos y segundos restantes
 */

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  /** Fecha/hora de finalización */
  endDate: Date;
  /** Texto a mostrar cuando termina */
  expiredText?: string;
  /** Variante de estilo */
  variant?: 'default' | 'compact' | 'large';
  /** Color de acento */
  accentColor?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endDate,
  expiredText = 'Oferta finalizada',
  variant = 'default',
  accentColor = '#4654CD',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const padNumber = (num: number) => num.toString().padStart(2, '0');

  if (isExpired) {
    return (
      <div className="text-center py-2 px-4 bg-neutral-100 rounded-lg">
        <p className="text-neutral-500 font-medium">{expiredText}</p>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'Días' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' },
  ];

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" style={{ color: accentColor }} />
        <span className="font-mono font-bold text-lg">
          {padNumber(timeLeft.hours)}:{padNumber(timeLeft.minutes)}:{padNumber(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 justify-center">
          <Clock className="w-5 h-5" style={{ color: accentColor }} />
          <span className="text-sm font-medium text-neutral-600">La oferta termina en:</span>
        </div>
        <div className="flex gap-3 justify-center">
          {timeUnits.map((unit, index) => (
            <div key={unit.label} className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ backgroundColor: accentColor }}
              >
                {padNumber(unit.value)}
              </div>
              <span className="text-xs text-neutral-500 mt-1">{unit.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5" style={{ color: accentColor }} />
        <span className="text-sm font-medium text-neutral-600">Termina en:</span>
      </div>
      <div className="flex gap-2">
        {timeUnits.map((unit) => (
          <div key={unit.label} className="flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: accentColor }}
            >
              {padNumber(unit.value)}
            </div>
            <span className="text-[10px] text-neutral-400 mt-0.5">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
