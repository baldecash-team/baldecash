/// <reference types="jest" />
/**
 * Daños estéticos de la unidad en la galería.
 *
 * LA REGLA: los tres estados del dato son distintos y ninguno se puede
 * aplanar. `null`/ausente = nadie evaluó (silencio); `[]` = se evaluó y está
 * limpio (afirmación); con elementos = la lista.
 *
 * Confundir el primero con el segundo es el error caro: decirle "sin daños" a
 * alguien sobre un equipo reacondicionado que en realidad nadie miró.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { GaleriaUnidad } from '../GaleriaUnidad';
import type {
  EleccionDefecto,
  EleccionUnidad,
} from '@/app/prototipos/0.6/services/eleccionEquipoApi';

const unidad = (defectos?: EleccionDefecto[] | null): EleccionUnidad => ({
  unit_id: 101,
  display_number: 1,
  grado: 'B',
  grado_label: 'Buen estado',
  photos: [{ url: 'https://s3/foto.jpg', label: 'Tapa' }],
  video_url: 'https://s3/video.mp4',
  defectos,
});

const props = {
  enviando: false,
  error: null,
  onCerrar: jest.fn(),
  onElegir: jest.fn(),
  onCambiarFoto: jest.fn(),
  onReproducirVideo: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('sin evaluación', () => {
  it('sin el campo (backend viejo) no dibuja nada', () => {
    render(<GaleriaUnidad unidad={unidad(undefined)} {...props} />);

    expect(screen.queryByText(/Marcas de esta unidad/)).not.toBeInTheDocument();
    expect(screen.queryByText(/no le encontramos daños/i)).not.toBeInTheDocument();
  });

  it('con `null` TAMPOCO afirma que está limpia: nadie la miró', () => {
    render(<GaleriaUnidad unidad={unidad(null)} {...props} />);

    expect(screen.queryByText(/no le encontramos daños/i)).not.toBeInTheDocument();
  });
});

describe('evaluada', () => {
  it('lista vacía SÍ afirma que no tiene daños', () => {
    render(<GaleriaUnidad unidad={unidad([])} {...props} />);

    expect(screen.getByText(/no le encontramos daños estéticos/i)).toBeInTheDocument();
  });

  it('muestra cada daño con su nivel', () => {
    render(
      <GaleriaUnidad
        unidad={unidad([
          { etiqueta: 'Rayadura en la pantalla', nivel: 'Grave' },
          { etiqueta: 'Desgaste en el teclado', nivel: 'Leve' },
        ])}
        {...props}
      />,
    );

    expect(screen.getByText('Rayadura en la pantalla')).toBeInTheDocument();
    expect(screen.getByText('Grave')).toBeInTheDocument();
    expect(screen.getByText('Desgaste en el teclado')).toBeInTheDocument();
    expect(screen.getByText('Leve')).toBeInTheDocument();
    // Y NO afirma lo contrario al mismo tiempo.
    expect(screen.queryByText(/no le encontramos daños/i)).not.toBeInTheDocument();
  });

  it('un daño sin nivel se muestra igual, sin chip', () => {
    render(
      <GaleriaUnidad
        unidad={unidad([{ etiqueta: 'Golpe o deformación', nivel: null }])}
        {...props}
      />,
    );

    expect(screen.getByText('Golpe o deformación')).toBeInTheDocument();
  });

  it('la lista arranca plegada, pero la cabecera ya dice cuántas y cuán serias', () => {
    // Plegar no puede volverse esconder: sin abrir nada tiene que leerse que
    // la unidad TIENE marcas y que una es severa.
    render(
      <GaleriaUnidad
        unidad={unidad([
          { etiqueta: 'Rayadura en la tapa', nivel: 'Severa' },
          { etiqueta: 'Mancha en la carcasa', nivel: 'Leve' },
          { etiqueta: 'Golpe o deformación', nivel: 'Leve' },
        ])}
        {...props}
      />,
    );

    const detalle = screen.getByText('Marcas de esta unidad').closest('details');
    expect(detalle).not.toBeNull();
    expect(detalle).not.toHaveAttribute('open');
    expect(screen.getByText('3 marcas · 1 severa')).toBeInTheDocument();
  });

  it('sin ninguna severa, la cabecera solo cuenta', () => {
    render(
      <GaleriaUnidad
        unidad={unidad([{ etiqueta: 'Desgaste en el touchpad', nivel: 'Leve' }])}
        {...props}
      />,
    );

    expect(screen.getByText('1 marca')).toBeInTheDocument();
  });

  it('el caso "sin daños" NO se pliega: es una línea y conviene leerla de una', () => {
    render(<GaleriaUnidad unidad={unidad([])} {...props} />);

    expect(
      screen.getByText(/no le encontramos daños estéticos/i).closest('details'),
    ).toBeNull();
  });

  it('no repite las specs del equipo: acá van los daños, nada más', () => {
    // El modelo ya se eligió antes de llegar a esta pantalla.
    render(
      <GaleriaUnidad
        unidad={unidad([{ etiqueta: 'Mancha en la carcasa', nivel: 'Leve' }])}
        {...props}
      />,
    );

    expect(screen.queryByText(/procesador/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bRAM\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/almacenamiento/i)).not.toBeInTheDocument();
  });
});
