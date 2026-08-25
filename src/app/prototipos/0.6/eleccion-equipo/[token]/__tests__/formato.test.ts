/// <reference types="jest" />
/**
 * Helpers de formato de `/eleccion-equipo/[token]`.
 *
 * El grueso de estos tests es la trampa de fechas: el backend manda
 * `link_expires_at` NAIVE en hora Lima, y dejarlo caer en un `new Date()` crudo
 * corre el vencimiento tantas horas como la zona del navegador.
 */
import {
  etiquetaCuentaRegresiva,
  etiquetaGrado,
  formatearCuota,
  nombreUnidad,
  resumenMedios,
  vencimientoEnMs,
} from '../formato';

describe('vencimientoEnMs', () => {
  it('interpreta un datetime sin zona como hora Lima, no como local del navegador', () => {
    // 15:30 en Lima (-05:00) son las 20:30 UTC. Si se hubiera parseado como
    // local o como UTC, este número cambiaría.
    expect(vencimientoEnMs('2026-08-26T15:30:00')).toBe(Date.parse('2026-08-26T20:30:00Z'));
  });

  it('respeta la zona cuando el string SÍ la declara', () => {
    expect(vencimientoEnMs('2026-08-26T20:30:00Z')).toBe(Date.parse('2026-08-26T20:30:00Z'));
    expect(vencimientoEnMs('2026-08-26T15:30:00-05:00')).toBe(Date.parse('2026-08-26T20:30:00Z'));
  });

  it('una fecha sin hora vence al final de ese día en Lima, no un día antes', () => {
    // `new Date("2026-08-26")` es UTC y en Lima cae el 25: el bug clásico.
    expect(vencimientoEnMs('2026-08-26')).toBe(Date.parse('2026-08-27T04:59:59Z'));
  });

  it('acepta el separador con espacio que a veces sale de MySQL', () => {
    expect(vencimientoEnMs('2026-08-26 15:30:00')).toBe(Date.parse('2026-08-26T20:30:00Z'));
  });

  it('devuelve null si no hay fecha o no se puede parsear', () => {
    expect(vencimientoEnMs(null)).toBeNull();
    expect(vencimientoEnMs('')).toBeNull();
    expect(vencimientoEnMs('cualquier cosa')).toBeNull();
  });
});

describe('etiquetaCuentaRegresiva', () => {
  it('con más de un día muestra días (los segundos serían ruido)', () => {
    expect(etiquetaCuentaRegresiva(2 * 86400_000 + 3_600_000)).toBe('2 días');
    expect(etiquetaCuentaRegresiva(86400_000 + 1000)).toBe('1 día');
  });

  it('dentro del último día muestra el reloj del diseño', () => {
    expect(etiquetaCuentaRegresiva(3 * 3600_000)).toBe('3:00:00');
    expect(etiquetaCuentaRegresiva(65_000)).toBe('0:01:05');
  });

  it('vencido', () => {
    expect(etiquetaCuentaRegresiva(0)).toBe('Vencido');
    expect(etiquetaCuentaRegresiva(-1)).toBe('Vencido');
  });
});

describe('nombreUnidad', () => {
  it('usa el correlativo con dos dígitos, nunca el serial', () => {
    expect(nombreUnidad(1)).toBe('Unidad 01');
    expect(nombreUnidad(12)).toBe('Unidad 12');
  });

  it('sin correlativo no inventa un número', () => {
    expect(nombreUnidad(null)).toBe('Unidad');
  });
});

describe('formatearCuota', () => {
  it('acepta número y string decimal', () => {
    expect(formatearCuota(55)).toBe('S/ 55/mes');
    expect(formatearCuota('249.00')).toBe('S/ 249/mes');
    expect(formatearCuota(99.5)).toBe('S/ 99.50/mes');
  });

  it('sin cuota devuelve vacío (la pantalla omite el chip)', () => {
    expect(formatearCuota(null)).toBe('');
    expect(formatearCuota('')).toBe('');
  });
});

describe('etiquetaGrado', () => {
  it('junta grado y etiqueta, y omite lo que falte', () => {
    expect(etiquetaGrado('A', 'Excelente estado')).toBe('Grado A · Excelente estado');
    expect(etiquetaGrado('A', null)).toBe('Grado A');
    expect(etiquetaGrado(null, null)).toBe('');
  });
});

describe('resumenMedios', () => {
  it('omite lo que la unidad no tenga', () => {
    expect(resumenMedios(4, true)).toBe('1 video · 4 fotos');
    expect(resumenMedios(1, false)).toBe('1 foto');
    expect(resumenMedios(0, true)).toBe('1 video');
    expect(resumenMedios(0, false)).toBe('');
  });
});
