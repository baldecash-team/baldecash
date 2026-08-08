/**
 * Las filas que ve la persona antes de comprar.
 *
 * Lo que más importa acá es que el catálogo sin armadas no cambie: una armada
 * (o ninguna) tiene que producir exactamente las mismas filas que antes, porque
 * este componente lo usan todas las landings.
 */
import { construirFilas } from '../filasDelCronograma';

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe('sin armadas: el catálogo no cambia', () => {
  it('un plan mensual arranca en la cuota 1 y no trae armadas', () => {
    const filas = construirFilas({
      cuotas: 24, montoCuota: 150, frecuencia: 'mensual',
      inicio: new Date(2026, 7, 8),
    });

    expect(filas).toHaveLength(24);
    expect(filas.some(f => f.esArmada)).toBe(false);
    expect(filas[0].etiqueta).toBe('Cuota 1 de 24');
    expect(filas[0].indiceCuota).toBe(0);
  });

  it('una sola armada es un pago único: tampoco ocupa un período', () => {
    const filas = construirFilas({
      cuotas: 17, montoCuota: 25, frecuencia: 'semanal',
      inicio: new Date(2026, 7, 8), armadas: 1, montoInicial: 134,
    });

    expect(filas).toHaveLength(17);
    expect(filas.some(f => f.esArmada)).toBe(false);
  });
});

describe('con armadas', () => {
  const filas = construirFilas({
    cuotas: 13, montoCuota: 32.2, frecuencia: 'semanal',
    inicio: new Date(2026, 7, 8), armadas: 4, montoInicial: 134,
  });

  it('las armadas van primero y el total es el plazo total', () => {
    expect(filas).toHaveLength(17);
    expect(filas.filter(f => f.esArmada)).toHaveLength(4);
  });

  it('cada armada tiene su fecha, una por período', () => {
    expect(iso(filas[0].fecha)).toBe('2026-08-08');
    expect(iso(filas[1].fecha)).toBe('2026-08-15');
    expect(iso(filas[3].fecha)).toBe('2026-08-29');
  });

  it('la primera cuota cae después de la última armada', () => {
    expect(filas[4].etiqueta).toBe('Cuota 1 de 13');
    expect(iso(filas[4].fecha)).toBe('2026-09-05');
    expect(filas[4].indiceCuota).toBe(0);
  });

  it('la numeración es corrida sobre el calendario completo', () => {
    expect(filas.map(f => f.numero)).toEqual(
      Array.from({ length: 17 }, (_, i) => i + 1),
    );
  });

  it('reparte la inicial cuando no vienen los montos exactos', () => {
    expect(filas[0].monto).toBeCloseTo(33.5, 2);
    const armadas = filas.filter(f => f.esArmada);
    expect(armadas.reduce((s, f) => s + f.monto, 0)).toBeCloseTo(134, 2);
  });

  it('si el backend manda los montos exactos, esos mandan', () => {
    const conMontos = construirFilas({
      cuotas: 13, montoCuota: 32.2, frecuencia: 'semanal',
      inicio: new Date(2026, 7, 8), armadas: 4,
      montosArmadas: [34, 33, 33, 34], montoInicial: 134,
    });

    expect(conMontos.slice(0, 4).map(f => f.monto)).toEqual([34, 33, 33, 34]);
  });
});

describe('las otras frecuencias', () => {
  it('quincenal avanza de a 15 días', () => {
    const filas = construirFilas({
      cuotas: 2, montoCuota: 50, frecuencia: 'quincenal',
      inicio: new Date(2026, 7, 8), armadas: 2, montoInicial: 100,
    });

    expect(iso(filas[1].fecha)).toBe('2026-08-23');
    expect(iso(filas[2].fecha)).toBe('2026-09-07');
  });

  it('mensual avanza de a un mes', () => {
    const filas = construirFilas({
      cuotas: 2, montoCuota: 50, frecuencia: 'mensual',
      inicio: new Date(2026, 7, 8), armadas: 2, montoInicial: 100,
    });

    expect(iso(filas[1].fecha)).toBe('2026-09-08');
    expect(iso(filas[2].fecha)).toBe('2026-10-08');
  });
});
