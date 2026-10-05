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

describe('Confirmación tras cerrar el KYC — cosechador', () => {
  it('celebra el proceso terminado en vez de anunciar que se recibió la solicitud', () => {
    render(<ReceivedScreen data={data} modoCierreKyc="completado" />);

    expect(screen.getByText(/Felicitaciones por finalizar todo el proceso/i)).toBeInTheDocument();
    expect(screen.queryByText(/Hemos recibido tu solicitud/i)).not.toBeInTheDocument();
  });

  it('no promete un plazo de respuesta: ya no hay nada que responder', () => {
    render(<ReceivedScreen data={data} modoCierreKyc="completado" />);

    expect(screen.queryByText(/Estamos revisando tu información/i)).not.toBeInTheDocument();
    expect(screen.getByText(/firmado/i)).toBeInTheDocument();
  });

  it('oculta el timeline de estado, que diría que sigue en evaluación', () => {
    render(<ReceivedScreen data={data} modoCierreKyc="completado" />);

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

/**
 * Administrativo y obrero fijo no pasan por KYC —su landing lo trae apagado— y
 * en el convenio la aprobación está garantizada por la whitelist. Van del submit
 * directo acá, así que la pantalla anuncia la aprobación y el contacto del
 * asesor, no un proceso que ellos tengan que terminar.
 */
describe('Confirmación del submit — administrativo y obrero fijo', () => {
  it('anuncia la aprobación y el contacto, sin hablar de proceso terminado', () => {
    render(<ReceivedScreen data={data} modoCierreKyc="aprobado" />);

    expect(screen.getByText(/Solicitud aprobada/i)).toBeInTheDocument();
    expect(screen.getByText(/Nos pondremos en contacto contigo/i)).toBeInTheDocument();
    expect(screen.queryByText(/Felicitaciones por finalizar todo el proceso/i)).not.toBeInTheDocument();
    // Sin plazo: la solicitud ya esta resuelta, no hay nada que esperar.
    expect(screen.queryByText(/24 horas/i)).not.toBeInTheDocument();
  });

  it('no promete un plazo ni deja el timeline: ya no esta en evaluacion', () => {
    render(<ReceivedScreen data={data} modoCierreKyc="aprobado" />);

    expect(screen.queryByText(/Estamos revisando tu información/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/En revisión/i)).not.toBeInTheDocument();
  });
});
