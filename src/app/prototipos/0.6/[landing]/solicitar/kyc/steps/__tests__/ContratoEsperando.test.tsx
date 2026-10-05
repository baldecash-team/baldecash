/**
 * La espera del contrato: lo que se anuncia y lo que es decorado.
 *
 * El esqueleto de la hoja no tiene que existir para un lector de pantalla —es
 * la forma de lo que viene, no información—, y el texto sí: por eso va dentro
 * de un `role="status"`. Si alguna vez se invierte, alguien que navega por
 * audio escucha una lista de barras vacías y no se entera de que está
 * esperando.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ContratoEsperando } from '../ContratoEsperando';

it('anuncia la espera como estado, no como alerta', () => {
  render(<ContratoEsperando />);

  const caja = screen.getByTestId('contrato-esperando');
  expect(caja).toHaveAttribute('role', 'status');
  expect(caja).toHaveAttribute('aria-live', 'polite');
  expect(screen.getByText(/Tu contrato se está generando/)).toBeInTheDocument();
});

it('con el contrato reemplazado dice que hay una versión nueva', () => {
  render(<ContratoEsperando outdated />);

  expect(screen.getByText(/Tu contrato se actualizó/)).toBeInTheDocument();
  expect(screen.getByText(/Revísala y acéptala de nuevo/)).toBeInTheDocument();
  expect(screen.queryByText(/se está generando/)).not.toBeInTheDocument();
});
