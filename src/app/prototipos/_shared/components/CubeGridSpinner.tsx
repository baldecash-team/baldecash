'use client';

/**
 * CubeGridSpinner - Preloader estilo pidetuprestamo.baldecash.com
 * Grid de 9 cubos con animación de escala en onda
 */

import React from 'react';

interface CubeGridSpinnerProps {
  /** Tamaño del spinner (default: 2.5rem) */
  size?: string;
  /** Color de los cubos (default: #03dbd0 turquesa BaldeCash) */
  color?: string;
  /** Clase adicional para el contenedor */
  className?: string;
}

const cubeDelays = ['0.2s', '0.3s', '0.4s', '0.1s', '0.2s', '0.3s', '0s', '0.1s', '0.2s'];

export const CubeGridSpinner: React.FC<CubeGridSpinnerProps> = ({
  size = '2.5rem',
  color = '#03dbd0',
  className = '',
}) => {
  return (
    <>
      <style>{`
        .cube-grid-spinner {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .cube-grid-spinner__cube {
          animation: cubeGridScale 1.3s infinite ease-in-out;
        }
        @keyframes cubeGridScale {
          0%, 70%, 100% {
            transform: scale3D(1, 1, 1);
          }
          35% {
            transform: scale3D(0, 0, 1);
          }
        }
      `}</style>
      <div
        className={`cube-grid-spinner ${className}`}
        style={{ width: size, height: size }}
      >
        {cubeDelays.map((delay, index) => (
          <div
            key={index}
            className="cube-grid-spinner__cube"
            style={{
              backgroundColor: color,
              animationDelay: delay,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default CubeGridSpinner;
