import { render, screen } from '@testing-library/react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { PreviewProvider } from '../../../context/PreviewContext';

/**
 * Gate del logo institucional (BAL-2970).
 *
 * `showInstitutionLogo` permite que una landing de convenio oculte la marca de
 * la institución. Se prueban los CUATRO puntos de render, no solo el header:
 * el footer tiene un fallback de TEXTO que imprime el nombre corto cuando no
 * hay logo, así que apagar solo el <img> haría aparecer "UTP" en letras.
 */

const LOGO = 'https://baldecash.s3.amazonaws.com/institutions/utp.png';

const AGREEMENT = {
  id: 61,
  code: 'utp',
  name: 'UTP',
  institution_name: 'UTP',
  institution_short_name: 'UTP',
  institution_logo: LOGO,
};

// El Navbar consume usePreview(), que exige el provider aunque no haya preview
// activo. Sin este wrapper el render revienta antes de llegar al logo.
function renderNavbar(ui: React.ReactElement) {
  return render(<PreviewProvider>{ui}</PreviewProvider>);
}

describe('Navbar — gate del logo institucional', () => {
  it('muestra el logo cuando showInstitutionLogo es true', () => {
    renderNavbar(<Navbar institutionLogo={LOGO} institutionName="UTP" showInstitutionLogo />);
    expect(screen.getByAltText('UTP')).toBeInTheDocument();
  });

  it('muestra el logo cuando la prop no se pasa (retrocompatibilidad)', () => {
    renderNavbar(<Navbar institutionLogo={LOGO} institutionName="UTP" />);
    expect(screen.getByAltText('UTP')).toBeInTheDocument();
  });

  it('oculta el logo cuando showInstitutionLogo es false', () => {
    renderNavbar(<Navbar institutionLogo={LOGO} institutionName="UTP" showInstitutionLogo={false} />);
    expect(screen.queryByAltText('UTP')).not.toBeInTheDocument();
  });

  // El separador vive dentro del mismo fragmento que el <img>: si quedara
  // suelto, el header mostraria un "x" flotante sin logo al lado.
  it('oculta tambien el separador cuando el logo esta apagado', () => {
    const { container } = renderNavbar(
      <Navbar institutionLogo={LOGO} institutionName="UTP" showInstitutionLogo={false} />,
    );
    expect(container.textContent).not.toContain('×');
  });

  // Rama logoOnly: es el navbar sin navegacion (cupon de campania / oferta).
  it('respeta el flag en la rama logoOnly', () => {
    renderNavbar(<Navbar logoOnly institutionLogo={LOGO} institutionName="UTP" showInstitutionLogo={false} />);
    expect(screen.queryByAltText('UTP')).not.toBeInTheDocument();
  });

  it('muestra el logo en la rama logoOnly cuando el flag esta encendido', () => {
    renderNavbar(<Navbar logoOnly institutionLogo={LOGO} institutionName="UTP" showInstitutionLogo />);
    expect(screen.getByAltText('UTP')).toBeInTheDocument();
  });
});

describe('Footer — gate del logo institucional', () => {
  it('muestra el logo cuando showInstitutionLogo es true', () => {
    render(<Footer agreementData={AGREEMENT} showInstitutionLogo />);
    expect(screen.getByAltText('UTP')).toBeInTheDocument();
  });

  it('muestra el logo cuando la prop no se pasa (retrocompatibilidad)', () => {
    render(<Footer agreementData={AGREEMENT} />);
    expect(screen.getByAltText('UTP')).toBeInTheDocument();
  });

  it('oculta el logo cuando showInstitutionLogo es false', () => {
    render(<Footer agreementData={AGREEMENT} showInstitutionLogo={false} />);
    expect(screen.queryByAltText('UTP')).not.toBeInTheDocument();
  });

  // La trampa: sin gatear el fallback, apagar el <img> hace aparecer "UTP"
  // como texto — que es exactamente lo que el flag debe evitar.
  it('NO cae al fallback de texto cuando el logo esta apagado', () => {
    const { container } = render(<Footer agreementData={AGREEMENT} showInstitutionLogo={false} />);
    expect(container.textContent).not.toContain('UTP');
  });

  // El fallback sigue siendo util para convenios sin logo cargado.
  it('sigue mostrando el fallback de texto si no hay logo y el flag esta encendido', () => {
    const sinLogo = { ...AGREEMENT, institution_logo: undefined };
    const { container } = render(<Footer agreementData={sinLogo} showInstitutionLogo />);
    expect(container.textContent).toContain('UTP');
  });
});
