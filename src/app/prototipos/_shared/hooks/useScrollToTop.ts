'use client';

import { useEffect } from 'react';

/**
 * Hook para hacer scroll al top de la página al montar el componente.
 * Usar en páginas para asegurar que la navegación inicie desde el header.
 */
export const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};
