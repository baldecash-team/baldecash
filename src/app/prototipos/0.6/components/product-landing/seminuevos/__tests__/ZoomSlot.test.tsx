import { render, screen, fireEvent } from '@testing-library/react';
import { ZoomSlot, ZOOM } from '../ZoomSlot';

const SRC = 'https://baldecash.s3.amazonaws.com/landings/seminuevos/inspector/carcasa-a.webp';

/** jsdom da 0x0 a todo: sin esto el origen del zoom sale NaN. */
function medirCaja(el: Element, box: Partial<DOMRect>) {
  jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100,
    x: 0, y: 0, toJSON: () => ({}), ...box,
  } as DOMRect);
}

describe('ZoomSlot', () => {
  it('sin src delega en el placeholder de MediaSlot', () => {
    render(<ZoomSlot src={null} alt="Carcasa" />);
    expect(screen.getByTestId('media-slot-placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('zoom-slot')).not.toBeInTheDocument();
  });

  it('arranca sin ampliar y con el aviso visible', () => {
    render(<ZoomSlot src={SRC} alt="Carcasa" onAmpliar={jest.fn()} />);
    const caja = screen.getByTestId('zoom-slot');
    expect(caja).toHaveAttribute('data-zoom', 'off');
    expect(screen.getByTestId('zoom-hint')).toBeInTheDocument();
    // Sin transform en absoluto. Comprobar `not.toHaveStyle('scale(2.2)')`
    // pasaria con CUALQUIER otro valor, incluido un zoom mal puesto.
    expect(screen.getByRole('img').style.transform).toBe('');
  });

  it('amplía al entrar el mouse y vuelve al salir', () => {
    render(<ZoomSlot src={SRC} alt="Carcasa" onAmpliar={jest.fn()} />);
    const caja = screen.getByTestId('zoom-slot');

    fireEvent.mouseEnter(caja);
    expect(caja).toHaveAttribute('data-zoom', 'on');
    expect(screen.getByRole('img')).toHaveStyle({ transform: `scale(${ZOOM})` });
    // El aviso estorba cuando ya estás mirando el detalle.
    expect(screen.queryByTestId('zoom-hint')).not.toBeInTheDocument();

    fireEvent.mouseLeave(caja);
    expect(caja).toHaveAttribute('data-zoom', 'off');
    expect(screen.getByTestId('zoom-hint')).toBeInTheDocument();
  });

  it('mueve el origen del zoom siguiendo al puntero', () => {
    render(<ZoomSlot src={SRC} alt="Carcasa" />);
    const caja = screen.getByTestId('zoom-slot');
    medirCaja(caja, { left: 0, top: 0, width: 200, height: 100 });

    fireEvent.mouseEnter(caja);
    fireEvent.mouseMove(caja, { clientX: 50, clientY: 25 });
    expect(caja).toHaveStyle({ '--zoom-x': '25%', '--zoom-y': '25%' });

    fireEvent.mouseMove(caja, { clientX: 150, clientY: 75 });
    expect(caja).toHaveStyle({ '--zoom-x': '75%', '--zoom-y': '75%' });
  });

  it('acota el origen a [0,100] cuando el puntero se sale de la caja', () => {
    // Pasa al arrastrar el dedo: el touchmove sigue llegando fuera del recuadro
    // y sin el clamp la imagen se corre más allá de sus bordes.
    render(<ZoomSlot src={SRC} alt="Carcasa" />);
    const caja = screen.getByTestId('zoom-slot');
    medirCaja(caja, { left: 0, top: 0, width: 200, height: 100 });

    fireEvent.mouseEnter(caja);
    fireEvent.mouseMove(caja, { clientX: -500, clientY: -500 });
    expect(caja).toHaveStyle({ '--zoom-x': '0%', '--zoom-y': '0%' });

    fireEvent.mouseMove(caja, { clientX: 9999, clientY: 9999 });
    expect(caja).toHaveStyle({ '--zoom-x': '100%', '--zoom-y': '100%' });
  });

  // El zoom a dedo apoyado se QUITÓ: competía con el scroll de la página
  // (arrastrar para bajar ampliaba la foto). En táctil el toque abre el visor.
  it('no amplía al tocar: el toque queda para abrir el visor', () => {
    const onAmpliar = jest.fn();
    render(<ZoomSlot src={SRC} alt="Carcasa" onAmpliar={onAmpliar} />);
    const caja = screen.getByTestId('zoom-slot');
    medirCaja(caja, { left: 0, top: 0, width: 200, height: 100 });

    fireEvent.touchStart(caja, { touches: [{ clientX: 100, clientY: 50 }] });
    expect(caja).toHaveAttribute('data-zoom', 'off');
  });

  describe('cuando puede ampliar', () => {
    it('avisa al hacer clic y es alcanzable con teclado', async () => {
      const onAmpliar = jest.fn();
      render(<ZoomSlot src={SRC} alt="Carcasa" onAmpliar={onAmpliar} />);
      const caja = screen.getByTestId('zoom-slot');

      expect(caja).toHaveAttribute('role', 'button');
      expect(caja).toHaveAttribute('tabindex', '0');
      expect(caja).toHaveAccessibleName('Ampliar: Carcasa');

      fireEvent.click(caja);
      expect(onAmpliar).toHaveBeenCalledTimes(1);

      // Enter y Espacio, que es lo que espera quien navega con teclado.
      fireEvent.keyDown(caja, { key: 'Enter' });
      fireEvent.keyDown(caja, { key: ' ' });
      expect(onAmpliar).toHaveBeenCalledTimes(3);
    });

    it('sin onAmpliar no se anuncia como botón ni muestra el aviso', () => {
      render(<ZoomSlot src={SRC} alt="Carcasa" />);
      const caja = screen.getByTestId('zoom-slot');
      expect(caja).not.toHaveAttribute('role', 'button');
      expect(caja).not.toHaveAttribute('tabindex');
      expect(screen.queryByTestId('zoom-hint')).not.toBeInTheDocument();
    });
  });
});
