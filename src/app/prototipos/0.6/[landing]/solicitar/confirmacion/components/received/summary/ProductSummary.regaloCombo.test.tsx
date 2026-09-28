import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductSummary } from './ProductSummary';
import type { ReceivedData } from '../../../types/received';

/** BAL-4200: el regalo del combo no es un accesorio a S/0, es un regalo. */

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'home' }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ landingId: 1, mostrarImagenProducto: true }),
}));

const DATOS = {
  paymentFrequency: 'mensual',
  term: 24,
  termMonths: 24,
  products: [
    {
      name: 'Laptop 200 G2i Gris Hierro i5 8GB 512GB con mochila de regalo',
      brand: 'HP',
      image: 'https://ejemplo.test/combo.webp',
      monthlyQuota: 209,
      quantity: 1,
    },
  ],
  accessories: [
    { name: 'Mochila Nova Grey/Brown', monthlyQuota: 0, isGift: true },
    { name: 'Mouse inalambrico', monthlyQuota: 12, isGift: false },
  ],
  insurances: [],
  totalMonthlyQuota: 221,
} as unknown as ReceivedData;

describe('ProductSummary — regalo del combo', () => {
  it('muestra el regalo como "Regalo · Incluido" y el accesorio pagado con su cuota', () => {
    render(<ProductSummary data={DATOS} />);

    expect(screen.getByText('Mochila Nova Grey/Brown')).toBeInTheDocument();
    expect(screen.getByText(/Regalo · Incluido/)).toBeInTheDocument();
    expect(screen.queryByText(/\+S\/0/)).not.toBeInTheDocument();
    expect(screen.getByText(/\+S\/12/)).toBeInTheDocument();
  });

  it('muestra el nombre del combo', () => {
    render(<ProductSummary data={DATOS} />);

    expect(screen.getByText(/con mochila de regalo/)).toBeInTheDocument();
  });
});
