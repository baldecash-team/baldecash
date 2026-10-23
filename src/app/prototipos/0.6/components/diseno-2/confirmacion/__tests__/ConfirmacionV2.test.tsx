/**
 * F8 (BAL-4967): integración de `ConfirmacionV2` — arma la cabecera, la
 * línea de tiempo (solo en el caso por defecto) y la tarjeta a partir de la
 * MISMA `ReceivedData` que usa Diseño 1.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfirmacionV2 } from '../ConfirmacionV2';
import type { ReceivedData } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/types/received';

function baseData(overrides: Partial<ReceivedData> = {}): ReceivedData {
  return {
    applicationId: 'APP-2026-00123',
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

describe('ConfirmacionV2', () => {
  it('caso por defecto: cabecera + línea de tiempo (4 hitos) + tarjeta', () => {
    render(<ConfirmacionV2 data={baseData()} landing="pago-diferido" />);
    expect(screen.getByText(/Solicitud N\.° APP-2026-00123/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '¡Recibimos tu solicitud, Brenda!' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '¿Qué pasa ahora?' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('Laptop Lenovo V15')).toBeInTheDocument();
  });

  it('sin nombre: título sin nombre', () => {
    render(<ConfirmacionV2 data={baseData({ userName: 'Usuario' })} landing="pago-diferido" />);
    expect(screen.getByRole('heading', { name: '¡Recibimos tu solicitud!' })).toBeInTheDocument();
  });

  it('firmada: sin línea de tiempo (sería falso decir "estamos revisando")', () => {
    render(
      <ConfirmacionV2
        data={baseData()}
        landing="pago-diferido"
        cierre={{ firmada: true, pendiente: { pago_inicial: false, formulario: false } }}
      />,
    );
    expect(screen.getByRole('heading', { name: '¡Solicitud firmada, Brenda!' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '¿Qué pasa ahora?' })).not.toBeInTheDocument();
    // La tarjeta se conserva igual.
    expect(screen.getByText('Laptop Lenovo V15')).toBeInTheDocument();
  });

  it('la hora del primer hito sale de `submittedAt` (no del fallback "ahora" de `ReceivedData`)', () => {
    render(<ConfirmacionV2 data={baseData()} landing="pago-diferido" submittedAt="2026-10-22T08:38:00-05:00" />);
    expect(screen.getByText(/Hoy, \d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('sin `submittedAt`: el primer hito dice solo "Hoy"', () => {
    render(<ConfirmacionV2 data={baseData()} landing="pago-diferido" />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Hoy');
  });

  it('muestra el `otpCta` donde iba', () => {
    render(
      <ConfirmacionV2 data={baseData()} landing="pago-diferido" otpCta={<div>Valida tu correo</div>} />,
    );
    expect(screen.getByText('Valida tu correo')).toBeInTheDocument();
  });
});
