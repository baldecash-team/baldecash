/// <reference types="jest" />
/**
 * Regresión: los eventos `kyc_*` que emiten los sub-pasos deben llevar
 * `application_code` en `properties` — sin eso el panel de admin2 los
 * pierde (filtra por ese campo en SQL), igual que pasaba con los del
 * orquestador (`kycClient.tsx`) antes del fix. Diferenciante: si alguien
 * saca `application_code` de las `properties`, este test falla.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const mockTrack = jest.fn();

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

// El paso ahora pide el contrato de la solicitud al montar: sin documento no
// hay checkbox que aceptar, así que el caso de aceptación necesita uno emitido.
jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, getContrato: jest.fn() };
});

import { ContratoStep } from '../ContratoStep';
import { getContrato } from '@/app/prototipos/0.6/services/kycApi';

const mockGetContrato = getContrato as jest.MockedFunction<typeof getContrato>;

describe('ContratoStep — application_code en el tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetContrato.mockResolvedValue({ disponible: true, html: '<p>Contrato</p>' });
  });

  it('kyc_contract_view lleva application_code al montar', async () => {
    render(<ContratoStep onDone={jest.fn()} applicationCode="APP-77" />);

    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_contract_view',
      expect.objectContaining({ application_code: 'APP-77' }),
    );
    // El fetch del contrato resuelve después del assert; esperarlo evita el
    // warning de act() por el setState fuera del render.
    await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
  });

  it('kyc_contract_accepted lleva application_code al aceptar', async () => {
    const user = userEvent.setup();
    render(<ContratoStep onDone={jest.fn()} applicationCode="APP-77" />);

    await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
    await user.click(screen.getByText('He leído y acepto el contrato'));

    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_contract_accepted',
      expect.objectContaining({ application_code: 'APP-77' }),
    );
  });
});

/**
 * Qué autorizó la persona, no solo que aceptó.
 *
 * `kyc_contract_accepted` mira únicamente el check del contrato, y las
 * autorizaciones del convenio —permisos distintos sobre el dinero del
 * trabajador— no dejaban rastro en ningún lado: ni evento, ni columna. Estos
 * eventos se SUMAN; ninguno reemplaza a los que ya existían, y en particular el
 * `kyc_step_complete` del wizard se sigue emitiendo igual.
 */
describe('ContratoStep — autorizaciones en el tracking', () => {
  const PLANILLA = /Autorizo a Family Farms Perú a retener de mi remuneración/;
  const LIQUIDACION = /en caso de cese, se aplique al saldo pendiente/;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetContrato.mockResolvedValue({ disponible: true, html: '<p>Contrato</p>' });
  });

  async function montar(landing?: string) {
    const onDone = jest.fn();
    render(
      <ContratoStep onDone={onDone} applicationCode="APP-77" landing={landing} />,
    );
    await waitFor(() => expect(screen.getByTestId('contrato-documento')).toBeInTheDocument());
    return onDone;
  }

  it('marcar una autorización la emite con su id', async () => {
    const user = userEvent.setup();
    await montar('family-farms-baldecash-b');

    await user.click(screen.getByText(LIQUIDACION));

    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_contract_authorization_accepted',
      expect.objectContaining({
        autorizacion: 'fondo-liquidacion',
        application_code: 'APP-77',
      }),
    );
  });

  it('desmarcarla no emite nada', async () => {
    const user = userEvent.setup();
    await montar('family-farms-baldecash-b');

    await user.click(screen.getByText(LIQUIDACION));
    await user.click(screen.getByText(LIQUIDACION));

    const emitidos = mockTrack.mock.calls.filter(
      ([tipo]) => tipo === 'kyc_contract_authorization_accepted',
    );
    expect(emitidos).toHaveLength(1);
  });

  it('continuar emite la firma con las autorizaciones dadas', async () => {
    const user = userEvent.setup();
    const onDone = await montar('family-farms-baldecash-a');

    await user.click(screen.getByText('He leído y acepto el contrato'));
    await user.click(screen.getByText(PLANILLA));
    await user.click(screen.getByText(LIQUIDACION));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_contract_signed',
      expect.objectContaining({
        application_code: 'APP-77',
        autorizaciones: ['descuento-planilla', 'fondo-liquidacion'],
      }),
    );
    // La firma es un evento MÁS, no un reemplazo: el avance sigue su curso.
    expect(onDone).toHaveBeenCalled();
  });

  it('fuera del convenio la firma sale con la lista vacía', async () => {
    const user = userEvent.setup();
    await montar();

    await user.click(screen.getByText('He leído y acepto el contrato'));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(mockTrack).toHaveBeenCalledWith(
      'kyc_contract_signed',
      expect.objectContaining({ autorizaciones: [] }),
    );
  });

  it('la firma no pisa a kyc_contract_accepted', async () => {
    const user = userEvent.setup();
    await montar('family-farms-baldecash-b');

    await user.click(screen.getByText('He leído y acepto el contrato'));
    await user.click(screen.getByText(LIQUIDACION));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    const tipos = mockTrack.mock.calls.map(([tipo]) => tipo);
    expect(tipos).toEqual(expect.arrayContaining([
      'kyc_contract_view',
      'kyc_contract_accepted',
      'kyc_contract_authorization_accepted',
      'kyc_contract_signed',
    ]));
  });
});
