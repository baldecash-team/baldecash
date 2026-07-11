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
 * El token del link seguro (segmento [token] de la ruta) viaja como session_id
 * de cada evento (patrón admisión). Así el reporte puede resolver la solicitud
 * exacta hasheando el token contra secure_link.token_hash — sin session anónima
 * ni landing hardcodeada. El token va SOLO en session_id, nunca en properties.
 *
 * Tipografías del rediseño visual (BAL-2183/2184): Asap (texto general) y
 * Baloo 2 (títulos/monto/acentos) YA se cargan una sola vez a nivel global en
 * `src/app/layout.tsx` vía `next/font/google` (Asap + Baloo_2), expuestas como
 * variables CSS `--font-asap` / `--font-baloo-2` en el `<body>` raíz. Este
 * layout anidado las hereda automáticamente — NO se vuelven a instanciar aquí
 * (duplicar `next/font/google` en un layout hijo crearía una segunda
 * descarga/variable en vez de reusar la ya cargada). `--font-sans` (Tailwind)
 * ya resuelve a `--font-asap` (ver globals.css), así que el texto por defecto
 * del flujo de oferta ya usa Asap. Para Baloo 2 en un elemento puntual, seguir
 * el patrón existente en el proyecto: className con arbitrary value
 * `font-['Baloo_2',_sans-serif]` (ver OfertaBannerAprobada.tsx) o
 * `style={{ fontFamily: 'var(--font-baloo-2)' }}`.
 */

import { useEffect, type ReactNode } from 'react';
import { useParams } from 'next/navigation';

import { SessionProvider } from '../../[landing]/solicitar/context/SessionContext';
import { EventTrackerProvider } from '../../[landing]/solicitar/context/EventTrackerContext';

/**
 * Variables de marca (brandbook) para TODA la oferta. El layout de la oferta no
 * monta LayoutContext (que en el flujo normal inyecta estos colores por landing),
 * así que sin esto --color-primary/-secondary resuelven a un lab() roto y
 * --color-primary-rgb queda vacío → los fondos rgba(...) y las cards de seguro
 * (color secundario aqua) se pintan mal.
 *
 * Se setean en :root (document.documentElement), NO en un div: los modales y
 * popovers de NextUI se renderizan en un portal a nivel de <body>, FUERA del
 * árbol del layout. Si las variables vivieran en un div, esos portales heredarían
 * el lab() roto del root (el modal de confirmación pintaba el secundario como un
 * rosado). Setearlas en :root cubre también los portales. Se limpian al salir de
 * la oferta para no contaminar otras rutas.
 */
const BRAND_VARS: Record<string, string> = {
  '--color-primary': '#4654CD',
  '--color-primary-rgb': '70, 84, 205',
  '--color-secondary': '#03DBD0',
  '--color-secondary-rgb': '3, 219, 208',
};

export default function OfertaLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const token = Array.isArray(params?.token) ? params.token[0] : (params?.token ?? '');

  useEffect(() => {
    const root = document.documentElement;
    const previous: Record<string, string> = {};
    for (const [key, value] of Object.entries(BRAND_VARS)) {
      previous[key] = root.style.getPropertyValue(key);
      root.style.setProperty(key, value);
    }
    return () => {
      // Restaurar lo que había (normalmente vacío) al desmontar la oferta.
      for (const [key, prev] of Object.entries(previous)) {
        if (prev) root.style.setProperty(key, prev);
        else root.style.removeProperty(key);
      }
    };
  }, []);

  return (
    <SessionProvider fixedSessionId={token}>
      <EventTrackerProvider>{children}</EventTrackerProvider>
    </SessionProvider>
  );
}
