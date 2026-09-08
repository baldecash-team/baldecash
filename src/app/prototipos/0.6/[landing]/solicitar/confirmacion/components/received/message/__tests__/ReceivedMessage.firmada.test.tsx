/// <reference types="jest" />
/**
 * El mensaje final de quien firmó aceptando el contrato.
 *
 * Lo que se protege: que no le diga "estamos revisando tu solicitud" a alguien
 * que acaba de firmar. Es falso —no dejó una solicitud en evaluación, firmó una
 * operación— y, peor, la manda a esperar un veredicto en vez de hacer lo único
 * que falta: pagar la inicial o llenar el formulario.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ReceivedMessage } from '../ReceivedMessage';

const data = {
  userName: 'Maria',
  applicationId: 'APP-2026-00028',
  estimatedResponseHours: 24,
} as never;

const cierre = (over: Partial<{ pago_inicial: boolean; formulario: boolean }> = {}) => ({
  firmada: true,
  pendiente: { pago_inicial: false, formulario: false, ...over },
});

it('sin firma dice lo de siempre', () => {
  render(<ReceivedMessage data={data} />);

  expect(screen.getByText(/Hemos recibido tu solicitud/)).toBeInTheDocument();
  expect(screen.getByText(/Estamos revisando/)).toBeInTheDocument();
});

it('firmada lo dice, y no habla de revisión', () => {
  render(<ReceivedMessage data={data} cierre={cierre()} />);

  expect(screen.getByText(/Solicitud firmada/)).toBeInTheDocument();
  expect(screen.queryByText(/Estamos revisando/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Hemos recibido tu solicitud/)).not.toBeInTheDocument();
});

it('con inicial pendiente, eso es lo que falta', () => {
  render(<ReceivedMessage data={data} cierre={cierre({ pago_inicial: true })} />);

  expect(screen.getByText(/pagues tu cuota inicial/)).toBeInTheDocument();
});

it('con formulario pendiente, eso es lo que falta', () => {
  render(<ReceivedMessage data={data} cierre={cierre({ formulario: true })} />);

  expect(screen.getByText(/completes el formulario/)).toBeInTheDocument();
});

it('la inicial manda sobre el formulario: sin pagarla no hay entrega', () => {
  render(
    <ReceivedMessage data={data} cierre={cierre({ pago_inicial: true, formulario: true })} />,
  );

  expect(screen.getByText(/pagues tu cuota inicial/)).toBeInTheDocument();
  expect(screen.queryByText(/completes el formulario/)).not.toBeInTheDocument();
});

it('sin nada pendiente le dice dónde está su copia', () => {
  render(<ReceivedMessage data={data} cierre={cierre()} />);

  expect(screen.getByText(/tu copia y los siguientes pasos/)).toBeInTheDocument();
});
