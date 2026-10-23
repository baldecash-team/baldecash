/**
 * El preview del wizard pinta Diseño 1. Si la landing está en Diseño 2, el
 * banner lo dice para que nadie lo tome por lo que verá el cliente (BAL-4969,
 * casuísticas).
 */
export function rotuloDeDisenoDelPreview(diseno: 1 | 2 | null): string | null {
  return diseno === 2 ? 'Vista en Diseño 1 · esta landing usa Diseño 2' : null;
}
