/// <reference types="jest" />
/**
 * Autorizaciones del convenio Family Farms en el paso del contrato.
 *
 * Son dos permisos sobre el dinero del trabajador y no se pueden dar por
 * incluidos en el "acepto el contrato": el de liquidación aplica a los tres
 * perfiles, y el de descuento por planilla SOLO al administrativo —el único
 * perfil quincenal, donde Valle y Pampa retiene y transfiere—. Pedirle a un
 * obrero que autorice una retención que nunca va a ocurrir sería hacerle firmar
 * de más.
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: jest.fn(), flush: jest.fn() }),
}));

jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, getContrato: jest.fn() };
});

import { ContratoStep } from '../ContratoStep';
import { getContrato } from '@/app/prototipos/0.6/services/kycApi';

const mockGetContrato = getContrato as jest.MockedFunction<typeof getContrato>;

const PLANILLA = /Autorizo a Family Farms Perú a retener de mi remuneración/;
const LIQUIDACION = /en caso de cese, se aplique al saldo pendiente/;

/** Monta el paso con contrato ya emitido y espera a que se pinte. */
async function montar(landing?: string) {
  mockGetContrato.mockResolvedValue({ disponible: true, html: '<p>Contrato de Juana Pérez</p>' });
  const onDone = jest.fn();
  render(
    <ContratoStep onDone={onDone} applicationCode="APP-77" documentNumber="70020010" landing={landing} />,
  );
  await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
  return { onDone, continuar: screen.getByRole('button', { name: 'Continuar' }) };
}

const marcar = (texto: RegExp | string) => fireEvent.click(screen.getByText(texto));

describe('ContratoStep — autorizaciones del convenio', () => {
  beforeEach(() => jest.clearAllMocks());

  it('administrativo: las dos, con el descuento por planilla primero', async () => {
    const { continuar } = await montar('family-farms-baldecash-a');

    const planilla = screen.getByText(PLANILLA);
    const liquidacion = screen.getByText(LIQUIDACION);
    expect(planilla).toBeInTheDocument();
    // El orden importa: la de planilla condiciona cómo se cobra cada quincena;
    // la de liquidación solo entra si hay cese.
    expect(planilla.compareDocumentPosition(liquidacion))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(continuar).toBeDisabled();
    marcar('He leído y acepto el contrato');
    expect(continuar).toBeDisabled();
    marcar(PLANILLA);
    expect(continuar).toBeDisabled();
    marcar(LIQUIDACION);
    expect(continuar).toBeEnabled();
  });

  it('perfiles no administrativos: solo la de liquidación', async () => {
    const { continuar } = await montar('family-farms-baldecash-b');

    expect(screen.queryByText(PLANILLA)).not.toBeInTheDocument();
    expect(screen.getByText(LIQUIDACION)).toBeInTheDocument();

    marcar('He leído y acepto el contrato');
    expect(continuar).toBeDisabled();
    marcar(LIQUIDACION);
    expect(continuar).toBeEnabled();
  });

  it('fuera del convenio no se pide ninguna: aceptar el contrato basta', async () => {
    const { continuar } = await montar('copia-home');

    expect(screen.queryByText(PLANILLA)).not.toBeInTheDocument();
    expect(screen.queryByText(LIQUIDACION)).not.toBeInTheDocument();

    marcar('He leído y acepto el contrato');
    expect(continuar).toBeEnabled();
  });

  it('sin landing tampoco se piden (no se adivina el perfil)', async () => {
    const { continuar } = await montar(undefined);

    expect(screen.queryByText(LIQUIDACION)).not.toBeInTheDocument();
    marcar('He leído y acepto el contrato');
    expect(continuar).toBeEnabled();
  });

  it('sin contrato emitido no hay nada que autorizar', async () => {
    mockGetContrato.mockResolvedValue({ disponible: false });
    render(
      <ContratoStep onDone={jest.fn()} applicationCode="APP-77" landing="family-farms-baldecash-a" />,
    );

    await waitFor(() => expect(screen.getByTestId('contrato-esperando')).toBeInTheDocument());
    expect(screen.queryByText(PLANILLA)).not.toBeInTheDocument();
    expect(screen.queryByText(LIQUIDACION)).not.toBeInTheDocument();
    // Y el paso no queda trabado esperando algo que solo llega con la aprobación.
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  });
});
