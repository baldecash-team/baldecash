import { render, screen } from '@testing-library/react';
import { SeminuevosAbout } from '../SeminuevosAbout';

describe('SeminuevosAbout', () => {
  it('muestra el título y el párrafo', () => {
    render(<SeminuevosAbout />);
    expect(screen.getByRole('heading', { name: /Sobre nosotros/i })).toBeInTheDocument();
    expect(screen.getByText(/financiamiento a estudiantes universitarios/i)).toBeInTheDocument();
  });

  // La foto del equipo ya está en S3 (BAL-3317): se pinta la imagen, no el
  // placeholder. El placeholder sigue cubierto por MediaSlot.test.tsx.
  it('muestra la foto del equipo desde S3', () => {
    render(<SeminuevosAbout />);
    expect(screen.getByRole('img', { name: /Equipo de BaldeCash/i }))
      .toHaveAttribute('src', expect.stringContaining('about/equipo.webp'));
    expect(screen.queryByTestId('media-slot-placeholder')).not.toBeInTheDocument();
  });

  it('muestra el sello SBS', () => {
    render(<SeminuevosAbout />);
    expect(screen.getByText(/Superintendencia de Banca, Seguros y AFP/i)).toBeInTheDocument();
  });

  it('muestra las 4 redes, con target y rel seguros', () => {
    render(<SeminuevosAbout />);
    const links = screen.getAllByTestId('about-social');
    expect(links).toHaveLength(4);
    links.forEach((a) => {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
    expect(screen.getByText('@baldecash_2026')).toBeInTheDocument();
  });
});
