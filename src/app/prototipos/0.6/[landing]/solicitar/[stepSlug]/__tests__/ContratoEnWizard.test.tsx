/// <reference types="jest" />
/**
 * ContratoEnWizard — el contrato como pantalla del wizard.
 *
 * Cubre la fuente de verdad de "firmó" que usan las gates de navegación
 * (G1/G2, ver StepClient.test.tsx y ContratoStep.yaAceptado.test.tsx):
 * - `handoff.contratoAceptado` ya en true → `yaAceptado` sale así de una, sin
 *   pedirle nada a `/progress`.
 * - Sin la marca en el handoff, se corrobora contra `/progress`
 *   (`getKycProgress`) con el mismo criterio que el KYC por ruta dedicada
 *   (`contract.status === 'completed'`).
 * - Al aceptar con éxito, se marca el handoff (`markEnvioAnticipadoContratoAceptado`)
 *   y el "atrás" de la entrega apunta de vuelta a este mismo paso
 *   (`routes.solicitarStep(landing, stepSlug)`).
 *
 * `ContratoStep` se mockea a un stub que expone sus props relevantes por
 * `data-*` y un botón que dispara `onDone` — el comportamiento interno del
 * paso ya está cubierto en sus propios tests.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, getKycProgress: jest.fn(), completarKyc: jest.fn() };
});

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/utils/envioAnticipadoHandoff', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/[landing]/solicitar/utils/envioAnticipadoHandoff');
  return { ...actual, markEnvioAnticipadoContratoAceptado: jest.fn() };
});

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({ entregaEnElCierre: false }),
}));

jest.mock('../../kyc/constanciaStorage', () => ({ guardarConstancia: jest.fn() }));

jest.mock('../../components/solicitar/submit/SubmitOverlay', () => ({
  SubmitOverlay: () => null,
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../../kyc/steps/ContratoStep', () => ({
  ContratoStep: ({ onDone, onBack, yaAceptado }: {
    onDone: (d?: { contractHash?: string; externalId?: string }) => void;
    onBack?: () => void;
    yaAceptado?: boolean;
  }) => (
    <div data-testid="contrato-step" data-ya-aceptado={String(Boolean(yaAceptado))} data-has-on-back={String(Boolean(onBack))}>
      <button type="button" onClick={() => onDone({ contractHash: 'hash-1', externalId: 'ext-1' })}>
        Firmar electrónicamente
      </button>
    </div>
  ),
}));

const mockAceptar = jest.fn();
jest.mock('../../kyc/useAceptarContrato', () => ({
  useAceptarContrato: ({ onAceptado }: { onAceptado: (s: unknown) => void }) => {
    mockAceptar.mockImplementation(() => onAceptado(null));
    return { contratoRef: { current: null }, aceptar: mockAceptar };
  },
}));

import { ContratoEnWizard } from '../ContratoEnWizard';
import { getKycProgress, completarKyc } from '@/app/prototipos/0.6/services/kycApi';
import { markEnvioAnticipadoContratoAceptado } from '@/app/prototipos/0.6/[landing]/solicitar/utils/envioAnticipadoHandoff';
import type { EnvioAnticipadoHandoff } from '../../utils/envioAnticipadoHandoff';

const mockGetKycProgress = getKycProgress as jest.MockedFunction<typeof getKycProgress>;
const mockCompletarKyc = completarKyc as jest.MockedFunction<typeof completarKyc>;
const mockMarcar = markEnvioAnticipadoContratoAceptado as jest.MockedFunction<
  typeof markEnvioAnticipadoContratoAceptado
>;

const handoff: EnvioAnticipadoHandoff = {
  applicationCode: 'APP-1', resumeToken: 'tok', documentNumber: '12345678',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCompletarKyc.mockResolvedValue(null);
});

it('handoff.contratoAceptado en true: yaAceptado sale de una, sin preguntarle a /progress', async () => {
  render(
    <ContratoEnWizard
      landing="renueva-tu-equipo-1-a"
      handoff={{ ...handoff, contratoAceptado: true }}
      stepSlug="resumen"
    />,
  );

  expect(screen.getByTestId('contrato-step').dataset.yaAceptado).toBe('true');
  expect(mockGetKycProgress).not.toHaveBeenCalled();
});

it('sin la marca en el handoff: corrobora contra /progress (contract completed)', async () => {
  mockGetKycProgress.mockResolvedValue({
    application_code: 'APP-1', landing_slug: null,
    steps: [{ type: 'contract', status: 'completed', completed_at: '2026-09-17T00:00:00' }],
    next_step: null, next_step_index: null, is_complete: false,
    kyc_enabled: true, resume: { enabled: false, ttl_hours: 72 },
  } as never);

  render(<ContratoEnWizard landing="renueva-tu-equipo-1-a" handoff={handoff} stepSlug="resumen" />);

  expect(screen.getByTestId('contrato-step').dataset.yaAceptado).toBe('false');
  await waitFor(() => expect(screen.getByTestId('contrato-step').dataset.yaAceptado).toBe('true'));
  expect(mockGetKycProgress).toHaveBeenCalledWith('APP-1');
});

it('/progress sin el contrato completado: sigue sin aceptar', async () => {
  mockGetKycProgress.mockResolvedValue({
    application_code: 'APP-1', landing_slug: null,
    steps: [{ type: 'contract', status: 'pending', completed_at: null }],
    next_step: 'contract', next_step_index: 0, is_complete: false,
    kyc_enabled: true, resume: { enabled: false, ttl_hours: 72 },
  } as never);

  render(<ContratoEnWizard landing="renueva-tu-equipo-1-a" handoff={handoff} stepSlug="resumen" />);

  await waitFor(() => expect(mockGetKycProgress).toHaveBeenCalled());
  expect(screen.getByTestId('contrato-step').dataset.yaAceptado).toBe('false');
});

it('al firmar: marca el handoff y navega a la entrega con "atras" apuntando a este paso', async () => {
  mockCompletarKyc.mockResolvedValue({
    aprobado: true, tiene_cuota_inicial: false, link_pago: null,
    entrega_token: 'ENTREGA-TOK',
  } as never);
  mockGetKycProgress.mockResolvedValue(null);

  render(<ContratoEnWizard landing="renueva-tu-equipo-1-a" handoff={handoff} stepSlug="resumen" />);

  await userEvent.click(screen.getByRole('button', { name: 'Firmar electrónicamente' }));

  await waitFor(() => expect(mockPush).toHaveBeenCalled());
  expect(mockMarcar).toHaveBeenCalledWith('renueva-tu-equipo-1-a');

  const url = mockPush.mock.calls[0][0] as string;
  expect(url).toContain('/entrega/ENTREGA-TOK');
  expect(url).toContain('atras=');
  expect(decodeURIComponent(url)).toContain('/renueva-tu-equipo-1-a/solicitar/resumen');
});

it('sin entrega_token: navega derecho a la confirmación (sin "atras")', async () => {
  mockCompletarKyc.mockResolvedValue({
    aprobado: true, tiene_cuota_inicial: false, link_pago: null, entrega_token: null,
  } as never);

  render(<ContratoEnWizard landing="renueva-tu-equipo-1-a" handoff={handoff} stepSlug="resumen" />);

  await userEvent.click(screen.getByRole('button', { name: 'Firmar electrónicamente' }));

  await waitFor(() => expect(mockPush).toHaveBeenCalled());
  const url = mockPush.mock.calls[0][0] as string;
  expect(url).toContain('/solicitar/confirmacion');
  expect(url).not.toContain('/entrega/');
});
