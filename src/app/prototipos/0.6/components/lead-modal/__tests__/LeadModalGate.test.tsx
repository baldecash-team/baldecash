import React from 'react';
import { render, screen, act } from '@testing-library/react';
import LeadModalGate from '../LeadModalGate';

/**
 * BAL-3125 Tarea 5: el gate se muda al CATÁLOGO (antes vivía en el index).
 *
 * Sin guard de pathname: en el catálogo el componente ya está solo donde
 * corresponde, así que a diferencia de la primera versión (que vivía en el
 * index y necesitaba distinguirlo de catálogo/producto/solicitar) esta ya no
 * necesita leer `usePathname`.
 *
 * El cupón va PRIMERO, el onboarding DESPUÉS: los dos targetean "todo
 * visitante nuevo" y si no se coordinan se apilan. `onSettled` es la señal
 * que CatalogoClient usa para esperar antes de abrir el welcome modal —
 * dispara tanto si el modal nunca se mostró (apagado / ya contestado) como
 * cuando el usuario lo cierra.
 */

jest.mock('../LeadCouponModal', () => ({
  __esModule: true,
  default: ({ config, onClose }: { config: Record<string, unknown>; onClose: () => void }) => (
    <div data-testid="modal">
      {String(config.title)}
      <button type="button" onClick={onClose}>cerrar-mock</button>
    </div>
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

describe('LeadModalGate — mudanza al catálogo', () => {
  it('no muestra nada antes de los 3 segundos', () => {
    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);

    act(() => { jest.advanceTimersByTime(2500); });

    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('muestra el modal a los 3 segundos', () => {
    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);

    act(() => { jest.advanceTimersByTime(3000); });

    expect(screen.getByTestId('modal').textContent).toContain('Deja tus datos');
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
    localStorage.setItem('baldecash-dni-senati', '72345678');

    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);

    act(() => { jest.advanceTimersByTime(5000); });

    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('cada landing mira su propio documento', () => {
    localStorage.setItem('baldecash-dni-home', '72345678');

    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);

    act(() => { jest.advanceTimersByTime(3000); });

    expect(screen.getByTestId('modal')).toBeTruthy();
  });
});

describe('LeadModalGate — coordinación con el onboarding (onSettled)', () => {
  it('avisa onSettled de inmediato si el modal esta apagado (nada que esperar)', () => {
    const onSettled = jest.fn();
    render(
      <LeadModalGate
        landingSlug="senati"
        config={{ lead_modal: { enabled: false } }}
        onSettled={onSettled}
      />
    );

    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it('avisa onSettled de inmediato si ya dejo sus datos (no hay nada que mostrar)', () => {
    localStorage.setItem('baldecash-dni-senati', '72345678');
    const onSettled = jest.fn();

    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} onSettled={onSettled} />);

    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it('NO avisa onSettled mientras espera los 3 segundos ni mientras el modal esta abierto', () => {
    const onSettled = jest.fn();
    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} onSettled={onSettled} />);

    act(() => { jest.advanceTimersByTime(3000); });
    expect(screen.getByTestId('modal')).toBeTruthy();
    expect(onSettled).not.toHaveBeenCalled();
  });

  it('avisa onSettled recien cuando el usuario cierra el modal de cupon', () => {
    const onSettled = jest.fn();
    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} onSettled={onSettled} />);

    act(() => { jest.advanceTimersByTime(3000); });
    expect(onSettled).not.toHaveBeenCalled();

    act(() => {
      screen.getByRole('button', { name: 'cerrar-mock' }).click();
    });

    expect(onSettled).toHaveBeenCalledTimes(1);
  });
});

describe('la config todavia no llego (carrera con el fetch)', () => {
  it('NO avisa onSettled mientras la config esta sin resolver', () => {
    // `CatalogoClient` arranca con {} y llena la config cuando responde
    // `fetchLandingConfig`. Con {} el gate creia "no hay nada que mostrar" y
    // avisaba de inmediato — y el aviso es IRREVERSIBLE (avisado.current).
    // El welcome se abria, y al llegar la config el cupon se montaba ENCIMA:
    // justo la superposicion que este ticket resuelve.
    const onSettled = jest.fn();
    render(<LeadModalGate landingSlug="senati" config={undefined} onSettled={onSettled} />);

    act(() => { jest.advanceTimersByTime(5000); });

    expect(onSettled).not.toHaveBeenCalled();
  });

  it('avisa recien cuando la config llega y el modal esta apagado', () => {
    const onSettled = jest.fn();
    const { rerender } = render(
      <LeadModalGate landingSlug="senati" config={undefined} onSettled={onSettled} />
    );
    expect(onSettled).not.toHaveBeenCalled();

    rerender(
      <LeadModalGate
        landingSlug="senati"
        config={{ lead_modal: { enabled: false } }}
        onSettled={onSettled}
      />
    );

    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it('si la config llega con el modal activo, el welcome sigue esperando', () => {
    const onSettled = jest.fn();
    const { rerender } = render(
      <LeadModalGate landingSlug="senati" config={undefined} onSettled={onSettled} />
    );

    rerender(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} onSettled={onSettled} />);
    act(() => { jest.advanceTimersByTime(3000); });

    expect(screen.getByTestId('modal')).toBeTruthy();
    expect(onSettled).not.toHaveBeenCalled();
  });
});

