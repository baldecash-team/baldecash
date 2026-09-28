/**
 * El visor. Lo que más importa acá es que un fallo se vea GRIS y no rojo: el
 * rojo está reservado para el semáforo del pre-vuelo, que sí significa "no
 * podés grabar". Un rojo que no exige nada devalúa el rojo que sí.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';

// jsdom no dibuja video en un canvas: el brillo se controla desde cada test.
jest.mock('../../_lib/diagnosticoTransmision', () => ({
  ...jest.requireActual('../../_lib/diagnosticoTransmision'),
  reportar: jest.fn(() => Promise.resolve()),
  medirLuma: jest.fn(() => null),
}));
import { medirLuma, reportar } from '../../_lib/diagnosticoTransmision';
import { TransmisionEnVivo } from '../TransmisionEnVivo';
import type { Transmision } from '../../_lib/useTransmisionReceptor';

function transmision(parcial: Partial<Transmision> = {}): Transmision {
  return {
    deviceId: 'dev-cam-01',
    label: 'techo',
    estado: 'conectando',
    stream: null,
    ...parcial,
  };
}

describe('TransmisionEnVivo', () => {
  it('sin transmisiones no renderiza nada', () => {
    const { container } = render(
      <TransmisionEnVivo transmisiones={[]} onReintentar={jest.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('muestra la etiqueta de cada cámara', () => {
    render(
      <TransmisionEnVivo
        transmisiones={[
          transmision(),
          transmision({ deviceId: 'dev-cam-02', label: 'pared' }),
        ]}
        onReintentar={jest.fn()}
      />
    );

    expect(screen.getByText('techo')).toBeInTheDocument();
    expect(screen.getByText('pared')).toBeInTheDocument();
  });

  it('mientras conecta lo dice, sin video', () => {
    render(<TransmisionEnVivo transmisiones={[transmision()]} onReintentar={jest.fn()} />);

    expect(screen.getByText('Conectando…')).toBeInTheDocument();
    expect(document.querySelector('video')).toBeNull();
  });

  it('cuando ve, renderiza el video con el stream', () => {
    const stream = { id: 'st-1' } as unknown as MediaStream;
    render(
      <TransmisionEnVivo
        transmisiones={[transmision({ estado: 'viendo', stream })]}
        onReintentar={jest.fn()}
      />
    );

    const video = document.querySelector('video') as HTMLVideoElement;
    expect(video).not.toBeNull();
    expect(video.srcObject).toBe(stream);
    expect(video.muted).toBe(true);
    expect(video.autoplay).toBe(true);
  });

  it('REGLA CRÍTICA: el fallo es gris, nunca rojo', () => {
    render(
      <TransmisionEnVivo
        transmisiones={[transmision({ estado: 'sin-transmision' })]}
        onReintentar={jest.fn()}
      />
    );

    const aviso = screen.getByText('Sin transmisión');
    expect(aviso).toBeInTheDocument();
    // `TOKENS.red` es '#ef4444'; jsdom serializa los estilos inline como
    // `rgb(...)`, así que se chequean las dos formas.
    expect(aviso.closest('figure')?.outerHTML).not.toMatch(/#ef4444|rgb\(239, 68, 68\)/i);
  });

  it('el botón de reintentar avisa con el deviceId', () => {
    const onReintentar = jest.fn();
    render(
      <TransmisionEnVivo
        transmisiones={[transmision({ estado: 'sin-transmision' })]}
        onReintentar={onReintentar}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(onReintentar).toHaveBeenCalledWith('dev-cam-01');
  });

  it('solo ofrece reintentar cuando no hay transmisión', () => {
    render(
      <TransmisionEnVivo
        transmisiones={[transmision({ estado: 'conectando' })]}
        onReintentar={jest.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /reintentar/i })).toBeNull();
  });

  it('conectando se distingue de sin-transmisión por un ícono animado, no solo por texto', () => {
    const { container } = render(
      <TransmisionEnVivo
        transmisiones={[transmision({ estado: 'conectando' })]}
        onReintentar={jest.fn()}
      />
    );

    // El giro es lo que se nota de reojo, sin leer: `Loader2` con
    // `animate-spin`, y nada del ícono estático de `sin-transmisión`.
    expect(container.querySelector('svg.animate-spin')).not.toBeNull();
    expect(container.querySelector('svg.lucide-video-off')).toBeNull();
  });

  it('sin-transmisión se distingue de conectando por un ícono estático, no solo por texto', () => {
    const { container } = render(
      <TransmisionEnVivo
        transmisiones={[transmision({ estado: 'sin-transmision' })]}
        onReintentar={jest.fn()}
      />
    );

    const icono = container.querySelector('svg.lucide-video-off');
    expect(icono).not.toBeNull();
    expect(icono).not.toHaveClass('animate-spin');
    expect(container.querySelector('svg.animate-spin')).toBeNull();
  });

  it('el botón de reintentar tiene fondo blanco: el borde solo no se lee como control sobre el tile gris', () => {
    render(
      <TransmisionEnVivo
        transmisiones={[transmision({ estado: 'sin-transmision' })]}
        onReintentar={jest.fn()}
      />
    );

    const boton = screen.getByRole('button', { name: /reintentar/i });
    expect(boton).toHaveClass('bg-white');
    // `TOKENS.line` es '#e5e7eb', casi el mismo gris que el fondo del tile
    // (#EEE): con ese borde el botón se volvía texto suelto a distancia de
    // kiosco. Se chequean las dos formas en que jsdom serializa el color.
    expect(boton.outerHTML).not.toMatch(/#e5e7eb|rgb\(229, 231, 235\)/i);
  });
});

describe('TransmisionEnVivo — diagnóstico de visor negro', () => {
  const stream = { id: 'st-1' } as unknown as MediaStream;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    (medirLuma as jest.Mock).mockReturnValue(null);
  });

  it('si llegan cuadros negros varias muestras seguidas, reporta una vez por stream', () => {
    (medirLuma as jest.Mock).mockReturnValue({ media: 1, max: 4 });
    render(
      <TransmisionEnVivo
        transmisiones={[transmision({ estado: 'viendo', stream })]}
        onReintentar={jest.fn()}
      />
    );

    act(() => {
      jest.advanceTimersByTime(6_000);
    });

    expect(reportar).toHaveBeenCalledWith(
      'visor_negro',
      'dev-cam-01:st-1',
      expect.objectContaining({ camara: 'techo', lumaVisor: 1 })
    );
  });

  it('con imagen no reporta nada', () => {
    (medirLuma as jest.Mock).mockReturnValue({ media: 170, max: 250 });
    render(
      <TransmisionEnVivo
        transmisiones={[transmision({ estado: 'viendo', stream })]}
        onReintentar={jest.fn()}
      />
    );

    act(() => {
      jest.advanceTimersByTime(20_000);
    });

    expect(reportar).not.toHaveBeenCalled();
  });

  it('un negro que se recupera antes de la tercera muestra no reporta', () => {
    (medirLuma as jest.Mock)
      .mockReturnValueOnce({ media: 1, max: 4 })
      .mockReturnValueOnce({ media: 1, max: 4 })
      .mockReturnValue({ media: 170, max: 250 });
    render(
      <TransmisionEnVivo
        transmisiones={[transmision({ estado: 'viendo', stream })]}
        onReintentar={jest.fn()}
      />
    );

    act(() => {
      jest.advanceTimersByTime(20_000);
    });

    expect(reportar).not.toHaveBeenCalled();
  });
});

