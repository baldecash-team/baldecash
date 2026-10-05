import { render, screen } from '@testing-library/react';
import { PreVuelo, estaListo } from '../PreVuelo';
import type { PresenceCaptureState, PresenceMember } from '../../_lib/usePresenceChannel';

// Por defecto `armada`: la mayoría de estas pruebas ejercitan el cruce de
// etiquetas, no el estado de captura — que tiene su propio bloque de pruebas
// más abajo (review de F2: "conectada" ya no es sinónimo de "sirve").
const cam = (label: string, captureState: PresenceCaptureState | null = 'armada'): PresenceMember => ({
  deviceId: `d-${label}`,
  kind: 'camara',
  label,
  captureState,
});

describe('estaListo', () => {
  it('con UNA cámara esperada, una cámara alcanza', () => {
    expect(estaListo(['techo'], [cam('techo')])).toBe(true);
  });

  it('con dos esperadas, una no alcanza', () => {
    expect(estaListo(['techo', 'pared'], [cam('techo')])).toBe(false);
    expect(estaListo(['techo', 'pared'], [cam('techo'), cam('pared')])).toBe(true);
  });

  it('no cuenta al escáner como cámara', () => {
    const escaner: PresenceMember = { deviceId: 'e1', kind: 'escaner', label: null, captureState: null };
    expect(estaListo(['techo'], [escaner])).toBe(false);
  });

  it('una cámara con etiqueta ajena no completa la estación', () => {
    expect(estaListo(['techo'], [cam('lateral')])).toBe(false);
  });

  it('sin etiquetas esperadas no está listo', () => {
    expect(estaListo([], [cam('techo')])).toBe(false);
  });

  // Review de F2: antes de F3, "presente en el canal" equivalía a "sirve".
  // Ahora una cámara puede estar conectada y sin armar, o caída — el
  // semáforo NO debe ponerse en verde en esos casos.
  it('REGLA CRÍTICA: una cámara conectada pero SIN ARMAR (inactiva) no completa el pre-vuelo', () => {
    expect(estaListo(['techo'], [cam('techo', 'inactiva')])).toBe(false);
  });

  it('una cámara "armando" (a mitad de pedir permiso) tampoco cuenta', () => {
    expect(estaListo(['techo'], [cam('techo', 'armando')])).toBe(false);
  });

  it('una cámara "caida" no cuenta, aunque siga presente en el canal', () => {
    expect(estaListo(['techo'], [cam('techo', 'caida')])).toBe(false);
  });

  it('una cámara sin ningún reporte de estado todavía (captureState null) no cuenta', () => {
    expect(estaListo(['techo'], [cam('techo', null)])).toBe(false);
  });

  it('"grabando" sí cuenta como usable (no solo "armada")', () => {
    expect(estaListo(['techo'], [cam('techo', 'grabando')])).toBe(true);
  });

  it('con dos cámaras, una armada y la otra sin armar, no está listo', () => {
    expect(estaListo(['techo', 'pared'], [cam('techo', 'armada'), cam('pared', 'inactiva')])).toBe(false);
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

  it('una cámara "armada" se ve verde y "Conectada"', () => {
    render(<PreVuelo expectedLabels={['techo']} members={[cam('techo', 'armada')]} />);
    expect(screen.getByText('Conectada')).toBeInTheDocument();
  });

  it('una cámara "inactiva" (conectada, sin armar) NO se ve como "Conectada" a secas', () => {
    render(<PreVuelo expectedLabels={['techo']} members={[cam('techo', 'inactiva')]} />);
    expect(screen.queryByText('Conectada')).not.toBeInTheDocument();
    expect(screen.getByText(/sin armar/i)).toBeInTheDocument();
  });

  it('una cámara "caida" muestra el estado explícito, no un genérico "Sin conexión"', () => {
    render(<PreVuelo expectedLabels={['techo']} members={[cam('techo', 'caida')]} />);
    expect(screen.getByText(/cámara caída/i)).toBeInTheDocument();
  });

  it('sin ningún miembro para la etiqueta, dice "Sin conexión"', () => {
    render(<PreVuelo expectedLabels={['techo']} members={[]} />);
    expect(screen.getByText('Sin conexión')).toBeInTheDocument();
  });
});
