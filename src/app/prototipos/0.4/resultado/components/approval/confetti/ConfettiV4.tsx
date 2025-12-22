'use client';

/**
 * ConfettiV4 - Fintech
 * Partículas que flotan suavemente, estilo minimalista
 */

import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  active?: boolean;
  onComplete?: () => void;
}

export const ConfettiV4: React.FC<ConfettiProps> = ({ active = true, onComplete }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
    color: string;
    size: number;
  }>>([]);

  useEffect(() => {
    if (!active) return;

    // Colores de marca BaldeCash - solo 2 colores para elegancia
    const colors = ['#4654CD', '#03DBD0'];
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 3 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 4,
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
          className="absolute animate-float-fintech"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '50%',
            opacity: 0.6,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float-fintech {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          20% {
            transform: translateY(-10px) scale(1);
            opacity: 0.6;
          }
          80% {
            transform: translateY(-30px) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-50px) scale(0.5);
            opacity: 0;
          }
        }
        .animate-float-fintech {
          animation: float-fintech ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfettiV4;
