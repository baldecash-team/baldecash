'use client';

import dynamic from 'next/dynamic';

/**
 * `ssr: false` a propósito — mismo motivo que `camara/page.tsx`: esta es
 * una pantalla de kiosco (el controlador de la estación) cuyo estado sale
 * de `localStorage`, inexistente en el servidor. Un render de servidor de
 * `EscanerPageContent` nunca puede coincidir con el primer render del
 * cliente de un escáner ya vinculado, así que se saca de SSR por completo
 * en vez de mitigar el mismatch caso por caso.
 */
const EscanerPageContent = dynamic(() => import('./EscanerPageContent'), { ssr: false });

export default function EscanerPage() {
  return <EscanerPageContent />;
}
