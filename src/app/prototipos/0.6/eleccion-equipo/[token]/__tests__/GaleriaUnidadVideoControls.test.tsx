/// <reference types="jest" />
/**
 * Video de la unidad: silenciado, sin controles nativos y sin forma de subir
 * el volumen.
 *
 * POR QUÉ IMPORTA: la estación de inspección graba este video EN EL TALLER —
 * el audio puede traer conversaciones del equipo de trabajo alrededor del
 * equipo. No alcanza con arrancar silenciado: los controles nativos siempre
 * traen volumen, así que cualquier persona curiosa lo reactiva en un toque.
 * Por eso el `<video>` no lleva `controls` y en su lugar hay controles propios
 * (`VideoControls`) sin ningún control de volumen — el volumen no existe como
 * opción.
 *
 * jsdom no reproduce video de verdad (ver el comentario de
 * `GaleriaUnidadZoom.test.tsx`), así que acá se prueba lo comprobable: los
 * atributos/propiedades que fuerzan el silencio, que no hay ningún control de
 * volumen en el árbol, y que los controles propios existen y son operables.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { GaleriaUnidad } from '../GaleriaUnidad';
import type { EleccionUnidad } from '@/app/prototipos/0.6/services/eleccionEquipoApi';

const unidad = (n: number): EleccionUnidad => ({
  unit_id: 100 + n,
  display_number: n,
  grado: 'A',
  grado_label: 'Excelente estado',
  photos: [
    { url: `https://s3/foto-${n}-1.jpg`, label: 'Tapa' },
    { url: `https://s3/foto-${n}-2.jpg`, label: 'Teclado' },
  ],
  video_url: `https://s3/video-${n}.mp4`,
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

describe('el video queda silenciado, de forma robusta', () => {
  it('la PROPIEDAD `muted` del nodo es `true` (no solo el atributo declarativo)', () => {
    const { container } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const video = container.querySelector('video') as HTMLVideoElement;

    // La propiedad, no el atributo: es lo que decide si suena, y es lo que
    // fuerza el ref (`asignarVideo`) por si React no reflejara el atributo a
    // tiempo en el HTML servido.
    expect(video.muted).toBe(true);
    expect(video.defaultMuted).toBe(true);
  });

  it('también lleva `playsInline`: sin él, iOS abre el reproductor nativo con volumen', () => {
    const { container } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const video = container.querySelector('video') as HTMLVideoElement;

    expect(video).toHaveAttribute('playsinline');
  });

  it('el `<video>` NO tiene el atributo `controls`: los propios lo reemplazan', () => {
    const { container } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const video = container.querySelector('video') as HTMLVideoElement;

    expect(video).not.toHaveAttribute('controls');
  });
});

describe('no existe ningún control de volumen', () => {
  it('no hay ningún elemento con "volumen" en su nombre accesible', () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    expect(screen.queryByLabelText(/volum/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('slider', { name: /volum/i })).not.toBeInTheDocument();
  });

  it('el único `input[type=range]` del diálogo es el progreso del video, no el volumen', () => {
    const { container } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    const rangos = container.querySelectorAll('input[type="range"]');
    expect(rangos).toHaveLength(1);
    expect(rangos[0]).toHaveAccessibleName('Progreso del video');
  });
});

describe('controles propios', () => {
  it('ofrece reproducir/pausar y una barra de progreso operables', () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    expect(screen.getByRole('button', { name: 'Reproducir video' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Progreso del video' })).toBeInTheDocument();
  });

  it('sin video (solo fotos) no se muestran controles de video', () => {
    render(
      <GaleriaUnidad unidad={{ ...unidad(1), video_url: null }} {...props} />,
    );

    expect(screen.queryByRole('button', { name: /Reproducir video|Pausar video/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('slider', { name: 'Progreso del video' })).not.toBeInTheDocument();
  });

  it('los controles del video entran en la trampa de foco del diálogo', () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const dialogo = screen.getByRole('dialog');

    expect(dialogo).toContainElement(screen.getByRole('button', { name: 'Reproducir video' }));
    expect(dialogo).toContainElement(screen.getByRole('slider', { name: 'Progreso del video' }));
  });
});

describe('doble click sobre el video: ahora sí acerca', () => {
  it('sin controles nativos que se lo disputen, el doble click en el video hace zoom', async () => {
    const { container } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const video = container.querySelector('video') as HTMLVideoElement;
    const capa = screen.getByTestId('visor-capa');

    await userEvent.dblClick(video);

    expect(Number(capa.dataset.escala)).toBeGreaterThan(1);
  });
});

describe('sin controles de zoom cuando no hay medio', () => {
  it('sigue sin controles de video ni de zoom si la unidad no tiene nada', () => {
    render(
      <GaleriaUnidad unidad={{ ...unidad(1), photos: [], video_url: null }} {...props} />,
    );

    expect(screen.queryByRole('group', { name: /Zoom/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('slider', { name: 'Progreso del video' })).not.toBeInTheDocument();
  });
});

describe('encuadre del medio grande', () => {
  it('el video usa el mismo criterio de recorte que la tira (object-cover, no object-contain)', () => {
    const { container } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const video = container.querySelector('video') as HTMLVideoElement;

    expect(video).toHaveClass('object-cover');
    expect(video).not.toHaveClass('object-contain');
  });

  it('la foto grande también usa object-cover, igual que sus miniaturas', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /Tapa/ }));

    const foto = within(screen.getByTestId('visor-capa')).getByRole('img');
    expect(foto).toHaveClass('object-cover');
    expect(foto).not.toHaveClass('object-contain');
  });
});
