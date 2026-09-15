/// <reference types="jest" />
/**
 * El formulario de entrega en la pantalla final del KYC.
 *
 * La regla: se muestra solo si el cierre dejó un token. Sin token —otro
 * dispositivo, modo privado, o una solicitud con cuota inicial pendiente— la
 * sección no existe, y la persona coordina desde el enlace que le llega por
 * WhatsApp.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/entrega/components/EntregaTokenClient', () => ({
  // El formulario conectado pide sus datos al API; acá solo importa que reciba
  // el token que dejó el cierre del KYC.
  EntregaTokenClient: ({ token }: { token: string }) => <div>formulario de {token}</div>,
}));

import { EntregaIncrustada } from '../components/EntregaIncrustada';
import {
  guardarEntregaToken,
  olvidarEntregaToken,
} from '@/app/prototipos/0.6/[landing]/solicitar/kyc/entregaStorage';

const LANDING = 'renueva-tu-equipo-1';
const CODE = 'SOL-77';

beforeEach(() => window.localStorage.clear());

it('sin token no pinta nada', () => {
  const { container } = render(<EntregaIncrustada landing={LANDING} applicationCode={CODE} />);

  expect(container).toBeEmptyDOMElement();
});

it('con el token del cierre muestra el formulario', async () => {
  guardarEntregaToken(LANDING, CODE, 'tok-entrega-1');

  render(<EntregaIncrustada landing={LANDING} applicationCode={CODE} />);

  expect(await screen.findByTestId('entrega-incrustada')).toBeInTheDocument();
  expect(screen.getByText('formulario de tok-entrega-1')).toBeInTheDocument();
});

it('el token es de esa solicitud y no de otra', async () => {
  guardarEntregaToken(LANDING, 'SOL-OTRA', 'tok-ajeno');

  render(<EntregaIncrustada landing={LANDING} applicationCode={CODE} />);

  await waitFor(() => expect(screen.queryByTestId('entrega-incrustada')).not.toBeInTheDocument());
});

it('olvidar el token lo saca de la pantalla siguiente', async () => {
  guardarEntregaToken(LANDING, CODE, 'tok-entrega-1');
  olvidarEntregaToken(LANDING, CODE);

  render(<EntregaIncrustada landing={LANDING} applicationCode={CODE} />);

  await waitFor(() => expect(screen.queryByTestId('entrega-incrustada')).not.toBeInTheDocument());
});
