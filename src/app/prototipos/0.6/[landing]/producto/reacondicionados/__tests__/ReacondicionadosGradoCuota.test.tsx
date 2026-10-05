import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReacondicionadosGradoCuota } from '../ReacondicionadosGradoCuota';
import type { GradeSibling } from '../../types/detail';

jest.mock('lucide-react', () =>
  new Proxy({}, { get: () => (props: Record<string, unknown>) => <svg {...props} /> }),
);

// Datos reales de producción (Advance Notebook CN4058, 25/08/2026): el Grado A
// existe a S/574 pero está agotado.
const GRADOS: GradeSibling[] = [
  { grade: 'A', productId: 1, slug: 'adv-a', price: 574, stockAvailable: 0, isAvailable: false, minTermQuota: 124 },
  { grade: 'B', productId: 2, slug: 'adv-b', price: 402, stockAvailable: 5, isAvailable: true, minTermQuota: 90 },
  { grade: 'C', productId: 3, slug: 'adv-c', price: 287, stockAvailable: 4, isAvailable: true, minTermQuota: 68 },
];

function renderCard(overrides: Partial<React.ComponentProps<typeof ReacondicionadosGradoCuota>> = {}) {
  const props = {
    gradeSiblings: GRADOS,
    selectedGrade: 'B',
    onSelectGrade: jest.fn(),
    ...overrides,
  };
  return { ...render(<ReacondicionadosGradoCuota {...props} />), props };
}

describe('ReacondicionadosGradoCuota', () => {
  describe('grados', () => {
    it('muestra una tarjeta por grado, con su nombre', () => {
      renderCard();
      expect(screen.getByRole('radio', { name: /Grado A/ })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Grado B/ })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Grado C/ })).toBeInTheDocument();
      expect(screen.getByText('Excelente estado')).toBeInTheDocument();
      expect(screen.getByText('Buen estado')).toBeInTheDocument();
      expect(screen.getByText('Funcional y ahorrador')).toBeInTheDocument();
    });

    // El agotado NO se esconde: que exista dice hasta dónde llega la gama.
    it('el grado agotado se muestra deshabilitado y con "No disponible"', () => {
      renderCard();
      const a = screen.getByRole('radio', { name: /Grado A/ });
      expect(a).toBeDisabled();
      expect(a).toHaveTextContent('No disponible');
      expect(screen.getByRole('radio', { name: /Grado B/ })).toBeEnabled();
    });

    it('el grado agotado no muestra cuota', () => {
      renderCard();
      // 124 es la cuota del Grado A: no debe aparecer, está agotado.
      expect(screen.getByRole('radio', { name: /Grado A/ })).not.toHaveTextContent('124');
    });

    it('los grados disponibles muestran su cuota mínima', () => {
      renderCard();
      expect(screen.getByRole('radio', { name: /Grado B/ })).toHaveTextContent('S/90');
      expect(screen.getByRole('radio', { name: /Grado C/ })).toHaveTextContent('S/68');
    });

    it('marca el grado elegido y no el resto', () => {
      renderCard();
      expect(screen.getByRole('radio', { name: /Grado B/ })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: /Grado C/ })).toHaveAttribute('aria-checked', 'false');
    });

    it('al elegir otro grado avisa al padre', () => {
      const { props } = renderCard();
      fireEvent.click(screen.getByRole('radio', { name: /Grado C/ }));
      expect(props.onSelectGrade).toHaveBeenCalledWith('C');
    });

    // Cada grado es un producto distinto: reelegir el actual navegaría a la
    // misma página.
    it('no avisa al padre si se pulsa el grado ya elegido', () => {
      const { props } = renderCard();
      fireEvent.click(screen.getByRole('radio', { name: /Grado B/ }));
      expect(props.onSelectGrade).not.toHaveBeenCalled();
    });

    it('ordena los grados A→D aunque lleguen desordenados', () => {
      renderCard({ gradeSiblings: [GRADOS[2], GRADOS[0], GRADOS[1]] });
      const letras = screen.getAllByRole('radio')
        .map((b) => b.textContent?.match(/Grado ([A-D])/)?.[1])
        .filter(Boolean);
      expect(letras.slice(0, 3)).toEqual(['A', 'B', 'C']);
    });

    // En producción hay equipos con Grado D, para el que no existe copy.
    it('pinta un grado sin copy (D) sin reventar', () => {
      const conD: GradeSibling[] = [
        ...GRADOS,
        { grade: 'D', productId: 4, slug: 'adv-d', price: 200, stockAvailable: 2, isAvailable: true, minTermQuota: 50 },
      ];
      renderCard({ gradeSiblings: conD });
      const d = screen.getByRole('radio', { name: /Grado D/ });
      expect(d).toBeInTheDocument();
      expect(d).toHaveTextContent('S/50');
    });
  });

  describe('textos de cierre', () => {
    it('incluye la garantía de los grados', () => {
      renderCard();
      expect(screen.getByText(/100% funcionales y revisados/)).toBeInTheDocument();
    });

    // La nota "Cuota referencial según evaluación…" vive en PricingCalculator,
    // que pinta las cuotas más abajo. Repetirla acá diría lo mismo dos veces en
    // la misma pantalla.
    it('no repite la nota de cuota referencial', () => {
      renderCard();
      expect(screen.queryByText(/Cuota referencial/)).toBeNull();
    });
  });

  // El componente eligió NO reimplementar la calculadora de cuota: eso lo hace
  // PricingCalculator, que además alimenta el carrito. Si alguien la trae de
  // vuelta aquí, estos tests avisan.
  describe('no reimplementa el selector de cuota', () => {
    it('no pinta plazos ni iniciales', () => {
      renderCard();
      expect(screen.queryByText('Selecciona tu cuota')).toBeNull();
      expect(screen.queryByText('Cuota inicial (opcional)')).toBeNull();
      expect(screen.queryByText('Sin inicial')).toBeNull();
      expect(screen.queryByText(/meses/)).toBeNull();
    });

    it('solo expone los grados como radios', () => {
      renderCard();
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(GRADOS.length);
      radios.forEach((r) => expect(r.textContent).toMatch(/Grado [A-D]/));
    });
  });

  describe('sin grados', () => {
    // Un equipo nuevo, o un reacondicionado sin familia: no hay nada que
    // comparar, así que la sección no se dibuja en vez de salir vacía.
    it('no dibuja nada', () => {
      const { container } = renderCard({ gradeSiblings: [] });
      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByTestId('reacond-grado-cuota')).toBeNull();
    });
  });

  describe('el boton "Ver detalle" quedo fuera', () => {
    // El prototipo de Haru lo traía dentro del grado activo; negocio lo
    // descartó. Este test evita que vuelva por copiar el prototipo sin leer.
    it('la tarjeta de grado no trae ningun "Ver detalle"', () => {
      renderCard();
      expect(screen.queryByText(/Ver detalle/i)).toBeNull();
    });
  });
});
