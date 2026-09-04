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
import { act, render, screen, waitFor } from '@testing-library/react';
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
    renovarEnlace: jest.fn(),
    guardarParcial: jest.fn(),
  };
});

import {
  enviarFormulario,
  getFormulario,
  guardarParcial,
  renovarEnlace,
  subirArchivo,
  type Modulo,
  type Pantalla,
} from '@/app/prototipos/0.6/services/formularioApi';
import { FormularioClient, agrupar, fechaIso, moduloListo } from '../FormularioClient';

const mockGet = getFormulario as jest.Mock;
const mockSubir = subirArchivo as jest.Mock;
const mockRenovar = renovarEnlace as jest.Mock;
const mockEnviar = enviarFormulario as jest.Mock;
const mockGuardar = guardarParcial as jest.Mock;

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
  mockGuardar.mockReset();
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

  describe('enlace caído (410)', () => {
    const boton = () => screen.findByRole('button', { name: /Enviarme un enlace nuevo por WhatsApp/ });

    it('vencido → explica y ofrece pedir uno nuevo', async () => {
      mockGet.mockResolvedValue({ reason: 'expired', error: 'Este enlace expiró.' });
      render(<FormularioClient token="tok" />);
      expect(await screen.findByText('Este enlace venció')).toBeInTheDocument();
      expect(screen.getByText(/cada enlace vale 8 horas/)).toBeInTheDocument();
      expect(await boton()).toBeEnabled();
      // cabecera y fondo propios: no queda un <main> suelto
      expect(screen.getByRole('banner')).toHaveTextContent('BaldeCash');
    });

    it('reemplazado por uno más nuevo → no es un error del estudiante', async () => {
      mockGet.mockResolvedValue({ reason: 'superseded', error: 'x' });
      render(<FormularioClient token="tok" />);
      expect(await screen.findByText('Te enviamos un enlace más nuevo por WhatsApp')).toBeInTheDocument();
      expect(screen.getByText(/Usa el último que recibiste/)).toBeInTheDocument();
      expect(await boton()).toBeInTheDocument();
    });

    it('ya enviado → confirmación, sin botón de pedir otro', async () => {
      mockGet.mockResolvedValue({ reason: 'submitted', error: 'x' });
      render(<FormularioClient token="tok" />);
      expect(await screen.findByText('Ya recibimos tu formulario')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /enlace nuevo/ })).not.toBeInTheDocument();
    });

    it('pedir uno nuevo → 200 muestra el celular enmascarado y deshabilita el botón', async () => {
      mockGet.mockResolvedValue({ reason: 'expired', error: 'x' });
      mockRenovar.mockResolvedValue({ ok: true, telefono: '***-***-777' });
      render(<FormularioClient token="tok" />);
      await userEvent.click(await boton());
      expect(mockRenovar).toHaveBeenCalledWith('tok');
      expect(await screen.findByText('Listo, te enviamos un enlace nuevo')).toBeInTheDocument();
      expect(screen.getByText('***-***-777')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Enlace enviado' })).toBeDisabled();
      expect(screen.getByText(/Escríbenos por WhatsApp/)).toBeInTheDocument();
    });

    it('pedir uno nuevo → 409 already_submitted pasa a "ya recibimos"', async () => {
      mockGet.mockResolvedValue({ reason: 'revoked', error: 'x' });
      mockRenovar.mockResolvedValue({ reason: 'already_submitted', error: 'x' });
      render(<FormularioClient token="tok" />);
      await userEvent.click(await boton());
      expect(await screen.findByText('Ya recibimos tu formulario')).toBeInTheDocument();
    });

    it('pedir uno nuevo → 502 deja el fallback de WhatsApp y permite reintentar', async () => {
      mockGet.mockResolvedValue({ reason: 'expired', error: 'x' });
      mockRenovar.mockResolvedValue({ reason: 'send_failed', error: 'x' });
      render(<FormularioClient token="tok" />);
      await userEvent.click(await boton());
      expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos enviarlo por WhatsApp');
      expect(screen.getByText(/Escríbenos por WhatsApp/)).toBeInTheDocument();
      expect(await boton()).toBeEnabled();
    });

    it('pedir uno nuevo → 200 con expires_at avisa hasta cuándo vale (hora Lima, sin correr el día)', async () => {
      mockGet.mockResolvedValue({ reason: 'expired', error: 'x' });
      const hoy = new Date();
      const iso = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}T11:55:00`;
      mockRenovar.mockResolvedValue({ ok: true, telefono: '***-***-777', expires_at: iso });
      render(<FormularioClient token="tok" />);
      await userEvent.click(await boton());
      expect(await screen.findByText(/Ábrelo pronto: vence hoy a las 11:55/)).toBeInTheDocument();
    });

    it('pedir uno nuevo → 409 sla_expired: se venció el plazo, sin reintentar', async () => {
      mockGet.mockResolvedValue({ reason: 'expired', error: 'x' });
      mockRenovar.mockResolvedValue({ reason: 'sla_expired', error: 'x' });
      render(<FormularioClient token="tok" />);
      await userEvent.click(await boton());
      expect(await screen.findByText('Se venció el plazo para completar el formulario')).toBeInTheDocument();
      expect(screen.getByText(/Tu asesor se comunicará contigo/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /enlace nuevo|Reintentar/ })).not.toBeInTheDocument();
      expect(screen.getByText(/Escríbenos por WhatsApp/)).toBeInTheDocument();
    });

    it('pedir uno nuevo → 429 avisa del tope', async () => {
      mockGet.mockResolvedValue({ reason: 'expired', error: 'x' });
      mockRenovar.mockResolvedValue({ reason: 'rate_limited', error: 'x' });
      render(<FormularioClient token="tok" />);
      await userEvent.click(await boton());
      expect(await screen.findByRole('alert')).toHaveTextContent('Ya te enviamos varios enlaces hoy');
    });
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

    await waitFor(() => expect(mockSubir).toHaveBeenCalledWith('tok', 'payslip', expect.any(File), 'document', expect.any(Function)));
    // Al completarse, la sección se colapsa a "Listo".
    expect(await screen.findByText('Listo')).toBeInTheDocument();
  });

  it('la subida no bloquea la pantalla: el archivo se ve mientras viaja', async () => {
    mockGet.mockResolvedValue(pantalla({ modulos: [modulo('payslip')] }));
    let resolver: (m: Modulo) => void = () => {};
    mockSubir.mockReturnValue(new Promise<Modulo>((r) => { resolver = r; }));
    render(<FormularioClient token="tok" />);

    await screen.findByText(/Laptop Lenovo/);
    const input = screen.getByTestId('input-payslip') as HTMLInputElement;
    await userEvent.upload(input, new File(['x'], 'boleta.jpg', { type: 'image/jpeg' }));

    // Mientras el request viaja: se ve el archivo, NO una pantalla de carga
    // que tape todo, y las demas secciones siguen ahi.
    expect(await screen.findByText('Guardando tu archivo…')).toBeInTheDocument();
    expect(screen.getByText('boleta.jpg')).toBeInTheDocument();
    expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
    expect(screen.getByText(/¿Cuándo puede conversar contigo tu asesor\?/)).toBeInTheDocument();

    resolver(modulo('payslip', { status: 'uploaded', files_count: 1, fulfilled_by: 'document' }));
    expect(await screen.findByText('Listo')).toBeInTheDocument();
  });

  it('muestra el porcentaje mientras el archivo viaja', async () => {
    mockGet.mockResolvedValue(pantalla({ modulos: [modulo('payslip')] }));
    let avisar: (p: number) => void = () => {};
    let resolver: (m: Modulo) => void = () => {};
    mockSubir.mockImplementation((_t, _c, _f, _fb, onProgress) => {
      avisar = onProgress;
      return new Promise<Modulo>((r) => { resolver = r; });
    });
    render(<FormularioClient token="tok" />);
    await screen.findByText(/Laptop Lenovo/);
    await userEvent.upload(screen.getByTestId('input-payslip') as HTMLInputElement,
                           new File(['x'], 'boleta.jpg', { type: 'image/jpeg' }));

    expect(await screen.findByText('0%')).toBeInTheDocument();
    const barra = screen.getByRole('progressbar');
    expect(barra).toHaveAttribute('aria-valuenow', '0');

    await act(async () => { avisar(45); });
    expect(await screen.findByText('45%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45');

    resolver(modulo('payslip', { status: 'uploaded', files_count: 1, fulfilled_by: 'document' }));
    expect(await screen.findByText('Listo')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('si la subida falla, se retira la previa y queda el error en el módulo', async () => {
    mockGet.mockResolvedValue(pantalla({ modulos: [modulo('payslip')] }));
    mockSubir.mockResolvedValue({ reason: 'file_size', error: 'El archivo pesa mas de 5 MB.' });
    render(<FormularioClient token="tok" />);

    await screen.findByText(/Laptop Lenovo/);
    await userEvent.upload(screen.getByTestId('input-payslip') as HTMLInputElement,
                           new File(['x'], 'boleta.jpg', { type: 'image/jpeg' }));

    expect(await screen.findByText('El archivo pesa mas de 5 MB.')).toBeInTheDocument();
    expect(screen.queryByText('Guardando tu archivo…')).not.toBeInTheDocument();
  });

  it('la sección de contacto guarda lo suyo sin enviar el formulario', async () => {
    mockGet.mockResolvedValue(pantalla({ modulos: [modulo('payslip')] }));
    mockGuardar.mockImplementation(async () => pantalla({ modulos: [modulo('payslip')] }));
    render(<FormularioClient token="tok" />);

    await screen.findByText(/Laptop Lenovo/);
    // `/^Hoy/` y no "Mañana": el chip del día y el bloque de la mañana
    // comparten texto y la consulta encuentra dos botones.
    await userEvent.click(screen.getByRole('button', { name: /^Hoy/ }));
    await userEvent.click(screen.getByRole('button', { name: /Tarde/ }));
    await userEvent.click(screen.getByRole('button', { name: 'WhatsApp' }));

    const guardar = screen.getByTestId('guardar-contacto');
    await waitFor(() => expect(guardar).toBeEnabled());
    await userEvent.click(guardar);

    await waitFor(() => expect(mockGuardar).toHaveBeenCalledWith('tok', expect.objectContaining({
      contact_date: '2026-09-04', contact_slot: '15_18', contact_channel: 'whatsapp',
    })));
    // Guardar por seccion NO envia el formulario.
    expect(mockEnviar).not.toHaveBeenCalled();
    // Guardada, la seccion se colapsa a "Listo".
    expect(await screen.findByText('Listo')).toBeInTheDocument();

    // Al reabrirla y cambiar algo, vuelve a ofrecer guardar.
    await userEvent.click(screen.getByText(/¿Cuándo puede conversar contigo tu asesor\?/));
    await userEvent.click(screen.getByRole('button', { name: 'Llamada' }));
    await waitFor(() => expect(screen.getByTestId('guardar-contacto')).toHaveTextContent('Guardar'));
    expect(screen.queryByText('Listo')).not.toBeInTheDocument();
  });

  it('la sección de dudas tiene su propio guardar', async () => {
    mockGet.mockResolvedValue(pantalla({ modulos: [modulo('payslip')] }));
    mockGuardar.mockImplementation(async () => pantalla({ modulos: [modulo('payslip')] }));
    render(<FormularioClient token="tok" />);

    await screen.findByText(/Laptop Lenovo/);
    await userEvent.type(screen.getByLabelText('Dudas'), 'Quiero cambiar el color');
    await userEvent.click(screen.getByTestId('guardar-ayuda'));

    await waitFor(() => expect(mockGuardar).toHaveBeenCalledWith('tok', { questions: 'Quiero cambiar el color' }));
    expect(mockEnviar).not.toHaveBeenCalled();
  });

  it('Enviar vive fuera de las tarjetas: sigue visible al guardar la última', async () => {
    mockGet.mockResolvedValue(pantalla({ modulos: [modulo('payslip')] }));
    mockGuardar.mockImplementation(async () => pantalla({ modulos: [modulo('payslip')] }));
    render(<FormularioClient token="tok" />);
    await screen.findByText(/Laptop Lenovo/);

    await userEvent.type(screen.getByLabelText('Dudas'), 'Quiero cambiar el color');
    await userEvent.click(screen.getByTestId('guardar-ayuda'));

    // La seccion de dudas se colapsa, pero el Enviar y su aviso no viven
    // adentro: quedan debajo de todas las tarjetas.
    await waitFor(() => expect(screen.queryByLabelText('Dudas')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: /^Enviar$/ })).toBeInTheDocument();
    expect(screen.getByText('El botón se activa cuando completes lo de arriba.')).toBeInTheDocument();
    expect(screen.getByText(/Tus documentos están seguros/)).toBeInTheDocument();
  });

  it('el módulo completo ofrece Ver y Subir otro como botones', async () => {
    mockGet.mockResolvedValue(pantalla({
      modulos: [modulo('payslip', {
        status: 'uploaded', files_count: 1, attempt_count: 1,
        documents: [{ id: 9, file_name: 'boleta.jpg', mime_type: 'image/jpeg', uploaded_at: null, view_url: 'https://s3.test/boleta.jpg' }],
      })],
    }));
    render(<FormularioClient token="tok" />);

    // Completo, el modulo se colapsa a "Listo": se abre para ver sus acciones.
    await userEvent.click(await screen.findByText('Tu boleta de pago'));
    const ver = await screen.findByRole('link', { name: /Ver/ });
    expect(ver).toHaveAttribute('href', 'https://s3.test/boleta.jpg');
    expect(screen.getByRole('button', { name: /Subir otro/ })).toBeInTheDocument();
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
