import { render, screen } from '@testing-library/react';
import { Navbar } from '../Navbar';
import { PreviewProvider } from '../../../context/PreviewContext';
import { LANDING_IDS } from '../../../utils/landingIds';

/**
 * CTA "Ver catálogo" del navbar en la landing de seminuevos (BAL-3288, Tarea 9).
 *
 * El Navbar consume usePreview(), que exige el PreviewProvider aunque no haya
 * preview activo (ver institutionLogoGate.test.tsx). Sin este wrapper el
 * render revienta antes de llegar al CTA.
 */
function renderNavbar(ui: React.ReactElement) {
  return render(<PreviewProvider>{ui}</PreviewProvider>);
}

describe('Navbar — CTA de la landing de seminuevos', () => {
  it('no muestra el CTA cuando no se pasa landingId', () => {
    renderNavbar(<Navbar landing="home" />);
    expect(screen.queryByTestId('navbar-cta-catalogo')).not.toBeInTheDocument();
  });

  it('no muestra el CTA en otras landings especiales', () => {
    renderNavbar(<Navbar landing="nvidia" landingId={LANDING_IDS.NVIDIA} />);
    expect(screen.queryByTestId('navbar-cta-catalogo')).not.toBeInTheDocument();
  });

  it('muestra el CTA en la landing de seminuevos', () => {
    renderNavbar(<Navbar landing="seminuevos" landingId={LANDING_IDS.SEMINUEVOS} />);
    const cta = screen.getByTestId('navbar-cta-catalogo');
    expect(cta).toHaveTextContent('Ver catálogo');
    expect(cta).toHaveAttribute('href', expect.stringContaining('/seminuevos/catalogo'));
  });
});

describe('Navbar — hidePortalButton', () => {
  it('muestra "Zona Estudiantes" por default (retrocompatibilidad)', () => {
    renderNavbar(<Navbar landing="home" />);
    expect(screen.getAllByText('Zona Estudiantes').length).toBeGreaterThan(0);
  });

  it('oculta "Zona Estudiantes" cuando hidePortalButton es true (seminuevos no tiene portal propio)', () => {
    renderNavbar(
      <Navbar landing="seminuevos" landingId={LANDING_IDS.SEMINUEVOS} hidePortalButton />
    );
    expect(screen.queryByText('Zona Estudiantes')).not.toBeInTheDocument();
    // El CTA de catálogo sigue presente: hidePortalButton solo apaga el portal.
    expect(screen.getByTestId('navbar-cta-catalogo')).toBeInTheDocument();
  });
});
