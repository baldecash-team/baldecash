import { render, screen, waitFor } from '@testing-library/react';
import { LayoutProvider, useLayout } from '../LayoutContext';

/**
 * Las tres secciones de la portada de «Solicitar» (BAL-4700) se leen en el
 * contexto: `features.show_selected_product`, `show_quick_facts` y
 * `show_requirements`. Solo un `false` explícito las oculta.
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

const CLAVES = {
  show_selected_product: 'producto',
  show_quick_facts: 'datos',
  show_requirements: 'requisitos',
} as const;

function Probe() {
  const { mostrarProductoSeleccionado, mostrarDatosRapidos, mostrarRequisitos, isLoading } = useLayout();
  return (
    <>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="producto">{String(mostrarProductoSeleccionado)}</span>
      <span data-testid="datos">{String(mostrarDatosRapidos)}</span>
      <span data-testid="requisitos">{String(mostrarRequisitos)}</span>
    </>
  );
}

async function renderProbe() {
  render(
    <LayoutProvider>
      <Probe />
    </LayoutProvider>,
  );
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
}

describe('LayoutContext — secciones de la portada de Solicitar', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(Object.entries(CLAVES))('%s=false apaga solo la suya', async (clave, testId) => {
    fetchLandingConfigMock.mockResolvedValue({
      layout: { has_catalog: true },
      features: {
        show_selected_product: true, show_quick_facts: true, show_requirements: true,
        [clave]: false,
      },
    });
    await renderProbe();
    await waitFor(() => expect(screen.getByTestId(testId)).toHaveTextContent('false'));
    for (const otro of Object.values(CLAVES)) {
      if (otro !== testId) expect(screen.getByTestId(otro)).toHaveTextContent('true');
    }
  });

  it('claves ausentes = encendidas (ninguna landing cambia sola)', async () => {
    fetchLandingConfigMock.mockResolvedValue({ layout: { has_catalog: true }, features: {} });
    await renderProbe();
    for (const id of Object.values(CLAVES)) {
      expect(screen.getByTestId(id)).toHaveTextContent('true');
    }
  });

  it('sin namespace features también quedan encendidas', async () => {
    fetchLandingConfigMock.mockResolvedValue({ layout: { has_catalog: true } });
    await renderProbe();
    for (const id of Object.values(CLAVES)) {
      expect(screen.getByTestId(id)).toHaveTextContent('true');
    }
  });
});
