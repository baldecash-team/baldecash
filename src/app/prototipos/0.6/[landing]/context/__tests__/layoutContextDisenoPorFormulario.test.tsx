import { render, screen, waitFor, act } from '@testing-library/react';
import { LayoutProvider, useLayout } from '../LayoutContext';
import { guardarDisenoDeLaSesion, leerDisenoDeLaSesion } from '../disenoDeLaSesion';

/**
 * Diseño por formulario (BAL-5296): con `features.diseno_por_formulario` el
 * diseño efectivo es el de la sesión (el del formulario que le tocó) y, hasta
 * saberlo, el de la landing. Sin la clave, NADA cambia: lo guardado en la
 * sesión se ignora.
 */

let landingParam = 'home';
jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: landingParam }),
}));

jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isHydrated: true, isPreviewingLanding: () => false, landingId: null, previewKey: null }),
}));

jest.mock('@/app/prototipos/0.6/services/landingApi', () => ({
  getLandingLayout: jest.fn().mockResolvedValue({
    landing: { slug: 'home', landing_type: 'propia' },
    company: { logo_url: 'https://ejemplo.test/logo.png' },
  }),
}));

const fetchLandingConfigMock = jest.fn();
jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: (slug: string) => fetchLandingConfigMock(slug),
}));

function config(features: Record<string, unknown>) {
  return { layout: { has_catalog: true }, features: { overlay_variant: '', ...features } };
}

let fijar: ((d: 1 | 2) => void) | undefined;
function Probe() {
  const { isLoading, disenoSolicitud, loQuieroModal, disenoPorFormulario, fijarDisenoDeLaSesion } = useLayout();
  fijar = fijarDisenoDeLaSesion;
  return (
    <>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="diseno">{String(disenoSolicitud)}</span>
      <span data-testid="modal">{String(loQuieroModal)}</span>
      <span data-testid="porForm">{String(disenoPorFormulario)}</span>
    </>
  );
}

async function renderProbe() {
  render(<LayoutProvider><Probe /></LayoutProvider>);
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
}

describe('LayoutContext — diseño por formulario (BAL-5296)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    landingParam = 'home';
    fijar = undefined;
  });

  it('sin la clave: disenoPorFormulario false y lo guardado en la sesión NO cuenta', async () => {
    guardarDisenoDeLaSesion('home', 2);
    fetchLandingConfigMock.mockResolvedValue(config({ solicitud_design: 1 }));
    await renderProbe();
    expect(screen.getByTestId('porForm')).toHaveTextContent('false');
    expect(screen.getByTestId('diseno')).toHaveTextContent('1');
    expect(screen.getByTestId('modal')).toHaveTextContent('false');
  });

  it('con la clave y sin sesión: el diseño de la landing', async () => {
    fetchLandingConfigMock.mockResolvedValue(config({ solicitud_design: 1, diseno_por_formulario: true }));
    await renderProbe();
    expect(screen.getByTestId('porForm')).toHaveTextContent('true');
    expect(screen.getByTestId('diseno')).toHaveTextContent('1');
  });

  it('con la clave: el de la sesión gana al de la landing', async () => {
    guardarDisenoDeLaSesion('home', 2);
    fetchLandingConfigMock.mockResolvedValue(config({ solicitud_design: 1, diseno_por_formulario: true }));
    await renderProbe();
    expect(screen.getByTestId('diseno')).toHaveTextContent('2');
    expect(screen.getByTestId('modal')).toHaveTextContent('true');
  });

  it('fijarDisenoDeLaSesion guarda y actualiza el diseño', async () => {
    fetchLandingConfigMock.mockResolvedValue(config({ solicitud_design: 2, diseno_por_formulario: true }));
    await renderProbe();
    expect(screen.getByTestId('diseno')).toHaveTextContent('2');
    act(() => fijar!(1));
    expect(screen.getByTestId('diseno')).toHaveTextContent('1');
    expect(leerDisenoDeLaSesion('home')).toBe(1);
  });

  it('zona gamer: la sesión en 2 no abre el modal', async () => {
    landingParam = 'zona-gamer';
    guardarDisenoDeLaSesion('zona-gamer', 2);
    fetchLandingConfigMock.mockResolvedValue(config({ solicitud_design: 1, diseno_por_formulario: true }));
    await renderProbe();
    expect(screen.getByTestId('modal')).toHaveTextContent('false');
  });
});
