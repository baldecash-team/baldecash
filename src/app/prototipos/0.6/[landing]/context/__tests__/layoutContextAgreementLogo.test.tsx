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
  const { navbarProps, agreementData, isLoading } = useLayout();
  return (
    <>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="flag">{String(navbarProps?.showInstitutionLogo)}</span>
      <span data-testid="logo">{String(navbarProps?.institutionLogo)}</span>
      <span data-testid="agreement-logo">{String(agreementData?.institution_logo)}</span>
      <span data-testid="agreement-name">{String(agreementData?.institution_short_name)}</span>
    </>
  );
}

/**
 * Monta el provider y ESPERA a que el fetch del layout resuelva.
 *
 * Sin esta espera `layoutData` sigue en null, `agreementData` es null y las
 * aserciones sobre el logo pasan por vacio en vez de por correctas — un falso
 * verde que oculta justo lo que estos tests deben cubrir.
 */
async function renderProbe() {
  const utils = render(
    <LayoutProvider>
      <Probe />
    </LayoutProvider>,
  );
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
  return utils;
}

describe('LayoutContext — show_agreement_logo', () => {
  beforeEach(() => jest.clearAllMocks());

  it('propaga false cuando el config lo apaga', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(false));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('flag')).toHaveTextContent('false'));
  });

  it('propaga true cuando el config lo deja encendido', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(true));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('flag')).toHaveTextContent('true'));
  });

  // Si el backend no devuelve la clave, el valor es undefined y debe leerse
  // como encendido: es la condicion de no-rotura para los convenios actuales.
  it('trata la clave ausente como true', async () => {
    const sinClave = baseConfig(true) as Record<string, unknown>;
    delete (sinClave.layout as Record<string, unknown>).show_agreement_logo;
    fetchLandingConfigMock.mockResolvedValue(sinClave);
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('flag')).toHaveTextContent('true'));
  });

  // ── agreementData: la via que cubre los 21 call sites del Footer ──
  //
  // El Footer condiciona por `agreementData?.institution_logo`, no por una
  // prop. Vaciar el logo en el contexto apaga los 21 sitios de una, sin tener
  // que editar cada pagina (y sin poder olvidarse de una).

  it('vacia institution_logo de agreementData cuando el flag esta apagado', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(false));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('agreement-logo')).toHaveTextContent('undefined'));
  });

  it('conserva institution_logo cuando el flag esta encendido', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(true));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('agreement-logo')).toHaveTextContent(UTP_LOGO));
  });

  // El resto del agreement tiene que sobrevivir: el nombre se usa en
  // ConvenioHero, ConvenioFaq y ConvenioCta como texto, y ahi si va.
  it('no borra el resto del agreement al apagar el logo', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(false));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('agreement-name')).toHaveTextContent('UTP'));
  });

  // navbarProps.institutionLogo sale del mismo agreement ya saneado, asi que
  // los 11 Navbar quedan cubiertos por la misma via.
  it('vacia tambien institutionLogo de navbarProps', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(false));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('logo')).toHaveTextContent('undefined'));
  });
});
