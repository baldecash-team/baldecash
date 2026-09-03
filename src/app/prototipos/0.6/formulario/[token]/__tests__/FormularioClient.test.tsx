/// <reference types="jest" />
/**
 * FormularioClient — ruta `/formulario/[token]`.
 *
 * Cubre: render de los módulos tal como vienen en `modulos`, enlace vencido
 * (410), enlace inválido, red, envío bloqueado con módulos pendientes, envío
 * ok → confirmación, y "ya enviado" al abrir.
 *
 * `jest.spyOn` sobre imports de módulo NO funciona en este repo (Next 16/SWC
 * compila los exports como propiedades no configurables), así que se mockea el
 * módulo completo — mismo patrón que `EntregaClient.test.tsx`.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/services/formularioApi', () => {
  const real = jest.requireActual('@/app/prototipos/0.6/services/formularioApi');
  return {
    ...real,
    getFormulario: jest.fn(),
    subirArchivo: jest.fn(),
    cumplirConTexto: jest.fn(),
    borrarArchivo: jest.fn(),
    enviarFormulario: jest.fn(),
  };
});

import {
  enviarFormulario,
  getFormulario,
  subirArchivo,
  type Modulo,
  type Pantalla,
} from '@/app/prototipos/0.6/services/formularioApi';
import { FormularioClient, agrupar, fechaIso, moduloListo } from '../FormularioClient';

const mockGet = getFormulario as jest.Mock;
const mockSubir = subirArchivo as jest.Mock;
const mockEnviar = enviarFormulario as jest.Mock;

const modulo = (code: Modulo['code'], extra: Partial<Modulo> = {}): Modulo => ({
  code, status: 'pending', fulfilled_by: null, is_required: true, min_files: 1,
  files_count: 0, attempt_count: 0, max_attempts: 3, last_rejected_at: null,
  verified_at: null, rejection_message: null,
  document_type: { code, name: code, accepted_formats: ['jpg', 'png', 'pdf'], max_file_size_mb: 5, max_files: 1 },
  documents: [],
  ...extra,
});

const pantalla = (over: Partial<Pantalla> = {}): Pantalla => ({
  status: 'opened', situation: 'payslip', campaign: null, requires_utility_bill: true,
  numero_solicitud: 'SOL-121201', nombre: 'Ana', telefono: '999888777',
  direccion: 'Av. Siempre Viva 742', direccion_tiene_numero: true,
  resumen: {
    items: [{ nombre: 'Laptop Lenovo', spec: '8 GB RAM', cuota: 189, imagen: null, es_principal: true }],
    cuota: 189, plazo: 12, monto: 2100, frecuencia: 'mensual', primer_pago: '25 de octubre',
    seguro: false, garantia: false,
  },
  modulos: [modulo('utility_bill'), modulo('payslip')],
  contacto: { contact_date: null, contact_slot: null, contact_time: null, contact_at: null, contact_channel: null, contact_phone: null, phone_changed: false },
  respuesta: { corrected_address: null, income_description: null, questions: null },
  submitted_at: null,
  ...over,
});

beforeEach(() => {
  mockGet.mockReset();
  mockSubir.mockReset();
  mockEnviar.mockReset();
  // 10:00 de la mañana: "hoy" tiene bloques disponibles y la hora exacta no
  // depende de a qué hora corra la suite.
  jest.useFakeTimers({ now: new Date(2026, 8, 4, 10, 0, 0), advanceTimers: true });
});
afterEach(() => { jest.useRealTimers(); });

describe('helpers', () => {
  it('fechaIso usa la fecha local y no corre el día', () => {
    expect(fechaIso(new Date(2026, 8, 4, 23, 30))).toBe('2026-09-04');
  });

  it('agrupa los tres recibos por honorarios en una sección', () => {
    const s = agrupar([modulo('utility_bill'), modulo('fee_receipt_1'), modulo('fee_receipt_2'), modulo('fee_receipt_3')]);
    expect(s.map((x) => x.key)).toEqual(['utility_bill', 'fee_receipts']);
    expect(s[1].modulos).toHaveLength(3);
  });

  it('un módulo rechazado al tope de intentos no traba el envío', () => {
    expect(moduloListo(modulo('payslip', { status: 'rejected', attempt_count: 1 }))).toBe(false);
    expect(moduloListo(modulo('payslip', { status: 'rejected', attempt_count: 3 }))).toBe(true);
    expect(moduloListo(modulo('payslip', { status: 'uploaded' }))).toBe(true);
  });
});

describe('FormularioClient', () => {
  it('dibuja el resumen y los módulos tal como vienen', async () => {
    mockGet.mockResolvedValue(pantalla());
    render(<FormularioClient token="tok" />);

    expect(await screen.findByText(/Laptop Lenovo/)).toBeInTheDocument();
    expect(screen.getByText('Recibo de servicios')).toBeInTheDocument();
    expect(screen.getByText('Tu boleta de pago')).toBeInTheDocument();
    expect(screen.queryByText(/reporte tributario/i)).not.toBeInTheDocument();
    // el FE no decide: sin `income_detail` no hay nota de voz
    expect(screen.queryByLabelText('Grabar')).not.toBeInTheDocument();
  });

  it('enlace vencido → pantalla de vencido', async () => {
    mockGet.mockResolvedValue({ reason: 'expired', error: 'Este enlace expiró.' });
    render(<FormularioClient token="tok" />);
    expect(await screen.findByText('Este enlace venció')).toBeInTheDocument();
  });

  it('enlace inválido o de otro flujo → mismo copy', async () => {
    mockGet.mockResolvedValue({ reason: 'purpose_mismatch', error: 'x' });
    render(<FormularioClient token="tok" />);
    expect(await screen.findByText('Este enlace no es válido')).toBeInTheDocument();
  });

  it('sin red → reintentar', async () => {
    mockGet.mockResolvedValueOnce({ reason: 'network', error: 'x' }).mockResolvedValueOnce(pantalla());
    render(<FormularioClient token="tok" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText(/Laptop Lenovo/)).toBeInTheDocument();
  });

  it('no deja enviar con módulos pendientes', async () => {
    mockGet.mockResolvedValue(pantalla());
    render(<FormularioClient token="tok" />);
    await screen.findByText(/Laptop Lenovo/);

    await userEvent.click(screen.getByRole('button', { name: /^Hoy/ }));
    await userEvent.click(screen.getByRole('button', { name: /Tarde/ }));
    await userEvent.click(screen.getByRole('button', { name: 'WhatsApp' }));

    expect(screen.getByRole('button', { name: /^Enviar$/ })).toBeDisabled();
    expect(mockEnviar).not.toHaveBeenCalled();
  });

  it('con todo completo envía el contrato y muestra la confirmación', async () => {
    mockGet.mockResolvedValue(pantalla({
      modulos: [
        modulo('utility_bill', { status: 'uploaded', files_count: 1, attempt_count: 1 }),
        modulo('payslip', { status: 'verified', files_count: 1, attempt_count: 1 }),
      ],
    }));
    mockEnviar.mockResolvedValue({ ok: true, contacto: { dia: 'mañana', horario: 'en la tarde (3 a 6pm)', canal: 'whatsapp', telefono: '999 888 777' } });
    render(<FormularioClient token="tok" />);
    await screen.findByText(/Laptop Lenovo/);

    await userEvent.click(screen.getByRole('button', { name: /^Hoy/ }));
    await userEvent.click(screen.getByRole('button', { name: /Tarde/ }));
    await userEvent.click(screen.getByRole('button', { name: 'WhatsApp' }));
    await userEvent.type(screen.getByLabelText('Dudas'), 'quiero cambiar el color');

    const btn = screen.getByRole('button', { name: /^Enviar$/ });
    await waitFor(() => expect(btn).toBeEnabled());
    await userEvent.click(btn);

    await waitFor(() => expect(mockEnviar).toHaveBeenCalledTimes(1));
    expect(mockEnviar.mock.calls[0][1]).toEqual({
      contact_date: '2026-09-04', contact_slot: '15_18', contact_channel: 'whatsapp',
      contact_phone: '999888777', questions: 'quiero cambiar el color',
    });
    expect(await screen.findByText(/Ya recibimos tu información/)).toBeInTheDocument();
    expect(screen.getByText(/escribirá por WhatsApp mañana en la tarde/)).toBeInTheDocument();
  });

  it('dirección sin número bloquea el envío hasta corregirla', async () => {
    mockGet.mockResolvedValue(pantalla({
      direccion: 'Av. Siempre Viva', direccion_tiene_numero: false,
      modulos: [modulo('utility_bill', { status: 'uploaded', files_count: 1 })],
    }));
    render(<FormularioClient token="tok" />);
    await screen.findByText(/Laptop Lenovo/);
    expect(screen.getByText('Coloca más detalle en tu dirección')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^Hoy/ }));
    await userEvent.click(screen.getByRole('button', { name: /Tarde/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Llamada' }));
    expect(screen.getByRole('button', { name: /^Enviar$/ })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: /Completar mi dirección/ }));
    await userEvent.type(screen.getByLabelText('Nueva dirección'), 'Av. Siempre Viva 742, Dpto 301');
    await userEvent.click(screen.getByRole('button', { name: /Confirmar dirección/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /^Enviar$/ })).toBeEnabled());

    mockEnviar.mockResolvedValue({ ok: true, contacto: { dia: 'mañana', horario: 'en la tarde (3 a 6pm)', canal: 'call', telefono: '999 888 777' } });
    await userEvent.click(screen.getByRole('button', { name: /^Enviar$/ }));
    await waitFor(() => expect(mockEnviar).toHaveBeenCalled());
    expect(mockEnviar.mock.calls[0][1].corrected_address).toBe('Av. Siempre Viva 742, Dpto 301');
  });

  it('subir un archivo reemplaza el módulo con lo que devuelve el API', async () => {
    mockGet.mockResolvedValue(pantalla({ modulos: [modulo('payslip')] }));
    mockSubir.mockResolvedValue(modulo('payslip', {
      status: 'uploaded', files_count: 1, attempt_count: 1,
      documents: [{ id: 9, file_name: 'boleta.jpg', mime_type: 'image/jpeg', uploaded_at: null, view_url: null }],
    }));
    render(<FormularioClient token="tok" />);
    await screen.findByText(/Laptop Lenovo/);

    const input = screen.getByTestId('input-payslip') as HTMLInputElement;
    await userEvent.upload(input, new File(['x'], 'boleta.jpg', { type: 'image/jpeg' }));

    await waitFor(() => expect(mockSubir).toHaveBeenCalledWith('tok', 'payslip', expect.any(File), 'document'));
    // Al completarse, la sección se colapsa a "Listo".
    expect(await screen.findByText('Listo')).toBeInTheDocument();
  });

  it('módulo rechazado muestra el motivo y el intento', async () => {
    mockGet.mockResolvedValue(pantalla({
      modulos: [modulo('utility_bill', { status: 'rejected', attempt_count: 1, rejection_message: 'El recibo no es de los últimos 2 meses' })],
    }));
    render(<FormularioClient token="tok" />);
    expect(await screen.findByText('El recibo no es de los últimos 2 meses')).toBeInTheDocument();
    expect(screen.getByText(/Intento 1 de 3/)).toBeInTheDocument();
  });

  it('ya enviado al abrir → confirmación directa', async () => {
    mockGet.mockResolvedValue(pantalla({
      status: 'submitted', submitted_at: '2026-09-03T12:00:00',
      contacto: { contact_date: '2026-09-05', contact_slot: '09_12', contact_time: null, contact_at: null, contact_channel: 'call', contact_phone: '988777666', phone_changed: true },
    }));
    render(<FormularioClient token="tok" />);
    expect(await screen.findByText(/Ya recibimos tu información/)).toBeInTheDocument();
    expect(screen.getByText(/llamará el sábado 5 en la mañana/)).toBeInTheDocument();
    expect(screen.getByText('988 777 666')).toBeInTheDocument();
  });
});
