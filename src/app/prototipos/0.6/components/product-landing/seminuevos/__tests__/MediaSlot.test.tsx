import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { MediaSlot } from '../MediaSlot';

describe('MediaSlot', () => {
  it('muestra el placeholder cuando no hay src', () => {
    const { container } = render(<MediaSlot alt="Carcasa Grado A" />);
    expect(screen.getByTestId('media-slot-placeholder')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('video')).not.toBeInTheDocument();
  });

  it('renderiza una imagen cuando el src es .webp', () => {
    render(<MediaSlot src="https://s3/x/carcasa-a.webp" alt="Carcasa Grado A" />);
    const img = screen.getByRole('img', { hidden: false });
    expect(img).toHaveAttribute('src', 'https://s3/x/carcasa-a.webp');
    expect(img).toHaveAttribute('alt', 'Carcasa Grado A');
  });

  it('renderiza un video cuando el src es .mp4', () => {
    const { container } = render(<MediaSlot src="https://s3/x/carcasa-a.mp4" alt="Carcasa" />);
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveProperty('muted', true);
  });

  it('vuelve al placeholder si la imagen falla al cargar', () => {
    render(<MediaSlot src="https://s3/x/roto.webp" alt="Rota" />);
    act(() => {
      screen.getByRole('img', { hidden: false }).dispatchEvent(new Event('error'));
    });
    expect(screen.getByTestId('media-slot-placeholder')).toBeInTheDocument();
  });
});
