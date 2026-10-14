import { render, screen, waitFor } from '@testing-library/react';
import { LayoutProvider, useLayout } from '../LayoutContext';

/**
 * `features.show_summary` decide si el paso final del formulario muestra el
 * resumen de los datos ya ingresados.
 *
 * Vive en el contexto, junto a sus hermanos, para que «ausencia significa
 * encendido» se decida en un solo lugar: el ingrediente `summary-off` es nuevo
 * y ninguna landing existente trae la clave.
 */

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'prestamo-matricula' }),
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
    landing: { slug: 'prestamo-matricula', landing_type: 'convenio' },
    company: { logo_url: 'https://ejemplo.test/logo.png' },
  }),
}));

const fetchLandingConfigMock = jest.fn();
jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: (slug: string) => fetchLandingConfigMock(slug),
}));

function baseConfig(showSummary: boolean) {
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
      show_summary: showSummary,
    },
  };
}

function Probe() {
  const { mostrarResumen, isLoading } = useLayout();
  return (
    <>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="flag">{String(mostrarResumen)}</span>
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

describe('LayoutContext — show_summary', () => {
  beforeEach(() => jest.clearAllMocks());

  it('propaga false cuando el preset apaga el resumen', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(false));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('flag')).toHaveTextContent('false'));
  });

  it('propaga true cuando el preset lo deja encendido', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(true));
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('flag')).toHaveTextContent('true'));
  });

  /**
   * Condicion de no-rotura: el preset es nuevo, asi que NINGUNA landing
   * existente trae la clave. Leerla como apagada les quitaria el resumen a
   * todas de golpe. Ausencia significa encendido.
   */
  it('trata la clave ausente como true', async () => {
    const sinClave = baseConfig(true) as Record<string, unknown>;
    delete (sinClave.features as Record<string, unknown>).show_summary;
    fetchLandingConfigMock.mockResolvedValue(sinClave);
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('flag')).toHaveTextContent('true'));
  });

  /**
   * El namespace entero puede faltar en una landing sin ingredientes. Mismo
   * criterio: no se apaga nada por ausencia.
   */
  it('trata el namespace de features ausente como true', async () => {
    fetchLandingConfigMock.mockResolvedValue({ layout: { has_catalog: true } });
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId('flag')).toHaveTextContent('true'));
  });
});
