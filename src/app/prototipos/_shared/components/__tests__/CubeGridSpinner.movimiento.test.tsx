/**
 * Verificación final (BAL-4969): la ruedita de carga respeta el movimiento
 * reducido (antes seguía animada con `reducedMotion: 'reduce'`).
 */
import React from 'react';
import { render } from '@testing-library/react';
import { CubeGridSpinner } from '../CubeGridSpinner';

describe('CubeGridSpinner · movimiento reducido', () => {
  it('apaga la animación de los tickets con prefers-reduced-motion', () => {
    const { container } = render(<CubeGridSpinner />);
    const css = container.querySelector('style')!.textContent!.replace(/\s+/g, ' ');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{ \.ticket-1, \.ticket-2, \.ticket-3 \{ animation: none; \}/);
  });
});
