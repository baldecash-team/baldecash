import { render } from '@testing-library/react';
import { BaldecitoV2, AZUL_BALDECITO, TAPA_BALDECITO } from '../BaldecitoV2';

/**
 * Baldecito va siempre con los colores de la marca BaldeCash (BAL-4959): no
 * sigue el color de la landing ni el tema oscuro.
 */
describe('BaldecitoV2 — colores fijos de marca', () => {
  it('usa el Principal y el Blue 300 del brandbook, nunca el color de la landing', () => {
    document.documentElement.style.setProperty('--color-primary', '#76B900');
    document.documentElement.setAttribute('data-theme', 'nvidia');
    const { container } = render(<BaldecitoV2 ancho={64} animado={false} />);
    const html = container.innerHTML;
    expect(AZUL_BALDECITO).toBe('#4654CD');
    expect(TAPA_BALDECITO).toBe('#6873D7');
    expect(html).toContain('fill="#4654CD"');
    expect(html).toContain('stroke="#4654CD"');
    expect(html).toContain('fill="#6873D7"');
    expect(html).not.toMatch(/var\(--/);
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('--color-primary');
  });
});
