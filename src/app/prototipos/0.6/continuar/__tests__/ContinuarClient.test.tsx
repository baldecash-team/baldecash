/**
 * «Sí» de la variante firma: con `link_firma` válido en la respuesta del POST
 * se va directo a firmar; sin link, queda el texto + «Tu respuesta quedó
 * registrada» y el WhatsApp de atención.
 */
import { render, screen, waitFor } from '@testing-library/react';
import { ContinuarClient } from '../ContinuarClient';
import * as api from '@/app/prototipos/0.6/services/continuarApi';

jest.mock('@/app/prototipos/0.6/services/continuarApi', () => {
  const real = jest.requireActual('@/app/prototipos/0.6/services/continuarApi');
  return { ...real, decidirContinuar: jest.fn(), datosContinuar: jest.fn() };
});

const decidir = api.decidirContinuar as jest.Mock;
const datos = api.datosContinuar as jest.Mock;
const KEYNUA = 'https://sign.keynua.com/index.html?token=tok-titular';

const replace = jest.fn();
const locationOriginal = window.location;

beforeAll(() => {
  // jsdom no deja espiar `location.replace`: se reemplaza el objeto entero.
  // @ts-expect-error — se borra para poder redefinirlo en el test
  delete window.location;
  // @ts-expect-error — objeto mínimo con lo que usa el componente
  window.location = { replace };
});

afterAll(() => {
  // @ts-expect-error — se restaura el original
  window.location = locationOriginal;
});

beforeEach(() => {
  replace.mockReset();
  decidir.mockReset();
  datos.mockReset();
  datos.mockResolvedValue({ nombre: 'Vania', equipo: 'Laptop Lenovo', variante: 'firma', estado: 'respondida' });
});

it('con link de Keynua en la respuesta va directo a firmar', async () => {
  decidir.mockResolvedValue({ status: 'received', respuesta: 'si', link_firma: KEYNUA });
  render(<ContinuarClient token="tok" acepta={true} />);
  await waitFor(() => expect(replace).toHaveBeenCalledWith(KEYNUA));
  expect(screen.getByTestId('continuar-redirect')).toBeInTheDocument();
  expect(datos).not.toHaveBeenCalled();
});

it('con link del KYC propio también redirige', async () => {
  const kyc = 'https://baldecash.com/kyc/Abc123_-xyzXYZ0987654321abcdefghij';
  decidir.mockResolvedValue({ status: 'received', respuesta: 'si', link_firma: kyc });
  render(<ContinuarClient token="tok" acepta={true} />);
  await waitFor(() => expect(replace).toHaveBeenCalledWith(kyc));
});

it('sin link muestra el texto, «Tu respuesta quedó registrada» y el WhatsApp', async () => {
  decidir.mockResolvedValue({ status: 'received', respuesta: 'si', link_firma: null });
  render(<ContinuarClient token="tok" acepta={true} />);
  await screen.findByTestId('continuar-si-firma');
  expect(screen.getByText('Firma tu contrato para separar tu Laptop Lenovo.')).toBeInTheDocument();
  expect(screen.getByText('Tu respuesta quedó registrada.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
    'href',
    expect.stringContaining('51959324808'),
  );
  expect(replace).not.toHaveBeenCalled();
});

it('un link fuera de dominio no redirige', async () => {
  decidir.mockResolvedValue({
    status: 'received',
    respuesta: 'si',
    link_firma: 'https://evil.com/index.html?token=x',
  });
  render(<ContinuarClient token="tok" acepta={true} />);
  await screen.findByTestId('continuar-si-firma');
  expect(replace).not.toHaveBeenCalled();
});

it('la variante evaluación no cambia', async () => {
  decidir.mockResolvedValue({ status: 'received', respuesta: 'si' });
  datos.mockResolvedValue({ nombre: 'Vania', variante: 'evaluacion', estado: 'respondida' });
  render(<ContinuarClient token="tok" acepta={true} />);
  await screen.findByTestId('continuar-si-evaluacion');
  expect(replace).not.toHaveBeenCalled();
});
