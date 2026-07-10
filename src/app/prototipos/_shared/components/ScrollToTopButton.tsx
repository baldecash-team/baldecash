'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTopButton — botón flotante "volver arriba" reutilizable.
 *
 * Aparece cuando la página se ha desplazado más de `threshold` px y hace scroll
 * suave al top. El estilo (color/forma) es configurable vía `className`/`style`
 * para que cada catálogo use su propio tema (general vs. oferta).
 *
 * Se puede ocultar condicionalmente con `hidden` (p. ej. mientras hay un drawer
 * o modal abierto) sin perder el listener de scroll.
 */
export interface ScrollToTopButtonProps {
  /** Px de scroll a partir de los cuales aparece el botón. Default 300. */
  threshold?: number;
  /** Fuerza ocultarlo aunque haya scroll (drawers/modales abiertos). */
  hidden?: boolean;
  /** Clases del botón (forma/tamaño/transiciones). */
  className?: string;
  /** Estilo inline del botón (color de fondo/sombra según tema). */
  style?: CSSProperties;
  /** Texto accesible. Default "Volver arriba". */
  ariaLabel?: string;
}

export function ScrollToTopButton({
  threshold = 300,
  hidden = false,
  className,
  style,
  ariaLabel = 'Volver arriba',
}: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  if (!visible || hidden) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={ariaLabel}
      className={className}
      style={style}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2.4} />
    </button>
  );
}
