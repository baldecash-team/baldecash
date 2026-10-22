import { render, screen, waitFor } from '@testing-library/react';
import { LayoutProvider, useLayout, useDisenoSolicitud } from '../LayoutContext';

/**
 * `features.solicitud_design` (BAL-4958) reemplaza al ingrediente
 * `lo-quiero-modal-on`. Viene del preset `solicitud-design-v2` (value_type
 * int): sin la clave es 1 (diseño actual), con 2 (número o string) es 2
 * (modal "Lo quiero"). Cualquier otro valor cae en 1.
 */

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'pago-diferido' }),
}));

jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({
    isHydrated: true,
    isPreviewingLanding: () => false,
    landingId: null,
    previewKey: null,
  }),
}));

jest.mock('@/app/prototipos/0.6/services/landingApi', () => ({
  getLandingLayout: jest.fn().mockResolvedValue({
    landing: { slug: 'pago-diferido', landing_type: 'propia' },
    company: { logo_url: 'https://ejemplo.test/logo.png' },
  }),
}));

const fetchLandingConfigMock = jest.fn();
jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: (slug: string) => fetchLandingConfigMock(slug),
}));

function baseConfig(solicitudDesign: unknown) {
  return {
    layout: { has_catalog: true },
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
      solicitud_design: solicitudDesign,
    },
  };
}

function Probe() {
  const { isLoading, disenoSolicitud, loQuieroModal } = useLayout();
  const desdeSelector = useDisenoSolicitud();
  return (
    <>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="diseno">{String(disenoSolicitud)}</span>
      <span data-testid="selector">{String(desdeSelector)}</span>
      <span data-testid="modal">{String(loQuieroModal)}</span>
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

describe('LayoutContext — features.solicitud_design (BAL-4958)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sin la clave cae en el diseño 1', async () => {
    const sinClave = baseConfig(undefined) as Record<string, unknown>;
    delete (sinClave.features as Record<string, unknown>).solicitud_design;
    fetchLandingConfigMock.mockResolvedValue(sinClave);
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('diseno')).toHaveTextContent('1'));
    expect(screen.getByTestId('selector')).toHaveTextContent('1');
    expect(screen.getByTestId('modal')).toHaveTextContent('false');
  });

  it('el número 2 prende el diseño 2 y el modal', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(2));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('diseno')).toHaveTextContent('2'));
    expect(screen.getByTestId('selector')).toHaveTextContent('2');
    expect(screen.getByTestId('modal')).toHaveTextContent('true');
  });

  it('el string "2" también prende el diseño 2', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig('2'));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('diseno')).toHaveTextContent('2'));
    expect(screen.getByTestId('modal')).toHaveTextContent('true');
  });

  it.each([3, null, 'x'])('%p cae en el diseño 1', async (valor) => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(valor));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('diseno')).toHaveTextContent('1'));
    expect(screen.getByTestId('modal')).toHaveTextContent('false');
  });
});
