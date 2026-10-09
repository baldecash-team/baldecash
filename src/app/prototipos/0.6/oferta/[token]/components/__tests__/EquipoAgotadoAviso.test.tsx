/**
 * EquipoAgotadoAviso — si el `/select` responde `unit_out_of_stock` (otro
 * cliente tomó la última unidad), el cliente ve el aviso y vuelve a elegir.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { OfferApiError } from '../../../../services/offerApi';
import { EquipoAgotadoAviso, esEquipoAgotado } from '../EquipoAgotadoAviso';

// El Modal de NextUI necesita framer-motion y portales que jsdom no trae: se
// reemplaza por un contenedor que respeta `isOpen`.
jest.mock('@nextui-org/react', () => ({
  __esModule: true,
  Modal: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
  ModalContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ModalBody: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('EquipoAgotadoAviso', () => {
  it('avisa que otro cliente se llevó el equipo y deja elegir otro', () => {
    const onElegirOtro = jest.fn();
    render(<EquipoAgotadoAviso isOpen onElegirOtro={onElegirOtro} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Otro cliente acaba de llevarse este equipo')).toBeInTheDocument();
    expect(screen.getByText(/Elige otro de tu oferta/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver otros equipos' }));
    expect(onElegirOtro).toHaveBeenCalledTimes(1);
  });

  it('cerrado no pinta nada', () => {
    render(<EquipoAgotadoAviso isOpen={false} onElegirOtro={jest.fn()} />);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('solo reconoce el 409 unit_out_of_stock', () => {
    expect(esEquipoAgotado(new OfferApiError('unit_out_of_stock', 'x', 409))).toBe(true);
    expect(esEquipoAgotado(new OfferApiError('price_changed', 'x', 409))).toBe(false);
    expect(esEquipoAgotado(new Error('red'))).toBe(false);
  });
});
