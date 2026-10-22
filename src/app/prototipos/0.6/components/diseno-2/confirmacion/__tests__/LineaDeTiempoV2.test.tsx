/**
 * F8 (BAL-4967): la línea de tiempo tiene 4 hitos, con la hora del envío en
 * el primero, es un `<ol>`, y el estado de cada hito va en texto (no solo color).
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LineaDeTiempoV2 } from '../LineaDeTiempoV2';

describe('LineaDeTiempoV2', () => {
  it('es una lista ordenada con 4 hitos', () => {
    render(<LineaDeTiempoV2 horaDeEnvio="Hoy, 08:38 a. m." plazoWhatsApp="Máx. 24 h" />);
    const lista = screen.getByRole('list');
    expect(lista.tagName).toBe('OL');
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('el primer hito lleva la hora real del envío', () => {
    render(<LineaDeTiempoV2 horaDeEnvio="Hoy, 08:38 a. m." plazoWhatsApp="Máx. 24 h" />);
    expect(screen.getByText('Hoy, 08:38 a. m.')).toBeInTheDocument();
  });

  it('muestra los 4 títulos de Brenda en orden', () => {
    render(<LineaDeTiempoV2 horaDeEnvio="Hoy" plazoWhatsApp="Máx. 24 h" />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Solicitud enviada');
    expect(items[1]).toHaveTextContent('Revisamos tu solicitud');
    expect(items[2]).toHaveTextContent('Te avisamos por WhatsApp');
    expect(items[3]).toHaveTextContent('Firmas y te enviamos tu laptop');
  });

  it('el plazo de WhatsApp es el que recibe por prop, nunca inventado', () => {
    render(<LineaDeTiempoV2 horaDeEnvio="Hoy" plazoWhatsApp="Máx. 48 h" />);
    expect(screen.getByText('Máx. 48 h')).toBeInTheDocument();
  });

  it('el estado de cada hito está en texto, no solo en color', () => {
    render(<LineaDeTiempoV2 horaDeEnvio="Hoy" plazoWhatsApp="Máx. 24 h" />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Completado');
    expect(items[1]).toHaveTextContent('En curso');
    expect(items[2]).toHaveTextContent('Pendiente');
    expect(items[3]).toHaveTextContent('Pendiente');
  });
});
