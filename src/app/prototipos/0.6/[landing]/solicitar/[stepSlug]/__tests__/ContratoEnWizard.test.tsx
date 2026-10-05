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
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, getKycProgress: jest.fn(), completarKyc: jest.fn() };
});

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/utils/envioAnticipadoHandoff', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/[landing]/solicitar/utils/envioAnticipadoHandoff');
  return {
    ...actual,
    markEnvioAnticipadoContratoAceptado: jest.fn(),
    clearEnvioAnticipadoContratoAceptado: jest.fn(),
  };
});

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({ entregaEnElCierre: false }),
}));

jest.mock('../../kyc/constanciaStorage', () => ({ guardarConstancia: jest.fn() }));

// El titulo viaja al espia porque hay DOS overlays en esta pantalla: el velo
// mientras no se sabe si hay contrato, y el de la firma. Distinguirlos por
// `isOpen` solo ya no alcanza.
const overlayAbierto = jest.fn();
jest.mock('../../components/solicitar/submit/SubmitOverlay', () => ({
  SubmitOverlay: ({ isOpen, titulo }: { isOpen: boolean; titulo?: string }) => {
    overlayAbierto(isOpen, titulo);
    return null;
  },
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('../../kyc/steps/ContratoStep', () => ({
  ContratoStep: ({ onDone, onBack, yaAceptado, onNoAplica, onResuelto }: {
    onDone: (d?: { contractHash?: string; externalId?: string }) => void;
    onBack?: () => void;
    yaAceptado?: boolean;
    onNoAplica?: () => void;
    onResuelto?: () => void;
  }) => (
    <div data-testid="contrato-step" data-ya-aceptado={String(Boolean(yaAceptado))} data-has-on-back={String(Boolean(onBack))}>
      <button type="button" onClick={() => onDone({ contractHash: 'hash-1', externalId: 'ext-1' })}>
        Firmar electrónicamente
      </button>
      <button type="button" onClick={() => onNoAplica?.()}>Contrato no aplica</button>
      <button type="button" onClick={() => onResuelto?.()}>Contrato resuelto</button>
    </div>
  ),
}));

/**
 * Se capturan los dos callbacks (no solo `onAceptado`, como antes) para poder
 * simular desde el test el 409 EN EL ACCEPT (`onVencido`) sin tocar el otro
 * camino de vencido, que es el de `cerrar()` vía `completarKyc` — ver los
 * tests de "contrato vencido tras aceptar" más abajo.
 */
let capturedOnVencido: (() => void) | undefined;
const mockAceptar = jest.fn();
jest.mock('../../kyc/useAceptarContrato', () => ({
  useAceptarContrato: ({ onAceptado, onVencido }: {
    onAceptado: (s: unknown) => void;
    onVencido?: () => void;
  }) => {
    capturedOnVencido = onVencido;
    mockAceptar.mockImplementation(() => onAceptado(null));
    return { contratoRef: { current: null }, aceptar: mockAceptar };
  },
}));

import { ContratoEnWizard } from '../ContratoEnWizard';
import { getKycProgress, completarKyc } from '@/app/prototipos/0.6/services/kycApi';
import {
  markEnvioAnticipadoContratoAceptado,
  clearEnvioAnticipadoContratoAceptado,
} from '@/app/prototipos/0.6/[landing]/solicitar/utils/envioAnticipadoHandoff';
import type { EnvioAnticipadoHandoff } from '../../utils/envioAnticipadoHandoff';

const mockGetKycProgress = getKycProgress as jest.MockedFunction<typeof getKycProgress>;
const mockCompletarKyc = completarKyc as jest.MockedFunction<typeof completarKyc>;
const mockMarcar = markEnvioAnticipadoContratoAceptado as jest.MockedFunction<
  typeof markEnvioAnticipadoContratoAceptado
>;
const mockClear = clearEnvioAnticipadoContratoAceptado as jest.MockedFunction<
  typeof clearEnvioAnticipadoContratoAceptado
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

// IMPORTANT 1 de la ronda de revisión 1: la marca "firmó" se prende
// OPTIMISTAMENTE (`onAceptado`, antes de llamar a `cerrar`), y hay DOS
// momentos en los que legacy puede decir después que ese contrato ya no vale.
// Sin limpiarla en los dos, quedaría un `true` viejo que encierra a quien
// tiene que volver a aceptar (las gates de `StepClient` la leen para
// bloquear Atrás/indicador/redirect).
describe('contrato vencido tras aceptar (409): la marca se limpia en los dos caminos', () => {
  it('vencido EN EL ACCEPT (useAceptarContrato.onVencido): limpia el handoff y avisa a StepClient', async () => {
    const onContratoVencido = jest.fn();
    mockGetKycProgress.mockResolvedValue(null);

    render(
      <ContratoEnWizard
        landing="renueva-tu-equipo-1-a"
        handoff={{ ...handoff, contratoAceptado: true }}
        stepSlug="resumen"
        onContratoVencido={onContratoVencido}
      />,
    );

    // Ya venía "aceptado" (yaAceptado=true desde el handoff) y el usuario le
    // da Continuar; se simula que ESE intento vuelve outdated.
    expect(screen.getByTestId('contrato-step').dataset.yaAceptado).toBe('true');
    act(() => capturedOnVencido?.());

    expect(mockClear).toHaveBeenCalledWith('renueva-tu-equipo-1-a');
    expect(onContratoVencido).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByTestId('contrato-step').dataset.yaAceptado).toBe('false'));
    // No se marcó como aceptado por este camino (eso es cosa de `onAceptado`).
    expect(mockMarcar).not.toHaveBeenCalled();
  });

  it('vencido en /completar (cerrar → completarKyc → motivo contrato_vencido): limpia el handoff y avisa', async () => {
    const onContratoVencido = jest.fn();
    mockCompletarKyc.mockResolvedValue({ motivo: 'contrato_vencido' } as never);

    render(
      <ContratoEnWizard
        landing="renueva-tu-equipo-1-a"
        handoff={handoff}
        stepSlug="resumen"
        onContratoVencido={onContratoVencido}
      />,
    );

    // Acepta con éxito (mock de `aceptar` de siempre) → `onAceptado` marca
    // `true` y llama a `cerrar()`, que descubre el vencido en `/completar`.
    await userEvent.click(screen.getByRole('button', { name: 'Firmar electrónicamente' }));

    await waitFor(() => expect(mockCompletarKyc).toHaveBeenCalled());
    // Se marcó (optimista) Y se limpió (el /completar lo desmintió) — en ese
    // orden, y las dos llamadas pasaron.
    expect(mockMarcar).toHaveBeenCalledWith('renueva-tu-equipo-1-a');
    expect(mockClear).toHaveBeenCalledWith('renueva-tu-equipo-1-a');
    expect(onContratoVencido).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByTestId('contrato-step').dataset.yaAceptado).toBe('false'));
    // No navegó a ningún lado: el paso se reabre en la misma pantalla.
    expect(mockPush).not.toHaveBeenCalled();
  });
});

it('ya aceptado + "Continuar": va derecho a la confirmación sin el overlay de "Firmando" ni firmar de nuevo', async () => {
  mockCompletarKyc.mockResolvedValue({
    aprobado: true, tiene_cuota_inicial: false, link_pago: null, entrega_token: null,
  } as never);
  render(
    <ContratoEnWizard
      landing="renueva-tu-equipo-1-a"
      handoff={{ ...handoff, contratoAceptado: true }}
      stepSlug="resumen"
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Firmar electrónicamente' }));
  await waitFor(() => expect(mockReplace).toHaveBeenCalled());

  expect(mockAceptar).not.toHaveBeenCalled();
  expect(overlayAbierto).not.toHaveBeenCalledWith(true, 'Firmando tu solicitud');
  expect(mockPush).not.toHaveBeenCalled();
  expect(mockReplace.mock.calls[0][0] as string).toContain('/solicitar/confirmacion');
});

it('si /contrato dice no_aplica (rechazada), va a "solicitud recibida" sin firmar ni pasar por /completar', async () => {
  render(<ContratoEnWizard landing="renueva-tu-equipo-1-a" handoff={handoff} stepSlug="resumen" />);

  await userEvent.click(screen.getByRole('button', { name: 'Contrato no aplica' }));

  await waitFor(() => expect(mockReplace).toHaveBeenCalled());
  const url = mockReplace.mock.calls[0][0] as string;
  expect(url).toContain('/solicitar/confirmacion');
  expect(url).toContain('code=APP-1');
  expect(url).not.toContain('kyc=1');
  expect(mockCompletarKyc).not.toHaveBeenCalled();
  expect(mockAceptar).not.toHaveBeenCalled();
});

describe('el contrato no se pinta antes de saber si aplica', () => {
  // Una solicitud rechazada —en el submit por lista negra, o en el workflow por
  // financiamiento activo— llegaba igual a esta pantalla y mostraba medio
  // segundo el encabezado del contrato, los datos y los numeros antes de
  // rebotar a "solicitud recibida". Eso se leia como un financiamiento que se
  // cae a mitad de camino.

  it('mientras /contrato no contesta, el velo tapa la pantalla', () => {
    render(<ContratoEnWizard landing="renueva-tu-equipo-1-a" handoff={handoff} stepSlug="resumen" />);

    expect(overlayAbierto).toHaveBeenCalledWith(true, 'Revisando tu solicitud');
  });

  it('con la solicitud viva se destapa', async () => {
    render(<ContratoEnWizard landing="renueva-tu-equipo-1-a" handoff={handoff} stepSlug="resumen" />);

    await userEvent.click(screen.getByRole('button', { name: 'Contrato resuelto' }));

    await waitFor(() =>
      expect(overlayAbierto).toHaveBeenLastCalledWith(false, 'Revisando tu solicitud'));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('rechazada: navega con el velo puesto, sin destaparse nunca', async () => {
    render(<ContratoEnWizard landing="renueva-tu-equipo-1-a" handoff={handoff} stepSlug="resumen" />);

    await userEvent.click(screen.getByRole('button', { name: 'Contrato no aplica' }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    // El velo nunca se abrio: no hubo un frame con la pantalla del contrato.
    expect(overlayAbierto).not.toHaveBeenCalledWith(false, 'Revisando tu solicitud');
  });
});
