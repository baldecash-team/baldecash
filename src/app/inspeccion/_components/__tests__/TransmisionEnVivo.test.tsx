/**
 * El visor. Lo que más importa acá es que un fallo se vea GRIS y no rojo: el
 * rojo está reservado para el semáforo del pre-vuelo, que sí significa "no
 * podés grabar". Un rojo que no exige nada devalúa el rojo que sí.
 */
import { fireEvent, render, screen } from '@testing-library/react';
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
});
