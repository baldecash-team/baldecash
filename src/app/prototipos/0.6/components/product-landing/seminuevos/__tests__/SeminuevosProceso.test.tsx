import { render, screen } from '@testing-library/react';
import { SeminuevosProceso } from '../SeminuevosProceso';
import { proceso } from '../data/seminuevosData';

describe('SeminuevosProceso', () => {
  it('renderiza un paso por cada entrada de la data, con su ícono', () => {
    const { container } = render(<SeminuevosProceso catalogUrl="/x" />);
    proceso.pasos.forEach((paso) => {
      expect(screen.getByText(paso.titulo)).toBeInTheDocument();
      expect(screen.getByText(paso.subtitulo)).toBeInTheDocument();
    });
    // Un ícono por paso, más el del banner de aprobación.
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(
      proceso.pasos.length + 1
    );
  });

  it('omite el ícono si el paso trae uno desconocido, sin tumbar la sección', () => {
    const original = [...proceso.pasos];
    // Forzamos un icon inexistente para probar la degradación.
    proceso.pasos = [{ icon: 'inexistente', titulo: 'Paso raro', subtitulo: 'Sin ícono' }];
    try {
      expect(() => render(<SeminuevosProceso catalogUrl="/x" />)).not.toThrow();
      expect(screen.getByText('Paso raro')).toBeInTheDocument();
    } finally {
      proceso.pasos = original;
    }
  });

  it('muestra los 3 pasos con su copy', () => {
    render(<SeminuevosProceso catalogUrl="/seminuevos/catalogo" />);
    expect(screen.getByText('Explora el catálogo')).toBeInTheDocument();
    expect(screen.getByText('Encuentra el modelo que más te guste')).toBeInTheDocument();
    expect(screen.getByText('Selecciona el modelo ideal')).toBeInTheDocument();
    expect(screen.getByText('Elige el grado y cuota que más te convenga')).toBeInTheDocument();
    expect(screen.getByText('Completa tus datos')).toBeInTheDocument();
    expect(screen.getByText('Llena un formulario de 2 minutos')).toBeInTheDocument();
  });

  it('muestra el banner de aprobación con el texto destacado', () => {
    render(<SeminuevosProceso catalogUrl="/x" />);
    expect(screen.getByText('videos de cada unidad disponible')).toBeInTheDocument();
  });

  it('el CTA apunta al catálogo', () => {
    render(<SeminuevosProceso catalogUrl="/seminuevos/catalogo" />);
    expect(screen.getByRole('link', { name: /Ver catálogo/i }))
      .toHaveAttribute('href', '/seminuevos/catalogo');
  });
});
