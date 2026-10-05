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

test('muestra copy y dispara accept/decline', () => {
  const onAccept = jest.fn(); const onDecline = jest.fn();
  render(<MultiasistenciaUpsellModal isOpen monthlyPrice={5} onAccept={onAccept} onDecline={onDecline} />);
  expect(screen.getByText(/Lo más elegido por las familias/)).toBeInTheDocument();
  expect(screen.getByText(/Protégete hoy, no cuando ya sea tarde/)).toBeInTheDocument();
  expect(screen.getByText(/Por solo/)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Sí, lo quiero/));
  expect(onAccept).toHaveBeenCalled();
  fireEvent.click(screen.getByText(/prefiero arriesgarme/));
  expect(onDecline).toHaveBeenCalled();
});
