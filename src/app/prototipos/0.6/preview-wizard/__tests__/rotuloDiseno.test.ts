/**
 * BAL-4969 (casuísticas): el preview del wizard (Diseño 1) se rotula cuando
 * la landing está en Diseño 2.
 */
import { rotuloDeDisenoDelPreview } from '../rotuloDiseno';

describe('rotuloDeDisenoDelPreview', () => {
  it('Diseño 2: avisa que la vista es de Diseño 1', () => {
    expect(rotuloDeDisenoDelPreview(2)).toBe('Vista en Diseño 1 · esta landing usa Diseño 2');
  });
  it('Diseño 1 o sin dato: sin rótulo', () => {
    expect(rotuloDeDisenoDelPreview(1)).toBeNull();
    expect(rotuloDeDisenoDelPreview(null)).toBeNull();
  });
});
