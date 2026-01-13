'use client';

/**
 * CubeGridSpinner (BucketLoader) - Preloader con cubeta BaldeCash
 * Animación: 3 tickets caen en secuencia dentro de la cubeta
 */

import React from 'react';

interface CubeGridSpinnerProps {
  /** Tamaño del spinner (default: 2.5rem) */
  size?: string;
  /** Color principal - no usado en esta versión, mantiene colores del brand */
  color?: string;
  /** Clase adicional para el contenedor */
  className?: string;
}

export const CubeGridSpinner: React.FC<CubeGridSpinnerProps> = ({
  size = '6rem',
  className = '',
}) => {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{`
          @keyframes t1-show {
            0% { opacity: 1; transform: translateY(0); }
            95% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(5px); }
          }
          @keyframes t2-show {
            0%, 33.33% { opacity: 0; transform: translateY(5px); }
            34% { opacity: 1; transform: translateY(0); }
            95% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(5px); }
          }
          @keyframes t3-show {
            0%, 66.66% { opacity: 0; transform: translateY(5px); }
            67% { opacity: 1; transform: translateY(0); }
            95% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(5px); }
          }
          .ticket-1 { animation: t1-show 1s ease-in-out infinite; }
          .ticket-2 { animation: t2-show 1s ease-in-out infinite; }
          .ticket-3 { animation: t3-show 1s ease-in-out infinite; }
        `}</style>

        <g transform="translate(50 50)">
          <g transform="translate(-50 -50)">
            {/* Ticket 1 */}
            <g className="ticket-1">
              <rect
                x="25"
                y="15"
                width="22"
                height="38"
                rx="2"
                transform="rotate(-25 36 34)"
                fill="#7BE0D0"
              />
            </g>
            {/* Ticket 2 */}
            <g className="ticket-2">
              <rect
                x="42"
                y="5"
                width="22"
                height="38"
                rx="2"
                transform="rotate(-5 53 24)"
                fill="#6ACCC0"
              />
            </g>
            {/* Ticket 3 */}
            <g className="ticket-3">
              <rect
                x="55"
                y="18"
                width="22"
                height="38"
                rx="2"
                transform="rotate(35 66 37)"
                fill="#5B9E93"
              />
            </g>

            {/* Cubeta Fija */}
            <path
              d="M20 35 L30 85 C31 88 34 90 37 90 H73 C76 90 79 88 80 85 L90 35 H20Z"
              fill="#4C5FD5"
            />
            <path
              d="M15 30 H95 C97 30 98 32 97 34 L95 38 H15 L13 34 C12 32 13 30 15 30Z"
              fill="#3D4CB8"
            />
            <path
              d="M35 55 C35 55 40 70 55 70 C70 70 75 55 75 55"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default CubeGridSpinner;
