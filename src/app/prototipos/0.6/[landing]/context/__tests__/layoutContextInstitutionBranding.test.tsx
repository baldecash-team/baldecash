import { render, screen, waitFor } from '@testing-library/react';
import { LayoutProvider, useLayout } from '../LayoutContext';

/**
 * `lead-flujo-normal` capta postulantes de SENATI pero NO es una landing de
 * convenio y no puede serlo: el convenio le impondria su `study_center` al
 * formulario, y ahi cada lead trae la suya. Igual tiene que mostrar la marca
 * de la institucion en el navbar, como hace la landing de convenio.
 *
 * Por eso el backend manda `institution_branding` aparte de `agreement`. Estos
 * tests cubren las dos mitades del contrato:
 *
 * 1. el navbar pinta el logo del branding cuando no hay convenio, y
 * 2. `agreementData` sigue en null — que es lo que decide, aguas arriba, que
 *    una landing se pinte como de convenio (`isConvenio = !!agreementData`).
 *
 * La segunda importa tanto como la primera: si el branding se colara dentro de
 * `agreementData` el logo apareceria igual, el test 1 pasaria en verde, y la
 * landing se llenaria de hero, FAQ y CTA de convenio sin que nadie lo pidiera.
 */

const SENATI_LOGO = 'https://baldecash.s3.amazonaws.com/institutions/senati.png';

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'lead-flujo-normal' }),
}));

jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({
    isHydrated: true,
    isPreviewingLanding: () => false,
    landingId: null,
    previewKey: null,
  }),
}));

// Inline por el izado de jest.mock, igual que en layoutContextAgreementLogo.
// Landing SIN convenio: `agreement` en null y la marca por su propia clave.
jest.mock('@/app/prototipos/0.6/services/landingApi', () => ({
  getLandingLayout: jest.fn().mockResolvedValue({
    landing: { slug: 'lead-flujo-normal', landing_type: 'institutional' },
    agreement: null,
    institution_branding: {
      institution_logo: 'https://baldecash.s3.amazonaws.com/institutions/senati.png',
      institution_name: 'SENATI',
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
      <span data-testid="logo">{String(navbarProps?.institutionLogo)}</span>
      <span data-testid="name">{String(navbarProps?.institutionName)}</span>
      <span data-testid="agreement">{String(agreementData)}</span>
    </>
  );
}

async function renderProbe() {
  const utils = render(
    <LayoutProvider>
      <Probe />
    </LayoutProvider>,
  );
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
  return utils;
}

describe('LayoutContext — institution_branding (landing sin convenio)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('pinta el logo de la institucion de referencia aunque no haya convenio', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(true));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('logo')).toHaveTextContent(SENATI_LOGO));
  });

  it('tambien trae el nombre, que el navbar usa de alt text', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(true));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('SENATI'));
  });

  // La mitad que evita el efecto colateral: la landing NO se vuelve de convenio.
  it('deja agreementData en null: la landing no se vuelve de convenio', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(true));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('agreement')).toHaveTextContent('null'));
  });

  // El flag de la landing manda igual que sobre el logo del convenio: si se
  // apaga, no hay marca institucional de ninguna procedencia.
  it('el flag apagado tambien apaga el logo del branding', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(false));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('logo')).toHaveTextContent('undefined'));
  });
});
