'use client';

/**
 * ConfettiV2 - Elegante
 * Burst corto y refinado 1-2 segundos
 */

import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  active?: boolean;
  onComplete?: () => void;
}

export const ConfettiV2: React.FC<ConfettiProps> = ({ active = true, onComplete }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    color: string;
    size: number;
  }>>([]);

  useEffect(() => {
    if (!active) return;

    const colors = ['#4654CD', '#03DBD0', '#22c55e'];
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 20,
      y: 30 + Math.random() * 20,
      delay: Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 4,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-burst-elegant"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '50%',
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes burst-elegant {
          0% {
            transform: scale(0) translate(0, 0);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1) translate(${Math.random() > 0.5 ? '' : '-'}${50 + Math.random() * 100}px, ${Math.random() > 0.5 ? '' : '-'}${50 + Math.random() * 100}px);
            opacity: 0;
          }
        }
        .animate-burst-elegant {
          animation: burst-elegant 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfettiV2;
