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

const INICIALES = [
  { percent: 0, amount: 0 },
  { percent: 10, amount: 50 },
  { percent: 20, amount: 90 },
];

const PLAZOS = [
  { termMonths: 6, monthlyQuota: 90 },
  { termMonths: 12, monthlyQuota: 56 },
  { termMonths: 18, monthlyQuota: 45 },
  { termMonths: 24, monthlyQuota: 40 },
];

function renderCard(overrides: Partial<React.ComponentProps<typeof ReacondicionadosGradoCuota>> = {}) {
  const props = {
    gradeSiblings: GRADOS,
    selectedGrade: 'B',
    onSelectGrade: jest.fn(),
    initialOptions: INICIALES,
    selectedInitialPercent: 0,
    onSelectInitial: jest.fn(),
    termOptions: PLAZOS,
    selectedTermMonths: 24,
    onSelectTerm: jest.fn(),
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

  describe('cuota', () => {
    it('muestra las iniciales, con "Sin inicial" para el cero', () => {
      renderCard();
      expect(screen.getByRole('radio', { name: 'Sin inicial' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'S/50' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'S/90' })).toBeInTheDocument();
    });

    it('muestra un plazo por opción con su cuota', () => {
      renderCard();
      const plazos = screen.getAllByRole('radio').filter((b) => /meses/.test(b.textContent || ''));
      expect(plazos).toHaveLength(4);
      expect(plazos[3]).toHaveTextContent('24');
      expect(plazos[3]).toHaveTextContent('S/40');
    });

    it('avisa al padre al cambiar de inicial y de plazo', () => {
      const { props } = renderCard();
      fireEvent.click(screen.getByRole('radio', { name: 'S/50' }));
      expect(props.onSelectInitial).toHaveBeenCalledWith(10);

      const docePlazo = screen.getAllByRole('radio').find((b) => /^12/.test(b.textContent || ''));
      fireEvent.click(docePlazo!);
      expect(props.onSelectTerm).toHaveBeenCalledWith(12);
    });

    it('el resumen nombra el grado elegido y su plazo', () => {
      renderCard();
      const resumen = screen.getByTestId('reacond-resumen');
      expect(resumen).toHaveTextContent('Tu cuota mensual · Grado B');
      expect(resumen).toHaveTextContent('S/40/mes');
      expect(resumen).toHaveTextContent('durante 24 meses');
    });

    it('usa el sufijo de la frecuencia que traen los datos', () => {
      renderCard({ paymentFrequency: 'quincenal' });
      expect(screen.getByTestId('reacond-resumen')).toHaveTextContent('S/40/qcn');
    });
  });

  describe('textos de cierre', () => {
    it('incluye la nota legal y la garantía de los grados', () => {
      renderCard();
      expect(screen.getByText(/Cuota referencial según evaluación/)).toBeInTheDocument();
      expect(screen.getByText(/100% funcionales y revisados/)).toBeInTheDocument();
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
