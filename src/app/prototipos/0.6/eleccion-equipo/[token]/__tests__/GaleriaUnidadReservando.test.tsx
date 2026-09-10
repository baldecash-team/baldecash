/// <reference types="jest" />
/**
 * El estado "reservando" del botón de elegir.
 *
 * POR QUÉ IMPORTA: reservar no es instantáneo. El backend toma el lock de la
 * unidad, revalida contra Airtable —con timeout de 30 s—, reanuda el workflow
 * y emite el contrato en Keynua. Con el botón solo atenuado, esos segundos se
 * leen como que no pasó nada y la persona vuelve a tocar.
 *
 * El doble toque no puede duplicar la reserva (el índice único sobre
 * `reserved_application_id` lo impide), pero sí deja a alguien creyendo que la
 * pantalla se colgó justo cuando su unidad se está reservando bien.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { GaleriaUnidad } from '../GaleriaUnidad';
import type { EleccionUnidad } from '@/app/prototipos/0.6/services/eleccionEquipoApi';

const UNIDAD: EleccionUnidad = {
  unit_id: 101,
  display_number: 1,
  grado: 'A',
  grado_label: 'Excelente estado',
  photos: [{ url: 'https://s3/foto.jpg' }],
  video_url: null,
};

const props = {
  unidad: UNIDAD,
  error: null,
  onCerrar: jest.fn(),
  onElegir: jest.fn(),
  onCambiarFoto: jest.fn(),
  onReproducirVideo: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

function boton() {
  return screen.getByRole('button', { name: /Elegir esta unidad|Reservando/i });
}

it('en reposo invita a elegir y no dice que esté ocupado', () => {
  render(<GaleriaUnidad {...props} enviando={false} />);
  expect(boton()).toHaveTextContent('Elegir esta unidad');
  expect(boton()).not.toBeDisabled();
  expect(boton()).toHaveAttribute('aria-busy', 'false');
});

it('mientras reserva: texto, deshabilitado y aria-busy', () => {
  render(<GaleriaUnidad {...props} enviando />);
  expect(boton()).toHaveTextContent('Reservando tu unidad...');
  expect(boton()).toBeDisabled();
  // El cambio de texto solo lo nota quien ve. `aria-busy` es lo que se lo
  // dice a un lector de pantalla.
  expect(boton()).toHaveAttribute('aria-busy', 'true');
});

it('el spinner gira solo mientras reserva', () => {
  const { rerender } = render(<GaleriaUnidad {...props} enviando={false} />);
  expect(boton().querySelector('.animate-spin')).toBeNull();

  rerender(<GaleriaUnidad {...props} enviando />);
  expect(boton().querySelector('.animate-spin')).not.toBeNull();
});

it('deshabilitado no vuelve a disparar la reserva', async () => {
  render(<GaleriaUnidad {...props} enviando />);
  await userEvent.click(boton());
  expect(props.onElegir).not.toHaveBeenCalled();
});
