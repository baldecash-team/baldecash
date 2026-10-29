/**
 * F8 (BAL-4967) y BAL-5274: con y sin nombre, y los modos heredados de
 * Diseño 1 (firmada / completado / aprobado) que apagan la barra de pasos.
 */
import { textoCabeceraV2, nombreOVacio } from '../textoCabeceraV2';

describe('nombreOVacio', () => {
  it('devuelve el nombre si hay uno real', () => {
    expect(nombreOVacio('Brenda')).toBe('Brenda');
  });
  it('devuelve null para el centinela "Usuario" de buildReceivedData', () => {
    expect(nombreOVacio('Usuario')).toBeNull();
  });
  it('devuelve null para vacío', () => {
    expect(nombreOVacio('')).toBeNull();
    expect(nombreOVacio(undefined)).toBeNull();
  });
});

describe('textoCabeceraV2 — caso por defecto', () => {
  it('con nombre: saluda y pide la barra de pasos', () => {
    const r = textoCabeceraV2({ userName: 'Brenda' });
    expect(r.titulo).toBe('¡Recibimos tu solicitud, Brenda!');
    expect(r.mostrarPasos).toBe(true);
  });

  it('sin nombre: título sin coma ni nombre', () => {
    const r = textoCabeceraV2({ userName: 'Usuario' });
    expect(r.titulo).toBe('¡Recibimos tu solicitud!');
  });

  it('sin subtítulo (BAL-5274): debajo va la barra de pasos, sin horas', () => {
    const r = textoCabeceraV2({ userName: 'Brenda' });
    expect(r.subtitulo).toBeNull();
  });
});

describe('textoCabeceraV2 — modos heredados de Diseño 1 (apagan la barra de pasos)', () => {
  it('firmada: mismo texto que ReceivedMessage, sin barra de pasos', () => {
    const r = textoCabeceraV2({
      userName: 'Brenda',
      cierre: { firmada: true, pendiente: { pago_inicial: false, formulario: false } },
    });
    expect(r.titulo).toBe('¡Solicitud firmada, Brenda!');
    expect(r.subtitulo).toContain('Te enviamos por WhatsApp y correo tu copia');
    expect(r.mostrarPasos).toBe(false);
  });

  it('firmada con inicial pendiente: lo dice', () => {
    const r = textoCabeceraV2({
      userName: 'Brenda',
      cierre: { firmada: true, pendiente: { pago_inicial: true, formulario: false } },
    });
    expect(r.subtitulo).toContain('pagues tu cuota inicial');
  });

  it('modoCierreKyc completado: sin barra de pasos', () => {
    const r = textoCabeceraV2({ userName: 'Brenda', modoCierreKyc: 'completado' });
    expect(r.titulo).toContain('finalizar todo el proceso');
    expect(r.mostrarPasos).toBe(false);
  });

  it('modoCierreKyc aprobado: sin barra de pasos', () => {
    const r = textoCabeceraV2({ userName: 'Brenda', modoCierreKyc: 'aprobado' });
    expect(r.titulo).toBe('¡Solicitud aprobada, Brenda!');
    expect(r.mostrarPasos).toBe(false);
  });

  it('CADE: saluda distinto pero conserva la barra de pasos (sigue en evaluación)', () => {
    const r = textoCabeceraV2({ userName: 'Brenda', overlayVariant: 'cade' });
    expect(r.titulo).toContain('CADE');
    expect(r.mostrarPasos).toBe(true);
  });

  it('firmada gana sobre modoCierreKyc (es un hecho, no una deducción)', () => {
    const r = textoCabeceraV2({
      userName: 'Brenda',
      modoCierreKyc: 'aprobado',
      cierre: { firmada: true, pendiente: { pago_inicial: false, formulario: false } },
    });
    expect(r.titulo).toBe('¡Solicitud firmada, Brenda!');
  });
});
