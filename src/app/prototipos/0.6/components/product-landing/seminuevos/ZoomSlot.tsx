'use client';

import { useRef, useState } from 'react';
import { MediaSlot } from './MediaSlot';

/** Cuánto amplía la lupa. 2.2x sobre una foto de 1200px servida a ~600 todavía
 *  muestra píxel real, sin llegar a verse borrosa. */
const ZOOM = 2.2;

export interface ZoomSlotProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Clic o toque. Con esto la imagen pasa a ser un botón que abre el visor. */
  onAmpliar?: () => void;
}

/**
 * Imagen con lupa: al pasar el mouse (o apoyar el dedo) se amplía siguiendo el
 * puntero, dentro del mismo recuadro. Para el inspector de seminuevos, donde lo
 * que hay que mirar son rayones y desgaste (BAL-3317).
 *
 * Se apoya en MediaSlot en vez de duplicarlo, así el placeholder y el manejo de
 * error siguen viviendo en un solo sitio.
 */
export function ZoomSlot({ src, alt, className = '', onAmpliar }: ZoomSlotProps) {
  const [zoom, setZoom] = useState(false);
  // Origen del zoom en %, que es lo que entiende transform-origin.
  const [origen, setOrigen] = useState({ x: 50, y: 50 });
  const caja = useRef<HTMLDivElement>(null);

  const mover = (clientX: number, clientY: number) => {
    const r = caja.current?.getBoundingClientRect();
    if (!r) return;
    // Acotado a [0,100]: al arrastrar el dedo, el touchmove sigue llegando
    // cuando el puntero ya salió del recuadro, y sin el clamp la imagen se
    // desplaza más allá de sus bordes y deja ver el fondo.
    const pct = (v: number, min: number, size: number) =>
      Math.min(100, Math.max(0, ((v - min) / size) * 100));
    setOrigen({ x: pct(clientX, r.left, r.width), y: pct(clientY, r.top, r.height) });
  };

  // Sin imagen no hay nada que ampliar: que el placeholder lo resuelva MediaSlot.
  if (!src) return <MediaSlot src={src} alt={alt} className={className} />;

  return (
    <div
      ref={caja}
      data-testid="zoom-slot"
      data-zoom={zoom ? 'on' : 'off'}
      className={`relative overflow-hidden rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul)] focus-visible:ring-offset-2 ${
        onAmpliar ? 'cursor-zoom-in' : ''
      } ${className}`}
      // La lupa es SOLO de hover, o sea solo desktop. En táctil el zoom a dedo
      // apoyado competía con el scroll de la página --arrastrar para bajar
      // ampliaba la foto-- así que ahí el toque abre el visor y ya.
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={(e) => mover(e.clientX, e.clientY)}
      onClick={onAmpliar}
      // Enter y Espacio, que es lo que espera quien navega con teclado.
      onKeyDown={(e) => {
        if (!onAmpliar || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        onAmpliar();
      }}
      role={onAmpliar ? 'button' : undefined}
      tabIndex={onAmpliar ? 0 : undefined}
      aria-label={onAmpliar ? `Ampliar: ${alt}` : undefined}
      style={{
        // El origen va acá y no en la imagen para no reconstruir su className
        // en cada mousemove; MediaSlot hereda estas dos custom properties.
        ['--zoom-x' as string]: `${origen.x}%`,
        ['--zoom-y' as string]: `${origen.y}%`,
      }}
    >
      <MediaSlot
        src={src}
        alt={alt}
        className="h-full transition-transform duration-200 ease-out origin-[var(--zoom-x)_var(--zoom-y)]"
        style={zoom ? { transform: `scale(${ZOOM})` } : undefined}
      />
      {!zoom && onAmpliar && (
        <span
          data-testid="zoom-hint"
          aria-hidden="true"
          className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
          style={{ background: 'rgba(21,23,68,.6)' }}
        >
          Toca para ampliar
        </span>
      )}
    </div>
  );
}
