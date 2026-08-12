import { render, screen, waitFor } from '@testing-library/react';
import { LayoutProvider, useLayout } from '../LayoutContext';

/**
 * `layout.show_agreement_logo` tiene que llegar hasta el Navbar de las paginas
 * secundarias (catalogo, producto, solicitar, legal, proximamente), que no usan
 * HeroSection sino `navbarProps` del LayoutContext.
 *
 * Antes de BAL-2970 el context fetcheaba el config pero se quedaba solo con
 * `overlay_variant` y `deferred_payment`: el resto del objeto se descartaba y
 * `navbarProps` ni siquiera dependia de el. Estos tests cubren esa plomeria.
 */

const UTP_LOGO = 'https://baldecash.s3.amazonaws.com/institutions/utp.png';

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'universidad' }),
}));

jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({
    isHydrated: true,
    isPreviewingLanding: () => false,
    landingId: null,
    previewKey: null,
  }),
}));

// El objeto va inline: jest.mock se iza por encima de las consts del modulo,
// asi que referenciar una de afuera revienta con "Cannot access before init".
jest.mock('@/app/prototipos/0.6/services/landingApi', () => ({
  getLandingLayout: jest.fn().mockResolvedValue({
    landing: { slug: 'universidad', landing_type: 'convenio' },
    agreement: {
      id: 61,
      code: 'utp',
      name: 'UTP',
      institution_name: 'UTP',
      institution_short_name: 'UTP',
      institution_logo: 'https://baldecash.s3.amazonaws.com/institutions/utp.png',
    },
    company: { logo_url: 'https://baldecash.s3.amazonaws.com/company/logo.png' },
  }),
}));

const fetchLandingConfigMock = jest.fn();
jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: (slug: string) => fetchLandingConfigMock(slug),
}));

function baseConfig(showAgreementLogo: boolean) {
  return {
    layout: { has_catalog: true, show_agreement_logo: showAgreementLogo },
    features: {
      has_dni_modal: false,
      dni_required: false,
      show_platform_commission: false,
      vip_countdown: '',
      has_dni_whitelist: false,
      dni_capture_mode: 'modal' as const,
      floating_cta: null,
      overlay_variant: '',
      overlay_deadline: '',
    },
  };
}

function Probe() {
  const { navbarProps } = useLayout();
  return (
    <>
      <span data-testid="flag">{String(navbarProps?.showInstitutionLogo)}</span>
      <span data-testid="logo">{String(navbarProps?.institutionLogo)}</span>
    </>
  );
}

function renderProbe() {
  return render(
    <LayoutProvider>
      <Probe />
    </LayoutProvider>,
  );
}

describe('LayoutContext — show_agreement_logo', () => {
  beforeEach(() => jest.clearAllMocks());

  it('propaga false cuando el config lo apaga', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(false));
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('flag')).toHaveTextContent('false'));
  });

  it('propaga true cuando el config lo deja encendido', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(true));
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('flag')).toHaveTextContent('true'));
  });

  // Si el backend no devuelve la clave, el valor es undefined y debe leerse
  // como encendido: es la condicion de no-rotura para los convenios actuales.
  it('trata la clave ausente como true', async () => {
    const sinClave = baseConfig(true) as Record<string, unknown>;
    delete (sinClave.layout as Record<string, unknown>).show_agreement_logo;
    fetchLandingConfigMock.mockResolvedValue(sinClave);
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('flag')).toHaveTextContent('true'));
  });

  // El flag no debe interferir con el dato que ya viajaba.
  it('sigue exponiendo institutionLogo aunque el flag este apagado', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(false));
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('logo')).toHaveTextContent(UTP_LOGO));
  });
});
