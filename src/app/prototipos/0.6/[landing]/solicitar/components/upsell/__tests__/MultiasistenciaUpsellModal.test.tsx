import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiasistenciaUpsellModal } from '../MultiasistenciaUpsellModal';

// NextUI's Modal uses framer-motion's `m` (LazyMotion) namespace, no exportado
// por el mock global de jest.setup.js (que solo define `motion`/`AnimatePresence`).
// Se sobreescribe localmente para que Modal pueda montar en jsdom.
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  m: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  LazyMotion: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

test('muestra copy y dispara accept', () => {
  const onAccept = jest.fn(); const onDecline = jest.fn();
  render(<MultiasistenciaUpsellModal isOpen monthlyPrice={5} onAccept={onAccept} onDecline={onDecline} />);
  expect(screen.getByText(/Lo más elegido por las familias/)).toBeInTheDocument();
  expect(screen.getByText(/Protégete hoy, no cuando ya sea tarde/)).toBeInTheDocument();
  expect(screen.getByText(/Por solo/)).toBeInTheDocument();
  expect(screen.queryByText(/cuando lo necesiten/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByText(/Sí, lo quiero/));
  expect(onAccept).toHaveBeenCalled();
});

test('dispara decline', () => {
  const onAccept = jest.fn(); const onDecline = jest.fn();
  render(<MultiasistenciaUpsellModal isOpen monthlyPrice={5} onAccept={onAccept} onDecline={onDecline} />);
  fireEvent.click(screen.getByText(/No, continuar sin protección/));
  expect(onDecline).toHaveBeenCalled();
});

test('doble click en aceptar dispara onAccept una sola vez', () => {
  const onAccept = jest.fn(); const onDecline = jest.fn();
  render(<MultiasistenciaUpsellModal isOpen monthlyPrice={5} onAccept={onAccept} onDecline={onDecline} />);
  const acceptBtn = screen.getByText(/Sí, lo quiero/);
  fireEvent.click(acceptBtn);
  fireEvent.click(acceptBtn);
  expect(onAccept).toHaveBeenCalledTimes(1);
  expect(onDecline).not.toHaveBeenCalled();
});

test('tras aceptar, el botón de rechazar queda deshabilitado', () => {
  const onAccept = jest.fn(); const onDecline = jest.fn();
  render(<MultiasistenciaUpsellModal isOpen monthlyPrice={5} onAccept={onAccept} onDecline={onDecline} />);
  const acceptBtn = screen.getByText(/Sí, lo quiero/);
  const declineBtn = screen.getByText(/No, continuar sin protección/);
  fireEvent.click(acceptBtn);
  fireEvent.click(declineBtn);
  expect(onDecline).not.toHaveBeenCalled();
  expect(declineBtn).toBeDisabled();
  expect(acceptBtn).toBeDisabled();
});

test('tras aceptar, cerrar con Escape/backdrop no dispara onDecline', () => {
  const onAccept = jest.fn(); const onDecline = jest.fn();
  render(<MultiasistenciaUpsellModal isOpen monthlyPrice={5} onAccept={onAccept} onDecline={onDecline} />);
  fireEvent.click(screen.getByText(/Sí, lo quiero/));
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(onAccept).toHaveBeenCalledTimes(1);
  expect(onDecline).not.toHaveBeenCalled();
});

test('tras rechazar, el botón de aceptar queda deshabilitado', () => {
  const onAccept = jest.fn(); const onDecline = jest.fn();
  render(<MultiasistenciaUpsellModal isOpen monthlyPrice={5} onAccept={onAccept} onDecline={onDecline} />);
  const acceptBtn = screen.getByText(/Sí, lo quiero/);
  const declineBtn = screen.getByText(/No, continuar sin protección/);
  fireEvent.click(declineBtn);
  fireEvent.click(acceptBtn);
  expect(onAccept).not.toHaveBeenCalled();
  expect(acceptBtn).toBeDisabled();
});
