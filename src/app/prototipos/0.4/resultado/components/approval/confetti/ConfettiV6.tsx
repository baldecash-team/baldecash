'use client';

/**
 * ConfettiV6 - Máximo impacto
 * Lluvia completa de confetti en toda la pantalla con colores de marca
 */

import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  active?: boolean;
  onComplete?: () => void;
}

export const ConfettiV6: React.FC<ConfettiProps> = ({ active = true, onComplete }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    duration: number;
    color: string;
    size: number;
    rotation: number;
    shape: 'circle' | 'square' | 'ribbon';
  }>>([]);

  useEffect(() => {
    if (!active) return;

    // Colores de marca BaldeCash extendidos
    const colors = ['#4654CD', '#03DBD0', '#22c55e', '#f59e0b', '#ec4899', '#6873D7', '#00E4D3'];
    const shapes: Array<'circle' | 'square' | 'ribbon'> = ['circle', 'square', 'ribbon'];

    const newParticles = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 12,
      rotation: Math.random() * 360,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 6000);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  const getShapeStyle = (shape: 'circle' | 'square' | 'ribbon', size: number) => {
    switch (shape) {
      case 'circle':
        return { borderRadius: '50%', width: size, height: size };
      case 'square':
        return { borderRadius: '2px', width: size, height: size };
      case 'ribbon':
        return { borderRadius: '1px', width: size / 3, height: size * 1.5 };
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-max"
          style={{
            left: `${p.x}%`,
            top: '-30px',
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ...getShapeStyle(p.shape, p.size),
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-max {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(1080deg) scale(0.5);
            opacity: 0;
          }
        }
        .animate-confetti-max {
          animation: confetti-max linear forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfettiV6;
