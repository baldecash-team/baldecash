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

describe('LayoutContext — landings sin Diseño 2 y colores de texto (BAL-4969)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('BAL-5076: una landing de tema oscuro (nvidia) con el 2 abre el modal (Diseño 2 oscuro)', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(2));
    render(
      <LayoutProvider landingOverride="nvidia">
        <Probe />
      </LayoutProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('diseno')).toHaveTextContent('2'));
    expect(screen.getByTestId('modal')).toHaveTextContent('true');
    // El tema oscuro se activa con el mismo data-theme de siempre, y el
    // texto de marca es el verde tal cual (se lee sobre la tarjeta oscura).
    expect(document.documentElement.getAttribute('data-theme')).toBe('nvidia');
    expect(document.documentElement.style.getPropertyValue('--color-primary-text')).toBe('#76B900');
  });

  it('I-2: zona gamer sigue sin abrir el modal aunque traiga el 2 (tiene su propio flujo)', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(2));
    render(
      <LayoutProvider landingOverride="zona-gamer">
        <Probe />
      </LayoutProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('diseno')).toHaveTextContent('2'));
    expect(screen.getByTestId('modal')).toHaveTextContent('false');
  });

  it('I-1: con el morado por defecto, texto blanco encima y el mismo morado para texto', async () => {
    fetchLandingConfigMock.mockResolvedValue(baseConfig(2));
    await renderProbe();
    const raiz = document.documentElement.style;
    expect(raiz.getPropertyValue('--color-on-primary')).toBe('#FFFFFF');
    expect(raiz.getPropertyValue('--color-primary-text')).toBe('#4654CD');
  });

  it('I-1: con un primary claro, texto oscuro encima y un primary-text oscurecido', async () => {
    const { getLandingLayout } = jest.requireMock('@/app/prototipos/0.6/services/landingApi') as {
      getLandingLayout: jest.Mock;
    };
    getLandingLayout.mockResolvedValueOnce({
      landing: { slug: 'pago-diferido', landing_type: 'propia' },
      company: { logo_url: 'https://ejemplo.test/logo.png' },
      primary_color: '#00ADEE',
    });
    fetchLandingConfigMock.mockResolvedValue(baseConfig(2));
    await renderProbe();
    const raiz = document.documentElement.style;
    await waitFor(() => expect(raiz.getPropertyValue('--color-primary')).toBe('#00ADEE'));
    expect(raiz.getPropertyValue('--color-on-primary')).toBe('#1E2230');
    expect(raiz.getPropertyValue('--color-primary-text')).toBe('#0079A7');
  });
});

describe('LayoutContext — el diseño se resuelve antes de pintar (BAL-4969, casuísticas)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('isLoading sigue en true hasta que llega /config, aunque el layout ya llegó: sin parpadeo D1→D2', async () => {
    let resolver: (v: unknown) => void = () => {};
    fetchLandingConfigMock.mockReturnValue(new Promise((r) => { resolver = r; }));
    render(
      <LayoutProvider>
        <Probe />
      </LayoutProvider>,
    );
    // El layout responde solo; el diseño todavía no.
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    resolver(baseConfig(2));
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    // Cuando deja de cargar, ya es Diseño 2 (nunca se vio un 1 "listo").
    expect(screen.getByTestId('diseno')).toHaveTextContent('2');
  });
});
