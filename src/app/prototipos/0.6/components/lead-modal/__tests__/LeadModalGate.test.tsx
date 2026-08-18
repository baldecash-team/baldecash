import React from 'react';
import { render, screen, act } from '@testing-library/react';
import LeadModalGate from '../LeadModalGate';

/**
 * El gate se monta en `[[...slug]]/LandingPageClient`, que es el INDEX.
 *
 * La primera version lo puso en `[landing]/layout.tsx` y el modal no salia
 * nunca: en el arbol de rutas esa rama solo cubre las SUBRUTAS (catalogo,
 * producto, solicitar, legal), y el index se sirve desde el catch-all. Quedaba
 * exactamente al reves de lo pedido, con los tests en verde.
 */

jest.mock('../LeadCouponModal', () => ({
  __esModule: true,
  default: ({ config }: { config: Record<string, unknown> }) => (
    <div data-testid="modal">{String(config.title)}</div>
  ),
}));

const CONFIG_ACTIVA = {
  lead_modal: { enabled: true, title: 'Deja tus datos' },
};

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('LeadModalGate', () => {
  it('no muestra nada antes de los 3 segundos', () => {
    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);

    act(() => { jest.advanceTimersByTime(2500); });

    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('muestra el modal a los 3 segundos', () => {
    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);

    act(() => { jest.advanceTimersByTime(3000); });

    expect(screen.getByTestId('modal').textContent).toBe('Deja tus datos');
  });

  it('no sale si el modal esta apagado', () => {
    render(
      <LeadModalGate landingSlug="senati" config={{ lead_modal: { enabled: false } }} />
    );

    act(() => { jest.advanceTimersByTime(5000); });

    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('no sale si la landing no lo tiene configurado', () => {
    render(<LeadModalGate landingSlug="senati" config={{ layout: {} }} />);

    act(() => { jest.advanceTimersByTime(5000); });

    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('no vuelve a pedir los datos si ya los dejo en esta landing', () => {
    // Misma clave que el autoseteo del formulario (BAL-1806).
    localStorage.setItem('baldecash-dni-senati', '72345678');

    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);

    act(() => { jest.advanceTimersByTime(5000); });

    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('cada landing mira su propio documento', () => {
    // Dejar el documento en OTRA landing no debe suprimir el modal aca.
    localStorage.setItem('baldecash-dni-home', '72345678');

    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);

    act(() => { jest.advanceTimersByTime(3000); });

    expect(screen.getByTestId('modal')).toBeTruthy();
  });
});
