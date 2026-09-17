/**
 * BAL-3883 — el catálogo acotado (segundo financiamiento) se decidía con una
 * regex sobre el slug (`isSecondFinancingLanding`), así que una landing nueva
 * llamada `renueva-algo` heredaba el comportamiento sin que nadie lo decida.
 * Ahora lo deciden dos presets independientes:
 *  - `filtroPorUso`: las 4 tarjetas de uso + el título "Encuentra tu equipo
 *    ideal".
 *  - `barraDeOrden`: la franja con el contador de equipos + el selector de
 *    orden.
 * Ambos vienen del backend vía `features.has_usage_filter` /
 * `features.has_catalog_sort_bar`. El `!== false` (ausencia = encendido) lo
 * resuelve LayoutContext antes de llegar acá — ver
 * LayoutContext.tsx — así que estas props ya llegan resueltas a
 * `true`/`false`; este archivo no repite esa lógica, solo verifica que cada
 * prop controla su mitad del bloque. El caso "config vacío" se simula tal
 * como lo resolvería LayoutContext: `true` para ambas.
 */
import { render, screen } from '@testing-library/react';
import { CatalogLayoutV4 } from '../CatalogLayoutV4';
import { CatalogLayoutProps, defaultFilterState, defaultCatalogConfig } from '../../../../types/catalog';

// NextUI's Ripple (montado por Card isPressable, Select, botones) usa el
// namespace `m` de framer-motion, que jest.setup.js no mockea (solo mockea
// `motion`). Sin este mock el render revienta con
// "Cannot read properties of undefined (reading 'span')".
jest.mock('@nextui-org/ripple', () => ({
  Ripple: () => null,
  useRipple: () => ({ ripples: [], onClear: jest.fn(), onPress: jest.fn() }),
}));

const TITULO_USO = 'Encuentra tu equipo ideal';

function renderLayout(overrides: Partial<CatalogLayoutProps> = {}) {
  const props: CatalogLayoutProps = {
    products: [],
    filters: defaultFilterState,
    onFiltersChange: jest.fn(),
    sort: 'recommended',
    onSortChange: jest.fn(),
    config: defaultCatalogConfig,
    totalProducts: 0,
    ...overrides,
  };
  return render(<CatalogLayoutV4 {...props} />);
}

describe('CatalogLayoutV4 — filtroPorUso / barraDeOrden (BAL-3883)', () => {
  it('sin presets (config vacío): se ven los DOS bloques — protege las 100+ landings existentes', () => {
    // LayoutContext resuelve `cfg.features?.has_usage_filter !== false` y
    // `cfg.features?.has_catalog_sort_bar !== false`: ante un config() vacío
    // (sin la clave) ambos quedan en `true` antes de llegar a este layout.
    renderLayout({ filtroPorUso: true, barraDeOrden: true });

    expect(screen.getByText(TITULO_USO)).toBeInTheDocument();
    expect(document.getElementById('onboarding-quick-cards')).toBeInTheDocument();
    expect(document.getElementById('onboarding-sort')).toBeInTheDocument();
  });

  it('has_usage_filter: false → no se ven las tarjetas de uso ni su título, pero SÍ la franja de contador/orden', () => {
    renderLayout({ filtroPorUso: false, barraDeOrden: true });

    expect(screen.queryByText(TITULO_USO)).not.toBeInTheDocument();
    expect(document.getElementById('onboarding-quick-cards')).not.toBeInTheDocument();
    expect(document.getElementById('onboarding-sort')).toBeInTheDocument();
  });

  it('has_catalog_sort_bar: false → no se ve la franja, pero SÍ las tarjetas', () => {
    renderLayout({ filtroPorUso: true, barraDeOrden: false });

    expect(screen.getByText(TITULO_USO)).toBeInTheDocument();
    expect(document.getElementById('onboarding-quick-cards')).toBeInTheDocument();
    expect(document.getElementById('onboarding-sort')).not.toBeInTheDocument();
  });

  it('ambos en false → no se ve ninguno de los dos bloques (ni la card que los envuelve)', () => {
    renderLayout({ filtroPorUso: false, barraDeOrden: false });

    expect(screen.queryByText(TITULO_USO)).not.toBeInTheDocument();
    expect(document.getElementById('onboarding-quick-cards')).not.toBeInTheDocument();
    expect(document.getElementById('onboarding-sort')).not.toBeInTheDocument();
  });
});
