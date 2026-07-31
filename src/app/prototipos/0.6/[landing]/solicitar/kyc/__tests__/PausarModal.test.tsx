import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PausarModal } from '../PausarModal';
import { pauseKyc } from '@/app/prototipos/0.6/services/kycApi';

// jest.spyOn sobre el namespace de kycApi.ts NO funciona en este repo: Next 16 +
// SWC compila los named exports como propiedades no configurables al transpilar
// ESM→CJS, y jest.spyOn necesita Object.defineProperty para redefinirlas
// (TypeError: Cannot redefine property). Mismo ajuste ya documentado en el
// reporte de la Task 3: mock de módulo completo con jest.requireActual + spread
// para no perder el resto de exports.
jest.mock('@/app/prototipos/0.6/services/kycApi', () => {
  const actual = jest.requireActual('@/app/prototipos/0.6/services/kycApi');
  return { ...actual, pauseKyc: jest.fn() };
});

// Mismo motivo: mock de módulo completo del tracker (no spyOn) para poder
// aserta qué eventos se emiten sin depender de un EventTrackerProvider real.
const mockTrack = jest.fn();
jest.mock('../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack }),
}));

const mockPauseKyc = pauseKyc as jest.MockedFunction<typeof pauseKyc>;

const props = {
  open: true, onClose: jest.fn(), onSent: jest.fn(),
  applicationCode: 'APP-1', documentNumber: '48509924', landing: 'copia-home',
};

afterEach(() => jest.clearAllMocks());

it('muestra el telefono enmascarado tras enviar', async () => {
  mockPauseKyc.mockResolvedValue({
    masked_phone: '***-***-777', expires_at: '2026-08-03T00:00:00', ttl_hours: 72,
  });

  render(<PausarModal {...props} />);
  await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

  await waitFor(() => expect(screen.getByText(/\*\*\*-\*\*\*-777/)).toBeInTheDocument());
  // El plazo viene del backend (ttl_hours), nunca hardcodeado.
  expect(screen.getByText(/72 horas/)).toBeInTheDocument();
});

it('muestra un mensaje accionable si el envio falla', async () => {
  mockPauseKyc.mockResolvedValue({
    reason: 'send_failed', error: 'No pudimos enviarte el enlace. Intenta nuevamente.',
  });

  render(<PausarModal {...props} />);
  await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

  await waitFor(() => expect(screen.getByText(/no pudimos enviarte el enlace/i)).toBeInTheDocument());
});

it('ante rate limit invita a revisar WhatsApp en vez de reintentar', async () => {
  mockPauseKyc.mockResolvedValue({
    reason: 'rate_limited', error: 'Demasiados enlaces generados.',
  });

  render(<PausarModal {...props} />);
  await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

  await waitFor(() => expect(screen.getByText(/revisa tu whatsapp/i)).toBeInTheDocument());
  // Sin reintento: reintentar solo generaría más rate-limit.
  expect(screen.queryByRole('button', { name: /intentar de nuevo/i })).not.toBeInTheDocument();
});

// Fix round 1 — reviewer: `canRetry` solo excluía `rate_limited`. Para
// `ownership_check_failed`/`no_phone`/`ownership_locked` el estado que causó
// el fallo no cambia por reintentar, y en `ownership_check_failed` el propio
// copy ("vuelve a intentarlo desde el inicio") contradecía el botón
// "Intentar de nuevo" que quedaba debajo. Fix: allowlist explícita de reasons
// transitorios (`send_failed`, `network`) en vez de un denylist de uno solo.
it('ownership_check_failed no ofrece reintentar (el copy manda a reiniciar el flujo, no a reintentar)', async () => {
  mockPauseKyc.mockResolvedValue({
    reason: 'ownership_check_failed', error: 'No coincide con nuestros registros.',
  });

  render(<PausarModal {...props} />);
  await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

  await waitFor(() => expect(screen.getByText(/vuelve a intentarlo desde el inicio/i)).toBeInTheDocument());
  expect(screen.queryByRole('button', { name: /intentar de nuevo/i })).not.toBeInTheDocument();
  // La única acción disponible debe ser cerrar — coherente con el copy.
  expect(screen.getByRole('button', { name: /entendido/i })).toBeInTheDocument();
});

it('send_failed sí ofrece reintentar (falla transitoria de envío)', async () => {
  mockPauseKyc.mockResolvedValue({
    reason: 'send_failed', error: 'No pudimos enviarte el enlace. Intenta nuevamente.',
  });

  render(<PausarModal {...props} />);
  await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

  await waitFor(() => expect(screen.getByText(/no pudimos enviarte el enlace/i)).toBeInTheDocument());
  expect(screen.getByRole('button', { name: /intentar de nuevo/i })).toBeInTheDocument();
});

it('otro reason con reintento habilitado permite volver a enviar', async () => {
  mockPauseKyc.mockResolvedValueOnce({ reason: 'network', error: 'Error de conexión.' });
  mockPauseKyc.mockResolvedValueOnce({
    masked_phone: '***-***-321', expires_at: '2026-08-03T00:00:00', ttl_hours: 48,
  });

  render(<PausarModal {...props} />);
  await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
  await waitFor(() => expect(screen.getByText(/error de conexión/i)).toBeInTheDocument());

  await userEvent.click(screen.getByRole('button', { name: /intentar de nuevo/i }));
  await waitFor(() => expect(screen.getByText(/\*\*\*-\*\*\*-321/)).toBeInTheDocument());
  expect(screen.getByText(/48 horas/)).toBeInTheDocument();
});

it('emite kyc_pause_requested y kyc_resume_link_sent, ambos con application_code', async () => {
  mockPauseKyc.mockResolvedValue({
    masked_phone: '***-***-777', expires_at: '2026-08-03T00:00:00', ttl_hours: 72,
  });

  render(<PausarModal {...props} />);
  await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
  await waitFor(() => expect(screen.getByText(/\*\*\*-\*\*\*-777/)).toBeInTheDocument());

  expect(mockTrack).toHaveBeenCalledWith(
    'kyc_pause_requested',
    expect.objectContaining({ application_code: 'APP-1' }),
  );
  expect(mockTrack).toHaveBeenCalledWith(
    'kyc_resume_link_sent',
    expect.objectContaining({ application_code: 'APP-1' }),
  );
  expect(mockPauseKyc).toHaveBeenCalledWith({ applicationCode: 'APP-1', documentNumber: '48509924' });
  expect(props.onSent).toHaveBeenCalled();
});

it('emite kyc_resume_link_send_error con application_code y reason ante fallo', async () => {
  mockPauseKyc.mockResolvedValue({ reason: 'no_phone', error: 'Sin celular.' });

  render(<PausarModal {...props} />);
  await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
  await waitFor(() => expect(screen.getByText(/no tiene un celular registrado/i)).toBeInTheDocument());

  expect(mockTrack).toHaveBeenCalledWith(
    'kyc_resume_link_send_error',
    expect.objectContaining({ application_code: 'APP-1', reason: 'no_phone' }),
  );
});
