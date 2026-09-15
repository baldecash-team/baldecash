/// <reference types="jest" />
/**
 * A dónde termina el formulario de entrega.
 *
 * Cuando se llega desde el cierre del KYC, coordinar la entrega es el ÚLTIMO
 * paso: lo que sigue es la confirmación de la solicitud. Antes, al registrar,
 * aparecía un cierre propio —"Tu envío quedó registrado"— con un botón que
 * llevaba exactamente a esa confirmación: dos pantallas de final y un clic de
 * más para leer lo mismo.
 *
 * La regla que fija este archivo tiene dos mitades: con `volver` se navega
 * derecho y no se pinta ningún cierre, y sin `volver` —el enlace de WhatsApp,
 * que se abre fuera del wizard— el cierre sigue existiendo, porque ahí no hay
 * ninguna pantalla a la que seguir.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

jest.mock('@/app/prototipos/0.6/components/lead/GeoCascadeField', () => ({
  GeoCascadeField: ({ onChange }: { onChange: (id: string, label?: string) => void }) => (
    <button type="button" onClick={() => onChange('1508', 'Miraflores')}>
      Elegir distrito
    </button>
  ),
}));

jest.mock('@/app/prototipos/0.6/services/entregaApi', () => {
  const real = jest.requireActual('@/app/prototipos/0.6/services/entregaApi');
  return { ...real, getEntrega: jest.fn(), registrarEntrega: jest.fn() };
});

import { getEntrega, registrarEntrega } from '@/app/prototipos/0.6/services/entregaApi';
import { EntregaTokenClient } from '../EntregaTokenClient';

const mockGet = getEntrega as jest.Mock;
const mockPost = registrarEntrega as jest.Mock;

const CONFIRMACION = '/prototipos/0.6/renueva-tu-equipo-1-a/solicitar/confirmacion/?code=APP-1';

/** Una solicitud con la dirección ya declarada: el formulario abre en el envío. */
const datos = {
  application_code: 'APP-1',
  fecha_entrega: '2026-09-20',
  equipo: { nombre: 'ExpertBook P1', cuota: '168.00', cuotas: 24, inicial: null },
  direccion: {
    direccion: 'Av. Benavides 1238',
    calle: 'Dpto 301',
    referencia: 'Frente al parque',
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: 'Miraflores',
    distrito_id: '1508',
  },
  titular: { nombre: 'Ana Quispe', documento: '45678912' },
};

beforeEach(() => {
  push.mockReset();
  mockGet.mockReset().mockResolvedValue(datos);
  mockPost.mockReset().mockResolvedValue({ ok: true });
});

const finalizar = async () => {
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Finalizar solicitud' })).toBeInTheDocument(),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Finalizar solicitud' }));
};

it('con volver va derecho a la confirmación, sin pantalla intermedia', async () => {
  render(<EntregaTokenClient token="tok" volver={CONFIRMACION} />);

  await finalizar();

  await waitFor(() => expect(push).toHaveBeenCalledWith(CONFIRMACION));
  // El cierre propio no se pinta: la confirmación de la solicitud es el final.
  expect(screen.queryByText('Tu envío quedó registrado')).not.toBeInTheDocument();
});

it('sin volver se queda en su propio cierre', async () => {
  render(<EntregaTokenClient token="tok" />);

  await finalizar();

  await waitFor(() =>
    expect(screen.getByText('Tu envío quedó registrado')).toBeInTheDocument(),
  );
  expect(push).not.toHaveBeenCalled();
});
