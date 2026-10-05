import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// framer-motion: jest.setup.js only supplies `motion.*`/`AnimatePresence`.
// NextUI's Modal also needs `m` + `LazyMotion`, and the mobile bottom sheet
// needs `useDragControls` (precedent: MultiasistenciaUpsellModal.test.tsx:8-17).
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  m: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
  LazyMotion: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useDragControls: () => ({ start: jest.fn() }),
}));

const mockGetVipToken = jest.fn();
const mockClearVipData = jest.fn();
jest.mock('../../../../../components/hero/DniModal', () => ({
  getVipToken: (...args: unknown[]) => mockGetVipToken(...args),
  clearVipData: (...args: unknown[]) => mockClearVipData(...args),
}));

jest.mock('../../../../../utils/routes', () => ({
  routes: {
    catalogo: (slug: string) => `/${slug}/catalogo`,
  },
}));

const mockHardNavigate = jest.fn();
jest.mock('../hardNavigate', () => ({
  hardNavigate: (...args: unknown[]) => mockHardNavigate(...args),
}));

const mockUseEventTrackerOptional = jest.fn();
jest.mock('../../../../solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: (...args: unknown[]) => mockUseEventTrackerOptional(...args),
}));

const mockUseIsMobile = jest.fn(() => false);
jest.mock('@/app/prototipos/_shared', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

import { ActivatorResetButton } from '../ActivatorResetButton';

beforeEach(() => {
  jest.clearAllMocks();
  mockUseIsMobile.mockReturnValue(false);
  mockUseEventTrackerOptional.mockReturnValue({ track: jest.fn(), flush: jest.fn() });
});

describe('ActivatorResetButton — visibility gate', () => {
  it('is absent when overlayVariant is not familyfarm, even with a token', async () => {
    mockGetVipToken.mockReturnValue('some-token');
    render(<ActivatorResetButton landing="regular-landing" overlayVariant="regular" />);
    await waitFor(() => {
      expect(screen.queryByText('Cerrar sesión')).toBeNull();
    });
  });

  it('is absent when overlayVariant is familyfarm but there is no token', async () => {
    mockGetVipToken.mockReturnValue(null);
    render(<ActivatorResetButton landing="family-farm-cosechador" overlayVariant="familyfarm" />);
    await waitFor(() => {
      expect(screen.queryByText('Cerrar sesión')).toBeNull();
    });
  });

  it('is present when overlayVariant is familyfarm and a token exists', async () => {
    mockGetVipToken.mockReturnValue('vip-token-123');
    render(<ActivatorResetButton landing="family-farm-cosechador" overlayVariant="familyfarm" />);
    await waitFor(() => {
      expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
    });
  });
});

const NOTICE_TEXT =
  'Se cerrará el acceso actual y volverá a aparecer la pantalla de ingreso de DNI para el siguiente cliente.';

async function renderVisibleButton() {
  mockGetVipToken.mockReturnValue('vip-token-123');
  const utils = render(
    <ActivatorResetButton landing="family-farm-cosechador" overlayVariant="familyfarm" />
  );
  const trigger = await screen.findByText('Cerrar sesión');
  return { ...utils, trigger };
}

describe('ActivatorResetButton — confirm sequence', () => {
  it('opens the dialog with title and notice when the trigger is clicked', async () => {
    const user = userEvent.setup();
    const { trigger } = await renderVisibleButton();

    await user.click(trigger);

    expect(screen.getByText('¿Cerrar la sesión actual?')).toBeInTheDocument();
    expect(screen.getByText(NOTICE_TEXT)).toBeInTheDocument();
  });

  it('Cancelar closes the dialog without clearing data, navigating, or tracking', async () => {
    const user = userEvent.setup();
    const { trigger } = await renderVisibleButton();
    await user.click(trigger);

    await user.click(screen.getByText('Cancelar'));

    expect(mockClearVipData).not.toHaveBeenCalled();
    expect(mockHardNavigate).not.toHaveBeenCalled();
    const tracker = mockUseEventTrackerOptional.mock.results[0].value;
    expect(tracker.track).not.toHaveBeenCalled();
  });

  it('Sí, cerrar tracks, flushes, clears data, and hard-navigates in order', async () => {
    const track = jest.fn();
    const flush = jest.fn();
    mockUseEventTrackerOptional.mockReturnValue({ track, flush });
    const user = userEvent.setup();
    const { trigger } = await renderVisibleButton();
    await user.click(trigger);

    await user.click(screen.getByText('Sí, cerrar'));

    expect(track).toHaveBeenCalledWith('cta_click', {
      cta_name: 'activator_session_reset',
      landing_slug: 'family-farm-cosechador',
      location: 'catalogo_footer',
    });
    expect(mockHardNavigate).toHaveBeenCalledWith('/family-farm-cosechador/catalogo');
    expect(track.mock.invocationCallOrder[0]).toBeLessThan(flush.mock.invocationCallOrder[0]);
    expect(flush.mock.invocationCallOrder[0]).toBeLessThan(mockClearVipData.mock.invocationCallOrder[0]);
    expect(mockClearVipData.mock.invocationCallOrder[0]).toBeLessThan(
      mockHardNavigate.mock.invocationCallOrder[0]
    );
  });

  it('guards against double-submit: rapid double click only fires the effects once', async () => {
    const user = userEvent.setup();
    const { trigger } = await renderVisibleButton();
    await user.click(trigger);

    const confirmButton = screen.getByText('Sí, cerrar');
    await user.click(confirmButton);
    await user.click(confirmButton);

    expect(mockClearVipData).toHaveBeenCalledTimes(1);
    expect(mockHardNavigate).toHaveBeenCalledTimes(1);
  });

  it('completes the confirm flow without throwing when there is no tracker in context', async () => {
    mockUseEventTrackerOptional.mockReturnValue(null);
    const user = userEvent.setup();
    const { trigger } = await renderVisibleButton();
    await user.click(trigger);

    await expect(user.click(screen.getByText('Sí, cerrar'))).resolves.not.toThrow();

    expect(mockClearVipData).toHaveBeenCalled();
    expect(mockHardNavigate).toHaveBeenCalled();
  });

  it('still hard-navigates even if clearVipData throws (private-mode storage failure)', async () => {
    mockClearVipData.mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    const user = userEvent.setup();
    const { trigger } = await renderVisibleButton();
    await user.click(trigger);

    await user.click(screen.getByText('Sí, cerrar'));

    expect(mockHardNavigate).toHaveBeenCalled();
  });

  it('renders all five approved literal copy strings verbatim', async () => {
    const user = userEvent.setup();
    const { trigger } = await renderVisibleButton();
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();

    await user.click(trigger);

    expect(screen.getByText('¿Cerrar la sesión actual?')).toBeInTheDocument();
    expect(screen.getByText(NOTICE_TEXT)).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Sí, cerrar')).toBeInTheDocument();
  });
});
