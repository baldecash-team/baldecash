import { render, screen } from '@testing-library/react';
import { PreVuelo, estaListo } from '../PreVuelo';
import type { PresenceMember } from '../../_lib/usePresenceChannel';

const cam = (label: string): PresenceMember => ({ deviceId: `d-${label}`, kind: 'camara', label });

describe('estaListo', () => {
  it('con UNA cámara esperada, una cámara alcanza', () => {
    expect(estaListo(['techo'], [cam('techo')])).toBe(true);
  });

  it('con dos esperadas, una no alcanza', () => {
    expect(estaListo(['techo', 'pared'], [cam('techo')])).toBe(false);
    expect(estaListo(['techo', 'pared'], [cam('techo'), cam('pared')])).toBe(true);
  });

  it('no cuenta al escáner como cámara', () => {
    const escaner: PresenceMember = { deviceId: 'e1', kind: 'escaner', label: null };
    expect(estaListo(['techo'], [escaner])).toBe(false);
  });

  it('una cámara con etiqueta ajena no completa la estación', () => {
    expect(estaListo(['techo'], [cam('lateral')])).toBe(false);
  });

  it('sin etiquetas esperadas no está listo', () => {
    expect(estaListo([], [cam('techo')])).toBe(false);
  });
});

describe('<PreVuelo />', () => {
  it('dibuja un semáforo por etiqueta esperada, no dos fijos', () => {
    const { container } = render(<PreVuelo expectedLabels={['techo']} members={[]} />);
    expect(screen.getByText('techo')).toBeInTheDocument();
    expect(screen.queryByText('pared')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-semaforo]')).toHaveLength(1);
  });

  it('dibuja tres cuando la estación declara tres', () => {
    const { container } = render(
      <PreVuelo expectedLabels={['techo', 'pared', 'lateral']} members={[]} />
    );
    expect(container.querySelectorAll('[data-semaforo]')).toHaveLength(3);
  });
});
