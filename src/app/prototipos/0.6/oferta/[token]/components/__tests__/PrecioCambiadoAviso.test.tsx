/**
 * PrecioCambiadoAviso — BAL-4198: si el `/select` responde `price_changed`,
 * el cliente ve el monto nuevo y decide: confirmarlo o volver.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { PrecioCambiadoAviso, formatoCuota } from '../PrecioCambiadoAviso';

// El Modal de NextUI necesita framer-motion y portales que jsdom no trae: se
// reemplaza por un contenedor que respeta `isOpen`.
jest.mock('@nextui-org/react', () => ({
  __esModule: true,
  Modal: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
  ModalContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ModalBody: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('PrecioCambiadoAviso', () => {
  it('muestra la cuota nueva y la que el cliente veía', () => {
    render(
      <PrecioCambiadoAviso isOpen nuevaCuota={110} cuotaVista={99} onConfirmar={jest.fn()} onVolver={jest.fn()} />,
    );
    expect(screen.getByText('El precio cambió: ahora es S/110/mes')).toBeInTheDocument();
    expect(screen.getByText(/Estabas viendo S\/99\/mes/)).toBeInTheDocument();
  });

  it('confirmar el monto nuevo llama onConfirmar', () => {
    const onConfirmar = jest.fn();
    render(<PrecioCambiadoAviso isOpen nuevaCuota={110} onConfirmar={onConfirmar} onVolver={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar S/110/mes' }));
    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });

  it('volver llama onVolver', () => {
    const onVolver = jest.fn();
    render(<PrecioCambiadoAviso isOpen nuevaCuota={110} onConfirmar={jest.fn()} onVolver={onVolver} />);
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(onVolver).toHaveBeenCalled();
  });

  it('mientras confirma, los botones quedan deshabilitados', () => {
    render(<PrecioCambiadoAviso isOpen confirming nuevaCuota={110} onConfirmar={jest.fn()} onVolver={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Procesando…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Volver' })).toBeDisabled();
  });

  it('cerrado no pinta nada', () => {
    render(<PrecioCambiadoAviso isOpen={false} nuevaCuota={110} onConfirmar={jest.fn()} onVolver={jest.fn()} />);
    expect(screen.queryByText(/El precio cambió/)).not.toBeInTheDocument();
  });

  it('formato: entero sin decimales, con céntimos a 2', () => {
    expect(formatoCuota(110)).toBe('110');
    expect(formatoCuota(99.5)).toBe('99.50');
  });
});
