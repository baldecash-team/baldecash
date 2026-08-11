/**
 * La confirmación tiene dos lecturas según cómo se llegue.
 *
 * Desde el submit, la solicitud está en evaluación: "Hemos recibido tu
 * solicitud", el plazo de respuesta y el timeline de estado.
 *
 * Desde el cierre del KYC (Family Farms), ya fue aprobada y firmada. Prometer
 * "en revisión" ahí sería decir lo contrario de lo que acaba de pasar, así que
 * el encabezado celebra el proceso terminado y el timeline no se muestra.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReceivedScreen } from '../components/received';
import type { ReceivedData } from '../types/received';

jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement('div', props as React.HTMLAttributes<HTMLDivElement>, children),
  }),
}));

const data: ReceivedData = {
  applicationId: 'APP-2026-99826738',
  userName: 'Luis',
  submittedAt: new Date('2026-08-11T12:00:00Z'),
  estimatedResponseHours: 24,
  products: [],
  termMonths: 6,
  initialPaymentPercent: 25,
  initialPayment: 134,
  totalMonthlyQuota: 45.4,
  notificationChannels: ['whatsapp', 'email'],
} as ReceivedData;

describe('Confirmación tras cerrar el KYC', () => {
  it('celebra el proceso terminado en vez de anunciar que se recibió la solicitud', () => {
    render(<ReceivedScreen data={data} kycCompletado />);

    expect(screen.getByText(/Felicitaciones por finalizar todo el proceso/i)).toBeInTheDocument();
    expect(screen.queryByText(/Hemos recibido tu solicitud/i)).not.toBeInTheDocument();
  });

  it('no promete un plazo de respuesta: ya no hay nada que responder', () => {
    render(<ReceivedScreen data={data} kycCompletado />);

    expect(screen.queryByText(/Estamos revisando tu información/i)).not.toBeInTheDocument();
    expect(screen.getByText(/firmado/i)).toBeInTheDocument();
  });

  it('oculta el timeline de estado, que diría que sigue en evaluación', () => {
    render(<ReceivedScreen data={data} kycCompletado />);

    expect(screen.queryByText(/En revisión/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Solicitud enviada/i)).not.toBeInTheDocument();
  });

  it('sin el flag deja la pantalla del submit intacta', () => {
    render(<ReceivedScreen data={data} />);

    expect(screen.getByText(/Hemos recibido tu solicitud/i)).toBeInTheDocument();
    expect(screen.getByText(/Estamos revisando tu información/i)).toBeInTheDocument();
    expect(screen.getByText(/En revisión/i)).toBeInTheDocument();
  });
});
