/**
 * F8 (BAL-4967) y BAL-5274: la tarjeta «Tu solicitud» del prototipo v53
 * (equipo, plazo + inicial, cuota total, día de pago, entrega, regalo) y
 * omite los datos faltantes sin dejar filas vacías.
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

  it('cabecera: «Tu solicitud», equipo y «24 meses · Sin inicial»', () => {
    render(<TarjetaSolicitudV2 data={baseData()} landingSlug="pago-diferido" />);
    expect(screen.getByRole('complementary', { name: 'Tu solicitud' })).toBeInTheDocument();
    expect(screen.getByText('Laptop Lenovo V15')).toBeInTheDocument();
    expect(screen.getByText('24 meses · Sin inicial')).toBeInTheDocument();
  });

  it('con inicial: «24 meses · Inicial S/210»', () => {
    render(<TarjetaSolicitudV2 data={baseData({ initialPayment: 210 })} landingSlug="pago-diferido" />);
    expect(screen.getByText('24 meses · Inicial S/210')).toBeInTheDocument();
  });

  it('sin día de pago, entrega ni regalo: solo la cuota', () => {
    render(<TarjetaSolicitudV2 data={baseData()} landingSlug="pago-diferido" />);
    expect(screen.getByText('Cuota mensual total')).toBeInTheDocument();
    expect(screen.queryByText('Día de pago')).not.toBeInTheDocument();
    expect(screen.queryByText('Entrega')).not.toBeInTheDocument();
    expect(screen.queryByText('Regalo')).not.toBeInTheDocument();
  });

  it('filas en el orden del prototipo: cuota, día de pago, entrega, regalo', () => {
    const { container } = render(
      <TarjetaSolicitudV2
        data={baseData({ accessories: [{ name: 'Travel Backpack', monthlyQuota: 0, isGift: true }] })}
        landingSlug="pago-diferido"
        opciones={{ paymentDay: 3, entrega: 'En tu casa · Miraflores' }}
      />,
    );
    const rotulos = Array.from(container.querySelectorAll('dt')).map((dt) => dt.textContent);
    expect(rotulos).toEqual(['Cuota mensual total', 'Día de pago', 'Entrega', 'Regalo']);
    expect(screen.getByText('S/159/mes')).toBeInTheDocument();
    expect(screen.getByText('Día 3 de cada mes')).toBeInTheDocument();
    expect(screen.getByText('En tu casa · Miraflores')).toBeInTheDocument();
    expect(screen.getByText('Travel Backpack')).toBeInTheDocument();
  });

  it('la cuota total es la del backend (`totalMonthlyQuota`), no un recálculo', () => {
    render(<TarjetaSolicitudV2 data={baseData({ totalMonthlyQuota: 321 })} landingSlug="pago-diferido" />);
    expect(screen.getByText('S/321/mes')).toBeInTheDocument();
  });

  it('no lista accesorios ni protecciones (el prototipo no los muestra)', () => {
    render(
      <TarjetaSolicitudV2
        data={baseData({
          accessories: [{ name: 'Mochila Nova', monthlyQuota: 6 }],
          insurances: [{ name: 'Seguro Contra Robo', monthlyPrice: 25 }],
        })}
        landingSlug="pago-diferido"
      />,
    );
    expect(screen.queryByText('Mochila Nova')).not.toBeInTheDocument();
    expect(screen.queryByText('Seguro Contra Robo')).not.toBeInTheDocument();
  });

  it('con varios regalos (incluido el de BaldeCash): «Regalos» y una cápsula por regalo', () => {
    const { container } = render(
      <TarjetaSolicitudV2
        data={baseData({
          accessories: [{ name: 'Kaspersky Estándar 1 pc', monthlyQuota: 0, isGift: true }],
          regaloBaldecash: { name: 'Mouse Logitech M170', image: '' },
        })}
        landingSlug="pago-diferido"
      />,
    );
    expect(screen.getByText('Regalos')).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll('[data-regalo]')).map((n) => n.textContent)).toEqual([
      'Kaspersky Estándar 1 pc',
      'Mouse Logitech M170',
    ]);
  });

  it('con foto usa la del equipo; sin foto, el dibujo del prototipo (sin <img>)', () => {
    const { rerender } = render(
      <TarjetaSolicitudV2
        data={baseData({ products: [{ name: 'Laptop Lenovo V15', image: 'https://x/v15.png', quantity: 1, unitPrice: 1, finalPrice: 1, monthlyQuota: 159 }] })}
        landingSlug="pago-diferido"
      />,
    );
    expect(screen.getByRole('img', { name: 'Laptop Lenovo V15' })).toHaveAttribute('src', 'https://x/v15.png');
    rerender(<TarjetaSolicitudV2 data={baseData()} landingSlug="pago-diferido" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
