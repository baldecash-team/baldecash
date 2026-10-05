/// <reference types="jest" />
/**
 * Pantalla completa del visor (bug reportado en vivo: "no existía / no
 * abría nada").
 *
 * REGLA QUE NO SE NEGOCIA: el pedido de pantalla completa va sobre el
 * CONTENEDOR (visor + botones + controles del video, `data-testid`
 * `visor-contenedor`), NUNCA sobre el `<video>`. Pedirlo sobre el `<video>`
 * es lo que en varios navegadores móviles hace que el sistema devuelva sus
 * controles nativos —con volumen incluido— por encima de todo lo de
 * `VideoControls`, que es exactamente lo que este cambio existe para evitar.
 *
 * LA OTRA REGLA: el modo expandido NO puede depender del Fullscreen API. En
 * iPhone `document.fullscreenEnabled` es siempre `false` (Safari solo deja
 * entrar a pantalla completa a un `<video>`), y colgar el botón de ahí lo
 * dejaba invisible justo en el dispositivo donde más falta hace — así llegó el
 * reporte de "los controles de pantalla completa no funcionan en mobile". Hoy
 * expandir es un overlay CSS propio y el API nativo es un extra best-effort.
 *
 * jsdom no implementa el Fullscreen API (no hay `document.fullscreenEnabled`
 * ni `Element.requestFullscreen`), así que acá se lo mockea a mano — ver
 * `simularSoporteFullscreen` y `sinFullscreenApi`.
 */
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { GaleriaUnidad } from '../GaleriaUnidad';
import type { EleccionUnidad } from '@/app/prototipos/0.6/services/eleccionEquipoApi';

const unidad = (n: number): EleccionUnidad => ({
  unit_id: 100 + n,
  display_number: n,
  grado: 'A',
  grado_label: 'Excelente estado',
  photos: [{ url: `https://s3/foto-${n}-1.jpg`, label: 'Tapa' }],
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

/** Mockea el Fullscreen API, que jsdom no implementa. */
function simularSoporteFullscreen(soporta = true) {
  Object.defineProperty(document, 'fullscreenEnabled', {
    value: soporta,
    configurable: true,
  });
  Object.defineProperty(document, 'fullscreenElement', {
    value: null,
    configurable: true,
    writable: true,
  });
  const requestFullscreen = jest.fn().mockResolvedValue(undefined);
  const exitFullscreen = jest.fn().mockImplementation(() => {
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
      writable: true,
    });
    document.dispatchEvent(new Event('fullscreenchange'));
    return Promise.resolve();
  });
  HTMLElement.prototype.requestFullscreen = requestFullscreen;
  document.exitFullscreen = exitFullscreen;
  return { requestFullscreen, exitFullscreen };
}

/**
 * Simula un navegador SIN Fullscreen API: iPhone. No alcanza con
 * `fullscreenEnabled = false` — hay que sacar `requestFullscreen` del
 * prototipo, porque otro test del archivo lo dejó puesto ahí.
 */
function sinFullscreenApi() {
  Object.defineProperty(document, 'fullscreenEnabled', {
    value: false,
    configurable: true,
  });
  delete (HTMLElement.prototype as Partial<HTMLElement>).requestFullscreen;
  delete (document as Partial<Document>).exitFullscreen;
}

/** Simula que el navegador aceptó el pedido y entró a pantalla completa. */
const entrarAFullscreen = (el: Element) => act(() => {
  Object.defineProperty(document, 'fullscreenElement', {
    value: el,
    configurable: true,
    writable: true,
  });
  document.dispatchEvent(new Event('fullscreenchange'));
});

/** Abre la galería en pantalla completa (pide + simula la confirmación). */
async function irAPantallaCompleta() {
  await userEvent.click(screen.getByRole('button', { name: 'Ver en pantalla completa' }));
  entrarAFullscreen(screen.getByTestId('visor-contenedor'));
  await screen.findByRole('button', { name: 'Salir de pantalla completa' });
}

beforeEach(() => {
  jest.clearAllMocks();
  simularSoporteFullscreen(true);
});

afterEach(() => {
  Object.defineProperty(document, 'fullscreenElement', {
    value: null,
    configurable: true,
    writable: true,
  });
});

describe('sin Fullscreen API (iPhone)', () => {
  beforeEach(sinFullscreenApi);

  it('el botón SE MUESTRA igual: es lo único que hay para agrandar el visor', () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    expect(
      screen.getByRole('button', { name: 'Ver en pantalla completa' }),
    ).toBeInTheDocument();
  });

  it('expande de verdad: el contenedor pasa a overlay a pantalla entera', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const contenedor = screen.getByTestId('visor-contenedor');
    expect(contenedor.className).not.toMatch(/fixed/);

    await userEvent.click(screen.getByRole('button', { name: 'Ver en pantalla completa' }));

    expect(contenedor.className).toMatch(/fixed/);
    expect(contenedor.className).toMatch(/inset-0/);
    // Y el video y sus controles siguen adentro: expandir el visor sin los
    // controles deja algo que se ve pero no se puede pausar.
    expect(contenedor).toContainElement(screen.getByRole('button', { name: 'Reproducir video' }));
  });

  it('vuelve al tamaño normal al tocarlo de nuevo', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const contenedor = screen.getByTestId('visor-contenedor');

    await userEvent.click(screen.getByRole('button', { name: 'Ver en pantalla completa' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salir de pantalla completa' }));

    expect(contenedor.className).not.toMatch(/fixed/);
  });

  it('Escape sale del modo expandido; recién el segundo cierra la galería', async () => {
    const onCerrar = jest.fn();
    render(<GaleriaUnidad unidad={unidad(1)} {...props} onCerrar={onCerrar} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ver en pantalla completa' }));
    await userEvent.keyboard('{Escape}');

    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByTestId('visor-contenedor').className).not.toMatch(/fixed/);

    await userEvent.keyboard('{Escape}');
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});

describe('con soporte', () => {
  it('el botón existe, arranca en "Ver en pantalla completa" y está dentro del diálogo', () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const dialogo = screen.getByRole('dialog');
    const boton = screen.getByRole('button', { name: 'Ver en pantalla completa' });

    expect(dialogo).toContainElement(boton);
  });

  it('pide pantalla completa sobre el CONTENEDOR, nunca sobre el <video>', async () => {
    const { requestFullscreen } = simularSoporteFullscreen(true);
    const { container } = render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ver en pantalla completa' }));

    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    // El `this` del mock es el elemento sobre el que se llamó.
    const llamadoSobre = requestFullscreen.mock.instances[0] as HTMLElement;
    expect(llamadoSobre).toBe(screen.getByTestId('visor-contenedor'));
    expect(llamadoSobre.tagName).not.toBe('VIDEO');
    // Y contiene al video Y a los controles propios: pedir fullscreen del
    // video solo, o del visor sin los controles, deja algo inoperable ahí
    // adentro.
    expect(llamadoSobre.contains(container.querySelector('video'))).toBe(true);
    expect(llamadoSobre).toContainElement(screen.getByRole('button', { name: 'Reproducir video' }));
  });

  it('al entrar, el botón pasa a "Salir de pantalla completa"; al volver a tocarlo, sale', async () => {
    const { exitFullscreen } = simularSoporteFullscreen(true);
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    await irAPantallaCompleta();
    await userEvent.click(screen.getByRole('button', { name: 'Salir de pantalla completa' }));

    expect(exitFullscreen).toHaveBeenCalledTimes(1);
  });

  it('el zoom y los controles del video siguen operables estando en pantalla completa', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);

    await irAPantallaCompleta();

    await userEvent.click(screen.getByRole('button', { name: 'Acercar' }));
    expect(Number(screen.getByTestId('visor-capa').dataset.escala)).toBeGreaterThan(1);

    expect(screen.getByRole('button', { name: 'Reproducir video' })).toBeEnabled();
    expect(screen.getByRole('slider', { name: 'Progreso del video' })).toBeEnabled();
  });

  it('el botón de pantalla completa entra en la trampa de foco del diálogo', async () => {
    render(<GaleriaUnidad unidad={unidad(1)} {...props} />);
    const dialogo = screen.getByRole('dialog');

    await irAPantallaCompleta();

    expect(dialogo).toContainElement(screen.getByRole('button', { name: 'Salir de pantalla completa' }));
  });
});

describe('Escape', () => {
  it('mientras está en pantalla completa, Escape NO cierra la galería (lo maneja el navegador)', async () => {
    const onCerrar = jest.fn();
    render(<GaleriaUnidad unidad={unidad(1)} {...props} onCerrar={onCerrar} />);

    await irAPantallaCompleta();
    await userEvent.keyboard('{Escape}');

    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('una vez afuera de pantalla completa, Escape sí cierra la galería', async () => {
    const onCerrar = jest.fn();
    render(<GaleriaUnidad unidad={unidad(1)} {...props} onCerrar={onCerrar} />);

    await irAPantallaCompleta();

    // Sale de pantalla completa (el navegador ya lo hizo con SU propio
    // Escape, acá se simula el resultado).
    act(() => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: null, configurable: true, writable: true,
      });
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    await screen.findByRole('button', { name: 'Ver en pantalla completa' });

    await userEvent.keyboard('{Escape}');

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
