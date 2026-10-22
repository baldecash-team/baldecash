/**
 * F8 (BAL-4967): la tarjeta omite los datos faltantes sin dejar filas vacías.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TarjetaSolicitudV2 } from '../TarjetaSolicitudV2';
import type { ReceivedData } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/types/received';

function baseData(overrides: Partial<ReceivedData> = {}): ReceivedData {
  return {
    applicationId: 'APP-1',
    userName: 'Brenda',
    submittedAt: new Date(),
    estimatedResponseHours: 24,
    products: [{ name: 'Laptop Lenovo V15', image: '', quantity: 1, unitPrice: 1, finalPrice: 1, monthlyQuota: 159 }],
    term: 24,
    termMonths: 24,
    paymentFrequency: 'mensual',
    initialPayment: 0,
    totalMonthlyQuota: 159,
    notificationChannels: ['whatsapp'],
    ...overrides,
  };
}

describe('TarjetaSolicitudV2', () => {
  it('sin productos no pinta nada', () => {
    const { container } = render(<TarjetaSolicitudV2 data={baseData({ products: [] })} landingSlug="pago-diferido" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sin día de pago, entrega ni regalo: no muestra esas filas', () => {
    render(<TarjetaSolicitudV2 data={baseData()} landingSlug="pago-diferido" />);
    expect(screen.queryByText('Día de pago')).not.toBeInTheDocument();
    expect(screen.queryByText('Entrega')).not.toBeInTheDocument();
    expect(screen.queryByText('Regalo')).not.toBeInTheDocument();
    expect(screen.getByText('Laptop Lenovo V15')).toBeInTheDocument();
  });

  it('con día de pago, entrega y regalo: las tres filas aparecen', () => {
    render(
      <TarjetaSolicitudV2
        data={baseData({ accessories: [{ name: 'Mochila', monthlyQuota: 0, isGift: true }] })}
        landingSlug="pago-diferido"
        opciones={{ paymentDay: 18, entrega: 'En tu casa · Miraflores' }}
      />,
    );
    expect(screen.getByText('Día de pago')).toBeInTheDocument();
    expect(screen.getByText('Día 18 de cada mes')).toBeInTheDocument();
    expect(screen.getByText('Entrega')).toBeInTheDocument();
    expect(screen.getByText('En tu casa · Miraflores')).toBeInTheDocument();
    expect(screen.getByText('Regalo')).toBeInTheDocument();
    expect(screen.getByText('Mochila')).toBeInTheDocument();
  });

  it('la cuota total es la del backend (`totalMonthlyQuota`), no un recálculo', () => {
    render(<TarjetaSolicitudV2 data={baseData({ totalMonthlyQuota: 321 })} landingSlug="pago-diferido" />);
    expect(screen.getByText('S/321')).toBeInTheDocument();
  });
});
