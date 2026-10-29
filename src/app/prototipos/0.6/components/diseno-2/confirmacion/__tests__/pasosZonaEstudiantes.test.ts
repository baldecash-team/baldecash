/**
 * BAL-5274: pasos de Zona Estudiantes en la confirmación de Diseño 2.
 */
import { eligioInicial, pasosZonaEstudiantes, rotuloDelPaso, URL_ZONA_ESTUDIANTES } from '../pasosZonaEstudiantes';

describe('pasosZonaEstudiantes', () => {
  it('sin inicial: 4 pasos y el actual es «Evaluación»', () => {
    expect(pasosZonaEstudiantes(false)).toEqual([
      { nombre: 'Recibida', estado: 'hecho' },
      { nombre: 'Evaluación', estado: 'actual' },
      { nombre: 'Firma', estado: 'pendiente' },
      { nombre: 'Entrega', estado: 'pendiente' },
    ]);
    expect(rotuloDelPaso(false)).toBe('Paso 2 de 4:');
  });

  it('con inicial: «Cuota inicial» entre «Firma» y «Entrega» (5 pasos)', () => {
    expect(pasosZonaEstudiantes(true).map((p) => p.nombre)).toEqual([
      'Recibida', 'Evaluación', 'Firma', 'Cuota inicial', 'Entrega',
    ]);
    expect(rotuloDelPaso(true)).toBe('Paso 2 de 5:');
  });

  it('eligió inicial solo con un monto mayor a cero', () => {
    expect(eligioInicial(280)).toBe(true);
    expect(eligioInicial(0)).toBe(false);
    expect(eligioInicial(undefined)).toBe(false);
    expect(eligioInicial(null)).toBe(false);
  });

  it('Zona Estudiantes es zonaclientes.baldecash.com', () => {
    expect(URL_ZONA_ESTUDIANTES).toBe('https://zonaclientes.baldecash.com');
  });
});
