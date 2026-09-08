/// <reference types="jest" />
/**
 * La espera del contrato: el PDF se emite en legacy y tarda unos segundos.
 *
 * Lo que se protege: que la espera termine (tope), que el reintento vuelva a
 * pedir, y que cada transición deje su evento — sin eso no hay forma de saber
 * cuánto espera la gente ni cuántas veces falla.
 */
import { renderHook, act, waitFor } from '@testing-library/react';

jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, getContrato: jest.fn() };
});

import { getContrato } from '@/app/prototipos/0.6/services/kycApi';
import { useContratoKyc, TOPE_MS } from '../useContratoKyc';

const mockGet = getContrato as jest.MockedFunction<typeof getContrato>;

const listo = {
  modo: 'aceptacion' as const, estado: 'listo' as const, disponible: true,
  url: 'https://s3/c.pdf', hash: 'a'.repeat(64), external_id: 'kyc-1',
};
const generando = { modo: 'aceptacion' as const, estado: 'generando' as const, disponible: false };

function montar(track = jest.fn(), applicationCode: string | undefined = 'APP-1') {
  return renderHook(() =>
    useContratoKyc({ applicationCode, documentNumber: '70020010', track }),
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});
afterEach(() => jest.useRealTimers());

it('cuando ya está listo lo entrega y avisa', async () => {
  const track = jest.fn();
  mockGet.mockResolvedValue(listo);

  const { result } = montar(track);

  await waitFor(() => expect(result.current.estado).toBe('listo'));
  expect(result.current.hayDocumento).toBe(true);
  expect(result.current.exigeAceptar).toBe(true);
  expect(track).toHaveBeenCalledWith('kyc_contract_ready', expect.objectContaining({ external_id: 'kyc-1' }));
});

it('reintenta mientras se está generando y entrega cuando llega', async () => {
  mockGet.mockResolvedValueOnce(generando).mockResolvedValue(listo);

  const { result } = montar();

  await waitFor(() => expect(result.current.estado).toBe('generando'));
  await act(async () => { jest.advanceTimersByTime(3000); });
  await waitFor(() => expect(result.current.estado).toBe('listo'));
  expect(mockGet).toHaveBeenCalledTimes(2);
});

it('se rinde en el tope y deja el evento', async () => {
  const track = jest.fn();
  mockGet.mockResolvedValue(generando);

  const { result } = montar(track);

  await act(async () => { jest.advanceTimersByTime(TOPE_MS + 3000); });

  await waitFor(() => expect(result.current.estado).toBe('error'));
  expect(track).toHaveBeenCalledWith('kyc_contract_generation_failed',
    expect.objectContaining({ reason: 'timeout' }));
});

it('un error del backend corta la espera', async () => {
  const track = jest.fn();
  mockGet.mockResolvedValue({ modo: 'aceptacion', estado: 'error', disponible: false });

  const { result } = montar(track);

  await waitFor(() => expect(result.current.estado).toBe('error'));
  expect(track).toHaveBeenCalledWith('kyc_contract_generation_failed',
    expect.objectContaining({ reason: 'legacy_error' }));
});

it('sin registro en legacy no se reintenta: es otro motivo', async () => {
  const track = jest.fn();
  mockGet.mockResolvedValue({
    modo: 'aceptacion', estado: 'error', motivo: 'sin_registro', disponible: false,
  });

  const { result } = montar(track);

  await waitFor(() => expect(result.current.estado).toBe('error'));
  expect(result.current.sinRegistro).toBe(true);
  expect(track).toHaveBeenCalledWith('kyc_contract_generation_failed',
    expect.objectContaining({ reason: 'sin_registro' }));
});

it('reintentar vuelve a pedir, forzando', async () => {
  const track = jest.fn();
  mockGet.mockResolvedValue({ modo: 'aceptacion', estado: 'error', disponible: false });
  const { result } = montar(track);
  await waitFor(() => expect(result.current.estado).toBe('error'));

  mockGet.mockResolvedValue(listo);
  await act(async () => { result.current.reintentar(); });

  await waitFor(() => expect(result.current.estado).toBe('listo'));
  expect(mockGet).toHaveBeenLastCalledWith(expect.objectContaining({ reintentar: true }));
  expect(track).toHaveBeenCalledWith('kyc_contract_generation_requested',
    expect.objectContaining({ reason: 'retry' }));
});

it('marcarVencido avisa y vuelve a pedir', async () => {
  const track = jest.fn();
  mockGet.mockResolvedValue(listo);
  const { result } = montar(track);
  await waitFor(() => expect(result.current.estado).toBe('listo'));

  mockGet.mockResolvedValue(generando);
  await act(async () => { result.current.marcarVencido(); });

  expect(track).toHaveBeenCalledWith('kyc_contract_outdated', expect.anything());
  await waitFor(() => expect(result.current.estado).toBe('outdated'));
});

it('con modo emitido no exige aceptar', async () => {
  mockGet.mockResolvedValue({ modo: 'emitido', estado: 'generando', disponible: false });

  const { result } = montar();

  await waitFor(() => expect(result.current.exigeAceptar).toBe(false));
});

it('sin applicationCode no pide nada', async () => {
  // Se mide el delta y no el total: un polling pendiente del test anterior
  // puede disparar entre medio, y lo que se afirma acá es que ESTE montaje no
  // pide nada. Y se monta inline —sin `montar`— porque pasarle `undefined` a
  // un parámetro con default activa justamente el default.
  const antes = mockGet.mock.calls.length;

  renderHook(() => useContratoKyc({ documentNumber: '70020010', track: jest.fn() }));

  expect(mockGet.mock.calls.length).toBe(antes);
});
