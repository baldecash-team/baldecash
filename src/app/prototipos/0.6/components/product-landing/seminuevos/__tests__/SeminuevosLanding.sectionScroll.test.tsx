import { act, render, screen, fireEvent } from '@testing-library/react';
import SeminuevosLanding from '../SeminuevosLanding';
import { navItems } from '../data/seminuevosData';

// El handler de scroll espera 2 rAF antes de scrollear (deja asentar el
// colapso del menú mobile antes de animar) — ver comentario en
// SeminuevosLanding.tsx. Los tests deben avanzar esos frames a mano.
async function flushAnimationFrames() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

/**
 * Menú de navegación con anclas (BAL-3288, Tarea A).
 *
 * El Navbar real transforma cada href a `{heroUrl}#seccion` y solo hace
 * scroll suave si `window.location.pathname` coincide con `heroUrl` — algo
 * que NO pasa en `/preview/{id}` (ver comentario en SeminuevosLanding.tsx).
 * Este mock expone los navbarItems tal como los recibe, con un href que
 * simula esa ruta divergente (una landing real, no la ruta de preview),
 * para probar que la intercepción propia de SeminuevosLanding (por hash,
 * no por ruta) scrollea igual.
 */
jest.mock('../../../hero/Navbar', () => ({
  Navbar: ({ navbarItems }: { navbarItems: { label: string; href: string }[] }) => (
    <nav data-testid="navbar-mock">
      {navbarItems.map((item) => (
        <a key={item.label} href={`/prototipos/0.6/seminuevos${item.href}`}>
          {item.label}
        </a>
      ))}
    </nav>
  ),
}));

jest.mock('../../../hero/Footer', () => ({
  Footer: () => <footer data-testid="footer-compartido" />,
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
  Element.prototype.scrollTo = jest.fn();
});

beforeEach(() => {
  (Element.prototype.scrollIntoView as jest.Mock).mockClear();
  // Simula estar en /preview/241, distinto del heroUrl que arma el href.
  window.history.pushState({}, '', '/prototipos/0.6/preview/241');
});

/**
 * El menú ya NO sale de `navItems`: viene de BD y lo pasa quien monta la
 * landing (`LandingPageClient` / `PreviewPageClient`). Estos tests lo simulan
 * con la misma forma que llega en producción — sin la prop no hay menú, que es
 * justo lo que pasaba antes de conectarlo (BAL-3288).
 *
 * `navItems` se mantiene como fuente de las secciones scrolleables, que es para
 * lo único que sigue sirviendo.
 */
const ITEMS_DE_BD = navItems.map((item) => ({
  label: item.label,
  href: `#${item.sectionId}`,
  section: item.sectionId,
}));

const SECCIONES = navItems.map((item) => item.sectionId);

describe('SeminuevosLanding — menú de anclas', () => {
  it('expone un item de navbar por cada sección, con los labels exactos', () => {
    render(<SeminuevosLanding landing="seminuevos" navbarItems={ITEMS_DE_BD} />);
    navItems.forEach((item) => {
      expect(screen.getByRole('link', { name: item.label })).toBeInTheDocument();
    });
  });

  it('hace scroll suave a "¿Qué es?" aunque la ruta no coincida (caso preview)', async () => {
    render(<SeminuevosLanding landing="seminuevos" navbarItems={ITEMS_DE_BD} />);
    const link = screen.getByRole('link', { name: '¿Qué es?' });
    fireEvent.click(link);
    await flushAnimationFrames();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth', block: 'start' })
    );
  });

  it('respeta prefers-reduced-motion con un salto instantáneo', async () => {
    const matchMediaMock = jest.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMediaMock });

    render(<SeminuevosLanding landing="seminuevos" navbarItems={ITEMS_DE_BD} />);
    const link = screen.getByRole('link', { name: 'Nosotros' });
    fireEvent.click(link);
    await flushAnimationFrames();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'auto', block: 'start' })
    );
  });
});
