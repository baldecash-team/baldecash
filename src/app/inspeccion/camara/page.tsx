'use client';

import dynamic from 'next/dynamic';

/**
 * `ssr: false` a propósito, no una optimización de bundle: esta es una
 * pantalla de kiosco cuyo estado entero sale de `localStorage`
 * (`DeviceSession`), que no existe en el servidor. Si `CamaraPageContent`
 * se pre-renderizara en el servidor, ese render SIEMPRE vería "sin sesión"
 * mientras que el primer render del cliente, para el caso normal (un
 * teléfono ya vinculado), lee la sesión real — un mismatch de hidratación
 * garantizado, no hipotético (confirmado en revisión: App Router
 * pre-renderiza los Client Component igual). No hay SEO que preservar ni
 * un usuario esperando el primer paint sin JS — el teléfono queda montado
 * en una pared durante horas — así que sacar esta vista de SSR por
 * completo es la solución de raíz, no un parche puntual.
 */
const CamaraPageContent = dynamic(() => import('./CamaraPageContent'), { ssr: false });

export default function CamaraPage() {
  return <CamaraPageContent />;
}
