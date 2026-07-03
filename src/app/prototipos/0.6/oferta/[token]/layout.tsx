'use client';

/**
 * Layout de la oferta (Caso 4 · BAL-1785). Monta el sistema de tracking de
 * comportamiento (SessionProvider + EventTrackerProvider) para que las
 * interacciones del cliente en el catálogo de la oferta (filtros, búsqueda,
 * orden, clics en producto) se registren como eventos de analytics.
 *
 * El catálogo de la oferta reusa CatalogLayoutV4, que ya llama useAnalytics()
 * internamente → con estos providers montados, filter_toggle / sort_change /
 * catalog_load_more / search_submit se emiten automáticamente.
 *
 * landingSlug="home": el endpoint POST /public/tracking/session valida que el
 * slug exista como landing real en la BD, así que usamos "home" (la landing del
 * catálogo de la oferta). No hay dependencia de application_id: el UUID se
 * auto-genera. El origen "oferta" se distingue por la ruta de la página
 * (page_url) que el tracker envía en cada evento.
 */

import type { CSSProperties, ReactNode } from 'react';

import { SessionProvider } from '../../[landing]/solicitar/context/SessionContext';
import { EventTrackerProvider } from '../../[landing]/solicitar/context/EventTrackerContext';

/**
 * Variables de marca (brandbook) para TODA la oferta. El layout de la oferta no
 * monta LayoutContext (que en el flujo normal inyecta estos colores por landing),
 * así que sin esto --color-primary/-secondary resuelven a un lab() roto y
 * --color-primary-rgb queda vacío → los fondos rgba(...) y las cards de seguro
 * (color secundario aqua) se pintan mal. Se define una sola vez aquí y todas las
 * páginas de la oferta (portada, catálogo, detalle, accesorios) lo heredan.
 */
const BRAND_VARS = {
  '--color-primary': '#4654CD',
  '--color-primary-rgb': '70, 84, 205',
  '--color-secondary': '#03DBD0',
  '--color-secondary-rgb': '3, 219, 208',
} as CSSProperties;

export default function OfertaLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider landingSlug="home">
      <EventTrackerProvider>
        <div style={BRAND_VARS}>{children}</div>
      </EventTrackerProvider>
    </SessionProvider>
  );
}
