import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductSummary } from './ProductSummary';
import type { ReceivedData } from '../../../types/received';

/**
 * La confirmacion era el unico punto del recorrido que seguia mostrando la
 * imagen del producto con el apagado activo: se apagaba en la portada de
 * solicitar y en los tres bloques de la barra, y reaparecia justo en la ultima
 * pantalla.
 *
 * Es la misma trampa del selector de plazo. Por eso la decision se lee del
 * contexto de la landing y no se pasa por propiedades: pasarla obliga a que
 * cada punto de montaje se acuerde, que es como se llega a este estado.
 */

const mockFlag = { mostrarImagen: true };

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'prestamo-matricula' }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    landingId: 221,
    mostrarImagenProducto: mockFlag.mostrarImagen,
  }),
}));

const DATOS = {
  paymentFrequency: 'mensual',
  term: 12,
  termMonths: 12,
  products: [
    {
      name: 'Prestamo Matricula',
      brand: 'BaldeCash',
      image: 'https://ejemplo.test/producto.png',
      monthlyPayment: 75,
      quantity: 1,
      unitPrice: 950,
      initialAmount: 0,
      initialPercent: 0,
    },
  ],
  accessories: [],
  insurances: [],
} as unknown as ReceivedData;

function montar() {
  return render(<ProductSummary data={DATOS} />);
}

describe('ProductSummary — imagen del producto', () => {
  it('dibuja la imagen cuando el preset no la apaga', () => {
    mockFlag.mostrarImagen = true;

    montar();

    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('no dibuja la imagen cuando el preset la apaga', () => {
    mockFlag.mostrarImagen = false;

    montar();

    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('conserva el nombre del producto con la imagen apagada', () => {
    mockFlag.mostrarImagen = false;

    montar();

    expect(screen.getAllByText(/Prestamo Matricula/i).length).toBeGreaterThan(0);
  });
});
