/**
 * El aviso del pie del modal de confirmación: en el downgrade/upsell habla de
 * la solicitud «aprobada»; en la oferta manual con catálogo (BAL-4688), no.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  AVISO_OFERTA_MANUAL,
  AVISO_POR_DEFECTO,
  ConfirmarEleccionModal,
} from '../ConfirmarEleccionModal';

// jsdom no trae lo que usan el bottom sheet y el Modal de NextUI: se dejan
// contenedores simples. Se prueba la vista de escritorio.
jest.mock('framer-motion', () => ({
  __esModule: true,
  motion: { div: ({ children }: { children?: React.ReactNode }) => <div>{children}</div> },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  useDragControls: () => ({ start: jest.fn() }),
}));
jest.mock('@/app/prototipos/_shared', () => ({ useIsMobile: () => false }));
jest.mock('@nextui-org/react', () => ({
  __esModule: true,
  Modal: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
  ModalContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Button: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
    <button type="button" onClick={onPress}>{children}</button>
  ),
}));

const equipo = { name: 'Laptop V15', monthly: 159 };

const abrir = (aviso?: string) =>
  render(
    <ConfirmarEleccionModal isOpen equipo={equipo} onConfirm={jest.fn()} onClose={jest.fn()} aviso={aviso} />,
  );

describe('ConfirmarEleccionModal — aviso', () => {
  it('sin aviso, el de siempre', () => {
    abrir();
    expect(screen.getByText(AVISO_POR_DEFECTO)).toBeInTheDocument();
  });

  it('en la oferta manual, sin «aprobada»', () => {
    abrir(AVISO_OFERTA_MANUAL);
    expect(screen.getByText(AVISO_OFERTA_MANUAL)).toBeInTheDocument();
    expect(screen.queryByText(/aprobada/i)).not.toBeInTheDocument();
  });
});
