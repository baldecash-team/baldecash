/**
 * F8 (BAL-4967) y BAL-5274: integración de `ConfirmacionV2` — cabecera con la
 * barra de pasos de Zona Estudiantes (solo en el caso por defecto), botón a
 * Zona Estudiantes, tarjeta «Tu solicitud» e «Ir al inicio», a partir de la
 * MISMA `ReceivedData` que usa Diseño 1.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfirmacionV2 } from '../ConfirmacionV2';
import type { ReceivedData } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/types/received';

const mockTrack = jest.fn();
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack }),
}));

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

function pasos(): string[] {
  const lista = screen.queryByRole('list', { name: 'Pasos de tu solicitud' });
  return lista ? Array.from(lista.querySelectorAll('li')).map((li) => li.textContent ?? '') : [];
}

describe('ConfirmacionV2', () => {
  beforeEach(() => mockTrack.mockClear());

  it('caso por defecto sin inicial: cabecera, 4 pasos, Zona Estudiantes y tarjeta', () => {
    render(<ConfirmacionV2 data={baseData()} landing="home" telefono="9XX XXX 321" />);
    expect(screen.getByText(/Solicitud N\.° APP-2026-00123/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '¡Recibimos tu solicitud, Brenda!' })).toBeInTheDocument();
    expect(pasos()).toEqual(['Recibida', 'Evaluación', '3Firma', '4Entrega']);
    expect(screen.getByText(/Paso 2 de 4:/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sigue tu solicitud en Zona Estudiantes/ })).toHaveAttribute('target', '_blank');
    expect(screen.getByText('24 meses · Sin inicial')).toBeInTheDocument();
    // Sin la línea de tiempo vieja ni horas.
    expect(screen.queryByRole('heading', { name: '¿Qué pasa ahora?' })).not.toBeInTheDocument();
    expect(screen.queryByText(/horas/)).not.toBeInTheDocument();
  });

  it('con inicial: 5 pasos con «Cuota inicial» y «Inicial S/210» en la tarjeta', () => {
    render(<ConfirmacionV2 data={baseData({ initialPayment: 210 })} landing="home" />);
    expect(pasos()).toEqual(['Recibida', 'Evaluación', '3Firma', '4Cuota inicial', '5Entrega']);
    expect(screen.getByText(/Paso 2 de 5:/)).toBeInTheDocument();
    expect(screen.getByText('24 meses · Inicial S/210')).toBeInTheDocument();
  });

  it('pasa día de pago y entrega a la tarjeta', () => {
    render(
      <ConfirmacionV2
        data={baseData()}
        landing="home"
        tarjeta={{ paymentDay: 3, entrega: 'En tu casa · Miraflores' }}
      />,
    );
    expect(screen.getByText('Día 3 de cada mes')).toBeInTheDocument();
    expect(screen.getByText('En tu casa · Miraflores')).toBeInTheDocument();
  });

  it('sin nombre: título sin nombre', () => {
    render(<ConfirmacionV2 data={baseData({ userName: 'Usuario' })} landing="home" />);
    expect(screen.getByRole('heading', { name: '¡Recibimos tu solicitud!' })).toBeInTheDocument();
  });

  it('firmada: sin barra de pasos (sería falso decir «en evaluación»), con su subtítulo', () => {
    render(
      <ConfirmacionV2
        data={baseData()}
        landing="home"
        cierre={{ firmada: true, pendiente: { pago_inicial: false, formulario: false } }}
      />,
    );
    expect(screen.getByRole('heading', { name: '¡Solicitud firmada, Brenda!' })).toBeInTheDocument();
    expect(pasos()).toEqual([]);
    expect(screen.getByText(/Tu contrato quedó firmado/)).toBeInTheDocument();
    expect(screen.getByText('Laptop Lenovo V15')).toBeInTheDocument();
  });

  it('sin Baldi ni el bloque de WhatsApp de antes', () => {
    render(<ConfirmacionV2 data={baseData()} landing="home" />);
    expect(screen.queryByLabelText(/Baldecito/)).not.toBeInTheDocument();
    expect(screen.queryByText('¿Tienes alguna duda?')).not.toBeInTheDocument();
  });

  it('muestra el `otpCta` donde iba', () => {
    render(<ConfirmacionV2 data={baseData()} landing="home" otpCta={<div>Valida tu correo</div>} />);
    expect(screen.getByText('Valida tu correo')).toBeInTheDocument();
  });

  it('«Ir al inicio» emite los mismos eventos que el «Volver al inicio» de antes', () => {
    const onGoToHome = jest.fn();
    render(<ConfirmacionV2 data={baseData()} landing="home" onGoToHome={onGoToHome} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ir al inicio' }));
    expect(onGoToHome).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith('cta_click', { cta_name: 'go_home', location: 'confirmacion' });
  });

  it('el clic en Zona Estudiantes se registra (cta_click + aviso para confirmation_cta_click)', () => {
    const onZonaEstudiantes = jest.fn();
    render(<ConfirmacionV2 data={baseData()} landing="home" onZonaEstudiantes={onZonaEstudiantes} />);
    fireEvent.click(screen.getByRole('link', { name: /Sigue tu solicitud en Zona Estudiantes/ }));
    expect(mockTrack).toHaveBeenCalledWith('cta_click', { cta_name: 'zona_estudiantes', location: 'confirmacion' });
    expect(onZonaEstudiantes).toHaveBeenCalledTimes(1);
  });
});
