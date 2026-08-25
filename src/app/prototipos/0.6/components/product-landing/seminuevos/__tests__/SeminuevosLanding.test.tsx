import { render, screen } from '@testing-library/react';
import SeminuevosLanding from '../SeminuevosLanding';

jest.mock('../../../hero/Footer', () => ({
  Footer: () => <footer data-testid="footer-compartido" />,
}));

// El Navbar real exige PreviewProvider (usePreview) y trae mucho peso propio
// (megamenu, tracker, ResizeObserver de altura) que no aporta a este test de
// orquestador. Se mockea igual que el Footer — su montaje real ya está cubierto
// por Navbar.seminuevosCta.test.tsx.
jest.mock('../../../hero/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar-mock" />,
}));

// El Inspector (montado dentro del orquestador) centra la tab activa al
// cambiar de pieza usando scrollTo sobre el strip; jsdom no lo implementa.
// Mismo polyfill que SeminuevosInspector.test.tsx.
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
  Element.prototype.scrollTo = jest.fn();
});

describe('SeminuevosLanding', () => {
  it('renderiza el navbar, el hero y el footer compartido', () => {
    render(<SeminuevosLanding landing="seminuevos" />);
    expect(screen.getByTestId('navbar-mock')).toBeInTheDocument();
    // El hero se comprueba por su banner y no por el <h1>: el bloque de copy
    // está oculto (MOSTRAR_COPY_HERO en SeminuevosHero), así que ese heading ya
    // no es accesible.
    expect(screen.getByAltText('Equipos seminuevos BaldeCash')).toBeInTheDocument();
    expect(screen.getByTestId('footer-compartido')).toBeInTheDocument();
  });

  it('muestra el botón flotante de WhatsApp', () => {
    render(<SeminuevosLanding landing="seminuevos" />);
    // La sección "Sobre nosotros" ya trae un ícono de WhatsApp entre sus redes
    // (aria-label "WhatsApp: <número>"), distinto del botón flotante que agrega
    // esta tarea (aria-label "Escríbenos por WhatsApp"). Se matchea por el label
    // exacto del botón flotante para no engancharse con ese otro link.
    const wa = screen.getByRole('link', { name: 'Escríbenos por WhatsApp' });
    expect(wa).toHaveAttribute('href', expect.stringContaining('wa.me'));
    expect(wa).toHaveAttribute('target', '_blank');
  });

  it('no rompe cuando no hay footerData ni faqData', () => {
    expect(() =>
      render(<SeminuevosLanding landing="seminuevos" footerData={null} faqData={null} />)
    ).not.toThrow();
  });
});
