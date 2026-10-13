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

const mockTrack = jest.fn();
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  __esModule: true,
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/SessionContext', () => ({
  __esModule: true,
  useSessionOptional: () => ({ sessionUuid: 'uuid-test', sessionId: 1, isNewSession: false }),
}));

const mockPatch = jest.fn();
jest.mock('@/app/prototipos/0.6/services/sessionApi', () => ({
  __esModule: true,
  patchTrackingSession: (...args: unknown[]) => mockPatch(...args),
}));

const CONFIG_ACTIVA = {
  lead_modal: { enabled: true, title: 'Deja tus datos' },
};

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
  mockTrack.mockClear();
  mockPatch.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
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

describe('LeadModalGate — una vez por visitante', () => {
  it('si lo cierra sin dejar sus datos, no vuelve a salir al recargar', () => {
    const primera = render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);
    act(() => { jest.advanceTimersByTime(3000); });
    act(() => {
      screen.getByRole('button', { name: 'cerrar-mock' }).click();
    });
    expect(screen.queryByTestId('modal')).toBeNull();
    primera.unmount();

    // Recargar la página = un montaje nuevo con el mismo almacenamiento.
    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);
    act(() => { jest.advanceTimersByTime(5000); });

    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('descartarlo no deja documento guardado: la solicitud no se autocompleta', () => {
    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);
    act(() => { jest.advanceTimersByTime(3000); });
    act(() => {
      screen.getByRole('button', { name: 'cerrar-mock' }).click();
    });

    expect(localStorage.getItem('baldecash-dni-senati')).toBeNull();
    expect(localStorage.getItem('baldecash-lead-modal-descartado-senati')).toBe('1');
  });

  it('descartarlo en una landing no lo apaga en otra', () => {
    localStorage.setItem('baldecash-lead-modal-descartado-home', '1');

    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);
    act(() => { jest.advanceTimersByTime(3000); });

    expect(screen.getByTestId('modal')).toBeTruthy();
  });

  it('avisa onSettled de inmediato si ya lo habia descartado', () => {
    localStorage.setItem('baldecash-lead-modal-descartado-senati', '1');
    const onSettled = jest.fn();

    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} onSettled={onSettled} />);

    expect(onSettled).toHaveBeenCalledTimes(1);
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

describe('LeadModalGate — porcentaje de visitantes (A/B modal vs control)', () => {
  const CONFIG_AB = {
    lead_modal: { enabled: true, title: 'Deja tus datos', show_percent: 30 },
  };

  it('al grupo "modal" le sale el modal a los 3 segundos', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    render(<LeadModalGate landingSlug="senati" config={CONFIG_AB} />);

    act(() => { jest.advanceTimersByTime(3000); });

    expect(screen.getByTestId('modal')).toBeTruthy();
  });

  it('al grupo "control" no le sale nunca', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    render(<LeadModalGate landingSlug="senati" config={CONFIG_AB} />);

    act(() => { jest.advanceTimersByTime(10000); });

    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('el grupo "control" avisa onSettled de inmediato: el welcome no se queda esperando', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const onSettled = jest.fn();

    render(<LeadModalGate landingSlug="senati" config={CONFIG_AB} onSettled={onSettled} />);

    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it('el grupo se conserva al volver a entrar', () => {
    localStorage.setItem(
      'baldecash-lead-modal-ab-senati',
      JSON.stringify({ variant: 'control', percent: 30 })
    );
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    render(<LeadModalGate landingSlug="senati" config={CONFIG_AB} />);
    act(() => { jest.advanceTimersByTime(5000); });

    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('emite el evento del sorteo una sola vez, con el grupo y el porcentaje', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const { unmount } = render(<LeadModalGate landingSlug="senati" config={CONFIG_AB} />);
    unmount();
    render(<LeadModalGate landingSlug="senati" config={CONFIG_AB} />);

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith('lead_modal_variant_assigned', {
      variant: 'control',
      show_percent: 30,
    });
  });

  it('manda el grupo a la fila de la sesión en cada visita', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    render(<LeadModalGate landingSlug="senati" config={CONFIG_AB} />);

    expect(mockPatch).toHaveBeenCalledWith('uuid-test', { ab_lead_modal_variant: 'modal' });
  });

  it('sin porcentaje no hay test: sale el modal y no se reporta ningún grupo', () => {
    render(<LeadModalGate landingSlug="senati" config={CONFIG_ACTIVA} />);

    act(() => { jest.advanceTimersByTime(3000); });

    expect(screen.getByTestId('modal')).toBeTruthy();
    expect(mockTrack).not.toHaveBeenCalled();
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('quien ya dejó sus datos no entra al sorteo', () => {
    localStorage.setItem('baldecash-dni-senati', '72345678');
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    render(<LeadModalGate landingSlug="senati" config={CONFIG_AB} />);

    expect(localStorage.getItem('baldecash-lead-modal-ab-senati')).toBeNull();
    expect(mockTrack).not.toHaveBeenCalled();
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('quien vio el modal y lo descartó sigue en su grupo: no le vuelve a salir, pero la visita se reporta', () => {
    localStorage.setItem(
      'baldecash-lead-modal-ab-senati',
      JSON.stringify({ variant: 'modal', percent: 30 })
    );
    localStorage.setItem('baldecash-lead-modal-descartado-senati', '1');
    const onSettled = jest.fn();

    render(<LeadModalGate landingSlug="senati" config={CONFIG_AB} onSettled={onSettled} />);
    act(() => { jest.advanceTimersByTime(5000); });

    expect(screen.queryByTestId('modal')).toBeNull();
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(mockTrack).not.toHaveBeenCalled();
    expect(mockPatch).toHaveBeenCalledWith('uuid-test', { ab_lead_modal_variant: 'modal' });
  });
});
