import React from 'react';
import { render, screen } from '@testing-library/react';

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

const mockUseIsMobile = jest.fn(() => false);
jest.mock('@/app/prototipos/_shared', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

import { ActivatorResetDialog } from '../ActivatorResetDialog';

const NOTICE_TEXT =
  'Se cerrará el acceso actual y volverá a aparecer la pantalla de ingreso de DNI para el siguiente cliente.';

beforeEach(() => {
  jest.clearAllMocks();
  mockUseIsMobile.mockReturnValue(false);
});

describe('ActivatorResetDialog — desktop', () => {
  it('renders title, notice and both footer buttons when open', () => {
    render(
      <ActivatorResetDialog isOpen isBusy={false} onConfirm={jest.fn()} onClose={jest.fn()} />
    );
    expect(screen.getByText('¿Cerrar la sesión actual?')).toBeInTheDocument();
    expect(screen.getByText(NOTICE_TEXT)).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Sí, cerrar')).toBeInTheDocument();
  });

  it('renders nothing visible when closed', () => {
    render(
      <ActivatorResetDialog isOpen={false} isBusy={false} onConfirm={jest.fn()} onClose={jest.fn()} />
    );
    expect(screen.queryByText('¿Cerrar la sesión actual?')).toBeNull();
  });

  it('uses amber notice classes, not green', () => {
    render(
      <ActivatorResetDialog isOpen isBusy={false} onConfirm={jest.fn()} onClose={jest.fn()} />
    );
    const notice = screen.getByText(NOTICE_TEXT);
    const box = notice.closest('div');
    expect(box?.className).toContain('bg-amber-50');
    expect(box?.className).toContain('border-amber-200');
    expect(box?.className).toContain('text-amber-800');
    expect(box?.className).not.toContain('green');
  });
});

describe('ActivatorResetDialog — mobile', () => {
  it('renders the same copy via the bottom-sheet variant', () => {
    mockUseIsMobile.mockReturnValue(true);
    render(
      <ActivatorResetDialog isOpen isBusy={false} onConfirm={jest.fn()} onClose={jest.fn()} />
    );
    expect(screen.getByText('¿Cerrar la sesión actual?')).toBeInTheDocument();
    expect(screen.getByText(NOTICE_TEXT)).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Sí, cerrar')).toBeInTheDocument();
  });
});
