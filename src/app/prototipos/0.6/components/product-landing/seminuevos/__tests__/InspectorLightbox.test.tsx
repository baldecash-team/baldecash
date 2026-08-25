import { render, screen, fireEvent } from '@testing-library/react';
import { InspectorLightbox } from '../InspectorLightbox';

const base = {
  abierto: true,
  pieza: 'Carcasa',
  grado: 'A' as const,
  onGrado: jest.fn(),
  onClose: jest.fn(),
};

function toque(el: Element, tipo: 'touchStart' | 'touchEnd', x: number, y: number) {
  const t = [{ clientX: x, clientY: y }];
  fireEvent[tipo](el, tipo === 'touchStart' ? { touches: t } : { changedTouches: t });
}

beforeEach(() => jest.clearAllMocks());

describe('InspectorLightbox', () => {
  it('cerrado no monta nada', () => {
    render(<InspectorLightbox {...base} abierto={false} />);
    expect(screen.queryByTestId('inspector-lightbox')).not.toBeInTheDocument();
  });

  it('abierto muestra la pieza y el grado, y se anuncia como diálogo', () => {
    render(<InspectorLightbox {...base} />);
    const panel = screen.getByTestId('inspector-lightbox');
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(panel).toHaveAttribute('aria-modal', 'true');
    expect(panel).toHaveAccessibleName('Carcasa de un equipo Grado A');
    expect(screen.getByRole('img')).toHaveAttribute(
      'src', expect.stringContaining('carcasa-a.webp')
    );
  });

  describe('cierre', () => {
    it('con Escape', () => {
      render(<InspectorLightbox {...base} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(base.onClose).toHaveBeenCalledTimes(1);
    });

    it('con el botón de cerrar', () => {
      render(<InspectorLightbox {...base} />);
      fireEvent.click(screen.getByTestId('lightbox-cerrar'));
      expect(base.onClose).toHaveBeenCalledTimes(1);
    });

    it('al hacer clic en el fondo, pero NO dentro del panel', () => {
      render(<InspectorLightbox {...base} />);
      const panel = screen.getByTestId('inspector-lightbox');

      fireEvent.click(panel);
      expect(base.onClose).not.toHaveBeenCalled();

      fireEvent.click(panel.parentElement!);
      expect(base.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('navegación entre grados', () => {
    it('con las flechas del teclado, en círculo', () => {
      const { rerender } = render(<InspectorLightbox {...base} grado="A" />);
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(base.onGrado).toHaveBeenLastCalledWith('B');

      // Desde la primera hacia atrás se va a la última.
      rerender(<InspectorLightbox {...base} grado="A" />);
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(base.onGrado).toHaveBeenLastCalledWith('C');

      // Y desde la última hacia adelante vuelve a la primera.
      rerender(<InspectorLightbox {...base} grado="C" />);
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(base.onGrado).toHaveBeenLastCalledWith('A');
    });

    it('con las pills, que marcan cuál está activa', () => {
      render(<InspectorLightbox {...base} grado="B" />);
      expect(screen.getByRole('button', { name: 'Grado B' }))
        .toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Grado A' }))
        .toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(screen.getByRole('button', { name: 'Grado C' }));
      expect(base.onGrado).toHaveBeenCalledWith('C');
    });
  });

  describe('móvil', () => {
    it('cambia de grado al deslizar en horizontal', () => {
      render(<InspectorLightbox {...base} grado="A" />);
      const panel = screen.getByTestId('inspector-lightbox');

      // Hacia la izquierda = siguiente.
      toque(panel, 'touchStart', 300, 100);
      toque(panel, 'touchEnd', 200, 105);
      expect(base.onGrado).toHaveBeenLastCalledWith('B');

      // Hacia la derecha = anterior.
      toque(panel, 'touchStart', 200, 100);
      toque(panel, 'touchEnd', 300, 95);
      expect(base.onGrado).toHaveBeenLastCalledWith('C');
    });

    it('ignora el gesto vertical, que es scroll y no cambio de grado', () => {
      render(<InspectorLightbox {...base} />);
      const panel = screen.getByTestId('inspector-lightbox');

      // Vertical con algo de diagonal: no debe contar.
      toque(panel, 'touchStart', 200, 100);
      toque(panel, 'touchEnd', 260, 400);
      expect(base.onGrado).not.toHaveBeenCalled();
    });

    it('ignora el desliz demasiado corto', () => {
      render(<InspectorLightbox {...base} />);
      const panel = screen.getByTestId('inspector-lightbox');

      toque(panel, 'touchStart', 200, 100);
      toque(panel, 'touchEnd', 170, 100);
      expect(base.onGrado).not.toHaveBeenCalled();
    });

    it('avisa del gesto, porque un swipe no se ve', () => {
      render(<InspectorLightbox {...base} />);
      expect(screen.getByText(/Desliza para comparar/i)).toBeInTheDocument();
    });
  });

  describe('accesibilidad', () => {
    it('bloquea el scroll del fondo mientras está abierto y lo devuelve al cerrar', () => {
      const { rerender } = render(<InspectorLightbox {...base} abierto={false} />);
      expect(document.body.style.overflow).toBe('');

      rerender(<InspectorLightbox {...base} abierto />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<InspectorLightbox {...base} abierto={false} />);
      expect(document.body.style.overflow).toBe('');
    });

    it('devuelve el foco a quien lo abrió', () => {
      const abridor = document.createElement('button');
      document.body.appendChild(abridor);
      abridor.focus();
      expect(document.activeElement).toBe(abridor);

      const { rerender } = render(<InspectorLightbox {...base} abierto />);
      expect(document.activeElement).toBe(screen.getByTestId('inspector-lightbox'));

      rerender(<InspectorLightbox {...base} abierto={false} />);
      expect(document.activeElement).toBe(abridor);
      abridor.remove();
    });

    it('atrapa el Tab dentro del panel', () => {
      render(<InspectorLightbox {...base} />);
      const botones = screen.getAllByRole('button');
      const primero = botones[0];
      const ultimo = botones[botones.length - 1];

      ultimo.focus();
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(document.activeElement).toBe(primero);

      primero.focus();
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(ultimo);
    });
  });
});
