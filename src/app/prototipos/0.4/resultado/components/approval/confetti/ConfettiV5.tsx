'use client';

/**
 * ConfettiV5 - Un solo lado
 * Confetti que cae solo por el lado derecho de la pantalla
 */

import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  active?: boolean;
  onComplete?: () => void;
}

export const ConfettiV5: React.FC<ConfettiProps> = ({ active = true, onComplete }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    duration: number;
    color: string;
    size: number;
    rotation: number;
  }>>([]);

  useEffect(() => {
    if (!active) return;

    const colors = ['#4654CD', '#03DBD0', '#22c55e', '#f59e0b'];
    // Solo en el lado derecho (50% - 100% del ancho)
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: 50 + Math.random() * 50, // Solo lado derecho
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-side"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-side {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(-50px) rotate(540deg);
            opacity: 0;
          }
        }
        .animate-confetti-side {
          animation: confetti-side linear forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfettiV5;
