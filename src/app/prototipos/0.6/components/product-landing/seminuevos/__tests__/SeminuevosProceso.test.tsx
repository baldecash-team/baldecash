import { render, screen } from '@testing-library/react';
import { SeminuevosProceso } from '../SeminuevosProceso';

describe('SeminuevosProceso', () => {
  it('muestra los 3 pasos con su copy', () => {
    render(<SeminuevosProceso catalogUrl="/seminuevos/catalogo" />);
    expect(screen.getByText('Explora el catálogo')).toBeInTheDocument();
    expect(screen.getByText('Encuentra el modelo que más te guste')).toBeInTheDocument();
    expect(screen.getByText('Selecciona el modelo ideal')).toBeInTheDocument();
    expect(screen.getByText('Elige el grado y cuota que más se te acomode')).toBeInTheDocument();
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
